// Color-vision-deficiency simulation for accessibility previews.
// Standard sRGB approximation matrices (row-major 3x3) used by common CVD tools.
import { hexToRgb } from './color.js';

const MATRICES = {
  protanopia:   [0.567, 0.433, 0,     0.558, 0.442, 0,     0,     0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0,     0.700, 0.300, 0,     0,     0.300, 0.700],
  tritanopia:   [0.950, 0.050, 0,     0,     0.433, 0.567, 0,     0.475, 0.525]
};

export const CVD_TYPES = [
  ['none', 'Normal vision'],
  ['protanopia', 'Protanopia (red-blind)'],
  ['deuteranopia', 'Deuteranopia (green-blind)'],
  ['tritanopia', 'Tritanopia (blue-blind)']
];

const channel = v => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0');

/** Return hex as it would appear under the given color-vision deficiency. */
export function simulate(hex, type) {
  const m = MATRICES[type];
  const rgb = m && hexToRgb(hex);
  if (!rgb) return hex;
  const { r, g, b } = rgb;
  return '#' + channel(m[0] * r + m[1] * g + m[2] * b)
             + channel(m[3] * r + m[4] * g + m[5] * b)
             + channel(m[6] * r + m[7] * g + m[8] * b);
}
