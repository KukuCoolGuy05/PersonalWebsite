import { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';
import { profile } from '../../data/profile';
import { experience } from '../../data/experience';
import { SectionHead } from '../layout/Headings';
import { TiltCard } from '../motion/Interactive';
import { Reveal, EASE_OUT } from '../motion/Reveal';
import ScrollWords from '../motion/ScrollWords';
import { formatRange } from '../../lib/text';

export function About() {
  return (
    <section className="section about" id="about">
      <div className="container">
        <Reveal className="section-head__meta about__meta">
          <span className="mono-label">00 — About</span>
        </Reveal>
        <ScrollWords className="about__text" text={profile.about} />
      </div>
    </section>
  );
}

function TimelineItem({ job, index, total, progress }) {
  const threshold = (index + 0.25) / total;
  const lit = useSpring(useTransform(progress, (v) => (v >= threshold ? 1 : 0)), { stiffness: 300, damping: 25 });
  const range = formatRange(job.start, job.end);

  return (
    <motion.li
      className="timeline__item"
      initial={{ opacity: 0, x: -36 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, ease: EASE_OUT }}
    >
      <span className="timeline__dot" aria-hidden="true">
        <motion.span style={{ scale: lit }} />
      </span>
      <TiltCard className="timeline__card" max={4}>
        <div className="timeline__top">
          {job.logo ? (
            <span className="timeline__logo">
              <img src={job.logo} alt="" loading="lazy" />
            </span>
          ) : (
            <span className="timeline__logo timeline__logo--mono" aria-hidden="true">
              {job.monogram ?? job.org[0]}
            </span>
          )}
          <div>
            <h3 className="timeline__role">{job.role}</h3>
            <p className="timeline__org">
              {job.org}
              {job.type && ` · ${job.type}`}
            </p>
          </div>
          {(range || job.location) && (
            <div className="timeline__when">
              {range && <span className="mono-label">{range}</span>}
              {job.location && <span className="timeline__place">{job.location}</span>}
            </div>
          )}
        </div>
        <p className="timeline__desc">{job.description}</p>
        <ul className="chip-row">
          {job.skills.map((skill) => (
            <li key={skill} className="chip">
              {skill}
            </li>
          ))}
        </ul>
      </TiltCard>
    </motion.li>
  );
}

// Newest first by end date (ongoing roles on top); undated entries keep their order at the end.
const sortKey = (job) => (job.end === 'Present' ? '9999-12' : job.end || job.start || '');
const timeline = [...experience].sort(
  (a, b) => sortKey(b).localeCompare(sortKey(a)) || (b.start || '').localeCompare(a.start || '')
);

export function Experience() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 75%', 'end 55%'] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <section className="section experience" id="experience">
      <div className="container">
        <SectionHead index="02" label="Experience" title="Where I’ve *worked* & taught" />
        <div ref={ref} className="timeline">
          <div className="timeline__rail" aria-hidden="true">
            <motion.div className="timeline__line" style={{ scaleY: line }} />
          </div>
          <ol className="timeline__list">
            {timeline.map((job, i) => (
              <TimelineItem
                key={`${job.org}-${job.role}`}
                job={job}
                index={i}
                total={timeline.length}
                progress={scrollYProgress}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
