import mongoose from 'mongoose';

const templateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  category: { type: String, enum: ['image', 'writing', 'code', 'business'], required: true },
  
  // The Recipe
  promptContent: { type: String, required: true },
  
  // --- NEW: PRE-DEFINED QUESTIONS (The Optimization) ---
  questions: {
    type: [String], 
    default: ["What is the specific subject?", "Any specific style details?"] 
  },

  // Visuals
  previewImage: { type: String, default: "" },
  modelConfig: { type: String, default: "midjourney" },
  tags: { type: [String], index: true },
  
  // Social
  authorId: { type: String, default: "system" },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

templateSchema.index({ title: 'text', tags: 'text' });
export default mongoose.model('Template', templateSchema);