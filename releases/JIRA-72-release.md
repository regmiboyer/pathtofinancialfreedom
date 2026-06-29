# JIRA-72 Release Manifest

**Date:** 2026-06-15  
**Status:** ✅ RELEASED  
**QA Result:** 20/20 AC passed

---

## Changes Shipped

### Part 1 — Sc6 renamed and moved to visual position 3

| What | Before | After |
|------|--------|-------|
| Card title | "Payoff Year Analysis" | "ETF Investment with Pay-Off Mortgage at one Point" |
| Visual badge | 6 | 3 |
| DOM position | After Sc5 (Equity Recycling) | After Sc2 (Accelerated Payoff) |
| BLOCK comment | BLOCK 6 | BLOCK 3 |

**Downstream badge updates:**
- Old Sc3 (Mortgage + ETF Side-by-Side): badge 3 → **4**
- Old Sc4 (Payoff First, Then Invest): badge 4 → **5**
- Old Sc5 (Equity Recycling): badge 5 → **6**

**Divider badge:** `Sc3 · Sc4 · Sc5` → **`Sc4 · Sc5 · Sc6`**

**"What you can calculate" panel** reordered to match new visual positions (3=ETF Pay-Off with violet highlight, 4=ETF Side-by-Side, 5=Payoff First, 6=Equity Recycling).

---

### Part 2 — Sc2 Post-Payoff Investment section

New panel appended inside the Accelerated Payoff (Sc2) card, after the mortgage clears.

**Features:**
- Displays freed monthly payment badge (`basePmt + extra`) — only shown after Sc2 runs
- User selects number of post-payoff investment years (1–30, default 10)
- Up to 6 ETF funds via shared fund picker (`mei2p` mode)
- Annuity-due simulation: each fund compounds monthly (`v = (v + dca) * (1 + r12)`)
- Bar chart (`meiChartSc2P`) + result tiles: Final ETF, Freed Monthly, Total Invested, Invest Period
- Reset clears funds, chart, and result tiles
- `meiRunSc2PostPayoff` reads `freed` from `sc2.basePmt + sc2.extra` (captured at Sc2 run time — immune to input changes)

**New globals/functions:**
- `window.MEI_FUNDS_SC2P` — fund array
- `window.MEI_RESULTS.sc2p` — result state
- `meiRunSc2PostPayoff`, `meiResetSc2P`, `meiAddFundSc2P`, `meiRemoveFundSc2P`, `meiRenderFundsSc2P`
- `openPicker` mode `'mei2p'` wired

**Init/Reset coverage:** Both `meiInit` and `meiReset` call `meiRenderFundsSc2P()`.

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source of truth — all 15 edits applied |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (680,514 bytes) |
