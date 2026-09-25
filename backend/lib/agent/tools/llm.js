import { ChatOpenAI } from "@langchain/openai";

/**
 * Single place to configure which model powers the agent.
 * Swapping providers (Gemini, Anthropic, etc.) only means changing
 * this file — every node in graph.js just calls `getModel()`.
 */
export function getModel({ temperature = 0.2 } = {}) {
  return new ChatOpenAI({
    modelName: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    temperature,
    openAIApiKey: process.env.GROQ_API_KEY,
    configuration: {
      baseURL: "https://api.groq.com/openai/v1",
    }
  });
}
