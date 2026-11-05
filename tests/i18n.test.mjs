// node --test tests/ — every line has an Arabic version with the same {placeholders}, and every id the model uses has words.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as I from '../i18n.js';
import * as E from '../econ.js';

test('every string exists in English and Arabic with the same placeholders', () => {
  const ph = s => (s.match(/\{\w+\}/g) || []).sort().join();
  for (const [k, [en, ar]] of Object.entries(I.STR)) {
    assert.ok(en && ar, `${k} has both`);
    assert.match(ar, /[؀-ۿ]|^[\d\s.,:%()<>A-Z-]+$/, `${k} Arabic is Arabic`);
    assert.equal(ph(en), ph(ar), `${k} placeholders`);
  }
});

test('every need, emergency, counter and ending the model can produce has words', () => {
  for (const n of E.NEEDS) assert.ok(I.STR['need_' + n.id], n.id);
  for (const id of ['phone', 'clinic', 'visa']) assert.ok(I.STR['em_' + id], id);
  for (const c of E.street(12, E.rng(1))) assert.ok(I.STR['c_' + c.kind], c.kind);
  for (const e of E.ENDINGS) { assert.ok(I.STR['end_' + e]); assert.ok(I.STR['endSub_' + e]); }
});

test('language: link, then saved, then device', () => {
  assert.equal(I.pickLang('?lang=ar', 'en'), 'ar');
  assert.equal(I.pickLang('', 'ar', 'en-US'), 'ar');
  assert.equal(I.pickLang('', null, 'ar-AE'), 'ar');
  assert.equal(I.pickLang('?lang=xx', null, 'pt-BR'), 'en');
});

test('money reads the same on a receipt in both languages', () => {
  assert.equal(I.aed(1234.4, 'en'), 'AED 1,234');
  assert.equal(I.aed(1234.4, 'ar'), '1,234 درهم');
  assert.equal(I.home(1000, 'india'), '₹1,000');
});

test('the game uses only strings that exist, and storage is always guarded', () => {
  const src = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  for (const [, k] of src.matchAll(/T\('([a-zA-Z_]+)'[,)]/g)) assert.ok(I.STR[k], `missing string ${k}`);
  // T(cond ? 'a' : 'b', ...) picks one of two keys: both must exist
  for (const m of src.matchAll(/T\(([^`]*?)\)/g)) for (const [, k] of m[1].matchAll(/[?:]\s*'([a-zA-Z_]+)'(?!\s*\+)/g)) assert.ok(I.STR[k], `missing string ${k}`);
  for (const line of src.split('\n')) if (line.includes('localStorage')) assert.ok(line.includes('try'), `unguarded storage: ${line.trim()}`);
});

// UAE unified Friday prayer moved from 13:15 to 12:45 on 2 January 2026 (Awqaf circular; source in README).
test('the street closes at the current Friday prayer time, 12:45', () => {
  const all = Object.values(I.STR).flat().join('\n');
  assert.doesNotMatch(all, /13:15/);
  for (const l of [0, 1]) assert.match(I.STR.clock[l], /12:45/);
});

// Localization (rubric bonus): the family festival matches the home country; values and months stay the same.
test('each home country asks for its own festival, in both languages', () => {
  const seen = new Set();
  for (const c of Object.keys(I.CORRIDORS)) {
    const s = I.STR['need_wedding_' + c];
    assert.ok(s && s[0] && s[1], `festival for ${c}`);
    seen.add(s[0]);
  }
  assert.equal(seen.size, Object.keys(I.CORRIDORS).length);
  assert.match(readFileSync(new URL('../game.js', import.meta.url), 'utf8'), /need_' \+ id \+ '_' \+ corridor/, 'game.js picks the festival by corridor');
});
