import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { useLenis } from 'lenis/react';
import { ArrowUp, Check, Copy } from 'lucide-react';
import { profile } from '../../data/profile';
import { setReduceMotion, useReduceMotion } from '../../lib/motionPref';
import { GitHubIcon, LinkedInIcon } from '../ui/Icons';
import { Magnetic } from '../motion/Interactive';
import { Reveal, RevealTitle } from '../motion/Reveal';
import { NAV_LINKS } from './Nav';

function CopyEmail({ email }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="copy-email">
      <a href={`mailto:${email}`} className="copy-email__link">
        {email}
      </a>
      <button type="button" className="copy-email__btn" onClick={copy} aria-label="Copy email address">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? 'done' : 'copy'}
            className="copy-email__state"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {copied ? (
              <>
                Copied <Check />
              </>
            ) : (
              <Copy />
            )}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}

export default function Footer() {
  const ref = useRef(null);
  const lenis = useLenis();
  const reduce = useReduceMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const wordmarkY = useTransform(scrollYProgress, [0.2, 1], ['60%', '0%']);

  const toTop = () =>
    lenis ? lenis.scrollTo(0, { duration: 1.6, immediate: reduce }) : window.scrollTo({ top: 0 });

  return (
    <footer ref={ref} id="contact" className="footer">
      <div className="container footer__inner">
        <Reveal className="mono-label">(Contact) — say hello</Reveal>
        <RevealTitle as="h2" className="footer__title" text="Let’s build something that *blooms*." />
        <Reveal className="footer__actions" delay={0.15}>
          <CopyEmail email={profile.email} />
          <Magnetic>
            <a className="btn btn--ghost" href={profile.links.linkedin} target="_blank" rel="noreferrer">
              <LinkedInIcon /> LinkedIn
            </a>
          </Magnetic>
          <Magnetic>
            <a className="btn btn--ghost" href={profile.links.github} target="_blank" rel="noreferrer">
              <GitHubIcon /> GitHub
            </a>
          </Magnetic>
        </Reveal>

        <div className="footer__bottom">
          <p>
            © {new Date().getFullYear()} {profile.firstName} {profile.lastName}
          </p>
          <nav className="footer__nav" aria-label="Footer">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="footer__tools">
            <button
              type="button"
              className="footer__motion"
              onClick={() => setReduceMotion(!reduce)}
              aria-pressed={!reduce}
              title="Animations follow your system setting until you change them here"
            >
              <span className="footer__switch" aria-hidden="true" />
              Motion {reduce ? 'off' : 'on'}
            </button>
            <button type="button" className="footer__top" onClick={toTop}>
              Back to top <ArrowUp />
            </button>
          </div>
        </div>
      </div>

      <div className="footer__wordmark-wrap" aria-hidden="true">
        <motion.div className="footer__wordmark" style={{ y: wordmarkY }}>
          {profile.firstName.toUpperCase()}
        </motion.div>
      </div>
    </footer>
  );
}
