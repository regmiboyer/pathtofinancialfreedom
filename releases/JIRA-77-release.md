# JIRA-77 Release Manifest

**Date:** 2026-06-15  
**Status:** ✅ RELEASED  
**QA Result:** 12/12 AC passed

---

## Changes Shipped

### Fix 1 — Text overflow prevented (grid align-items:start)

`#hf-grid` now has `align-items:start`. Previously the default `stretch` would size all cards in a row to the tallest card's height; combined with `overflow:hidden` on `.hf-card` this could clip content in cards with more text than their neighbours. With `align-items:start` each card is its natural content height — nothing is clipped.

### Fix 2 — Rebalanced secondary font sizes

With title (32px) and roman numeral (26px) kept at full double, the secondary elements were scaled back to sizes that fit without overflow:

| Class | JIRA-76 | JIRA-77 (final) | Original |
|-------|---------|-----------------|----------|
| `.hf-card-title` | 32px | **32px** | 16px |
| `.hf-card-roman` | 26px | **26px** | 13px |
| `.hf-card-class` | 18px | **15px** | 9px |
| `.hf-card-ticker` | 20px | **14px** | 10px |
| `.hf-metric-label` | 16px | **10px** | 8px |
| `.hf-metric-val` | 24px | **18px** | 12px |
| `.hf-card-desc` | 22px | **14px** | 11px |
| `.hf-tag` | 18px | **11px** | 9px |
| `.hf-card-footer-label` | 18px | **12px** | 9px |
| `.hf-allocate-btn` | 20px | **14px** | 10px |

### Fix 3 — Card chronology corrected

| Issue | Before | After |
|-------|--------|-------|
| voo500 Roman numeral | VIII | **VII** (7th strategy) |
| CSS full-width selector | `nth-child(7)` only | `nth-child(n+7)` (cards 7 + 8 both full-width) |

Cards 7 (voo500 "VOO vs V500") and 8 (meme/hf-fun) now both span the full grid width, matching the visual intent of the bottom-row section.

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — font rebalance + overflow fix + VIII→VII + nth-child(n+7) |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,688 bytes) |
