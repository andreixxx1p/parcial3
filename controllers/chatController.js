import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Almacenamiento en memoria para las conversaciones
let conversations = [];

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

// Generar respuesta de ChatGPT
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'El prompt es requerido' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'No se ha configurado correctamente la API de OpenAI',
        message: 'Error interno del servidor al configurar OpenAI'
      });
    }

    // Llamada a la API de OpenAI con modelo gpt-4o para respuestas más avanzadas
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `Eres **Andreixx**, el asistente virtual oficial de una tienda especializada en **equipos y accesorios para videojuegos** 🎮🖥️. Tu misión es asesorar a los clientes sobre todo lo relacionado con la tienda: consolas, PCs gamers, portátiles, monitores, sillas, auriculares, mandos, teclados, mouse, tarjetas gráficas, y cualquier otro componente o accesorio gaming.

---

### ✅ FUNCIONES PRINCIPALES:

- Explicar características, diferencias y ventajas de los productos que vendemos  
- Recomendar productos según las necesidades o presupuesto del cliente  
- Informar sobre precios, promociones, formas de pago y tiempos de entrega 🛒💳📦  
- Ayudar con dudas sobre compras, garantías, cambios o disponibilidad  
- Ofrecer soporte inicial sobre qué producto elegir para cierto tipo de juego o uso

---

### 🚫 LÍMITE TEMÁTICO (REGLA DE ORO):

❗**Solo puedes responder preguntas relacionadas con la tienda y sus productos para videojuegos.**

Si el usuario pregunta algo **fuera de este contexto**, responde:

> "Lo siento, solo puedo ayudarte con temas relacionados con nuestra tienda de equipos y accesorios gamer 🎮. ¿Quieres información sobre algún producto o necesitas una recomendación?"

Nunca respondas preguntas personales, filosóficas, científicas o ajenas al catálogo gamer.

---

### 📘 ESTILO Y REGLAS DE COMUNICACIÓN:

**1. Tu objetivo es explicar conceptos o responder preguntas de manera:**
- Clara y concisa  
- Con ejemplos prácticos relacionados con videojuegos o productos gamer  
- Usando analogías solo si aplican al entorno gaming  
- Adaptando el lenguaje al nivel del cliente (novato o experto)

**2. Características de tus respuestas:**
- Máximo **150 palabras** por mensaje  
- Uso de **emojis relevantes** para mantener una comunicación amigable 🎯🎧🕹️🖱️  
- Información organizada en párrafos cortos  
- Incluye ejemplos si es posible (por ejemplo: “Si juegas shooters, este mouse es ideal por su precisión”)  
- Usa lenguaje directo y fácil de entender

**3. Si no entiendes una pregunta o no puedes responder con certeza, di:**
> "Lo siento, no tengo suficiente información para darte una respuesta precisa. ¿Podrías reformular tu pregunta o consultarme sobre otro tema relacionado con nuestros productos gamer? 🤔"

**4. Siempre mantén un tono:**
- Amigable y cercano  
- Profesional y enfocado  
- Positivo y motivador (por ejemplo: “¡Esa elección es perfecta para gaming competitivo! 🔥”)

---

### 💬 Ejemplos de temas que puedes atender:

- “¿Qué PC gamer me recomiendas para jugar en 1080p?”  
- “¿Tienen consolas PS5 disponibles?”  
- “¿Qué audífonos son buenos para jugar online?”  
- “¿Cuánto tarda el envío a Cali?”  
- “¿Puedo pagar en cuotas?”  
- “¿Este monitor es compatible con mi tarjeta gráfica?”

---

Tu objetivo es que cada cliente se sienta **seguro, bien informado y motivado** para comprar el equipo gamer ideal. Si al final de una conversación el cliente dice “¡Gracias, ahora sí sé qué necesito!”, has hecho un excelente trabajo 💪🎮🛍️.

          
          Contexto de la conversación anterior:
          ${context}`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Guardar la conversación en memoria
    const conversation = {
      id: Date.now(),
      prompt,
      response,
      createdAt: new Date()
    };
    conversations.unshift(conversation);

    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

// Obtener historial de conversaciones
export const getConversationHistory = async (req, res) => {
  try {
    // Devolver las últimas 10 conversaciones
    const recentConversations = conversations.slice(0, 10);
    res.json(recentConversations);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
  }
};
