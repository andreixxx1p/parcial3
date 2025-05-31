import express from 'express';
import { generateChatResponse, getConversationHistory, getQuestionHistory } from '../controllers/chatController.js';

const router = express.Router();

// Middleware para validar el cuerpo de la petición
const validateChatRequest = (req, res, next) => {
  console.log('📝 Body recibido:', req.body);
  const { prompt, user } = req.body;
  
  const errors = [];
  
  if (!prompt) {
    errors.push('El prompt es requerido');
  }
  
  if (!user) {
    errors.push('El usuario es requerido');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Campos requeridos faltantes',
      message: 'La petición no cumple con los requisitos',
      details: errors,
      receivedBody: req.body,
      expectedFormat: {
        prompt: 'string (requerido)',
        user: 'string (requerido)'
      }
    });
  }

  next();
};

// Ruta para generar respuestas de ChatGPT
router.get('/', validateChatRequest, generateChatResponse);
router.post('/', validateChatRequest, generateChatResponse);

// Ruta para obtener el historial de conversaciones de un usuario específico
router.get('/history/:userId', getConversationHistory);

// Ruta para obtener el historial de preguntas
router.get('/history', getQuestionHistory);

// Middleware para manejar rutas no encontradas en este router
router.use((req, res) => {
  console.log('⚠️ Ruta no encontrada en chatRoutes:', req.method, req.originalUrl);
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: 'La ruta solicitada no existe en el módulo de chat',
    availableRoutes: {
      chat: {
        method: 'POST/GET',
        path: '/api/chat',
        body: {
          prompt: 'string (requerido)',
          user: 'string (requerido)'
        }
      },
      history: {
        method: 'GET',
        path: '/api/chat/history'
      },
      userHistory: {
        method: 'GET',
        path: '/api/chat/history/:userId'
      }
    }
  });
});

export default router;
