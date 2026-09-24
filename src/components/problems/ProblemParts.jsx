import { Fragment } from 'react';
import { motion } from 'motion/react';
import { tagHue } from '../../data/dsaTags';
import { escapeRegExp } from '../../lib/search';
import { formatDate, parseInline } from '../../lib/text';
import { spotlightMove } from '../../lib/hooks';
import { EASE_OUT } from '../motion/Reveal';
import { languageLabel } from './CodeBlock';

export function DifficultyBadge({ level }) {
  return <span className={`diff diff--${level?.toLowerCase()}`}>{level}</span>;
}

export function TagChip({ name, as: Tag = 'span', children, ...rest }) {
  return (
    <Tag className="tag" style={{ '--h': tagHue(name) }} {...rest}>
      <span className="tag__dot" aria-hidden="true" />
      {name}
      {children}
    </Tag>
  );
}

// Wraps matched search terms in <mark>.
export function Highlight({ text, terms }) {
  if (!terms.length) return text;
  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi');
  return text.split(pattern).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

// One-line text with `inline code` support, plus search highlighting.
export function InsightText({ text, terms = [] }) {
  return parseInline(text).map((seg, i) =>
    seg.type === 'code' ? (
      <code key={i} className="inline-code">
        <Highlight text={seg.value} terms={terms} />
      </code>
    ) : (
      <Fragment key={i}>
        <Highlight text={seg.value} terms={terms} />
      </Fragment>
    )
  );
}

export function problemMeta(problem) {
  return [problem.number ? `#${problem.number}` : null, problem.source].filter(Boolean).join(' · ');
}

export function ProblemCard({ problem, terms, onOpen }) {
  const first = problem.solutions[0];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="pcell"
    >
      <button type="button" className="pitem spotlight" onClick={() => onOpen(problem.id)} onPointerMove={spotlightMove}>
        <span className="pitem__top">
          <DifficultyBadge level={problem.difficulty} />
          <span className="pitem__meta">{problemMeta(problem)}</span>
          <span className="pitem__date">{formatDate(problem.solvedOn)}</span>
        </span>
        <span className="pitem__title">
          <Highlight text={problem.title} terms={terms} />
        </span>
        {problem.insight && (
          <span className="pitem__insight">
            <InsightText text={problem.insight} terms={terms} />
          </span>
        )}
        <span className="pitem__bottom">
          <span className="pitem__tags">
            {problem.tags.map((tag) => (
              <TagChip key={tag} name={tag} />
            ))}
          </span>
          {first && (
            <span className="pitem__lang">
              {languageLabel(first.language)}
              {first.time && ` · ${first.time}`}
              {problem.solutions.length > 1 && ` · +${problem.solutions.length - 1}`}
            </span>
          )}
        </span>
      </button>
    </motion.li>
  );
}

export function SkeletonCard() {
  return (
    <li className="pcell">
      <div className="pitem pitem--skeleton" aria-hidden="true">
        <span className="skeleton" style={{ width: '40%' }} />
        <span className="skeleton skeleton--lg" style={{ width: '75%' }} />
        <span className="skeleton" style={{ width: '90%' }} />
        <span className="skeleton" style={{ width: '30%' }} />
      </div>
    </li>
  );
}
