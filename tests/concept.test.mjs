// node --test tests/ — the strategy table in docs/CONCEPT.md must say what the money model does.
// If econ.js changes, rerun the numbers (same loop as below), update CONCEPT.md and run docs/pdf.sh.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as E from '../econ.js';
import { STR } from '../i18n.js';

const SEEDS = 300;
const ROWS = { 'Read the board': 'best', 'Same plan, always at the ZERO FEE': 'zero', 'Send everything': 'sendAll',
  'Send all but a small': 'steady', 'Same plan as the first, but the phone': 'informal', 'Always hold AED 2,500': 'hoard' };
const fmt = n => Math.round(n).toLocaleString('en-US');

function year(strategy) {
  const t = { received: 0, costs: 0, lostInformal: 0, reserve: 0, short: 0, lostAny: 0 }, endings = {};
  for (let seed = 1; seed <= SEEDS; seed++) {
    const r = E.simulate(strategy, seed);
    for (const k of ['received', 'costs', 'lostInformal', 'reserve', 'short']) t[k] += r[k];
    if (r.lostInformal > 0) t.lostAny++;
    endings[r.ending] = (endings[r.ending] || 0) + 1;
  }
  for (const k of Object.keys(t)) t[k] /= SEEDS;
  const [top, n] = Object.entries(endings).sort((a, b) => b[1] - a[1])[0];
  t.ending = `${STR['end_' + top][0]} (${Math.round(100 * n / SEEDS)}%)`;
  return t;
}

test('CONCEPT.md strategy table matches simulate()', () => {
  const doc = readFileSync(new URL('../docs/CONCEPT.md', import.meta.url), 'utf8');
  for (const [label, strategy] of Object.entries(ROWS)) {
    const line = doc.split('\n').find(l => l.startsWith(`| ${label}`));
    assert.ok(line, `row "${label}" in CONCEPT.md`);
    const cells = line.split('|').slice(2, -1).map(c => c.trim());
    const y = year(strategy);
    assert.deepEqual(cells, [fmt(y.received), fmt(y.costs), fmt(y.lostInformal), fmt(y.reserve), y.short.toFixed(1), y.ending],
      `row "${label}" (${strategy})`);
  }
  const phone = year('informal');
  assert.ok(doc.includes(`loses money in ${Math.round(100 * phone.lostAny)}% of the years`), 'phone offer: share of years with a loss');
  const best = year('best'), zero = year('zero');
  const pct = y => (100 * y.costs / (y.received + y.costs)).toFixed(1);
  assert.ok(doc.includes(`Reading the board costs ${pct(best)}% of what was sent`), 'careful cost %');
  assert.ok(doc.includes(`ZERO FEE kiosk costs ${pct(zero)}%`), 'ZERO FEE cost %');
  assert.ok(doc.includes(`about ${(zero.costs / best.costs).toFixed(1)} times more`), 'ZERO FEE cost ratio');
  const close = STR.clock[0].match(/\d\d:\d\d/)[0]; // the street clock the game shows
  assert.ok(doc.includes(`close for Friday prayer at ${close}`), `CONCEPT.md gives the game's closing time ${close}`);
});
