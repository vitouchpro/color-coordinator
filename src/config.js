// Single source of truth for app configuration — no hardcoded values downstream.
export const CONFIG = {
  wheelSize: 280,
  defaultColor: { h: 160, s: 69, l: 37 },
  lightnessRange: { min: 15, max: 85 },
  scaleStops: { 50: 97, 100: 93, 200: 85, 300: 74, 400: 62, 500: 50, 600: 42, 700: 34, 800: 26, 900: 18 },
  storageKeys: { theme: 'cc-theme', library: 'cc-library', pro: 'cc-pro' },
  maxLibrary: 30,
  extractColors: 6,
  toastMs: 1600,
  githubUrl: 'https://github.com/vitouchpro',

  // Deployment origin + base path — used by the SEO page generator for canonical URLs.
  site: { origin: 'https://vitouchpro.github.io', base: '/color-coordinator/' },

  // Display ads. Leave carbonServe empty to disable ads entirely (default: no external
  // ad calls, privacy brand preserved). Fill both from your Carbon/BuySellAds account to enable.
  ads: { carbonServe: '', carbonPlacement: '' },

  // Pro unlock via Gumroad license keys. Leave permalink empty to hide the upgrade UI.
  // gumroadPermalink is the product's Gumroad permalink; gumroadUrl is the full buy link.
  pro: { gumroadPermalink: '', gumroadUrl: '', price: '$14 one-time', maxLibrary: 1000, extractColors: 12 }
};

export const HARMONIES = {
  analogous:     { label: 'Analogous',     hues: h => [(h + 330) % 360, h, (h + 30) % 360] },
  complementary: { label: 'Complementary', hues: h => [h, (h + 180) % 360] },
  split:         { label: 'Split comp.',   hues: h => [h, (h + 150) % 360, (h + 210) % 360] },
  triadic:       { label: 'Triadic',       hues: h => [h, (h + 120) % 360, (h + 240) % 360] },
  tetradic:      { label: 'Tetradic',      hues: h => [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360] },
  monochrome:    { label: 'Monochrome',    hues: h => [h, h, h, h, h] }
};

export const ROLE_NAMES = ['primary', 'secondary', 'accent', 'support', 'extra'];
