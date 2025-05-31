import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question; 