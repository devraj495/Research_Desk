import { useState } from 'react';
import Footer from '../components/Footer.jsx';
import Navbar from '../components/Navbar.jsx';

const FEATURE_CARDS = [
  ['Company Analysis', 'Business model, competitive position, and operating momentum in one concise brief.'],
  ['Financial Metrics', 'Revenue quality, valuation context, profitability, and market-cap signals.'],
  ['News Sentiment', 'Recent coverage summarized into actionable positives, negatives, and watch items.'],
  ['SWOT Analysis', 'Strengths, weaknesses, opportunities, and threats organized for fast review.'],
  ['Risk Assessment', 'Key downside scenarios, uncertainty drivers, and confidence checks.'],
  ['AI Recommendation', 'A clear invest, watch, or pass view with reasoning and supporting evidence.'],
];

const WORKFLOW_STEPS = [
  ['01', 'Enter a company name or ticker'],
  ['02', 'The agent gathers financial and news signals'],
  ['03', 'AI synthesizes risks, metrics, and market context'],
  ['04', 'Review a recommendation-ready research report'],
];

function LandingPage({ onNavigate, user, onLogout }) {
  const [query, setQuery] = useState('');

  function openResearch() {
    const target = query.trim();
    if (target) {
      window.localStorage.setItem('pendingResearchCompany', target);
    }
    onNavigate('/research');
  }

  function viewSampleReport() {
    document.getElementById('dashboard-preview')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] px-4 py-4 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-14">
        <Navbar currentPath="/" onNavigate={onNavigate} user={user} onLogout={onLogout} />

        <section className="grid min-h-[calc(100vh-120px)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-5 inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              Financial AI research platform
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              AI Investment Research Agent
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Generate institutional-style company research with financial metrics, news sentiment, risk analysis, and AI-backed investment recommendations.
            </p>

            <form
              className="mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.7)] sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                openResearch();
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search company or ticker, e.g. AAPL, Nvidia, HDFC Bank"
                className="min-h-12 flex-1 rounded-xl border border-transparent bg-slate-50 px-4 text-sm font-medium text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
              <button
                type="submit"
                className="min-h-12 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Start Research
              </button>
            </form>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={viewSampleReport}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-800"
              >
                View Sample Report
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/compare')}
                className="rounded-xl px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Compare Companies
              </button>
            </div>
          </div>

          <div id="dashboard-preview" className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_30px_90px_-45px_rgba(15,23,42,0.75)]">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Dashboard Preview</p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">NVDA Research Snapshot</h2>
              </div>
              <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-800">Score 86</div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                ['Revenue Growth', '+42%', 'text-emerald-700'],
                ['Risk Level', 'Medium', 'text-slate-700'],
                ['Recommendation', 'Invest', 'text-emerald-700'],
              ].map(([label, value, tone]) => (
                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
                  <p className={`mt-2 text-2xl font-black ${tone}`}>{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-950 p-5 text-white">
              <div className="flex h-44 items-end gap-3">
                {[42, 58, 47, 70, 63, 84, 76, 92, 88].map((height, index) => (
                  <div key={index} className="flex flex-1 items-end rounded-full bg-white/10">
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-emerald-500 to-teal-300 transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                AI insight: accelerating revenue quality and durable demand support a positive outlook, while valuation risk requires disciplined position sizing.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_CARDS.map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70">
              <div className="mb-5 h-1.5 w-12 rounded-full bg-emerald-500" />
              <h3 className="text-lg font-black text-slate-950">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </section>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">How it works</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">From ticker to investment brief in minutes.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {WORKFLOW_STEPS.map(([number, title]) => (
              <div key={number} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-black text-emerald-700">{number}</p>
                <p className="mt-4 text-base font-bold leading-6 text-slate-900">{title}</p>
              </div>
            ))}
          </div>
        </section>

        <Footer onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default LandingPage;
