import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String
  },

  category: {
    type: String,
    enum: ['image', 'writing', 'code', 'business'],
    required: true
  },

  // =========================
  // CORE PROMPT (THE RECIPE)
  // =========================
  promptContent: {
    type: String,
    required: true
  },

  // =========================
  // QUESTIONS SHOWN TO USER
  // =========================
  questions: {
    type: [String],
    default: [
      "What is the main subject?",
      "Any specific tone or style?"
    ]
  },

  // =========================
  // 🔐 PROTECTED STYLE TOKENS
  // =========================
  protectedTokens: {
    type: [String],
    default: [] // backward compatible
  },

  // =========================
  // 🔄 WHAT USER CAN CHANGE
  // =========================
  editableFields: {
    type: [String],
    default: ["subject", "context"]
  },

  // =========================
  // VISUAL / META
  // =========================
  previewImage: {
    type: String,
    default: ""
  },

  modelConfig: {
    type: String,
    default: "midjourney"
  },

  tags: {
    type: [String],
    index: true
  },

  // =========================
  // SOCIAL / ANALYTICS
  // =========================
  authorId: {
    type: String,
    default: "system"
  },

  usageCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

templateSchema.index({ title: 'text', tags: 'text' });

export default mongoose.model('Template', templateSchema);
