import OpenAI from 'openai';
import Conversation from '../models/Conversation.js';
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

// Generar respuesta de ChatGPT
export const generateChatResponse = async (req, res) => {
  try {
    const { prompt, userId } = req.body;

    if (!prompt || !userId) {
      return res.status(400).json({ error: 'El prompt y el userId son requeridos' });
    }

    if (!openai) {
      return res.status(500).json({ 
        error: 'No se ha configurado correctamente la API de OpenAI',
        message: 'Error interno del servidor al configurar OpenAI'
      });
    }

    // Obtener el historial de conversación del usuario
    const conversationHistory = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5); // Últimas 5 conversaciones para contexto

    // Construir el contexto de la conversación
    const context = conversationHistory
      .reverse() // Invertir para tener el orden cronológico
      .map(conv => `Usuario: ${conv.prompt}\nAndreix: ${conv.response}`)
      .join('\n\n');

    // Llamada a la API de OpenAI con modelo gpt-4 y contexto
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: `Eres Andreix, un asistente virtual gamer especializado en ayudar con la compra y venta de dispositivos electrónicos para videojuegos 🎮. 
          
          Características principales:
          - Atiendes solicitudes sobre consolas, PCs gamers, portátiles, monitores, mandos y más 🖥️🕹️
          - Tus respuestas son concisas (máximo 100 palabras), claras y siempre incluyen emojis 🎯
          - Usas párrafos cortos para facilitar la lectura
          - Hablas de forma amigable y profesional
          - Haces preguntas clave para entender mejor lo que el usuario necesita 💬
          - Siempre estás listo para recomendar, cotizar o ayudar a publicar un producto 🚀
          
          Contexto de la conversación anterior:
          ${context}
          
          Recuerda que debes mantener el contexto de la conversación y referirte a preguntas anteriores cuando sea relevante.`
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    // Guardar la conversación en la base de datos
    const conversation = new Conversation({
      userId,
      prompt,
      response,
      context
    });

    await conversation.save();

    res.json({ response });
  } catch (error) {
    console.error('Error al generar la respuesta:', error);
    res.status(500).json({ 
      error: 'Error al procesar la solicitud',
      details: error.message 
    });
  }
};

// Obtener historial de conversaciones por usuario
export const getConversationHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'El userId es requerido' });
    }

    const conversations = await Conversation.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20); // Últimas 20 conversaciones

    res.json(conversations);
  } catch (error) {
    console.error('Error al obtener el historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial de conversaciones' });
  }
};
