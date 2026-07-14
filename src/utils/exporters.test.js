import { describe, it, expect } from 'vitest';
import { EXPORT_FORMATS, GENERATORS } from './exporters.js';

const colors = [
  { hex: '#112233', h: 210, s: 50, l: 14 },
  { hex: '#445566', h: 210, s: 20, l: 33 }
];
const base = { h: 210, s: 50, l: 40, mode: 'analogous' };
const [css, tailwind, scss, json] = GENERATORS.map(gen => gen(colors, base));

describe('export formats', () => {
  it('exposes four formats with matching generators', () => {
    expect(EXPORT_FORMATS).toEqual(['CSS variables', 'Tailwind config', 'SCSS', 'JSON']);
    expect(GENERATORS).toHaveLength(4);
  });
});

describe('CSS generator', () => {
  it('emits :root custom properties and a shade scale', () => {
    expect(css.startsWith(':root {')).toBe(true);
    expect(css).toContain('--color-primary: #112233;');
    expect(css).toContain('--color-secondary: #445566;');
    expect(css).toContain('--primary-500:');
    expect(css.trimEnd().endsWith('}')).toBe(true);
  });
});

describe('Tailwind generator', () => {
  it('emits a config with a primary scale and named roles', () => {
    expect(tailwind).toContain('module.exports = {');
    expect(tailwind).toContain('primary: {');
    expect(tailwind).toContain("'primary': '#112233',");
    expect(tailwind).toContain("'secondary': '#445566',");
    expect(tailwind).toMatch(/500: '#[0-9A-F]{6}'/);
  });
});

describe('SCSS generator', () => {
  it('emits role variables and scale variables', () => {
    expect(scss).toContain('$primary: #112233;');
    expect(scss).toContain('$secondary: #445566;');
    expect(scss).toContain('$primary-500:');
  });
});

describe('JSON generator', () => {
  it('produces valid, well-structured JSON', () => {
    const obj = JSON.parse(json);
    expect(obj.name).toBe('color-coordinator-theme');
    expect(obj.mode).toBe('analogous');
    expect(obj.base).toMatch(/^#[0-9A-F]{6}$/);
    expect(obj.palette[0]).toEqual({ role: 'primary', hex: '#112233', hsl: [210, 50, 14] });
    expect(obj.palette[1].role).toBe('secondary');
    expect(obj.scale['500']).toMatch(/^#[0-9A-F]{6}$/);
  });
});

describe('role name fallback', () => {
  it('falls back to color-N beyond the named roles', () => {
    const six = Array.from({ length: 6 }, (_, i) => ({ hex: '#000000', h: 0, s: 0, l: 0 }));
    const out = GENERATORS[0](six, base);
    expect(out).toContain('--color-extra:');    // 5th named role
    expect(out).toContain('--color-color-6:');  // 6th falls back
  });
});
