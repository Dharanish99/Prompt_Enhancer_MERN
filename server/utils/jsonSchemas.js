export const auditSchema = {
  type: "object",
  required: ["score", "breakdown", "issues", "suggestions"],
  properties: {
    score: { type: "number" },
    breakdown: {
      type: "object",
      required: ["clarity", "context", "constraints"],
      properties: {
        clarity: { type: "number" },
        context: { type: "number" },
        constraints: { type: "number" }
      }
    },
    issues: { type: "array", items: { type: "string" } },
    suggestions: { type: "array", items: { type: "string" } }
  }
};

export const enhancerSchema = {
  type: "object",
  required: ["logical", "creative", "optimized"],
  properties: {
    logical: { type: "string" },
    creative: { type: "string" },
    optimized: { type: "string" }
  }
};
