# JIRA-85 Release Manifest

**Date:** 2026-06-16
**Status:** ✅ RELEASED
**QA Result:** Zero `alert()` calls remain (Grep confirmed). All `meiRequire` error messages reference the correct on-screen "Run Scenario N" number for every block (Sc3→4, Sc4→5, Sc5→6, Sc6→3 — cross-checked button labels at lines ~10193-10332 against error-message text at lines ~11039-11147). No regression to JIRA-84 (lump-sum auto-recalc + relocated Run Scenario 2 button) or to the prior badge/internal-Sc numbering fix. Node.js static parse check on all `<script>` blocks (attribute-aware regex) passed with no syntax errors.

---

## Changes Shipped

### 1. Fixed: "Run Scenario" button numbers not matching scenario numbers

**Root cause:** Each MEI Block's gradient header showed badge numbers 1–6 in correct sequence, but the internal `Sc` numbering used by Run buttons, function calls, chart legends, tooltips, summary tiles, and placeholder text was rotated relative to the badges for Blocks 3–6:

| Badge shown | Internal Sc used (before) |
|---|---|
| 3 | Sc6 |
| 4 | Sc3 |
| 5 | Sc4 |
| 6 | Sc5 |

(Blocks 1 and 2 were already aligned.)

**Fix:** All user-visible display strings were rotated to match the badge numbers (internal Sc3→display "4", Sc4→"5", Sc5→"6", Sc6→"3"), while function names, element ids, and state keys (`meiRunSc3`, `MEI_FUNDS_SC4`, `MEI_RESULTS.sc3`, etc.) were left unchanged to avoid touching working logic. Every button label, chart legend, tooltip, comparison tile, and placeholder string was checked against its block's badge number.

### 2. Added: consistent error handling with actionable path-forward guidance

**Root cause:** Missing-input checks across the MEI app used a mix of `alert(...)` popups (13 call sites) and silent `return` guards, both poor UX — alerts block the page and give no next step; silent returns give no feedback at all.

**Fix:** Introduced a small error-handling layer:

- `MeiInputError(message, pathForward)` — custom error type carrying both a message and a suggested next action.
- `meiRequire(condition, message, pathForward)` — throws `MeiInputError` when a required condition isn't met.
- `meiShowError(err)` — renders a dismissible banner (top-right, auto-dismisses after 9s, manual × button) showing the error message plus a "➜ path forward" line.
- `meiTry(fn)` — wraps a handler so any thrown error (from `meiRequire` or otherwise) is caught and routed to `meiShowError` instead of crashing silently or showing a blocking alert.

Every `window.meiXxx` handler in the MEI app (Run/Reset/Add Fund/Remove Fund across Sc1–Sc6, Sc2-Post-Payoff, init/reset) is now wrapped in `meiTry`, and every former `alert(...)`/silent-return guard was converted to `meiRequire(...)` with a scenario-number-correct message and a concrete next step (e.g. "Fill in Loan Amount, Interest Rate and Loan Term at the top of the page, then click Run Scenario 4 again.").

| | Before | After |
|---|---|---|
| Missing required input | Blocking `alert()` popup, or nothing happened | Dismissible banner: error + specific next action |
| Error scenario number in message | N/A (alerts used internal numbering inconsistently) | Always matches the displayed badge/button number |
| Unexpected JS error in a handler | Could crash silently with no user feedback | Caught by `meiTry`, shown via the same banner |

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — numbering display fix + error-handling layer added (694,415 bytes) |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (694,415 bytes) |

## Related

Scoped to the MEI app's display-numbering and error-handling behavior across all 6 Blocks plus the Sc2 Post-Payoff sub-block. No changes to calculation logic, function/id/state-key names, the `#hf-page` tile picker, or any work from JIRA-81/82/83/84 — all confirmed untouched.
