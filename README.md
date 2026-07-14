# Color Coordinator (React)

Free color wheel and palette generator — React 19 + Vite migration with full feature and SEO parity with the vanilla version.

**Live:** `https://YOUR-USERNAME.github.io/color-coordinator/`

## Stack

- React 19, Vite 6, zero runtime dependencies beyond React
- All SEO (meta, Open Graph, JSON-LD WebApplication + FAQPage schema) lives in the static `index.html` shell, so crawlers get it without executing JavaScript
- Configuration centralized in `src/config.js`; design tokens in CSS custom properties in `src/index.css` — no hardcoded values downstream

## Project structure

```
index.html                 Static SEO shell (meta, JSON-LD, noscript fallback)
public/                    robots.txt, sitemap.xml, llms.txt (copied to build as-is)
src/
  config.js                All app configuration and harmony definitions
  index.css                Design tokens and styles (light/dark via data-theme)
  utils/color.js           Pure color math (HSL/hex, WCAG luminance & contrast)
  utils/exporters.js       CSS / Tailwind / SCSS / JSON code generators
  utils/media.js           Image color extraction + PNG palette download
  hooks/                   useToast, useTheme, useLibrary (localStorage)
  components/              Wheel (canvas), palette, scale, contrast, export, etc.
.github/workflows/deploy.yml   Auto-deploy to GitHub Pages on push
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy to GitHub Pages (automatic)

1. Create a public repo named `color-coordinator` and push this project
2. Repo Settings → Pages → Source: **GitHub Actions**
3. Push to `main` — the included workflow builds and deploys automatically

If your repo name differs, change `base` in `vite.config.js` to match, and update the canonical/OG URLs in `index.html` plus `public/robots.txt` and `public/sitemap.xml`.

## Programmatic SEO pages

`npm run build` runs `scripts/gen-seo.mjs` after the Vite build, which reads the app's
pure color utilities and emits static, self-contained pages into `dist/`:

- `dist/colors/` — a hub linking every named color
- `dist/colors/<name>/` — one page per named color (palette, harmony schemes, Tailwind
  scale, WCAG contrast, copy-paste CSS, related links, and a CTA into the editor)
- `dist/harmonies/<rule>/` — one explainer page per harmony rule
- `dist/sitemap.xml` — regenerated to include every page

Curate the color list in `scripts/seo-colors.mjs`. Pages are intentionally lightweight
(system fonts, inline CSS, no app bundle) for fast Core Web Vitals.

## Monetization (optional, off by default)

Both integrations are config-driven in `src/config.js` and **do nothing until you fill
them in** — no external calls are made in the default build, preserving the privacy brand.

**Display ads (Carbon / BuySellAds):** apply at carbonads.net, then set
`CONFIG.ads.carbonServe` and `CONFIG.ads.carbonPlacement`. The `AdSlot` then renders one
tasteful ad below the fold, and static SEO pages embed the tag too. Ads are automatically
hidden for Pro users. (Ad scripts can't use Subresource Integrity — their payload varies
per request — so the tag is loaded without `integrity`; it only loads once you opt in.)

**Pro unlock (Gumroad):** create a Gumroad product, then set `CONFIG.pro.gumroadPermalink`
(the product permalink) and `CONFIG.pro.gumroadUrl` (the buy link). An **Upgrade** button
appears; buyers paste their license key, which is verified against Gumroad's API and stored
in `localStorage`. Pro perks: ad-free, unlimited saved palettes (`CONFIG.pro.maxLibrary`),
and richer image extraction (`CONFIG.pro.extractColors`). Verification is client-side — fine
for a low-price utility, but note it can be bypassed by a determined user.

## License

MIT
