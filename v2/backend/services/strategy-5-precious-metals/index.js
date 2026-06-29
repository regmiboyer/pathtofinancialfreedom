import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4005;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-5-precious-metals', status: 'stub' }));

// TODO: port the calculation logic for Strategy V — Precious Metals Portfolio — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-5-precious-metals',
    message: "Strategy V — Precious Metals Portfolio hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-5-precious-metals] STUB listening on http://localhost:4005 — not yet implemented`);
});
