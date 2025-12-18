import fs from "fs";
import path from "path";

const cache = new Map();

/**
 * Loads a versioned system prompt from /server/prompts
 * @param {string} relativePath - e.g. "text/auditor.v1.txt"
 */
export function loadPrompt(relativePath) {
  // Return from cache if already loaded
  if (cache.has(relativePath)) {
    return cache.get(relativePath);
  }

  // IMPORTANT:
  // process.cwd() === <project_root>/server
  // So prompts are at <project_root>/server/prompts/...
  const fullPath = path.join(
    process.cwd(),
    "prompts",
    relativePath
  );

  if (!fs.existsSync(fullPath)) {
    throw new Error(`❌ Prompt file not found: ${fullPath}`);
  }

  const content = fs.readFileSync(fullPath, "utf-8");

  // Cache for future calls
  cache.set(relativePath, content);

  return content;
}
