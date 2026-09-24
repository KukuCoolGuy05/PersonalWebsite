import { Fragment, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { groupWords, stripInline } from '../../lib/text';
import { useReduceMotion } from '../../lib/motionPref';

// A paragraph whose words light up one by one as you scroll through it.
export default function ScrollWords({ text, className }) {
  const ref = useRef(null);
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });
  const words = groupWords(text);

  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{stripInline(text)}</span>
      {words.map((pieces, i) => (
        <Word
          key={i}
          pieces={pieces}
          progress={scrollYProgress}
          range={[i / words.length, (i + 1) / words.length]}
          still={reduce}
        />
      ))}
    </p>
  );
}

function Word({ pieces, progress, range, still }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <span className="scroll-word" aria-hidden="true">
      <motion.span style={still ? undefined : { opacity }}>
        {pieces.map((p, j) => (p.em ? <em key={j}>{p.text}</em> : <Fragment key={j}>{p.text}</Fragment>))}
      </motion.span>{' '}
    </span>
  );
}
