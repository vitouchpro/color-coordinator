import { useCallback, useEffect, useState } from 'react';
import { CONFIG } from '../config.js';

const initial = () =>
  localStorage.getItem(CONFIG.storageKeys.theme) ||
  (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function useTheme() {
  const [theme, setTheme] = useState(initial);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(CONFIG.storageKeys.theme, theme);
  }, [theme]);
  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
