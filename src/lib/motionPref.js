import { useSyncExternalStore } from 'react';

// Motion preference: follows the OS "reduce motion" setting until the visitor
// flips the toggle in the footer, then remembers their choice. Stored on
// <html data-motion="full|reduce"> (set before first paint in index.html).
const KEY = 'motion';

function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => observer.disconnect();
}

function isReduced() {
  return document.documentElement.dataset.motion === 'reduce';
}

export function useReduceMotion() {
  return useSyncExternalStore(subscribe, isReduced, () => false);
}

export function setReduceMotion(reduce) {
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full';
  try {
    localStorage.setItem(KEY, reduce ? 'reduce' : 'full');
  } catch {
    // Storage blocked — applies for this visit only.
  }
}
