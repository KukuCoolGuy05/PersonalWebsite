import { useCallback, useSyncExternalStore } from 'react';

const META_COLORS = { dark: '#0b0b0f', light: '#f4f2ee' };

function currentTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

// Every toggle on the page stays in sync by watching the <html data-theme> attribute.
function subscribe(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLORS[theme]);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage blocked — the theme still applies for this visit.
  }
}

// Theme toggle with a circular "ink spread" reveal from the button (View Transitions API).
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'dark');

  const toggle = useCallback((event) => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    const reduce = document.documentElement.dataset.motion === 'reduce';

    if (!document.startViewTransition || reduce) {
      applyTheme(next);
      return;
    }

    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : 0;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const root = document.documentElement;
    root.dataset.themeSwitching = '';
    const transition = document.startViewTransition(() => applyTheme(next));

    transition.ready
      .then(() => {
        root.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' }
        );
      })
      .catch(() => {});
    transition.finished.finally(() => delete root.dataset.themeSwitching);
  }, []);

  return { theme, toggle };
}
