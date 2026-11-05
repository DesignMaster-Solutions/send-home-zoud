// Send Home: the screens. The money lives in econ.js, the words in i18n.js, the settings in a11y.js.
import * as E from './econ.js?v=14';
import * as A from './a11y.js?v=14';
import * as I from './i18n.js?v=14';
import * as Art from './art.js?v=14';

const params = new URLSearchParams(location.search);
function load(k) { try { return localStorage.getItem(k); } catch { return null; } }
function save(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked in some iframes: settings just do not persist */ } }

let S = A.parseSettings(location.search, load(A.STORAGE_KEY));
let lang = I.pickLang(location.search, load(I.STORAGE_KEY), navigator.language);
let corridor = I.CORRIDORS[params.get('home')] ? params.get('home') : (I.CORRIDORS[load('sendhome.home')] ? load('sendhome.home') : 'india');
const app = document.getElementById('app');

let run, mid, screen, st; // st = this payday's street visit
const T = (k, v) => A.plain(I.t(k, lang, v), S, lang);
const money = x => I.aed(x, lang);
const homeMoney = aedEq => I.home(aedEq * mid, corridor);
const moving = () => !S.calm && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const fly = () => { const m = moving() && app.querySelector('#fly'); if (m) { m.beginElement(); setTimeout(() => SND.coin(), 1700); } };
// Count a receipt number up to its value; calm mode and reduced motion show it at once.
function countUp(el, to, fmt) {
  if (!el || !moving()) return;
  const f = Art.countFrames(to, 24);
  f.forEach((x, i) => setTimeout(() => { el.textContent = fmt(x); if (i % 4 === 0) SND.tick(); }, i * 30));
}

// ---------- sound: tiny WebAudio blips, nothing downloaded ----------
let ac;
function blip(freqs, type = 'sine', dur = 0.12) {
  if (S.mute) return;
  try {
    ac = ac || new AudioContext();
    freqs.forEach((f, i) => {
      const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + i * dur * 0.8;
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(0.12, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
      o.connect(g).connect(ac.destination); o.start(t0); o.stop(t0 + dur);
    });
  } catch { /* no audio: the game still plays */ }
}
const SND = { coin: () => blip([880, 1320], 'triangle'), tick: () => blip([440], 'square', 0.05), stamp: () => blip([180, 120], 'sawtooth', 0.15),
  bad: () => blip([300, 200, 140], 'sawtooth', 0.2), good: () => blip([523, 659, 784], 'sine', 0.15), tap: () => blip([660], 'sine', 0.05) };

function applySettings() {
  document.body.className = A.KEYS.filter(k => S[k]).join(' ');
  document.documentElement.classList.toggle('large', !!S.large); // rem sizes follow <html>, not <body>
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

function hud() {
  return `<div class="hud"><span>${T('payday', { n: run.p })}</span><span>${T('cushion')} <b>${money(run.reserve)}</b></span>
    <span>${T('atHome')} <b>${homeMoney(run.pot)}</b></span>${run.debt ? `<span class="minus">${T('debt')} ${money(run.debt)}</span>` : ''}</div>`;
}
const settingsChips = () => A.KEYS.map(k => `<button class="chip" data-a11y="${k}" aria-pressed="${S[k]}">${T('a11y_' + k)}</button>`).join('');

// ---------- title ----------
function title() {
  screen = 'title';
  const c = I.CORRIDORS[corridor];
  app.innerHTML = `<div class="hero">${Art.scene()}</div><h1>${T('title')}</h1>
    <p>${T('pitch', { home: c[lang] })}</p>
    <div class="panel"><p>${T('how1')}</p><p>${T('how2')}</p><p>${T('how3')}</p></div>
    <p class="muted">${T('homeIs')}</p>
    <div class="row">${Object.keys(I.CORRIDORS).map(k => `<button class="chip" data-home="${k}" aria-pressed="${k === corridor}">${I.CORRIDORS[k][lang]}</button>`).join('')}</div>
    <div class="row" style="margin-top:8px"><button class="chip" data-lang="en" aria-pressed="${lang === 'en'}">English</button><button class="chip" data-lang="ar" aria-pressed="${lang === 'ar'}">العربية</button></div>
    <p class="muted">${T('settings')}</p><div class="row">${settingsChips()}</div>
    <div class="actions"><button class="primary" data-act="start">${T('start')}</button></div>`;
  fly();
}

// ---------- payday: the split ----------
function startPayday() {
  const pd = E.payday(run);
  const events = E.emergenciesDue(run).map(h => ({ id: h.id, aed: h.aed, ...E.emergencyHere(run, h.aed) }));
  st = { pd, events, amount: Math.min(run.reserve, E.FAMILY_MONTHLY) };
  if (pd.late) SND.bad(); else SND.coin();
  paydayScreen();
}

function paydayScreen() {
  screen = 'payday';
  const { pd, events } = st;
  const line = (label, x, cls) => `<div><span>${label}</span><span class="${cls}">${x}</span></div>`;
  const ledger = [
    pd.late ? `<p class="alert">${T('lateSalary')}</p>` : line(T('salary'), '+' + money(E.SALARY), 'plus'),
    run.p > 1 && !pd.late && run.backPayWas ? line(T('backPay'), '+' + money(E.SALARY), 'plus') : '',
    line(T('bills'), '−' + money(E.BILLS), 'minus'),
    pd.repaid ? line(T('repaid'), '−' + money(pd.repaid), 'minus') : '',
    pd.borrowed ? `<p class="alert">${T('borrowed', { x: money(pd.borrowed), c: money(pd.charge) })}</p>` : '',
  ].join('');
  const evs = events.map(e => `<p class="alert">${T('em_' + e.id)}: ${money(e.aed)}. ${e.borrowed ? T('borrowed', { x: money(e.borrowed), c: money(e.charge) }) : T('paidCushion')}</p>`).join('');
  const open = E.NEEDS.filter(n => n.told <= run.p && n.due >= run.p);
  const msgs = open.map(n => `<div class="msg ${n.told === run.p ? 'new' : ''}"><b>${T('need_' + n.id)}</b>: ${homeMoney(n.aed)}
    · ${n.due === run.p ? T('dueNow') : T('dueOn', { n: n.due })}</div>`).join('');
  app.innerHTML = `${hud()}
    <div class="panel ledger">${ledger}${evs}</div>
    <div class="panel"><p class="muted">${T('msgFrom')}</p><div class="msg">${T('monthly', { x: homeMoney(E.FAMILY_MONTHLY) })}</div>${msgs}</div>
    <div class="panel"><div class="split"><span>${T('sendNow')}: <span id="sv">${money(st.amount)}</span></span><span class="muted">${T('keep')}: <span id="kv">${money(run.reserve - st.amount)}</span></span></div>
    <input type="range" id="amt" min="0" max="${Math.floor(run.reserve / 10) * 10}" step="10" value="${Math.floor(st.amount / 10) * 10}" aria-label="${T('sendNow')}">
    <div class="actions"><button class="primary" data-act="street">${T('toStreet')}</button><button class="link" data-act="skip">${T('keepAll')}</button></div></div>`;
  app.querySelector('#amt').addEventListener('input', e => {
    st.amount = +e.target.value;
    app.querySelector('#sv').textContent = money(st.amount);
    app.querySelector('#kv').textContent = money(run.reserve - st.amount);
  });
}

// ---------- the street of counters ----------
// No clock in calm mode, nor on the first Friday: a new player learns the board before the queue counts.
// After the phone offer has taken money once, the next one is a different voice: the scam comes back with a new face.
const cname = c => T(c.informal && run.lostInformal > 0 ? 'c_informal_again' : 'c_' + c.kind);
const noClock = () => S.calm || run.p === 1;
const effQueue = c => (c.kind === 'app' && !run.appReady ? E.APP_SETUP : c.queue);
function goStreet() {
  st.counters = E.street(run.p, run.r);
  st.minutes = E.STREET_MINUTES; st.paused = false; st.quote = null;
  screen = 'street';
  clearInterval(st.timer);
  if (!noClock()) st.timer = setInterval(() => {
    if (st.paused || st.quote) return;
    st.minutes--; if (st.minutes <= 5 && st.minutes > 0) SND.tick();
    if (st.minutes <= 0) { clearInterval(st.timer); timeUp(); } else streetScreen();
  }, 1000);
  streetScreen();
}
const clockText = m => { const t = 12 * 60 + 15 + E.STREET_MINUTES - m; return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

function counterCard(c) {
  const q = effQueue(c), open = noClock() || E.isOpen({ queue: q }, st.minutes);
  const rate = (mid * (1 - c.margin)).toFixed(2);
  const tag = c.loud ? `<span class="shout">${T('zeroFee')}</span>` : c.promo ? `<span class="shout">${T('feeWaived')}</span>` : '';
  const qline = !open ? T('closed') : c.kind === 'app' && !run.appReady ? T('setup', { m: q }) : c.kind === 'informal' ? T('noReceipt') : q ? T('queue', { m: q }) : T('noQueue');
  return `<button class="counter" data-kind="${c.kind}" data-c="${c.kind}" ${open ? '' : 'disabled'}>
    ${Art.facade(c.kind)}<span class="sign">${cname(c)}</span><span class="body">${tag}
    <span>${T('fee')} <span class="big">${money(c.fee)}</span></span>
    <span>${T('rate')} <span class="big">${rate}</span> <span class="muted">${I.CORRIDORS[corridor].cur}</span></span>
    <span class="muted">${qline}</span></span></button>`;
}

function streetScreen() {
  const c = I.CORRIDORS[corridor];
  const pct = Math.max(0, st.minutes / E.STREET_MINUTES * 100);
  const sheet = st.quote ? quoteSheet(st.quote) : '';
  app.innerHTML = `${hud()}<div class="panel"><div class="row" style="justify-content:space-between"><b>${noClock() ? T(S.calm ? 'clockCalm' : 'clockFirst') : clockText(st.minutes) + ' · ' + T('clock')}</b>
    ${noClock() ? '' : `<button class="link" data-act="pause">${T('pause')}</button>`}</div>
    ${noClock() ? '' : `<div class="clock ${st.minutes <= 5 ? 'low' : ''}"><i style="width:${pct}%"></i></div>`}
    <p><b>${T('fair', { r: mid.toFixed(2), cur: c.cur })}</b> <span class="muted">${T('fairHint')}</span></p>
    <p>${T('sendNow')}: <b>${money(st.amount)}</b></p></div>
    <div class="grid">${st.counters.map(counterCard).join('')}</div>${sheet}
    ${st.paused ? `<div class="overlay"><div class="panel"><p>${T('paused')}</p><div class="row">${settingsChips()}</div><div class="actions"><button class="primary" data-act="pause">${T('resume')}</button></div></div></div>` : ''}`;
}

function quoteSheet(c) {
  const got = E.receive(st.amount, c, mid);
  return `<div class="sheet" role="dialog"><p><b>${cname(c)}</b></p><p>${T('quoteFor', { x: money(st.amount) })}</p>
    <p class="big">${I.home(got, corridor)}</p>
    <div class="actions"><button class="primary" data-act="send">${T('sendHere')}</button><button class="link" data-act="back">${T('back')}</button></div></div>`;
}

function ask(kind) {
  const c = st.counters.find(x => x.kind === kind);
  if (!noClock()) st.minutes -= 2; // asking takes 2 minutes of the queue
  if (!noClock() && st.minutes <= 0) return timeUp();
  st.quote = c; SND.tap(); streetScreen();
}

function timeUp() {
  clearInterval(st.timer);
  st.result = null;
  app.innerHTML = `${hud()}<div class="panel"><p class="alert">${T('timeUp')}</p><div class="actions"><button class="primary" data-act="news">${T('next')}</button></div></div>`;
  screen = 'receipt'; SND.bad();
}

function sendHere() {
  clearInterval(st.timer);
  const c = st.quote, amount = st.amount;
  const formal = st.counters.filter(x => !x.informal && (noClock() || E.isOpen({ queue: effQueue(x) }, st.minutes + 2)));
  const best = formal.reduce((a, x) => (E.receive(amount, x, mid) > E.receive(amount, a, mid) ? x : a), formal[0]);
  const bestGot = E.receive(amount, best, mid);
  const r = E.send(run, c, amount, run.r(), mid);
  screen = 'receipt'; st.sent = true; st.lost = !!r.lost; st.received = r.received || 0; st.cost = r.cost || 0;
  if (c.informal) {
    app.innerHTML = `${hud()}<div class="${r.lost ? 'lost' : 'panel'}"><p>${r.lost ? T('rInformalLost', { x: money(amount) }) : T('rInformalOk')}</p>
      ${r.lost ? '' : `<p>${T('rGets')}: <b>${I.home(r.received, corridor)}</b></p>`}<div class="actions"><button class="primary" data-act="news">${T('next')}</button></div></div>`;
    r.lost ? SND.bad() : SND.coin();
    return;
  }
  const marginAED = (amount - c.fee) * c.margin, pct = r.cost / amount * 100;
  const diff = bestGot - r.received;
  app.innerHTML = `${hud()}<div class="receipt"><span class="stamp">${pct < 3 ? '< 3%' : pct.toFixed(1) + '%'}</span>
    <p><b>${T('receipt')} · ${T('c_' + c.kind)}</b></p>
    <div><span>${T('rSent')}</span><span>${money(amount)}</span></div>
    <div><span>${T('rFee')}</span><span>${money(c.fee)}</span></div>
    <div><span>${T('rRate', { m: mid.toFixed(2) })}</span><span>${(mid * (1 - c.margin)).toFixed(2)}</span></div>
    <div><span>${T('rMargin')}</span><span>${money(marginAED)}</span></div>
    <div class="total"><span>${T('rTotal')}</span><span>${money(r.cost)} (${pct.toFixed(1)}%)</span></div>
    <div class="gets"><span>${T('rGets')}</span><span>${I.home(r.received, corridor)}</span></div>
    <p>${diff > 1 ? T('rBest', { x: I.home(diff, corridor) }) + ` (${T('c_' + best.kind)})` : T('rWasBest')}</p>
    <p class="muted" style="color:#556">${T('rGoal')} ${T('rReal', { home: I.CORRIDORS[corridor][lang], p: I.CORRIDORS[corridor].rpw })}</p></div>
    <div class="actions" style="justify-content:center"><button class="primary" data-act="news">${T('next')}</button></div>`;
  countUp(app.querySelector('.gets span:last-child'), r.received, x => I.home(x, corridor));
  SND.stamp(); setTimeout(() => (pct < 3 ? SND.good() : SND.bad()), 900);
}

// ---------- news from home, then the next payday ----------
function news() {
  const out = E.closePayday(run);
  const name = id => T('need_' + id);
  const lines = [...out.met.map(id => `<p class="plus">${T('needMet', { need: name(id) })}</p>`),
    ...out.missed.map(id => `<p class="alert">${T('needMissed', { need: name(id) })}</p>`),
    // short only by what the transfer cost: say so, that is the lesson of the receipt
    out.spent >= 1 ? `<p class="muted">${T('spent', { x: homeMoney(out.spent) })}</p>` : '',
    out.short ? `<p class="alert">${T(st.sent && !st.lost && out.short <= st.cost + 1 ? 'shortCost' : 'short', { x: homeMoney(out.short) })}</p>` : `<p>${T('fine')}</p>`].join('');
  screen = 'news';
  app.innerHTML = `${hud()}${st.sent ? Art.flight(st.lost, '+' + I.home(st.received, corridor)) : ''}<div class="panel"><h2>${T('homeNews')}</h2>${lines}<div class="actions"><button class="primary" data-act="next">${T('next')}</button></div></div>`;
  out.missed.length || out.short ? SND.bad() : SND.good();
  fly();
}

function next() {
  run.backPayWas = run.backPay > 0;
  if (run.p >= E.PAYDAYS) return end();
  run.p++;
  startPayday();
}

function end() {
  screen = 'end';
  const e = E.ending(run);
  const row = (k, v) => `<div><span>${T(k)}</span><b>${v}</b></div>`;
  app.innerHTML = `<p class="muted">${T('endTitle')}</p><p class="ending">${T('end_' + e)}</p><p>${T('endSub_' + e, { x: money(run.reserve) })}</p>
    <div class="panel stats">${row('eReached', homeMoney(run.received))}${row('eCosts', money(run.costs))}
    ${row('eInformal', money(run.lostInformal))}${row('eAdvance', money(run.advanceCharges))}${row('eNeeds', `${run.met.length} / ${E.NEEDS.length}`)}${row('eShort', `${run.shortMonths} / ${E.PAYDAYS}`)}${row('cushion', money(run.reserve))}</div>
    <div class="actions"><button class="primary" data-act="again">${T('again')}</button></div>`;
  E.GOOD_ENDINGS.includes(e) ? SND.good() : SND.bad();
}

function newGame() {
  run = E.newRun(corridor, +(params.get('seed') || Date.now() % 1e9));
  mid = I.CORRIDORS[corridor].mid;
  startPayday();
}

// ---------- input ----------
app.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  if (b.dataset.a11y) { S = A.toggle(S, b.dataset.a11y); save(A.STORAGE_KEY, JSON.stringify(S)); applySettings(); return rerender(); }
  if (b.dataset.lang) { lang = b.dataset.lang; save(I.STORAGE_KEY, lang); applySettings(); return rerender(); }
  if (b.dataset.home) { corridor = b.dataset.home; save('sendhome.home', corridor); return title(); }
  if (b.dataset.c) return ask(b.dataset.c);
  const act = b.dataset.act;
  if (act === 'start' || act === 'again') return newGame();
  if (act === 'street') return st.amount > 0 ? goStreet() : news();
  if (act === 'skip') { st.amount = 0; return news(); }
  if (act === 'back') { st.quote = null; return streetScreen(); }
  if (act === 'send') return sendHere();
  if (act === 'pause') { st.paused = !st.paused; return streetScreen(); }
  if (act === 'news') return news();
  if (act === 'next') return next();
});
document.addEventListener('keydown', e => {
  if (screen === 'street' && (e.key === 'p' || e.key === 'P' || e.key === 'Escape')) { st.paused = !st.paused; streetScreen(); }
});
function rerender() {
  if (screen === 'title') return title();
  if (screen === 'payday') return paydayScreen();
  if (screen === 'street') return streetScreen();
  if (screen === 'end') return end();
}

// ---------- ?autoplay: the game plays itself (attract mode, the gameplay video, the full-year e2e) ----------
// It plays like a careful player: sends what the month and any due need require, compares quotes, keeps the rest.
// Payday 1 shows the loud ZERO FEE quote first; ?autoplay=risky also takes the phone offer once (payday 5).
// ?pace=0.6 sets the speed of a recording (a whole year in about 2 minutes); ?fast is the e2e speed.
const AUTO = params.has('autoplay'), PACE = params.has('fast') ? 0.08 : Math.min(2, Math.max(0.05, +params.get('pace') || 1));
// ?caption lays a line under the recording that says what is happening, the first time it happens.
const CAP = AUTO && params.has('caption') && document.body.appendChild(Object.assign(document.createElement('p'), { className: 'cap' }));
const cap = k => { if (CAP) { CAP.textContent = k ? T(k, { home: I.CORRIDORS[corridor][lang] }) : ''; CAP.hidden = !k; } };
function autoStep() {
  if (!AUTO) return;
  const later = (ms, f) => setTimeout(f, ms * PACE);
  const click = sel => { const b = app.querySelector(sel); if (b && !b.disabled) b.click(); };
  const sc = screen, p = run && run.p, risky = params.get('autoplay') === 'risky';
  cap(sc === 'title' ? 'cap_title' : sc === 'end' ? 'cap_end' : p === 1 && sc !== 'street' ? 'cap_' + sc
    : sc === 'receipt' && st.lost ? 'cap_lost' : sc === 'street' && risky && p === 5 ? 'cap_phone' : '');
  if (sc === 'title') return later(2500, () => click('[data-act=start]'));
  if (sc === 'payday') {
    const due = E.NEEDS.filter(n => n.due === run.p).reduce((t, n) => t + n.aed, 0);
    const want = Math.min(run.reserve, Math.ceil((Math.max(0, E.FAMILY_MONTHLY + due - run.pot) * 1.04 + 30) / 50) * 50);
    return later(1800, () => {
      const r = app.querySelector('#amt'); r.value = want; r.dispatchEvent(new Event('input'));
      later(1800, () => click(want > 0 ? '[data-act=street]' : '[data-act=skip]'));
    });
  }
  if (sc === 'street' && !st.quote && !st.autoAsked) {
    st.autoAsked = true;
    const open = st.counters.filter(c => noClock() || E.isOpen({ queue: effQueue(c) }, st.minutes - 4));
    const best = open.filter(c => !c.informal).reduce((a, c) => (E.receive(st.amount, c, mid) > E.receive(st.amount, a, mid) ? c : a));
    const pick = risky && p === 5 ? 'informal' : best.kind;
    if (p === 1) return later(2200, () => { cap('cap_zero'); ask('zero'); later(2200, () => { click('[data-act=back]'); later(1200, () => { cap('cap_compare'); ask(pick); later(2000, () => click('[data-act=send]')); }); }); });
    return later(2200, () => { ask(pick); later(2000, () => click('[data-act=send]')); });
  }
  if (sc === 'receipt') return later(3800, () => click('[data-act=news]'));
  if (sc === 'news') return later(2600, () => click('[data-act=next]'));
}
const render = new MutationObserver(() => { if (screen !== autoStep.last) { autoStep.last = screen; autoStep(); } });
if (AUTO) render.observe(app, { childList: true });

applySettings();
title();

