import { describe, it, expect } from 'vitest';
import { CVD_TYPES, simulate } from './cvd.js';

describe('CVD_TYPES', () => {
  it('lists normal vision plus the three deficiencies', () => {
    const keys = CVD_TYPES.map(([value]) => value);
    expect(keys).toEqual(['none', 'protanopia', 'deuteranopia', 'tritanopia']);
  });
});

describe('simulate', () => {
  it('returns the color unchanged for "none" or an unknown type', () => {
    expect(simulate('#FF0000', 'none')).toBe('#FF0000');
    expect(simulate('#FF0000', 'bogus')).toBe('#FF0000');
  });

  it('returns invalid input unchanged instead of throwing', () => {
    expect(() => simulate('not-a-hex', 'protanopia')).not.toThrow();
    expect(simulate('not-a-hex', 'protanopia')).toBe('not-a-hex');
  });

  it('maps white to white (matrix rows sum to 1)', () => {
    expect(simulate('#FFFFFF', 'protanopia')).toBe('#ffffff');
    expect(simulate('#FFFFFF', 'deuteranopia')).toBe('#ffffff');
    expect(simulate('#FFFFFF', 'tritanopia')).toBe('#ffffff');
  });

  it('applies the protanopia matrix to pure red', () => {
    // r=255,g=0,b=0 -> [0.567*255, 0.558*255, 0] = [145, 142, 0]
    expect(simulate('#FF0000', 'protanopia')).toBe('#918e00');
  });

  it('produces a valid hex for any deficiency', () => {
    for (const [type] of CVD_TYPES) {
      expect(simulate('#1D9E75', type)).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
