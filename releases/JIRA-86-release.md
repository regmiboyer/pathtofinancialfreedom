# JIRA-86 Release Manifest — Live ETF Data via Financial Modeling Prep (FMP)

**Release date:** 2026-06-17
**Status:** ✅ Shipped

## Summary
The Fund/ETF picker now supports a **Live** mode that pulls real-time data from the Financial Modeling Prep (FMP) API instead of relying solely on the curated static `ETF_DB` catalog (~130 entries). Users can browse the full universe of US-listed ETFs, with price, dividend yield, and trailing CAGR auto-filled on selection. DCA contribution amount remains manual input.

## What shipped
- **Live toggle** in the ETF picker modal (`#liveToggleBtn`) — switches the picker between the curated static catalog and a live-fetched FMP list.
- **API key management** — settings gear icon opens `#apiKeyPanel` where the user pastes their own free FMP key (stored in `localStorage` under `fmp_api_key`); includes a direct link to FMP's self-registration page.
- **Live ETF list fetch** (`fetchLiveEtfList`) — calls `api/v3/etf/list`, filters to US-listed ETFs, normalizes shape, and caches the result in `localStorage` (`fmp_etf_list_cache`) with a 12-hour TTL to avoid refetching on every picker open.
- **On-select live detail fetch** (`fetchLiveDetails`) — when a user picks a fund from the live list, fetches `quote`, `profile`, and 5-year `historical-price-full` endpoints to compute current price, dividend yield, and trailing CAGR (with a graceful fallback to `changesPercentage` if historical data is unavailable).
- **Consistent error handling** — all FMP calls funnel through `fmpFetch()`, which surfaces failures via the existing `showAppError()` banner (dismissible, 9s auto-timeout) with a path-forward message (e.g., missing key, rate limit, network failure) rather than failing silently.
- **Result capping** — live list view caps rendering at 300 matches with a "Showing 300 of N matches" note to keep the picker responsive; search/category filtering still narrows results client-side.
- Live entries without yet-fetched fundamentals show a "fetch on select" placeholder and a "LIVE" badge to distinguish them from curated entries.

## Architecture notes
- Live mode is additive — it does not replace or modify the static `ETF_DB` catalog or any of the 9 existing `openPicker()` call sites across all 8 non-Strategy-I strategies. The shared dispatch in `selectETF()` was extended (not rewritten) to await a live-detail fetch only when the selected entry's `cagr` is `null`.
- No backend/server component — all FMP calls are made client-side directly from the browser using the user's own key.

## QA verification (Task #131)
- Node.js static parse-check across all `<script>` blocks in `index.html`: **0 syntax errors** in any block touched by this feature (lines ~2556–3094, ~12270–12309).
- Verified all 9 `openPicker()` call sites still pass correct mode arguments and the shared dispatch chain (`selectETF` → per-mode branch) is intact for all 8 non-Strategy-I strategies — no regression risk introduced by the async refactor.
- Confirmed error banner (`showAppError`) fires correctly for the missing-key and fetch-failure paths.

## Known issue (separate, pre-existing, NOT part of this release)
QA also surfaced an unrelated, pre-existing defect: the Tax Settings panel and Scenario Comparison drawer are currently non-functional because a `</script>` tag is missing after the Inflation Toggle IIFE (~line 11578), leaving their markup trapped inside an unclosed `<script>` block as inert text. This is being tracked separately under JIRA-87 (UI improvisation work) rather than bundled into this release.

## Files changed
- `/Users/ganregmi/Documents/Claude/Investment/index.html` (source)
- `/Users/ganregmi/Documents/Claude/Artifacts/investment-planner/index.html` (synced artifact copy)
