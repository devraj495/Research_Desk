import { getModel } from "../tools/llm.js";

export async function synthesize(state) {
  const model = getModel({ temperature: 0.2 });

  const fin = state.structuredFinancials;
  const structuredBlock = fin
    ? [
        "STRUCTURED FINANCIALS (from Financial Modeling Prep — treat as ground truth over search snippets):",
        `Ticker: ${fin.ticker}`,
        fin.sector ? `Sector: ${fin.sector} / ${fin.industry}` : null,
        fin.marketCap ? `Market Cap: ${fin.marketCap}` : null,
        fin.price ? `Price: ${fin.price} (${fin.priceChangePercent}% recent change)` : null,
        fin.peRatio ? `P/E Ratio: ${fin.peRatio}` : null,
        fin.eps ? `EPS: ${fin.eps}` : null,
        fin.yearHigh ? `52wk range: ${fin.yearLow} - ${fin.yearHigh}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "STRUCTURED FINANCIALS: none available (private company, startup, or no ticker match) — rely on search signal below and say so explicitly in the brief.";

  const context = [
    structuredBlock,
    "\nNEWS RESULTS:",
    ...state.newsResults.map((r, i) => `[N${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`),
    "\nFINANCIAL SEARCH RESULTS:",
    ...state.financialResults.map((r, i) => `[F${i + 1}] ${r.title}\n${r.content}\nURL: ${r.url}`),
  ].join("\n\n");

  const prompt = `You are an equity research analyst. Based on the data below about "${state.companyName}", write a concise research brief (business overview, recent developments, financial signals, competitive position, and risks). Prefer the structured financials for any hard numbers. For narrative claims, cite which source ([N1], [F2], etc.) each comes from. If data is thin or ambiguous, say so plainly instead of guessing.\n\n${context}`;

  const response = await model.invoke(prompt);
  return {
    analysis: response.content,
    steps: ["Synthesized research brief from structured financials + news + search sources."],
  };
}
