# JIRA-67 Release Manifest
**Released:** 2026-06-15  
**Agent pipeline:** PM → Developer → QA (pass, 0 bugs) → Release  
**Scope:** Per-fund allocation in One-Time Cash Events (Strategy I — ETF Planner)

---

## Feature: Fund-targeted lump invest events

### What changed for the user
Each "Add to Portfolio" event now lets you:
- Choose **which fund** to invest into (dropdown from your active portfolio)
- Add up to **5 fund allocations per event** — e.g. $20k → VOO and $15k → QQQM in the same year
- Add or remove individual allocations with + / ✕ buttons
- See a live **event total** as you type amounts
- See the **projected portfolio value** at that year in the header

Withdraw events are unchanged.

### Data model change
```js
// Before (no fund targeting)
{yr: 10, amt: 50000, type: 'invest'}

// After (per-fund allocations)
{yr: 10, type: 'invest', allocations: [
  {fundSym: 'VOO',  amt: 20000},
  {fundSym: 'QQQM', amt: 15000}
]}
```

Legacy format (no `allocations`) still works — distributed proportionally.

---

## Code changes

### CSS (lines ~135–153)
New classes: `.lie-event`, `.lie-hdr`, `.lie-yr-lbl`, `.lie-yr-in`, `.lie-of`, `.lie-pf`,
`.lie-del-evt`, `.lie-allocs`, `.lie-alloc-row`, `.lie-fund-sel`, `.lie-alloc-sep`,
`.lie-alloc-amt`, `.lie-del-alloc`, `.lie-add-alloc`, `.lie-total`  
Mobile: `font-size:max(16px,1em)` on `.lie-yr-in` and `.lie-alloc-amt`

### simulate() changes
- `lumpInByFund[yr][fundIdx]` map built from `allocations[]`  
- Simulation loop routes each allocation directly to `vals[fi]` instead of proportional spread

### renderLumps() — invest section rewritten
- `makeInvestCard(l)` replaces `makeRow(l, true)`
- Fund selector built from `funds` array via `fundOpts(selectedSym)`
- Inline `oninput`/`onchange`/`onclick` handlers call global helpers by `lumpSums` index

### New global helpers
| Function | Purpose |
|---|---|
| `window.lumpInvestSetYr(i, yr)` | Update event year |
| `window.lumpInvestDelEvent(i)` | Delete whole event |
| `window.lumpInvestSetFund(i, ai, sym)` | Change fund for allocation `ai` |
| `window.lumpInvestSetAmt(i, ai, amt)` | Change amount, live-updates event total |
| `window.lumpInvestAddAlloc(i)` | Add next unused fund allocation (max 5) |
| `window.lumpInvestDelAlloc(i, ai)` | Remove allocation; deletes event if last |

### totalLumpIn fix
Now sums `allocations[].amt` for events using the new format (legacy fallback intact).

---

## QA Result
PASS — 14 ACs checked, 0 bugs.

---

## Files Released
- `Investment/index.html` — source (11,606 lines)
- `Artifacts/investment-planner/index.html` — synced ✅
