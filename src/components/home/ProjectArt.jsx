import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { useCssVars, usePrefersHover } from '../../lib/hooks';
import { EASE_OUT } from '../motion/Reveal';
import { useReduceMotion } from '../../lib/motionPref';
import './ProjectArt.css';

// Animated, mostly interactive "cover art" for each featured project.
export default function ProjectArt({ kind }) {
  switch (kind) {
    case 'kalvi':
      return <KalviArt />;
    case 'sign':
      return <SignArt />;
    case 'field':
      return <FieldArt />;
    default:
      return <div className="art" />;
  }
}

// Advances an elapsed-time counter while `running`; `speed` scales time.
function useClock(running, speed = 1, tick = 50) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setElapsed((e) => e + tick * speed), tick);
    return () => clearInterval(id);
  }, [running, speed, tick]);
  return [elapsed, setElapsed];
}

/* ─────────────────────────────────────────────────────────────
   Kalvi — a tutor conversation that adapts as it goes
   ───────────────────────────────────────────────────────────── */
const KALVI_START = { visual: 0.4, confusion: 0.8, mastery: 0.15 };
const KALVI_SCRIPT = [
  {
    learner: 'why is recursion so confusing 😵',
    tutor: 'Let’s draw it instead — every call is a box inside a box, and the innermost one answers first.',
    profile: { visual: 0.82, confusion: 0.4, mastery: 0.3 },
    note: 'Switched to visual explanations',
  },
  {
    learner: 'ohh, so it unwinds like nesting dolls?',
    tutor: 'Exactly! Want a two-minute exercise to lock it in?',
    profile: { visual: 0.86, confusion: 0.15, mastery: 0.56 },
    note: 'Confusion dropping',
  },
  {
    learner: 'yes, give me one!',
    tutor: 'Reverse a string recursively. I’ll check back with you in 3 days.',
    profile: { visual: 0.86, confusion: 0.08, mastery: 0.72 },
    note: 'Review scheduled · 3 days',
  },
];
const TYPE_AT = 1700;
const PER_CHAR = 24;

function KalviArt() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReduceMotion();
  const [step, setStep] = useState(0);
  const [looped, setLooped] = useState(false);
  const [a11y, setA11y] = useState(false);
  const [elapsed, setElapsed] = useClock(inView && !reduce);

  const current = KALVI_SCRIPT[step];
  const doneAt = TYPE_AT + current.tutor.length * PER_CHAR;
  // The previous exchange stays above, faded, so it reads like a real conversation.
  const history = step > 0 || looped ? KALVI_SCRIPT[(step + KALVI_SCRIPT.length - 1) % KALVI_SCRIPT.length] : null;

  useEffect(() => {
    if (elapsed >= doneAt + 2800) {
      if (step === KALVI_SCRIPT.length - 1) setLooped(true);
      setStep((s) => (s + 1) % KALVI_SCRIPT.length);
      setElapsed(0);
    }
  }, [elapsed, doneAt, step, setElapsed]);

  const settled = reduce || elapsed >= doneAt;
  const typing = !reduce && elapsed >= 800 && elapsed < TYPE_AT;
  const typed = reduce ? current.tutor.length : Math.max(0, Math.floor((elapsed - TYPE_AT) / PER_CHAR));
  const previous = step === 0 ? KALVI_START : KALVI_SCRIPT[step - 1].profile;
  const profile = settled ? current.profile : previous;

  return (
    <div ref={ref} className={`art art--kalvi${a11y ? ' is-a11y' : ''}`}>
      <div className="kalvi__head">
        <span className="kalvi__dot" />
        <span className="kalvi__name">Kalvi</span>
        <span className="kalvi__status">adapting to you</span>
        <button
          type="button"
          className={`kalvi__a11y${a11y ? ' is-on' : ''}`}
          onClick={() => setA11y((v) => !v)}
          aria-pressed={a11y}
          title="Toggle dyslexia-friendly spacing"
        >
          Aa
        </button>
      </div>

      <div className="kalvi__chat">
        <AnimatePresence mode="popLayout">
          {history && (
            <motion.div
              key={`h${step}`}
              className="kalvi__history"
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              aria-hidden="true"
            >
              <p className="kalvi__bubble kalvi__bubble--me">{history.learner}</p>
              <p className="kalvi__bubble kalvi__bubble--ai">{history.tutor}</p>
            </motion.div>
          )}
          <motion.p
            key={`l${step}`}
            className="kalvi__bubble kalvi__bubble--me"
            initial={{ opacity: 0, y: 14, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            {current.learner}
          </motion.p>
          {typing && (
            <motion.p
              key={`t${step}`}
              className="kalvi__bubble kalvi__typing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-label="Kalvi is typing"
            >
              <span />
              <span />
              <span />
            </motion.p>
          )}
          {typed > 0 && (
            <motion.p
              key={`k${step}`}
              className="kalvi__bubble kalvi__bubble--ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              {current.tutor.slice(0, typed)}
              {!settled && <span className="kalvi__caret" />}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="kalvi__profile">
        <div className="kalvi__profile-head">
          <span>Learner profile</span>
          <AnimatePresence mode="wait">
            {settled && (
              <motion.span
                key={step}
                className="kalvi__note"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                ✦ {current.note}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {[
          ['Visual', profile.visual],
          ['Confusion', profile.confusion],
          ['Mastery', profile.mastery],
        ].map(([label, value]) => (
          <div key={label} className="kalvi__meter">
            <span>{label}</span>
            <div className="kalvi__track">
              <motion.div
                className={`kalvi__fill${label === 'Confusion' ? ' is-warn' : ''}`}
                animate={{ width: `${value * 100}%` }}
                transition={{ duration: 0.9, ease: EASE_OUT }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Sign Language Reader — detection box + hold-to-commit ring spelling words
   ───────────────────────────────────────────────────────────── */
// [thumb, index, middle, ring, pinky] — 1 = extended.
const HANDSHAPES = {
  B: [0, 1, 1, 1, 1],
  U: [0, 1, 1, 0, 0],
  I: [0, 0, 0, 0, 1],
  L: [1, 1, 0, 0, 0],
  D: [0, 1, 0, 0, 0],
  W: [0, 1, 1, 1, 0],
  F: [0, 0, 1, 1, 1],
  Y: [1, 0, 0, 0, 1],
  space: [1, 1, 1, 1, 1],
};
const SIGN_EVENTS = ['B', 'U', 'I', 'L', 'D', 'space', 'W', 'I', 'L', 'D', 'space', 'F', 'L', 'Y', 'space'];
const HOLD_MS = 1150;
const FINGERS = [
  { x: 36, long: 42 },
  { x: 48, long: 48 },
  { x: 60, long: 44 },
  { x: 72, long: 34 },
];

function spellUpTo(index) {
  const sentence = [];
  let word = '';
  for (const ev of SIGN_EVENTS.slice(0, index)) {
    if (ev === 'space') {
      if (word) sentence.push(word);
      word = '';
    } else {
      word += ev;
    }
  }
  return { sentence, word };
}

function SignArt() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduce = useReduceMotion();
  const [hover, setHover] = useState(false);
  const [elapsed] = useClock(inView && !reduce, hover ? 1.8 : 1);

  const total = SIGN_EVENTS.length;
  const index = reduce ? 4 : Math.floor(elapsed / HOLD_MS) % total;
  const progress = reduce ? 0.7 : (elapsed % HOLD_MS) / HOLD_MS;
  const label = SIGN_EVENTS[index];
  const shape = HANDSHAPES[label];
  const { sentence, word } = spellUpTo(index);
  const confidence = (0.9 + ((index * 37) % 9) / 100).toFixed(2);
  const jitter = reduce ? 0 : Math.sin(elapsed / 170) * 1.5;

  const ringLength = 2 * Math.PI * 15;

  return (
    <div
      ref={ref}
      className="art art--sign"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <svg viewBox="0 0 320 210" className="sign__view" aria-hidden="true">
        {/* viewfinder corners */}
        {[
          'M14 34 V14 H34',
          'M286 14 H306 V34',
          'M14 176 V196 H34',
          'M286 196 H306 V176',
        ].map((d) => (
          <path key={d} d={d} className="sign__corner" />
        ))}
        <circle cx="26" cy="26" r="3.5" className="sign__rec" />
        <text x="35" y="29.5" className="sign__hud">
          LIVE
        </text>
        <text x="306" y="52" textAnchor="end" className="sign__hud">
          YOLOv8 · 30 FPS
        </text>

        {/* the hand */}
        <g transform="translate(110 38)">
          {FINGERS.map((f, i) => {
            const up = shape[i + 1];
            const h = up ? f.long : 16;
            return (
              <motion.rect
                key={f.x}
                x={f.x - 5.5}
                width="11"
                rx="5.5"
                className="sign__finger"
                initial={false}
                animate={{ y: 78 - h, height: h }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              />
            );
          })}
          <motion.rect
            x="17"
            y="84"
            width="12"
            height="34"
            rx="6"
            className="sign__finger"
            style={{ originX: 0.5, originY: 1 }}
            initial={false}
            animate={{ rotate: shape[0] ? -38 : 42, scaleY: shape[0] ? 1 : 0.62 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          />
          <rect x="30" y="72" width="54" height="52" rx="16" className="sign__palm" />
        </g>

        {/* detection box + label */}
        <g transform={`translate(${jitter} ${-jitter * 0.6})`}>
          <rect x="120" y="58" width="116" height="118" rx="8" className="sign__box" />
          <rect x="120" y="40" width={label === 'space' ? 84 : 62} height="18" rx="4" className="sign__tag" />
          <text x="127" y="53" className="sign__tag-text">
            {label} {confidence}
          </text>
        </g>

        {/* hold-to-commit ring */}
        <g transform="translate(272 100)">
          <circle r="15" className="sign__ring-track" />
          <circle
            r="15"
            className="sign__ring"
            strokeDasharray={ringLength}
            strokeDashoffset={ringLength * (1 - progress)}
            transform="rotate(-90)"
          />
          <text y="5" textAnchor="middle" className="sign__ring-text">
            {label === 'space' ? '␣' : label}
          </text>
        </g>
      </svg>

      <div className="sign__panel">
        <div>
          <span className="sign__panel-label">Word</span>
          <span className="sign__word">
            {word || '…'}
            <span className="sign__cursor" />
          </span>
        </div>
        <div className="sign__sentence">
          <span className="sign__panel-label">Sentence</span>
          <span>{sentence.length ? sentence.join(' ') : '…'}</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Physics 3D — live field lines; your cursor is a charge
   ───────────────────────────────────────────────────────────── */
function FieldArt() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const inView = useInView(wrapRef, { amount: 0.15 });
  const reduce = useReduceMotion();
  const colors = useCssVars(['--accent', '--text', '--text-3']);
  const probe = useRef({ x: 0.5, y: 0.3, hover: false, sign: 1 });
  const [sign, setSign] = useState(1);
  const canHover = usePrefersHover();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let raf = 0;
    const started = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const draw = (now) => {
      const time = (now - started) / 1000;
      const p = probe.current;
      const charges = [
        { x: width * 0.3, y: height * 0.56, q: 1 },
        { x: width * 0.7, y: height * 0.56, q: -1 },
        p.hover
          ? { x: p.x * width, y: p.y * height, q: 0.75 * p.sign, probe: true }
          : {
              x: width * 0.5 + Math.cos(time * 0.55) * width * 0.3,
              y: height * 0.52 + Math.sin(time * 0.55) * height * 0.32,
              q: 0.75 * p.sign,
              probe: true,
            },
      ];

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = colors['--accent'];

      for (const c of charges) {
        if (c.q <= 0) continue;
        const count = c.probe ? 12 : 20;
        for (let k = 0; k < count; k++) {
          const angle = (k / count) * Math.PI * 2 + (c.probe ? time * 0.4 : 0.08);
          let x = c.x + Math.cos(angle) * 7;
          let y = c.y + Math.sin(angle) * 7;
          ctx.globalAlpha = c.probe ? 0.45 : 0.75;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let s = 0; s < 280; s++) {
            let ex = 0;
            let ey = 0;
            let sink = false;
            for (const o of charges) {
              const dx = x - o.x;
              const dy = y - o.y;
              const r2 = dx * dx + dy * dy;
              if (o.q < 0 && r2 < 49) {
                sink = true;
                break;
              }
              const inv = o.q / (r2 * Math.sqrt(r2) + 1e-6);
              ex += dx * inv;
              ey += dy * inv;
            }
            if (sink) break;
            const mag = Math.hypot(ex, ey) || 1;
            x += (ex / mag) * 3.2;
            y += (ey / mag) * 3.2;
            if (x < -12 || x > width + 12 || y < -12 || y > height + 12) break;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      ctx.globalAlpha = 1;
      for (const c of charges) {
        const positive = c.q > 0;
        const r = c.probe ? 7 : 11;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r + 8, 0, Math.PI * 2);
        ctx.fillStyle = positive ? colors['--accent'] : colors['--text-3'];
        ctx.globalAlpha = 0.16;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = positive ? '#fff' : colors['--text'];
        ctx.font = `600 ${c.probe ? 10 : 13}px "Geist Mono Variable", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(positive ? '+' : '−', c.x, c.y + 0.5);
      }

      if (inView && !reduce) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [colors, inView, reduce]);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    Object.assign(probe.current, {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      hover: e.pointerType === 'mouse',
    });
  };

  const flip = () => {
    probe.current.sign *= -1;
    setSign(probe.current.sign);
  };

  return (
    <div
      ref={wrapRef}
      className="art art--field"
      onPointerMove={onMove}
      onPointerLeave={() => {
        probe.current.hover = false;
      }}
      onClick={flip}
    >
      <canvas ref={canvasRef} className="field__canvas" aria-hidden="true" />
      <div className="field__hud">
        <span>E = kq / r²</span>
        <span>
          probe {sign > 0 ? '+' : '−'}q · {canHover ? 'move to steer · click to flip' : 'tap to flip'}
        </span>
      </div>
    </div>
  );
}
