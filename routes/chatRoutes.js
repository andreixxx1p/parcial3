import express from 'express';
import { generateChatResponse, getConversationHistory } from '../controllers/chatController.js';

const router = express.Router();

// Ruta para generar respuestas de ChatGPT
router.post('/', generateChatResponse);

// Ruta para obtener el historial de conversaciones de un usuario específico
router.get('/history/:userId', getConversationHistory);

export { router };
