// node --test tests/ — the drawn street: every counter kind has its own facade, every drawing is self-contained and silent to screen readers.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as Art from '../art.js';
import { street } from '../econ.js';

const kinds = [...new Set(Array.from({ length: 12 }, (_, i) => street(i + 1, () => 0.5).map(c => c.kind)).flat())];
const clean = (svg, what) => {
  assert.match(svg, /^<svg [^>]*viewBox="[\d .]+"/, `${what}: svg with a viewBox`);
  assert.match(svg, /aria-hidden="true"/, `${what}: decoration is hidden from screen readers`);
  assert.doesNotMatch(svg, /https?:|<image|<script/, `${what}: nothing loaded from outside`);
};

test('every counter on the street has a facade, and no two look the same', () => {
  assert.ok(kinds.length >= 6, `kinds seen: ${kinds}`);
  const all = kinds.map(k => { const s = Art.facade(k); clean(s, k); return s; });
  assert.equal(new Set(all).size, kinds.length);
});

test('the title scene and the flight home are self-contained drawings', () => {
  clean(Art.scene(), 'scene');
  for (const lost of [false, true]) {
    const f = Art.flight(lost);
    clean(f, 'flight');
    assert.match(f, /class="coin"/);
    assert.equal(/class="house lit"/.test(f), !lost, 'the house lights up only when the money arrives');
  }
});

test('countFrames eases from 0 to the exact final value', () => {
  const f = Art.countFrames(1234.5, 10);
  assert.equal(f.length, 10);
  assert.equal(f.at(-1), 1234.5);
  assert.ok(f.every((x, i) => i === 0 || x >= f[i - 1]), 'never counts backwards');
  assert.ok(f[4] > 1234.5 / 2, 'ease-out: past half by the middle');
});
