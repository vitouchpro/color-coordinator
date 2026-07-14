import { useState } from 'react';
import { EXPORT_FORMATS, GENERATORS } from '../utils/exporters.js';

export default function ExportPanel({ colors, base, onCopy }) {
  const [format, setFormat] = useState(0);
  const code = GENERATORS[format](colors, base);

  const onTabKey = e => {
    const last = EXPORT_FORMATS.length - 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      setFormat(f => (e.key === 'ArrowRight' ? (f === last ? 0 : f + 1) : (f === 0 ? last : f - 1)));
    } else if (e.key === 'Home') { e.preventDefault(); setFormat(0); }
    else if (e.key === 'End') { e.preventDefault(); setFormat(last); }
  };

  return (
    <section className="panel">
      <h2>Export code</h2>
      <div className="export-tabs" role="tablist" aria-label="Export format" onKeyDown={onTabKey}>
        {EXPORT_FORMATS.map((label, i) => (
          <button
            key={label}
            className="chip"
            role="tab"
            id={`export-tab-${i}`}
            aria-selected={i === format}
            aria-controls="export-code"
            tabIndex={i === format ? 0 : -1}
            onClick={() => setFormat(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <pre
        className="code"
        id="export-code"
        role="tabpanel"
        aria-labelledby={`export-tab-${format}`}
        tabIndex={0}
      >{code}</pre>
      <div className="btn-row">
        <button className="btn primary" onClick={() => onCopy(code, 'Code copied')}>Copy code</button>
      </div>
    </section>
  );
}
