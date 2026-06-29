# JIRA-84 Release Manifest

**Date:** 2026-06-16
**Status:** ✅ RELEASED
**QA Result:** div balance maintained (1814/1814), exactly one "Run Scenario 2" button now present (relocated), auto-recalc guard functions confirmed wired into both meiAddLumpMort() and meiDelLump(), no regression to hf-page tiles (hf-metric-label count unchanged at 22) or JIRA-81/82/83 work.

---

## Changes Shipped

### 1. Fixed: lump-sum payments not reflecting on chart/numbers (Accelerated Payoff, Sc2)

**Root cause:** `meiAddLumpMort()` and `meiDelLump()` only mutated the `MEI_LUMP_MORT` array and refreshed the small list display — they never called `meiRunSc2()`. So once Scenario 2 had been run, any lump sum added or removed afterward went stale on the chart, the interest/months-saved figures, and the yearly cash-flow table until the user manually clicked "Run Scenario 2" again.

**Fix:** added a guarded helper, `meiMaybeRunSc2()`, which re-runs Scenario 2 automatically whenever Loan, Rate and Years are already filled in:

```js
function meiMaybeRunSc2(){
  if(gn('mei_principal',0)&&gn('mei_rate',0)&&gn('mei_years',0)) meiRunSc2();
}
```

This is now called at the end of both `window.meiAddLumpMort()` and `window.meiDelLump()`. The guard avoids the "Fill in Loan, Rate and Years first." alert from firing unexpectedly if those base fields haven't been set yet.

### 2. Moved "Run Scenario 2" button below the inputs

**Before:** the only Run/Reset control for Scenario 2 sat in a footer strip below the chart, result panel, and entire cash-flow table — far from the Extra Monthly Payment and Lump-Sum input fields that drive it.

**After:** "▶ Run Scenario 2" and "↺ Reset" now sit directly beneath the Lump-Sum Payments input row, inside the same left-hand input column. The old footer strip was trimmed down to keep its explanatory note ("Extra payments feed into Sc4 side-by-side · lump sums above") without duplicate buttons.

| | Before | After |
|---|---|---|
| Lump sum added after Sc2 already run | Chart/numbers stale until manual re-click | Chart/numbers refresh immediately |
| Run Scenario 2 button location | Footer, below chart + result + cash-flow table | Directly below Lump-Sum Payments inputs |

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — `meiMaybeRunSc2()` added, wired into `meiAddLumpMort()`/`meiDelLump()`; Run Scenario 2 button relocated (689,962 bytes) |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,962 bytes) |

## Related

Scoped to MEI app Block 2 ("Accelerated Payoff" / Scenario 2) only — no changes to Block 1 (Sc1), Block 3 (Sc3), the Mortgage+ETF side-by-side blocks (Sc4/Sc5/Sc6), or the `#hf-page` tile picker (JIRA-81/82/83), all confirmed untouched.
