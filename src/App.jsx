import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONFIG, HARMONIES } from './config.js';
import { clamp, hexToRgb, hslToHex, rgbToHsl } from './utils/color.js';
import { downloadPng } from './utils/media.js';
import { useToast } from './hooks/useToast.js';
import { useTheme } from './hooks/useTheme.js';
import { useLibrary } from './hooks/useLibrary.js';
import { useHistory } from './hooks/useHistory.js';
import { usePro } from './hooks/usePro.js';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import BasePanel from './components/BasePanel.jsx';
import PalettePanel from './components/PalettePanel.jsx';
import Scale from './components/Scale.jsx';
import Contrast from './components/Contrast.jsx';
import ExportPanel from './components/ExportPanel.jsx';
import Extract from './components/Extract.jsx';
import Library from './components/Library.jsx';
import About from './components/About.jsx';
import Footer from './components/Footer.jsx';
import Toast from './components/Toast.jsx';
import SaveDialog from './components/SaveDialog.jsx';
import ProDialog from './components/ProDialog.jsx';
import AdSlot from './components/AdSlot.jsx';

const { min: L_MIN, max: L_MAX } = CONFIG.lightnessRange;

/** Read initial state from the URL hash so shared links restore the exact theme. */
function initialState() {
  const base = { ...CONFIG.defaultColor, mode: 'analogous', locks: {} };
  if (!location.hash) return base;
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.has('h')) base.h = clamp(+p.get('h') || 0, 0, 360);
  if (p.has('s')) base.s = clamp(+p.get('s') || 0, 0, 100);
  if (p.has('l')) base.l = clamp(+p.get('l') || 50, L_MIN, L_MAX);
  if (p.has('m') && HARMONIES[p.get('m')]) base.mode = p.get('m');
  return base;
}

export default function App() {
  const { state, set, undo, redo, canUndo, canRedo } = useHistory(initialState);
  const { h, s, l, mode, locks } = state;
  const [saveOpen, setSaveOpen] = useState(false);
  const [proOpen, setProOpen] = useState(false);
  const [cvd, setCvd] = useState('none');
  const { message, toast, copyText } = useToast();
  const { theme, toggle: toggleTheme } = useTheme();
  const pro = usePro();
  const library = useLibrary(pro.pro ? CONFIG.pro.maxLibrary : CONFIG.maxLibrary);

  const colors = useMemo(() => {
    const hues = HARMONIES[mode].hues(h);
    const mono = mode === 'monochrome';
    return hues.map((hue, i) => {
      if (locks[i]) {
        const hex = locks[i];
        return { hex, ...rgbToHsl(hexToRgb(hex)), locked: true };
      }
      const lightness = mono ? Math.round(22 + i * (58 / (hues.length - 1))) : l;
      return { hex: hslToHex(hue, s, lightness), h: hue, s, l: lightness, locked: false };
    });
  }, [h, s, l, mode, locks]);

  /* Live accent: the whole UI tints toward the chosen base color. */
  useEffect(() => {
    const base = hslToHex(h, s, clamp(l, 30, 62));
    const { r, g, b } = hexToRgb(base);
    const root = document.documentElement.style;
    root.setProperty('--live', base);
    root.setProperty('--live-soft', `rgba(${r},${g},${b},.10)`);
  }, [h, s, l]);

  /* Keep the shareable hash in sync with state. */
  useEffect(() => {
    const params = new URLSearchParams({ h, s, l, m: mode });
    history.replaceState(null, '', '#' + params.toString());
  }, [h, s, l, mode]);

  const patch = useCallback(p => set(prev => ({ ...prev, ...p })), [set]);
  const clearLocks = { locks: {} };

  const setFromHex = useCallback(hex => {
    const rgb = hexToRgb(hex);
    if (!rgb) { toast('Invalid hex code'); return; }
    const hsl = rgbToHsl(rgb);
    patch({ ...hsl, l: clamp(hsl.l, L_MIN, L_MAX), ...clearLocks });
  }, [patch, toast]);

  const randomize = useCallback(() => patch({
    h: Math.floor(Math.random() * 360),
    s: 55 + Math.floor(Math.random() * 40),
    l: 38 + Math.floor(Math.random() * 25),
    ...clearLocks
  }), [patch]);

  /* Global keyboard shortcuts. Single-letter keys are ignored while typing. */
  useEffect(() => {
    const onKey = e => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); }
      else if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
      else if (!mod && !typing && !saveOpen) {
        if (e.key === 'r' || e.key === 'R') { e.preventDefault(); randomize(); }
        else if (e.key === 's' || e.key === 'S') { e.preventDefault(); setSaveOpen(true); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo, randomize, saveOpen]);

  const handlers = {
    onPick: (nh, ns) => patch({ h: nh, s: ns, ...clearLocks }),
    onNudge: (key, delta) => set(prev => ({
      ...prev,
      [key]: key === 'h' ? (prev.h + delta + 360) % 360 : clamp(prev[key] + delta, L_MIN, L_MAX)
    })),
    onLightness: nl => patch({ l: nl }),
    onHex: setFromHex,
    onRandom: randomize,
    onMode: m => patch({ mode: m, ...clearLocks }),
    onToggleLock: (i, hex) => set(prev => {
      const next = { ...prev.locks };
      if (next[i]) delete next[i]; else next[i] = hex;
      return { ...prev, locks: next };
    }),
    onSetSwatch: (i, hex) => set(prev => ({ ...prev, locks: { ...prev.locks, [i]: hex } })),
    onSave: () => setSaveOpen(true),
    onConfirmSave: name => {
      const hexes = colors.map(c => c.hex);
      const atCap = !pro.pro && library.items.length >= CONFIG.maxLibrary;
      library.add({ name: name || hexes[0], colors: hexes, mode, ts: Date.now() });
      setSaveOpen(false);
      toast(atCap ? `Saved — free limit is ${CONFIG.maxLibrary}; upgrade for unlimited` : 'Palette saved');
    },
    onLoadPalette: item => {
      const rgb = hexToRgb(item.colors?.[0]);
      if (!rgb) { toast('That saved palette looks corrupted'); return; }
      const hsl = rgbToHsl(rgb);
      const nextLocks = Object.fromEntries(item.colors.map((c, i) => [i, c]));
      set({ ...hsl, l: clamp(hsl.l, L_MIN, L_MAX), mode: item.mode || 'analogous', locks: nextLocks });
      toast('Palette loaded');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onShare: () => copyText(location.href, 'Share link copied')
  };

  return (
    <>
      <Header
        theme={theme} onToggleTheme={toggleTheme} onShare={handlers.onShare}
        onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}
        pro={pro.pro} showUpgrade={pro.configured && !pro.pro} onUpgrade={() => setProOpen(true)}
      />
      <Hero />
      <main>
        <div className="workbench">
          <BasePanel h={h} s={s} l={l} toast={toast}
            onPick={handlers.onPick} onNudge={handlers.onNudge}
            onLightness={handlers.onLightness} onHex={handlers.onHex} onRandom={handlers.onRandom} />
          <PalettePanel mode={mode} colors={colors} locks={locks} cvd={cvd} onCvd={setCvd}
            onMode={handlers.onMode} onCopy={copyText} onToggleLock={handlers.onToggleLock}
            onSetSwatch={handlers.onSetSwatch} onSave={handlers.onSave}
            onCopyAll={() => copyText(colors.map(c => c.hex).join(', '), 'Palette copied')}
            onPng={() => { downloadPng(colors); toast('PNG downloaded'); }} />
        </div>
        <Scale h={h} s={s} cvd={cvd} onCopy={copyText} />
        <Contrast h={h} s={s} l={l} colors={colors} />
        <ExportPanel colors={colors} base={{ h, s, l, mode }} onCopy={copyText} />
        <Extract onUseColor={setFromHex} toast={toast}
          count={pro.pro ? CONFIG.pro.extractColors : CONFIG.extractColors} />
        <Library items={library.items} onLoad={handlers.onLoadPalette} onDelete={i => { library.remove(i); toast('Deleted'); }} />
        <AdSlot pro={pro.pro} />
        <About />
      </main>
      <Footer />
      <Toast message={message} />
      <SaveDialog
        open={saveOpen}
        defaultName={`${HARMONIES[mode].label} · ${colors[0]?.hex ?? ''}`}
        onConfirm={handlers.onConfirmSave}
        onClose={() => setSaveOpen(false)}
      />
      <ProDialog open={proOpen} onVerify={pro.verify} onClose={() => setProOpen(false)} />
    </>
  );
}
