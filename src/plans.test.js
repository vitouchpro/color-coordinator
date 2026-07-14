import { describe, it, expect } from 'vitest';
import { PLANS, FEATURES } from './plans.js';

describe('PLANS', () => {
  it('defines exactly free, pro and enterprise', () => {
    expect(PLANS.map(p => p.id)).toEqual(['free', 'pro', 'enterprise']);
  });
  it('every plan has a name, price and a complete CTA', () => {
    for (const p of PLANS) {
      expect(p.name).toBeTruthy();
      expect(p.price).toBeTruthy();
      expect(p.cta.label).toBeTruthy();
      expect(typeof p.cta.href).toBe('string');
      expect(p.cta.href.length).toBeGreaterThan(0);
    }
  });
  it('enterprise CTA is a mailto contact link', () => {
    const ent = PLANS.find(p => p.id === 'enterprise');
    expect(ent.cta.href.startsWith('mailto:')).toBe(true);
  });
});

describe('FEATURES', () => {
  it('every row has a label and a value for all three tiers', () => {
    for (const f of FEATURES) {
      expect(f.label).toBeTruthy();
      for (const tier of ['free', 'pro', 'enterprise']) {
        expect(f[tier]).toBeDefined();
        expect(['boolean', 'string']).toContain(typeof f[tier]);
      }
    }
  });
  it('enterprise-only features are off for free and pro', () => {
    const brand = FEATURES.find(f => f.label.includes('white-label'));
    expect(brand.free).toBe(false);
    expect(brand.pro).toBe(false);
    expect(brand.enterprise).toBe(true);
  });
});
