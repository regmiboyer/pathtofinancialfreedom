import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4007;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-7-meme', status: 'stub' }));

// TODO: port the calculation logic for Strategy VII — Fastest Path to Billionaire — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-7-meme',
    message: "Strategy VII — Fastest Path to Billionaire hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-7-meme] STUB listening on http://localhost:4007 — not yet implemented`);
});
