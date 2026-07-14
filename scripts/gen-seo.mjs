// Build-time programmatic SEO generator.
// Reuses the app's pure color utilities to emit lightweight, self-contained static
// pages (one per named color + one per harmony rule + a hub) into dist/. Each page
// is genuinely useful — palette, harmonies, Tailwind scale, WCAG contrast, export —
// and links into the SPA pre-filled. Run automatically after `vite build`.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONFIG, HARMONIES } from '../src/config.js';
import { hexToRgb, rgbToHsl, hslToHex, contrastRatio, colorName } from '../src/utils/color.js';
import { NAMED_COLORS, slugify } from './seo-colors.mjs';
import { PLANS, FEATURES } from '../src/plans.js';

const DIST = join(process.cwd(), 'dist');
const { origin, base } = CONFIG.site;
const abs = p => origin + base + p;               // absolute URL for canonical/OG
const rel = p => base + p;                        // root-relative href
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------- color computation (mirrors the app) ---------- */
function harmonyHexes(h, s, l, mode) {
  const hues = HARMONIES[mode].hues(h);
  const mono = mode === 'monochrome';
  return hues.map((hue, i) =>
    mono ? hslToHex(hue, s, Math.round(22 + i * (58 / (hues.length - 1)))) : hslToHex(hue, s, l));
}
const scaleHexes = (h, s) => Object.entries(CONFIG.scaleStops).map(([stop, l]) => [stop, hslToHex(h, s, l)]);
const textOn = hex => (contrastRatio(hex, '#000000') >= contrastRatio(hex, '#FFFFFF') ? '#111' : '#fff');

/* ---------- reusable HTML fragments ---------- */
const chips = hexes => `<div class="row">${hexes.map(hx =>
  `<div class="chip" style="background:${hx};color:${textOn(hx)}">${hx}</div>`).join('')}</div>`;

const carbon = CONFIG.ads.carbonServe
  ? `<div class="ad"><script async type="text/javascript"
       src="//cdn.carbonads.com/carbon.js?serve=${CONFIG.ads.carbonServe}&placement=${CONFIG.ads.carbonPlacement}"
       id="_carbonads_js"></script></div>`
  : '';

function shell({ title, description, canonical, h1, body, robots = 'index, follow, max-image-preview:large', crumb }) {
  const crumbHtml = crumb ?? `&rsaquo; <a href="${rel('colors/')}">Colors</a>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<meta name="theme-color" content="#FAFAF7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#131316" media="(prefers-color-scheme: dark)">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs('og-image.png')}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='45' fill='%23D85A30'/><circle cx='50' cy='50' r='28' fill='%231D9E75'/><circle cx='50' cy='50' r='12' fill='%23FAFAF7'/></svg>">
<style>
  :root{--bg:#FAFAF7;--surface:#fff;--ink:#1A1A1E;--muted:#6B6B70;--border:#E4E4E0;--live:#1D9E75}
  @media(prefers-color-scheme:dark){:root{--bg:#131316;--surface:#1C1C21;--ink:#F2F2F0;--muted:#9A9AA0;--border:#2A2A30}}
  *{box-sizing:border-box;margin:0}
  body{font:16px/1.6 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--ink)}
  a{color:var(--live)}
  header,main,footer{max-width:860px;margin:0 auto;padding:0 20px}
  header{padding-top:22px}.crumb{font-size:13px;color:var(--muted)}
  h1{font-size:clamp(24px,4vw,34px);letter-spacing:-.02em;margin:18px 0 6px}
  h2{font-size:18px;margin:30px 0 12px}
  p{color:var(--muted)}main>section{margin-top:8px}
  .hero-sw{height:120px;border-radius:12px;border:1px solid var(--border);display:flex;align-items:flex-end;padding:12px;font:600 14px ui-monospace,monospace}
  .row{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0}
  .chip{flex:1;min-width:90px;border-radius:8px;padding:12px 10px;font:600 12px ui-monospace,monospace;border:1px solid rgba(0,0,0,.08)}
  pre{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;overflow:auto;font:12.5px/1.6 ui-monospace,monospace;color:var(--ink)}
  .cta{display:inline-block;background:var(--live);color:#fff;border-radius:8px;padding:11px 18px;font-weight:600;text-decoration:none;margin:6px 0}
  .facts{display:flex;flex-wrap:wrap;gap:8px 22px;font-size:14px;color:var(--muted);margin-top:6px}
  .facts b{color:var(--ink)}
  .links{display:flex;flex-wrap:wrap;gap:6px 14px;font-size:14px;margin:10px 0}
  .ad{margin:24px 0;min-height:1px}
  footer{color:var(--muted);font-size:13px;border-top:1px solid var(--border);margin-top:40px;padding:20px}
</style>
</head>
<body>
<header>
  <div class="crumb"><a href="${rel('')}">Color Coordinator</a> ${crumbHtml}</div>
  <h1>${esc(h1)}</h1>
</header>
<main>
${body}
${carbon}
</main>
<footer>
  <p><a href="${rel('')}">Color Coordinator</a> — free color wheel &amp; palette generator. Everything runs in your browser.</p>
</footer>
</body>
</html>`;
}

/* ---------- per-color page ---------- */
function colorPage(color, related) {
  const { name, hex } = color;
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(hexToRgb(hex));
  const desc = colorName(h, s, l);
  const art = /^[aeiou]/i.test(desc) ? 'an' : 'a';
  const cWhite = contrastRatio(hex, '#FFFFFF').toFixed(2);
  const cBlack = contrastRatio(hex, '#000000').toFixed(2);
  const scale = scaleHexes(h, s);
  const cssVars = ':root {\n  --' + slugify(name) + `: ${hex};\n`
    + scale.map(([stop, hx]) => `  --${slugify(name)}-${stop}: ${hx};`).join('\n') + '\n}';

  const harmonySections = Object.entries(HARMONIES).map(([key, { label }]) =>
    `<h3 style="font-size:15px;margin:16px 0 4px">${label}</h3>${chips(harmonyHexes(h, s, l, key))}`).join('');

  const body = `
<section>
  <div class="hero-sw" style="background:${hex};color:${textOn(hex)}">${hex}</div>
  <div class="facts">
    <span><b>HEX</b> ${hex}</span><span><b>RGB</b> ${r}, ${g}, ${b}</span>
    <span><b>HSL</b> ${h}°, ${s}%, ${l}%</span><span><b>Tone</b> ${esc(desc)}</span>
  </div>
  <p style="margin-top:12px">${esc(name)} is the hex color <b style="color:var(--ink)">${hex}</b> — ${art} ${esc(desc.toLowerCase())} tone.
  Below are ready-made ${esc(name)} color palettes built with color-theory harmony rules, a full Tailwind-style shade
  scale, WCAG contrast checks and copy-paste code. Open any of them in the interactive editor to fine-tune and export.</p>
  <a class="cta" href="${rel('')}#h=${h}&s=${s}&l=${l}&m=analogous">Open ${esc(name)} in the color editor →</a>
</section>

<section>
  <h2>${esc(name)} color palettes (harmony schemes)</h2>
  ${harmonySections}
</section>

<section>
  <h2>${esc(name)} shades &amp; tints (Tailwind scale)</h2>
  ${chips(scale.map(([, hx]) => hx))}
</section>

<section>
  <h2>Contrast &amp; accessibility</h2>
  <p>White text on ${esc(name)}: <b style="color:var(--ink)">${cWhite}:1</b>${cWhite >= 4.5 ? ' (passes WCAG AA)' : ' (fails WCAG AA)'} ·
  Black text on ${esc(name)}: <b style="color:var(--ink)">${cBlack}:1</b>${cBlack >= 4.5 ? ' (passes WCAG AA)' : ' (fails WCAG AA)'}.</p>
</section>

<section>
  <h2>Copy the ${esc(name)} palette (CSS)</h2>
  <pre>${esc(cssVars)}</pre>
</section>

<section>
  <h2>Related colors</h2>
  <div class="links">${related.map(c => `<a href="${rel('colors/' + slugify(c.name) + '/')}">${esc(c.name)}</a>`).join('')}
    <a href="${rel('colors/')}">All colors →</a></div>
</section>`;

  const schema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Color Coordinator', item: abs('') },
      { '@type': 'ListItem', position: 2, name: 'Colors', item: abs('colors/') },
      { '@type': 'ListItem', position: 3, name: `${name} (${hex})`, item: abs('colors/' + slugify(name) + '/') }
    ]
  };

  return shell({
    title: `${name} Color (${hex}) — Palette, Shades & Hex Codes | Color Coordinator`,
    description: `${name} is hex ${hex} (rgb ${r},${g},${b}). Get free ${name} color palettes — complementary, analogous & triadic schemes, Tailwind shades, and WCAG contrast checks.`,
    canonical: abs('colors/' + slugify(name) + '/'),
    h1: `${name} color — ${hex}`,
    body: body + `\n<script type="application/ld+json">${JSON.stringify(schema)}</script>`
  });
}

/* ---------- per-harmony explainer page ---------- */
const HARMONY_COPY = {
  analogous: 'Analogous palettes use colors next to each other on the wheel. They feel calm and cohesive — ideal for brand and content sites.',
  complementary: 'Complementary palettes pair opposite hues for maximum contrast — great for call-to-action buttons and accents.',
  split: 'Split-complementary softens a complementary pairing by using the two neighbors of the opposite hue, keeping contrast while feeling less harsh.',
  triadic: 'Triadic palettes use three evenly spaced hues for a vibrant, balanced scheme that suits playful, creative designs.',
  tetradic: 'Tetradic (double-complementary) palettes use four hues in two complementary pairs — rich and colorful, best with one dominant color.',
  monochrome: 'Monochrome palettes vary the lightness of a single hue for a minimal, professional, and highly cohesive look.'
};

function harmonyPage(key) {
  const { label } = HARMONIES[key];
  const { h, s, l } = CONFIG.defaultColor;
  const examples = [h, (h + 40) % 360, (h + 200) % 360].map(bh =>
    ({ bh, hexes: harmonyHexes(bh, s, l, key) }));
  const body = `
<section>
  <p>${HARMONY_COPY[key]}</p>
  <a class="cta" href="${rel('')}#h=${h}&s=${s}&l=${l}&m=${key}">Build a ${esc(label.toLowerCase())} palette →</a>
</section>
<section>
  <h2>${esc(label)} palette examples</h2>
  ${examples.map(e => chips(e.hexes)).join('')}
</section>
<section>
  <h2>Other harmony rules</h2>
  <div class="links">${Object.entries(HARMONIES).filter(([k]) => k !== key)
    .map(([k, v]) => `<a href="${rel('harmonies/' + k + '/')}">${esc(v.label)}</a>`).join('')}
    <a href="${rel('colors/')}">Browse colors →</a></div>
</section>`;
  return shell({
    title: `${label} Color Scheme — How to Use It + Examples | Color Coordinator`,
    description: `What a ${label.toLowerCase()} color scheme is, when to use it, and ready-made ${label.toLowerCase()} palette examples. Build your own free, no sign-up.`,
    canonical: abs('harmonies/' + key + '/'),
    h1: `${label} color scheme`,
    body
  });
}

/* ---------- colors hub ---------- */
function hubPage() {
  const grid = NAMED_COLORS.map(c =>
    `<a href="${rel('colors/' + slugify(c.name) + '/')}" class="chip" style="background:${c.hex};color:${textOn(c.hex)};text-decoration:none">${esc(c.name)}</a>`).join('');
  const body = `
<section>
  <p>Browse ${NAMED_COLORS.length} colors. Each page has ready-made palettes, harmony schemes, Tailwind shade scales,
  WCAG contrast checks and copy-paste CSS — plus a one-click link into the interactive editor.</p>
  <a class="cta" href="${rel('')}">Open the color wheel →</a>
</section>
<section>
  <h2>All colors</h2>
  <div class="row">${grid}</div>
</section>
<section>
  <h2>Color harmony guides</h2>
  <div class="links">${Object.entries(HARMONIES)
    .map(([k, v]) => `<a href="${rel('harmonies/' + k + '/')}">${esc(v.label)} scheme</a>`).join('')}</div>
</section>`;
  return shell({
    title: `Color Names & Palettes — Hex Codes, Shades & Schemes | Color Coordinator`,
    description: `Browse ${NAMED_COLORS.length} named colors with hex codes, ready-made palettes, Tailwind shades and WCAG contrast. Free color palette generator, no sign-up.`,
    canonical: abs('colors/'),
    h1: 'Color names, palettes & hex codes',
    body
  });
}

/* ---------- pricing page ---------- */
function pricingCell(v) {
  if (v === true) return '<td class="yes" aria-label="included">&#10003;</td>';
  if (v === false) return '<td class="no" aria-label="not included">&ndash;</td>';
  return `<td>${esc(v)}</td>`;
}

function pricingPage() {
  const heads = PLANS.map(p =>
    `<th class="${p.highlight ? 'hl' : ''}">
      <div class="pname">${esc(p.name)}</div>
      <div class="pprice">${esc(p.price)}</div>
      <div class="ptag">${esc(p.tagline)}</div>
      <a class="cta ${p.highlight ? '' : 'ghost'}" href="${p.cta.href}">${esc(p.cta.label)}</a>
    </th>`).join('');
  const rows = FEATURES.map(f =>
    `<tr><th scope="row">${esc(f.label)}</th>${pricingCell(f.free)}${pricingCell(f.pro)}${pricingCell(f.enterprise)}</tr>`).join('');
  const body = `
<style>
  .pricing-wrap{overflow-x:auto;margin-top:10px}
  table.pricing{border-collapse:collapse;width:100%;min-width:580px}
  table.pricing th,table.pricing td{padding:12px 14px;text-align:center;border-bottom:1px solid var(--border)}
  table.pricing thead th{vertical-align:top;border-bottom:2px solid var(--border)}
  table.pricing tbody th{text-align:left;font-weight:500;color:var(--ink)}
  .pname{font-weight:700;font-size:18px}
  .pprice{font-size:15px;color:var(--muted);margin:2px 0 6px}
  .ptag{font-size:12px;color:var(--muted);font-weight:400;max-width:190px;margin:0 auto 12px}
  th.hl{background:rgba(29,158,117,.08);border-radius:12px 12px 0 0}
  .cta.ghost{background:transparent;color:var(--live);border:1px solid var(--live)}
  td.yes{color:var(--live);font-weight:700}
  td.no{color:var(--muted)}
</style>
<section>
  <p>Start free. Upgrade when you need more. The tool runs entirely in your browser — no sign-up required to use it.</p>
  <div class="pricing-wrap">
    <table class="pricing">
      <thead><tr><td></td>${heads}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <p style="margin-top:18px;font-size:13px">Enterprise features (team libraries, white-label and the AI/LLM color API) are rolling out —
  <a href="${PLANS[2].cta.href}">contact sales</a> for early access and custom pricing.</p>
</section>`;
  return shell({
    title: 'Pricing — Free, Pro & Enterprise | Color Coordinator',
    description: 'Color Coordinator pricing: a free color wheel and palette generator, an affordable Pro plan (ad-free, unlimited saved palettes, richer extraction), and Enterprise with team libraries, white-label and an AI/LLM color API.',
    canonical: abs('pricing/'),
    h1: 'Simple pricing',
    crumb: '&rsaquo; Pricing',
    body
  });
}

/* ---------- 404 (served by Vercel for any unmatched path) ---------- */
function notFoundPage() {
  const body = `
<section>
  <div class="hero-sw" style="background:var(--live);color:#fff;font-size:34px">404</div>
  <p style="margin-top:16px">The page you're looking for doesn't exist or may have moved.
  Here's where to go instead:</p>
  <a class="cta" href="${rel('')}">Open the color wheel →</a>
  <div class="links" style="margin-top:14px">
    <a href="${rel('colors/')}">Browse all colors</a>
    <a href="${rel('harmonies/analogous/')}">Color harmony guides</a>
  </div>
</section>`;
  return shell({
    title: 'Page not found (404) — Color Coordinator',
    description: 'The page you are looking for could not be found.',
    canonical: abs(''),
    h1: 'Page not found',
    body,
    robots: 'noindex, follow'
  });
}

/* ---------- write everything ---------- */
function write(pathNoSlash, html) {
  const dir = join(DIST, pathNoSlash);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

// Sitemap entries carry a tiered priority: home > hub > harmony guides > color pages.
const entries = [{ loc: abs(''), priority: '1.0' }];
writeFileSync(join(DIST, '404.html'), notFoundPage());
write('pricing', pricingPage());
entries.push({ loc: abs('pricing/'), priority: '0.8' });
write('colors', hubPage());
entries.push({ loc: abs('colors/'), priority: '0.8' });

NAMED_COLORS.forEach((c, i) => {
  const related = [-4, -3, -2, -1, 1, 2, 3, 4]
    .map(d => NAMED_COLORS[(i + d + NAMED_COLORS.length) % NAMED_COLORS.length]);
  write('colors/' + slugify(c.name), colorPage(c, related));
  entries.push({ loc: abs('colors/' + slugify(c.name) + '/'), priority: '0.6' });
});

Object.keys(HARMONIES).forEach(key => {
  write('harmonies/' + key, harmonyPage(key));
  entries.push({ loc: abs('harmonies/' + key + '/'), priority: '0.7' });
});

/* sole owner of the deployed sitemap (public/sitemap.xml intentionally does not exist) */
const today = new Date().toISOString().slice(0, 10);
const xmlEscape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const urlTag = ({ loc, priority }) =>
  `  <url><loc>${xmlEscape(loc)}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>${priority}</priority></url>`;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlTag).join('\n')}
</urlset>
`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);

console.log(`SEO: generated ${NAMED_COLORS.length} color pages + ${Object.keys(HARMONIES).length} harmony pages + hub + pricing + 404, and ${entries.length} sitemap URLs.`);
