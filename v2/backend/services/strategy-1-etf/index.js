import express from 'express';
import cors from 'cors';
import { simulate } from './calc.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4001;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-1-etf' }));

// POST /simulate
// body: { base: {dcaYrs, coast, inf, wdraw, winc, wYrs}, funds: [...], lumpSums: [...] }
app.post('/simulate', (req, res) => {
  const { base, funds, lumpSums } = req.body || {};
  if (!base) return res.status(400).json({ error: 'Missing "base" ({dcaYrs, coast, inf, wdraw, winc, wYrs})' });

  try {
    const result = simulate(base, funds || [], lumpSums || []);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: 'Simulation failed', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[strategy-1-etf] listening on http://localhost:${PORT}`);
});
