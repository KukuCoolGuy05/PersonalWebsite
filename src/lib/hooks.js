import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useLocation } from 'react-router';
import { useLenis } from 'lenis/react';
import { useReduceMotion } from './motionPref';

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

// Feeds the cursor position into --mx / --my for the `.spotlight` hover glow.
export function spotlightMove(event) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  el.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

// Smooth-scroll to an element id (through Lenis when it's running).
export function useScrollTo() {
  const lenis = useLenis();
  const reduce = useReduceMotion();
  return useCallback(
    (id, { immediate = false, offset = -24 } = {}) => {
      const el = document.getElementById(id);
      if (!el) return false;
      const jump = immediate || reduce;
      if (lenis) {
        // Lenis caches the page height; re-measure first or a freshly mounted,
        // taller page gets clamped to the previous page's scroll limit.
        lenis.resize();
        lenis.scrollTo(el, { offset, immediate: jump, duration: 1.4 });
      }
      else el.scrollIntoView({ behavior: jump ? 'auto' : 'smooth', block: 'start' });
      return true;
    },
    [lenis, reduce]
  );
}

// Scroll to #hash targets: jump instantly when arriving from another page
// (the transition curtain hides it), glide when already on the page.
export function useHashScroll() {
  const { hash, key } = useLocation();
  const scrollTo = useScrollTo();
  const arriving = useRef(true);

  useEffect(() => {
    const immediate = arriving.current;
    arriving.current = false;
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    const timer = setTimeout(() => scrollTo(id, { immediate }), immediate ? 80 : 0);
    return () => clearTimeout(timer);
    // Re-run per navigation only — not when the Lenis instance (inside scrollTo) appears.
  }, [hash, key]);
}

// Freeze page scrolling (and Lenis) while any modal is open. Counted, so nested
// modals (a confirm dialog on top of a drawer) don't unlock the page early.
let scrollLocks = 0;

export function useScrollLock(locked) {
  const lenis = useLenis();
  useEffect(() => {
    if (!locked) return undefined;
    scrollLocks += 1;
    if (scrollLocks === 1) {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
    }
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) {
        document.documentElement.style.overflow = '';
        lenis?.start();
      }
    };
  }, [locked, lenis]);
}

// Reads CSS custom properties (for canvas drawing) and re-reads them when the theme flips.
export function useCssVars(names) {
  const key = names.join('|');
  const read = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    return Object.fromEntries(key.split('|').map((n) => [n, styles.getPropertyValue(n).trim()]));
  }, [key]);

  const [vars, setVars] = useState(read);

  useEffect(() => {
    setVars(read());
    const observer = new MutationObserver(() => setVars(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [read]);

  return vars;
}

export function usePrefersHover() {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
