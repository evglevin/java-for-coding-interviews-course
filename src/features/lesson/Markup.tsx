import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

/** Inline code, styled to match code blocks. */
export function InlineCode({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <code className={cn('rounded bg-inline-code px-1.5 py-0.5 font-mono text-[0.86em] text-inline-code-foreground', className)}>
      {children}
    </code>
  );
}

/** Renders the course's inline markup: `code`, **bold**, *emphasis*. */
export function Markup({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(TOKEN)) {
    const token = match[0];
    const at = match.index;
    if (at > last) parts.push(text.slice(last, at));
    if (token.startsWith('`')) parts.push(<InlineCode key={at}>{token.slice(1, -1)}</InlineCode>);
    else if (token.startsWith('**'))
      parts.push(
        <strong key={at} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    else parts.push(<em key={at}>{token.slice(1, -1)}</em>);
    last = at + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
