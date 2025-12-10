import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq Client
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// --- 1. THE ANALYST (Generates Questions) ---
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

// --- 2. THE ARCHITECT (The 4 Model Strategies) ---
// Keys match Frontend: 'midjourney', 'dalle', 'leonardo', 'banana'
const ARCHITECT_PROMPTS = {
  // 1. MIDJOURNEY (Token-heavy, parameters)
  midjourney: `
    You are a Midjourney v6 Prompt Expert.
    Task: SYNTHESIZE the user's raw idea + their answers into a specific Midjourney format.
    
    RULES:
    - Format: /imagine prompt: [Subject], [Environment], [Artistic Style], [Lighting], [Camera Parameters] --v 6.0
    - Do NOT write natural sentences. Use visual tokens.
    - Example: "Cyberpunk samurai, neon rain, volumetric lighting, shot on 35mm, hyper-realistic --ar 16:9 --v 6.0"
    - Integrate the user's answers naturally into the token list.
  `,

  // 2. DALL-E 3 (Natural Language, Descriptive)
  dalle: `
    You are a DALL-E 3 Narrative Designer.
    Task: SYNTHESIZE the input into a rich, descriptive paragraph.
    
    RULES:
    - DALL-E 3 follows instructions best with natural language.
    - Write a cohesive description (3-4 sentences).
    - Describe the *mood* and *physics* of the light based on the user's answers.
    - Do not use technical jargon like "8k" or "f/1.8" unless the user specifically asked for a photorealistic camera shot.
  `,

  // 3. LEONARDO.AI (Artistic, Stylized)
  leonardo: `
    You are a Leonardo.ai Prompt Specialist.
    Task: Create a prompt optimized for the "Leonardo Diffusion XL" model.
    
    RULES:
    - Leonardo excels at artistic styles (RPG, Oil Painting, 3D Render).
    - Structure: [Main Subject], [Action], [Context], [Artistic Filters].
    - Use keywords like: "intricate details", "masterpiece", "trending on artstation".
    - If the user's answers imply a dark mood, add "contrast, dramatic lighting".
  `,

  // 4. BANANA / STABLE DIFFUSION (Weighting, Keywords)
  banana: `
    You are a Stable Diffusion XL Engineer.
    Task: Create a keyword-heavy prompt using attention weighting syntax.
    
    RULES:
    - Use (keyword:weight) syntax for emphasis based on user answers. 
    - Example: If user answered "Blue lighting", write "(blue neon lighting:1.3)".
    - Structure: [Positive Prompt] ### [Negative Prompt].
    - Always generate a Negative Prompt section at the end (e.g., "### Negative: low quality, ugly, deformed, watermark").
  `
};

/**
 * PHASE 1: Analyze prompt and generate questions
 */
export const analyzePromptAmbiguity = async (userPrompt) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: ANALYST_PROMPT },
        { role: "user", content: `Analyze this prompt for missing details: "${userPrompt}"` },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }, 
      temperature: 0.6,
    });

    return JSON.parse(completion.choices[0]?.message?.content);
  } catch (error) {
    console.error("Analysis Error:", error);
    // Fallback if LLM fails or returns bad JSON
    return { questions: ["What art style do you want?", "What is the lighting?", "What is the camera angle?"] };
  }
};

/**
 * PHASE 2: Synthesize final prompt (The "Pro" Logic)
 */
export const synthesizeFinalPrompt = async (originalPrompt, answers, modelType) => {
  // 1. Select the correct personality based on frontend key (default to midjourney)
  const strategy = ARCHITECT_PROMPTS[modelType] || ARCHITECT_PROMPTS['midjourney'];

  // 2. Format the user's answers into a clear context block
  let clarificationContext = "";
  if (answers) {
    // Handle both Array (questions flow) and Object (direct input)
    const answersArray = Array.isArray(answers) ? answers : Object.values(answers);
    
    if (answersArray.length > 0) {
      clarificationContext = "USER CLARIFICATIONS (Integrate these into the prompt):\n";
      answersArray.forEach((ans, i) => {
        // Only include if the answer isn't empty
        if (ans && ans.trim() !== "") {
            clarificationContext += `- Clarification ${i + 1}: ${ans}\n`;
        }
      });
    }
  }

  // 3. The "Synthesis" Request
  const userMessage = `
    RAW CONCEPT: "${originalPrompt}"
    ${clarificationContext}
    
    TASK: Rewrite the Raw Concept into a professional prompt for ${modelType}, strictly following your System Rules.
  `;

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