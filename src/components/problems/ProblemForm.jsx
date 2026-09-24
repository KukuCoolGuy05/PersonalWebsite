import { useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Plus, Trash2, X } from 'lucide-react';
import { DIFFICULTIES, LANGUAGES, SOURCES } from '../../data/dsaTags';
import { emptyProblem, emptySolution, normalizeProblem, toFormState, validateProblem } from '../../lib/problemModel';
import { describeError } from '../../lib/problemsApi';
import { MAX_TAG_LENGTH, normalizeTagName, validateTagName } from '../../lib/tags';
import { guessFromUrl } from '../../lib/text';
import Modal, { ConfirmDialog } from '../ui/Modal';
import Markdown from './Markdown';
import { TagChip } from './ProblemParts';

function MarkdownField({ id, value, onChange, rows, placeholder, invalid, describedBy }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="mdfield">
      <div className="mdfield__tabs">
        <button type="button" aria-pressed={!preview} onClick={() => setPreview(false)}>
          Write
        </button>
        <button type="button" aria-pressed={preview} onClick={() => setPreview(true)}>
          Preview
        </button>
        <span className="field__hint">Markdown · `code`, **bold**, ``` blocks</span>
      </div>
      {preview ? (
        <div className="mdfield__preview">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="field__hint">Nothing to preview yet.</p>}
        </div>
      ) : (
        <textarea
          id={id}
          className="textarea"
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
      )}
    </div>
  );
}

// Code textarea where Tab indents. Press Esc, then Tab, to move to the next field.
function CodeArea({ value, onChange, ...rest }) {
  const escaped = useRef(false);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      escaped.current = true;
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey && !escaped.current) {
      e.preventDefault();
      const el = e.currentTarget;
      // execCommand keeps the browser's undo history intact.
      if (!document.execCommand?.('insertText', false, '    ')) {
        const { selectionStart: start, selectionEnd: end } = el;
        onChange(`${value.slice(0, start)}    ${value.slice(end)}`);
        requestAnimationFrame(() => {
          el.selectionStart = el.selectionEnd = start + 4;
        });
      }
    }
    escaped.current = false;
  };

  return (
    <textarea
      className="textarea textarea--code"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      {...rest}
    />
  );
}

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} className="field__error">
      {message}
    </p>
  );
}

// `tags` is the saved tag list; new names typed here join it when the problem is saved.
export default function ProblemForm({ initial, tags, onSave, onCancel }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(() => (initial ? toFormState(initial) : emptyProblem()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagError, setTagError] = useState('');
  const start = useRef(JSON.stringify(form));
  const formRef = useRef(null);

  const dirty = JSON.stringify(form) !== start.current;
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setSolution = (index, patch) =>
    setForm((f) => ({ ...f, solutions: f.solutions.map((s, i) => (i === index ? { ...s, ...patch } : s)) }));
  const addSolution = () =>
    setForm((f) => ({ ...f, solutions: [...f.solutions, emptySolution(f.solutions.at(-1)?.language)] }));
  const removeSolution = (index) => setForm((f) => ({ ...f, solutions: f.solutions.filter((_, i) => i !== index) }));
  const toggleTag = (tag) =>
    setForm((f) => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag] }));

  // Saved tags, plus any new ones already picked for this problem.
  const tagOptions = tags.map((t) => t.name);
  for (const name of form.tags) {
    if (!tagOptions.some((o) => o.toLowerCase() === name.toLowerCase())) tagOptions.push(name);
  }

  const addCustomTag = () => {
    const clean = normalizeTagName(newTag);
    const message = validateTagName(clean);
    if (message) {
      setTagError(message);
      return;
    }
    // "heap" picks the existing "Heap" instead of making a near-duplicate.
    const name = tagOptions.find((o) => o.toLowerCase() === clean.toLowerCase()) ?? clean;
    if (!form.tags.includes(name)) toggleTag(name);
    setNewTag('');
    setTagError('');
  };

  // Paste a LeetCode (etc.) link and the title + source fill themselves in.
  const autofillFromUrl = () => {
    const guess = guessFromUrl(form.url);
    if (!guess) return;
    setForm((f) => ({ ...f, title: f.title || guess.title || '', source: guess.source ?? f.source }));
  };

  const submit = async (event) => {
    event?.preventDefault();
    const found = validateProblem(form);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    setSaving(true);
    setSaveError('');
    try {
      await onSave(normalizeProblem(form));
    } catch (error) {
      setSaveError(describeError(error));
      setSaving(false);
    }
  };

  const requestClose = () => (dirty && !saving ? setConfirmDiscard(true) : onCancel());

  return (
    <Modal onClose={requestClose} labelledBy="problem-form-title" className="pform">
      <form
        ref={formRef}
        onSubmit={submit}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(e);
        }}
        noValidate
      >
        <header className="pform__head">
          <div>
            <p className="mono-label">{editing ? 'Edit problem' : 'New problem'}</p>
            <h2 id="problem-form-title" className="pform__title">
              {form.title.trim() || 'Untitled problem'}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={requestClose} aria-label="Close form">
            <X />
          </button>
        </header>

        <div className="pform__body">
          <fieldset className="pform__group">
            <legend className="mono-label">Details</legend>

            <label className="field">
              <span className="field__label">Link to the problem</span>
              <input
                className="input"
                type="url"
                inputMode="url"
                placeholder="https://leetcode.com/problems/two-sum/"
                value={form.url}
                onChange={(e) => set('url')(e.target.value)}
                onBlur={autofillFromUrl}
                aria-invalid={Boolean(errors.url) || undefined}
                aria-describedby="err-url"
              />
              <span className="field__hint">Paste a LeetCode, NeetCode or HackerRank link to fill in the title.</span>
              <FieldError id="err-url" message={errors.url} />
            </label>

            <div className="pform__grid pform__grid--title">
              <label className="field">
                <span className="field__label">Title *</span>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => set('title')(e.target.value)}
                  placeholder="Two Sum"
                  aria-invalid={Boolean(errors.title) || undefined}
                  aria-describedby="err-title"
                  autoFocus={!editing}
                />
                <FieldError id="err-title" message={errors.title} />
              </label>
              <label className="field">
                <span className="field__label">Number</span>
                <input
                  className="input"
                  inputMode="numeric"
                  value={form.number}
                  onChange={(e) => set('number')(e.target.value)}
                  placeholder="1"
                  aria-invalid={Boolean(errors.number) || undefined}
                  aria-describedby="err-number"
                />
                <FieldError id="err-number" message={errors.number} />
              </label>
            </div>

            <div className="pform__grid">
              <label className="field">
                <span className="field__label">Source</span>
                <input
                  className="input"
                  list="problem-sources"
                  value={form.source}
                  onChange={(e) => set('source')(e.target.value)}
                  placeholder="LeetCode"
                />
                <datalist id="problem-sources">
                  {SOURCES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>
              <label className="field">
                <span className="field__label">Date solved</span>
                <input
                  className="input"
                  type="date"
                  value={form.solvedOn}
                  onChange={(e) => set('solvedOn')(e.target.value)}
                  aria-invalid={Boolean(errors.solvedOn) || undefined}
                />
              </label>
            </div>

            <div className="field">
              <span className="field__label" id="difficulty-label">
                Difficulty
              </span>
              <div className="pform__diff" role="radiogroup" aria-labelledby="difficulty-label">
                {DIFFICULTIES.map((level) => (
                  <button
                    key={level}
                    type="button"
                    role="radio"
                    aria-checked={form.difficulty === level}
                    className="pform__diff-btn"
                    data-level={level.toLowerCase()}
                    onClick={() => set('difficulty')(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <span className="field__label">Tags</span>
              <div className="chip-row">
                {tagOptions.map((tag) => (
                  <TagChip
                    key={tag}
                    name={tag}
                    as="button"
                    type="button"
                    aria-pressed={form.tags.includes(tag)}
                    onClick={() => toggleTag(tag)}
                  />
                ))}
              </div>
              <div className="pform__newtag">
                <input
                  className="input"
                  value={newTag}
                  onChange={(e) => {
                    setNewTag(e.target.value);
                    setTagError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag();
                    }
                  }}
                  placeholder="New tag (e.g. Two Pointers)"
                  aria-label="New tag name"
                  maxLength={MAX_TAG_LENGTH}
                  aria-invalid={Boolean(tagError) || undefined}
                />
                <button type="button" className="btn btn--ghost btn--sm" onClick={addCustomTag} disabled={!newTag.trim()}>
                  <Plus /> Add tag
                </button>
              </div>
              {tagError ? (
                <p className="field__error">{tagError}</p>
              ) : (
                <span className="field__hint">New tags join your tag list when you save.</span>
              )}
            </div>
          </fieldset>

          <fieldset className="pform__group">
            <legend className="mono-label">Question *</legend>
            <MarkdownField
              id="problem-question"
              value={form.question}
              onChange={set('question')}
              rows={7}
              placeholder="Paraphrase the problem and add an example or two…"
              invalid={Boolean(errors.question)}
              describedBy="err-question"
            />
            <FieldError id="err-question" message={errors.question} />
          </fieldset>

          <fieldset className="pform__group">
            <legend className="mono-label">How I solved it</legend>
            <label className="field">
              <span className="field__label">Key insight</span>
              <input
                className="input"
                value={form.insight}
                onChange={(e) => set('insight')(e.target.value)}
                placeholder="The one idea that cracks it, in a sentence."
              />
            </label>
            <div className="field">
              <span className="field__label">Approach</span>
              <MarkdownField
                id="problem-approach"
                value={form.approach}
                onChange={set('approach')}
                rows={5}
                placeholder="Walk through the idea, edge cases and trade-offs…"
              />
            </div>
          </fieldset>

          <fieldset className="pform__group">
            <legend className="mono-label">Solutions</legend>
            {form.solutions.map((solution, i) => (
              <div key={i} className="pform__solution">
                <div className="pform__grid pform__grid--solution">
                  <label className="field">
                    <span className="field__label">Label</span>
                    <input
                      className="input"
                      value={solution.label}
                      onChange={(e) => setSolution(i, { label: e.target.value })}
                      placeholder={i === 0 ? 'Optimal' : 'Brute force'}
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Language</span>
                    <select
                      className="select"
                      value={solution.language}
                      onChange={(e) => setSolution(i, { language: e.target.value })}
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span className="field__label">Time</span>
                    <input
                      className="input"
                      value={solution.time}
                      onChange={(e) => setSolution(i, { time: e.target.value })}
                      placeholder="O(n)"
                    />
                  </label>
                  <label className="field">
                    <span className="field__label">Space</span>
                    <input
                      className="input"
                      value={solution.space}
                      onChange={(e) => setSolution(i, { space: e.target.value })}
                      placeholder="O(1)"
                    />
                  </label>
                </div>
                <label className="field">
                  <span className="field__label">Code</span>
                  <CodeArea
                    value={solution.code}
                    onChange={(code) => setSolution(i, { code })}
                    rows={12}
                    placeholder="class Solution { … }"
                  />
                  <span className="field__hint">Tab indents · Esc then Tab moves on · Ctrl/⌘ + Enter saves</span>
                </label>
                {form.solutions.length > 1 && (
                  <button type="button" className="pform__remove" onClick={() => removeSolution(i)}>
                    <Trash2 /> Remove this solution
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="btn btn--ghost btn--sm pform__add" onClick={addSolution}>
              <Plus /> Add another solution
            </button>
          </fieldset>
        </div>

        <footer className="pform__foot">
          {saveError && (
            <p className="pform__error" role="alert">
              {saveError}
            </p>
          )}
          <button type="button" className="btn btn--ghost btn--sm" onClick={requestClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--accent btn--sm" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add problem'}
          </button>
        </footer>
      </form>

      <AnimatePresence>
        {confirmDiscard && (
          <ConfirmDialog
            title="Discard your changes?"
            body="This problem has unsaved edits that will be lost."
            confirmLabel="Discard"
            danger
            onConfirm={onCancel}
            onCancel={() => setConfirmDiscard(false)}
          />
        )}
      </AnimatePresence>
    </Modal>
  );
}
