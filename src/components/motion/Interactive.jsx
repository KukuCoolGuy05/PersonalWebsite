import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useSpring } from 'motion/react';
import { spotlightMove, usePrefersHover } from '../../lib/hooks';
import { EASE_OUT } from './Reveal';
import { useReduceMotion } from '../../lib/motionPref';

// Pulls its child toward the cursor, then springs back.
export function Magnetic({ children, strength = 0.3, className }) {
  const ref = useRef(null);
  const hover = usePrefersHover();
  const reduce = useReduceMotion();
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.3 });
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.3 });

  const onMove = (event) => {
    if (!hover || reduce) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      className={`magnetic ${className ?? ''}`}
      style={{ x, y, display: 'inline-flex' }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.span>
  );
}

// 3D tilt toward the cursor plus the `.spotlight` glow.
export function TiltCard({ as = 'div', children, className, max = 7, ...rest }) {
  const hover = usePrefersHover();
  const reduce = useReduceMotion();
  const rotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const rotateY = useSpring(0, { stiffness: 160, damping: 18 });
  const Component = motion[as];

  const onMove = (event) => {
    spotlightMove(event);
    if (!hover || reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * max * 2);
    rotateX.set(-py * max * 2);
  };
  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <Component
      className={`spotlight ${className ?? ''}`}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      {...rest}
    >
      {children}
    </Component>
  );
}

// Counts up from 0 the first time it scrolls into view.
export function Counter({ value, duration = 1.6, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const reduce = useReduceMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setShown(value);
      return undefined;
    }
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className="counter">
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
