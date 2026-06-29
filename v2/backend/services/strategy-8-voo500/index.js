import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4008;

app.get('/health', (_req, res) => res.json({ ok: true, service: 'strategy-8-voo500', status: 'stub' }));

// TODO: port the calculation logic for Strategy VIII — VOO vs V500 on Stake — see PORT-TODO.md in this folder.
app.use((req, res) => {
  res.status(501).json({
    error: 'Not implemented yet',
    service: 'strategy-8-voo500',
    message: "Strategy VIII — VOO vs V500 on Stake hasn't been ported from index.html yet. See PORT-TODO.md for what to lift and where.",
  });
});

app.listen(PORT, () => {
  console.log(`[strategy-8-voo500] STUB listening on http://localhost:4008 — not yet implemented`);
});
