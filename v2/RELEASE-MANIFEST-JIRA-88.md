# JIRA-88 Release Manifest — Architecture Re-platform (Phase 1)

**Date:** 2026-06-18
**Status:** Phase 1 shipped — gateway + Strategy I live; Strategies II–VIII scaffolded as stubs.

## What shipped

**Backend** (`/v2/backend/`, Node.js + Express, ESM, separate microservice per strategy):
- `gateway/` — owns shared cross-strategy state (tax settings, inflation rate, compare-drawer scenarios) and proxies `/api/strategies/:id/*` to the matching strategy service. Returns `503` with a hint if a downstream service is unreachable, without crashing.
- `services/strategy-1-etf/` — Strategy I (Invest in ETFs) fully ported. `calc.js` is a faithful, pure-function port of the legacy `simulate()` math from `index.html`. Verified byte-for-byte behavior via direct curl tests.
- `services/{mortgage-etf, super, property, precious-metals, dca, meme, voo500}/` — scaffolded with a `501 Not Implemented` stub and a `PORT-TODO.md` describing exactly what to lift from `index.html` for that strategy.

**Frontend** (`/v2/frontend/`, React 18 + Vite + react-router-dom):
- Single SPA, talks only to the gateway (never directly to a strategy service) via `src/shared/api.js`.
- `SharedStateContext` replaces the legacy global JS variables (`window._taxSettings`, `getBase().inf`, compare-drawer state) with an explicit, fetchable/patchable React context.
- `Layout.jsx` — sidebar nav across all 8 strategies, flags Strategy I as live and the rest as stubs.
- `StrategyIPage.jsx` — fully wired: timeline/fund/lump-sum inputs, calls the gateway, renders results table.
- `StubStrategyPage.jsx` — generic placeholder for unported strategies pointing to that service's `PORT-TODO.md`.

`index.html` (the original legacy app) was **not touched** — this work happened entirely in parallel under `/v2/`.

## QA verification performed

| Check | Result |
|---|---|
| Gateway boots, `/health` responds | ✅ `{"ok":true,"service":"gateway"}` |
| Strategy I service boots on :4001 | ✅ |
| `PATCH /api/shared-state/inflation` → reflected in `GET /api/shared-state` | ✅ `0.05` persisted |
| Strategy I round-trip via gateway proxy returns real numbers (not `NaN`/`null`) | ✅ after fixing a field-naming bug (see below) |
| Graceful degradation: unimplemented strategy → `503`, gateway stays healthy after | ✅ |
| Frontend builds clean (`vite build`) | ✅ 38 modules, no errors |

### Bugs found and fixed during QA

1. **Field-name mismatch (frontend ↔ calc engine).** `StrategyIPage.jsx`'s fund objects used `{name, monthly, growth}`; `calc.js`'s ported `simulate()` contract requires `{sym, dca, rate}`. Silently produced `NaN`/`null` throughout the simulation with no thrown error. Fixed by aligning the frontend's state shape, update handlers, and table rendering to the documented contract, with an inline comment warning against renaming either side independently.
2. **`wdraw`/`winc` semantically swapped in the UI.** Defaults (`wdraw: 4`, `winc: 50000`) and labels ("Withdraw rate %", "Annual income need $") were inverted relative to `calc.js`'s contract (`wdraw` = starting *monthly* withdrawal $ amount; `winc` = annual increase *rate* as a decimal). This caused `regFlow` to blow up to `-2.86e+114` in later withdrawal years. Fixed defaults to `wdraw: 4000`, `winc: 0.03` and relabeled the fields to "Starting monthly withdrawal $" / "Withdrawal increase/yr %". Re-verified: last-year `regFlow` is now a sane `-97,574`.

## Migration roadmap — Strategies II–VIII

Each remaining strategy follows the same three-step pattern used for Strategy I:

1. **Port the math** — copy the relevant pure calculation logic out of `index.html` into that service's `calc.js`, documenting the exact parameter contract (names, units, decimal-vs-percent) the way Strategy I's was documented. The `wdraw`/`winc` bug above shows why this documentation step matters — it's what let QA catch the mismatch quickly.
2. **Wire the service** — replace the `501` stub in `services/<name>/index.js` with a route calling `calc.js`, following Strategy I's `index.js` as a template.
3. **Build the page** — replace that strategy's `StubStrategyPage` route in `App.jsx` with a real `<StrategyXPage />`, reusing `SharedStateContext` for any cross-strategy values (tax settings, inflation, compare-drawer) instead of reintroducing globals.

Suggested order (by legacy complexity / dependency):
1. **VI — DCA vs Timing the Market** (self-contained, no cross-strategy links)
2. **VII — Fastest Path to Billionaire (meme)** (self-contained)
3. **V — Precious Metals Portfolio** (self-contained)
4. **VIII — VOO vs V500 on Stake** (uses fund picker, shares logic with Strategy I)
5. **II — Mortgage & ETF Investment** (depends on Strategy I's ETF growth math)
6. **III — Super Salary Sacrifice** (Australian super rules, most domain-specific)
7. **IV — High Touch Property** (most complex, multiple sub-scenarios)

Each strategy's `PORT-TODO.md` (already scaffolded in its service directory) should be filled in with the specific section(s) of the legacy `index.html` to extract before that strategy's port begins.

## Outstanding / not in this phase

- No containerization yet (deployment is local-only by design for this phase).
- No automated test suite — verification so far is manual curl + build checks. Recommend adding unit tests for each `calc.js` against known-good outputs from the legacy app before porting strategy II onward, given how easily a field-naming or semantic-swap bug slipped through here.
- Compare-drawer and tax-settings UI panels exist in the shared state model but have no dedicated frontend controls yet — only Strategy I consumes `inflation.rate` so far.
