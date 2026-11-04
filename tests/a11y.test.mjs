// node --test tests/ — the accessibility settings are pure and shared with the game.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as A from '../a11y.js';

test('defaults off, saved settings come back, a link adds on top', () => {
  assert.deepEqual(A.parseSettings('', null), { large: false, contrast: false, calm: false, plain: false, mute: false });
  assert.equal(A.parseSettings('', '{not json').calm, false);
  assert.deepEqual(A.parseSettings('?a11y=large,calm,nope', '{"mute":true}'), { large: true, contrast: false, calm: true, plain: false, mute: true });
});

test('plain words swap jargon and keep numbers', () => {
  assert.equal(A.plain('Hidden in the rate (exchange-rate margin): AED 12', { plain: true }), 'Hidden in the rate (hidden cost in the rate): AED 12');
  assert.equal(A.plain('Mid-market rate today', { plain: true }), 'Mid-market rate today'); // case-sensitive on purpose: only the lowercase phrase is jargon in a sentence
  assert.equal(A.plain('salary advance', { plain: false }), 'salary advance');
});

test('toggle does not mutate', () => {
  const s = A.parseSettings('', null), t = A.toggle(s, 'contrast');
  assert.equal(t.contrast, true); assert.equal(s.contrast, false);
});
