# PORT-TODO — Strategy III — Super Salary Sacrifice

**Status:** stub (returns `501 Not Implemented` for all requests)
**Port:** 4003
**Internal key in index.html:** `super`

## What to port

Search index.html for 'superSection' / Strategy III markers and suInit(). Self-contained — JIRA-88.3.

## How to port it (same pattern as strategy-1-etf)

1. Open `/Users/ganregmi/Documents/Claude/Investment/index.html` and find this strategy's
   calculation function(s) — they sit alongside their section's markup/JS block.
2. Identify what currently comes from DOM reads (`g('...').value`) or global arrays —
   those become parameters of a pure function in a new `calc.js` here, exactly like
   `strategy-1-etf/calc.js` did for `getBase()`/`simulate()`.
3. Wire that pure function into `index.js` behind a `POST /<action>` endpoint
   (replace the current catch-all 501 handler).
4. If this strategy reads shared state (tax settings, inflation rate, or another
   strategy's data — see the cross-strategy coupling notes in
   `/Users/ganregmi/Documents/Claude/Investment/releases/JIRA-88-architecture-redesign.md`),
   fetch it from the gateway (`GET http://localhost:4000/api/shared-state`)
   instead of reaching into another strategy's service directly.
5. Add a `test/calc.test.js` sanity check (see strategy-1-etf's for the pattern).
6. Update this service's status to `live` in `/v2/backend/gateway/index.js`'s
   `STRATEGIES` map once it's working end to end.

## Migration roadmap reference

See `/Users/ganregmi/Documents/Claude/Investment/releases/JIRA-88-architecture-redesign.md`
for which JIRA-88.x sub-ticket this strategy is scoped under.
