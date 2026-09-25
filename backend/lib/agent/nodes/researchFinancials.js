import { webSearch } from "../tools/webSearch.js";
import { getStructuredFinancials } from "../tools/financialData.js";

export async function researchFinancials(state) {
  // Structured lookup (exact numbers) and general search (narrative color)
  // answer different questions, so there's no reason to serialize them.
  const [structured, searchResults] = await Promise.all([
    getStructuredFinancials(state.companyName),
    webSearch(`${state.companyName} revenue earnings financial performance funding valuation`),
  ]);

  const step = structured
    ? `Pulled structured fundamentals for ${state.companyName} (${structured.ticker}) from Financial Modeling Prep.`
    : `No public ticker found for "${state.companyName}" (or FMP_API_KEY not set) — relying on search-derived financial signal only.`;

  return {
    structuredFinancials: structured,
    financialResults: searchResults,
    steps: [step, `Searched financial signals — found ${searchResults.length} sources.`],
  };
}
