// node --test tests/ — the money model teaches true things: what matters is what the family receives.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../econ.js';

const MID = 24; // any mid-market rate: the lessons do not depend on it

test('receive and cost: fee plus exchange-rate margin', () => {
  const c = { fee: 15, margin: 0.01 };
  assert.equal(E.receive(1000, c, MID), (1000 - 15) * MID * 0.99);
  assert.ok(Math.abs(E.costAED(1000, c, MID) - (15 + 985 * 0.01)) < 1e-9);
  assert.equal(E.receive(10, { fee: 15, margin: 0 }, MID), 0); // fee bigger than the amount: nothing arrives
});

test('ZERO FEE with a bad rate costs more than a small fee at a fair rate', () => {
  const zero = { fee: 0, margin: 0.035 }, fair = { fee: 15, margin: 0.005 };
  assert.ok(E.receive(1000, fair, MID) > E.receive(1000, zero, MID));
});

test('a fixed fee hurts small transfers most (batching)', () => {
  const c = { fee: 15, margin: 0.005 };
  assert.ok(E.costAED(300, c, MID) / 300 > 2 * E.costAED(1500, c, MID) / 1500);
});

test('counters: same seed, same street; the cheapest has a queue', () => {
  const a = E.street(3, E.rng(7)), b = E.street(3, E.rng(7));
  assert.deepEqual(a, b);
  assert.ok(a.some(c => c.kind === 'zero' && c.fee === 0 && c.queue === 0), 'the ZERO FEE kiosk is always open');
  assert.ok(!E.street(1, E.rng(1)).some(c => c.kind === 'informal'), 'no phone offer on the first payday');
  assert.ok(E.street(2, E.rng(1)).some(c => c.kind === 'informal'));
});

test('a counter closes when its queue is longer than the time left', () => {
  assert.equal(E.isOpen({ queue: 12 }, 20), true);
  assert.equal(E.isOpen({ queue: 12 }, 11), false);
  assert.equal(E.isOpen({ queue: 0 }, 0), true);
});

test('payday: debt first, then the cushion; an emergency the cushion cannot pay is borrowed at a charge', () => {
  const s = E.newRun('india', 1);
  E.payday(s);
  assert.equal(s.reserve, E.SALARY - E.BILLS);
  s.reserve = 100;
  const ev = E.emergencyHere(s, 500);
  assert.equal(s.reserve, 0);
  assert.equal(s.debt, Math.round(400 * (1 + E.ADVANCE_CHARGE)));
  assert.equal(ev.borrowed, 400);
  s.p = 2; E.payday(s);
  assert.equal(s.debt, 0);
  assert.equal(s.reserve, E.SALARY - E.BILLS - 440);
});

test('the informal offer never leaves a receipt, and some day the money is gone', () => {
  const s = E.newRun('india', 1);
  s.reserve = 1000;
  const r = E.send(s, { kind: 'informal', fee: 0, margin: -0.005 }, 1000, 0.01); // the roll that loses
  assert.equal(r.lost, true);
  assert.equal(r.received, 0);
  assert.equal(s.lostInformal, 1000);
  assert.equal(s.reserve, 0);
});

test('a home need is paid from what arrived, or missed', () => {
  const s = E.newRun('india', 1);
  s.pot = 1500 + E.FAMILY_MONTHLY + 200;
  let out = E.closePayday(s, [{ id: 'school', due: 1, aed: 1500 }]);
  assert.deepEqual(out.met, ['school']);
  assert.equal(s.pot, 200 * (1 - E.HOME_SPEND)); // money left sitting at home partly gets spent
  assert.equal(out.spent, 200 * E.HOME_SPEND); // and the news says how much
  s.p = 2; s.pot = 1000;
  out = E.closePayday(s, [{ id: 'roof', due: 2, aed: 1500 }]);
  assert.deepEqual(out.missed, ['roof']);
  assert.equal(s.pot, 1000 - E.FAMILY_MONTHLY);
  s.p = 3; s.pot = 100;
  out = E.closePayday(s, []);
  assert.equal(out.short, E.FAMILY_MONTHLY - 100); // the family went short this month
  assert.equal(s.pot, 0);
});

// Strategies over many seeds: the lesson must show up in the outcome, not only in the text.
const avg = (strategy, key) => {
  let t = 0;
  for (let seed = 1; seed <= 200; seed++) t += E.simulate(strategy, seed)[key];
  return t / 200;
};

test('reading the board beats the loud ZERO FEE sign', () => {
  const kept = st => avg(st, 'received') + avg(st, 'reserve'); // what reached home plus what you still hold
  assert.ok(kept('best') - kept('zero') > 250, `best ${kept('best')} vs zero ${kept('zero')}`);
  assert.ok(avg('best', 'costs') < avg('zero', 'costs') / 2);
});

test('a cushion keeps an emergency from becoming a charge', () => {
  assert.ok(avg('best', 'advanceCharges') < avg('sendAll', 'advanceCharges'));
});

test('the informal phone offer loses money over a year', () => {
  assert.ok(avg('informal', 'lostInformal') > 0);
  assert.ok(avg('informal', 'received') < avg('best', 'received'));
});

test('every ending can happen, and the careful player usually does well', () => {
  const seen = new Set();
  let good = 0;
  for (let seed = 1; seed <= 200; seed++) {
    for (const st of ['best', 'zero', 'sendAll', 'steady', 'informal', 'hoard']) seen.add(E.simulate(st, seed).ending);
    if (E.GOOD_ENDINGS.includes(E.simulate('best', seed).ending)) good++;
  }
  for (const e of E.ENDINGS) assert.ok(seen.has(e), `ending ${e} reachable`);
  assert.ok(good > 150, `careful play ends well in most runs (${good}/200)`);
  const thriving = st => [...Array(200)].filter((_, i) => E.simulate(st, i + 1).ending === 'thriving').length;
  assert.ok(thriving('zero') < thriving('best') / 2, 'the loud sign rarely leaves enough for a cushion');
});

// game-balance (04/11 playtest): once the app is out, the street must still ask for a reading every Friday.
test('no counter is the best deal on more than 55% of Fridays from payday 5', () => {
  for (const amt of [1000, 2500]) {
    const win = {}; let n = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const r = E.rng(seed);
      for (let p = 5; p <= E.PAYDAYS; p++, n++) {
        const st = E.street(p, r).filter(c => !c.informal && E.isOpen(c, E.STREET_MINUTES - 10));
        const b = st.reduce((a, c) => (E.receive(amt, c, 1) > E.receive(amt, a, 1) ? c : a));
        win[b.kind] = (win[b.kind] || 0) + 1;
      }
    }
    for (const [k, v] of Object.entries(win)) assert.ok(v / n <= 0.55, `AED ${amt}: ${k} best on ${Math.round(100 * v / n)}% of Fridays`);
  }
});
