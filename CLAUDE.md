# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend
```bash
cd QuickTip
source backend/venv/bin/activate
uvicorn backend.main:app --reload --port 8000
```
Requires Ollama running (`ollama serve`) when using `LLM_PROVIDER=ollama`, or `ANTHROPIC_API_KEY` set when using `LLM_PROVIDER=anthropic`.

### Frontend
```bash
cd frontend
npm run dev        # dev server on port 5173, proxies /api to localhost:8000
npm run build      # production build
npm run lint       # ESLint
```

### Dependencies
- Backend: `pip install -r backend/requirements.txt` (into `backend/venv`)
- Frontend: `npm install` (from `frontend/`)

## Architecture

**QuickTip** is an NBA GM Copilot — a chat-based AI assistant for NBA front office tasks (contracts, trades, cap analysis, stats).

### Backend (FastAPI + asyncpg + LLM)

The request flow is: `POST /api/chat` (SSE) → `OrchestratorAgent` → specialist agent → tool-calling loop → streamed response.

- **`backend/routers/chat.py`** — SSE streaming endpoint. Creates an `OrchestratorAgent` per request.
- **`backend/routers/data.py`** — Direct REST endpoints (no LLM): `/api/team/{abbr}/cap-sheet`, `/api/player/{name}/profile`, `/api/team/{abbr}/roster`.
- **`backend/agents/orchestrator.py`** — Routes messages to specialists via regex keyword matching (`classify_intent`). Falls back to `StatAnalystAgent`. Emits a `routing` SSE event before delegating.
- **`backend/agents/base_agent.py`** — Tool-calling loop shared by all agents. Runs up to `MAX_TOOL_ROUNDS=5` LLM↔tool cycles. Handles both OpenAI and Anthropic message formats for tool results.
- **`backend/agents/specialists.py`** — 5 specialist agents (Contract, Trade, Roster, CBA, StatAnalyst), each with a system prompt and a subset of available tools.
- **`backend/agents/llm_client.py`** — LLM abstraction. Supports Ollama (via OpenAI SDK) and Anthropic Claude. Provider selected by `LLM_PROVIDER` env var. Both paths yield a unified event stream (`text_delta`, `tool_call`, `done`).
- **`backend/tools/registry.py`** — Central registry mapping 12 tool names to functions + OpenAI function-calling JSON schemas. `get_openai_tools_schema()` and `get_tool_function()` are the public API.
- **`backend/tools/`** — 5 tool modules: `contract_tools.py`, `stat_tools.py`, `roster_tools.py` (all DB-backed via asyncpg), `cba_tools.py` (pure Python CBA rules), `trade_tools.py` (composes contract + CBA tools).
- **`backend/db/pool.py`** — asyncpg connection pool. Initialized in FastAPI lifespan. Uses `BDL_POSTGRES` env var.

### Frontend (Vite + React 19 + Tailwind CSS v4)

- **`frontend/src/hooks/useChat.js`** — Core SSE consumer. Manages message state, parses `text_delta`/`tool_call`/`tool_result`/`done` events from the stream. Handles abort and error states.
- **`frontend/src/App.jsx`** — Main layout: Sidebar + chat messages + input. Includes `WelcomeScreen` with starter prompts.
- **`frontend/src/components/`** — `ChatMessage.jsx`, `ChatInput.jsx`, `ToolCallCard.jsx`, `CapSheetCard.jsx`, `Sidebar.jsx`.
- **`frontend/src/components/ToolResultVisualization.jsx`** — Maps tool names to visualization components. Source of truth for which tool gets which chart/card.
- **`frontend/src/components/visualizations/`** — 11 Recharts visualization components + shared `ChartCard.jsx` wrapper. Components: `ContractTimelineChart`, `TeamPayrollChart`, `PlayerRadarChart`, `CareerTrajectoryChart`, `StatLeadersChart`, `RosterCard`, `PlayerProfileCard`, `CapInfoCard`, `SalaryMatchCard`, `ExceptionsCard`, `TradeAnalysisCard`.
- **`frontend/src/VisualizationTestPage.jsx`** — Standalone fixture page rendering all 11 components with hardcoded data. Accessed via `?test=viz` query param (lazy-loaded, not in production bundle).
- Vite proxies `/api` to `http://localhost:8000` (configured in `vite.config.js`).

## Database Schema (Read-Only Render PostgreSQL)

The DB is a BDL sports database. Key gotchas:

- **`contracts`** table: has `cap_hit`, `base_salary`, `total_cash` columns — NO `guaranteed` column. Has `team_id` directly. Current season = **2025**. Future contracts exist up to 2030.
- **`season_averages`**: JSONB column is `stats` (not `data`). Has `season_type` and `type` columns.
- **`leaders`**: uses `stat_type` (not `stat_name`) and `value` (not `stat_value`). Valid stat_types: ast, blk, dreb, eff, fg3a, fg3m, fg3_pct, fga, fgm, fg_pct, fta, ftm, ft_pct, min, oreb, pts, reb, stl, tov.
- **`players`** table is multi-sport — always join with `contracts` (season=2025) to filter to current NBA players.

## Environment Variables (.env at project root)

- `BDL_POSTGRES` — PostgreSQL connection string (required)
- `LLM_PROVIDER` — `ollama` (default) or `anthropic`
- `OLLAMA_MODEL` — Ollama model name (default: `qwen3:30b-a3b`)
- `ANTHROPIC_MODEL` — Claude model (default: `claude-sonnet-4-20250514`)
- `ANTHROPIC_API_KEY` — required when `LLM_PROVIDER=anthropic`

## SSE Event Protocol

The chat endpoint streams these event types:
- `routing` — which specialist agent was selected
- `text_delta` — incremental text from the LLM
- `tool_call` — agent invoking a tool (name + arguments)
- `tool_result` — tool execution result
- `done` — stream complete

## Adding New Tools

1. Create the async function in the appropriate `backend/tools/*_tools.py` module
2. Register it in `backend/tools/registry.py` with name, description, and JSON Schema parameters
3. Add the tool name to the relevant specialist agent's `available_tools` list in `backend/agents/specialists.py`

## Visualization Test Page

Visit `http://localhost:5173?test=viz` to render all 11 visualization components with fixture data (no backend needed). Useful for verifying chart rendering after changes.

## Claude Code Skills

- **`/e2e-test`** (`.claude/skills/e2e-test.md`) — Automates visual verification of all visualizations. Supports `mode=fixtures|live|full` and `capture=screenshot|gif`. Screenshots saved to `docs/screenshots/`.
