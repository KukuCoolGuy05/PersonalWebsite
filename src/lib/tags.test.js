import { describe, expect, it } from 'vitest';
import { TAG_COLORS, findTag, mergeTags, normalizeTagName, suggestHue, validateTagName } from './tags';

const saved = [
  { name: 'Array', hue: 212, description: 'Index-based' },
  { name: 'Heap', hue: 336, description: '' },
];

describe('normalizeTagName / findTag', () => {
  it('collapses and trims whitespace', () => {
    expect(normalizeTagName('  Two    Pointers ')).toBe('Two Pointers');
  });

  it('finds tags case-insensitively', () => {
    expect(findTag(saved, 'heap')?.name).toBe('Heap');
    expect(findTag(saved, 'Trie')).toBeUndefined();
  });
});

describe('validateTagName', () => {
  it('accepts a normal name', () => {
    expect(validateTagName('Two Pointers', saved)).toBe('');
  });

  it('rejects empty, long, comma and duplicate names', () => {
    expect(validateTagName('')).toMatch(/name/);
    expect(validateTagName('x'.repeat(41))).toMatch(/40/);
    expect(validateTagName('Stacks, Queues')).toMatch(/commas/);
    expect(validateTagName('array', saved)).toMatch(/exists/);
  });
});

describe('suggestHue', () => {
  it('picks a swatch far from the colors already in use', () => {
    expect(suggestHue([{ hue: 0 }, { hue: 24 }])).toBe(192);
  });

  it('falls back to the first swatch when there are no tags', () => {
    expect(suggestHue([])).toBe(TAG_COLORS[0].hue);
  });
});

describe('mergeTags', () => {
  const problems = [
    { tags: ['Array', 'Two Pointers'] },
    { tags: ['array', 'Heap'] },
    { tags: [] },
  ];

  it('keeps saved order, appends unsaved tags, and counts case-insensitively', () => {
    const merged = mergeTags(saved, problems);
    expect(merged.map((t) => [t.name, t.count, t.stored])).toEqual([
      ['Array', 2, true],
      ['Heap', 1, true],
      ['Two Pointers', 1, false],
    ]);
    expect(merged[0].description).toBe('Index-based');
    expect(typeof merged[2].hue).toBe('number');
  });

  it('ignores duplicate saved tags', () => {
    expect(mergeTags([...saved, { name: 'ARRAY', hue: 1 }], [])).toHaveLength(2);
  });
});
