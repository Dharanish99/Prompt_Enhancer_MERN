import Template from '../models/Template.js';
import {synthesizeTemplate } from '../services/aiService.js';


// 1. GET QUESTIONS (Instant - No AI Cost)
export const initRemix = async (req, res) => {
  const { templateId } = req.body;
  try {
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Not found" });

    // FAST: Just return the array from the DB
    res.json({ 
      templateId: template._id,
      originalPrompt: template.promptContent,
      questions: template.questions // <--- This comes from DB now
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize" });
  }
};

// 2. GENERATE PROMPT (Costs 1 API Call)
export const createRemix = async (req, res) => {
  const { templateId, answers } = req.body; // answers is an array: ["Man", "Blue Suit"]
  
  try {
    const template = await Template.findById(templateId);
    
    // The "Synthesizer" blends the template + the array of answers
    const finalPrompt = await synthesizeTemplate(template.promptContent, template.questions, answers);
    
    // Track usage
    template.usageCount += 1;
    await template.save();

    res.json({ remixedPrompt: finalPrompt });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate prompt" });
  }
};

// ... keep getTemplates and other functions
// @desc    Get All Templates (with Search & Filter)
// @route   GET /api/templates
export const getTemplates = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    
    // 1. Build Query
    let query = {};
    
    // Filter by Category (Multiverse logic)
    if (category && category !== 'all') {
      query.category = category;
    }

    // Search Logic (Title, Tags, Description)
    if (search) {
      query.$text = { $search: search };
    }

    // 2. Build Sort
    let sortOption = { createdAt: -1 }; // Default: Newest
    if (sort === 'popular') sortOption = { likes: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    // 3. Execute
    const templates = await Template.find(query)
      .sort(sortOption)
      .limit(50); // Pagination limit

    res.status(200).json(templates);
  } catch (error) {
    console.error("Template Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
};

// @desc    Publish a New Template
// @route   POST /api/templates
export const createTemplate = async (req, res) => {
  try {
    // Determine Author (System or User)
    const authorId = req.auth ? req.auth.userId : "system";
    
    const newTemplate = await Template.create({
      ...req.body,
      authorId
    });

    res.status(201).json(newTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Increment Usage Count (When someone 'Remixes')
// @route   POST /api/templates/:id/use
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

export const remixTemplate = async (req, res) => {
  const { templateId, userChange } = req.body;
  
  try {
    const template = await Template.findById(templateId);
    if (!template) return res.status(404).json({ error: "Template not found" });

    // Call the Smart Remixer
    const result = await remixSmartTemplate(template.promptContent, userChange);

    // Track usage
    template.usageCount += 1;
    await template.save();

    // Return the full JSON object (prompt + variables + explanation)
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Remix failed" });
  }
};