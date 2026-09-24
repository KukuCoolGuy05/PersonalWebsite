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
import ProblemDetail from '../components/problems/ProblemDetail';
import ProblemForm from '../components/problems/ProblemForm';
import SignInDialog from '../components/problems/SignInDialog';
import { ProblemCard, SkeletonCard, TagChip } from '../components/problems/ProblemParts';
import { DIFFICULTIES, DSA_TAGS } from '../data/dsaTags';
import { countByDifficulty, countByTag, filterProblems, tokenize } from '../lib/search';
import { DATA_MODE, describeError, resetLocalProblems } from '../lib/problemsApi';
import { useAdmin } from '../lib/useAdmin';
import { useProblems } from '../lib/useProblems';
import '../components/problems/problems.css';

const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'difficulty', label: 'Easiest first' },
  { value: 'title', label: 'A → Z' },
];

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
  const tagCounts = countByTag(problems);
  const covered = DSA_TAGS.filter((t) => tagCounts.get(t.name)).length;
  const top = [...tagCounts.entries()].sort((a, b) => b[1] - a[1])[0];

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
      <div className="pstat">
        <span className="pstat__value">
          <Counter value={covered} />
          <small>/{DSA_TAGS.length}</small>
        </span>
        <span className="pstat__label">
          data structures practiced{top ? ` · most: ${top[0]}` : ''}
        </span>
      </div>
    </Reveal>
  );
}

export default function Problems() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, problems, error, reload, create, update, remove } = useProblems();
  const admin = useAdmin();
  const [filters, setFilters] = useFilters();
  const [editing, setEditing] = useState(null); // null | { problem?: object }
  const [signingIn, setSigningIn] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);

  const tagKey = filters.tags.join(',');
  const terms = useMemo(() => tokenize(filters.query), [filters.query]);
  // `filters` is rebuilt every render, so memoize on its primitive parts instead.
  const results = useMemo(
    () => filterProblems(problems, filters),
    [problems, filters.query, tagKey, filters.difficulty, filters.sort]
  );
  const tagCounts = useMemo(() => countByTag(problems), [problems]);
  const tagNames = useMemo(() => {
    const names = DSA_TAGS.map((t) => t.name);
    for (const tag of tagCounts.keys()) if (!names.includes(tag)) names.push(tag);
    return names;
  }, [tagCounts]);

  const selected = problemId ? problems.find((p) => p.id === problemId) : null;
  const pool = selected && results.some((p) => p.id === selected.id) ? results : problems;
  const position = selected ? pool.findIndex((p) => p.id === selected.id) : -1;

  const openProblem = (id) => navigate({ pathname: `/problems/${id}`, search: location.search });
  const closeProblem = () => navigate({ pathname: '/problems', search: location.search });
  const step = (dir) => {
    if (!pool.length) return;
    const next = pool[(position + dir + pool.length) % pool.length];
    navigate({ pathname: `/problems/${next.id}`, search: location.search }, { replace: true });
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
      navigate({ pathname: '/problems', search: location.search }, { replace: true });
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

  const save = async (data) => {
    if (editing?.problem) {
      const saved = await update(editing.problem.id, data);
      setEditing(null);
      notify('Changes saved');
      navigate({ pathname: `/problems/${saved.id}`, search: location.search }, { replace: true });
    } else {
      const saved = await create(data);
      setEditing(null);
      notify('Problem added');
      navigate({ pathname: `/problems/${saved.id}`, search: location.search });
    }
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

  const filtersActive = filters.query || filters.tags.length || filters.difficulty !== 'All';
  const clearFilters = () => setFilters({ query: '', tags: [], difficulty: 'All' });
  const toggleTag = (tag) =>
    setFilters({ tags: filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag] });

  const difficultyOptions = [
    { value: 'All', label: 'All' },
    ...DIFFICULTIES.map((level) => ({ value: level, label: level })),
  ];

  let adminControls = null;
  if (admin.isAdmin) {
    adminControls = (
      <>
        <button type="button" className="btn btn--accent btn--sm" onClick={() => setEditing({})}>
          <Plus /> New problem
        </button>
        {admin.user && (
          <button
            type="button"
            className="icon-btn"
            onClick={admin.signOut}
            aria-label={`Sign out ${admin.user.email}`}
            title={`Signed in as ${admin.user.email} — sign out`}
          >
            <LogOut />
          </button>
        )}
      </>
    );
  } else if (DATA_MODE === 'supabase' && admin.ready) {
    adminControls = admin.user ? (
      <span className="ptoolbar__note">
        {admin.user.email} can’t edit
        <button type="button" className="icon-btn" onClick={admin.signOut} aria-label="Sign out">
          <LogOut />
        </button>
      </span>
    ) : (
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

  return (
    <PageTransition label="Problems">
      <PageHeader
        index="04"
        label="Coding problems"
        title="Coding *problems*"
        lede="A searchable log of the problems I’ve worked through — the question, the key insight, and the code that solved it."
      />

      <section className="container problems" aria-label="Problem log">
        {DATA_MODE === 'local' && admin.isAdmin && (
          <Reveal className="pbanner">
            <p>
              <strong>Demo mode.</strong> Supabase isn’t connected yet, so problems are saved in this browser only. Follow{' '}
              <code className="inline-code">SETUP.md</code> to connect your database.
            </p>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => {
                resetLocalProblems();
                reload();
                notify('Sample problems restored');
              }}
            >
              <RotateCcw /> Reset samples
            </button>
          </Reveal>
        )}

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
              <button type="button" className="psearch__clear" onClick={() => setFilters({ query: '' })} aria-label="Clear search">
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
          <div className="ptoolbar__admin">{adminControls}</div>
        </Reveal>

        <Reveal className="ptags" delay={0.15} role="group" aria-label="Filter by data structure">
          {tagNames.map((tag) => (
            <TagChip
              key={tag}
              name={tag}
              as="button"
              type="button"
              aria-pressed={filters.tags.includes(tag)}
              onClick={() => toggleTag(tag)}
              title={DSA_TAGS.find((t) => t.name === tag)?.description}
            >
              <span className="chip__count">{tagCounts.get(tag) ?? 0}</span>
            </TagChip>
          ))}
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
            knownTags={tagNames}
            onSave={save}
            onCancel={() => setEditing(null)}
          />
        )}
      </AnimatePresence>

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
