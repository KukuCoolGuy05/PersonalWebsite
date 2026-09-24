import { DIFFICULTIES } from '../data/dsaTags';
import { today } from './text';

export function emptySolution(language = 'java') {
  return { label: '', language, time: '', space: '', code: '' };
}

export function emptyProblem() {
  return {
    title: '',
    number: '',
    source: 'LeetCode',
    url: '',
    difficulty: 'Medium',
    tags: [],
    solvedOn: today(),
    question: '',
    insight: '',
    approach: '',
    solutions: [emptySolution()],
  };
}

// Returns { fieldName: message } — empty object means valid.
export function validateProblem(input) {
  const errors = {};
  if (!input.title?.trim()) errors.title = 'Give the problem a title.';
  if (!input.question?.trim()) errors.question = 'Add the question so future-you remembers it.';
  if (input.url?.trim() && !/^https?:\/\/\S+$/i.test(input.url.trim())) errors.url = 'Links need to start with http:// or https://';
  if (String(input.number ?? '').trim() && !/^\d+$/.test(String(input.number).trim())) errors.number = 'Numbers only.';
  if (!DIFFICULTIES.includes(input.difficulty)) errors.difficulty = 'Pick a difficulty.';
  if (input.solvedOn && !/^\d{4}-\d{2}-\d{2}$/.test(input.solvedOn)) errors.solvedOn = 'Use a valid date.';
  return errors;
}

// Trim everything and drop empty bits before saving.
export function normalizeProblem(input) {
  const tags = [];
  for (const tag of input.tags ?? []) {
    const clean = tag.trim();
    if (clean && !tags.some((t) => t.toLowerCase() === clean.toLowerCase())) tags.push(clean);
  }
  const numberText = String(input.number ?? '').trim();
  return {
    title: input.title.trim(),
    number: numberText ? Number(numberText) : null,
    source: input.source?.trim() || null,
    url: input.url?.trim() || null,
    difficulty: input.difficulty,
    tags,
    solvedOn: input.solvedOn || today(),
    question: input.question.trim(),
    insight: input.insight?.trim() || '',
    approach: input.approach?.trim() || '',
    solutions: (input.solutions ?? [])
      .filter((s) => s.code?.trim())
      .map((s) => ({
        label: s.label?.trim() || '',
        language: s.language || 'java',
        time: s.time?.trim() || '',
        space: s.space?.trim() || '',
        code: s.code.replace(/\s+$/, ''),
      })),
  };
}

// Problem (app shape) → form state (strings everywhere, at least one solution slot).
export function toFormState(problem) {
  return {
    ...emptyProblem(),
    ...problem,
    number: problem.number ?? '',
    source: problem.source ?? '',
    url: problem.url ?? '',
    insight: problem.insight ?? '',
    approach: problem.approach ?? '',
    solutions: problem.solutions?.length ? problem.solutions.map((s) => ({ ...emptySolution(), ...s })) : [emptySolution()],
  };
}
