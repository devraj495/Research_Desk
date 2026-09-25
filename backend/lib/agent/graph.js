import { StateGraph, Annotation, START, END } from "@langchain/langgraph";
import { researchNews } from "./nodes/researchNews.js";
import { researchFinancials } from "./nodes/researchFinancials.js";
import { synthesize } from "./nodes/synthesize.js";
import { decide } from "./nodes/decide.js";
import { critique } from "./nodes/critique.js";

/**
 * Graph state. `steps` accumulates a human-readable trace of what the
 * agent did at each node — this is what lets the UI show *how* the
 * agent reached its verdict, not just the final answer.
 *
 * This file only wires nodes together — the actual logic for each step
 * lives in ./nodes/*, and shared infra (LLM, search, financial data) lives
 * in ./tools/*.
 */
const AgentState = Annotation.Root({
  companyName: Annotation(),
  newsResults: Annotation({ default: () => [] }),
  financialResults: Annotation({ default: () => [] }),
  structuredFinancials: Annotation({ default: () => null }),
  analysis: Annotation({ default: () => "" }),
  decision: Annotation({ default: () => null }),
  steps: Annotation({
    default: () => [],
    reducer: (existing, update) => existing.concat(update),
  }),
});

export function buildGraph() {
  const graph = new StateGraph(AgentState)
    .addNode("research_news", researchNews)
    .addNode("research_financials", researchFinancials)
    .addNode("synthesize", synthesize)
    .addNode("decide", decide)
    .addNode("critique", critique)
    .addEdge(START, "research_news")
    .addEdge("research_news", "research_financials")
    .addEdge("research_financials", "synthesize")
    .addEdge("synthesize", "decide")
    .addEdge("decide", "critique")
    .addEdge("critique", END);

  return graph.compile();
}

export async function runResearchAgent(companyName) {
  const app = buildGraph();
  const result = await app.invoke({ companyName, steps: [`Starting research on "${companyName}".`] });
  return result;
}
