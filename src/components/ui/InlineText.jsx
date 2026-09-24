import { Fragment } from 'react';
import { parseInline } from '../../lib/text';

// Renders "*emphasis*" as <em> (serif accent) and "`code`" as inline code.
export default function InlineText({ text }) {
  return parseInline(text).map((seg, i) => {
    if (seg.type === 'em') return <em key={i}>{seg.value}</em>;
    if (seg.type === 'code') {
      return (
        <code key={i} className="inline-code">
          {seg.value}
        </code>
      );
    }
    return <Fragment key={i}>{seg.value}</Fragment>;
  });
}
