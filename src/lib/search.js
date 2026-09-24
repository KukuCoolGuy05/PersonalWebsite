// Client-side search for the coding-problems log.
// Every search term has to match somewhere; where it matches decides the rank.

const DIFFICULTY_ORDER = { Easy: 0, Medium: 1, Hard: 2 };

// How much a match in each field counts toward relevance.
const FIELD_WEIGHTS = { title: 10, tags: 6, meta: 3, insight: 3, body: 1 };

export function tokenize(query = '') {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/^#/, ''))
    .filter(Boolean);
}

function searchableFields(problem) {
  const solutions = (problem.solutions ?? [])
    .map((s) => `${s.label ?? ''} ${s.language ?? ''} ${s.time ?? ''} ${s.space ?? ''} ${s.code ?? ''}`)
    .join(' ');
  return {
    title: `${problem.title} ${problem.number ?? ''}`.toLowerCase(),
    tags: (problem.tags ?? []).join(' ').toLowerCase(),
    meta: `${problem.source ?? ''} ${problem.difficulty ?? ''}`.toLowerCase(),
    insight: (problem.insight ?? '').toLowerCase(),
    body: `${problem.question ?? ''} ${problem.approach ?? ''} ${solutions}`.toLowerCase(),
  };
}

// 0 = no match. Higher = more relevant.
export function scoreProblem(problem, terms) {
  if (terms.length === 0) return 1;
  const fields = searchableFields(problem);
  let score = 0;
  for (const term of terms) {
    let best = 0;
    for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
      if (weight > best && fields[field].includes(term)) best = weight;
    }
    if (best === 0) return 0;
    score += best;
  }
  if (fields.title.startsWith(terms.join(' '))) score += 5;
  return score;
}

function compareBy(sort) {
  const byTitle = (a, b) => a.title.localeCompare(b.title);
  switch (sort) {
    case 'oldest':
      return (a, b) => (a.solvedOn ?? '').localeCompare(b.solvedOn ?? '') || byTitle(a, b);
    case 'difficulty':
      return (a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty] || byTitle(a, b);
    case 'title':
      return byTitle;
    case 'newest':
    default:
      return (a, b) => (b.solvedOn ?? '').localeCompare(a.solvedOn ?? '') || byTitle(a, b);
  }
}

/**
 * Filter + rank problems.
 * - query: free text; all terms must match (title, tags, source, insight, question, approach, code)
 * - tags: a problem must have *every* selected tag
 * - difficulty: 'All' | 'Easy' | 'Medium' | 'Hard'
 * - sort: 'newest' | 'oldest' | 'difficulty' | 'title' (relevance wins while searching)
 */
export function filterProblems(problems, { query = '', tags = [], difficulty = 'All', sort = 'newest' } = {}) {
  const terms = tokenize(query);
  const wanted = tags.map((t) => t.toLowerCase());
  const compare = compareBy(sort);

  const matches = [];
  for (const problem of problems) {
    if (difficulty !== 'All' && problem.difficulty !== difficulty) continue;
    const own = (problem.tags ?? []).map((t) => t.toLowerCase());
    if (!wanted.every((t) => own.includes(t))) continue;
    const score = scoreProblem(problem, terms);
    if (score > 0) matches.push({ problem, score });
  }

  matches.sort((a, b) => (terms.length && b.score !== a.score ? b.score - a.score : compare(a.problem, b.problem)));
  return matches.map((m) => m.problem);
}

export function countByDifficulty(problems) {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  for (const problem of problems) {
    if (problem.difficulty in counts) counts[problem.difficulty] += 1;
  }
  return counts;
}

export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
