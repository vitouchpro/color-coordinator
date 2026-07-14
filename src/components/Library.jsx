export default function Library({ items, onLoad, onDelete }) {
  return (
    <section className="panel">
      <h2>Saved palettes</h2>
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
              {'\u2715'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
