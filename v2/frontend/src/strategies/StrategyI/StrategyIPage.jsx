import React, { useState } from 'react';
import { api } from '../../shared/api.js';
import { useSharedState } from '../../shared/SharedStateContext.jsx';

// Faithful re-implementation of the legacy index.html inputs for Strategy I:
// dcaYrs / coast / wYrs / wdraw / winc, a list of funds (name, monthly $, growth%),
// and lump sums (year, amount). Posts to the gateway, which proxies to the
// strategy-1-etf microservice's ported simulate().

const fmtM = (n) => `$${Math.round(n).toLocaleString()}`;

export default function StrategyIPage() {
  const { inflation } = useSharedState();
  // wdraw = starting MONTHLY withdrawal $ amount; winc = annual withdrawal
  // increase rate as a decimal (e.g. 0.03 = 3%/yr). See calc.js @param docs —
  // these two were caught swapped/mis-scaled during QA round-trip testing.
  const [base, setBase] = useState({ dcaYrs: 10, coast: 5, inf: inflation.rate, wdraw: 4000, winc: 0.03, wYrs: 25 });
  // Field names (sym/rate/dca) match calc.js's ported contract exactly — see
  // strategy-1-etf/calc.js's @param docs. Do not rename without updating both.
  const [funds, setFunds] = useState([{ sym: 'VOO', dca: 1000, rate: 8 }]);
  const [lumpSums, setLumpSums] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateBase = (k, v) => setBase((b) => ({ ...b, [k]: Number(v) }));
  const updateFund = (i, k, v) => setFunds((f) => f.map((x, idx) => (idx === i ? { ...x, [k]: k === 'sym' ? v : Number(v) } : x)));
  const addFund = () => setFunds((f) => [...f, { sym: `Fund ${f.length + 1}`, dca: 500, rate: 7 }]);
  const removeFund = (i) => setFunds((f) => f.filter((_, idx) => idx !== i));

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.simulateEtf(base, funds, lumpSums);
      setResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }}>
      <h1>Strategy I — Invest in ETFs</h1>
      <p style={{ color: '#64748b', fontSize: 13 }}>
        Fully ported from the legacy app — same <code>simulate()</code> math, now served by the
        strategy-1-etf microservice via the gateway.
      </p>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 14 }}>Timeline</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Field label="DCA years" value={base.dcaYrs} onChange={(v) => updateBase('dcaYrs', v)} />
          <Field label="Coast years" value={base.coast} onChange={(v) => updateBase('coast', v)} />
          <Field label="Withdraw years" value={base.wYrs} onChange={(v) => updateBase('wYrs', v)} />
          <Field label="Inflation %" value={base.inf} step={0.001} onChange={(v) => updateBase('inf', v)} />
          <Field label="Starting monthly withdrawal $" value={base.wdraw} onChange={(v) => updateBase('wdraw', v)} />
          <Field label="Withdrawal increase/yr %" value={base.winc} step={0.001} onChange={(v) => updateBase('winc', v)} />
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 14 }}>Funds</h3>
        {funds.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
            <input value={f.sym} onChange={(e) => updateFund(i, 'sym', e.target.value)} style={{ width: 100 }} />
            <input type="number" value={f.dca} onChange={(e) => updateFund(i, 'dca', e.target.value)} style={{ width: 100 }} title="Monthly $" />
            <input type="number" value={f.rate} onChange={(e) => updateFund(i, 'rate', e.target.value)} style={{ width: 80 }} title="Growth %" />
            <button onClick={() => removeFund(i)} style={{ fontSize: 12 }}>Remove</button>
          </div>
        ))}
        <button onClick={addFund} style={{ fontSize: 12 }}>+ Add fund</button>
      </section>

      <button onClick={run} disabled={loading} style={{ marginTop: 24, padding: '8px 16px', fontWeight: 600 }}>
        {loading ? 'Simulating…' : 'Run simulation'}
      </button>

      {error && <p style={{ color: '#dc2626', marginTop: 12 }}>{error}</p>}

      {result && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 14 }}>Result</h3>
          <p style={{ fontSize: 13 }}>
            Total years: {result.TOTAL} · Funds: {result.N} · Total DCA/mo: {fmtM(result.totalDCApm)}
          </p>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th>Year</th><th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {result.data?.slice(0, 10).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td>{row.yr ?? i + 1}</td>
                  <td>{fmtM(row.comb ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {result.data?.length > 10 && <p style={{ fontSize: 11, color: '#94a3b8' }}>…showing first 10 of {result.data.length} years</p>}
        </section>
      )}
    </div>
  );
}

function Field({ label, value, onChange, step = 1 }) {
  return (
    <label style={{ fontSize: 12 }}>
      {label}
      <input type="number" step={step} value={value} onChange={(e) => onChange(e.target.value)} style={{ display: 'block', width: '100%', marginTop: 4 }} />
    </label>
  );
}
