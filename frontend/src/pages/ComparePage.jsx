import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

function ComparePage({ apiUrl, onNavigate, user, onLogout }) {
  const [companyA, setCompanyA] = useState('');
  const [companyB, setCompanyB] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  async function runComparison() {
    const first = companyA.trim();
    const second = companyB.trim();

    if (!first || !second) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const [analysisA, analysisB] = await Promise.all([
        fetchCompanyAnalysis(apiUrl, first),
        fetchCompanyAnalysis(apiUrl, second),
      ]);

      const dataA = analysisA.data;
      const dataB = analysisB.data;

      if (!dataA || !dataB) {
        setError(analysisA.error || analysisB.error || 'Comparison failed.');
        return;
      }

      const scoredA = scoreCompany(dataA);
      const scoredB = scoreCompany(dataB);

      const winner =
        scoredA.score > scoredB.score
          ? dataA.companyName
          : scoredB.score > scoredA.score
            ? dataB.companyName
            : 'Tie';

      setResults([
        { ...dataA, score: scoredA.score, signal: scoredA.signal },
        { ...dataB, score: scoredB.score, signal: scoredB.signal },
        { winner },
      ]);
    } catch (err) {
      setError(err.message || 'Comparison failed.');
    } finally {
      setLoading(false);
    }
  }

  const winnerName = results[2]?.winner;

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <Navbar currentPath="/compare" onNavigate={onNavigate} user={user} onLogout={onLogout} />

        <div className="max-w-3xl">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Comparison Mode
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Compare two companies and see which one looks stronger for profit potential.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Enter two company names to run a side-by-side review based on the latest signals, verdicts, and momentum.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.65)]">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={companyA}
              onChange={(event) => setCompanyA(event.target.value)}
              placeholder="Company A"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
            <input
              value={companyB}
              onChange={(event) => setCompanyB(event.target.value)}
              placeholder="Company B"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <button
            type="button"
            onClick={runComparison}
            disabled={loading || !companyA.trim() || !companyB.trim()}
            className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Comparing…' : 'Compare now'}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {results.length === 3 && (
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-6 text-white shadow-[0_24px_70px_-45px_rgba(15,23,42,0.9)]">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_18px_rgba(94,234,212,0.8)]" />
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-200">
                Comparison outcome
              </div>
            </div>
            <h2 className="text-2xl font-black text-white">
              {winnerName === 'Tie' ? 'The comparison is a tie.' : `${winnerName} looks stronger for profit potential.`}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
              This view combines verdict strength, confidence, price momentum, risk factors, and the AI reasoning trail to highlight the stronger opportunity.
            </p>
          </div>
        )}

        {results.length === 3 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {results.slice(0, 2).map((item) => {
              const concerns = getInvestmentConcerns(item);
              const redFlags = getFinancialRedFlags(item);
              const reasoning = summarizeReasoning(item.decision?.reasoning || item.analysis);

              return (
                <div key={item.companyName} className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {item.companyName}
                      </div>
                      <h3 className="text-2xl font-black text-slate-950">
                        {item.decision?.summary || item.signal}
                      </h3>
                    </div>
                    <div className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${verdictClass(item.decision?.verdict)}`}>
                      {item.decision?.verdict || 'WATCH'}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <Metric label="Signal score" value={item.score.toFixed(1)} />
                    <Metric label="Confidence" value={`${item.decision?.confidence || 0}%`} />
                    <Metric label="Momentum" value={`${item.structuredFinancials?.priceChangePercent ?? 0}%`} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-700">
                      Why not invest / key issues
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-rose-900">
                      {concerns.map((concern, index) => (
                        <li key={`${concern}-${index}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                          <span>{concern}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Financial red flags
                    </p>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                      {redFlags.map((flag, index) => (
                        <li key={`${flag}-${index}`} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 rounded-2xl border border-teal-200 bg-gradient-to-br from-slate-950 to-slate-900 p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-teal-300 shadow-[0_0_18px_rgba(94,234,212,0.8)]" />
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-200">
                        AI read
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-100">{reasoning}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

async function fetchCompanyAnalysis(apiUrl, companyName) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyName }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Research request failed.', data: null };
    }

    return { error: null, data };
  } catch (err) {
    return { error: err.message || 'Research request failed.', data: null };
  }
}

function scoreCompany(result) {
  let score = 0;
  const verdict = result?.decision?.verdict;

  if (verdict === 'INVEST') score += 5;
  else if (verdict === 'WATCH') score += 2;
  else if (verdict === 'PASS') score -= 2;

  const momentum = Number(result?.structuredFinancials?.priceChangePercent || 0);
  score += momentum / 10;

  const confidence = Number(result?.decision?.confidence || 0);
  score += confidence / 20;

  const signal =
    verdict === 'INVEST'
      ? 'Positive outlook with strong upside potential.'
      : verdict === 'PASS'
        ? 'The current profile looks weaker for profit.'
        : 'Neutral tone with mixed or early-stage signals.';

  return { score, signal };
}

function getInvestmentConcerns(result) {
  const concerns = [];
  const verdict = result?.decision?.verdict;
  const risks = result?.decision?.risks || [];

  if (verdict === 'PASS') {
    concerns.push('The AI verdict is PASS, meaning the current risk/reward profile does not justify investment.');
  } else if (verdict === 'WATCH') {
    concerns.push('The AI verdict is WATCH, meaning the case is not strong enough for immediate investment.');
  }

  risks.slice(0, 4).forEach((risk) => concerns.push(risk));

  const confidence = Number(result?.decision?.confidence || 0);
  if (confidence < 60) {
    concerns.push('Low confidence score suggests the investment case has mixed or incomplete supporting signals.');
  }

  const momentum = Number(result?.structuredFinancials?.priceChangePercent || 0);
  if (momentum < 0) {
    concerns.push('Recent price momentum is negative, which may indicate weaker market sentiment or near-term pressure.');
  }

  if (concerns.length === 0) {
    concerns.push('No major blocking issue was detected, but valuation, execution risk, and market volatility should still be reviewed before investing.');
  }

  return concerns.slice(0, 5);
}

function getFinancialRedFlags(result) {
  const flags = [];
  const financials = result?.structuredFinancials || {};
  const peRatio = Number(financials.peRatio || 0);
  const momentum = Number(financials.priceChangePercent || 0);

  if (peRatio > 45) {
    flags.push(`High P/E ratio of ${peRatio} may imply valuation risk if growth slows.`);
  } else if (peRatio > 0) {
    flags.push(`P/E ratio is ${peRatio}; compare it with sector peers before paying for growth.`);
  } else {
    flags.push('P/E ratio is unavailable, so valuation quality needs manual review.');
  }

  if (momentum < 0) {
    flags.push(`Price change is ${momentum}%, showing negative near-term momentum.`);
  } else {
    flags.push(`Price change is ${momentum}%; confirm whether momentum is supported by fundamentals.`);
  }

  if (!financials.marketCap) {
    flags.push('Market-cap data is unavailable, limiting size and liquidity assessment.');
  }

  if (!financials.price) {
    flags.push('Current price data is unavailable, so the comparison may miss live market context.');
  }

  return flags.slice(0, 4);
}

function summarizeReasoning(text) {
  if (!text) {
    return 'The agent did not return detailed reasoning for this company. Review the risks and financial signals before making a decision.';
  }

  const cleaned = String(text).replace(/\s+/g, ' ').trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(0, 2).join(' ') || cleaned.slice(0, 260);
}

function verdictClass(verdict) {
  if (verdict === 'INVEST') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (verdict === 'PASS') return 'border-rose-200 bg-rose-50 text-rose-800';
  return 'border-teal-200 bg-teal-50 text-teal-800';
}

export default ComparePage;
