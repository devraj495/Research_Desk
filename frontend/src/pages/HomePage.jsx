import { useEffect, useRef, useState } from 'react';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

const EXAMPLE_COMPANIES = ['Zomato', 'Nvidia', 'Paytm'];
const TRACE_STEPS = [
  'Gathering news coverage…',
  'Pulling financial data + signals…',
  'Synthesizing research brief…',
  'Weighing the decision…',
  'Running a self-check on the verdict…',
];

const formatExecutiveSummary = (text) => {
  if (!text) return [];

  const cleaned = String(text)
    .replace(/\*\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return [];

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  const paragraphs = [];
  let current = '';

  sentences.forEach((sentence) => {
    if (!current) {
      current = sentence;
      return;
    }

    if (current.length + sentence.length < 220) {
      current += ` ${sentence}`;
    } else {
      paragraphs.push(current);
      current = sentence;
    }
  });

  if (current) paragraphs.push(current);

  return paragraphs.length > 0 ? paragraphs : [cleaned];
};

function HomePage({ apiUrl, onResearch, onNavigate, user, onLogout }) {
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const dossierRef = useRef(null);

  useEffect(() => {
    const pendingCompany = window.localStorage.getItem('pendingResearchCompany');
    if (pendingCompany) {
      setCompany(pendingCompany);
      window.localStorage.removeItem('pendingResearchCompany');
    }
  }, []);

  useEffect(() => {
    if (!loading) {
      setVisibleSteps([]);
      return;
    }

    let stepIdx = 0;
    setVisibleSteps([{ text: TRACE_STEPS[0], done: false }]);
    stepIdx = 1;

    const interval = window.setInterval(() => {
      if (stepIdx >= TRACE_STEPS.length) {
        window.clearInterval(interval);
        return;
      }

      setVisibleSteps((prev) => {
        const updated = prev.map((step, idx) =>
          idx === prev.length - 1 ? { ...step, done: true } : step
        );
        return [...updated, { text: TRACE_STEPS[stepIdx], done: false }];
      });
      stepIdx += 1;
    }, 800);

    return () => window.clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (result?.decision && dossierRef.current) {
      window.setTimeout(() => {
        dossierRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [result]);

  async function runAgent(name) {
    const target = (name ?? company).trim();
    if (!target) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: target }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Something went wrong.');
      } else {
        setResult(data);
        onResearch?.(data);
      }
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  const verdict = result?.decision?.verdict;

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <Navbar currentPath="/research" onNavigate={onNavigate} user={user} onLogout={onLogout} />
        {user && (
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Welcome back
              </div>
              <p className="mt-1 text-lg font-black text-slate-950">
                {user.name || 'Investor'}
              </p>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.('/profile')}
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              View profile
            </button>
          </section>
        )}
        <div className="max-w-3xl animate-[fadeIn_0.7s_ease-both]">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
            Research Desk / Automated Coverage
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
            Generate a decision-ready investment brief.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Enter a company name or ticker, and the agent reviews financial signals, market news, risk factors, and recommendation logic in one structured report.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.65)] sm:flex-row sm:items-center" id="terminal-input">
          <span className="text-lg font-black text-emerald-600">&gt;</span>
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && runAgent()}
            placeholder="Enter a company name, e.g. Zomato"
            disabled={loading}
            id="company-input"
            className="w-full border-none bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400 disabled:opacity-60"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAgent()}
              disabled={loading || !company.trim()}
              id="run-button"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Researching…' : 'Run research'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.('/compare')}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-800"
            >
              Compare companies
            </button>
          </div>
        </div>

        {!result && !loading && !error && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">
                try:
              </span>
              {EXAMPLE_COMPANIES.map((item) => (
                <span
                  key={item}
                  className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-800"
                  onClick={() => {
                    setCompany(item);
                    runAgent(item);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      setCompany(item);
                      runAgent(item);
                    }
                  }}
                  id={`chip-${item.toLowerCase()}`}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
              <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-emerald-50 p-3">
                <div className="h-full rounded-xl bg-gradient-to-t from-emerald-500 to-teal-300" />
              </div>
              <p>
                Type a company name above or pick an example to start your
                research.
              </p>
            </div>
          </>
        )}

        {loading && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2" id="loading-trace">
              {visibleSteps.map((step, index) => (
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-600" key={`${step.text}-${index}`}>
                  {step.done ? (
                    <span className="text-emerald-600">✓</span>
                  ) : (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
                  )}
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
            <div className="h-0.5 w-full animate-pulse rounded-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700" id="error-display">
            {error}
          </div>
        )}

        {result?.decision && (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-slate-800 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.8)] sm:p-8" ref={dossierRef} id="dossier">
            <div className={`mb-6 inline-flex items-center rounded-full border px-4 py-2 font-mono text-sm font-semibold uppercase tracking-[0.2em] ${verdict === 'INVEST' ? 'border-emerald-500/40 bg-emerald-50 text-emerald-700' : verdict === 'PASS' ? 'border-rose-500/40 bg-rose-50 text-rose-700' : 'border-amber-500/40 bg-amber-50 text-amber-700'}`}>
              {verdict}
            </div>

            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Coverage initiated · {result.companyName}
            </div>
            <h2 className="text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              {result.decision.summary}
            </h2>

            {result.structuredFinancials && (
              <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-slate-300 pb-4 font-mono text-sm text-slate-600">
                <span className="rounded bg-slate-200 px-2 py-1 font-semibold text-slate-900">
                  {result.structuredFinancials.ticker}
                </span>
                {result.structuredFinancials.price && (
                  <span>
                    ${result.structuredFinancials.price}{' '}
                    <span className={result.structuredFinancials.priceChangePercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      ({result.structuredFinancials.priceChangePercent}%)
                    </span>
                  </span>
                )}
                {result.structuredFinancials.peRatio && (
                  <span>P/E {result.structuredFinancials.peRatio}</span>
                )}
                {result.structuredFinancials.marketCap && (
                  <span>Mkt Cap {formatLargeNumber(result.structuredFinancials.marketCap)}</span>
                )}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 font-mono text-sm text-slate-600">
              <span>Confidence {result.decision.confidence}%</span>
              <div className="flex gap-1" style={{ color: colorFor(verdict) }}>
                {Array.from({ length: 20 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-3.5 w-1.5 rounded-sm ${index < Math.round(result.decision.confidence / 5) ? 'bg-current' : 'bg-slate-300'}`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  Executive summary
                </div>
                <div className="space-y-3 text-base leading-8 text-slate-700">
                  {formatExecutiveSummary(result.analysis).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                  Why it matters
                </div>
                <div className="space-y-3 text-sm leading-7 text-slate-700">
                  <p>• The takeaway is framed around the strongest recent signals.</p>
                  <p>• Confidence is set at {result.decision.confidence}%.</p>
                  <p>• The sections below help turn the update into a fast decision brief.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Key factors
                </h3>
                <ul className="space-y-2 text-sm leading-7 text-slate-700">
                  {result.decision.keyFactors.map((factor, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-500" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Risks
                </h3>
                <ul className="space-y-2 text-sm leading-7 text-slate-700">
                  {result.decision.risks.map((risk, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm xl:col-span-3">
                <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Reasoning
                </h3>
                <div className="whitespace-pre-wrap text-sm leading-8 text-slate-700">
                  {result.decision.reasoning}
                </div>
              </div>

              {result.decision.critique && (
                <div className={`rounded-2xl border p-5 shadow-sm xl:col-span-3 ${result.decision.critique.consistent ? 'border-emerald-500/30 bg-emerald-50' : 'border-teal-500/30 bg-teal-50'}`}>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {result.decision.critique.consistent ? 'Self-check: passed' : 'Self-check: adjusted'}
                  </div>
                  <p className="text-sm leading-7 text-slate-700">{result.decision.critique.note}</p>
                  {result.decision.critique.issues?.length > 0 && (
                    <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                      {result.decision.critique.issues.map((issue, index) => (
                        <li key={index} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {result.steps?.length > 0 && (
              <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-sm" aria-label="Agent research trace">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                      Agent research trace
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      A transparent record of the LangGraph workflow used to produce this report.
                    </p>
                  </div>
                  {result.generatedAt && (
                    <span className="text-xs text-slate-400">Completed {formatTimestamp(result.generatedAt)}</span>
                  )}
                </div>
                <ol className="mt-5 grid gap-3 md:grid-cols-2">
                  {result.steps.map((step, index) => (
                    <li key={`${step}-${index}`} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-200">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-xs font-black text-emerald-300">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                Sources consulted
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  {result.sources.news.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                    >
                      <span className="mb-1 block font-semibold text-slate-900">{source.title}</span>
                      <span className="block text-xs text-slate-500">{extractDomain(source.url)}</span>
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  {result.sources.financials.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-200 bg-white/80 p-3 text-sm text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
                    >
                      <span className="mb-1 block font-semibold text-slate-900">{source.title}</span>
                      <span className="block text-xs text-slate-500">{extractDomain(source.url)}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

function formatLargeNumber(value) {
  if (!value) return '';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value}`;
}

function colorFor(verdict) {
  if (verdict === 'INVEST') return '#34d399';
  if (verdict === 'PASS') return '#f87171';
  return '#fbbf24';
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

function formatTimestamp(value) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default HomePage;
