// node --test tests/ — the background music: one exact Apple Loops loop, small, credited, and silenced by Sound off.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('music.wav is one seamless loop under 1 MB, credited, and Sound off silences it', () => {
  const wav = readFileSync(new URL('../music.wav', import.meta.url));
  assert.ok(wav.length < 1_000_000, `${wav.length} bytes`);
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  const channels = wav.readUInt16LE(22), rate = wav.readUInt32LE(24), bits = wav.readUInt16LE(34);
  const data = wav.indexOf('data'), frames = wav.readUInt32LE(data + 4) / (channels * bits / 8);
  assert.ok(Math.abs(frames / rate - 32 / 3) < 0.001, `loop is 10.667 s (4 bars at 90 bpm), got ${frames / rate}`);
  assert.match(readFileSync(new URL('../README.md', import.meta.url), 'utf8'), /Apple Loops/);
  const js = readFileSync(new URL('../game.js', import.meta.url), 'utf8');
  assert.match(js, /music\.gain\.value = S\.mute \? 0/, 'Sound off silences the music');
});
