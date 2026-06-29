# JIRA-76 Release Manifest

**Date:** 2026-06-15  
**Status:** ✅ RELEASED  
**QA Result:** 13/13 AC passed

---

## Changes Shipped

### HF Card Font Sizes Doubled

All visible text in the Investment Strategy selection tiles (`.hf-card`) has been doubled in size. Padding adjusted throughout to ensure text fits within card boundaries without overflow.

| Class | Before | After | Role |
|-------|--------|-------|------|
| `.hf-card-title` | 16px | 32px | Card title (e.g. "Invest in ETFs") |
| `.hf-card-roman` | 13px | 26px | Roman numeral (I, II, III…) |
| `.hf-card-class` | 9px | 18px | Asset class badge (EQUITY, HYBRID…) |
| `.hf-card-ticker` | 10px | 20px | Ticker/strategy code |
| `.hf-metric-label` | 8px | 16px | Metric label (Target CAGR, Risk…) |
| `.hf-metric-val` | 12px | 24px | Metric value (8–16%, MEDIUM…) |
| `.hf-card-desc` | 11px | 22px | Strategy description |
| `.hf-tag` | 9px | 18px | Tag pills (ASX + US, DCA…) |
| `.hf-card-footer-label` | 9px | 18px | Footer label (Strategy I, II…) |
| `.hf-allocate-btn` | 10px | 20px | OPEN button |

### Layout Adjustments (to fit larger text)

| Property | Before | After |
|----------|--------|-------|
| `.hf-card-top` padding | `18px 20px 14px 24px` | `24px 24px 18px 28px` |
| `.hf-metric` padding | `7px 8px` | `12px 10px` |
| `.hf-card-footer` padding | `11px 20px 11px 24px` | `16px 24px 16px 28px` |
| `.hf-card-class` padding | `3px 9px` | `5px 12px` |
| `.hf-allocate-btn` padding | `6px 16px` | `10px 20px` |
| `.hf-card-num-row` margin-bottom | `12px` | `16px` |
| `.hf-card-ticker` margin-bottom | `12px` | `16px` |
| `.hf-metrics` margin-bottom | `12px` | `16px` |
| `.hf-card-desc` margin-bottom | `12px` | `16px` |
| `.hf-card-title` margin-bottom | `4px` | `8px` |

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — 16 CSS edits |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,629 bytes) |
