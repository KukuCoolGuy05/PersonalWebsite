import { useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';

// Shown to a signed-in account that isn't on the admins list yet, with the exact
// SQL that grants it edit access.
export default function AccessBanner({ user, onRecheck }) {
  const sql = `insert into public.admins (user_id) values ('${user.id}');`;
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [stillNo, setStillNo] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked — the SQL is still selectable on the page.
    }
  };

  const recheck = async () => {
    setChecking(true);
    const ok = await onRecheck();
    setChecking(false);
    setStillNo(!ok);
  };

  return (
    <div className="pbanner pbanner--access" role="status">
      <div className="pbanner__text">
        <p>
          <strong>Signed in as {user.email}, but this account can’t edit yet.</strong>
        </p>
        <p>
          To give it access, run this once in Supabase → SQL Editor, then click <em>Check again</em>:
        </p>
        <code className="pbanner__sql">{sql}</code>
        {stillNo && <p className="field__error">Still no access. Check that the SQL ran without an error.</p>}
      </div>
      <div className="pbanner__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
          {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy SQL'}
        </button>
        <button type="button" className="btn btn--accent btn--sm" onClick={recheck} disabled={checking}>
          <RotateCcw /> {checking ? 'Checking…' : 'Check again'}
        </button>
      </div>
    </div>
  );
}
