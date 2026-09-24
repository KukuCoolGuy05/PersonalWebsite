import { describe, expect, it } from 'vitest';
import { emptyProblem, normalizeProblem, toFormState, validateProblem } from './problemModel';

const valid = () => ({ ...emptyProblem(), title: 'Two Sum', question: 'Find two numbers.' });

describe('validateProblem', () => {
  it('accepts a minimal problem', () => {
    expect(validateProblem(valid())).toEqual({});
  });

  it('requires a title and a question', () => {
    const errors = validateProblem({ ...valid(), title: '  ', question: '' });
    expect(Object.keys(errors).sort()).toEqual(['question', 'title']);
  });

  it('rejects non-http links, non-numeric numbers and unknown difficulties', () => {
    const errors = validateProblem({ ...valid(), url: 'javascript:alert(1)', number: '12a', difficulty: 'Insane' });
    expect(Object.keys(errors).sort()).toEqual(['difficulty', 'number', 'url']);
  });
});

describe('normalizeProblem', () => {
  it('trims fields, converts the number and drops empty solutions', () => {
    const result = normalizeProblem({
      ...valid(),
      title: '  Two Sum ',
      number: ' 1 ',
      url: '  ',
      source: '',
      tags: [' Array', 'array', 'Hash Table', ''],
      solutions: [
        { label: ' Fast ', language: 'python', time: 'O(n) ', space: '', code: 'print(1)\n\n' },
        { label: 'Empty', language: 'java', time: '', space: '', code: '   ' },
      ],
    });
    expect(result.title).toBe('Two Sum');
    expect(result.number).toBe(1);
    expect(result.url).toBeNull();
    expect(result.source).toBeNull();
    expect(result.tags).toEqual(['Array', 'Hash Table']);
    expect(result.solutions).toEqual([{ label: 'Fast', language: 'python', time: 'O(n)', space: '', code: 'print(1)' }]);
  });

  it('keeps an empty number as null and defaults the date', () => {
    const result = normalizeProblem({ ...valid(), number: '', solvedOn: '' });
    expect(result.number).toBeNull();
    expect(result.solvedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('toFormState', () => {
  it('turns nulls into strings and always leaves one solution slot', () => {
    const form = toFormState({ title: 'X', number: null, url: null, source: null, solutions: [] });
    expect(form.number).toBe('');
    expect(form.url).toBe('');
    expect(form.solutions).toHaveLength(1);
  });
});
