import History from '../models/History.js';
// 1. ADDED MISSING IMPORT: synthesizeFinalPrompt
import { analyzePromptAmbiguity, synthesizeFinalPrompt } from '../services/aiService.js'; 

// @desc    Analyze prompt for ambiguity
// @route   POST /api/analyze-prompt
export const analyzePrompt = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const analysis = await analyzePromptAmbiguity(prompt);
    res.status(200).json({ questions: analysis.questions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Analysis failed" });
  }
};

// @desc    Finalize prompt and Save to History
// @route   POST /api/finalize-prompt
export const finalizePrompt = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // 2. KEEPING THIS 'original' TO MATCH FRONTEND FIX BELOW
  const { original, answers, model } = req.body;
  const userId = req.user._id; 

  try {
    const enhanced = await synthesizeFinalPrompt(original, answers, model);

    // 3. SENDING BACK 'enhanced' KEY
    res.status(200).json({ enhanced });

    // Fire-and-Forget Save
    const storedAnswers = Array.isArray(answers) ? answers : Object.values(answers || {});

    History.create({
      userId,
      modelUsed: model,
      originalPrompt: original,
      enhancedPrompt: enhanced,
      refinementData: { answers: storedAnswers },
    }).catch(err => console.error("❌ History Save Failed:", err.message));

  } catch (error) {
    console.error("Finalization Error:", error);
    if (!res.headersSent) res.status(500).json({ error: "Finalization failed" });
  }
};

// @desc    Instant Enhance (No Questions) and Save
// @route   POST /api/image-enhance
export const instantEnhance = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const { prompt, model } = req.body;
  const userId = req.user._id;

  try {
    const enhanced = await synthesizeFinalPrompt(prompt, [], model);

    // 4. SENDING BACK 'enhanced' KEY
    res.status(200).json({ enhanced });

    History.create({
      userId,
      modelUsed: model,
      originalPrompt: prompt,
      enhancedPrompt: enhanced,
      refinementData: { answers: [] }
    }).catch(err => console.error("❌ History Save Failed:", err.message));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Enhancement failed" });
  }
};

