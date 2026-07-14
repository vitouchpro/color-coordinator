export default function Header({ theme, onToggleTheme, onShare, onUndo, onRedo, canUndo, canRedo, pro, showUpgrade, onUpgrade }) {
  return (
    <header>
      <div className="header-inner">
        <div className="logo"><span className="logo-dot" aria-hidden="true" /> Color Coordinator</div>
        <div className="header-actions">
          {pro && <span className="pro-badge" title="Pro unlocked">Pro</span>}
          {showUpgrade && (
            <button className="btn upgrade" onClick={onUpgrade}>{'✨'} Upgrade</button>
          )}
          <button className="icon-btn" title="Undo (Ctrl+Z)" aria-label="Undo" onClick={onUndo} disabled={!canUndo}>
            {'↶'}
          </button>
          <button className="icon-btn" title="Redo (Ctrl+Shift+Z)" aria-label="Redo" onClick={onRedo} disabled={!canRedo}>
            {'↷'}
          </button>
          <button className="icon-btn" title="Copy shareable link" aria-label="Copy shareable link" onClick={onShare}>
            {'\u{1F517}'}
          </button>
          <button className="icon-btn" title="Toggle dark mode" aria-label="Toggle dark mode" onClick={onToggleTheme}>
            {theme === 'dark' ? '☼' : '☽'}
          </button>
        </div>
      </div>
    </header>
  );
}
