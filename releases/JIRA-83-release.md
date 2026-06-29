# JIRA-83 Release Manifest

**Date:** 2026-06-16
**Status:** ✅ RELEASED
**QA Result:** hf-metrics block present and correctly structured on voo500 (7/7 standard cards now have it), divs balanced (1814/1814), JIRA-81 glow borders intact (8/8), JIRA-82 footer fix untouched, file size consistent across source and artifact.

---

## Change Shipped

### Fixed "VOO vs V500 on Stake" (`voo500`) tile rendering shorter than its sibling tiles

**Root cause:** JIRA-82 correctly simplified voo500's footer to match the standard row layout — but that footer had been (over-)compensating for a second, pre-existing structural gap: voo500's card-top was missing the standard `hf-metrics` 3-stat row that every other sibling card has between the ticker and the description. Once the tall footer was removed, that missing ~16-24px block became visible as a height deficit.

**Fix:** added a standard `hf-metrics` block to voo500's card-top, positioned between the ticker and description, using metrics relevant to the cross-border comparison:

| Metric | Value | Color |
|---|---|---|
| Horizon | 15Y | neutral gray `#94a3b8` |
| Currencies | 2 | blue `#1d4ed8` |
| FX Fee | 0.55% | orange `#d97706` |

This restores voo500's structural layout to match its 6 standard siblings, so rendered height now lines up across the row.

| | Before (post-JIRA-82) | After |
|---|---|---|
| Card-top structure | num-row → title → ticker → desc → tags (no metrics row) | num-row → title → ticker → **metrics row** → desc → tags (matches siblings) |
| Visual height | Shorter than 6 standard siblings | Matches siblings |

---

## Files Updated

| File | Action |
|------|--------|
| `/Users/ganregmi/Documents/Claude/Investment/index.html` | Source — hf-metrics block inserted into voo500 card-top (689,891 bytes) |
| `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` | Synced (689,891 bytes) |

## Related

Builds on JIRA-81 (per-tile glow borders) and JIRA-82 (footer simplified to standard row) — both remain intact. Together, JIRA-82 + JIRA-83 bring voo500's card structure fully in line with its 6 standard siblings (top metrics row + simple footer row), while preserving its extra content (3 tags, wider description, dual-color branding).
