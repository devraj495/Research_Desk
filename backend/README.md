# Backend - Investment Research Agent

Node.js/Express server powering the investment research agent.

## Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Then update `.env` with your keys:
```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_API_KEY=your_key_here
FMP_API_KEY=your_key_here
MONGO_URI=mongodb+srv://username:password@cluster.xxx.mongodb.net/researchdesk
PORT=3001
```

3. Start development server:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

## Architecture

### Key Files
- `server.js` - Express app setup and auth endpoints
- `lib/agent/graph.js` - LangGraph orchestration
- `lib/agent/nodes/` - Research agent nodes (news, financials, synthesis, decision, critique)
- `lib/agent/tools/` - External integrations (web search, financial data, LLM)

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

#### Research
- `POST /api/research` - Run investment research agent

### Agent Flow

```
START → research_news → research_financials → synthesize → decide → critique → END
```

1. **research_news** - Searches recent news using Tavily
2. **research_financials** - Fetches financial data + additional search context
3. **synthesize** - LLM call synthesizing both into research brief
4. **decide** - LLM call returning structured verdict (INVEST/PASS/WATCH)
5. **critique** - Self-check node validating confidence and reasoning

## Dependencies

- **Express** - Web framework
- **LangGraph.js** - Agent orchestration
- **LangChain** - LLM framework
- **MongoDB** - User persistence
- **Tavily** - Web search
- **Financial Modeling Prep** - Market data
- **Groq** - Language models through an OpenAI-compatible API

## Development

Watch mode automatically restarts server on file changes:
```bash
npm run dev
```

## Troubleshooting

**MongoDB connection error?**
- Verify `MONGO_URI` in `.env`
- Check MongoDB Atlas network access settings
- Ensure database user credentials are correct

**Missing package errors?**
```bash
npm install --legacy-peer-deps
```

**Port already in use?**
Change `PORT` in `.env` or kill existing process on port 3001
