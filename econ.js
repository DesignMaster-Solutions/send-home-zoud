// Send Home money model. No DOM: game.js and tests/econ.test.mjs share it.
// All money is in AED; what the family gets is AED x mid-market rate x (1 - margin), after the fee.
export const PAYDAYS = 12;
export const SALARY = 4000; // AED a month, the player's job in the game (not a statistic)
export const BILLS = 2100; // rent share, food, transport here: paid before anything else
export const FAMILY_MONTHLY = 1000; // AED-equivalent the family at home lives on each month
export const ADVANCE_CHARGE = 0.10; // the game's salary-advance lender charges 10% on what you borrow
export const INFORMAL_RISK = 0.2; // game rule: each informal transfer has a 1 in 5 chance of never arriving
export const STREET_MINUTES = 30; // the counters close for Friday prayer at 12:45 (UAE unified time since 2 Jan 2026); you arrive at 12:15
export const APP_SETUP = 15; // the first time, the app needs 15 minutes to check your ID

// Fictional counters (no real company). Margin = how far their rate sits below the mid-market rate.
const KINDS = [
  { kind: 'bank', fee: 50, margin: [0.008, 0.016], queue: [6, 12] }, // ~8% on AED 735, like UAE banks in RPW Q1 2025
  { kind: 'saffron', fee: 15, margin: [0.002, 0.008], queue: [14, 24] },
  { kind: 'dhow', fee: 10, margin: [0.006, 0.016], queue: [4, 10] },
  { kind: 'zero', fee: 0, margin: [0.028, 0.040], queue: [0, 0], loud: true },
  { kind: 'app', fee: 9, margin: [0.005, 0.018], queue: [0, 0], from: 4 }, // ranges tuned so no counter wins most Fridays (tests/econ.test.mjs)
  { kind: 'informal', fee: 0, margin: [-0.006, -0.003], queue: [0, 0], from: 2, informal: true },
];

// Home needs: told = the payday the message arrives, due = the payday the money must be there.
export const NEEDS = [
  { id: 'school', told: 1, due: 3, aed: 1500 },
  { id: 'roof', told: 3, due: 6, aed: 2400 },
  { id: 'wedding', told: 6, due: 9, aed: 1200 },
  { id: 'hospital', told: 10, due: 11, aed: 2000 },
];
// Emergencies here, one in each window of paydays.
// 'late': the salary is paid a month late (the bills here are not), back pay arrives with the next salary.
const HERE = [{ id: 'phone', win: [3, 5], aed: 350 }, { id: 'late', win: [7, 8], aed: 0 }, { id: 'clinic', win: [5, 7], aed: 500 },
  { id: 'visa', win: [9, 11], aed: 700 }];
export const HOME_SPEND = 0.15; // game rule: of what is left at home after the month, 15% goes on everyday things

export const ENDINGS = ['thriving', 'home', 'standing', 'hard'];
export const GOOD_ENDINGS = ['thriving', 'home'];
export const CUSHION_GOAL = 2400; // AED left in the cushion at the end of the year for 'thriving'

export function rng(seed) { // mulberry32: same seed, same year
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), a | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r, [lo, hi]) => lo + (hi - lo) * r();

export function receive(amount, c, mid) { return Math.max(0, amount - c.fee) * mid * (1 - c.margin); }
export function costAED(amount, c, mid) { return amount - receive(amount, c, mid) / mid; }
export function isOpen(c, minutesLeft) { return c.queue <= minutesLeft; }

// The street on payday p. One counter waives its fee today and quietly worsens its rate.
export function street(p, r) {
  const out = KINDS.filter(k => !k.from || p >= k.from).map(k => ({
    kind: k.kind, fee: k.fee, margin: Math.round(between(r, k.margin) * 10000) / 10000,
    queue: Math.round(between(r, k.queue)), loud: !!k.loud, informal: !!k.informal,
  }));
  const promo = out.filter(c => c.fee > 0 && c.kind !== 'app')[Math.floor(r() * 3)];
  if (promo) { promo.fee = 0; promo.margin = Math.round((promo.margin + 0.012) * 10000) / 10000; promo.promo = true; }
  return out;
}

export function newRun(corridor, seed) {
  const r = rng(seed);
  const here = HERE.map(h => ({ id: h.id, aed: h.aed, p: Math.floor(between(r, [h.win[0], h.win[1] + 0.999])) }));
  return { corridor, seed, r, p: 1, reserve: 0, debt: 0, pot: 0, appReady: false, here,
    backPay: 0, sent: 0, received: 0, costs: 0, lostInformal: 0, advanceCharges: 0, shortMonths: 0, met: [], missed: [], log: [] };
}

// Salary lands: bills are paid, a salary advance is repaid first, the rest joins the cushion.
export function payday(s) {
  const late = s.here.some(h => h.id === 'late' && h.p === s.p);
  let free = (late ? 0 : SALARY) + (s.backPay || 0) - BILLS;
  s.backPay = late ? SALARY : 0;
  if (free < 0) { const ev = emergencyHere(s, -free); return { late, repaid: 0, added: 0, ...ev }; }
  const repay = Math.min(free, s.debt);
  s.debt -= repay; free -= repay;
  s.reserve += free;
  return { late, repaid: repay, added: free };
}

export function emergencyHere(s, aed) {
  const paid = Math.min(s.reserve, aed), borrowed = aed - paid;
  s.reserve -= paid;
  const charge = Math.round(borrowed * ADVANCE_CHARGE);
  s.debt += borrowed + charge;
  s.advanceCharges += charge;
  return { paid, borrowed, charge };
}
export function emergenciesDue(s) { return s.here.filter(h => h.p === s.p && h.aed > 0); }

// roll in [0,1): an informal transfer is lost when roll < INFORMAL_RISK.
export function send(s, c, amount, roll, mid = 1) {
  amount = Math.max(0, Math.min(amount, s.reserve));
  s.reserve -= amount;
  s.sent += amount;
  if (c.kind === 'app') s.appReady = true;
  if (c.kind === 'informal' && roll < INFORMAL_RISK) {
    s.lostInformal += amount;
    return { amount, received: 0, cost: amount, lost: true };
  }
  const got = receive(amount, c, mid), cost = costAED(amount, c, mid);
  s.received += got / mid; s.pot += got / mid; s.costs += cost;
  return { amount, received: got, cost, lost: false };
}

// End of the payday at home: a due need is paid if the money is there, then the family lives on the month.
export function closePayday(s, needs = NEEDS) {
  const met = [], missed = [];
  for (const n of needs.filter(n => n.due === s.p)) {
    if (s.pot >= n.aed) { s.pot -= n.aed; met.push(n.id); } else missed.push(n.id);
  }
  const short = Math.max(0, FAMILY_MONTHLY - s.pot), left = Math.max(0, s.pot - FAMILY_MONTHLY), spent = left * HOME_SPEND;
  s.pot = left - spent;
  if (short > 0) s.shortMonths++;
  s.met.push(...met); s.missed.push(...missed);
  return { met, missed, short, spent };
}

export function ending(s) {
  if (s.missed.length === 0 && s.debt === 0 && s.shortMonths <= 1) return s.reserve >= CUSHION_GOAL ? 'thriving' : 'home';
  if (s.missed.length <= 1 && s.debt === 0) return 'standing';
  return 'hard';
}

// Whole-year strategies for the balance tests (tests/econ.test.mjs). The player reads the board in ~10 minutes.
export function simulate(strategy, seed, keep = 700) {
  const s = newRun('test', seed);
  for (s.p = 1; s.p <= PAYDAYS; s.p++) {
    payday(s);
    for (const h of emergenciesDue(s)) emergencyHere(s, h.aed);
    const st = street(s.p, s.r);
    const open = st.filter(c => isOpen(c, STREET_MINUTES - 10 - (c.kind === 'app' && !s.appReady ? APP_SETUP : 0)));
    const formal = open.filter(c => !c.informal);
    const best = formal.reduce((a, c) => (receive(1000, c, 1) > receive(1000, a, 1) ? c : a));
    // planner: send what the month and any need due now require, keep the rest as a cushion
    const due = NEEDS.filter(n => n.due === s.p).reduce((t, n) => t + n.aed, 0);
    const want = Math.max(0, FAMILY_MONTHLY + due - s.pot) * 1.04 + 30;
    let c = best, amount = Math.min(s.reserve, Math.ceil(want / 10) * 10);
    if (strategy === 'steady') amount = Math.max(0, s.reserve - keep);
    if (strategy === 'zero') c = st.find(x => x.kind === 'zero');
    if (strategy === 'sendAll') amount = s.reserve;
    if (strategy === 'informal') c = st.find(x => x.informal) || best;
    if (strategy === 'hoard') amount = Math.max(0, s.reserve - 2500);
    const roll = s.r();
    if (amount > 0) send(s, c, amount, roll);
    closePayday(s);
  }
  s.p = PAYDAYS;
  return { received: s.received, costs: s.costs, lostInformal: s.lostInformal, advanceCharges: s.advanceCharges,
    missed: s.missed.length, short: s.shortMonths, reserve: s.reserve, debt: s.debt, ending: ending(s) };
}
