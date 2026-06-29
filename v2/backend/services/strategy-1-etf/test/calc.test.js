// Minimal sanity check — run with `npm test` (no test framework dependency).
// QA phase (Task #140) will run this and verify the output shape per AC2.
import assert from 'node:assert';
import { simulate } from '../calc.js';

const base = { dcaYrs: 5, coast: 2, inf: 0.03, wdraw: 2000, winc: 0.03, wYrs: 3 };
const funds = [
  { sym: 'VOO', rate: 8, dca: 1000 },
  { sym: 'VGT', rate: 10, dca: 500 },
];
const lumpSums = [
  { yr: 2, type: 'invest', amt: 5000 },
  { yr: 8, type: 'withdraw', amt: 3000 },
];

const result = simulate(base, funds, lumpSums);

// Shape check (AC2)
for (const key of ['data', 'dcaYrs', 'coast', 'wYrs', 'TOTAL', 'totalDCApm', 'wdraw', 'winc', 'N']) {
  assert.ok(key in result, `missing key: ${key}`);
}
assert.strictEqual(result.TOTAL, 10);
assert.strictEqual(result.N, 2);
assert.strictEqual(result.data.length, 10); // one row per year
assert.strictEqual(result.totalDCApm, 1500);

// Zero-duration edge case
const empty = simulate({ dcaYrs: 0, coast: 0, inf: 0.03, wdraw: 0, winc: 0.03, wYrs: 0 }, [], []);
assert.deepStrictEqual(empty.data, []);
assert.strictEqual(empty.TOTAL, 0);

console.log('✅ strategy-1-etf calc.js: all assertions passed');
