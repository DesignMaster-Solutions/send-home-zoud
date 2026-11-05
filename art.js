// Send Home: the drawings. Plain SVG strings, no DOM, so tests/art.test.mjs can check them. Counters are fictional.
// Inline SVG in HTML needs no xmlns, so the drawings carry no URL at all.
const svg = (vb, body, cls = '') => `<svg viewBox="${vb}" class="${cls}" aria-hidden="true" focusable="false">${body}</svg>`;

// A striped shop awning with a scalloped edge, the thing every counter on the street has.
function awning(a, b, w = 160, n = 8, y = 0) {
  const s = w / n;
  let out = '';
  for (let i = 0; i < n; i++) out += `<path d="M${i * s} ${y}h${s}v12a${s / 2} ${s / 2} 0 0 1 -${s} 0z" fill="${i % 2 ? b : a}"/>`;
  return out;
}

const FACADES = {
  // Pearl Street Bank: stone, pediment, columns.
  bank: `<rect width="160" height="56" fill="#8f9ea8"/><path d="M8 18L80 2l72 16z" fill="#cfd8de"/>
    ${[22, 52, 82, 112, 138].map(x => `<rect x="${x - 4}" y="20" width="8" height="34" fill="#e3e9ed"/>`).join('')}`,
  // Saffron Lane Exchange: warm awning, a hanging lamp.
  saffron: `<rect width="160" height="56" fill="#7a4a1c"/>${awning('#f2b134', '#fff3d6')}
    <path d="M120 22v8" stroke="#fff3d6" stroke-width="2"/><circle cx="120" cy="34" r="5" fill="#ffd77a" class="lamp"/>
    <rect x="18" y="28" width="60" height="24" rx="3" fill="#2a1a0a"/><path d="M24 46h48" stroke="#f2b134" stroke-width="3"/>`,
  // Blue Dhow Money: a dhow sail on the wall.
  dhow: `<rect width="160" height="56" fill="#24466b"/>${awning('#7fb2f0', '#e8f1fc')}
    <path d="M62 50h36l-6 5H68z" fill="#e8f1fc"/><path d="M80 22v28M80 24l16 22H80z" stroke="#e8f1fc" stroke-width="2" fill="#7fb2f0"/>`,
  // Metro Kiosk: a neon box that never stops shouting.
  zero: `<rect width="160" height="56" fill="#1d0d18"/><rect x="40" y="8" width="80" height="40" rx="8" fill="none" stroke="#ff4f9a" stroke-width="4" class="neon"/>
    <text x="80" y="38" text-anchor="middle" font-size="26" font-weight="800" fill="#ff4f9a" class="neon">0%</text>
    ${[14, 146].map(x => `<circle cx="${x}" cy="28" r="4" fill="#ffd23f" class="neon"/>`).join('')}`,
  // Pocket app: a phone with signal, no queue.
  app: `<rect width="160" height="56" fill="#2c4a1e"/><rect x="66" y="6" width="28" height="46" rx="5" fill="#b9e769"/>
    <rect x="70" y="12" width="20" height="30" rx="2" fill="#2c4a1e"/><circle cx="80" cy="47" r="2" fill="#2c4a1e"/>
    ${[8, 14, 20].map(r => `<path d="M${102 + r} 20a${r} ${r} 0 0 0 -${r} -${r}" stroke="#b9e769" stroke-width="2.5" fill="none"/>`).join('')}`,
  // The phone offer: a dark doorway, one bulb, a lit screen. No awning, no sign.
  informal: `<rect width="160" height="56" fill="#141414"/><rect x="56" y="12" width="48" height="44" fill="#050505"/>
    <path d="M80 0v8" stroke="#555" stroke-width="2"/><circle cx="80" cy="10" r="3" fill="#c9b37a"/>
    <rect x="74" y="34" width="12" height="18" rx="2" fill="#3fb6a8" class="lamp"/>`,
};
export const facade = kind => svg('0 0 160 56', FACADES[kind], 'facade');

// Dubai on the left, the street of awnings, a dotted line home, a house on the right.
const towers = (x, h) => `<g fill="#0a1720">${[[0, 70], [16, 110], [30, 86], [44, 150], [52, 126], [66, 96], [82, 60]]
  .map(([dx, th]) => `<rect x="${x + dx}" y="${h - th}" width="14" height="${th}"/>`).join('')}<path d="M${x + 49} ${h - 150}l2 -26 2 26z"/></g>`;
const house = (x, y, lit) => `<g class="house${lit ? ' lit' : ''}"><path d="M${x} ${y}l30 -26 30 26z" fill="#e4572e"/>
  <rect x="${x + 6}" y="${y}" width="48" height="36" fill="#f4ead8"/><rect class="win" x="${x + 14}" y="${y + 8}" width="12" height="12"/>
  <rect x="${x + 34}" y="${y + 12}" width="12" height="24" fill="#7a4a1c"/></g>`;
const coin = (d, id) => `<g class="coin"><circle r="11" fill="#f2b134" stroke="#7a4a1c" stroke-width="2"/><path d="M-4 -5v10M0 -5v10M4 -5v10" stroke="#7a4a1c" stroke-width="1.6"/>
  <animateMotion id="${id}" dur="1.8s" begin="indefinite" fill="freeze" path="${d}" calcMode="spline" keyTimes="0;1" keySplines=".3 0 .4 1"/></g>`;

export function scene() {
  const arc = 'M110 70 Q330 -30 560 92';
  const shops = ['#f2b134', '#7fb2f0', '#ff4f9a', '#b9e769', '#cfd8de'].map((c, i) =>
    `<g transform="translate(${150 + i * 64} 150)"><rect width="56" height="40" fill="#20414f"/>${awning(c, '#fff3d6', 56, 4)}<rect x="8" y="22" width="40" height="18" fill="#0a1720"/></g>`).join('');
  return svg('0 0 640 200', `<rect width="640" height="200" fill="#17303d"/><circle cx="250" cy="112" r="30" fill="#f2b134" opacity=".9"/>
    ${towers(20, 190)}${shops}<rect y="190" width="640" height="10" fill="#0a1720"/>
    <path d="${arc}" fill="none" stroke="#f4ead8" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"/>${house(540, 128, true)}
    <g transform="translate(560 92)">${coin('M-450 -22 Q-230 -122 0 0', 'fly')}</g>`, 'scene');
}

// News from home: the coin crosses to the house, or falls short when the money was lost.
export function flight(lost, label = '') {
  // The coin rests at the end of its path (that is where calm mode shows it); the path is relative to that point.
  const [end, d] = lost ? ['360 136', 'M-240 -70 Q-120 -150 0 0'] : ['550 90', 'M-430 -24 Q-210 -120 0 0'];
  return svg('0 0 640 150', `<rect width="640" height="150" rx="14" fill="#17303d"/>${towers(14, 150)}
    <path d="M120 66 Q340 -30 550 90" fill="none" stroke="#f4ead8" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round" opacity=".6"/>
    ${house(520, 104, !lost)}${lost ? '' : `<text x="550" y="70" text-anchor="middle" class="arrived">${label}</text>`}<g transform="translate(${end})">${coin(d, 'fly')}</g>`, 'flight');
}

// Values for a count-up that eases out and lands exactly on the final number.
export const countFrames = (to, n) => Array.from({ length: n }, (_, i) => (i === n - 1 ? to : to * (1 - (1 - (i + 1) / n) ** 3)));
