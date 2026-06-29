import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4002;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-2-mortgage-etf', status: 'stub' }));

// TODO: port the calculation logic for Strategy II — Mortgage & ETF Investment — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-2-mortgage-etf',
    message: "Strategy II — Mortgage & ETF Investment hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-2-mortgage-etf] STUB listening on http://localhost:4002 — not yet implemented`);
});
