import { useCallback, useRef, useState } from 'react';
import { CONFIG } from '../config.js';

export function useToast() {
  const [message, setMessage] = useState('');
  const timer = useRef();
  const toast = useCallback(msg => {
    setMessage(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(''), CONFIG.toastMs);
  }, []);
  const copyText = useCallback((text, msg) => {
    navigator.clipboard.writeText(text)
      .then(() => toast(msg || `Copied ${text}`))
      .catch(() => toast('Copy failed'));
  }, [toast]);
  return { message, toast, copyText };
}
