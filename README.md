# Color Coordinator (React)

Free color wheel and palette generator — React 19 + Vite, deployed on Vercel.

**Live:** https://color-coordinator.vercel.app/

## Stack

- React 19, Vite 6, self-hosted fonts (@fontsource); no other runtime dependencies
- SEO lives in the static `index.html` shell — meta, Open Graph, and JSON-LD
  (WebApplication + FAQPage + HowTo) plus a full `<noscript>` fallback, so crawlers
  get the content without executing JavaScript
- Configuration centralized in `src/config.js`; design tokens in CSS custom properties
  in `src/index.css` — no hardcoded values downstream

## Project structure

```
index.html                 Static SEO shell (meta, JSON-LD, noscript fallback)
vercel.json                Build command, output dir, and security headers (CSP etc.)
public/                    robots.txt, llms.txt, og-image, PWA icons, manifest
                           (sitemap.xml is generated into dist/ by scripts/gen-seo.mjs)
scripts/
  seo-colors.mjs           Curated named-color dataset for the SEO pages
  gen-seo.mjs              Build-time generator: color/harmony/hub/404 static pages
src/
  config.js                App config, harmonies, site/ads/pro settings
  index.css                Design tokens and styles (light/dark via data-theme)
  utils/color.js           Pure color math (HSL/hex, WCAG luminance & contrast)
  utils/cvd.js             Colorblind-simulation matrices
  utils/exporters.js       CSS / Tailwind / SCSS / JSON code generators
  utils/media.js           Image color extraction + PNG palette download
  hooks/                   useToast, useTheme, useLibrary, useHistory, usePro
  components/              Wheel (canvas), palette, scale, contrast, export,
                           SaveDialog, ProDialog, AdSlot, etc.
```

## Local development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build + SEO pages in dist/
```

## Deploy (Vercel)

Connected to Vercel's GitHub integration — every push to `main` auto-builds and deploys.
`vercel.json` pins the build command (so the SEO generator runs) and the security headers.

If you add a custom domain, update `CONFIG.site.origin` in `src/config.js`, the canonical/OG
URLs in `index.html`, and the URLs in `public/robots.txt` + `public/llms.txt`, then rebuild.
Vite `base` stays `/` for root deployment (it would need `/color-coordinator/` only for a
GitHub Pages project site).

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
and richer image extraction (`CONFIG.pro.extractColors`).

Supports both models via `CONFIG.pro.recurring`:
- `false` — one-time purchase (valid until refunded).
- `true` — Gumroad subscription/membership. The license is re-verified every
  `CONFIG.pro.recheckDays` and Pro is revoked once the subscription lapses (the
  `isActive()` predicate in `src/utils/license.js` keeps access through a pending
  cancellation until the paid period ends).

Verification is client-side — fine for a low-price utility, but note it can be bypassed by a
determined user; move it behind a Vercel Function if you need hard enforcement.

## License

MIT
