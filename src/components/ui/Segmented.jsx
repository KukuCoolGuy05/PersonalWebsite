import { motion } from 'motion/react';

// Pill-shaped option group with a thumb that slides between choices.
// options: [{ value, label, count? }]
export default function Segmented({ id, options, value, onChange, label }) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`segmented__btn${value === opt.value ? ' is-active' : ''}`}
          aria-pressed={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {value === opt.value && (
            <motion.span
              layoutId={`${id}-thumb`}
              className="segmented__thumb"
              transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            />
          )}
          <span className="segmented__label">
            {opt.label}
            {opt.count !== undefined && <span className="chip__count"> {opt.count}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
