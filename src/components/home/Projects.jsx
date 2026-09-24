import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Trophy, X } from 'lucide-react';
import { projects } from '../../data/projects';
import { useMediaQuery } from '../../lib/hooks';
import { SectionHead } from '../layout/Headings';
import { Reveal, EASE_OUT } from '../motion/Reveal';
import InlineText from '../ui/InlineText';
import Modal from '../ui/Modal';
import { GitHubIcon } from '../ui/Icons';
import ProjectArt from './ProjectArt';
import { useReduceMotion } from '../../lib/motionPref';

const pad = (n) => String(n).padStart(2, '0');

function StackCard({ project, index, total, progress, sticky, onOpen }) {
  // Slot i pins at progress i/(n-1); the next card finishes covering it at (i+1)/(n-1).
  // (Ranges must stay within 0–1: Motion hands scroll-linked values to the browser's animation engine.)
  const steps = Math.max(total - 1, 1);
  const last = index === total - 1;
  // Cards further back in the stack shrink more as later cards slide over them.
  const scale = useTransform(progress, [last ? 0 : index / steps, 1], [1, 1 - (total - 1 - index) * 0.045]);
  const dim = useTransform(
    progress,
    last ? [0, 1] : [(index + 0.4) / steps, (index + 1) / steps],
    last ? [0, 0] : [0, 0.55]
  );

  const card = (
    <article className="pcard">
      <div className="pcard__info">
        <div className="pcard__meta">
          <span className="mono-label">
            {pad(index + 1)} / {pad(total)}
          </span>
          <span className="chip chip--mono">{project.type}</span>
          {project.badge && (
            <span className="chip chip--accent">
              <Trophy size={13} /> {project.badge}
            </span>
          )}
          <span className="pcard__year mono-label">{project.year}</span>
        </div>
        <h3 className="pcard__title">{project.title}</h3>
        <p className="pcard__tagline rich">
          <InlineText text={project.tagline} />
        </p>
        <p className="pcard__summary">{project.summary}</p>
        <ul className="chip-row pcard__stack" aria-label="Tech stack">
          {project.stack.slice(0, 5).map((tech) => (
            <li key={tech} className="chip chip--mono">
              {tech}
            </li>
          ))}
        </ul>
        <div className="pcard__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={() => onOpen(index)}>
            Case study <ArrowRight className="icon-arrow-r" />
          </button>
          {project.links.github && (
            <a className="btn btn--ghost btn--sm" href={project.links.github} target="_blank" rel="noreferrer">
              <GitHubIcon /> Code
            </a>
          )}
        </div>
      </div>
      <div className="pcard__art">
        <ProjectArt kind={project.art} />
      </div>
      {sticky && !last && <motion.div className="pcard__dim" style={{ opacity: dim }} aria-hidden="true" />}
    </article>
  );

  const slotId = `project-${project.id}`;

  if (!sticky) {
    return (
      <Reveal className="stack__slot" id={slotId} y={48}>
        {card}
      </Reveal>
    );
  }

  return (
    <div className="stack__slot" id={slotId}>
      <motion.div className="stack__card" style={{ scale, top: `calc(-4vh + ${index * 26}px)` }}>
        {card}
      </motion.div>
    </div>
  );
}

function ProjectStack({ onOpen }) {
  const ref = useRef(null);
  const reduce = useReduceMotion();
  const roomy = useMediaQuery('(min-width: 900px) and (min-height: 660px)');
  const sticky = roomy && !reduce;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <div ref={ref} className={`stack container${sticky ? ' stack--sticky' : ''}`}>
      {projects.map((project, i) => (
        <StackCard
          key={project.id}
          project={project}
          index={i}
          total={projects.length}
          progress={scrollYProgress}
          sticky={sticky}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

function ProjectModal({ index, onClose, onNav }) {
  const project = projects[index];

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowRight') onNav(1);
      if (e.key === 'ArrowLeft') onNav(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNav]);

  return (
    <Modal onClose={onClose} labelledBy="project-modal-title" className="pmodal">
      <div className="pmodal__bar">
        <span className="mono-label">
          {pad(index + 1)} / {pad(projects.length)} · {project.type}
        </span>
        <div className="pmodal__bar-actions">
          <button type="button" className="icon-btn" onClick={() => onNav(-1)} aria-label="Previous project">
            <ArrowLeft />
          </button>
          <button type="button" className="icon-btn" onClick={() => onNav(1)} aria-label="Next project">
            <ArrowRight />
          </button>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={project.id}
          className="pmodal__content"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: EASE_OUT }}
        >
          <div className="pmodal__art">
            <ProjectArt kind={project.art} />
          </div>
          <div className="pmodal__body">
            <div>
              <h2 id="project-modal-title" className="pmodal__title">
                {project.title}
              </h2>
              <p className="pmodal__tagline rich">
                <InlineText text={project.tagline} />
              </p>
              <p className="pmodal__summary">{project.summary}</p>
              <h3 className="mono-label pmodal__label">What I built</h3>
              <ul className="pmodal__list">
                {project.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <aside className="pmodal__aside">
              <dl className="pmodal__facts">
                <div>
                  <dt className="mono-label">Year</dt>
                  <dd>{project.year}</dd>
                </div>
                <div>
                  <dt className="mono-label">Type</dt>
                  <dd>{project.type}</dd>
                </div>
              </dl>
              <div>
                <p className="mono-label pmodal__label">Stack</p>
                <ul className="chip-row">
                  {project.stack.map((tech) => (
                    <li key={tech} className="chip chip--mono">
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
              {project.links.github && (
                <a className="btn btn--primary btn--sm" href={project.links.github} target="_blank" rel="noreferrer">
                  <GitHubIcon /> View the code <ArrowUpRight className="icon-arrow-ur" />
                </a>
              )}
            </aside>
          </div>
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
}

export default function Projects() {
  const [openIndex, setOpenIndex] = useState(null);
  const nav = useCallback((dir) => setOpenIndex((i) => (i + dir + projects.length) % projects.length), []);

  return (
    <section id="projects" className="section projects">
      <div className="container">
        <SectionHead
          index="01"
          label="Selected work"
          title="Things I’ve *built*"
          aside="AI, computer vision and physics — the covers are live, so hover, click and poke at them."
        />
      </div>
      <ProjectStack onOpen={setOpenIndex} />
      <AnimatePresence>
        {openIndex !== null && <ProjectModal index={openIndex} onClose={() => setOpenIndex(null)} onNav={nav} />}
      </AnimatePresence>
    </section>
  );
}
