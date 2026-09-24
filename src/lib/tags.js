import { tagHue } from '../data/dsaTags';

// Swatches offered when creating a tag (hue in degrees).
export const TAG_COLORS = [
  { name: 'Red', hue: 0 },
  { name: 'Orange', hue: 24 },
  { name: 'Amber', hue: 45 },
  { name: 'Lime', hue: 88 },
  { name: 'Green', hue: 135 },
  { name: 'Teal', hue: 170 },
  { name: 'Cyan', hue: 192 },
  { name: 'Blue', hue: 214 },
  { name: 'Indigo', hue: 245 },
  { name: 'Violet', hue: 275 },
  { name: 'Magenta', hue: 302 },
  { name: 'Pink', hue: 332 },
];

// Matches the check constraint on public.tags in supabase/schema.sql.
export const MAX_TAG_LENGTH = 40;

export function normalizeTagName(raw = '') {
  return raw.replace(/\s+/g, ' ').trim();
}

export function findTag(tags, name) {
  const lower = name.toLowerCase();
  return tags.find((tag) => tag.name.toLowerCase() === lower);
}

// '' when the name is usable. Pass `existing` to also reject duplicates.
export function validateTagName(name, existing = []) {
  if (!name) return 'Give the tag a name.';
  if (name.length > MAX_TAG_LENGTH) return `Keep it under ${MAX_TAG_LENGTH} characters.`;
  if (name.includes(',')) return 'Tag names can’t contain commas.';
  if (findTag(existing, name)) return 'That tag already exists.';
  return '';
}

const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return Math.min(d, 360 - d);
};

// The swatch farthest from every existing tag's color, so new tags stand apart.
export function suggestHue(existing = []) {
  let best = TAG_COLORS[0].hue;
  let bestGap = -1;
  for (const { hue } of TAG_COLORS) {
    const gap = existing.length ? Math.min(...existing.map((tag) => hueGap(tag.hue, hue))) : 180;
    if (gap > bestGap) {
      bestGap = gap;
      best = hue;
    }
  }
  return best;
}

// Saved tags first (in their saved order), then any tag a problem uses that isn't
// saved. Every entry gets a case-insensitive usage count.
export function mergeTags(saved = [], problems = []) {
  const counts = new Map();
  const used = new Map();
  for (const problem of problems) {
    for (const name of problem.tags ?? []) {
      const key = name.toLowerCase();
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!used.has(key)) used.set(key, name);
    }
  }

  const merged = [];
  const seen = new Set();
  for (const tag of saved) {
    const key = tag.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...tag, description: tag.description ?? '', count: counts.get(key) ?? 0, stored: true });
  }
  for (const [key, name] of used) {
    if (!seen.has(key)) merged.push({ name, hue: tagHue(name), description: '', count: counts.get(key), stored: false });
  }
  return merged;
}
