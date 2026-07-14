import { useCallback, useState } from 'react';
import { CONFIG } from '../config.js';

const load = () => {
  try { return JSON.parse(localStorage.getItem(CONFIG.storageKeys.library)) || []; }
  catch { return []; }
};

export function useLibrary(max = CONFIG.maxLibrary) {
  const [items, setItems] = useState(load);
  const persist = useCallback(next => {
    const capped = next.slice(0, max);
    localStorage.setItem(CONFIG.storageKeys.library, JSON.stringify(capped));
    setItems(capped);
  }, [max]);
  const add = useCallback(item => persist([item, ...load()]), [persist]);
  const remove = useCallback(idx => persist(load().filter((_, i) => i !== idx)), [persist]);
  return { items, add, remove };
}
