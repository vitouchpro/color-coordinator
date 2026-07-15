import { describe, it, expect } from 'vitest';
import { toExport, parseLibrary, mergeLibrary } from './library-io.js';

const p = (over = {}) => ({ name: 'Test', colors: ['#112233', '#445566'], mode: 'analogous', ts: 1, ...over });

describe('toExport', () => {
  it('wraps items in a versioned envelope', () => {
    const out = toExport([p()], 12345);
    expect(out).toMatchObject({ app: 'color-coordinator', version: 1, exportedAt: 12345 });
    expect(out.palettes).toHaveLength(1);
  });
});

describe('parseLibrary', () => {
  it('reads a bare array of palettes', () => {
    expect(parseLibrary(JSON.stringify([p(), p({ ts: 2 })]))).toHaveLength(2);
  });
  it('reads the { palettes: [...] } envelope', () => {
    expect(parseLibrary(JSON.stringify(toExport([p()], 1)))).toHaveLength(1);
  });
  it('drops malformed palettes', () => {
    const out = parseLibrary(JSON.stringify([p(), { name: 'bad', colors: ['nope'], mode: 'x' }, { foo: 1 }]));
    expect(out).toHaveLength(1);
  });
  it('defaults a missing ts to the injected clock', () => {
    const out = parseLibrary(JSON.stringify([{ name: 'X', colors: ['#111111'], mode: 'analogous' }]), 999);
    expect(out[0].ts).toBe(999);
  });
  it('throws on invalid JSON', () => {
    expect(() => parseLibrary('{not json')).toThrow(/valid JSON/);
  });
  it('throws when there are no palettes', () => {
    expect(() => parseLibrary(JSON.stringify({ foo: 1 }))).toThrow(/No palettes/);
    expect(() => parseLibrary(JSON.stringify([{ name: 'x' }]))).toThrow(/No valid palettes/);
  });
});

describe('mergeLibrary', () => {
  it('adds new palettes first and skips ts duplicates', () => {
    const merged = mergeLibrary([p({ ts: 1 })], [p({ ts: 1 }), p({ ts: 2 })]);
    expect(merged.map(x => x.ts)).toEqual([2, 1]);
  });
  it('dedupes by name+colors when ts is absent', () => {
    const a = { name: 'A', colors: ['#111111'], mode: 'analogous' };
    expect(mergeLibrary([a], [{ ...a }])).toHaveLength(1);
  });
});
