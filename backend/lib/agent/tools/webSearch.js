import { TavilySearchResults } from "@langchain/community/tools/tavily_search";

/**
 * Thin wrapper around Tavily so the graph nodes don't need to know
 * about the underlying search provider. Swap this file's internals
 * if you'd rather use SerpAPI, Bing, or a finance-specific API
 * (e.g. Alpha Vantage / Financial Modeling Prep) for the fundamentals node.
 */
// Constructed lazily (not at module load) so the app doesn't crash on
// startup/build if TAVILY_API_KEY isn't set yet — it only fails when a
// search is actually attempted.
let searchTool;
function getSearchTool() {
  if (!searchTool) {
    searchTool = new TavilySearchResults({
      apiKey: process.env.TAVILY_API_KEY,
      maxResults: 5,
    });
  }
  return searchTool;
}

export async function webSearch(query) {
  try {
    const raw = await getSearchTool().invoke(query);
    // TavilySearchResults returns a JSON string of results
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`webSearch failed for "${query}":`, err.message);
    return [];
  }
}
