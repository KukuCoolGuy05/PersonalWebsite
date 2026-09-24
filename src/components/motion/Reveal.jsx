import { Fragment } from 'react';
import { motion } from 'motion/react';
import { groupWords, stripInline } from '../../lib/text';

export const EASE_OUT = [0.22, 1, 0.36, 1];

// Fade + rise when scrolled into view.
export function Reveal({ as = 'div', children, delay = 0, y = 28, amount = 0.15, className, ...rest }) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: EASE_OUT, delay }}
      {...rest}
    >
      {children}
    </Component>
  );
}

const wordVariants = {
  hidden: { y: '115%' },
  show: { y: '0%', transition: { duration: 0.95, ease: EASE_OUT } },
};

// Headline whose words slide up out of a mask, one after another.
// Supports "*emphasis*" for the serif accent.
export function RevealTitle({ text, as = 'h2', className, delay = 0, stagger = 0.06, onMount = false }) {
  const Tag = motion[as];
  const words = groupWords(text);

  const trigger = onMount ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, amount: 0.35 } };

  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      <span className="sr-only">{stripInline(text)}</span>
      {words.map((pieces, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className={`mask${pieces.at(-1).em ? ' mask--em' : ''}`} aria-hidden="true">
            <motion.span variants={wordVariants}>
              {pieces.map((p, j) => (p.em ? <em key={j}>{p.text}</em> : p.text))}
            </motion.span>
          </span>
        </Fragment>
      ))}
    </Tag>
  );
}
