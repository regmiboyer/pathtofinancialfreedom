# JIRA-74 Release Manifest

**Date:** 2026-06-15  
**Status:** ✅ RELEASED  
**QA Result:** 13/13 AC passed

---

## Changes Shipped

### Fix 1 — Freed payment displays exact dollars (not abbreviated K)

**Root cause:** `fmt()` abbreviates values ≥$1,000 to `NK` format (e.g. $7,512 → $8K). All monthly payment displays in the post-payoff section were using `fmt()` instead of `fmtF()`.

| Location | Before | After |
|----------|--------|-------|
| `meiRenderFundsSc2P` — per-fund card | `fmt(perFund)` | `fmtF(perFund)` |
| `meiRenderFundsSc2P` — total display | `fmt(freed)` | `fmtF(freed)` |
| `meiRunSc2PostPayoff` — freed badge | `fmt(freed)` | `fmtF(freed)` |
| `meiRunSc2PostPayoff` — Freed Monthly tile | `fmt(freed)` | `fmtF(freed)` |
| `meiRunSc2PostPayoff` — Total Invested tile | `fmt(totalInvested)` | `fmtF(totalInvested)` |

**Verified:** base=$5,512 + extra=$2,000 → freed=$7,512 → displays as `$7,512` (not `$8K`).

---

### Fix 2 — Block card heading fonts increased 17px → 22px

All 6 MEI scenario block card headings upgraded from 17px to 22px for better visual hierarchy.

| Line | Block Heading |
|------|--------------|
| 9902 | Base Mortgage (Sc1) |
| 9995 | Accelerated Payoff (Sc2) |
| 10123 | ETF Investment with Pay-Off Mortgage at one Point (Sc3) |
| 10196 | Mortgage + ETF Side-by-Side (Sc4) |
| 10241 | Payoff Mortgage First, Then Invest (Sc5) |
| 10278 | Minimum Payments + Equity Recycling (Sc6) |

Note: "Withdrawal Phase Simulation" heading (line 8777) was pre-existing at 22px and unchanged.

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — 5 fmt→fmtF edits + 6 heading font edits |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (684,679 bytes) |
