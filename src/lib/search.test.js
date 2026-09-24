import { describe, expect, it } from 'vitest';
import { countByDifficulty, filterProblems, scoreProblem, tokenize } from './search';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';

const titles = (list) => list.map((p) => p.title);

describe('tokenize', () => {
  it('lowercases, splits on whitespace and drops a leading #', () => {
    expect(tokenize('  Hash   MAP #1 ')).toEqual(['hash', 'map', '1']);
  });

  it('returns no terms for an empty query', () => {
    expect(tokenize('')).toEqual([]);
  });
});

describe('filterProblems', () => {
  it('returns everything, newest first, when nothing is set', () => {
    const result = filterProblems(SAMPLE_PROBLEMS);
    expect(result).toHaveLength(SAMPLE_PROBLEMS.length);
    expect(result[0].title).toBe('Two Sum');
    const dates = result.map((p) => p.solvedOn);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('requires every search term to match somewhere', () => {
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { query: 'hash map' }))).toEqual(['Two Sum']);
    expect(filterProblems(SAMPLE_PROBLEMS, { query: 'hash zebra' })).toHaveLength(0);
  });

  it('searches inside solution code', () => {
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { query: 'PriorityQueue' }))).toEqual(
      expect.arrayContaining(['Kth Largest Element in an Array', 'Merge k Sorted Lists'])
    );
  });

  it('finds problems by number, with or without #', () => {
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { query: '#206' }))).toEqual(['Reverse Linked List']);
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { query: '206' }))).toEqual(['Reverse Linked List']);
  });

  it('ranks title matches above body matches', () => {
    const result = filterProblems(SAMPLE_PROBLEMS, { query: 'stack' });
    expect(result[0].tags).toContain('Stack');
  });

  it('keeps only problems that have every selected tag (case-insensitive)', () => {
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { tags: ['heap'] }))).toEqual([
      'Kth Largest Element in an Array',
      'Merge k Sorted Lists',
    ]);
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { tags: ['Heap', 'Linked List'] }))).toEqual(['Merge k Sorted Lists']);
  });

  it('filters by difficulty', () => {
    expect(titles(filterProblems(SAMPLE_PROBLEMS, { difficulty: 'Hard' }))).toEqual(['Merge k Sorted Lists']);
  });

  it('sorts by difficulty, oldest or title', () => {
    const byDifficulty = filterProblems(SAMPLE_PROBLEMS, { sort: 'difficulty' });
    expect(byDifficulty[0].difficulty).toBe('Easy');
    expect(byDifficulty.at(-1).difficulty).toBe('Hard');
    expect(filterProblems(SAMPLE_PROBLEMS, { sort: 'oldest' })[0].title).toBe('Merge k Sorted Lists');
    const byTitle = titles(filterProblems(SAMPLE_PROBLEMS, { sort: 'title' }));
    expect(byTitle).toEqual([...byTitle].sort((a, b) => a.localeCompare(b)));
  });

  it('copes with problems missing optional fields', () => {
    const bare = { id: 'x', title: 'Bare', difficulty: 'Easy', tags: [], solutions: [] };
    expect(filterProblems([bare], { query: 'bare' })).toEqual([bare]);
    expect(scoreProblem(bare, ['nothing'])).toBe(0);
  });
});

describe('counts', () => {
  it('counts problems per difficulty', () => {
    expect(countByDifficulty(SAMPLE_PROBLEMS)).toEqual({ Easy: 3, Medium: 5, Hard: 1 });
  });
});
