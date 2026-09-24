import { Reveal, RevealTitle } from '../motion/Reveal';

// Big title block at the top of the inner pages.
export function PageHeader({ index, label, title, lede, children }) {
  return (
    <header className="page-head container">
      <Reveal className="page-head__meta" delay={0.7}>
        <span className="mono-label">
          ({index}) — {label}
        </span>
      </Reveal>
      <RevealTitle as="h1" className="page-title" text={title} delay={0.75} onMount />
      {lede && (
        <Reveal as="p" className="lede" delay={0.95}>
          {lede}
        </Reveal>
      )}
      {children}
    </header>
  );
}

// Numbered section heading used down the home page.
export function SectionHead({ index, label, title, aside }) {
  return (
    <div className="section-head">
      <Reveal className="section-head__meta">
        <span className="mono-label">
          {index} — {label}
        </span>
      </Reveal>
      <div className="section-head__row">
        <RevealTitle as="h2" className="section-title" text={title} />
        {aside && (
          <Reveal className="section-head__aside" delay={0.2}>
            {aside}
          </Reveal>
        )}
      </div>
    </div>
  );
}
