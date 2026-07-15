import { useEffect, useRef, useState } from 'react';
import { colorName, hslToHex } from '../utils/color.js';
import { simulate } from '../utils/cvd.js';

const SLIDERS = [['h', 'H', 360], ['s', 'S', 100], ['l', 'L', 100]];

export default function Swatch({ color, index, locked, cvd, onCopy, onToggleLock, onSetSwatch }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState({ h: color.h, s: color.s, l: color.l });
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = () => {
    onCopy(color.hex);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1200);
  };

  const openEdit = () => {
    setEdit({ h: color.h, s: color.s, l: color.l });
    setEditing(true);
  };
  const change = (key, value) => {
    const next = { ...edit, [key]: value };
    setEdit(next);
    onSetSwatch(index, hslToHex(next.h, next.s, next.l));
  };

  const shown = simulate(color.hex, cvd);

  return (
    <div className="swatch">
      <div
        className="swatch-color" style={{ background: shown }}
        role="button" tabIndex={0} aria-label={`Copy ${color.hex}`} title={`Click to copy ${color.hex}`}
        onClick={copy}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copy(); } }}
      >
        <button
          className={`lock${locked ? ' on' : ''}`}
          aria-label={`${locked ? 'Unlock' : 'Lock'} color ${color.hex}`}
          onClick={e => { e.stopPropagation(); onToggleLock(index, color.hex); }}
        >
          {locked ? '\u{1F512}' : '\u{1F513}'}
        </button>
      </div>
      <div className="swatch-info">
        <div className="swatch-hex">{color.hex}</div>
        <div className="swatch-name">{colorName(color.h, color.s, color.l)}</div>
        <div className="swatch-actions">
          <button className={`swatch-copy${copied ? ' copied' : ''}`} onClick={copy}>
            {copied ? 'Copied ✓' : 'Copy hex'}
          </button>
          <button className={`swatch-copy${editing ? ' copied' : ''}`} aria-expanded={editing}
            onClick={() => (editing ? setEditing(false) : openEdit())}>
            {editing ? 'Done' : 'Edit'}
          </button>
        </div>
        {editing && (
          <div className="swatch-edit">
            {SLIDERS.map(([key, label, max]) => (
              <label key={key} className="mini-slider">
                <span>{label}</span>
                <input type="range" min={0} max={max} value={edit[key]}
                  aria-label={`${label} of swatch ${index + 1}`}
                  onChange={e => change(key, +e.target.value)} />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
