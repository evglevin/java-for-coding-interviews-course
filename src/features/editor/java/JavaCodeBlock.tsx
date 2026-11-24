import { Fragment, useEffect, useMemo, useState } from 'react';
import { ArrowRightToLine, Check, Copy } from 'lucide-react';
import { highlightJava } from './highlighting';

interface JavaCodeBlockProps {
  code: string;
  /** Shown in the header bar; defaults to "Java". */
  caption?: string;
  /** Adds a "Load in Editor" button that hands the code to the editor. */
  onLoadIntoEditor?: (code: string) => void;
}

const HEADER_BUTTON =
  'flex min-h-6 cursor-pointer items-center gap-1 rounded px-2 text-xs font-medium transition-colors hover:bg-accent hover:text-foreground';

/** A read-only, highlighted Java snippet. Renders its content during prerendering. */
export function JavaCodeBlock({ code, caption, onLoadIntoEditor }: JavaCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const source = code.trimEnd();
  const lines = useMemo(() => highlightJava(source), [source]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; the code stays selectable.
    }
  };

  return (
    <figure className="my-3 overflow-hidden rounded-lg border bg-code text-(color:--java-fg)">
      <div className="flex items-center justify-between border-b px-3 py-1.5 text-xs text-muted-foreground">
        <figcaption className="font-medium">{caption ?? 'Java'}</figcaption>
        <div className="flex items-center gap-1.5">
          {onLoadIntoEditor && (
            <button type="button" onClick={() => onLoadIntoEditor(source)} className={HEADER_BUTTON} title="Load into editor">
              <ArrowRightToLine className="h-3.5 w-3.5" />
              Load in Editor
            </button>
          )}
          <button type="button" onClick={handleCopy} className={HEADER_BUTTON} title="Copy code">
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3.5 font-mono text-[13.5px] leading-[1.65]">
        <code>
          {lines.map((segments, i) => (
            <Fragment key={i}>
              {i > 0 && '\n'}
              {segments.map(({ text, className }, j) =>
                className ? (
                  <span key={j} className={className}>
                    {text}
                  </span>
                ) : (
                  <Fragment key={j}>{text}</Fragment>
                ),
              )}
            </Fragment>
          ))}
        </code>
      </pre>
    </figure>
  );
}
