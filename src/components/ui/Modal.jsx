import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { useScrollLock } from '../../lib/hooks';
import { EASE_OUT } from '../motion/Reveal';
import './ui.css';

// Stack of open modals — only the top one reacts to Escape / Tab.
const openModals = [];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapFocus(event, root) {
  const nodes = [...root.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || active === root)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

const PANEL_MOTION = {
  center: {
    initial: { opacity: 0, y: 40, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 24, scale: 0.98 },
    transition: { duration: 0.5, ease: EASE_OUT },
  },
  drawer: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] },
  },
};

// Render inside <AnimatePresence> so the exit animation plays.
export default function Modal({ onClose, labelledBy, variant = 'center', className = '', children }) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useScrollLock(true);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const token = {};
    openModals.push(token);
    const previous = document.activeElement;
    // Respect an autofocused field inside; otherwise focus the dialog itself.
    if (!panelRef.current?.contains(document.activeElement)) panelRef.current?.focus({ preventScroll: true });

    const onKey = (event) => {
      if (openModals[openModals.length - 1] !== token) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
      } else if (event.key === 'Tab') {
        trapFocus(event, panelRef.current);
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      openModals.splice(openModals.indexOf(token), 1);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  // Portaled to <body> so fixed positioning isn't trapped by transformed ancestors
  // (e.g. a confirm dialog opened from inside another modal).
  return createPortal(
    <motion.div
      className={`modal modal--${variant}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="modal__scrim" onClick={() => onCloseRef.current()} aria-hidden="true" />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`modal__panel ${className}`}
        data-lenis-prevent
        {...PANEL_MOTION[variant]}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}

// Small "are you sure?" dialog.
export function ConfirmDialog({ title, body, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }) {
  return (
    <Modal onClose={onCancel} labelledBy="confirm-title" className="confirm">
      <h2 id="confirm-title" className="confirm__title">
        {title}
      </h2>
      {body && <p className="confirm__body">{body}</p>}
      <div className="confirm__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn btn--sm ${danger ? 'btn--danger' : 'btn--primary'}`}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
