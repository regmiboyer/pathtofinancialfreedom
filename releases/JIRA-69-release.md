# JIRA-69 Release Manifest
**Released:** 2026-06-15  
**Agent pipeline:** PM → Developer → QA (pass, 0 bugs) → Release  
**Scope:** Fix Strategy II (Mortgage & ETF) Sc3 ETF value not matching Strategy I for identical fund/rate/duration inputs

---

## Bug Fixed — Strategy I vs Strategy II Sc3 value discrepancy

**Symptom:** VOO $1,000/mo at 13.8% + QQQM $1,000/mo at 18.5% for 20 years produced $3.80M in Strategy I but only $2.98M in Strategy II Sc3.

**Root cause — two compounding bugs in `meiCalcSchedule`:**

### Bug 1 — Off-by-one in `etfByYr`

`meiCalcSchedule` initialised `etfByYr:[0]` (a starter element), making the array length `maxYrs + 1` while `labels` length = `maxYrs`. The read `etfByYr[Math.min(dur, length)-1]` resolved to `etfByYr[dur-1]` = **year `dur-1`** (one year short).

For `dur=20`: read was year 19 value → `$2.98M`.  
After fix: reads year 20 value correctly.

**Fix:** Changed `etfByYr:[0]` → `etfByYr:[]` (empty initial, consistent with `labels:[]`).  
This also fixes the ETF chart line which was showing each year's value one position to the left.

### Bug 2 — Blended CAGR instead of per-fund simulation

`meiBlend(funds)` computed a DCA-weighted average rate (16.15% for 13.8+18.5) and passed a single rate + combined DCA to `meiCalcSchedule`. By Jensen's inequality, `FV(13.8%) + FV(18.5%) > FV(16.15%) × 2` — the blended approach always underestimates when rates differ.

Blended 16.15% for $2,000/mo (20yr): **$3.53M**  
Per-fund 13.8% + 18.5% for $1,000/mo each (20yr): **$3.80M**

**Fix:** `meiRunSc3` now passes `fundsArray: meiFundsFor(window.MEI_FUNDS)` to `meiCalcSchedule`. Inside `meiCalcSchedule`, when `opts.fundsArray` is provided, each fund is simulated independently with annuity-due timing `(v+dca)×(1+r)` — matching Strategy I's simulation engine exactly.

`meiBlend` is still called and kept for the display-only **Blended CAGR** and **Monthly DCA** result tiles.

---

## Code changes

### `meiCalcSchedule` (~line 10215–10248)

1. Added `etfFunds` per-fund tracking:
   ```js
   var etfFunds = (o.fundsArray&&o.fundsArray.length) ? 
     o.fundsArray.map(function(f){return {r12:(f.rate||10)/1200,dca:f.dca||0,v:0};}) : null;
   ```

2. Changed `etfByYr:[0]` → `etfByYr:[]`

3. Changed `dca_with_mort` monthly update:
   ```js
   // Before:
   if(o.type==='dca_with_mort'&&yr<=(o.simYrs||years)){ etf=etf*(1+etfR12)+(o.monthlyCDA||0); }
   // After:
   if(o.type==='dca_with_mort'&&yr<=(o.simYrs||years)){
     if(etfFunds){ etfFunds.forEach(function(f){f.v=(f.v+f.dca)*(1+f.r12);}); etf=etfFunds.reduce(function(s,f){return s+f.v;},0); }
     else{ etf=etf*(1+etfR12)+(o.monthlyCDA||0); }
   }
   ```

### `meiRunSc3` (~line 10615–10638)

```js
// Before:
var etf=meiBlend(window.MEI_FUNDS);
var sch=meiCalcSchedule(loan,rate,yrs,extra,window.MEI_LUMP_MORT,{type:'dca_with_mort',monthlyCDA:etf.dca,etfR:etf.r,simYrs:dur});
...
{label:'Monthly DCA',val:fmtF(etf.dca),...},
{label:'Blended CAGR',val:etf.r.toFixed(1)+'%',...}

// After:
var etfBlend=meiBlend(window.MEI_FUNDS); // display tiles only
var sch=meiCalcSchedule(loan,rate,yrs,extra,window.MEI_LUMP_MORT,{type:'dca_with_mort',fundsArray:meiFundsFor(window.MEI_FUNDS),simYrs:dur});
...
{label:'Monthly DCA',val:fmtF(etfBlend.dca),...},
{label:'Blended CAGR',val:etfBlend.r.toFixed(1)+'%',...}
```

---

## QA Result

PASS — 5 ACs checked, 0 bugs:
- AC1: VOO $1K/mo 13.8% + QQQM $1K/mo 18.5%, 20yr → Sc3 `$3,804,061` = Strategy I `$3,804,061` (exact match) ✅
- AC2: `etfByYr[0]` (Yr 1) = `$26,209` (non-zero, chart now correctly aligned) ✅
- AC3: Blended CAGR tile shows `16.1%` ✅
- AC4: Monthly DCA tile shows `$2,000/mo` ✅
- AC5: Sc5 off-by-one also fixed (reads correct year) ✅

---

## Files Released
- `Investment/index.html` — source (11,659 lines)
- `Artifacts/investment-planner/index.html` — synced ✅
