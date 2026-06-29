# JIRA-82 Release Manifest

**Date:** 2026-06-16
**Status:** ✅ RELEASED
**QA Result:** footer markup matches the standard single-row pattern, no leftover metrics box/old styling, glow borders (JIRA-81) untouched, divs balanced, file integrity confirmed.

---

## Change Shipped

### Fixed "VOO vs V500 on Stake" (`voo500`) tile rendering taller than its sibling tiles

**Root cause:** every other strategy card's footer is a simple horizontal row (`Strategy label` + `button`). The `voo500` card's footer was a vertical 3-element stack (label → a small MER metrics box → button), which added roughly 70–90px of extra height versus the others — and the metrics box was redundant, since the same VOO/V500 MER figures are already shown in that card's tag chips above.

**Fix:** removed the redundant metrics box and reverted the footer to the same single-row layout (label left, button right) used by all 7 other tiles.

| | Before | After |
|---|---|---|
| Footer layout | Column stack: label, metrics box, button | Row: label, button (matches all other cards) |
| Footer content | Label + duplicate MER metrics box + full-width button | Label + button only |

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — voo500 footer markup simplified |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,423 bytes) |

## Related

Builds on JIRA-81 (per-tile glow borders), which remain intact and unaffected by this change.
