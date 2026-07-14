import { CONFIG } from '../config.js';
import { clamp } from './color.js';

/** Extract dominant colors from an image file — fully local, never uploaded. */
export function extractFromImage(file, count = CONFIG.extractColors) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = 90, canvas = document.createElement('canvas');
      canvas.width = s; canvas.height = s;
      const g = canvas.getContext('2d');
      g.drawImage(img, 0, 0, s, s);
      const data = g.getImageData(0, 0, s, s).data;
      const buckets = new Map();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 200) continue;
        const key = [data[i], data[i + 1], data[i + 2]].map(v => Math.round(v / 24) * 24).join(',');
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
      const top = [...buckets.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([k]) => '#' + k.split(',')
          .map(v => clamp(+v, 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase());
      URL.revokeObjectURL(img.src);
      resolve(top);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/** Render the palette to a PNG and trigger a download. */
export function downloadPng(colors) {
  const w = 1200, h = 500, c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const bw = w / colors.length;
  colors.forEach((col, i) => {
    g.fillStyle = col.hex;
    g.fillRect(i * bw, 0, bw + 1, h);
    g.fillStyle = col.l > 55 ? '#111111' : '#FFFFFF';
    g.font = '600 30px Archivo, sans-serif';
    g.fillText(col.hex, i * bw + 24, h - 34);
  });
  const a = document.createElement('a');
  a.download = 'color-coordinator-palette.png';
  a.href = c.toDataURL('image/png');
  a.click();
}
