import { useEffect, useRef } from 'react';
import { CONFIG } from '../config.js';

/**
 * Privacy-friendly display ad (Carbon / BuySellAds). Renders nothing unless a serve
 * ID is configured in CONFIG.ads, and nothing for Pro users. Loads the ad script
 * lazily on mount so the app never calls a third party until the owner opts in.
 */
export default function AdSlot({ pro }) {
  const ref = useRef(null);
  const { carbonServe, carbonPlacement } = CONFIG.ads;
  const enabled = Boolean(carbonServe) && !pro;

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const s = document.createElement('script');
    s.async = true;
    s.id = '_carbonads_js';
    s.src = `//cdn.carbonads.com/carbon.js?serve=${carbonServe}&placement=${carbonPlacement}`;
    el.appendChild(s);
    return () => { el.innerHTML = ''; };
  }, [enabled, carbonServe, carbonPlacement]);

  if (!enabled) return null;
  return <div className="ad-slot" ref={ref} aria-hidden="true" />;
}
