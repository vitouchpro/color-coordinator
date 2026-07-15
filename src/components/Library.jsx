import { useRef } from 'react';

export default function Library({ items, onLoad, onDelete, onExport, onImport }) {
  const fileRef = useRef(null);

  return (
    <section className="panel">
      <div className="library-head">
        <h2>Saved palettes</h2>
        <div className="library-actions">
          <button className="btn" onClick={onExport} disabled={!items.length}>Export</button>
          <button className="btn" onClick={() => fileRef.current.click()}>Import</button>
          <input
            ref={fileRef} type="file" accept="application/json,.json" hidden
            onChange={e => { onImport(e.target.files[0]); e.target.value = ''; }}
          />
        </div>
      </div>
      <div className="library">
        {items.length === 0 && (
          <p className="empty-note">No saved palettes yet. Build a theme and press "Save palette".</p>
        )}
        {items.map((item, idx) => (
          <div className="library-item" key={item.ts ?? idx}>
            <button
              className="library-strip"
              style={{ border: 'none', cursor: 'pointer', padding: 0 }}
              title="Load this palette"
              onClick={() => onLoad(item)}
            >
              {item.colors.map((c, i) => <div key={i} style={{ background: c }} />)}
            </button>
            <span className="name">{item.name}</span>
            <button className="del" aria-label={`Delete palette ${item.name}`} onClick={() => onDelete(idx)}>
              {'✕'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
