import { useRef, useState } from 'react';
import { extractFromImage } from '../utils/media.js';

export default function Extract({ onUseColor, toast, count }) {
  const fileRef = useRef(null);
  const [colors, setColors] = useState([]);
  const [over, setOver] = useState(false);

  const handle = async file => {
    if (!file || !file.type.startsWith('image/')) return;
    try {
      const top = await extractFromImage(file, count);
      setColors(top);
      toast(`${top.length} colors extracted`);
    } catch {
      toast('Could not read that image');
    }
  };

  return (
    <section className="panel">
      <h2>Extract palette from an image</h2>
      <div
        className={`drop${over ? ' over' : ''}`}
        role="button"
        tabIndex={0}
        aria-label="Upload an image to extract colors"
        onClick={() => fileRef.current.click()}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files[0]); }}
      >
        Drop an image here or click to browse — colors are extracted locally, nothing is uploaded.
      </div>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handle(e.target.files[0])} />
      <div className="extract-result">
        {colors.map(hex => (
          <button
            key={hex}
            style={{ background: hex }}
            title={`Use ${hex} as base color`}
            aria-label={`Use extracted color ${hex}`}
            onClick={() => onUseColor(hex)}
          />
        ))}
      </div>
    </section>
  );
}
