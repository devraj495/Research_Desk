
# Investment Research Agent

An AI agent that takes a company name, researches it (news + financial signals),
and returns a decision — **INVEST / PASS / WATCH** — along with the key factors,
risks, and reasoning behind it.

## Overview

You type in a company name. The agent:

1. Searches recent news about the company.
2. Searches for financial/fundamental signals (revenue, earnings, funding, valuation).
3. Synthesizes both into a research brief, with claims tied back to specific sources.
4. Weighs that brief and commits to a verdict with a confidence score, key factors,
   and risks — returned as structured JSON, not free text, so the UI can render it
   reliably.

The frontend shows the verdict as a "dossier" — a research report with the decision
stamped on it — plus the sources it drew from, so the reasoning is visible, not a
black box.

## How to run it

```bash
# Install dependencies
npm install

# Configure environment
cp backend/.env.example backend/.env
# Then update backend/.env with your API keys and MongoDB URI

# Optional: configure the frontend to call a deployed backend
cp frontend/.env.example frontend/.env.local

# Start development servers
npm run dev
```

Open `http://localhost:5174` (frontend).

**Keys needed** (in `backend/.env`):

| Key | Where to get it | Notes |
|---|---|---|
| `GROQ_API_KEY` | console.groq.com | Powers the synthesis + decision nodes |
| `GROQ_MODEL` | — | Optional, defaults to `llama-3.3-70b-versatile` |
| `TAVILY_API_KEY` | tavily.com | Free tier available; powers the two search nodes |
| `FMP_API_KEY` | financialmodelingprep.com | Optional; structured financial data |
| `MONGO_URI` | mongodb.com/cloud | MongoDB Atlas connection string for auth |
| `PORT` | — | Optional, defaults to `3001` |

The frontend optionally accepts `VITE_BACKEND_URL` and `VITE_API_URL`. Set both
to the public backend URL when deploying frontend and backend separately.

### Deployment

Deploy the `backend` directory to any Node.js host (for example Render, Railway,
or a VM) and set the backend variables above there. Confirm the deployment with
`GET /api/health`. Deploy the `frontend` directory as a Vite static site and set
both frontend variables to the backend's public URL, for example:

```bash
VITE_BACKEND_URL=https://your-api.example.com
VITE_API_URL=https://your-api.example.com/api/research
```

Do not expose any `GROQ_API_KEY`, `TAVILY_API_KEY`, `FMP_API_KEY`, or
`MONGO_URI` as frontend environment variables.

### MongoDB Setup (for user authentication)
1. Create a free cluster at [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. Create a database user with username/password
3. Allow network access from your IP
4. Get the connection string: `mongodb+srv://username:password@cluster.xxx.mongodb.net/researchdesk?retryWrites=true&w=majority`
5. Add it to `backend/.env` as `MONGO_URI`

## How it works

The agent is a [LangGraph.js](https://langchain-ai.github.io/langgraphjs/) graph
with five nodes, laid out as:

```
lib/agent/
├── graph.js              # orchestration only — wires nodes into a StateGraph
├── nodes/
│   ├── researchNews.js
│   ├── researchFinancials.js
│   ├── synthesize.js
│   ├── decide.js         # + DecisionSchema (Zod)
│   └── critique.js       # + CritiqueSchema (Zod), the self-check node
└── tools/
    ├── webSearch.js       # Tavily wrapper
    ├── financialData.js   # Financial Modeling Prep wrapper
    └── llm.js             # model config (swap providers here only)
```

`graph.js` itself contains no business logic — it only defines the shared state
shape and the edges between nodes. Each node is a small, independently testable
function; each tool is a thin wrapper around one external dependency, so
swapping (e.g. Tavily → SerpAPI, or OpenAI → another provider) never touches
node logic.

```
START → research_news → research_financials → synthesize → decide → critique → END
```

- **research_news** — calls a web search tool (Tavily) for recent news.
- **research_financials** — runs two things **in parallel**: a structured
  fundamentals lookup (Financial Modeling Prep — ticker resolution → profile +
  optional quote, giving market cap, price, and other available fields) and a
  general web search for
  financial narrative/context. If the company has no public ticker (private
  company, startup), the structured lookup returns `null` and the agent falls
  back to search-derived signal only — this is a normal path, not an error.
- **synthesize** — one LLM call that reads the structured financials + both sets
  of search results and writes a structured research brief. Told explicitly to
  treat structured financials as ground truth over search snippets for hard
  numbers, and to cite which source (`[N1]`, `[F2]`, ...) backs each narrative
  claim.
- **decide** — a second LLM call, using `withStructuredOutput()` against a Zod
  schema (`verdict`, `confidence`, `summary`, `keyFactors`, `risks`,
  `reasoning`), so the response is guaranteed-shape JSON the frontend can render
  without parsing free text.
- **critique** — a self-check node, deliberately separate from `decide`. A
  second, independent LLM call re-reads the brief and the verdict and checks:
  does every factor/risk actually appear in the brief? Does the confidence match
  how solid the evidence really is? Is the verdict a stretch? It reports a
  (possibly lowered) final confidence plus any issues found. This exists so the
  agent doesn't just rubber-stamp its first pass as final — a second look with a
  different prompt/framing catches things the original call missed.

State (`AgentState` in `graph.js`) also accumulates a `steps` trace at each node —
this is what makes the agent's process inspectable rather than just its answer.

The Express API route (`backend/server.js`) validates input, runs the graph, and
shapes the response. All agent logic lives in `backend/lib/agent/`.

## Key decisions & trade-offs

- **research_news stays separate from research_financials** but the two
  financial lookups (structured API + search) run in parallel via
  `Promise.all` — they answer different questions (exact numbers vs.
  narrative), so there's no reason to serialize them. The three research
  paths (news, structured financials, financial search) *could* all fan out
  together for a bit more latency savings; I kept news separate mainly to
  keep the graph easy to reason about and explain.
- **Two-step synthesize → decide, instead of one LLM call.** Splitting "write the
  brief" from "make the call" forces the decision step to reason over a
  condensed, source-grounded brief rather than raw search noise, and makes each
  step independently debuggable/promptable.
- **A dedicated critique/self-check node after decide.** Rather than trusting
  the first verdict, a second independent LLM call re-checks it against the
  brief and can lower (never raise) confidence if it finds unsupported claims
  or a stretch conclusion. This is the single change I'd point to first if
  asked "what makes this agentic rather than just a prompt chain" — it's a
  genuine second pass with a different objective (audit, not decide).
- **Structured output via Zod, not prompt-engineered JSON**, for both the
  decision and the critique. Avoids the classic failure mode of an LLM
  wrapping JSON in prose or breaking schema under pressure —
  `withStructuredOutput()` enforces the shape at the API level.
- **Financial Modeling Prep for structured data, with automatic fallback.**
  Real numbers (market cap and price) beat search snippets for hard facts on
  public companies. The implementation uses FMP's current Stable endpoints and
  does not fail a report if an optional quote endpoint is unavailable on the
  configured plan or times out. Private companies and ambiguous names also fall back to
  search-derived signals, so the app remains useful beyond listed companies.
- **No research persistence / history.** Each run is stateless. Given more time I'd store
  past runs (Mongo, since that's my usual stack) so a user can revisit or compare
  past verdicts on the same company over time.
- **React + Express instead of a full-stack framework.** Keeping frontend and
  backend separate makes the API boundary and the LangGraph orchestration easy
  to inspect. The trade-off is two development processes rather than one.

## Example runs

The output is intentionally live: search results and recommendations can change
as news changes. Before submission, run the following companies locally and
paste the generated report screenshots or JSON into `docs/example-runs.md`:

| Company | Why it is useful for testing |
|---|---|
| NVIDIA | Clear public ticker and high volume of current news. |
| HDFC Bank | Tests an India-focused company query. |
| Capgemini | Tests international ticker resolution (`CAP.PA`, Euronext Paris). |

For each run, include the company name, timestamp, source links, verdict,
confidence, key factors, and risks. Do not present stale output as current data.

## What I'd improve with more time

- Parallelize `research_news` in with the other two research calls.
- Widen the critique node into a loop: if it flags real issues (not just lowers
  confidence), route back to `decide` for a revised verdict instead of only
  annotating the original one.
- Add a lightweight vector/embedding cache so re-researching the same company
  within a short window doesn't re-run every search + LLM call from scratch.
- Persist runs (MongoDB) so users can build a watchlist and see verdict history.
- Streaming: surface each node's `steps` entry to the UI live as it happens,
  instead of returning everything at once at the end.
- Add automated backend tests for provider failures, schema validation, and
  ticker resolution.
- Add durable, server-verified sessions and rate limiting before any production
  use. Passwords are hashed using Node's `scrypt`, but the current auth token is
  still intentionally a lightweight demo token.

## AI usage disclosure

Built with AI assistance throughout (as instructed/mandated by the assignment).
The curated technical decision log is in
[`docs/llm-development-log.md`](docs/llm-development-log.md). It intentionally
contains no credentials or private information. Add your own platform-exported
chat transcript alongside it if you want to claim the assignment's transcript
bonus; do not fabricate one.
# Research_Desk
