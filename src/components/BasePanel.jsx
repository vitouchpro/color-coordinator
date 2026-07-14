import { useEffect, useState } from 'react';
import Wheel from './Wheel.jsx';
import { CONFIG } from '../config.js';
import { hslToHex } from '../utils/color.js';

export default function BasePanel({ h, s, l, onPick, onNudge, onLightness, onHex, onRandom, toast }) {
  const { min, max } = CONFIG.lightnessRange;
  const currentHex = hslToHex(h, s, l);
  const [hexDraft, setHexDraft] = useState(currentHex);
  useEffect(() => setHexDraft(currentHex), [currentHex]);

  const supportsEyedropper = typeof window !== 'undefined' && 'EyeDropper' in window;
  const eyedrop = async () => {
    try {
      const { sRGBHex } = await new window.EyeDropper().open();
      onHex(sRGBHex);
    } catch { /* user cancelled */ }
  };

  return (
    <div className="panel">
      <h2>Base color</h2>
      <div className="wheel-wrap">
        <Wheel h={h} s={s} onPick={onPick} onNudge={onNudge} />
        <div className="slider-row">
          <label htmlFor="lightness">Lightness</label>
          <input
            type="range" id="lightness" min={min} max={max} step={1} value={l}
            onChange={e => onLightness(+e.target.value)}
          />
          <output htmlFor="lightness">{l}%</output>
        </div>
        <div className="hex-row">
          <input
            type="text" value={hexDraft} maxLength={7} spellCheck={false} aria-label="Hex color code"
            onChange={e => setHexDraft(e.target.value)}
            onBlur={() => hexDraft !== currentHex && onHex(hexDraft)}
            onKeyDown={e => e.key === 'Enter' && onHex(hexDraft)}
          />
          {supportsEyedropper && (
            <button className="icon-btn" title="Pick color from screen" aria-label="Pick color from screen" onClick={eyedrop}>
              {'\u{1F4A7}'}
            </button>
          )}
          <button className="icon-btn" title="Random color" aria-label="Random color" onClick={onRandom}>
            {'\u{1F3B2}'}
          </button>
        </div>
      </div>
    </div>
  );
}
