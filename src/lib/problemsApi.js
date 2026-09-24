import { supabase, isSupabaseConfigured } from './supabase';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';

// 'supabase' when keys are configured; otherwise 'local' (sample data kept in
// this browser's localStorage so the page is fully usable before setup).
export const DATA_MODE = isSupabaseConfigured ? 'supabase' : 'local';

const TABLE = 'problems';
const LOCAL_KEY = 'problems:v1';

// ── Row mapping (database snake_case ↔ app camelCase) ───────
function fromRow(row) {
  return {
    id: row.id,
    title: row.title,
    number: row.number,
    source: row.source,
    url: row.url,
    difficulty: row.difficulty,
    tags: row.tags ?? [],
    solvedOn: row.solved_on,
    question: row.question ?? '',
    insight: row.insight ?? '',
    approach: row.approach ?? '',
    solutions: Array.isArray(row.solutions) ? row.solutions : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(problem) {
  return {
    title: problem.title,
    number: problem.number,
    source: problem.source,
    url: problem.url,
    difficulty: problem.difficulty,
    tags: problem.tags,
    solved_on: problem.solvedOn,
    question: problem.question,
    insight: problem.insight,
    approach: problem.approach,
    solutions: problem.solutions,
  };
}

// ── Local fallback ──────────────────────────────────────────
function readLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // Storage blocked or corrupted — fall back to the samples.
  }
  return SAMPLE_PROBLEMS;
}

function writeLocal(problems) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(problems));
  } catch {
    // Storage unavailable (private mode): changes last until reload.
  }
}

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── Public API (all take/return the app shape) ──────────────
export async function listProblems() {
  if (DATA_MODE === 'local') return readLocal();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('solved_on', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function countProblems() {
  if (DATA_MODE === 'local') return readLocal().length;
  const { count, error } = await supabase.from(TABLE).select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function createProblem(problem) {
  if (DATA_MODE === 'local') {
    const now = new Date().toISOString();
    const created = { ...problem, id: newId(), createdAt: now, updatedAt: now };
    writeLocal([created, ...readLocal()]);
    return created;
  }
  const { data, error } = await supabase.from(TABLE).insert(toRow(problem)).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateProblem(id, problem) {
  if (DATA_MODE === 'local') {
    const list = readLocal();
    const updated = { ...list.find((p) => p.id === id), ...problem, id, updatedAt: new Date().toISOString() };
    writeLocal(list.map((p) => (p.id === id ? updated : p)));
    return updated;
  }
  // RLS hides rows you can't edit, so "no row came back" means deleted or not allowed.
  const { data, error } = await supabase.from(TABLE).update(toRow(problem)).eq('id', id).select();
  if (error) throw error;
  if (!data.length) throw notAllowed();
  return fromRow(data[0]);
}

export async function deleteProblem(id) {
  if (DATA_MODE === 'local') {
    writeLocal(readLocal().filter((p) => p.id !== id));
    return;
  }
  const { data, error } = await supabase.from(TABLE).delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data.length) throw notAllowed();
}

function notAllowed() {
  return Object.assign(new Error('not allowed'), { code: 'NOT_ALLOWED' });
}

export function resetLocalProblems() {
  try {
    localStorage.removeItem(LOCAL_KEY);
  } catch {
    // ignore
  }
}

// Turn Supabase/PostgREST errors into something readable.
export function describeError(error) {
  if (!error) return '';
  if (error.code === '42501' || /row-level security/i.test(error.message ?? '')) {
    return 'Supabase refused the change — this account isn’t on the admins list (see SETUP.md, step 4).';
  }
  if (error.code === 'NOT_ALLOWED') {
    return 'Nothing changed — the problem was already deleted, or this account isn’t on the admins list.';
  }
  if (/Failed to fetch|NetworkError/i.test(error.message ?? '')) return 'Couldn’t reach Supabase. Check your connection.';
  return error.message || 'Something went wrong.';
}
