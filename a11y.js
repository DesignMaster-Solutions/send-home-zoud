// Accessibility settings for Send Home (same pattern as our Snowball entry). No DOM: game.js and tests share it.
export const KEYS = ['large', 'contrast', 'calm', 'plain', 'mute'];
export const STORAGE_KEY = 'sendhome.a11y';

// Saved settings first, then ?a11y=large,calm on top (a judge or teacher can link a mode).
export function parseSettings(search, stored) {
  const s = Object.fromEntries(KEYS.map(k => [k, false]));
  try { for (const k of KEYS) if (JSON.parse(stored || '{}')[k] === true) s[k] = true; } catch { /* broken storage = defaults */ }
  const q = new URLSearchParams(search).get('a11y');
  if (q !== null) for (const k of q.split(',')) if (KEYS.includes(k)) s[k] = true;
  return s;
}
export function toggle(s, key) { return { ...s, [key]: !s[key] }; }

// Plain words: money words swapped for everyday ones; the numbers stay the same.
const PLAIN = {
  en: [
    ['mid-market rate', 'fair rate'],
    ['exchange-rate margin', 'hidden cost in the rate'],
    ['margin', 'hidden cost'],
    ['salary advance', 'borrowed money'],
    ['cushion', 'money kept for emergencies'],
  ],
  ar: [
    ['سعر السوق المتوسط', 'السعر العادل'],
    ['هامش سعر الصرف', 'التكلفة المخفية في السعر'],
    ['سلفة الراتب', 'مال مقترض'],
  ],
};
export function plain(text, s, lang = 'en') {
  if (!s.plain) return text;
  let t = text;
  for (const [from, to] of PLAIN[lang] || []) t = t.split(from).join(to);
  return t;
}
