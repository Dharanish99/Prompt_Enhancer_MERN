import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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

  promptVersion: {
    type: String,
    default: "v1"
  },

  requestId: {
    type: String
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
    answers: [String]
  },

  tokenUsage: {
    input: { type: Number, default: 0 },
    output: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },

  isFavorite: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

export default mongoose.model('History', historySchema);
