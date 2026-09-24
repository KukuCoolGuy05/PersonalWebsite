import { useEffect, useRef } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react';
import { ArrowDown } from 'lucide-react';
import BloomMark from '../ui/BloomMark';
import InlineText from '../ui/InlineText';
import { Magnetic } from '../motion/Interactive';
import { EASE_OUT } from '../motion/Reveal';
import { profile } from '../../data/profile';
import { useScrollTo } from '../../lib/hooks';
import { useReduceMotion } from '../../lib/motionPref';

// Entrance timing: the page-transition curtain lifts at ~0.9s.
const START = 0.85;

// Variable-font weights for the "pressure" name: heavy at rest, thinned by the cursor.
const REST = 780;
const THIN = 180;

function PressureLetter({ char, pointer, active, radius, index, delay }) {
  const ref = useRef(null);
  const center = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      center.current = { x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 };
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Read every motion value up front: Motion subscribes to whatever the first run reads.
  const target = useTransform(() => {
    const on = active.get();
    const x = pointer.x.get();
    const y = pointer.y.get();
    const r = radius.get();
    if (!on) return REST;
    const t = Math.max(0, 1 - Math.hypot(x - center.current.x, y - center.current.y) / r);
    return REST - (REST - THIN) * t * t;
  });
  const fontWeight = useSpring(target, { stiffness: 170, damping: 22, mass: 0.6 });

  return (
    <motion.span
      ref={ref}
      className="pressure__char"
      style={{ fontWeight }}
      initial={{ y: '112%' }}
      animate={{ y: '0%' }}
      transition={{ duration: 1.05, ease: EASE_OUT, delay: delay + index * 0.045 }}
    >
      {char}
    </motion.span>
  );
}

function PressureName({ first, last }) {
  const ref = useRef(null);
  const reduce = useReduceMotion();
  const pointer = { x: useMotionValue(-9999), y: useMotionValue(-9999) };
  const active = useMotionValue(0);
  const radius = useMotionValue(200);
  const wave = useRef(null);

  // Track the pointer relative to the heading (listening on the whole hero).
  useEffect(() => {
    const el = ref.current;
    const hero = el?.closest('.hero');
    if (!hero || reduce) return undefined;

    const setRadius = () => radius.set(parseFloat(getComputedStyle(el).fontSize) * 1.15);
    setRadius();
    window.addEventListener('resize', setRadius);

    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return;
      wave.current?.stop();
      const rect = el.getBoundingClientRect();
      pointer.x.set(e.clientX - rect.left);
      pointer.y.set(e.clientY - rect.top);
      active.set(1);
    };
    const onLeave = () => active.set(0);
    hero.addEventListener('pointermove', onMove);
    hero.addEventListener('pointerleave', onLeave);

    // One slow "breath" across the name after it lands — works on touch screens too.
    const timer = setTimeout(() => {
      const rect = el.getBoundingClientRect();
      pointer.y.set(rect.height / 2);
      active.set(1);
      wave.current = animate(pointer.x, [-radius.get(), rect.width + radius.get()], {
        duration: 2.4,
        ease: 'easeInOut',
        onComplete: () => active.set(0),
      });
    }, (START + 1.1) * 1000);

    return () => {
      clearTimeout(timer);
      wave.current?.stop();
      window.removeEventListener('resize', setRadius);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
    // Motion values are stable for the component's lifetime, so only `reduce` matters here.
  }, [reduce]);

  const letters = (word, offset) =>
    [...word].map((char, i) => (
      <PressureLetter
        key={i}
        char={char}
        index={i + offset}
        delay={START}
        pointer={pointer}
        active={active}
        radius={radius}
      />
    ));

  return (
    <h1 ref={ref} className="hero__name">
      <span className="sr-only">
        {first} {last}
      </span>
      <span className="hero__line" aria-hidden="true">
        {letters(first.toUpperCase(), 0)}
        <motion.span
          className="hero__bloom-wrap"
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.3, ease: EASE_OUT, delay: START + 0.35 }}
        >
          <HeroBloom />
        </motion.span>
      </span>
      <span className="hero__line hero__line--2" aria-hidden="true">
        {letters(last.toUpperCase(), first.length)}
      </span>
    </h1>
  );
}

// The big bloom spins with scroll and drifts on its own.
function HeroBloom() {
  const { scrollY } = useScroll();
  const spin = useTransform(scrollY, [0, 1200], [0, 240]);
  const rotate = useSpring(spin, { stiffness: 80, damping: 20 });
  return (
    <motion.span className="hero__bloom" style={{ rotate }}>
      <BloomMark />
    </motion.span>
  );
}

function Definition() {
  return (
    <motion.aside
      className="definition"
      initial={{ opacity: 0, y: 20, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: 2.5 }}
      transition={{ duration: 1, ease: EASE_OUT, delay: START + 1 }}
      aria-label="What does Kurinji mean?"
    >
      <p className="definition__word">
        Kurinji <span>/ku·rin·ji/ · noun</span>
      </p>
      <ol>
        <li>A mountain flower that blooms only once every twelve years.</li>
        <li>An engineer who ships a little more often than that.</li>
      </ol>
    </motion.aside>
  );
}

const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, ease: EASE_OUT, delay },
});

export default function Hero() {
  const ref = useRef(null);
  const reduce = useReduceMotion();
  const scrollTo = useScrollTo();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  // Soft glow that trails the cursor.
  const glowX = useSpring(70, { stiffness: 40, damping: 18 });
  const glowY = useSpring(30, { stiffness: 40, damping: 18 });
  const left = useTransform(glowX, (v) => `${v}%`);
  const top = useTransform(glowY, (v) => `${v}%`);

  const onPointerMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    glowX.set(((e.clientX - rect.left) / rect.width) * 100);
    glowY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  return (
    <section ref={ref} className="hero" onPointerMove={reduce ? undefined : onPointerMove}>
      <motion.div className="hero__glow" style={{ left, top }} aria-hidden="true" />
      <Definition />
      <motion.div className="container hero__inner" style={reduce ? undefined : { y, opacity }}>
        <motion.p className="hero__eyebrow" {...fadeUp(START + 0.2)}>
          <BloomMark className="hero__eyebrow-mark" />
          {profile.role}
        </motion.p>

        <PressureName first={profile.firstName} last={profile.lastName} />

        <div className="hero__row">
          <motion.p className="hero__tagline" {...fadeUp(START + 0.75)}>
            <InlineText text={profile.tagline} />
          </motion.p>
          <motion.div className="hero__side" {...fadeUp(START + 0.9)}>
            <p className="hero__intro">{profile.intro}</p>
            <div className="hero__ctas">
              <Magnetic>
                <a
                  href="#projects"
                  className="btn btn--primary"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo('projects');
                  }}
                >
                  Explore my projects <ArrowDown className="icon-arrow-d" />
                </a>
              </Magnetic>
              <a
                href="#contact"
                className="btn btn--ghost"
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo('contact');
                }}
              >
                Say hello
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
