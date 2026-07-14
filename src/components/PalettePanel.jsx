import Swatch from './Swatch.jsx';
import { HARMONIES } from '../config.js';
import { CVD_TYPES, simulate } from '../utils/cvd.js';

export default function PalettePanel({ mode, colors, locks, cvd, onCvd, onMode, onCopy, onToggleLock, onSetSwatch, onSave, onCopyAll, onPng }) {
  return (
    <div className="panel">
      <h2>Theme palette</h2>
      <div className="modes" role="group" aria-label="Harmony mode">
        {Object.entries(HARMONIES).map(([key, { label }]) => (
          <button key={key} className="chip" aria-pressed={key === mode} onClick={() => onMode(key)}>
            {label}
          </button>
        ))}
      </div>
      <div className="palette">
        {colors.map((c, i) => (
          <Swatch key={i} color={c} index={i} locked={Boolean(locks[i])} cvd={cvd}
            onCopy={onCopy} onToggleLock={onToggleLock} onSetSwatch={onSetSwatch} />
        ))}
      </div>
      <div className="palette-preview" aria-hidden="true">
        {colors.map((c, i) => <div key={i} style={{ background: simulate(c.hex, cvd) }} />)}
      </div>
      <div className="cvd-row">
        <label htmlFor="cvd-select">Colorblind preview</label>
        <select id="cvd-select" value={cvd} onChange={e => onCvd(e.target.value)}>
          {CVD_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </div>
      <div className="btn-row">
        <button className="btn primary" onClick={onSave}>{'\u{1F4BE}'} Save palette</button>
        <button className="btn" onClick={onCopyAll}>Copy all hex</button>
        <button className="btn" onClick={onPng}>Download PNG</button>
      </div>
    </div>
  );
}
