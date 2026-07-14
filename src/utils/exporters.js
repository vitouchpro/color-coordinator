import { CONFIG, ROLE_NAMES } from '../config.js';
import { hslToHex } from './color.js';

export const EXPORT_FORMATS = ['CSS variables', 'Tailwind config', 'SCSS', 'JSON'];

const slug = i => ROLE_NAMES[i] || `color-${i + 1}`;
const scaleEntries = ({ h, s }) =>
  Object.entries(CONFIG.scaleStops).map(([stop, l]) => [stop, hslToHex(h, s, l)]);

export const GENERATORS = [
  (colors, base) =>
    ':root {\n' +
    colors.map((c, i) => `  --color-${slug(i)}: ${c.hex};`).join('\n') +
    '\n\n  /* Shade scale of the base color */\n' +
    scaleEntries(base).map(([s, hex]) => `  --primary-${s}: ${hex};`).join('\n') +
    '\n}',
  (colors, base) =>
    'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n' +
    scaleEntries(base).map(([s, hex]) => `          ${s}: '${hex}',`).join('\n') +
    '\n        },\n' +
    colors.map((c, i) => `        '${slug(i)}': '${c.hex}',`).join('\n') +
    '\n      }\n    }\n  }\n};',
  (colors, base) =>
    colors.map((c, i) => `$${slug(i)}: ${c.hex};`).join('\n') + '\n\n' +
    scaleEntries(base).map(([s, hex]) => `$primary-${s}: ${hex};`).join('\n'),
  (colors, base) =>
    JSON.stringify({
      name: 'color-coordinator-theme',
      mode: base.mode,
      base: hslToHex(base.h, base.s, base.l),
      palette: colors.map((c, i) => ({ role: slug(i), hex: c.hex, hsl: [c.h, c.s, c.l] })),
      scale: Object.fromEntries(scaleEntries(base))
    }, null, 2)
];
