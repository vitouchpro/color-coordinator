import { useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config.js';

/** Upgrade / license-unlock dialog. Buy on Gumroad, then paste the license key here. */
export default function ProDialog({ open, onVerify, onClose }) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [key, setKey] = useState('');
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const { gumroadUrl, price, recurring } = CONFIG.pro;

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) { setStatus(null); dlg.showModal(); requestAnimationFrame(() => inputRef.current?.focus()); }
    else if (!open && dlg.open) dlg.close();
  }, [open]);

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    const result = await onVerify(key);
    setBusy(false);
    setStatus(result);
    if (result.ok) setTimeout(onClose, 900);
  };

  return (
    <dialog ref={ref} className="dialog" onCancel={onClose} onClose={onClose}>
      <div className="dialog-body">
        <h2 className="dialog-title">Color Coordinator Pro</h2>
        <p className="pro-perks">
          Unlock unlimited saved palettes, richer image extraction and an ad-free workspace
          {price ? ` — ${price}` : ''}{recurring ? '. Cancel anytime.' : ', a one-time purchase.'}
        </p>
        {gumroadUrl && (
          <a className="btn primary" href={gumroadUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            Get Pro on Gumroad →
          </a>
        )}
        <form className="dialog-body" style={{ padding: 0, marginTop: 4 }} onSubmit={submit}>
          <label className="dialog-label" htmlFor="license-key">Already bought? Enter your license key</label>
          <input
            id="license-key" ref={inputRef} className="dialog-input" value={key}
            autoComplete="off" spellCheck={false} placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
            onChange={e => setKey(e.target.value)}
          />
          {status && <p className={`pro-status ${status.ok ? 'ok' : 'err'}`}>{status.message}</p>}
          <div className="dialog-actions">
            <button type="button" className="btn" onClick={onClose}>Close</button>
            <button type="submit" className="btn primary" disabled={busy}>{busy ? 'Checking…' : 'Unlock'}</button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
