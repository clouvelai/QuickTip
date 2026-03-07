# NBA GM Copilot — MVP Implementation Plan

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        REACT FRONTEND                            │
│  Vite + React + Tailwind · War Room dark theme                   │
│  SSE consumer · Streaming text · Tool call cards                 │
└────────────────────────┬─────────────────────────────────────────┘
                         │ POST /api/chat (SSE)
                         │ GET /api/team/:id/cap-sheet
                         │ GET /api/player/:id/profile
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                             │
│  main.py · CORS · SSE streaming · Pydantic models               │
├──────────────────────────────────────────────────────────────────┤
│  ORCHESTRATOR AGENT                                              │
│  Intent classification → route to specialist(s) → synthesize     │
├──────────┬──────────┬──────────┬──────────┬──────────────────────┤
│ Contract │  Trade   │  Roster  │   CBA    │   Stat Analyst       │
│  Agent   │  Agent   │  Agent   │  Agent   │   Agent              │
├──────────┴──────────┴──────────┴──────────┴──────────────────────┤
│  TOOL LAYER  (Python functions → SQL → JSON)                     │
│  contract_tools · trade_tools · roster_tools · cba_tools · stats │
├──────────────────────────────────────────────────────────────────┤
│  DB CONNECTION LAYER  (asyncpg pool)                             │
└────────────────────────┬─────────────────────────────────────────┘
                         │ Read-only connection
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  BDL POSTGRES (Render)                                           │
│  players · teams · games · player_stats · season_averages        │
│  contracts · contract_aggregate · advanced_stats · standings      │
│  leaders · player_injuries · game_lineups · betting_odds         │
│  player_game_advanced_stats · team_season_stats                  │
└──────────────────────────────────────────────────────────────────┘
```

## Real Data Available (no mocking needed!)

| Table | Rows | Key Fields |
|-------|------|------------|
| players | 5,529 | name, position, team_id, draft_year, active |
| teams | 45 | abbreviation, city, name, conference, division |
| games | 73,085 | date, season, scores, postseason |
| player_stats | 2,829,473 | per-game box scores (pts, reb, ast, etc.) |
| season_averages | 522,403 | JSONB with 47 stat types per season |
| contracts | 7,417 | per-season cap_hit, base_salary |
| contract_aggregate | 6,621 | contract_type, total_value, signed_using, years |
| advanced_stats | 935,182 | off/def rating, usage, pace, PIE |
| player_game_advanced_stats | 1,612,063 | 123 cols of tracking/hustle/shooting |
| standings | 1,484 | wins, losses, conf/div rank |
| leaders | 305,964 | stat leaders by season |
| player_injuries | 110 | current injuries |

## CBA Rules (encoded in Python, not DB)

Hardcode 2024-25 salary cap values:
- Salary cap: $140,588,000
- Luxury tax: $170,814,000
- First apron: $178,132,000
- Second apron: $188,931,000
- MLE (non-tax): $12,863,000
- MLE (tax): $5,175,000
- BAE: $4,416,000
- Rookie minimum: $1,157,153
- Vet minimum: varies by years of service

Trade salary matching:
- Under cap: can absorb salary into cap space
- Over cap: 125% + $100K of outgoing salary (if outgoing < $7.5M)
- Over cap: 100% + $7.5M (if outgoing $7.5M-$29.5M)
- Over cap: 100% + $12.5M (if outgoing > $29.5M)

## Build Phases

### Phase 0: Scaffolding (parallel)
- Backend: FastAPI project, asyncpg pool, .env config
- Frontend: Vite + React + Tailwind, War Room theme, layout shell

### Phase 1: Data + Tools
- DB query functions (parameterized, composable)
- Contract tools, stat tools, roster tools, CBA tools, trade tools
- Tool registry for Anthropic tool_use format

### Phase 2: Agents
- Base agent class (streaming, tool execution)
- 5 specialist agents with system prompts
- Orchestrator with intent classification

### Phase 3: API Routes
- POST /api/chat with SSE streaming
- GET /api/team/:id/cap-sheet
- GET /api/player/:id/profile
- POST /api/trade/analyze

### Phase 4: Frontend Integration
- SSE consumer hook
- Streaming text renderer
- Tool call transparency cards
- Structured response cards (contract, trade, cap sheet)
- Command palette

### Phase 5: Polish + UAT
- Error handling, loading states
- Visual polish
- Browser-based UAT tests
