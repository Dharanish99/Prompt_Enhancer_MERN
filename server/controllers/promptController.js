import History from '../models/History.js';
import { analyzePromptAmbiguity, synthesizeFinalPrompt } from '../imageEnhancer.js'; // Adjust path as needed

// @desc    Analyze prompt for ambiguity
// @route   POST /api/analyze-prompt
export const analyzePrompt = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });

  try {
    const analysis = await analyzePromptAmbiguity(prompt);
    res.status(200).json({ questions: analysis.questions });
  } catch (error) {
    res.status(500).json({ error: "Analysis failed" });
  }
};

// @desc    Finalize prompt and Save to History
// @route   POST /api/finalize-prompt
export const finalizePrompt = async (req, res) => {
  const { original, answers, model } = req.body;
  const userId = req.auth.userId; // Extracted safely by Clerk Middleware

  try {
    // 1. Generate AI Response
    const enhanced = await synthesizeFinalPrompt(original, answers, model);

    // 2. Return response to user IMMEDIATELY (Don't make them wait for DB save)
    res.status(200).json({ enhanced });

    // 3. Fire-and-Forget Save to MongoDB
    // We format answers array/object for storage
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
    // Only send error if we haven't sent response yet
    if (!res.headersSent) res.status(500).json({ error: "Finalization failed" });
  }
};

// @desc    Instant Enhance (No Questions) and Save
// @route   POST /api/image-enhance
export const instantEnhance = async (req, res) => {
  const { prompt, model } = req.body;
  const userId = req.auth.userId;

  try {
    const enhanced = await synthesizeFinalPrompt(prompt, [], model);

    res.status(200).json({ enhanced });

    History.create({
      userId,
      modelUsed: model,
      originalPrompt: prompt,
      enhancedPrompt: enhanced,
      refinementData: { answers: [] } // Empty for instant mode
    }).catch(err => console.error("❌ History Save Failed:", err.message));

  } catch (error) {
    res.status(500).json({ error: "Enhancement failed" });
  }
};

// @desc    Get User History
// @route   GET /api/history
export const getHistory = async (req, res) => {
  const userId = req.auth.userId;

  try {
    const history = await History.find({ userId })
      .sort({ createdAt: -1 }) // Newest first
      .limit(20); // Limit to last 20

    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};