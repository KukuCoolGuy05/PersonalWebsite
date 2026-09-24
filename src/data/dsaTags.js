// Tags for the coding-problems log — the core data structures for now.
// `hue` colors the tag's dot. Add new tags here and they appear in the
// filters and in the "add problem" form automatically.
export const DSA_TAGS = [
  { name: 'Array', hue: 212, description: 'Contiguous, index-based storage' },
  { name: 'String', hue: 168, description: 'Sequences of characters' },
  { name: 'Hash Table', hue: 42, description: 'Hash maps & sets — O(1) average lookup' },
  { name: 'Linked List', hue: 282, description: 'Nodes chained by pointers' },
  { name: 'Stack', hue: 22, description: 'Last in, first out' },
  { name: 'Queue', hue: 190, description: 'First in, first out (incl. deques)' },
  { name: 'Heap', hue: 336, description: 'Priority queues — fast min / max' },
  { name: 'Tree', hue: 130, description: 'Hierarchical nodes, binary trees' },
  { name: 'Binary Search Tree', hue: 90, description: 'Ordered binary trees' },
  { name: 'Graph', hue: 250, description: 'Vertices & edges — BFS, DFS, paths' },
  { name: 'Trie', hue: 305, description: 'Prefix trees for strings' },
  { name: 'Matrix', hue: 0, description: '2-D grids' },
];

const HUE_BY_TAG = new Map(DSA_TAGS.map((t) => [t.name.toLowerCase(), t.hue]));

// Custom tags (not in the list above) get a stable hue derived from their name.
export function tagHue(name) {
  const known = HUE_BY_TAG.get(name.toLowerCase());
  if (known !== undefined) return known;
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return hash % 360;
}

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const SOURCES = ['LeetCode', 'NeetCode', 'HackerRank', 'Codeforces', 'AlgoExpert', 'Coursework', 'Interview', 'Other'];

// Languages available for syntax highlighting (value = highlight.js id).
export const LANGUAGES = [
  { value: 'java', label: 'Java' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'go', label: 'Go' },
  { value: 'sql', label: 'SQL' },
];
