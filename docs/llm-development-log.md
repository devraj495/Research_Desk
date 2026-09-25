# LLM-assisted development log

This is a concise technical decision log, not a fabricated raw chat transcript.
It records real implementation decisions made while building the project. Before
submission, add your own exported chat transcript if available, remove anything
you cannot explain, and never include API keys, `.env` files, passwords, or
personal information.

## 1. Agent workflow design

**Question explored:** Should research, the recommendation, and quality control
be one LLM call or separate steps?

**Decision:** Use five LangGraph nodes: news research, financial research,
synthesis, decision, and critique.

**Reasoning:** Search produces noisy material. A synthesis step gives the
decision node a smaller, source-labelled brief. A separate critique node has a
different objective—checking support and confidence—so it is less likely to
simply repeat the original recommendation.

## 2. Structured output

**Question explored:** How should the frontend safely render a model verdict?

**Decision:** Define Zod schemas for the decision and critique results and use
LangChain structured output.

**Reasoning:** The UI expects verdict, confidence, factors, and risks in stable
fields. Schema validation is more reliable than trying to parse model prose.

## 3. Financial provider failure investigation

**Observation:** A search for Capgemini did not return structured financial
data.

**Investigation:** The code called Financial Modeling Prep's legacy
`/api/v3/search` endpoint. A live response returned HTTP 403 and stated that
the legacy endpoint was no longer supported for the configured account.

**Decision:** Migrate to FMP Stable endpoints:

- `search-name?query=...` for company-to-ticker resolution
- `profile?symbol=...` for company data
- `quote?symbol=...` only as an optional enhancement

**Verification:** The stable name search returned Capgemini SE with ticker
`CAP.PA` on Euronext Paris. The stable profile endpoint returned data for that
ticker. The quote endpoint was unavailable on the current subscription, so the
implementation keeps the profile result instead of discarding all structured
data.

## 4. User experience decisions

**Decision:** Expose the agent's human-readable `steps` trace in the result
instead of returning only the verdict.

**Reasoning:** This helps a user understand what the system did and makes
provider/data gaps visible. It also makes the orchestration easier to explain
in an interview.

## 5. Scope deliberately left out

I did not add real-time streaming, a portfolio/watchlist, or multi-provider
model routing in the initial version. Those features would increase surface area
without improving the central research-to-critique workflow enough for this
take-home assignment.

## 6. Authentication hardening

**Observation:** The initial demonstration login stored passwords directly in
MongoDB and the frontend assumed the backend was always running on localhost.

**Decision:** Hash newly created passwords with Node's built-in `scrypt` and
migrate legacy local accounts after their next valid login. Configure the
frontend backend URL through environment variables rather than a hardcoded
local address.

**Remaining production work:** The token is still a lightweight demo token.
Server-verified sessions, rate limiting, and email verification would be added
before a public launch.
