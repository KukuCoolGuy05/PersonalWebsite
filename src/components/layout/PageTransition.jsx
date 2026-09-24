import { motion } from 'motion/react';
import BloomMark from '../ui/BloomMark';
import { useReduceMotion } from '../../lib/motionPref';

const EASE = [0.76, 0, 0.24, 1];

// Every page is wrapped in this. Leaving a page slides a curtain up over it;
// the next page arrives under a curtain that briefly shows its name, then lifts.
export default function PageTransition({ label, children }) {
  const reduce = useReduceMotion();

  return (
    <>
      {!reduce && (
        <>
          <motion.div
            className="curtain curtain--in"
            aria-hidden="true"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 0 }}
            exit={{ scaleY: 1 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
          <motion.div
            className="curtain curtain--out"
            aria-hidden="true"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0, transitionEnd: { visibility: 'hidden' } }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
          >
            <motion.span
              className="curtain__label"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: [0, 1, 1, 0], y: [24, 0, 0, -32] }}
              transition={{ duration: 0.75, times: [0, 0.3, 0.6, 1], ease: 'easeOut' }}
            >
              <BloomMark /> {label}
            </motion.span>
          </motion.div>
        </>
      )}
      <motion.main
        id="main"
        className="page"
        initial={{ opacity: reduce ? 0 : 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduce ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        {children}
      </motion.main>
    </>
  );
}
