import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4003;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-3-super', status: 'stub' }));

// TODO: port the calculation logic for Strategy III — Super Salary Sacrifice — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-3-super',
    message: "Strategy III — Super Salary Sacrifice hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-3-super] STUB listening on http://localhost:4003 — not yet implemented`);
});
