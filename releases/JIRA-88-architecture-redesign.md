# JIRA-88 — Investment Planner: Backend/Frontend Architecture Redesign

**Status:** 🟡 In progress — Phase 1 (scaffold + Strategy I reference port) shipped. Phases 2–4 (remaining 7 strategies) pending.
**Component:** Global / Platform
**Story points:** 21 (epic-sized — split into phased sub-tickets below)

## User story
As the developer and sole maintainer of the Investment Planner, I want the app split into an independent backend and frontend, with each of the 9 strategies developable as its own module, so that I can change or extend one strategy without risking regressions in the other eight, and so the codebase stops being a single 12,357-line HTML file.

## Decisions (confirmed with user)
| Decision | Choice | Why |
|---|---|---|
| Backend stack | **Node.js + Express** | Existing calculation logic is vanilla JS — porting to Node keeps the math identical (no JS→Python translation risk) and lets each strategy module run standalone. |
| Strategy structure | **Separate microservice per strategy** | User explicitly chose this over a modular monolith — each strategy gets its own deployable Express app on its own port, callable independently. |
| Frontend | **React SPA** | One component tree per strategy; matches the "develop independently" goal directly. |
| Deployment | **Local only, for now** | Runs via `npm run dev` per service; no containers/cloud required yet. Structure still keeps each service self-contained so Dockerizing later is a thin wrapper, not a rewrite. |
| Cross-strategy connection | **Gateway service** (`/v2/backend/gateway`) | Owns the three pieces of state that currently leak across strategies in `index.html` — tax settings (`_taxSettings`), the inflation toggle (`getBase().inf`, referenced directly by Strategy IV), and the Scenario Compare Drawer. Strategies never talk to each other directly; they read/write shared state through the gateway, and the gateway proxies strategy-specific calculation calls to the right microservice. |

## Acceptance criteria
- AC1: Given the gateway is running, when the frontend requests `/api/shared-state`, then it returns the current tax settings, inflation rate, and compare-drawer snapshots — the same three things currently held in global JS variables in `index.html`.
- AC2: Given Strategy I's microservice is running, when the frontend submits fund/DCA/lump-sum inputs to `/api/strategies/etf/simulate`, then the response matches the existing `simulate()` function's output shape (`{data, dcaYrs, coast, wYrs, TOTAL, totalDCApm, wdraw, winc, N}`) for the same inputs.
- AC3: Given a strategy microservice is down, the gateway and other strategies continue to function — proves strategies are decoupled, not silently re-coupled through a shared process.
- AC4: Each of the 9 strategies has its own folder under `/v2/backend/services/` and `/v2/frontend/src/strategies/` that can be edited, tested, and (eventually) deployed without touching another strategy's folder.
- AC5: The existing single-file `index.html` app is left completely untouched — this is new, parallel work under `/v2/`, not a migration that breaks the current app.

## Out of scope (this phase)
- Porting the calculation logic for Strategies II–IX (Mortgage&ETF, Super, Property, Precious Metals, DCA, Meme, VOO500). These are scaffolded as stub services that return `501 Not Implemented` with a `PORT-TODO.md` describing exactly what to lift from `index.html` and which lines to reference.
- Authentication, persistence/database, containerization, cloud deployment.
- Visual redesign of any strategy's UI (separate from this architecture change).
- Retiring or replacing the original `index.html` app — it keeps running as-is until v2 reaches feature parity.

## Architecture
```
/v2
 ├─ backend/
 │   ├─ gateway/                  (port 4000 — shared state + proxy)
 │   └─ services/
 │       ├─ strategy-1-etf/       (port 4001 — FULLY PORTED, reference impl)
 │       ├─ strategy-2-mortgage-etf/   (port 4002 — stub)
 │       ├─ strategy-3-super/         (port 4003 — stub)
 │       ├─ strategy-4-property/      (port 4004 — stub)
 │       ├─ strategy-5-precious-metals/ (port 4005 — stub)
 │       ├─ strategy-6-dca/           (port 4006 — stub)
 │       ├─ strategy-7-meme/          (port 4007 — stub)
 │       └─ strategy-8-voo500/        (port 4008 — stub)
 └─ frontend/
     └─ src/
         ├─ shared/   (SharedStateContext, api client, Layout/Nav)
         └─ strategies/
             ├─ StrategyI/   (FULLY WIRED to backend)
             └─ StrategyII…VIII/  (stub pages, "coming in next phase")
```

Each strategy service exposes a tiny, consistent contract: `GET /health`, plus its own calculation endpoint(s). The gateway is the only thing the frontend talks to directly (`/api/shared-state`, `/api/strategies/:id/*` → proxied). This mirrors how the original app shared state through globals (`window._taxSettings`, `getBase().inf`) but makes the sharing explicit and inspectable instead of implicit globals reached into from six different `<script>` blocks.

## Migration roadmap (sub-tickets)
- **JIRA-88.1** (this release): scaffold + gateway + Strategy I full port.
- **JIRA-88.2**: port Strategy IV (Property) + Strategy II (Mortgage&ETF) — these two are tightly coupled in `index.html` (Strategy II reads property settings from Strategy IV), so they should move together to preserve that link explicitly through the gateway instead of a direct DOM read.
- **JIRA-88.3**: port Strategy III (Super) and Strategy V (Precious Metals) — both self-contained, lower risk.
- **JIRA-88.4**: port Strategy VI (DCA), VII (Meme), VIII (VOO500) — lower priority, smaller calculation surfaces.
- **JIRA-88.5**: replace `index.html` reliance entirely, or keep both running in parallel — decision deferred until v2 reaches parity.
