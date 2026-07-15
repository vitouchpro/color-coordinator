import { useCallback, useEffect, useState } from 'react';
import { CONFIG } from '../config.js';
import { isActive } from '../utils/license.js';

const KEY = CONFIG.storageKeys.pro;
const DAY = 86400000;

const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch { return null; } };
const write = data => localStorage.setItem(KEY, JSON.stringify(data));

function verifyLicense(key) {
  return fetch('https://api.gumroad.com/v2/licenses/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      product_permalink: CONFIG.pro.gumroadPermalink,
      license_key: key,
      increment_uses_count: 'false'
    })
  }).then(r => r.json());
}

/**
 * Pro unlock via Gumroad license keys. Supports both one-time and subscription
 * products (CONFIG.pro.recurring). For subscriptions, the license is re-verified
 * on load every `recheckDays` and Pro is revoked once the subscription lapses.
 * Verification is client-side — good enough for a low-price utility, but a
 * determined user can bypass it (see README).
 */
const readWhiteLabel = () => {
  if (CONFIG.pro.whiteLabel === true) return true;
  try { return localStorage.getItem(CONFIG.storageKeys.whiteLabel) === '1'; }
  catch { return false; }
};

export function usePro() {
  const [pro, setPro] = useState(() => Boolean(read()?.pro));
  const [whiteLabel] = useState(readWhiteLabel);
  const { gumroadPermalink, recurring = false, recheckDays = 7 } = CONFIG.pro;
  const configured = Boolean(gumroadPermalink);

  // Periodic re-verification: revoke Pro if a subscription has lapsed.
  useEffect(() => {
    if (!pro || !configured) return;
    const s = read();
    if (!s?.key) return;
    if (s.checkedAt && Date.now() - s.checkedAt < recheckDays * DAY) return;

    let cancelled = false;
    verifyLicense(s.key).then(data => {
      if (cancelled) return;
      if (data?.success && isActive(data.purchase, recurring)) {
        write({ ...s, pro: true, checkedAt: Date.now() });   // still valid
      } else if (data && (data.success === false || data.purchase)) {
        localStorage.removeItem(KEY); setPro(false);          // definitively lapsed
      }
      // network/parse failure: leave state untouched and retry on next load
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [pro, configured, recurring, recheckDays]);

  const verify = useCallback(async licenseKey => {
    if (!configured) return { ok: false, message: 'Pro is not configured yet.' };
    const key = (licenseKey || '').trim();
    if (!key) return { ok: false, message: 'Enter your license key.' };
    try {
      const data = await verifyLicense(key);
      if (!data?.success || !isActive(data.purchase, recurring)) {
        return { ok: false, message: 'That license key is not valid or has expired.' };
      }
      write({ pro: true, key, checkedAt: Date.now() });
      setPro(true);
      return { ok: true, message: 'Pro unlocked. Thank you!' };
    } catch {
      return { ok: false, message: 'Could not reach the license server. Try again.' };
    }
  }, [configured, recurring]);

  const clear = useCallback(() => { localStorage.removeItem(KEY); setPro(false); }, []);

  return { pro, whiteLabel, configured, verify, clear };
}
