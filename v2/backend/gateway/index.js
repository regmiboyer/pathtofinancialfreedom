// ─────────────────────────────────────────────────────────────────────────
// Investment Planner — Gateway Service
// ─────────────────────────────────────────────────────────────────────────
// Owns the three pieces of state that, in the original index.html, leaked
// across strategies as global JS variables read directly by other strategies:
//   • window._taxSettings   (read by every strategy's "after tax" toggle)
//   • getBase().inf         (Strategy I's inflation rate, read directly by
//                             Strategy IV — see index.html line ~4052/4641)
//   • compareDrawer state   (Scenario Comparison Drawer snapshots)
//
// The frontend talks ONLY to this gateway. Strategy microservices never talk
// to each other directly — if Strategy IV needs Strategy I's inflation rate,
// it asks the gateway for shared state, not Strategy I's service.
// ─────────────────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Registry of strategy microservices this gateway proxies to.
// Update this list as each strategy gets ported (see JIRA-88 migration roadmap).
const STRATEGIES = {
  etf:               { name: 'Strategy I — Invest in ETFs',             url: process.env.STRATEGY_1_URL || 'http://localhost:4001', status: 'live' },
  'mortgage-etf':     { name: 'Strategy II — Mortgage & ETF Investment', url: process.env.STRATEGY_2_URL || 'http://localhost:4002', status: 'stub' },
  super:              { name: 'Strategy III — Super Salary Sacrifice',   url: process.env.STRATEGY_3_URL || 'http://localhost:4003', status: 'stub' },
  property:           { name: 'Strategy IV — High Touch Property',      url: process.env.STRATEGY_4_URL || 'http://localhost:4004', status: 'stub' },
  'precious-metals':  { name: 'Strategy V — Precious Metals Portfolio',  url: process.env.STRATEGY_5_URL || 'http://localhost:4005', status: 'stub' },
  dca:                { name: 'Strategy VI — DCA vs Timing the Market', url: process.env.STRATEGY_6_URL || 'http://localhost:4006', status: 'stub' },
  meme:               { name: 'Strategy VII — Fastest Path to Billionaire', url: process.env.STRATEGY_7_URL || 'http://localhost:4007', status: 'stub' },
  voo500:             { name: 'Strategy VIII — VOO vs V500 on Stake',   url: process.env.STRATEGY_8_URL || 'http://localhost:4008', status: 'stub' },
};

// ── In-memory shared state (single source of truth for cross-strategy data) ─
// A real deployment would back this with a small DB; for local-only use,
// in-memory + an optional JSON snapshot file is enough.
let sharedState = {
  taxSettings: { enabled: false, incomeTax: 32.5, cgt: 23.5 },
  inflation:   { rate: 0.03 },              // mirrors Strategy I's getBase().inf
  compareDrawer: { open: false, scenarios: [] }, // Scenario Comparison Drawer snapshots
};

app.get('/health', (_req, res) => res.json({ ok: true, service: 'gateway' }));

app.get('/api/strategies', (_req, res) => {
  const list = Object.entries(STRATEGIES).map(([id, s]) => ({ id, name: s.name, status: s.status }));
  res.json(list);
});

// ── Shared state CRUD ───────────────────────────────────────────────────
app.get('/api/shared-state', (_req, res) => res.json(sharedState));

app.patch('/api/shared-state/tax-settings', (req, res) => {
  sharedState.taxSettings = { ...sharedState.taxSettings, ...req.body };
  res.json(sharedState.taxSettings);
});

app.patch('/api/shared-state/inflation', (req, res) => {
  if (typeof req.body.rate === 'number') sharedState.inflation.rate = req.body.rate;
  res.json(sharedState.inflation);
});

app.post('/api/shared-state/compare-drawer/scenarios', (req, res) => {
  const scenario = { id: Date.now(), addedAt: new Date().toISOString(), ...req.body };
  sharedState.compareDrawer.scenarios.push(scenario);
  res.status(201).json(scenario);
});

app.delete('/api/shared-state/compare-drawer/scenarios/:id', (req, res) => {
  const id = Number(req.params.id);
  sharedState.compareDrawer.scenarios = sharedState.compareDrawer.scenarios.filter(s => s.id !== id);
  res.status(204).end();
});

// ── Proxy: /api/strategies/:id/* → the matching microservice ─────────────
app.use('/api/strategies/:id', async (req, res) => {
  const strategy = STRATEGIES[req.params.id];
  if (!strategy) return res.status(404).json({ error: `Unknown strategy '${req.params.id}'` });

  const subPath = req.originalUrl.replace(`/api/strategies/${req.params.id}`, '') || '/';
  const target = strategy.url + subPath;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers: { 'content-type': 'application/json' },
      body: ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
    });
    const body = await upstream.json().catch(() => ({}));
    res.status(upstream.status).json(body);
  } catch (err) {
    // AC3: a downed strategy service must not take the gateway (or other
    // strategies) down with it.
    res.status(503).json({
      error: `Strategy service '${req.params.id}' is unreachable`,
      detail: err.message,
      hint: `Is it running on ${strategy.url}? (npm run dev inside its service folder)`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`[gateway] listening on http://localhost:${PORT}`);
});
