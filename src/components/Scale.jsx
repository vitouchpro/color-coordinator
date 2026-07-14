import { CONFIG } from '../config.js';
import { clamp, hslToHex } from '../utils/color.js';
import { simulate } from '../utils/cvd.js';

export default function Scale({ h, s, cvd, onCopy }) {
  return (
    <section className="panel">
      <h2>Tints &amp; shades scale (Tailwind style)</h2>
      <div className="scale">
        {Object.entries(CONFIG.scaleStops).map(([stop, l]) => {
          const hex = hslToHex(h, s, l);
          const text = l > 55 ? hslToHex(h, s, 18) : hslToHex(h, clamp(s, 0, 40), 94);
          return (
            <button
              key={stop}
              className="scale-cell"
              style={{ background: simulate(hex, cvd), color: text }}
              aria-label={`Copy shade ${stop} ${hex}`}
              onClick={() => onCopy(hex)}
            >
              <b>{stop}</b><span>{hex}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
