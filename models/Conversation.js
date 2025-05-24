import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Para búsquedas más rápidas por usuario
  },
  prompt: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  context: {
    type: String,
    default: '' // Para mantener el contexto de la conversación
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para búsquedas eficientes por usuario y fecha
conversationSchema.index({ userId: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
