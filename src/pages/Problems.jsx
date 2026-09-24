import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { Lock, LogOut, Plus, RotateCcw, Search, X } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import { PageHeader } from '../components/layout/Headings';
import { Counter } from '../components/motion/Interactive';
import { Reveal, EASE_OUT } from '../components/motion/Reveal';
import Modal, { ConfirmDialog } from '../components/ui/Modal';
import Segmented from '../components/ui/Segmented';
import AccessBanner from '../components/problems/AccessBanner';
import ProblemDetail from '../components/problems/ProblemDetail';
import ProblemForm from '../components/problems/ProblemForm';
import SignInDialog from '../components/problems/SignInDialog';
import TagManager from '../components/problems/TagManager';
import { ProblemCard, SkeletonCard, TagChip, TagHues } from '../components/problems/ProblemParts';
import { DIFFICULTIES, DSA_TAGS, tagHue } from '../data/dsaTags';
import { countByDifficulty, filterProblems, tokenize } from '../lib/search';
import { DATA_MODE, describeError, isMissingTable, resetLocalData } from '../lib/problemsApi';
import { findTag, mergeTags } from '../lib/tags';
import { useAdmin } from '../lib/useAdmin';
import { useProblems } from '../lib/useProblems';
import { useTags } from '../lib/useTags';
import '../components/problems/problems.css';

// Where this page lives (old /problems links redirect here — see App.jsx).
const BASE = '/coding';
const NO_TAGS = [];

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'difficulty', label: 'Easiest first' },
  { value: 'title', label: 'A → Z' },
];

const sameName = (a, b) => a.toLowerCase() === b.toLowerCase();

// Search + filters live in the URL (?q=&tags=&difficulty=&sort=) so views are shareable.
function useFilters() {
  const [params, setParams] = useSearchParams();
  const filters = {
    query: params.get('q') ?? '',
    tags: params.get('tags')?.split(',').filter(Boolean) ?? [],
    difficulty: params.get('difficulty') ?? 'All',
    sort: params.get('sort') ?? 'newest',
  };

  const update = (patch) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(patch)) {
          const name = key === 'query' ? 'q' : key;
          const isDefault =
            !value || value === 'All' || (key === 'sort' && value === 'newest') || (Array.isArray(value) && !value.length);
          if (isDefault) next.delete(name);
          else next.set(name, Array.isArray(value) ? value.join(',') : value);
        }
        return next;
      },
      { replace: true }
    );

  return [filters, update];
}

function Stats({ problems }) {
  const total = problems.length;
  const byDifficulty = countByDifficulty(problems);

  return (
    <Reveal className="pstats">
      <div className="pstat">
        <span className="pstat__value">
          <Counter value={total} />
        </span>
        <span className="pstat__label">problems logged</span>
      </div>
      <div className="pstat pstat--wide">
        <div className="diffbar" aria-hidden="true">
          {DIFFICULTIES.map((level) => (
            <motion.span
              key={level}
              className={`diffbar__seg diff-bg--${level.toLowerCase()}`}
              initial={{ width: 0 }}
              animate={{ width: total ? `${(byDifficulty[level] / total) * 100}%` : '0%' }}
              transition={{ duration: 1, ease: EASE_OUT, delay: 0.2 }}
            />
          ))}
        </div>
        <div className="diffbar__legend">
          {DIFFICULTIES.map((level) => (
            <span key={level}>
              <i className={`diffbar__dot diff-bg--${level.toLowerCase()}`} />
              {level} <b>{byDifficulty[level]}</b>
            </span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

export default function Problems() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, problems, error, reload, create, update, remove } = useProblems();
  const tagStore = useTags();
  const admin = useAdmin();
  const [filters, setFilters] = useFilters();
  const [editing, setEditing] = useState(null); // null | { problem?: object }
  const [signingIn, setSigningIn] = useState(false);
  const [managingTags, setManagingTags] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);

  // Saved tags come from the tags table; if it isn't set up yet, show the starter set.
  const tagsMissing = tagStore.status === 'error' && isMissingTable(tagStore.error);
  const savedTags =
    tagStore.status === 'ready' ? tagStore.tags : tagStore.status === 'error' ? DSA_TAGS : NO_TAGS;
  const allTags = useMemo(() => mergeTags(savedTags, problems), [savedTags, problems]);
  const hueMap = useMemo(() => new Map(allTags.map((t) => [t.name.toLowerCase(), t.hue])), [allTags]);

  const tagKey = filters.tags.join(',');
  const terms = useMemo(() => tokenize(filters.query), [filters.query]);
  // `filters` is rebuilt every render, so memoize on its primitive parts instead.
  const results = useMemo(
    () => filterProblems(problems, filters),
    [problems, filters.query, tagKey, filters.difficulty, filters.sort]
  );

  const selected = problemId ? problems.find((p) => p.id === problemId) : null;
  const pool = selected && results.some((p) => p.id === selected.id) ? results : problems;
  const position = selected ? pool.findIndex((p) => p.id === selected.id) : -1;

  const openProblem = (id) => navigate({ pathname: `${BASE}/${id}`, search: location.search });
  const closeProblem = () => navigate({ pathname: BASE, search: location.search });
  const step = (dir) => {
    if (!pool.length) return;
    const next = pool[(position + dir + pool.length) % pool.length];
    navigate({ pathname: `${BASE}/${next.id}`, search: location.search }, { replace: true });
  };

  const notify = (text) => setToast({ id: Date.now(), text });

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(id);
  }, [toast]);

  // A link to a problem that no longer exists falls back to the list.
  useEffect(() => {
    if (status === 'ready' && problemId && !selected) {
      navigate({ pathname: BASE, search: location.search }, { replace: true });
    }
  }, [status, problemId, selected, navigate, location.search]);

  // "/" jumps to search; ← → step through problems while one is open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, select, [contenteditable="true"]')) return;
      if (e.key === '/' && !document.querySelector('.modal')) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (selected && !editing && !deleting && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        step(e.key === 'ArrowRight' ? 1 : -1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // New tag names typed into the problem form join the saved list, in the color they
  // were already shown in. Best effort: the problem itself is saved either way.
  const saveNewTags = async (names) => {
    if (tagStore.status !== 'ready') return;
    for (const name of names) {
      if (findTag(tagStore.tags, name)) continue;
      try {
        await tagStore.create({ name, hue: tagHue(name), description: '' });
      } catch {
        // e.g. created in another tab meanwhile — nothing to do.
      }
    }
  };

  const save = async (data) => {
    const saved = editing?.problem ? await update(editing.problem.id, data) : await create(data);
    await saveNewTags(data.tags);
    const wasEditing = Boolean(editing?.problem);
    setEditing(null);
    notify(wasEditing ? 'Changes saved' : 'Problem added');
    navigate({ pathname: `${BASE}/${saved.id}`, search: location.search }, { replace: wasEditing });
  };

  const confirmDelete = async () => {
    setDeleteBusy(true);
    try {
      await remove(deleting.id);
      notify('Problem deleted');
      closeProblem();
    } catch (err) {
      notify(describeError(err));
    } finally {
      setDeleting(null);
      setDeleteBusy(false);
    }
  };

  const createTag = async (tag) => {
    await tagStore.create(tag);
    notify(`Tag “${tag.name}” created`);
  };

  const deleteTag = async (name) => {
    await tagStore.remove(name);
    if (filters.tags.some((t) => sameName(t, name))) setFilters({ tags: filters.tags.filter((t) => !sameName(t, name)) });
    notify(`Tag “${name}” deleted`);
  };

  const recheckAccess = async () => {
    const ok = await admin.recheck();
    if (ok) notify('You can edit now');
    return ok;
  };

  const filtersActive = filters.query || filters.tags.length || filters.difficulty !== 'All';
  const clearFilters = () => setFilters({ query: '', tags: [], difficulty: 'All' });
  const tagSelected = (name) => filters.tags.some((t) => sameName(t, name));
  const toggleTag = (name) =>
    setFilters({ tags: tagSelected(name) ? filters.tags.filter((t) => !sameName(t, name)) : [...filters.tags, name] });

  const difficultyOptions = [
    { value: 'All', label: 'All' },
    ...DIFFICULTIES.map((level) => ({ value: level, label: level })),
  ];

  const signedInWithoutAccess = DATA_MODE === 'supabase' && admin.ready && admin.user && !admin.isAdmin;

  let adminControls = null;
  if (admin.isAdmin) {
    adminControls = (
      <button type="button" className="btn btn--accent btn--sm" onClick={() => setEditing({})}>
        <Plus /> New problem
      </button>
    );
  } else if (DATA_MODE === 'supabase' && admin.ready && !admin.user) {
    adminControls = (
      <button
        type="button"
        className="icon-btn"
        onClick={() => setSigningIn(true)}
        aria-label="Owner sign-in"
        title="Owner sign-in"
      >
        <Lock />
      </button>
    );
  }
  const signOutButton = admin.user && (
    <button
      type="button"
      className="icon-btn"
      onClick={admin.signOut}
      aria-label={`Sign out ${admin.user.email}`}
      title={`Signed in as ${admin.user.email} — sign out`}
    >
      <LogOut />
    </button>
  );

  return (
    <PageTransition label="Coding">
      <PageHeader index="04" label="Coding" title="Coding *problems*" />

      <TagHues.Provider value={hueMap}>
        <section className="container problems" aria-label="Problem log">
          {DATA_MODE === 'local' && admin.isAdmin && (
            <Reveal className="pbanner">
              <p>
                <strong>Demo mode.</strong> Supabase isn’t connected, so problems and tags are saved in this browser
                only. Add your Supabase keys to <code className="inline-code">.env.local</code> to use your database.
              </p>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  resetLocalData();
                  reload();
                  tagStore.reload();
                  notify('Sample problems restored');
                }}
              >
                <RotateCcw /> Reset samples
              </button>
            </Reveal>
          )}

          {signedInWithoutAccess && <AccessBanner user={admin.user} onRecheck={recheckAccess} />}

          <Stats problems={problems} />

          <Reveal className="ptoolbar" delay={0.1}>
            <label className="psearch">
              <Search className="psearch__icon" aria-hidden="true" />
              <span className="sr-only">Search problems</span>
              <input
                ref={searchRef}
                type="search"
                value={filters.query}
                onChange={(e) => setFilters({ query: e.target.value })}
                placeholder="Search titles, tags, insights or code…"
                autoComplete="off"
                spellCheck={false}
              />
              {filters.query ? (
                <button
                  type="button"
                  className="psearch__clear"
                  onClick={() => setFilters({ query: '' })}
                  aria-label="Clear search"
                >
                  <X />
                </button>
              ) : (
                <kbd className="psearch__kbd" aria-hidden="true">
                  /
                </kbd>
              )}
            </label>
            <Segmented
              id="difficulty"
              label="Filter by difficulty"
              options={difficultyOptions}
              value={filters.difficulty}
              onChange={(difficulty) => setFilters({ difficulty })}
            />
            <select
              className="select psort"
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value })}
              aria-label="Sort problems"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {(adminControls || signOutButton) && (
              <div className="ptoolbar__admin">
                {adminControls}
                {signOutButton}
              </div>
            )}
          </Reveal>

          <Reveal className="ptags" delay={0.15} role="group" aria-label="Filter by tag">
            {allTags.map((tag) => (
              <TagChip
                key={tag.name}
                name={tag.name}
                as="button"
                type="button"
                aria-pressed={tagSelected(tag.name)}
                onClick={() => toggleTag(tag.name)}
                title={tag.description || undefined}
              >
                <span className="chip__count">{tag.count}</span>
              </TagChip>
            ))}
            {admin.isAdmin && tagStore.status !== 'loading' && (
              <button type="button" className="tag tag--add" onClick={() => setManagingTags(true)}>
                <Plus /> New tag
              </button>
            )}
          </Reveal>

          <div className="presults">
            <p className="presults__count" aria-live="polite">
              {status === 'ready' &&
                (filtersActive
                  ? `${results.length} of ${problems.length} problems match`
                  : `${problems.length} problem${problems.length === 1 ? '' : 's'}`)}
            </p>
            {filtersActive && (
              <button type="button" className="presults__clear" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          {status === 'loading' && (
            <ul className="pgrid" aria-busy="true">
              {[0, 1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </ul>
          )}

          {status === 'error' && (
            <div className="pempty" role="alert">
              <p className="pempty__title">Couldn’t load problems.</p>
              <p>{describeError(error)}</p>
              <button type="button" className="btn btn--ghost btn--sm" onClick={reload}>
                <RotateCcw /> Try again
              </button>
            </div>
          )}

          {status === 'ready' && results.length > 0 && (
            <motion.ul layout className="pgrid">
              <AnimatePresence mode="popLayout">
                {results.map((problem) => (
                  <ProblemCard key={problem.id} problem={problem} terms={terms} onOpen={openProblem} />
                ))}
              </AnimatePresence>
            </motion.ul>
          )}

          {status === 'ready' && results.length === 0 && (
            <div className="pempty">
              {problems.length === 0 ? (
                <>
                  <p className="pempty__title">No problems logged yet.</p>
                  {admin.isAdmin && (
                    <button type="button" className="btn btn--accent btn--sm" onClick={() => setEditing({})}>
                      <Plus /> Add your first problem
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="pempty__title">
                    Nothing matches{filters.query ? ` “${filters.query}”` : ' those filters'}.
                  </p>
                  <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
                    Clear filters
                  </button>
                </>
              )}
            </div>
          )}
        </section>

        <AnimatePresence>
          {selected && (
            <Modal key="detail" variant="drawer" onClose={closeProblem} labelledBy="problem-title" className="pdrawer">
              <ProblemDetail
                problem={selected}
                position={position}
                total={pool.length}
                onClose={closeProblem}
                onStep={step}
                isAdmin={admin.isAdmin}
                onEdit={() => setEditing({ problem: selected })}
                onDelete={() => setDeleting(selected)}
              />
            </Modal>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editing && (
            <ProblemForm
              key="form"
              initial={editing.problem}
              tags={allTags}
              onSave={save}
              onCancel={() => setEditing(null)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {managingTags && (
            <TagManager
              key="tags"
              tags={allTags}
              unavailable={tagsMissing}
              onCreate={createTag}
              onDelete={deleteTag}
              onClose={() => setManagingTags(false)}
            />
          )}
        </AnimatePresence>
      </TagHues.Provider>

      <AnimatePresence>
        {signingIn && <SignInDialog key="signin" onSignIn={admin.signIn} onClose={() => setSigningIn(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {deleting && (
          <ConfirmDialog
            key="delete"
            title={`Delete “${deleting.title}”?`}
            body="This removes the problem and its solutions for good."
            confirmLabel="Delete"
            danger
            busy={deleteBusy}
            onConfirm={confirmDelete}
            onCancel={() => setDeleting(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 12, x: '-50%' }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
