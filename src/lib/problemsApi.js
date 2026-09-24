import { supabase, isSupabaseConfigured } from './supabase';
import { SAMPLE_PROBLEMS } from '../data/sampleProblems';
import { DSA_TAGS } from '../data/dsaTags';

// 'supabase' when keys are configured; otherwise 'local' (sample data kept in
// this browser's localStorage so the page is fully usable before setup).
export const DATA_MODE = isSupabaseConfigured ? 'supabase' : 'local';

const TABLE = 'problems';
const TAGS_TABLE = 'tags';
const LOCAL_KEY = 'problems:v1';
const LOCAL_TAGS_KEY = 'tags:v1';

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

function tagFromRow(row) {
  return { name: row.name, hue: row.hue, description: row.description ?? '' };
}

// ── Local fallback ──────────────────────────────────────────
function readStore(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch {
    // Storage blocked or corrupted — fall back to the defaults.
  }
  return fallback();
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode): changes last until reload.
  }
}

const readLocal = () => readStore(LOCAL_KEY, () => SAMPLE_PROBLEMS);
const writeLocal = (problems) => writeStore(LOCAL_KEY, problems);
const readLocalTags = () => readStore(LOCAL_TAGS_KEY, () => DSA_TAGS.map(({ name, hue, description }) => ({ name, hue, description })));
const writeLocalTags = (tags) => writeStore(LOCAL_TAGS_KEY, tags);

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function notAllowed() {
  return Object.assign(new Error('not allowed'), { code: 'NOT_ALLOWED' });
}

// ── Problems (all take/return the app shape) ────────────────
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

// ── Tags ────────────────────────────────────────────────────
export async function listTags() {
  if (DATA_MODE === 'local') return readLocalTags();
  const { data, error } = await supabase
    .from(TAGS_TABLE)
    .select('name, hue, description')
    .order('created_at')
    .order('name');
  if (error) throw error;
  return data.map(tagFromRow);
}

export async function createTag({ name, hue, description = '' }) {
  if (DATA_MODE === 'local') {
    const tags = readLocalTags();
    const lower = name.toLowerCase();
    if (tags.some((t) => t.name.toLowerCase() === lower)) {
      throw Object.assign(new Error('duplicate tag'), { code: '23505' });
    }
    const created = { name, hue, description };
    writeLocalTags([...tags, created]);
    return created;
  }
  const { data, error } = await supabase.from(TAGS_TABLE).insert({ name, hue, description }).select('name, hue, description');
  if (error) throw error;
  return tagFromRow(data[0]);
}

export async function deleteTag(name) {
  if (DATA_MODE === 'local') {
    writeLocalTags(readLocalTags().filter((t) => t.name !== name));
    return;
  }
  const { data, error } = await supabase.from(TAGS_TABLE).delete().eq('name', name).select('name');
  if (error) throw error;
  if (!data.length) throw notAllowed();
}

// Demo mode: put the sample problems and starter tags back.
export function resetLocalData() {
  try {
    localStorage.removeItem(LOCAL_KEY);
    localStorage.removeItem(LOCAL_TAGS_KEY);
  } catch {
    // ignore
  }
}

// ── Errors ──────────────────────────────────────────────────
// PostgREST reports a table that hasn't been created (schema.sql not run yet).
export function isMissingTable(error) {
  return error?.code === 'PGRST205' || error?.code === '42P01';
}

// Turn Supabase/PostgREST errors into something readable.
export function describeError(error) {
  if (!error) return '';
  if (error.code === '42501' || /row-level security/i.test(error.message ?? '')) {
    return 'Supabase refused the change — this account isn’t on the admins list yet.';
  }
  if (error.code === 'NOT_ALLOWED') {
    return 'Nothing changed — it was already deleted, or this account isn’t on the admins list.';
  }
  if (error.code === '23505') return 'A tag with that name already exists.';
  if (isMissingTable(error)) {
    return 'That table isn’t set up yet — run the latest supabase/schema.sql in Supabase’s SQL Editor.';
  }
  if (/Failed to fetch|NetworkError/i.test(error.message ?? '')) return 'Couldn’t reach Supabase. Check your connection.';
  return error.message || 'Something went wrong.';
}
