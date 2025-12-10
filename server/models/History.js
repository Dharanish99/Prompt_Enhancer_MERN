import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // Indexed for fast history retrieval
  },
  category: {
    type: String,
    enum: ['image', 'text', 'template'],
    default: 'image'
  },
  modelUsed: {
    type: String,
    required: true
  },
  originalPrompt: {
    type: String,
    required: true
  },
  enhancedPrompt: {
    type: String,
    required: true
  },
  refinementData: {
    questions: [String],
    answers: [String] // Stores the user's answers for future analysis
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const History = mongoose.model('History', historySchema);
export default History;