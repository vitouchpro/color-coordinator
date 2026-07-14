import { describe, it, expect } from 'vitest';
import { clamp, hslToHex, hexToRgb, rgbToHsl, luminance, contrastRatio, colorName } from './color.js';

describe('clamp', () => {
  it('bounds a value to the range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe('hslToHex', () => {
  it('maps primary HSL values to known hex codes', () => {
    expect(hslToHex(0, 100, 50)).toBe('#FF0000');   // red
    expect(hslToHex(120, 100, 50)).toBe('#00FF00');  // green
    expect(hslToHex(240, 100, 50)).toBe('#0000FF');  // blue
    expect(hslToHex(0, 0, 0)).toBe('#000000');       // black
    expect(hslToHex(0, 0, 100)).toBe('#FFFFFF');     // white
  });
  it('always returns an uppercase 7-char hex', () => {
    expect(hslToHex(160, 69, 37)).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('hexToRgb', () => {
  it('parses 6-digit hex with or without #', () => {
    expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });
  it('expands 3-digit shorthand', () => {
    expect(hexToRgb('#f00')).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb('#0f0')).toEqual({ r: 0, g: 255, b: 0 });
  });
  it('trims surrounding whitespace', () => {
    expect(hexToRgb('  #0000FF ')).toEqual({ r: 0, g: 0, b: 255 });
  });
  it('returns null for invalid input', () => {
    expect(hexToRgb('#GGGGGG')).toBeNull();
    expect(hexToRgb('#12345')).toBeNull();
    expect(hexToRgb('nope')).toBeNull();
    expect(hexToRgb(null)).toBeNull();
    expect(hexToRgb(undefined)).toBeNull();
  });
});

describe('rgbToHsl', () => {
  it('maps primaries to expected HSL', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 0, g: 0, b: 0 })).toEqual({ h: 0, s: 0, l: 0 });
    expect(rgbToHsl({ r: 255, g: 255, b: 255 })).toEqual({ h: 0, s: 0, l: 100 });
  });
});

describe('hex <-> hsl round trip', () => {
  it('returns a color close to the original after a full round trip', () => {
    for (const hex of ['#1D9E75', '#D85A30', '#4169E1', '#808080', '#FFC0CB']) {
      const hsl = rgbToHsl(hexToRgb(hex));
      const back = hexToRgb(hslToHex(hsl.h, hsl.s, hsl.l));
      const orig = hexToRgb(hex);
      for (const ch of ['r', 'g', 'b']) {
        expect(Math.abs(back[ch] - orig[ch])).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('luminance', () => {
  it('is 0 for black and 1 for white', () => {
    expect(luminance('#000000')).toBeCloseTo(0, 5);
    expect(luminance('#FFFFFF')).toBeCloseTo(1, 5);
  });
  it('treats an invalid hex as black instead of throwing', () => {
    expect(() => luminance('not-a-hex')).not.toThrow();
    expect(luminance('not-a-hex')).toBeCloseTo(0, 5);
  });
});

describe('contrastRatio', () => {
  it('gives 21:1 for black vs white and is order-independent', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 2);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 2);
  });
  it('gives 1:1 for identical colors', () => {
    expect(contrastRatio('#123456', '#123456')).toBeCloseTo(1, 5);
  });
});

describe('colorName', () => {
  it('names neutral tones', () => {
    expect(colorName(0, 0, 10)).toBe('Near black');
    expect(colorName(0, 0, 90)).toBe('Near white');
    expect(colorName(0, 0, 50)).toBe('Gray');
  });
  it('names hues with lightness/saturation prefixes', () => {
    expect(colorName(0, 100, 50)).toBe('Red');
    expect(colorName(220, 100, 50)).toBe('Blue');
    expect(colorName(220, 100, 80)).toBe('Light blue');
    expect(colorName(220, 100, 25)).toBe('Deep blue');
    expect(colorName(220, 20, 50)).toBe('Muted blue');
  });
});
