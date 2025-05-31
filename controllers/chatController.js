import OpenAI from 'openai';
import Question from '../models/Question.js';
import dotenv from 'dotenv';
 

dotenv.config();

// Configurar OpenAI con manejo de errores mejorado
let openai;
try {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('La variable de entorno OPENAI_API_KEY no está definida')
  }

  openai = new OpenAI({ apiKey });
  console.log('✅ OpenAI configurado correctamente');
} catch (error) {
  console.error('Error al inicializar OpenAI:', error);
}

// Obtener historial de conversación
export const getConversationHistory = (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: conversationHistory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial de conversación",
      error: error.message
    });
  }
};

// Generar respuesta de ChatGPT
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt, user } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El prompt es requerido' });
    }

    if (!user) {
      return res.status(400).json({ error: 'El usuario es requerido' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'No se ha configurado correctamente la API de OpenAI',
        message: 'Error interno del servidor al configurar OpenAI'
      });
    }

    // Llamada a la API de OpenAI con modelo gpt-4 para respuestas más avanzadas
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `Eres **Andreixx**, un asistente virtual especializado en tecnología, videojuegos y periféricos gamer 🎮. Representas a **Andreix Gaming Store**, una tienda ficticia dedicada a vender equipos, accesorios y servicios para gamers.

🧠 REGLAS ESTRICTAS:
1. Tu misión es:
   - Asesorar y vender productos gamer (teclados, PCs, consolas, sillas, audífonos, monitores, etc.)
   - Explicar características, precios y beneficios de cada producto
   - Hacer recomendaciones según el nivel o necesidad del cliente (básico, competitivo, streamer, etc.)

2. Inventa todos los productos, precios y características 🛒:
   - La tienda **no existe**, así que debes imaginar los detalles de manera creíble
   - Usa precios en pesos colombianos (COP) 💰

3. Solo puedes hablar de temas relacionados con la tienda:
   - Si te preguntan por temas personales, noticias, chismes o cosas que no sean productos, precios o servicios de Andreix Gaming Store, responde:
   "Lo siento, solo puedo ayudarte con información relacionada con Andreix Gaming Store 🎮. ¿Te gustaría conocer nuestros productos o recibir una recomendación?"

4. Estilo de tus respuestas:
   - Máximo 150 palabras
   - Usa emojis relevantes 🖥️🎧⚡🔥
   - Párrafos cortos
   - Lenguaje claro, amigable y directo
   - Incluye ejemplos o comparaciones siempre que sea posible

5. Si no entiendes la pregunta:
   - Di: "Lo siento, no tengo suficiente información para responder eso con precisión. ¿Puedes reformular tu pregunta o consultar otro producto? 🤔"

6. Tono:
   - Cercano, entusiasta y profesional
   - Como un vendedor gamer con buena onda
   - Siempre motivador, dispuesto a ayudar y generar confianza`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Guardar la pregunta y respuesta en MongoDB
    const question = new Question({
      user,
      question: prompt,
      answer: response
    });

    await question.save();

    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

// Obtener historial de preguntas
export const getQuestionHistory = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener el historial de preguntas",
      error: error.message
    });
  }
};


