# Investment Planner — Technical Reference

A single-file, client-side wealth simulation tool built for personal financial planning across seven investment strategies. All computation runs in the browser — no server, no accounts, no data leaves the device.

---

## Architecture

The entire application is one self-contained `index.html` file (~10,000 lines). It ships with:

- **Vanilla JavaScript** — no frameworks, no build step
- **Chart.js 4.5.0** — loaded via CDN
- **CSS custom properties** — theming and responsive layout
- **Navigation engine** — a lightweight section router that shows/hides strategy panels and fires `onEnter` callbacks to lazy-initialise charts only when a section becomes visible

### Navigation Engine

```
enterApp(strategyKey)
  → hideAllSections()           // sets display:none on all section elements
  → showSection(sectionId)      // clears display:none on the target
  → fires window.<key>OnEnter() // lazy chart init / resize
```

Each strategy is registered in `STRATEGY_META`:

```js
var STRATEGY_META = {
  s1:       { section: 'etfSection',      onEnter: 'etfOnEnter'      },
  mei:      { section: 'meiSection',      onEnter: 'meiOnEnter'      },
  super:    { section: 'superSection',    onEnter: 'superOnEnter'    },
  compare:  { section: 'pfSection',       onEnter: 'pfOnEnter'       },
  precious: { section: 'preciousSection', onEnter: 'preciousOnEnter' },
  dca:      { section: 'dcaSection',      onEnter: 'dcaOnEnter'      },
  meme:     { section: 'memeSection',     onEnter: 'memeOnEnter'     }
};
```

> **CSS `display:none` rule:** any section with a CSS-level `display:none` rule overrides the nav engine's show logic. Sections must use the `style="display:none"` HTML attribute — not a CSS rule — for the nav engine to control them correctly.

---

## Shared Infrastructure

### ETF Database

`ETF_DB` — ~130 US ETFs, each with:

| Field  | Description                                    |
|--------|------------------------------------------------|
| `sym`  | Ticker symbol                                  |
| `name` | Full fund name                                 |
| `cat`  | Category (Broad Market, Technology, etc.)      |
| `cagr` | Estimated 15-yr CAGR through 2025 (%)          |
| `yr`   | Inception year                                 |
| `div`  | Trailing dividend yield (%)                    |

Covers Broad Market, Large/Mid/Small Cap, Growth, Value, Technology, Healthcare, Real Estate, Bonds, Commodities, International, and Leveraged.

### Shared Inflation Rate

`getBase().inf` — set in Strategy I's global controls — is read by every other strategy that needs real-return calculations. Single source of truth for purchasing-power adjustments across the entire app.

### ETF Picker Modal

A single shared modal (`id="etfOverlay"`) is used by all strategies. Opened via:

```js
openPicker(fundIndex, mode)
```

`mode` routes the selected ETF to the correct fund array:

| Mode     | Target array        | Strategy           |
|----------|---------------------|--------------------|
| `null`   | `funds[]`           | Strategy I         |
| `'su'`   | `SU_ETF_FUNDS[]`    | Strategy III       |
| `'mei'`  | `MEI_FUNDS[]`       | Strategy II Sc. 3  |
| `'mei4'` | `MEI_FUNDS_SC4[]`   | Strategy II Sc. 4  |
| `'mei5'` | `MEI_FUNDS_SC5[]`   | Strategy II Sc. 5  |
| `'he'`   | `HE_FUNDS[]`        | Home Equity        |
| `'mi'`   | `MI_FUNDS[]`        | Mortgage Invest    |

---

## Strategy I — Invest in ETFs

**Section:** `etfSection`

A 50-year, three-phase wealth accumulation and drawdown model.

### Phases

| Phase | Duration  | Description                                               |
|-------|-----------|-----------------------------------------------------------|
| 1     | `dcaYrs`  | Dollar-cost averaging — fixed monthly contributions       |
| 2     | `coast`   | Coast period — no contributions, portfolio keeps growing  |
| 3     | `wYrs`    | Withdrawal phase — monthly drawdown with annual increases |

### Core Formula

Each month, for each fund:

```
balance = balance × (1 + monthlyRate) + monthlyDCA
```

where `monthlyRate = fund.cagr / 12 / 100`.

In Phase 3, the DCA contribution becomes a withdrawal:

```
withdrawal = wdraw × (1 + winc)^(drawdownYear - 1)
```

Lump-sum injections are added to the combined portfolio at the user-specified year.

### Parameters

| Control           | Default   | Description                              |
|-------------------|-----------|------------------------------------------|
| DCA duration      | 17 yr     | Years of regular contributions           |
| Coast period      | 3 yr      | Years of zero contributions              |
| Inflation         | 3.0%      | Annual CPI — shared across all strategies|
| Withdrawal        | $12,000   | Starting annual drawdown                 |
| Withdrawal growth | 3%        | Annual increase to withdrawals           |
| Withdrawal period | 30 yr     | Years of drawdown                        |

### Outputs

- Combined nominal + real (inflation-adjusted) portfolio value
- Per-fund breakdown (each fund simulated independently)
- Coast FIRE target — portfolio value needed at end of Phase 1 to self-fund Phase 3
- Dividend income estimate (`portfolio × dividend yield`)
- Total invested vs. total gain

---

## Strategy II — Mortgage & ETF Investment

**Section:** `meiSection`

Five parallel scenarios modelled side-by-side: *What is the optimal relationship between paying down a mortgage and investing in ETFs?*

### Scenarios

| # | Name                       | Description                                                              |
|---|----------------------------|--------------------------------------------------------------------------|
| 1 | Base Mortgage              | Standard P&I repayments only, no extra investing                         |
| 2 | Accelerated Payoff         | Extra monthly repayment to reduce the term                               |
| 3 | ETF Side-by-Side           | Invest in ETFs while paying the mortgage simultaneously                  |
| 4 | Pay Off First, Then Invest | Clear the mortgage, then redirect all payments to ETFs                   |
| 5 | Equity Recycling           | Draw on home equity as collateral to fund ETF purchases (leverage)       |

### Mortgage Amortisation

Standard monthly payment formula:

```
       P × r × (1+r)^n
PMT = ──────────────────
         (1+r)^n - 1
```

where `r = annualRate / 12`, `n = term × 12`.

### ETF Side-by-Side Logic (Scenarios 3–5)

Monthly cash flow is split between mortgage repayment and ETF DCA. The ETF portfolio compounds independently using the same per-fund `cagr` model as Strategy I.

In Scenario 4, the full mortgage repayment amount is redirected to ETFs from the payoff date onward — modelling the classic "debt-free then invest" approach.

Scenario 5 (Equity Recycling) converts non-deductible home loan debt into investment debt by drawing equity, purchasing income-generating ETFs, and claiming interest as a tax deduction — a strategy used in Australian tax law.

---

## Strategy III — Super Salary Sacrifice

**Section:** `superSection`

Australian superannuation modelling with full ATO concessional contribution tax treatment.

### Tax Treatment

| Contribution Type             | Tax Rate Inside Super       |
|-------------------------------|-----------------------------|
| Employer SGC                  | 15% contributions tax        |
| Extra salary sacrifice        | 15% contributions tax        |
| Non-concessional (post-tax)   | 0% contributions tax; earnings taxed at 15% |
| All earnings (super fund)     | 15% flat                    |

**FY2025–26 Caps:**
- Concessional cap: **$30,000** (employer SGC + salary sacrifice combined)
- Non-concessional cap: **$120,000**

### Simulation Loop

Each year:

```
superBalance = superBalance × (1 + superRate × 0.85)
             + (empSG + ssExtra) × (1 - 0.15)
             + ncExtra
```

- `0.85` factor = earnings after 15% earnings tax
- `(1 - 0.15)` = contributions after 15% contributions tax
- `ncExtra` = non-concessional contribution (already post-tax, no contrib tax deducted)

An ETF portfolio runs in parallel using the same monthly compounding model as Strategy I, allowing direct comparison of super vs. taxable investing.

### Outputs

- Super balance at preservation age (default 60)
- ETF portfolio value comparison
- Employer SGC vs. salary sacrifice vs. non-concessional contribution split
- Effective tax saving (salary sacrifice vs. marginal tax rate)
- Fund longevity simulator — how long the super balance lasts under various drawdown rates

---

## Strategy IV — High Touch Property Portfolio

**Section:** `pfSection`  
**Input source:** `propSection` (a legacy single-property analysis panel whose sliders feed the multi-property portfolio)

Two linked sub-tools that share a single set of input controls.

### Sub-tool A: Single Rental Property (`propSection`)

Models one investment property over its full mortgage term.

#### Key Inputs (`getPropInputs`)

| ID           | Description                                      |
|--------------|--------------------------------------------------|
| `pp_price`   | Purchase price                                   |
| `pp_equity`  | Equity used as deposit                           |
| `pp_mrate`   | Mortgage interest rate (%)                       |
| `pp_erate`   | Equity loan rate (%) if deposit is equity-funded |
| `pp_term`    | Loan term (years)                                |
| `pp_rent`    | Starting weekly rent                             |
| `pp_rentinc` | Annual rent growth (%)                           |
| `pp_water` … `pp_misc` | Annual operating costs            |
| `g1` / `g2` / `g3` | Capital growth rates: years 1–12, 13–22, 23+ |

#### `simulateProperty` Logic

Year-by-year for each year of the loan term:
- Property value compounds at the relevant growth tier
- Monthly mortgage payment is constant (standard amortisation formula)
- Rent grows at `rentinc`% annually
- Operating costs deducted from rent → net cash flow
- Net equity = property value − remaining loan balance
- Building depreciation at 2.5% of building value per year (for tax modelling)

### Sub-tool B: Multi-Property Portfolio (`pfSection` / `simulatePortfolio`)

Extends the single-property model to a rolling acquisition strategy.

- Properties are purchased at fixed intervals (default: every 5 years)
- Each property's purchase price scales with cumulative market growth: `price = pp_price × mkt[purchaseYear]`
- Rent and costs scale proportionally to the scaled purchase price
- Portfolio net equity aggregates across all properties
- ETF comparison (using Strategy I inputs) runs in parallel

**Call chain:**

```
pfOnEnter → renderPortfolio → simulatePortfolio → getPropInputs()
```

`getPropInputs()` reads the `pp_*` slider values directly from `propSection`'s DOM elements. Both sub-tools share the same sliders — changes in the single-property panel immediately flow through to the portfolio view.

---

## Strategy V — Precious Metals Portfolio

**Section:** `preciousSection`

Physical gold and silver bullion as an inflation hedge.

### Return Data

| Metal  | Historical CAGR (2009–2025) |
|--------|-----------------------------|
| Gold   | 8.0% p.a.                   |
| Silver | 6.6% p.a.                   |

### Live Spot Price Fetching

The app attempts three API sources in sequence with automatic fallback:

1. `metals.live` REST API
2. `goldprice.org` data feed
3. Yahoo Finance futures proxy

Falls back gracefully to "Live price unavailable" if all three fail (e.g., offline or CORS blocked).

### Simulation

DCA into a user-defined gold/silver blend over a build period, compounding at historical CAGR. Allocation split (gold % vs. silver %) is adjustable. Real returns are inflation-deflated using the shared rate from Strategy I.

---

## Strategy VI — DCA vs Timing the Market

**Section:** `dcaSection`

An evidence-based backtest using 11 years of real VOO daily price data (January 2015 – December 2025).

### The Question

*Does waiting for a price dip before buying outperform investing a fixed amount every single month?*

### Methodology

Two hypothetical investors with identical monthly budgets:

- **DCA investor:** Invests `$MONTHLY_AMT` on the first trading day of every month, unconditionally.
- **Market timer:** Holds cash each month. Buys only when the current price is below its trailing N-month moving average (i.e., a "dip" condition is detected). Otherwise, accumulates cash.

### Metrics Tracked

| Metric              | Description                                                |
|---------------------|------------------------------------------------------------|
| DCA final value     | Portfolio value of the automatic investor                  |
| Timer final value   | Portfolio value of the dip-buyer                           |
| Months invested     | How many of the 132 months each strategy was in the market |
| Cash drag           | Months the timer sat in cash waiting for a dip             |
| Relative performance| Final value comparison (DCA − Timer)                      |

### Key Insight

Across the 2015–2025 VOO dataset, consistent dollar-cost averaging outperforms dip-waiting in the large majority of scenarios. The primary drag on the timer's performance is cash sitting idle while the market continues to rise — dips that meet the threshold either don't arrive, or arrive only after significant run-ups have already been missed.

---

## Strategy VII — Fastest Path to Billionaire

**Section:** `memeSection`

A deliberately aggressive, concentrated-bet simulator — the educational counter-example to the evidence-based strategies.

Models concentrated positions in high-beta, high-volatility assets (leveraged ETFs, single stocks, high-growth themes) at maximum assumed CAGR. It exists to illustrate why these approaches carry extreme risk of total loss despite their theoretical upside at aggressive return assumptions.

> **Disclaimer:** For entertainment and educational illustration only. Not investment advice.

---

## Global Controls & Cross-Strategy State

### Inflation Rate

Defined in Strategy I via `v_inf`. Read everywhere as `getBase().inf`. Affects all real-return calculations and inflation-adjusted chart overlays across all seven strategies.

### Scenario Comparison Panel

A global panel allows users to freeze a snapshot of any strategy's output and compare it against a modified configuration side-by-side.

### Tax Settings Panel

A global tax panel exposes the user's marginal tax rate, which flows into:
- Salary sacrifice tax savings (Strategy III)
- Interest deductibility calculations (Strategy II, Equity Recycling)
- After-tax return comparisons

### PDF Export

Print CSS is embedded for all seven strategies. Activating the browser print dialog (`Ctrl+P` / `Cmd+P`) produces a clean, chart-inclusive PDF of the currently visible strategy.

---

## Data Flow

```
Strategy I (getBase())
    ├─ inf ────────────────────────── shared → all strategies
    ├─ dcaYrs, coast, wYrs, wdraw, winc
    └─ funds[]
                │
Strategy II ─── MEI_FUNDS[], MEI_FUNDS_SC4[], MEI_FUNDS_SC5[]
Strategy III ── SU_ETF_FUNDS[] + super balance simulation
Strategy IV ─── getPropInputs() reads propSection DOM
                simulatePortfolio() reads prop inputs for price / rent / costs
Strategy V ──── Live spot price APIs + historical CAGR constants
Strategy VI ─── Hardcoded VOO price array (2015–2025)
Strategy VII ── User-defined aggressive CAGR assumptions
```

---

## Implementation Notes

- **Chart.js 4 dataset visibility:** Must use `chart.getDatasetMeta(i).hidden = value` — direct mutation of `dataset.hidden` after chart creation has no effect in Chart.js 4.
- **propSection / pfSection coupling:** `pfSection` reads its property inputs from `propSection`'s DOM via `getPropInputs()`. Both must exist in the DOM. `propSection` starts visible on page load (no inline `style="display:none"` attribute).
- **ETF picker modal:** The single `#etfOverlay` DOM element is shared by all strategies. `activePickerMode` tracks which strategy opened the picker and routes the selected fund to the correct fund array in `selectETF()`.
- **Section visibility rule:** Sections must use `style="display:none"` HTML attributes, not CSS `display:none` rules. CSS rules take precedence over inline style removal by the nav engine.
- **Script block scoping:** All `<script>` blocks share the global `window` scope. `const`/`let` at the top level of one block are visible in all subsequent blocks. A duplicate `const` declaration across blocks — or a stray `}` at the top level — causes a `SyntaxError` that silently prevents the entire affected block from executing, including all hoisted function declarations within it.

---

## File Structure

```
index.html
├── <head>           CSS variables, global layout, landing page styles
├── Landing Page     Disclaimer + entry CTA
├── Strategy Picker  Seven strategy cards + nav engine
├── Strategy Bar     Persistent top bar inside any active strategy
├── etfSection       Strategy I — ETF simulation + shared ETF picker modal
├── propSection      Strategy IV input sliders (single rental property analysis)
├── pfSection        Strategy IV portfolio view (multi-property scaling)
├── meiSection       Strategy II — Mortgage + ETF five-scenario comparison
├── superSection     Strategy III — Australian superannuation salary sacrifice
├── preciousSection  Strategy V — Precious Metals (gold + silver)
├── dcaSection       Strategy VI — DCA vs Market Timing backtest
├── memeSection      Strategy VII — High-risk concentrated bets
├── ETF Overlay      Shared fund picker modal (#etfOverlay)
└── <script> blocks  Scenario comparison, tax panel, DCA extra controls
```

---

*Not financial advice. All projections are illustrative models based on historical averages and user-defined assumptions. Past performance does not guarantee future results.*
