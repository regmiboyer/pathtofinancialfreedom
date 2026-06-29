import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4006;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-6-dca', status: 'stub' }));

// TODO: port the calculation logic for Strategy VI — DCA vs Timing the Market — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-6-dca',
    message: "Strategy VI — DCA vs Timing the Market hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-6-dca] STUB listening on http://localhost:4006 — not yet implemented`);
});
