# JIRA-70 Release Manifest
**Released:** 2026-06-15  
**Agent pipeline:** PM → Developer → QA (pass, all 10 ACs) → Release  
**Scope:** New Scenario 6 — "ETF Lump-Sum Mortgage Payoff" in Strategy II (Mortgage + ETF Side-by-Side)

---

## Feature Added — Sc6: ETF Lump-Sum Mortgage Payoff

**User story:** Invest in ETFs for X years (DCA duration < 30), and at year Y (free input), lump-sum withdraw the outstanding mortgage balance from the ETF portfolio to pay off the mortgage. Continue investing for the remaining years. See the final ETF value and check it at any year.

---

## Implementation

### New standalone simulation engine: `meiCalcSc6`

```
meiCalcSc6(loan, mortRate, mortYrs, extra, funds, dcaDur, payoffYr, redirectFreed)
```

Month-by-month, two-phase simulation:

**Phase 1 (yr 1 → payoffYr):** Each month — pay standard mortgage + DCA per-fund (annuity-due, consistent with JIRA-69 Sc3 fix).

**End of payoffYr:** Record `balAtPayoff`. Withdraw `balAtPayoff` proportionally from all funds. Set `balance = 0`. If `redirectFreed`, boost each fund's DCA by its share of `(base + extra)` freed monthly payment.

**Phase 2 (yr payoffYr+1 → dcaDur):** No mortgage payments. ETF DCA continues at boosted rate (if redirect enabled).

Returns: `{labels, etfByYr, balByYr, balAtPayoff, etfBeforePayoff, etfAfterPayoff, basePmt}`

### New HTML block (Sc6 card, violet gradient)

- **Inputs:** DCA Duration (2–29 yr), Payoff at Year (1–(N-1)), Redirect freed payment checkbox (default ON)
- **Fund list:** Sc6 own selection (up to 6), falls back to Sc3 funds
- **Chart:** Line chart — ETF portfolio shows natural kink dip at payoff year; mortgage balance line drops to 0
- **Result tiles:** ETF Before Payoff | Mortgage Cleared | ETF After Payoff | Final ETF @ Yr N | Sc3 comparison (if run)
- **Interactive year-check slider:** appears after first run; live-updates "At Yr X: ETF = $Y"

### Other JS changes

| Change | Detail |
|--------|--------|
| `openPicker` | Added `'mei6'` mode case — handles ETF picker for Sc6 funds |
| `activePickerMode` comment | Updated to include `'mei6'` |
| `MEI_FUNDS_SC6 = []` | New global Sc6 fund array |
| `MEI_RESULTS.sc6` | Added to results object |
| `meiRenderFundsSc6` | Uses `meiRenderFundsMini` with `'mei6'` mode |
| `meiAddFundSc6`, `meiRemoveFundSc6` | Fund management — default fund VOO 13.8% |
| `meiRunSc6` | Validates inputs, runs `meiCalcSc6`, renders chart + tiles + slider |
| `meiResetSc6` | Resets Sc6 inputs, funds, results, hides year-check panel |
| `meiSc6YearCheck` | Live year-check handler — reads slider, displays `etfByYr[yr-1]` |
| `meiUpdateComparison` | Sc6 line added to ETF Portfolio comparison chart (comp1) |
| `meiReset` | Includes Sc6 fields, fund array, result panel, slider panel |
| `meiInit` | Includes `meiRenderFundsSc6()` and `meiEmptyState(6)` |
| `meiEmptyState` labels | Added `'ETF Lump-Sum Payoff'` at index 6 |
| Comparison chart header | "Sc3 vs Sc4 vs Sc5 vs Sc6" |

---

## QA Result — PASS (10/10 ACs)

| AC | Result | Notes |
|----|--------|-------|
| AC1 | ✅ | Violet header, badge 6, correct title |
| AC2 | ✅ | DCA Duration (default 20), Payoff Year (default 13) |
| AC3 | ✅ | Redirect checkbox: freed $4,197/mo boosts DCA from Yr 14 |
| AC4 | ✅ | Per-fund annuity-due; falls back to Sc3 funds |
| AC5 | ✅ | Tiles: Before $1,086,126 → Cleared $535,928 → After $550,198 → Final $2,741,161 |
| AC6 | ✅ | Chart kink: $899K → $550K at Yr 13 (visible dip) |
| AC7 | ✅ | Slider hidden until run; live year-check working |
| AC8 | ✅ | Sc6 added to Comparison Chart 1 in purple (`#8b5cf6`) |
| AC9 | ✅ | `meiReset` + `meiResetSc6` fully clean up state |
| AC10 | ✅ | Alert fires when payoffYr ≥ dcaDur |

**Test inputs:** Loan $700K · Rate 6% · 30yr · VOO $1K/mo 13.8% + QQQM $1K/mo 18.5% · DCA 20yr · Payoff yr 13 · Redirect ON

---

## Files Released
- `Investment/index.html` — source (11,863 lines)
- `Artifacts/investment-planner/index.html` — synced ✅
