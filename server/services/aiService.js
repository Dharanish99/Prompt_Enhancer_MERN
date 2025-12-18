import OpenAI from "openai";
import dotenv from "dotenv";

import { loadPrompt } from "../utils/promptLoader.js";
import { withRetry, validateJSON } from "../utils/llmGuard.js";
import { auditSchema, enhancerSchema } from "../utils/jsonSchemas.js";

dotenv.config();

const PROMPT_VERSION = "v1";

// ================= CLIENT FACTORY =================
const createClient = (key) =>
  new OpenAI({
    apiKey: key,
    baseURL: "https://api.groq.com/openai/v1",
  });

const groqVisuals = createClient(process.env.GROQ_API_KEY_VISUALS);
const groqRemix = createClient(process.env.GROQ_API_KEY_REMIX);
const groqAudit = createClient(process.env.GROQ_API_KEY_TEXT_AUDIT);
const groqEnhance = createClient(process.env.GROQ_API_KEY_TEXT_ENHANCE);
const groqSimulate = createClient(process.env.GROQ_API_KEY_TEXT_SIMULATE);

// ================= SAFE JSON =================
const safeJSON = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(
      raw
        .trim()
        .replace(/^```json\s*|\s*```$/g, "")
        .replace(/^```\s*|\s*```$/g, "")
    );
  } catch {
    return null;
  }
};

// ================= PROMPT VALIDATION =================
const isValidPrompt = (text, original) => {
  if (!text || typeof text !== "string") return false;

  const redFlags = [
    /^(once upon a time|here (are|is)|chapter \d)/i,
    /^["']/,
    /^\d+\./m,
  ];

  if (redFlags.some((r) => r.test(text.trim()))) return false;

  if (original && text.length < original.length * 0.6) return false;

  return true;
};

// ================= NORMALIZATION =================
const normalizeEnhancerOutput = (raw, original) => {
  if (!raw || typeof raw !== "object") return null;

  const result = {
    logical: String(raw.logical || ""),
    creative: String(raw.creative || ""),
    optimized: String(raw.optimized || ""),
  };

  if (
    !isValidPrompt(result.logical, original) ||
    !isValidPrompt(result.creative, original) ||
    !isValidPrompt(result.optimized, original)
  ) {
    return null;
  }

  return result;
};

//
// =================================================
// 🎨 VISUAL ENGINE (RESTORED — REQUIRED)
// =================================================
//

export const analyzePromptAmbiguity = async (userPrompt) => {
  const system = loadPrompt(`visuals/analyst.${PROMPT_VERSION}.txt`);

  try {
    const res = await groqVisuals.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    return (
      safeJSON(res.choices[0]?.message?.content) || {
        questions: ["What style?", "What lighting?", "What setting?"],
      }
    );
  } catch {
    return {
      questions: ["What style?", "What lighting?", "What setting?"],
    };
  }
};

export const synthesizeFinalPrompt = async (prompt, answers, model) => {
  const map = {
    midjourney: "visuals/midjourney",
    dalle: "visuals/dalle",
    leonardo: "visuals/leonardo",
    "stable-diffusion": "visuals/stable",
    "nano-banana": "visuals/nano-banana",
  };

  const system = loadPrompt(`${map[model] || map.midjourney}.${PROMPT_VERSION}.txt`);

  const context = Array.isArray(answers)
    ? answers.join("\n")
    : Object.values(answers || {}).join("\n");

  const res = await groqVisuals.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: system },
      { role: "user", content: `${prompt}\n${context}` },
    ],
    temperature: 0.7,
  });

  return res.choices[0]?.message?.content || prompt;
};

//
// =================================================
// 📝 TEXT ENGINE (FIXED PROMPT ENHANCER)
// =================================================
//

export const auditTextPrompt = async (prompt) => {
  const system = loadPrompt(`text/auditor.${PROMPT_VERSION}.txt`);
  const model = "openai/gpt-oss-120b";

  return withRetry({
    attempts: 2,
    task: async () => {
      const res = await groqAudit.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const parsed = safeJSON(res.choices[0]?.message?.content);
      if (!parsed || !validateJSON(auditSchema, parsed)) {
        throw new Error("Audit JSON invalid");
      }

      return parsed;
    },
  });
};

export const enhanceTextPrompt = async (prompt) => {
  const system = loadPrompt(`text/enhancer.${PROMPT_VERSION}.txt`);
  const model = "llama-3.3-70b-versatile";

  return withRetry({
    attempts: 2,
    task: async () => {
      const res = await groqEnhance.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          {
            role: "user",
            content: `
USER_PROMPT:
"${prompt}"

TASK:
Rewrite this prompt into:
- logical
- creative
- optimized

Rules:
- DO NOT generate content
- DO NOT answer the prompt
- Rewrite ONLY the prompt
- Return ONLY valid JSON
`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      const parsed = safeJSON(res.choices[0]?.message?.content);
      const normalized = normalizeEnhancerOutput(parsed, prompt);

      if (!normalized || !validateJSON(enhancerSchema, normalized)) {
        throw new Error("Enhancer JSON invalid");
      }

      return normalized;
    },
  });
};

export const simulateTextPrompt = async (prompt, model) => {
  const system = loadPrompt(`text/simulator.${PROMPT_VERSION}.txt`);

  const res = await groqSimulate.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 1200,
  });

  return res.choices[0]?.message?.content;
};

//
// =================================================
// 🔀 REMIX ENGINE (TEMPLATES) — REQUIRED EXPORT
// =================================================
//

const violatesProtectedTokens = (output, tokens = []) =>
  tokens.some((token) => !output.includes(token));

export const synthesizeTemplate = async (
  templateContent,
  questions,
  answers,
  protectedTokens = []
) => {
  const system = loadPrompt(`remix/remix.${PROMPT_VERSION}.txt`);

  const qaPairs = questions.map((q, i) => ({
    question: q,
    answer: answers[i] || "",
  }));

  const userContent = `
REFERENCE PROMPT:
${templateContent}

USER ANSWERS:
${JSON.stringify(qaPairs, null, 2)}

PROTECTED TOKENS:
${protectedTokens.join(", ")}
`;

  const res = await groqRemix.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    temperature: 0.5,
  });

  const output = res.choices[0]?.message?.content || templateContent;

  if (violatesProtectedTokens(output, protectedTokens)) {
    return templateContent;
  }

  return output;
};
