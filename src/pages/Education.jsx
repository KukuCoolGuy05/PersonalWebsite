import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import PageTransition from '../components/layout/PageTransition';
import { PageHeader } from '../components/layout/Headings';
import { TiltCard } from '../components/motion/Interactive';
import Segmented from '../components/ui/Segmented';
import { Reveal, RevealTitle, EASE_OUT } from '../components/motion/Reveal';
import { courses, schools, subjects } from '../data/education';
import './pages.css';

function SchoolCard({ school, index }) {
  const years = [];
  for (let y = school.start; y <= school.end; y++) years.push(y);

  return (
    <Reveal delay={index * 0.12} className="school-cell">
      <TiltCard className="school" max={4}>
        <div className="school__top">
          <span className="school__logo">
            <img src={school.logo} alt={`${school.short} logo`} />
          </span>
          <span className="mono-label school__years">
            {school.start} – {school.end}
          </span>
        </div>
        <h2 className="school__name">{school.name}</h2>
        <p className="school__degree">{school.degree}</p>
        <p className="school__place mono-label">{school.location}</p>

        <div className="school__bar" aria-hidden="true">
          {years.slice(0, -1).map((year, i) => (
            <motion.span
              key={year}
              className="school__segment"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 + i * 0.22 }}
            />
          ))}
        </div>
        <div className="school__ticks mono-label" aria-hidden="true">
          {years.map((year) => (
            <span key={year}>{year}</span>
          ))}
        </div>

        <ul className="chip-row school__chips">
          {school.highlights.map((h) => (
            <li key={h} className="chip">
              {h}
            </li>
          ))}
        </ul>
      </TiltCard>
    </Reveal>
  );
}

function CourseCard({ course }) {
  const school = schools.find((s) => s.id === course.school);
  const name = course.code === 'AP' ? course.name.replace(/^AP /, '') : course.name;
  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="course-cell"
    >
      <TiltCard className="course" max={6}>
        <div className="course__top">
          <span className="course__code">{course.code}</span>
          <span className="mono-label">{school?.short}</span>
        </div>
        <h3 className="course__name">{name}</h3>
        <p className="course__subject mono-label">
          {course.subject}
          {course.note && <span className="course__note">{course.note}</span>}
        </p>
        <ul className="course__topics">
          {course.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </TiltCard>
    </motion.li>
  );
}

function Coursework() {
  const [school, setSchool] = useState('all');
  const [subject, setSubject] = useState('All');

  const bySchool = school === 'all' ? courses : courses.filter((c) => c.school === school);
  const visible = subject === 'All' ? bySchool : bySchool.filter((c) => c.subject === subject);

  const schoolOptions = [
    { value: 'all', label: 'All', count: courses.length },
    ...schools.map((s) => ({ value: s.id, label: s.short, count: courses.filter((c) => c.school === s.id).length })),
  ];

  return (
    <section className="section container coursework">
      <div className="coursework__head">
        <div>
          <Reveal>
            <span className="mono-label">Coursework</span>
          </Reveal>
          <RevealTitle as="h2" className="section-title" text="Classes that *shaped* me" />
        </div>
        <Reveal className="coursework__filters" delay={0.15}>
          <Segmented id="school" label="Filter by school" options={schoolOptions} value={school} onChange={setSchool} />
          <div className="chip-row" role="group" aria-label="Filter by subject">
            {['All', ...subjects].map((s) => {
              const n = s === 'All' ? bySchool.length : bySchool.filter((c) => c.subject === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  aria-pressed={subject === s}
                  onClick={() => setSubject(s)}
                  disabled={n === 0 && subject !== s}
                >
                  {s} <span className="chip__count">{n}</span>
                </button>
              );
            })}
          </div>
        </Reveal>
      </div>

      <LayoutGroup>
        <motion.ul layout className="course-grid">
          <AnimatePresence mode="popLayout">
            {visible.map((course) => (
              <CourseCard key={`${course.school}-${course.name}`} course={course} />
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
      {visible.length === 0 && <p className="empty-note">No {subject.toLowerCase()} courses here yet.</p>}
    </section>
  );
}

export default function Education() {
  return (
    <PageTransition label="Education">
      <PageHeader index="03" label="Education" title="Classes *& education*" />
      <section className="container schools" aria-label="Schools">
        {schools.map((school, i) => (
          <SchoolCard key={school.id} school={school} index={i} />
        ))}
      </section>
      <Coursework />
    </PageTransition>
  );
}
