const FMP_BASE = "https://financialmodelingprep.com/stable";

/**
 * Pulls structured fundamentals for a company from Financial Modeling Prep
 * (https://financialmodelingprep.com). Unlike the web-search
 * fallback, this gives exact numbers (market cap, P/E, revenue, margins)
 * when the company is public.
 *
 * Returns `null` if the company has no public ticker (private company,
 * startup, etc.) — callers should treat that as a normal case, not an
 * error, and fall back to search-derived signal instead.
 */
export async function getStructuredFinancials(companyName) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.warn("FMP_API_KEY not set — skipping structured financials, using search fallback only.");
    return null;
  }

  try {
    const ticker = await resolveTicker(companyName, apiKey);
    if (!ticker) return null;

    const [profile, quote] = await Promise.all([
      fetchJson(`${FMP_BASE}/profile?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`),
      // Quote access depends on the FMP subscription. Profile data is enough
      // to return a useful result, so a quote failure must not discard it.
      fetchJsonOrNull(`${FMP_BASE}/quote?symbol=${encodeURIComponent(ticker)}&apikey=${apiKey}`, 5_000),
    ]);

    const p = profile?.[0];
    const q = quote?.[0];
    if (!p && !q) return null;

    return {
      ticker,
      companyName: p?.companyName || companyName,
      sector: p?.sector,
      industry: p?.industry,
      description: p?.description,
      marketCap: q?.marketCap ?? p?.marketCap ?? p?.mktCap,
      price: q?.price ?? p?.price,
      peRatio: q?.pe ?? p?.pe,
      eps: q?.eps ?? p?.eps,
      priceChangePercent: q?.changesPercentage ?? p?.changePercentage,
      yearHigh: q?.yearHigh ?? p?.yearHigh,
      yearLow: q?.yearLow ?? p?.yearLow,
      volume: q?.volume ?? p?.volume,
      avgVolume: q?.avgVolume ?? p?.averageVolume,
    };
  } catch (err) {
    console.error(`getStructuredFinancials failed for "${companyName}":`, err.message);
    return null;
  }
}

async function resolveTicker(companyName, apiKey) {
  const results = await fetchJson(
    `${FMP_BASE}/search-name?query=${encodeURIComponent(companyName)}&apikey=${apiKey}`
  );
  return results?.[0]?.symbol || null;
}

async function fetchJson(url, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`FMP request failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJsonOrNull(url, timeoutMs) {
  try {
    return await fetchJson(url, timeoutMs);
  } catch (err) {
    console.warn(`Optional FMP request skipped: ${err.message}`);
    return null;
  }
}
