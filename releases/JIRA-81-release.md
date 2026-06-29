# JIRA-81 Release Manifest

**Date:** 2026-06-16
**Status:** ✅ RELEASED
**QA Result:** all ACs passed — 8/8 cards have correct per-card glow `box-shadow`, `voo500`'s pre-existing `border-top` inline style preserved alongside its new glow (no duplication/overwrite), style attribute quoting balanced, file size consistent across source and artifact.

---

## Change Shipped

### Glowing border added to all 8 strategy tiles on the tile picker page (`#hf-page`)

Request: "Outline every tile in the tile selection page with a glowing border so that all 8 tiles are clearly distinct."

Implementation: rather than one uniform glow color for all 8 tiles, each card gets a glow in its OWN existing accent/branding color — reinforcing each strategy's identity while making every tile visually distinct from its neighbors and from the light page background (shipped in JIRA-80). Glow = a tight 1px solid ring at 45% opacity + an 18px soft halo at 30% opacity, added as an inline `box-shadow` on each card's outer `<div>`.

| # | Strategy | Card id | Glow color |
|---|----------|---------|------------|
| I | Invest in ETFs (Multi-Fund DCA) | `s1` | `#3b82f6` blue |
| II | Mortgage & ETF Investment | `mei` | `#0d9488` teal |
| III | Super Salary Sacrifice | `super` | `#10b981` green |
| IV | High Touch Property Portfolio | `compare` | `#f59e0b` orange |
| V | Precious Metals Portfolio | `precious` | `#d4a523` gold |
| VI | DCA vs Timing the Market | `dca` | `#8b5cf6` purple |
| VII | VOO vs V500 on Stake | `voo500` | `#1d4ed8` blue (kept existing `border-top` stripe, glow added alongside it) |
| Bonus | Fastest Path to Billionaire | `meme` | `#f97316` orange (representative of its red→orange→yellow gradient stripe) |

CSS pattern used: `box-shadow:0 0 0 1px rgba(R,G,B,.45),0 0 18px rgba(R,G,B,.30);`

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — 8 inline `style`/`box-shadow` additions to `.hf-card` divs |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,971 bytes) |

## Related

Builds on JIRA-80 (light theme for `#hf-page`) — the glow treatment is what makes the 8 tiles pop against that lighter background.
