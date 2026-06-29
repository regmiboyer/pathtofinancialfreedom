// ─────────────────────────────────────────────────────────────────────────
// Strategy I — Invest in ETFs
// Faithful port of `getBase()` + `simulate()` from index.html (lines ~2688-2783).
//
// Original implementation read its inputs from DOM elements (`g('v_dcaYrs')`,
// global `funds`/`lumpSums` arrays, etc.) and wrote into module-level `rows`.
// This port is pure and parameterized: every input the DOM/global state used
// to provide is now a function argument, and `rows` (used only by the
// original's Chart.js phase-shading plugin) is returned alongside `data`
// instead of being stashed in a global, since chart rendering is a frontend
// concern, not a calculation-engine concern.
//
// AC2 (JIRA-88): response shape must match the original exactly —
//   { data, dcaYrs, coast, wYrs, TOTAL, totalDCApm, wdraw, winc, N }
// ─────────────────────────────────────────────────────────────────────────

/**
 * @param {object} base
 * @param {number} base.dcaYrs   years of dollar-cost-averaging (investing phase)
 * @param {number} base.coast    years of "coast" (no contributions, no withdrawals)
 * @param {number} base.inf      inflation rate as a decimal (e.g. 0.03 for 3%)
 * @param {number} base.wdraw    starting monthly withdrawal amount
 * @param {number} base.winc     annual withdrawal increase rate as a decimal
 * @param {number} base.wYrs     years of withdrawal phase
 * @param {Array<{sym:string, rate:number, dca:number}>} funds
 *        rate = annual % growth rate (e.g. 7 for 7%), dca = monthly DCA $ into this fund
 * @param {Array<{yr:number, type:'invest'|'withdraw', amt:number, allocations?:Array<{fundSym:string, amt:number}>}>} lumpSums
 * @returns {{data: object[], dcaYrs:number, coast:number, wYrs:number, TOTAL:number, totalDCApm:number, wdraw:number, winc:number, N:number}}
 */
export function simulate(base, funds = [], lumpSums = []) {
  const { dcaYrs, coast, inf, wdraw, winc, wYrs } = base;
  const N = funds.length;
  const TOTAL = dcaYrs + coast + wYrs;

  if (TOTAL === 0) {
    return { data: [], dcaYrs, coast, wYrs, TOTAL: 0, totalDCApm: 0, wdraw, winc, N };
  }

  const mRates = funds.map(f => (f.rate / 100) / 12);
  const dcas = funds.map(f => f.dca || 0);
  const totalDCApm = dcas.reduce((s, v) => s + v, 0);

  const lumpInMap = {}, lumpOutMap = {}, lumpInByFund = {};
  lumpSums.forEach(l => {
    if (l.yr >= 1 && l.yr <= TOTAL) {
      if (l.type === 'invest') {
        if (l.allocations && l.allocations.length) {
          l.allocations.forEach(a => {
            if (!(a.amt > 0)) return;
            const fi = funds.findIndex(f => f.sym === a.fundSym);
            if (fi >= 0) {
              if (!lumpInByFund[l.yr]) lumpInByFund[l.yr] = {};
              lumpInByFund[l.yr][fi] = (lumpInByFund[l.yr][fi] || 0) + a.amt;
            }
            lumpInMap[l.yr] = (lumpInMap[l.yr] || 0) + a.amt;
          });
        } else if (l.amt > 0) {
          lumpInMap[l.yr] = (lumpInMap[l.yr] || 0) + l.amt; // legacy format
        }
      } else if (l.amt > 0) {
        lumpOutMap[l.yr] = (lumpOutMap[l.yr] || 0) + l.amt;
      }
    }
  });

  let vals = new Array(N).fill(0);
  let cumInv = 0, cumWd = 0;
  const data = [];

  for (let m = 1; m <= TOTAL * 12; m++) {
    const yr = Math.ceil(m / 12);
    const phase = yr <= dcaYrs ? 1 : yr <= (dcaYrs + coast) ? 2 : 3;
    const dYr = yr - dcaYrs - coast;

    if (phase === 1) {
      vals = vals.map((v, i) => v + dcas[i]);
      cumInv += totalDCApm;
    } else if (phase === 3) {
      const mW = wdraw * Math.pow(1 + winc, dYr - 1);
      const tot = vals.reduce((s, v) => s + v, 0);
      if (tot > 0) { const w = Math.min(mW, tot); vals = vals.map(v => v - w * (v / tot)); cumWd += w; }
    }
    vals = vals.map((v, i) => v * (1 + mRates[i]));

    if (m % 12 === 0) {
      // Lump invest: add money to specific funds, or proportionally (legacy)
      let lumpIn = 0; const lumpInAmt = lumpInMap[yr] || 0;
      if (lumpInAmt > 0) {
        const fundAllocs = lumpInByFund[yr];
        if (fundAllocs) {
          Object.entries(fundAllocs).forEach(([fi, amt]) => { if (vals[+fi] !== undefined) vals[+fi] += amt; });
          const unalloc = lumpInAmt - Object.values(fundAllocs).reduce((s, v) => s + v, 0);
          if (unalloc > 0) { const tot0 = vals.reduce((s, v) => s + v, 0); if (tot0 > 0) vals = vals.map(v => v + unalloc * (v / tot0)); else vals[0] = (vals[0] || 0) + unalloc; }
        } else {
          const tot0 = vals.reduce((s, v) => s + v, 0);
          if (tot0 > 0) vals = vals.map(v => v + lumpInAmt * (v / tot0));
          else { const eq = lumpInAmt / (N || 1); vals = vals.map(() => eq); }
        }
        cumInv += lumpInAmt; lumpIn = lumpInAmt;
      }
      // Lump withdraw: take money out proportionally
      let lump = 0; const lumpAmt = lumpOutMap[yr] || 0;
      if (lumpAmt > 0) {
        const tot2 = vals.reduce((s, v) => s + v, 0);
        if (tot2 > 0) { lump = Math.min(lumpAmt, tot2); vals = vals.map(v => v - lump * (v / tot2)); cumWd += lump; }
      }
      const comb = vals.reduce((s, v) => s + v, 0);
      const real = comb / Math.pow(1 + inf, yr);
      const regFlow = phase === 1 ? totalDCApm * 12 : phase === 3 ? -(wdraw * Math.pow(1 + winc, dYr - 1) * 12) : 0;
      data.push({
        yr, phase, vals: [...vals], comb, real, cumInv, cumWd, regFlow,
        lump, lumpIn, isLump: lump > 0, isLumpIn: lumpIn > 0,
      });
    }
  }

  return { data, dcaYrs, coast, wYrs, TOTAL, totalDCApm, wdraw, winc, N };
}
