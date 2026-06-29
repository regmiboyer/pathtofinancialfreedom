# Investment Planner v2 — Frontend

React (Vite) SPA. Talks only to the gateway (`/v2/backend/gateway`, default port 4000) —
never directly to a strategy microservice.

## Run

```bash
npm install
npm run dev   # http://localhost:5173, proxies /api -> http://localhost:4000
```

Requires the gateway (and, for full functionality, the strategy-1-etf service) running first —
see `/v2/backend/gateway/README.md`.

## Structure

- `src/shared/api.js` — API client, all requests go through the gateway.
- `src/shared/SharedStateContext.jsx` — tax settings / inflation / compare-drawer state,
  fetched from and synced to the gateway. Equivalent to the old global JS variables in
  `index.html`, but explicit and shared via React context instead of implicit globals.
- `src/shared/Layout.jsx` — nav listing all 8 strategies, flags which are live vs. stub.
- `src/strategies/StrategyI/StrategyIPage.jsx` — fully wired page for the one ported strategy.
- `src/shared/StubStrategyPage.jsx` — placeholder rendered for the 7 not-yet-ported strategies.

## Status

| Strategy | Status |
|---|---|
| I — Invest in ETFs | ✅ Live, fully wired to backend |
| II–VIII | 🚧 Stub page, backend returns 501 — see each service's `PORT-TODO.md` |
