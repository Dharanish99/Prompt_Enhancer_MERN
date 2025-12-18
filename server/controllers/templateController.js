import Template from '../models/Template.js';
import { synthesizeTemplate } from '../services/aiService.js';

// =====================================================
// 1. INIT REMIX (NO AI COST)
// =====================================================
export const initRemix = async (req, res) => {
  const { templateId } = req.body;

  try {
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Not found" });

    res.json({
      templateId: template._id,
      originalPrompt: template.promptContent,
      questions: template.questions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to initialize remix" });
  }
};

// =====================================================
// 2. CREATE REMIX (NEW FLOW)
// =====================================================
export const createRemix = async (req, res) => {
  const { templateId, answers } = req.body;

  try {
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Not found" });

    const finalPrompt = await synthesizeTemplate(
      template.promptContent,
      template.questions,
      answers,
      template.protectedTokens || []
    );

    template.usageCount += 1;
    await template.save();

    res.json({ remixedPrompt: finalPrompt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate remix" });
  }
};

// =====================================================
// 3. BACKWARD-COMPATIBLE REMIX (OLD ROUTE SUPPORT)
// =====================================================
// This keeps `/api/templates/remix` working
export const remixTemplate = async (req, res) => {
  const { templateId, answers } = req.body;

  try {
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    const finalPrompt = await synthesizeTemplate(
      template.promptContent,
      template.questions,
      answers || [],
      template.protectedTokens || []
    );

    template.usageCount += 1;
    await template.save();

    res.status(200).json({
      remixedPrompt: finalPrompt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Remix failed" });
  }
};

// =====================================================
// 4. GET TEMPLATES
// =====================================================
export const getTemplates = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    let query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { usageCount: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const templates = await Template.find(query)
      .sort(sortOption)
      .limit(50);

    res.status(200).json(templates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

// =====================================================
// 5. CREATE TEMPLATE
// =====================================================
export const createTemplate = async (req, res) => {
  try {
    const authorId = req.user ? req.user._id : "system";

    const newTemplate = await Template.create({
      ...req.body,
      authorId
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// =====================================================
// 6. TRACK USAGE
// =====================================================
export const useTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { $inc: { usageCount: 1 } },
      { new: true }
    );

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};
