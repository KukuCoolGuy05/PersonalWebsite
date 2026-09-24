import { describe, expect, it, vi } from 'vitest';
import {
  formatDate,
  formatDuration,
  formatMonth,
  formatRange,
  groupWords,
  guessFromUrl,
  parseInline,
  stripInline,
  titleFromSlug,
} from './text';

describe('parseInline', () => {
  it('splits *emphasis* and `code` from plain text', () => {
    expect(parseInline('Built *fast* with `C`.')).toEqual([
      { type: 'text', value: 'Built ' },
      { type: 'em', value: 'fast' },
      { type: 'text', value: ' with ' },
      { type: 'code', value: 'C' },
      { type: 'text', value: '.' },
    ]);
    expect(stripInline('Built *fast* with `C`.')).toBe('Built fast with C.');
  });
});

describe('groupWords', () => {
  it('keeps punctuation attached to an emphasized word', () => {
    expect(groupWords('a *Data Science*. Next')).toEqual([
      [{ text: 'a', em: false }],
      [{ text: 'Data', em: true }],
      [
        { text: 'Science', em: true },
        { text: '.', em: false },
      ],
      [{ text: 'Next', em: false }],
    ]);
  });
});

describe('guessFromUrl', () => {
  it('reads the title and source from a LeetCode link', () => {
    expect(guessFromUrl('https://leetcode.com/problems/two-sum/description/')).toEqual({
      source: 'LeetCode',
      title: 'Two Sum',
    });
  });

  it('handles roman numerals and small words', () => {
    expect(titleFromSlug('two-sum-ii-input-array-is-sorted')).toBe('Two Sum II Input Array Is Sorted');
    expect(titleFromSlug('lowest-common-ancestor-of-a-binary-tree')).toBe('Lowest Common Ancestor of a Binary Tree');
  });

  it('ignores links it cannot understand', () => {
    expect(guessFromUrl('not a url')).toBeNull();
    expect(guessFromUrl('https://example.com/about')).toBeNull();
  });
});

describe('dates', () => {
  it('formats YYYY-MM-DD without shifting the day across time zones', () => {
    expect(formatDate('2026-09-02')).toBe('Sep 2, 2026');
    expect(formatMonth('2023-03')).toBe('Mar 2023');
    expect(formatDate('')).toBe('');
  });

  it('formats durations like LinkedIn', () => {
    expect(formatDuration(1)).toBe('1 mo');
    expect(formatDuration(4)).toBe('4 mos');
    expect(formatDuration(12)).toBe('1 yr');
    expect(formatDuration(27)).toBe('2 yrs 3 mos');
    expect(formatDuration(0)).toBe('');
  });

  it('formats date ranges, counting both end months', () => {
    expect(formatRange('2024-06', '2025-08')).toBe('Jun 2024 – Aug 2025 · 1 yr 3 mos');
    expect(formatRange('2025-01', '2025-01')).toBe('Jan 2025 – Jan 2025 · 1 mo');
    expect(formatRange('2025-01', '')).toBe('Jan 2025');
    expect(formatRange('', '')).toBe('');
  });

  it('counts an ongoing role up to the current month', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 24));
    expect(formatRange('2026-01', 'Present')).toBe('Jan 2026 – Present · 9 mos');
    vi.useRealTimers();
  });
});
