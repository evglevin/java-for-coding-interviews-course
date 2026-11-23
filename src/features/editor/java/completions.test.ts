import { CompletionContext, type Completion, type CompletionResult } from '@codemirror/autocomplete';
import { ensureSyntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { describe, expect, it } from 'vitest';
import { javaLanguage } from './index';
import { javaCompletions } from './completions';

/** Completes at the end of `doc`; options come back in the order the popup shows them on an empty query. */
function complete(doc: string, explicit = false): { from: number; labels: string[]; options: Completion[] } | null {
  const state = EditorState.create({ doc, extensions: [javaLanguage()] });
  ensureSyntaxTree(state, doc.length, 1000);
  const result = javaCompletions(new CompletionContext(state, doc.length, explicit)) as CompletionResult | null;
  if (!result) return null;
  const options = [...result.options].sort((a, b) => (b.boost ?? 0) - (a.boost ?? 0) || a.label.localeCompare(b.label));
  return { from: result.from, labels: options.map((o) => o.label), options };
}

describe('javaCompletions', () => {
  it('lists static members of known classes, most relevant first', () => {
    expect(complete('Arrays.')?.labels.slice(0, 3)).toEqual(['sort', 'fill', 'asList']);
    expect(complete('Integer.')?.labels.slice(0, 3)).toEqual(['MAX_VALUE', 'MIN_VALUE', 'parseInt']);
    expect(complete('Integer.')?.options[0].type).toBe('constant');
    expect(complete('System.out.')?.labels).toEqual(['println', 'print', 'printf']);
    expect(complete('java.util.Arrays.')?.labels[0]).toBe('sort');
  });

  it('completes method references', () => {
    expect(complete('list.forEach(Integer::')?.labels).toContain('compare');
  });

  it('offers merged instance methods after any other dot', () => {
    const result = complete('words.');
    expect(result?.from).toBe('words.'.length);
    expect(result?.labels.slice(0, 3)).toEqual(['length', 'size', 'get']);
    expect(new Set(result?.labels).size).toBe(result?.labels.length);
    expect(result?.options.find((o) => o.label === 'size')?.detail).toBe('List, Map, Set +3');
    expect(result?.options.find((o) => o.label === 'append')?.detail).toBe('StringBuilder');
  });

  it('includes declared names, snippets, types and keywords', () => {
    const result = complete('int count = 0;\nco');
    expect(result?.labels[0]).toBe('count');
    expect(result?.labels).toEqual(expect.arrayContaining(['sout', 'fori', 'String', 'Collections', 'continue']));
  });

  it('stays quiet in comments, strings and number literals', () => {
    expect(complete('// Arrays.')).toBeNull();
    expect(complete('String s = "a.')).toBeNull();
    expect(complete('double d = 1.')).toBeNull();
  });
});
