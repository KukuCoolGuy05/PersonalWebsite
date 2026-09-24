import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Trash2, X } from 'lucide-react';
import { describeError } from '../../lib/problemsApi';
import { MAX_TAG_LENGTH, TAG_COLORS, normalizeTagName, suggestHue, validateTagName } from '../../lib/tags';
import { EASE_OUT } from '../motion/Reveal';
import Modal from '../ui/Modal';
import { TagChip } from './ProblemParts';

const plural = (n) => `${n} problem${n === 1 ? '' : 's'}`;

// Create tags (name, color, description) and delete ones no problem uses.
export default function TagManager({ tags, unavailable, onCreate, onDelete, onClose }) {
  const [name, setName] = useState('');
  const [picked, setPicked] = useState(null); // null = use the suggested color
  const [description, setDescription] = useState('');
  const [error, setError] = useState(''); // about the new-tag form
  const [listError, setListError] = useState(''); // about deleting
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const suggested = useMemo(() => suggestHue(tags), [tags]);
  const hue = picked ?? suggested;
  const clean = normalizeTagName(name);

  const submit = async (event) => {
    event.preventDefault();
    const problem = validateTagName(clean, tags);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onCreate({ name: clean, hue, description: description.trim() });
      setName('');
      setDescription('');
      setPicked(null);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (tag) => {
    if (tag.count > 0) {
      setListError(`“${tag.name}” is on ${plural(tag.count)} — remove it from those first.`);
      return;
    }
    setDeleting(tag.name);
    setListError('');
    try {
      await onDelete(tag.name);
    } catch (err) {
      setListError(describeError(err));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="tags-title" className="tagman">
      <header className="tagman__head">
        <div>
          <p className="mono-label">Coding problems</p>
          <h2 id="tags-title" className="tagman__title">
            Tags
          </h2>
        </div>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
          <X />
        </button>
      </header>

      {unavailable ? (
        <p className="tagman__notice" role="status">
          Creating tags needs the new <code className="inline-code">tags</code> table. Run the latest{' '}
          <code className="inline-code">supabase/schema.sql</code> in Supabase → SQL Editor, then reload this page.
        </p>
      ) : (
        <form className="tagman__form" onSubmit={submit} noValidate>
          <label className="field">
            <span className="field__label">New tag</span>
            <input
              className="input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Two Pointers"
              maxLength={MAX_TAG_LENGTH}
              autoFocus
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={error ? 'tag-error' : undefined}
            />
          </label>

          <div className="field">
            <span className="field__label" id="tag-color-label">
              Color
            </span>
            <div className="swatches" role="radiogroup" aria-labelledby="tag-color-label">
              {TAG_COLORS.map((color) => (
                <button
                  key={color.hue}
                  type="button"
                  role="radio"
                  aria-checked={hue === color.hue}
                  aria-label={color.name}
                  title={color.name}
                  className="swatch"
                  style={{ '--h': color.hue }}
                  onClick={() => setPicked(color.hue)}
                />
              ))}
            </div>
          </div>

          <label className="field">
            <span className="field__label">
              Description <span className="field__hint">optional · shown on hover</span>
            </span>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Two indices walking toward each other"
              maxLength={120}
            />
          </label>

          <div className="tagman__actions">
            <span className="tagman__preview">
              <span className="mono-label">Preview</span>
              <TagChip name={clean || 'New tag'} hue={hue} />
            </span>
            <button type="submit" className="btn btn--accent btn--sm" disabled={busy}>
              <Plus /> {busy ? 'Creating…' : 'Create tag'}
            </button>
          </div>
          {error && (
            <p id="tag-error" className="field__error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}

      <div className="tagman__list">
        <p className="mono-label">All tags · {tags.length}</p>
        {listError && (
          <p className="field__error" role="alert">
            {listError}
          </p>
        )}
        <ul>
          <AnimatePresence initial={false}>
            {tags.map((tag) => (
              <motion.li
                key={tag.name}
                layout
                className="tagman__row"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                <TagChip name={tag.name} hue={tag.hue} />
                <span className="tagman__desc">{tag.description}</span>
                <span className="tagman__count">{tag.count ? plural(tag.count) : 'Unused'}</span>
                {tag.stored && !unavailable ? (
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => remove(tag)}
                    disabled={deleting === tag.name}
                    aria-disabled={tag.count > 0 || undefined}
                    aria-label={`Delete ${tag.name}`}
                    title={tag.count > 0 ? `On ${plural(tag.count)}` : `Delete ${tag.name}`}
                  >
                    <Trash2 />
                  </button>
                ) : (
                  <span />
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </Modal>
  );
}
