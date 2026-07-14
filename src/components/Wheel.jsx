import { useEffect, useRef } from 'react';
import { CONFIG } from '../config.js';
import { clamp } from '../utils/color.js';

const size = CONFIG.wheelSize;
const cx = size / 2, cy = size / 2, radius = size / 2 - 2;

/** Builds the wheel bitmap once per module load; marker redraws per state change. */
let cachedBitmap = null;
function buildBitmap(ctx) {
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy, dist = Math.hypot(dx, dy);
      if (dist > radius + 1) continue;
      const hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
      const sat = Math.min(dist / radius, 1);
      const c = sat, hp = hue / 60, xv = c * (1 - Math.abs(hp % 2 - 1)), m = 0.5 - c / 2;
      const rgb = [[c, xv, 0], [xv, c, 0], [0, c, xv], [0, xv, c], [xv, 0, c], [c, 0, xv]][Math.floor(hp) % 6];
      const i = (y * size + x) * 4;
      d[i] = (rgb[0] + m) * 255; d[i + 1] = (rgb[1] + m) * 255; d[i + 2] = (rgb[2] + m) * 255;
      d[i + 3] = dist > radius - 1 ? clamp(255 * (radius + 1 - dist), 0, 255) : 255;
    }
  }
  return img;
}

export default function Wheel({ h, s, onPick, onNudge }) {
  const canvasRef = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    if (!cachedBitmap) cachedBitmap = buildBitmap(ctx);
    ctx.clearRect(0, 0, size, size);
    ctx.putImageData(cachedBitmap, 0, 0);
    const ang = h * Math.PI / 180, r = (s / 100) * radius;
    const mx = cx + Math.cos(ang) * r, my = cy + Math.sin(ang) * r;
    ctx.beginPath(); ctx.arc(mx, my, 9, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, 10.5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; ctx.stroke();
  }, [h, s]);

  const pick = e => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (size / rect.width) - cx;
    const y = (e.clientY - rect.top) * (size / rect.height) - cy;
    onPick(
      Math.round((Math.atan2(y, x) * 180 / Math.PI + 360) % 360),
      Math.round(clamp(Math.hypot(x, y) / radius, 0, 1) * 100)
    );
  };

  const onKeyDown = e => {
    const step = e.shiftKey ? 10 : 2;
    const map = { ArrowRight: ['h', step], ArrowLeft: ['h', -step], ArrowUp: ['l', step], ArrowDown: ['l', -step] };
    if (map[e.key]) { e.preventDefault(); onNudge(...map[e.key]); }
  };

  return (
    <canvas
      ref={canvasRef}
      id="wheel"
      width={size}
      height={size}
      tabIndex={0}
      aria-label="Color wheel. Drag to choose hue and saturation. Arrow keys adjust hue and lightness."
      onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); pick(e); }}
      onPointerMove={e => dragging.current && pick(e)}
      onPointerUp={() => { dragging.current = false; }}
      onKeyDown={onKeyDown}
    />
  );
}
