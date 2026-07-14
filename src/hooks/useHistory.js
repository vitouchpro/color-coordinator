import { useCallback, useRef, useState } from 'react';

/**
 * useState with undo/redo. Rapid changes within COALESCE_MS collapse into one
 * history entry, so dragging the wheel or a slider is a single undo step rather
 * than hundreds. Discrete actions land as their own entries once activity idles.
 */
const COALESCE_MS = 450;
const HISTORY_LIMIT = 60;

export function useHistory(initial) {
  const [hist, setHist] = useState(() => ({
    past: [],
    present: typeof initial === 'function' ? initial() : initial,
    future: []
  }));
  const lastRef = useRef(0);

  const set = useCallback(updater => {
    const now = Date.now();
    const coalesce = now - lastRef.current < COALESCE_MS;
    lastRef.current = now;
    setHist(h => {
      const present = typeof updater === 'function' ? updater(h.present) : updater;
      if (coalesce && h.past.length) return { ...h, present, future: [] };
      return { past: [...h.past, h.present].slice(-HISTORY_LIMIT), present, future: [] };
    });
  }, []);

  const undo = useCallback(() => {
    lastRef.current = 0;
    setHist(h => (h.past.length
      ? { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
      : h));
  }, []);

  const redo = useCallback(() => {
    lastRef.current = 0;
    setHist(h => (h.future.length
      ? { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }
      : h));
  }, []);

  return {
    state: hist.present,
    set,
    undo,
    redo,
    canUndo: hist.past.length > 0,
    canRedo: hist.future.length > 0
  };
}
