# Release Manifest — JIRA-65
**Date:** 2026-06-12  
**Version:** JIRA-65  
**File:** index.html (11,504 lines)

## What shipped

### Device Detection
- Synchronous `<script>` block runs before first paint — adds `is-mobile` or `is-desktop` to `<body>` based on `(pointer:coarse)` matchMedia + viewport width ≤ 860px
- Resize/orientation-change handler re-evaluates device class (debounced 160ms)

### Mobile Sidebar Drawer
- `.sidebar` becomes a fixed slide-out drawer (left: -310px → 0) with CSS transition
- `☰` hamburger button appears in strategyBar on mobile (hidden on desktop)
- Semi-transparent backdrop (`#sidebarBackdrop`) closes drawer on tap
- Drawer auto-closes on `enterApp()` and `backToStrategies()`

### Bottom Navigation Bar
- `#mobileBottomNav` fixed to bottom of screen — visible only on `.is-mobile`
- 9 buttons: Home + 8 strategies, each calling `enterApp()` / `backToStrategies()`
- Active strategy highlighted indigo when navigated to
- Horizontally scrollable (scrollbar hidden), `safe-area-inset-bottom` aware

### Touch UX
- All primary action buttons: `min-height: 44px` on mobile
- All inputs/selects: `font-size: max(16px, 1em)` — prevents iOS auto-zoom

### Desktop
- No changes to existing sidebar, hover states, or layout
- Hamburger hidden; bottom nav hidden

### Print / PDF
- `#mobileBottomNav`, `.sb-hamburger`, `#sidebarBackdrop` all hidden via `@media print`

## QA Sign-off
- Bug #1 fixed: mobile nav excluded from print CSS
- Bug #2 fixed: sidebar toggle uses `offsetParent !== null` for reliable visibility detection
- AC1–AC7: all passed

## Files modified
- `/Users/ganregmi/Documents/Claude/Investment/index.html`
- `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` (synced)
