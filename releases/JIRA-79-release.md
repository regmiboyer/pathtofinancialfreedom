# JIRA-79 — REVERTED

**Date:** 2026-06-16
**Status:** ❌ REVERTED — rejected by user immediately after release

## What happened

Disclosure page (`#landingOverlay`) was recolored from its light white/indigo theme to match the dark navy/gold-teal theme of the tile picker (`#hf-page`). User rejected this on sight ("This is not what I asked for, revert").

All 18 CSS rule changes have been reverted. `index.html` and the synced artifact are back to the original light/indigo disclosure page theme. No net change from pre-JIRA-79 state.

## Next step

Original request was: "Keep the disclaimer page and tile selection page both in similar color scheme." My interpretation (darken the disclosure page to match the tile picker) was wrong. Needs clarification from user on what they actually want before attempting again.
