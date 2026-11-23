/** Plain-text descriptions of run failures, phrased like the JVM where there is a JVM equivalent. */

import type { JavaException, RunFailure } from '@/runtime/types';

export function formatException(e: JavaException, thread = 'main'): string {
  const head = `Exception in thread "${thread}" ${e.type}${e.detail ? `: ${e.detail}` : ''}`;
  const frames = e.trace.map((f) => `    at ${f.method}(Main.java:${f.line})`);
  return [head, ...frames].join('\n');
}

export function shortException(e: JavaException): string {
  const where = e.trace[0] ? ` at line ${e.trace[0].line}` : '';
  return `${e.type}${e.detail ? `: ${e.detail}` : ''}${where}`;
}

export interface FailureText {
  title: string;
  body: string;
}

export function describeFailure(failure: RunFailure): FailureText {
  switch (failure.kind) {
    case 'compile':
      return {
        title: 'Compilation error',
        body: failure.diagnostics
          .map((d) => (d.line > 0 ? `Main.java:${d.line}${d.column ? `:${d.column}` : ''}: ${d.message}` : d.message))
          .join('\n\n'),
      };
    case 'mismatch':
      return {
        title: 'The tests can’t call your code',
        body:
          'Keep the method names and parameter types from the starter code.\n\n' +
          failure.diagnostics.map((d) => d.message).join('\n\n'),
      };
    case 'exception':
      return { title: 'Runtime error', body: formatException(failure.exception) };
    case 'stackOverflow':
      return {
        title: 'Runtime error',
        body: 'Exception in thread "main" java.lang.StackOverflowError\n\nThe recursion went too deep: check the base case.',
      };
    case 'timeout':
      return {
        title: 'Time limit exceeded',
        body: `The program ran for more than ${failure.limitMs / 1000} seconds and was stopped. Look for an infinite loop.`,
      };
    case 'stopped':
      return { title: 'Stopped', body: 'You stopped the program.' };
    case 'internal':
      return { title: 'Couldn’t run the code', body: failure.message };
  }
}
