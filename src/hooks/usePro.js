import { useCallback, useState } from 'react';
import { CONFIG } from '../config.js';

const KEY = CONFIG.storageKeys.pro;

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY))?.pro === true; }
  catch { return false; }
};

/**
 * Pro unlock via Gumroad license keys. Verification is client-side (good enough for a
 * low-price utility; a determined user can bypass it — that's an accepted tradeoff).
 * Returns pro state plus a verify() that checks a key against the configured product.
 */
export function usePro() {
  const [pro, setPro] = useState(load);
  const { gumroadPermalink } = CONFIG.pro;
  const configured = Boolean(gumroadPermalink);

  const verify = useCallback(async licenseKey => {
    if (!configured) return { ok: false, message: 'Pro is not configured yet.' };
    const key = (licenseKey || '').trim();
    if (!key) return { ok: false, message: 'Enter your license key.' };
    try {
      const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          product_permalink: gumroadPermalink,
          license_key: key,
          increment_uses_count: 'false'
        })
      });
      const data = await res.json();
      const purchase = data?.purchase;
      if (!data?.success || !purchase || purchase.refunded || purchase.chargebacked) {
        return { ok: false, message: 'That license key is not valid.' };
      }
      localStorage.setItem(KEY, JSON.stringify({ pro: true, key }));
      setPro(true);
      return { ok: true, message: 'Pro unlocked. Thank you!' };
    } catch {
      return { ok: false, message: 'Could not reach the license server. Try again.' };
    }
  }, [configured, gumroadPermalink]);

  const clear = useCallback(() => { localStorage.removeItem(KEY); setPro(false); }, []);

  return { pro, configured, verify, clear };
}
