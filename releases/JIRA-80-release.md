# JIRA-80 Release Manifest

**Date:** 2026-06-16
**Status:** ✅ RELEASED
**QA Result:** all ACs passed (0 leftover dark-navy chrome colors, style tags balanced, page 1 untouched)

---

## Change Shipped

### Tile picker page (#hf-page) recolored to match disclosure page (#landingOverlay) light theme

Direction corrected from JIRA-79 (which was reverted): instead of darkening the disclosure page, the strategy tile picker has been lightened to match the disclosure page's white/indigo theme. Both pages now share one consistent light theme end to end.

| Element | Before (dark navy) | After (light) |
|---|---|---|
| Page background | `#111e35` | `#f8fafc` |
| Top bar | `#162540` bg, `#2a3f60` border | `#ffffff` bg, `#e2e8f0` border |
| Top bar text | `#fff` / `#6a88a8` / `#b0c4d8` | `#0f172a` / `#64748b` / `#334155` |
| Ticker strip | `#142035` bg, `#1e3050` border | `#f1f5f9` bg, `#e2e8f0` border |
| Hero eyebrow / title accent (gold) | `#d4a523` | `#4f46e5` (indigo, matches disclosure page) |
| Hero title | `#fff` | `#0f172a` |
| Hero subtitle | `#6a88a8` | `#64748b` |
| Strategy cards | `#182c48` bg, `#263f60` border | `#ffffff` bg, `#e2e8f0` border, subtle shadow |
| Card hover | `#1e3555` bg, dark shadow | `#f8fafc` bg, indigo-tinted shadow |
| Card title | `#fff` | `#0f172a` |
| Metrics strip | `#1e3050` grid lines/bg | `#e2e8f0` |
| Card footer | `#142038` bg, `#1e3050` border | `#f8fafc` bg, `#e2e8f0` border |
| "Fun" 7th card gradient | navy→purple→maroon dark gradient | white→lilac→blush light gradient |

**Left unchanged (by design):** per-strategy accent colors (orange, purple, blue, red, teal badges/stripes/roman numerals) — these are strategy branding, not page chrome, and remain legible on the new light background. Live/down ticker indicators (`#10b981` green, `#ef4444` red) also kept, since they're semantic, not theme-dependent.

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — 32 CSS rule replacements across `#hf-page` and `.hf-*` classes |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,334 bytes) |

## Related

Supersedes JIRA-79 (reverted) which attempted the opposite direction.
