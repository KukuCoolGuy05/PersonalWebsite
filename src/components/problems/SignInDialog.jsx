import { useState } from 'react';
import BloomMark from '../ui/BloomMark';
import Modal from '../ui/Modal';

// Email + password sign-in for the site owner (Supabase Auth).
export default function SignInDialog({ onSignIn, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSignIn(email.trim(), password);
      onClose();
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Try again.');
      setBusy(false);
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="signin-title" className="signin">
      <form onSubmit={submit}>
        <BloomMark className="signin__mark" />
        <h2 id="signin-title" className="signin__title">
          Owner sign-in
        </h2>
        <p className="signin__body">Only the site owner can add or edit problems. Everyone else can browse and search.</p>
        <label className="field">
          <span className="field__label">Email</span>
          <input
            className="input"
            type="email"
            autoComplete="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          <span className="field__label">Password</span>
          <input
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="pform__error" role="alert">
            {error}
          </p>
        )}
        <div className="signin__actions">
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--accent btn--sm" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
