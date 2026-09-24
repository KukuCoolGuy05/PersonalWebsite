import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import BloomMark from '../ui/BloomMark';
import { GitHubIcon, LinkedInIcon } from '../ui/Icons';
import { useTheme } from '../../lib/useTheme';
import { useScrollLock, useScrollTo } from '../../lib/hooks';
import { profile } from '../../data/profile';
import { EASE_OUT } from '../motion/Reveal';

export const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/achievements', label: 'Certificates & Awards' },
  { to: '/education', label: 'Education' },
  { to: '/coding', label: 'Coding' },
];

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      className="icon-btn theme-toggle"
      onClick={toggle}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          style={{ display: 'grid' }}
        >
          {dark ? <Sun /> : <Moon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const active = `/${pathname.split('/')[1] ?? ''}`;
  const [hovered, setHovered] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const scrollTo = useScrollTo();

  // Tuck the nav away while scrolling down; bring it back on the way up.
  useMotionValueEvent(scrollY, 'change', (y) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(y > previous && y > 240);
  });

  useEffect(() => setMenuOpen(false), [pathname]);
  useScrollLock(menuOpen);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className="nav"
        animate={{ y: hidden && !menuOpen ? -120 : 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <nav className="nav__pill" aria-label="Main">
          <Link to="/" className="nav__brand" aria-label="Kurinji Shivakumar — home">
            <BloomMark className="nav__bloom" />
            <span>Kurinji</span>
          </Link>

          <ul className="nav__links" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map((link) => {
              const isActive = active === link.to;
              const lit = hovered ? hovered === link.to : isActive;
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`nav__link${lit ? ' is-lit' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={() => setHovered(link.to)}
                  >
                    {lit && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="nav__indicator"
                        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="nav__label">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="nav__actions">
            <ThemeToggle />
            <a
              href="#contact"
              className="btn btn--primary btn--sm nav__cta"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('contact');
              }}
            >
              Let’s talk
            </a>
            <button
              type="button"
              className="icon-btn nav__menu-btn"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="menu__top">
              <span className="mono-label">Menu</span>
              <div className="menu__top-actions">
                <ThemeToggle />
                <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                  <X />
                </button>
              </div>
            </div>
            <ul className="menu__links">
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.to}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE_OUT }}
                >
                  <Link to={link.to} className={`menu__link${active === link.to ? ' is-active' : ''}`}>
                    <span className="mono-label">0{i + 1}</span>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="menu__foot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <div className="menu__social">
                <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                  <GitHubIcon />
                </a>
                <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <LinkedInIcon />
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
