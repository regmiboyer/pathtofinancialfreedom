# JIRA-66 Release Manifest
**Released:** 2026-06-13  
**Agent pipeline:** PM → Developer → QA (pass, 0 bugs) → Release  
**Scope:** Heading enlargement — Strategy II (Mortgage & ETF) + full prod release check

---

## Changes Applied — `Investment/index.html`

### CSS class changes
| Class | Property | Before | After |
|---|---|---|---|
| `.mei-hdr-title` | `font-size` | 20px | 24px |
| `.mei-ch-title` | `font-size` | 13px | 16px |

### Inline style changes (meiSection ~lines 9664–9895)

| Element | Description | Before | After |
|---|---|---|---|
| Section banner title | "Strategy II — Mortgage & ETF Investment" | 16px | 22px |
| Block gradient-bar headers (×5) | Section group headers | 13px | 17px |
| Collapsible section titles (×3) | Remaining Mortgage Balance, Yearly Cash Flow ×2 | 13px | 16px |
| Chart area sub-headings (×4) | Inline chart labels | 12px | 15px |
| ETF config heading | "ETF Funds & Monthly DCA" | 11px | 14px |
| Chart label | "ETF Portfolio vs Mortgage Balance" | 11px | 14px |

---

## Prod Release Check Results (QA Agent)

| Check | Result |
|---|---|
| ALL_SECTIONS contains all 8 strategy IDs | ✅ PASS |
| enterApp wired for all 8 strategies (picker + bottom nav) | ✅ PASS |
| Device detection script (`matchMedia pointer:coarse`) present | ✅ PASS |
| Bottom nav: Home + 8 strategy buttons | ✅ PASS |
| Print CSS hides `#mobileBottomNav`, `.sb-hamburger`, `#sidebarBackdrop` | ✅ PASS |
| All JIRA-66 heading patches verified in output | ✅ PASS |
| Key JS functions present (toggle/close sidebar, updateMobileBottomNav, hideAllSections) | ✅ PASS |
| `TOTAL===0` guard + guide hooks (`s1Guide`, `s2Guide`) | ✅ PASS |
| `meiInit` / `meiOnEnter` present | ✅ PASS |

**QA verdict: PASS — 0 bugs found.**

---

## Files Released
- `Investment/index.html` — primary source (11,504 lines)
- `Artifacts/investment-planner/index.html` — synced from source ✅

---

## Previous Release
- JIRA-65: Device-aware responsive UI (mobile drawer, bottom nav, iOS zoom fix)
