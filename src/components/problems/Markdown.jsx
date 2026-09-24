import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

// Fenced blocks with a language get highlighted; plain fences (examples) stay simple.
function MarkdownCode({ className, children }) {
  const text = String(children ?? '');
  const language = /language-(\w+)/.exec(className ?? '')?.[1];
  const isBlock = Boolean(language) || text.includes('\n');
  if (!isBlock) return <code className="inline-code">{children}</code>;
  if (language) return <CodeBlock code={text.replace(/\n$/, '')} language={language} compact />;
  return <pre className="md__example">{text.replace(/\n$/, '')}</pre>;
}

const components = {
  code: MarkdownCode,
  pre: ({ children }) => <>{children}</>,
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
};

// react-markdown never renders raw HTML, so problem text can't inject markup.
export default function Markdown({ children }) {
  if (!children?.trim()) return null;
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
