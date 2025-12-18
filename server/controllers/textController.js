import { auditTextPrompt, enhanceTextPrompt, simulateTextPrompt } from '../services/aiService.js';

// @desc    Audit prompt health (0-100)
// @route   POST /api/text/audit
export const auditPrompt = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  
  try {
    const result = await auditTextPrompt(prompt);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Audit failed" });
  }
};

// @desc    Generate 3 variations (Logical, Creative, Optimized)
// @route   POST /api/text/enhance
export const generateVariations = async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    const variations = await enhanceTextPrompt(prompt);
    res.json(variations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate variations" });
  }
};

// @desc    Run the prompt to see result (Internal Models Only)
// @route   POST /api/text/simulate
export const runSimulation = async (req, res) => {
  const { prompt, model } = req.body; // <--- EXTRACT MODEL ID HERE
  if (!prompt) return res.status(400).json({ error: "Prompt required" });

  try {
    // Pass the model ID (e.g., "mixtral-8x7b-32768") to the service
    const output = await simulateTextPrompt(prompt, model);
    res.json({ result: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Simulation failed" });
  }
};