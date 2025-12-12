import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq Client
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ============================================================
//  SECTION 1: MAIN IMAGE ENHANCER LOGIC (The "Home" Page)
// ============================================================

// --- THE ANALYST (Generates Questions for Raw Prompts) ---
const ANALYST_PROMPT = `
  You are a Senior Art Director for AI Generation.
  Your goal is to identify AMBIGUITY in a user's raw idea.
  
  TASK:
  1. Analyze the user's prompt.
  2. Identify 3 critical visual elements that are MISSING (e.g., Lighting style, Camera Lens, Art Era, Material texture).
  3. Generate 3 short, specific questions to extract this data.
  
  OUTPUT FORMAT (Strict JSON):
  {
    "questions": [
       "Question 1?",
       "Question 2?",
       "Question 3?"
    ]
  }
`;

// --- THE ARCHITECT (Generates Final Prompts based on Model) ---
const ARCHITECT_PROMPTS = {
  midjourney: `
    You are a Midjourney v6 Prompt Expert.
    Task: SYNTHESIZE the user's raw idea + their answers into a specific Midjourney format.
    RULES:
    - Format: /imagine prompt: [Subject], [Environment], [Artistic Style], [Lighting], [Camera Parameters] --v 6.0
    - Do NOT write natural sentences. Use visual tokens.
    - Example: "Cyberpunk samurai, neon rain, volumetric lighting, shot on 35mm, hyper-realistic --ar 16:9 --v 6.0"
  `,
  dalle: `
    You are a DALL-E 3 Narrative Designer.
    Task: SYNTHESIZE the input into a rich, descriptive paragraph.
    RULES:
    - Write a cohesive description (3-4 sentences).
    - Describe the *mood* and *physics* of the light based on the user's answers.
  `,
  leonardo: `
    You are a Leonardo.ai Prompt Specialist.
    Task: Create a prompt optimized for the "Leonardo Diffusion XL" model.
    RULES:
    - Use keywords like: "intricate details", "masterpiece", "trending on artstation".
    - Focus on artistic styles (RPG, Oil Painting, 3D Render).
  `,
  banana: `
    You are a Stable Diffusion XL Engineer.
    Task: Create a keyword-heavy prompt using attention weighting syntax.
    RULES:
    - Use (keyword:weight) syntax for emphasis. Example: "(blue neon lighting:1.3)".
    - Format: [Positive Prompt] ### [Negative Prompt].
  `
};

/**
 * 1. Analyze Ambiguity (Home Page - Refine Mode)
 */
export const analyzePromptAmbiguity = async (userPrompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: ANALYST_PROMPT },
        { role: "user", content: `Analyze this prompt: "${userPrompt}"` },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, 
      temperature: 0.6,
    });

    return JSON.parse(completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Analysis Error:", error);
    return { questions: ["What is the art style?", "What is the lighting?", "What is the setting?"] };
  }
};

/**
 * 2. Synthesize Final Prompt (Home Page - Finalize)
 */
export const synthesizeFinalPrompt = async (originalPrompt, answers, modelType) => {
  const strategy = ARCHITECT_PROMPTS[modelType] || ARCHITECT_PROMPTS['midjourney'];

  // Format context from Home Page flow
  let clarificationContext = "";
  if (answers) {
    const answersArray = Array.isArray(answers) ? answers : Object.values(answers);
    if (answersArray.length > 0) {
      clarificationContext = "USER CLARIFICATIONS:\n";
      answersArray.forEach((ans, i) => {
        if (ans && ans.trim() !== "") {
            clarificationContext += `- ${ans}\n`;
        }
      });
    }
  }

  const userMessage = `RAW CONCEPT: "${originalPrompt}"\n${clarificationContext}\nTASK: Rewrite this into a professional prompt for ${modelType}.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: strategy },
        { role: "user", content: userMessage },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, 
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Error generating prompt.";
  } catch (error) {
    console.error("Synthesis Error:", error);
    return `Failed to enhance prompt: ${error.message}`;
  }
};


// ============================================================
//  SECTION 2: TEMPLATE REMIX LOGIC (The "Templates" Page)
// ============================================================

// --- THE TEMPLATE FILLER (Optimized) ---
const TEMPLATE_FILLER_PROMPT = `
  You are an Expert Prompt Engineer.
  
  INPUTS:
  1. Base Template: A prompt structure containing specific technical parameters and variables.
  2. Context Pairs: The specific Questions the user was asked, and their Answers.
  
  TASK:
  - Intelligently replace the placeholders or generic terms in the Template with the User's Answers.
  - Ensure the final prompt is grammatically correct and flows naturally.
  - STRICTLY PRESERVE all technical tags (e.g. --v 6.0, --ar 16:9, (weight:1.2)).
  - Output ONLY the final prompt string. Do not add conversational filler.
`;

/**
 * 3. Synthesize Template (Templates Page - Remix)
 * Takes the raw template + the Q&A pairs and merges them.
 */
export const synthesizeTemplate = async (templateContent, questions, answers) => {
  // Format the Q&A for the AI to understand the intent
  let contextPairs = "";
  
  if (questions && answers && questions.length > 0) {
    questions.forEach((q, i) => {
      // Only include if the user actually answered
      const ans = answers[i] || "Default/Unspecified";
      contextPairs += `Question: "${q}"\nUser Answer: "${ans}"\n---\n`;
    });
  }

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: TEMPLATE_FILLER_PROMPT },
        { 
          role: "user", 
          content: `Base Template: "${templateContent}"\n\nContext Pairs:\n${contextPairs}` 
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.6, // Slightly lower temp for adherence to template structure
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content || "Error synthesizing template.";
  } catch (error) {
    console.error("Template Synthesis Error:", error);
    throw new Error("Failed to remix template.");
  }
};