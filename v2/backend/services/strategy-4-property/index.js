import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4004;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-4-property', status: 'stub' }));

// TODO: port the calculation logic for Strategy IV — High Touch Property Portfolio — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-4-property',
    message: "Strategy IV — High Touch Property Portfolio hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-4-property] STUB listening on http://localhost:4004 — not yet implemented`);
});
