// Pure color math — framework-free and unit-testable.
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))));
  return '#' + [f(0), f(8), f(4)].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToRgb(hex) {
  let s = String(hex).trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(s)) s = s.replace(/./g, c => c + c); // expand #RGB shorthand
  if (!/^[0-9a-f]{6}$/i.test(s)) return null;
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex) || { r: 0, g: 0, b: 0 };
  const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const HUE_NAMES = [
  [15, 'Red'], [45, 'Orange'], [70, 'Yellow'], [100, 'Lime'], [150, 'Green'], [180, 'Teal'],
  [200, 'Cyan'], [240, 'Blue'], [280, 'Violet'], [320, 'Magenta'], [345, 'Pink'], [361, 'Red']
];

export function colorName(h, s, l) {
  if (s < 8) return l > 80 ? 'Near white' : l < 20 ? 'Near black' : 'Gray';
  const hue = HUE_NAMES.find(([max]) => h < max)[1];
  const prefix = l > 72 ? 'Light ' : l < 30 ? 'Deep ' : s < 35 ? 'Muted ' : '';
  return prefix ? prefix + hue.toLowerCase() : hue;
}
