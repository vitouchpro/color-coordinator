import { CONFIG } from './config.js';

// Single source of truth for the /pricing comparison. Data-driven so the page and
// any future in-app plan UI stay in sync.
const enterpriseMailto =
  `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent('Color Coordinator Enterprise')}`;

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    tagline: 'Everything you need to design a palette.',
    cta: { label: 'Open the app', href: CONFIG.site.base }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: CONFIG.pro.price,
    tagline: 'For designers and developers who use it daily.',
    highlight: true,
    cta: { label: 'Get Pro', href: CONFIG.pro.gumroadUrl || CONFIG.site.base }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    tagline: 'Teams, white-label, and an API for AI tools.',
    cta: { label: 'Contact sales', href: enterpriseMailto }
  }
];

// Comparison rows. Each value is true (included), false (not included) or a string.
export const FEATURES = [
  { label: 'Color wheel, harmonies & export', free: true, pro: true, enterprise: true },
  { label: 'WCAG contrast & colorblind preview', free: true, pro: true, enterprise: true },
  { label: 'Saved palettes', free: '30', pro: 'Unlimited', enterprise: 'Unlimited' },
  { label: 'Image color extraction', free: '6 colors', pro: '12 colors', enterprise: '12 colors' },
  { label: 'Ad-free', free: false, pro: true, enterprise: true },
  { label: 'Remove branding (white-label)', free: false, pro: false, enterprise: true },
  { label: 'Team libraries & seats', free: false, pro: false, enterprise: true },
  { label: 'AI/LLM color API + API keys', free: false, pro: false, enterprise: true },
  { label: 'Priority support', free: false, pro: false, enterprise: true }
];
