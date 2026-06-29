# Gateway Service

Owns cross-strategy shared state and proxies strategy-specific calls to the right microservice.

## Run
```
npm install
npm run dev
```
Listens on `http://localhost:4000`.

## Endpoints
- `GET /health`
- `GET /api/strategies` — list all 8 strategies + their status (`live` / `stub`)
- `GET /api/shared-state` — current tax settings, inflation rate, compare-drawer scenarios
- `PATCH /api/shared-state/tax-settings`
- `PATCH /api/shared-state/inflation`
- `POST /api/shared-state/compare-drawer/scenarios`
- `DELETE /api/shared-state/compare-drawer/scenarios/:id`
- `* /api/strategies/:id/*` — proxied straight through to that strategy's microservice
