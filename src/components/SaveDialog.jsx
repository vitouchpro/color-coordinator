import { useEffect, useRef, useState } from 'react';

/** Themed replacement for window.prompt() — built on native <dialog> for
 *  focus-trapping, Esc-to-close and a backdrop without extra dependencies. */
export default function SaveDialog({ open, defaultName, onConfirm, onClose }) {
  const ref = useRef(null);
  const inputRef = useRef(null);
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      setName(defaultName);
      dlg.showModal();
      requestAnimationFrame(() => inputRef.current?.select());
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open, defaultName]);

  const submit = e => {
    e.preventDefault();
    onConfirm((name || defaultName).trim());
  };

  return (
    <dialog ref={ref} className="dialog" onCancel={onClose} onClose={onClose}>
      <form className="dialog-body" onSubmit={submit}>
        <h2 className="dialog-title">Save palette</h2>
        <label className="dialog-label" htmlFor="palette-name">Palette name</label>
        <input
          id="palette-name" ref={inputRef} className="dialog-input" value={name}
          maxLength={60} autoComplete="off" spellCheck={false}
          onChange={e => setName(e.target.value)}
        />
        <div className="dialog-actions">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">Save</button>
        </div>
      </form>
    </dialog>
  );
}
