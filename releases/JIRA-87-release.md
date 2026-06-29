# JIRA-87 Release Manifest — UI Polish & Tax Panel/Compare Drawer Fix

**Release date:** 2026-06-17
**Status:** ✅ Shipped

## Summary
UI improvisation pass across the Investment Planner, covering all four scope areas the user selected: the Fund/ETF picker modal, overall visual polish, charts & results panels, and a fix for the previously broken Tax Settings panel and Scenario Comparison drawer.

## What shipped

**1. Tax Settings Panel / Scenario Compare Drawer — bug fix**
Root cause: the Inflation Toggle `<script>` block (opened ~line 11522) was missing its closing `</script>` tag, so the Tax Panel and Compare Drawer markup sitting right after it was trapped as inert text instead of being parsed as DOM — the panels existed in source but could never render or open.
Fix: closed the Inflation Toggle script block immediately after its own IIFE, and removed the now-redundant stray closing tag that followed. The Tax Settings JS block re-opens cleanly afterward. Both `⚙ Tax` and `⚖ Compare` toolbar buttons now open their respective panels correctly.

**2. Fund/ETF picker modal**
- Overlay fade-in and modal pop-in animation on open.
- Deeper, more deliberate shadow and rounded corners on the modal.
- Subtle gradient header background.
- Smoother hover/active transitions on the close button, category chips, and search input (with a visible focus ring).
- Active-state press feedback (slight scale-down) on chips and the close button.

**3. Overall visual polish**
- Standardized 10 previously flat, hardcoded box-shadows (across table boxes, property tiles, super-fund tiles, and chart boxes) onto the shared `--shadow-sm` design token, with a smooth transition on hover.
- Added hover lift to `.sus-stat` (sustainability stat cards) consistent with the existing `.card` hover treatment.

**4. Charts & results panels**
- Table headers now use a subtle gradient background with bolder title weight for clearer hierarchy.
- Sticky table headers get a hairline separator shadow so content doesn't visually merge with the header on scroll.
- Smoother row-hover transition.

## QA verification (Task #135)
- Node.js static parse-check across all `<script>` blocks: **23 blocks, 0 syntax errors.**
- Script tag balance confirmed: 23 opens / 23 closes (file is well-formed).
- Manually traced the Tax Panel/Compare Drawer fix line-by-line — markup now sits as live DOM between two cleanly closed/reopened script blocks.
- All polish changes are CSS-only — no JS logic touched, no regression risk to existing strategy calculations or the JIRA-86 live-data feature.

## Files changed
- `/Users/ganregmi/Documents/Claude/Investment/index.html` (source)
- `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` (synced artifact copy)
