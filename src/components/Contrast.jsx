import { contrastRatio, hslToHex } from '../utils/color.js';

function Card({ bg, fg, label }) {
  const ratio = contrastRatio(bg, fg);
  const checks = [
    ['AA', ratio >= 4.5],
    ['AAA', ratio >= 7],
    ['AA large', ratio >= 3]
  ];
  return (
    <div className="contrast-card">
      <div className="contrast-sample" style={{ background: bg, color: fg }}>{label}</div>
      {checks.map(([name, pass]) => (
        <span key={name} className={`badge ${pass ? 'pass' : 'fail'}`}>
          {name} {pass ? '\u2713' : '\u2717'}
        </span>
      ))}
      <div className="ratio">Ratio {ratio.toFixed(2)}:1</div>
    </div>
  );
}

export default function Contrast({ h, s, l, colors }) {
  const base = hslToHex(h, s, l);
  return (
    <section className="panel">
      <h2>Accessibility — WCAG contrast</h2>
      <div className="contrast-grid">
        <Card bg={base} fg="#FFFFFF" label="White text on base" />
        <Card bg={base} fg="#000000" label="Black text on base" />
        {colors.length >= 2 && (
          <Card bg={colors[0].hex} fg={colors[colors.length - 1].hex} label="First on last swatch" />
        )}
        <Card bg="#FFFFFF" fg={base} label="Base text on white" />
      </div>
    </section>
  );
}
