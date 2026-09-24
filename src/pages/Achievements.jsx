import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import PageTransition from '../components/layout/PageTransition';
import { PageHeader } from '../components/layout/Headings';
import { Counter, TiltCard } from '../components/motion/Interactive';
import { Reveal, RevealTitle, EASE_OUT } from '../components/motion/Reveal';
import BloomMark from '../components/ui/BloomMark';
import { awardCategories, awards, certificates, chessTitles } from '../data/awards';
import { formatMonth } from '../lib/text';
import { useReduceMotion } from '../lib/motionPref';
import './pages.css';

// A complete knight's tour of a 5×5 board — every square exactly once.
const TOUR = [
  [0, 0], [1, 2], [0, 4], [2, 3], [4, 4], [3, 2], [4, 0], [2, 1], [0, 2], [1, 4], [3, 3], [4, 1], [2, 0],
  [0, 1], [1, 3], [3, 4], [4, 2], [3, 0], [1, 1], [0, 3], [2, 4], [4, 3], [3, 1], [1, 0], [2, 2],
];
const CELL = 48;

function KnightsTour() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReduceMotion();
  const [step, setStep] = useState(reduce ? TOUR.length - 1 : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const done = step >= TOUR.length - 1;
    const id = setTimeout(() => setStep((s) => (s >= TOUR.length - 1 ? 0 : s + 1)), done ? 2200 : 520);
    return () => clearTimeout(id);
  }, [inView, reduce, step]);

  const [kx, ky] = TOUR[step];
  const path = TOUR.slice(0, step + 1)
    .map(([x, y]) => `${x * CELL + CELL / 2},${y * CELL + CELL / 2}`)
    .join(' ');

  return (
    <div ref={ref} className="tour">
      <svg viewBox={`0 0 ${CELL * 5} ${CELL * 5}`} className="tour__board" aria-hidden="true">
        {Array.from({ length: 25 }, (_, i) => {
          const x = i % 5;
          const y = Math.floor(i / 5);
          const order = TOUR.findIndex(([tx, ty]) => tx === x && ty === y);
          const visited = order <= step;
          return (
            <g key={i}>
              <rect
                x={x * CELL}
                y={y * CELL}
                width={CELL}
                height={CELL}
                className={`tour__cell${(x + y) % 2 ? ' is-dark' : ''}${visited ? ' is-visited' : ''}`}
              />
              {visited && (
                <text x={x * CELL + 6} y={y * CELL + 14} className="tour__order">
                  {order + 1}
                </text>
              )}
            </g>
          );
        })}
        <polyline points={path} className="tour__path" />
        <motion.text
          className="tour__knight"
          textAnchor="middle"
          dominantBaseline="central"
          initial={false}
          animate={{ x: kx * CELL + CELL / 2, y: ky * CELL + CELL / 2 + 2 }}
          transition={{ duration: 0.42, ease: EASE_OUT }}
        >
          ♞
        </motion.text>
      </svg>
      <p className="tour__caption mono-label">
        Knight’s tour · {step + 1}/25 squares
      </p>
    </div>
  );
}

function Featured() {
  return (
    <section className="container featured" aria-label="Highlights">
      <Reveal className="featured__chess">
        <TiltCard className="feat-card feat-card--chess" max={4}>
          <div className="feat-card__text">
            <span className="mono-label">Competition · 2019 – 2023</span>
            <h2 className="feat-card__title">
              <Counter value={chessTitles.length} suffix="×" /> IHSA state <em>champions</em>
            </h2>
            <p className="feat-card__body">
              Won the Illinois high-school chess team championship three times with Stevenson — and picked up two
              Ambassador Awards along the way.
            </p>
            <ul className="chip-row">
              {chessTitles.map((season) => (
                <li key={season} className="chip chip--accent chip--mono">
                  {season}
                </li>
              ))}
            </ul>
          </div>
          <KnightsTour />
        </TiltCard>
      </Reveal>

      <Reveal delay={0.1} className="featured__cell">
        <TiltCard className="feat-card" max={6}>
          <span className="mono-label">Hack-A-Thon · 2023</span>
          <p className="feat-card__big">
            1<sup>st</sup>
          </p>
          <h3 className="feat-card__subtitle">place, with InSoul</h3>
          <p className="feat-card__body">A LiDAR foot scan that designs custom insoles for flat feet and high arches.</p>
        </TiltCard>
      </Reveal>

      <Reveal delay={0.18} className="featured__cell">
        <TiltCard className="feat-card" max={6}>
          <span className="mono-label">College Board · 2023</span>
          <p className="feat-card__big">
            3.5<span>+</span>
          </p>
          <h3 className="feat-card__subtitle">AP Scholar with Distinction</h3>
          <p className="feat-card__body">Average of 3.5 or higher across every AP exam, with 3+ on five or more.</p>
        </TiltCard>
      </Reveal>

      <Reveal delay={0.26} className="featured__cell">
        <TiltCard className="feat-card" max={6}>
          <span className="mono-label">Innerview · 2022</span>
          <p className="feat-card__big">
            <Counter value={100} />
            <span>hrs</span>
          </p>
          <h3 className="feat-card__subtitle">of volunteer service</h3>
          <p className="feat-card__body">Recognized with an Ambassador Award for 100 hours of community service.</p>
        </TiltCard>
      </Reveal>
    </section>
  );
}

function AwardCard({ award }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
    >
      <TiltCard className="award" max={5}>
        <div className="award__top">
          <span className="chip chip--mono">{award.category}</span>
          <span className="mono-label">{formatMonth(award.date)}</span>
        </div>
        <h3 className="award__title">{award.title}</h3>
        <p className="award__issuer">{award.issuer}</p>
        <p className="award__desc">{award.description}</p>
      </TiltCard>
    </motion.li>
  );
}

function AllAwards() {
  const [category, setCategory] = useState('All');
  const sorted = [...awards].sort((a, b) => b.date.localeCompare(a.date));
  const visible = category === 'All' ? sorted : sorted.filter((a) => a.category === category);

  const years = [];
  for (const award of visible) {
    const year = award.date.slice(0, 4);
    const group = years.find((g) => g.year === year);
    if (group) group.items.push(award);
    else years.push({ year, items: [award] });
  }

  const count = (c) => (c === 'All' ? awards.length : awards.filter((a) => a.category === c).length);

  return (
    <section className="section container all-awards">
      <div className="all-awards__head">
        <RevealTitle as="h2" className="section-title" text="Every *honor*" />
        <Reveal className="chip-row" delay={0.15} role="group" aria-label="Filter by category">
          {['All', ...awardCategories].map((c) => (
            <button
              key={c}
              type="button"
              className="chip"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c} <span className="chip__count">{count(c)}</span>
            </button>
          ))}
        </Reveal>
      </div>

      <div className="years">
        <AnimatePresence mode="popLayout">
          {years.map(({ year, items }) => (
            <motion.div
              key={year}
              layout
              className="year"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="year__label">
                <span>{year}</span>
              </div>
              <ul className="year__items">
                <AnimatePresence mode="popLayout">
                  {items.map((award) => (
                    <AwardCard key={`${award.title}-${award.date}`} award={award} />
                  ))}
                </AnimatePresence>
              </ul>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function CertificateCard({ cert }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="certs__cell"
    >
      <TiltCard className="cert" max={5}>
        <BloomMark className="cert__seal" />
        <p className="cert__issuer mono-label">{cert.issuer}</p>
        <h3 className="cert__title">{cert.title}</h3>
        <p className="cert__date">Issued {formatMonth(cert.date)}</p>
        {cert.description && <p className="cert__desc">{cert.description}</p>}
        {cert.credentialId && (
          <p className="cert__id">
            <span className="mono-label">Credential ID</span> {cert.credentialId}
          </p>
        )}
        {cert.skills?.length > 0 && (
          <ul className="chip-row">
            {cert.skills.map((skill) => (
              <li key={skill} className="chip">
                {skill}
              </li>
            ))}
          </ul>
        )}
        {cert.url && (
          <a className="cert__link" href={cert.url} target="_blank" rel="noreferrer">
            Show credential <ArrowUpRight />
          </a>
        )}
      </TiltCard>
    </motion.li>
  );
}

function Certificates() {
  const [issuer, setIssuer] = useState('All');
  // Stable sort: certificates from the same month keep their order in the data file.
  const sorted = [...certificates].sort((a, b) => b.date.localeCompare(a.date));
  const issuers = [...new Set(sorted.map((c) => c.issuer))];
  const visible = issuer === 'All' ? sorted : sorted.filter((c) => c.issuer === issuer);
  const count = (name) => (name === 'All' ? sorted.length : sorted.filter((c) => c.issuer === name).length);

  return (
    <section className="section container certs" aria-label="Certificates">
      <div className="certs__head">
        <div className="certs__title">
          <Reveal>
            <span className="mono-label">Licenses & certifications</span>
          </Reveal>
          <RevealTitle as="h2" className="section-title" text="*Certificates*" />
        </div>
        {issuers.length > 1 && (
          <Reveal className="chip-row" delay={0.15} role="group" aria-label="Filter by issuer">
            {['All', ...issuers].map((name) => (
              <button
                key={name}
                type="button"
                className="chip"
                aria-pressed={issuer === name}
                onClick={() => setIssuer(name)}
              >
                {name.split(' — ')[0]} <span className="chip__count">{count(name)}</span>
              </button>
            ))}
          </Reveal>
        )}
      </div>
      <Reveal>
        <motion.ul layout className="certs__grid">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((cert) => (
              <CertificateCard key={`${cert.title}-${cert.date}`} cert={cert} />
            ))}
          </AnimatePresence>
        </motion.ul>
      </Reveal>
    </section>
  );
}

export default function Achievements() {
  return (
    <PageTransition label="Certificates & Awards">
      <PageHeader index="02" label="Certificates & Awards" title="Certificates *& awards*" />
      <Certificates />
      <Featured />
      <AllAwards />
    </PageTransition>
  );
}
