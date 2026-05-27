# path-to-financial-freedom
# Path To Financial Freedom

A self-contained, interactive financial planning tool built as a single HTML file. No backend, no sign-up, no data leaves your browser. Open `index.html` and start modelling your path to financial independence.

**Live site:** [your-github-pages-url-here]

---

## What This Tool Does

The planner lets you model three distinct investment strategies side by side — ETF investing, a single rental property, and a growing property portfolio — then compares them on equal footing in a final head-to-head section. Every number updates in real time as you change inputs on the left-hand panel.

---

## The Four Sections

### Section 1 — Investment in Vanguard ETFs

Model a long-term ETF investment strategy with multiple funds running simultaneously.

**What you can configure:**
- **Starting capital** — the lump sum you invest on day one
- **Monthly DCA (Dollar Cost Averaging)** — a fixed amount added every month automatically
- **One-off lump sum injections** — add extra capital at any specific year (e.g. an inheritance, bonus, or property sale proceeds)
- **Investment horizon** — how many years you want to simulate (up to 50 years)
- **Inflation rate** — used across all sections to show real (today's dollar) values alongside nominal values
- **Tax drag** — an annual percentage reduction applied to growth to account for capital gains tax on distributions

**Funds:**
- Add up to 5 ETFs from a preset list (VAS, VGS, IVV, NDQ, VDHG, A200, and more)
- Each fund has a historical CAGR pre-loaded but you can override it
- Assign a DCA split percentage to each fund (must total 100%)
- Each fund is colour-coded throughout all charts

**What it shows:**
- A 50-year growth chart with solid lines (nominal value) and dashed lines (real value in today's dollars)
- A summary tile with total portfolio value, total contributions, and total gains
- Per-fund breakdown tiles showing each fund's final value and contribution
- A timeline breakdown showing the "accumulation phase" vs "drawdown phase" (if you set a retirement horizon)

---

### Section 2 — Rental Property Investment: Sydney Comparison

Model buying and holding a single investment property in Sydney over a long-term horizon.

**What you can configure:**
- **Property purchase price** — the upfront cost of the property
- **Deposit percentage** — how much of the price you pay upfront (the rest becomes a mortgage)
- **Stamp duty** — automatically included as an upfront cost
- **Annual property growth rate** — how fast the property appreciates in value each year
- **Mortgage interest rate** — the annual rate on your loan
- **Mortgage term** — how many years to repay the loan
- **Weekly rent** — what tenants pay per week
- **Rent increase rate** — rent increases by this percentage **every third year** (reflecting realistic lease renewal cycles)
- **Annual operating costs** — property management, insurance, council rates, maintenance
- **Vacancy allowance** — assumes 2 weeks per year vacancy between tenants
- **Marketing costs** — $500/year to advertise for new tenants

**What "real rent" means:**
The tool calculates **net cash flow** as: `Rent collected − Operating costs − Mortgage repayment`. This is the true out-of-pocket position each year, not just gross rent.

**What it shows:**
- A combined chart with property value, remaining mortgage, and cumulative net cash flow over time
- An income breakdown chart showing rent, costs, and mortgage payments year by year
- Summary tiles covering: final property value, total mortgage paid, total rent collected, total operating costs, net profit, and cumulative cash flow
- A triangle indicator showing what portion of the mortgage was covered by rent vs paid out of pocket
- An **"ETF comparison tile"** at the bottom showing: if you had invested your deposit and ongoing cash shortfalls into ETFs instead, what would that portfolio be worth?

---

### Section 3 — Property Portfolio Strategy: Buy Every 5 Years

Models what happens when you reinvest your rental income and equity to buy an additional property every 5 years, building a multi-property portfolio over 30 years.

**Key behaviours:**
- All property price, rent, growth, and mortgage settings are **pulled directly from Section 2** — change them there and this section updates automatically
- Every 5 years, a new property is added to the portfolio at the then-current market price
- Each property ages independently — its rent, mortgage balance, and cash flow are tracked separately
- Rent increases follow the same triennial (every 3 years) rule as Section 2
- Portfolio-level cash flow is the sum of all individual property cash flows

**What it shows:**
- A stacked chart showing the value of each property in the portfolio over time
- A combined cash flow chart showing when the portfolio tips from cash-flow negative to positive
- Summary tiles covering: total portfolio value, total equity, total debt, cumulative rent, cumulative costs, and cumulative mortgage payments
- Breakdown of how much of the mortgage was covered by rent vs paid out of pocket across the whole portfolio
- An **"ETF comparison tile"** showing what the same total capital invested into ETFs would be worth

---

### Section 4 — ETF vs Property: Like-for-Like Comparison

A direct apples-to-apples comparison that takes the **same total capital** invested in the property strategy (deposit + all out-of-pocket shortfalls) and asks: *what if that money had gone into ETFs instead?*

**What it shows:**
- A side-by-side line chart: Section 1 ETF portfolio vs Section 3 property portfolio over 30 years
- Final value comparison tile
- Annualised return comparison

This section recalculates automatically whenever Section 1 or Section 3 inputs change.

---

## How the Inputs Work

All inputs are on the **left-hand panel**. There are no sliders — every field is a free-form number input so you can type any value precisely.

| Symbol | Meaning |
|--------|---------|
| `$` prefix | Dollar amount |
| `%` suffix | Percentage (enter as a whole number, e.g. `7` for 7%) |
| `yr` suffix | Number of years |

Changes apply immediately — charts and tables update within a fraction of a second.

---

## How Sections Connect

The sections are **live-linked**:

- Section 2 and 3 share the same property settings
- Section 3 pulls all its inputs from Section 2 automatically
- Section 4 reads from both Section 1 (ETF returns) and Section 3 (property capital deployed)
- Inflation rate from Section 1 is used across all sections for real-value calculations

This means you only need to update one input in the right place and the entire model refreshes.

---

## Triennial Rent Increase Logic

Rent does not increase every year. Instead it increases by the configured percentage **once every three years**, reflecting the real-world pattern of rent reviews at lease renewal. The formula used is:

```
Rent in year N = Starting Rent × (1 + rent_increase_rate) ^ floor((N−1) / 3)
```

This means:
- Years 1–3: base rent
- Years 4–6: rent × (1 + rate)
- Years 7–9: rent × (1 + rate)²
- And so on

---

## Vacancy & Marketing Costs (Section 2 & 3)

Two costs are baked in by default and cannot be turned off, as they reflect realistic property holding costs in Sydney:

- **Vacancy:** 2 weeks per year of zero rent income (approximately 3.85% vacancy rate)
- **Marketing:** $500/year to advertise the property between tenants

These are subtracted from gross rent before calculating net cash flow.

---

## Running It Locally

No installation required. Just open the file:

```bash
open index.html
```

Or double-click `index.html` in Finder. It runs entirely in your browser.

---

## Updating the Live Site

After making changes to `index.html`, push to GitHub and the live site updates automatically:

```bash
git add index.html
git commit -m "describe your change"
git push
```

GitHub Pages rebuilds the site within 30–60 seconds.

---

## Technical Notes

- Built as a single self-contained HTML file (~170KB)
- Uses [Chart.js 4.5.0](https://www.chartjs.org/) for all charts (loaded from CDN)
- No frameworks, no build step, no dependencies beyond Chart.js
- All calculations run client-side in JavaScript — no data is sent anywhere
- Responsive layout: works on desktop and tablet (best experienced on a wide screen)

---

## Disclaimer

This tool is for **educational and illustrative purposes only**. It does not constitute financial advice. All projections are based on assumptions you configure and historical averages — actual investment returns, property values, interest rates, and rental income will vary. Consult a licensed financial adviser before making investment decisions.

