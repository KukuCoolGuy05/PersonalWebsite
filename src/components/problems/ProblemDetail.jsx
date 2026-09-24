import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Pencil, Trash2, X } from 'lucide-react';
import { formatDate } from '../../lib/text';
import BloomMark from '../ui/BloomMark';
import { EASE_OUT } from '../motion/Reveal';
import CodeBlock from './CodeBlock';
import Markdown from './Markdown';
import { DifficultyBadge, InsightText, TagChip, problemMeta } from './ProblemParts';

// Remounts per problem (the article is keyed by id), so the first tab is always selected on arrival.
function Solutions({ solutions }) {
  const [active, setActive] = useState(0);
  const current = solutions[Math.min(active, solutions.length - 1)];

  return (
    <div className="sol">
      {solutions.length > 1 && (
        <div className="sol__tabs" role="tablist" aria-label="Solutions">
          {solutions.map((s, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`sol__tab${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
            >
              {i === active && (
                <motion.span
                  layoutId="sol-tab"
                  className="sol__tab-bg"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}
              <span className="sol__tab-label">{s.label || `Solution ${i + 1}`}</span>
            </button>
          ))}
        </div>
      )}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <CodeBlock
            code={current.code}
            language={current.language}
            meta={
              (current.time || current.space) && (
                <span className="code__complexity">
                  {current.time && <span>Time {current.time}</span>}
                  {current.space && <span>Space {current.space}</span>}
                </span>
              )
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ProblemDetail({ problem, position, total, onClose, onStep, isAdmin, onEdit, onDelete }) {
  return (
    <div className="detail">
      <div className="detail__bar">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close problem">
          <X />
        </button>
        <span className="mono-label detail__count">
          {position + 1} / {total}
        </span>
        <div className="detail__bar-actions">
          {isAdmin && (
            <>
              <button type="button" className="icon-btn" onClick={onEdit} aria-label="Edit problem" title="Edit">
                <Pencil />
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={onDelete}
                aria-label="Delete problem"
                title="Delete"
              >
                <Trash2 />
              </button>
            </>
          )}
          <button type="button" className="icon-btn" onClick={() => onStep(-1)} aria-label="Previous problem">
            <ArrowLeft />
          </button>
          <button type="button" className="icon-btn" onClick={() => onStep(1)} aria-label="Next problem">
            <ArrowRight />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={problem.id}
          className="detail__body"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
        >
          <header className="detail__head">
            <div className="detail__meta">
              <DifficultyBadge level={problem.difficulty} />
              {problemMeta(problem) && <span>{problemMeta(problem)}</span>}
              {problem.solvedOn && <span>Solved {formatDate(problem.solvedOn)}</span>}
            </div>
            <h2 id="problem-title" className="detail__title">
              {problem.title}
            </h2>
            <div className="detail__row">
              <div className="detail__tags">
                {problem.tags.map((tag) => (
                  <TagChip key={tag} name={tag} />
                ))}
              </div>
              {problem.url && (
                <a className="btn btn--ghost btn--sm" href={problem.url} target="_blank" rel="noreferrer">
                  Open original <ArrowUpRight className="icon-arrow-ur" />
                </a>
              )}
            </div>
          </header>

          <section className="detail__section">
            <h3 className="mono-label">Question</h3>
            <Markdown>{problem.question}</Markdown>
          </section>

          {problem.insight && (
            <aside className="insight">
              <BloomMark className="insight__mark" />
              <div>
                <p className="mono-label">Key insight</p>
                <p className="insight__text">
                  <InsightText text={problem.insight} />
                </p>
              </div>
            </aside>
          )}

          {problem.approach && (
            <section className="detail__section">
              <h3 className="mono-label">Approach</h3>
              <Markdown>{problem.approach}</Markdown>
            </section>
          )}

          <section className="detail__section">
            <h3 className="mono-label">{problem.solutions.length > 1 ? 'Solutions' : 'Solution'}</h3>
            {problem.solutions.length ? (
              <Solutions solutions={problem.solutions} />
            ) : (
              <p className="detail__empty">No solution saved yet.</p>
            )}
          </section>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}
