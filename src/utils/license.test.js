import { describe, it, expect } from 'vitest';
import { isActive } from './license.js';

describe('isActive', () => {
  it('is false without a purchase', () => {
    expect(isActive(null, false)).toBe(false);
    expect(isActive(undefined, true)).toBe(false);
  });

  it('grants a clean one-time purchase', () => {
    expect(isActive({}, false)).toBe(true);
  });

  it('denies refunded / charged-back / disputed purchases', () => {
    expect(isActive({ refunded: true }, false)).toBe(false);
    expect(isActive({ chargebacked: true }, false)).toBe(false);
    expect(isActive({ disputed: true }, true)).toBe(false);
  });

  describe('subscriptions (recurring)', () => {
    it('grants an active subscription', () => {
      expect(isActive({ subscription_cancelled_at: null, subscription_ended_at: null, subscription_failed_at: null }, true)).toBe(true);
    });
    it('still grants access after a pending cancellation (not yet ended)', () => {
      expect(isActive({ subscription_cancelled_at: '2026-01-01', subscription_ended_at: null }, true)).toBe(true);
    });
    it('revokes once the subscription has ended', () => {
      expect(isActive({ subscription_ended_at: '2026-01-01' }, true)).toBe(false);
    });
    it('revokes on a failed payment', () => {
      expect(isActive({ subscription_failed_at: '2026-01-01' }, true)).toBe(false);
    });
    it('ignores subscription fields for one-time purchases', () => {
      expect(isActive({ subscription_ended_at: '2026-01-01' }, false)).toBe(true);
    });
  });
});
