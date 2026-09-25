import { webSearch } from "../tools/webSearch.js";

export async function researchNews(state) {
  const results = await webSearch(`${state.companyName} recent news 2026 business developments`);
  return {
    newsResults: results,
    steps: [`Searched recent news for "${state.companyName}" — found ${results.length} sources.`],
  };
}
