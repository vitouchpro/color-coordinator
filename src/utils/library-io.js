// Pure serialize / parse / merge for the saved-palette library.
// Framework-free and unit-tested — the app layer handles files and storage.
const APP = 'color-coordinator';
const VERSION = 1;

/** Wrap the library in a versioned export envelope. */
export function toExport(items, exportedAt) {
  return { app: APP, version: VERSION, exportedAt, palettes: items };
}

const isHex = s => typeof s === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(s);

const validPalette = p =>
  !!p && typeof p.name === 'string' &&
  Array.isArray(p.colors) && p.colors.length > 0 && p.colors.every(isHex) &&
  typeof p.mode === 'string';

/**
 * Parse an exported file (either a bare array or the `{ palettes: [...] }` envelope),
 * keeping only well-formed palettes. Throws with a friendly message on bad input.
 */
export function parseLibrary(text, now = Date.now()) {
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('That is not a valid JSON file'); }

  const list = Array.isArray(data) ? data : data && data.palettes;
  if (!Array.isArray(list)) throw new Error('No palettes found in that file');

  const palettes = list.filter(validPalette).map(p => ({
    name: p.name,
    colors: p.colors,
    mode: p.mode,
    ts: typeof p.ts === 'number' ? p.ts : now
  }));
  if (!palettes.length) throw new Error('No valid palettes found in that file');
  return palettes;
}

const keyOf = p => (p.ts != null ? `ts:${p.ts}` : `c:${p.name}|${p.colors.join(',')}`);

/** Merge incoming palettes into existing, skipping duplicates. New ones come first. */
export function mergeLibrary(existing, incoming) {
  const seen = new Set(existing.map(keyOf));
  const added = incoming.filter(p => !seen.has(keyOf(p)));
  return [...added, ...existing];
}
