import { useMemo, useState } from 'react';
import hljs from 'highlight.js/lib/core';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import { Check, Copy } from 'lucide-react';
import { LANGUAGES } from '../../data/dsaTags';

// Only the languages offered in the form are bundled (keeps this chunk small).
Object.entries({ c, cpp, go, java, javascript, python, sql, typescript }).forEach(([name, lang]) =>
  hljs.registerLanguage(name, lang)
);

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function languageLabel(value) {
  return LANGUAGES.find((l) => l.value === value)?.label ?? value;
}

export function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (e.g. insecure context) — nothing sensible to do.
    }
  };
  return (
    <button type="button" className="code__copy" onClick={copy} aria-label={copied ? 'Copied' : `${label} code`}>
      {copied ? <Check /> : <Copy />}
      <span>{copied ? 'Copied' : label}</span>
    </button>
  );
}

// Syntax-highlighted code with line numbers. hljs output is HTML-escaped, so
// injecting it is safe.
export default function CodeBlock({ code, language, meta, compact = false }) {
  const html = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) return hljs.highlight(code, { language }).value;
      return hljs.highlightAuto(code).value;
    } catch {
      return escapeHtml(code);
    }
  }, [code, language]);

  const lineCount = code.split('\n').length;

  return (
    <div className={`code${compact ? ' code--compact' : ''}`}>
      {!compact && (
        <div className="code__bar">
          <span className="code__lang">{languageLabel(language)}</span>
          {meta}
          <CopyButton text={code} />
        </div>
      )}
      <div className="code__body" data-lenis-prevent>
        <pre className="code__gutter" aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => i + 1).join('\n')}
        </pre>
        <pre className="code__pre">
          <code className="hljs" dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      </div>
    </div>
  );
}
