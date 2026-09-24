import { ReactLenis } from 'lenis/react';
import { useReduceMotion } from '../../lib/motionPref';

// Buttery inertia scrolling (Lenis). With reduced motion the wheel scrolls natively.
export default function SmoothScroll({ children }) {
  const reduce = useReduceMotion();
  return (
    <ReactLenis root options={{ lerp: 0.11, smoothWheel: !reduce }}>
      {children}
    </ReactLenis>
  );
}
