// node --test tests/ — one build version in every module URL, so a phone never mixes a fresh game.js with a cached econ.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
test('index.html and game.js imports share one ?v=', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8'), js = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  const vs = [...html.matchAll(/game\.js\?v=(\w+)/g), ...js.matchAll(/from '\.\/\w+\.js\?v=(\w+)'/g)].map(m => m[1]);
  assert.equal(vs.length, 5);
  assert.equal(new Set(vs).size, 1, `versions ${vs}`);
});
