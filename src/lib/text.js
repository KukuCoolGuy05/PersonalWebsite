// Tiny inline markup used in data files: *emphasis* and `code`.
export function parseInline(str = '') {
  const out = [];
  const re = /(\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match;
  while ((match = re.exec(str))) {
    if (match.index > last) out.push({ type: 'text', value: str.slice(last, match.index) });
    const token = match[0];
    out.push({ type: token[0] === '*' ? 'em' : 'code', value: token.slice(1, -1) });
    last = match.index + token.length;
  }
  if (last < str.length) out.push({ type: 'text', value: str.slice(last) });
  return out;
}

export function stripInline(str = '') {
  return str.replace(/[*`]/g, '');
}

// Words for per-word animations. Pieces that touch ("*Science*" + ".") stay in one
// word, so punctuation never gets a space in front of it.
export function groupWords(str = '') {
  const words = [];
  let word = [];
  for (const seg of parseInline(str)) {
    for (const part of seg.value.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        if (word.length) words.push(word);
        word = [];
      } else {
        word.push({ text: part, em: seg.type === 'em' });
      }
    }
  }
  if (word.length) words.push(word);
  return words;
}

const SMALL_WORDS = new Set(['a', 'an', 'and', 'of', 'in', 'on', 'the', 'to', 'for', 'or', 'with', 'by']);

// "two-sum-ii-input-array-is-sorted" → "Two Sum II Input Array Is Sorted"
export function titleFromSlug(slug = '') {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word, i) => {
      if (/^(i|ii|iii|iv|v|vi)$/i.test(word)) return word.toUpperCase();
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(' ');
}

const SOURCE_BY_HOST = [
  [/leetcode\.(com|cn)$/, 'LeetCode'],
  [/neetcode\.io$/, 'NeetCode'],
  [/hackerrank\.com$/, 'HackerRank'],
  [/codeforces\.com$/, 'Codeforces'],
  [/algoexpert\.io$/, 'AlgoExpert'],
];

// Best-effort title + source from a problem URL, used to pre-fill the add form.
export function guessFromUrl(raw = '') {
  let url;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  const source = SOURCE_BY_HOST.find(([re]) => re.test(host))?.[1] ?? null;
  const parts = url.pathname.split('/').filter(Boolean);
  const idx = parts.findIndex((p) => p === 'problems' || p === 'challenges' || p === 'problem');
  const slug = idx >= 0 ? parts[idx + 1] : null;
  const title = slug && !/^\d+$/.test(slug) ? titleFromSlug(slug) : null;
  if (!source && !title) return null;
  return { source, title };
}

// 'YYYY-MM-DD' → local Date (avoids the UTC shift of `new Date('YYYY-MM-DD')`).
function parseDay(value) {
  const [y, m, d] = String(value).split('-').map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, d || 1);
}

export function formatDate(value) {
  const date = value && parseDay(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMonth(value) {
  const date = value && parseDay(value);
  if (!date) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// 12 → "1 yr", 15 → "1 yr 3 mos", 4 → "4 mos" (LinkedIn style).
export function formatDuration(months) {
  if (!(months > 0)) return '';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? 's' : ''}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? 's' : ''}`);
  return parts.join(' ');
}

const monthNumber = (value) => {
  const [y, m] = value.split('-').map(Number);
  return y * 12 + (m - 1);
};

// ('2024-06', '2025-08') → "Jun 2024 – Aug 2025 · 1 yr 3 mos"; end 'Present' counts to this month.
export function formatRange(start, end) {
  if (!start) return '';
  if (!end) return formatMonth(start);
  const ongoing = end === 'Present';
  const last = ongoing ? today().slice(0, 7) : end;
  const duration = formatDuration(monthNumber(last) - monthNumber(start) + 1);
  const range = `${formatMonth(start)} – ${ongoing ? 'Present' : formatMonth(end)}`;
  return duration ? `${range} · ${duration}` : range;
}

export function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
