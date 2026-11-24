import { useCallback, useEffect, useRef } from 'react';
import { Compartment, EditorState, Prec, type Extension } from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
  rectangularSelection,
  tooltips,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput, indentUnit } from '@codemirror/language';
import { acceptCompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { lintGutter, setDiagnostics, type Diagnostic } from '@codemirror/lint';
import type { Theme } from '@/features/preferences/preferences';
import type { CompileDiagnostic } from '@/runtime/types';
import { javaLanguage } from './java';
import { editorTheme } from './editorTheme';
import { searchPanel } from './searchPanel';

export interface CodeEditorHandle {
  /** Replaces the text as an edit the learner can undo (Reset, Load solution). */
  replaceCode(code: string): void;
}

interface CodeEditorProps {
  /** Changing the key swaps in `initialCode` as a fresh document with its own undo history. */
  documentKey: string;
  initialCode: string;
  theme: Theme;
  fontSize: number;
  /** Compile errors to mark in the gutter, for the document they were produced from. */
  diagnostics: { documentKey: string; items: CompileDiagnostic[] } | null;
  onChange(code: string): void;
  onRun(): void;
  onSubmit(): void;
  onCursorChange?(position: { line: number; column: number }): void;
  handleRef: React.RefObject<CodeEditorHandle | null>;
}

/** CodeMirror 6 configured for Java. Mounts once; props flow in through compartments and effects. */
export function CodeEditor({
  documentKey,
  initialCode,
  theme,
  fontSize,
  diagnostics,
  onChange,
  onRun,
  onSubmit,
  onCursorChange,
  handleRef,
}: CodeEditorProps) {
  const viewRef = useRef<EditorView | null>(null);
  const appearance = useRef(new Compartment());
  const callbacks = useRef({ onChange, onRun, onSubmit, onCursorChange });
  callbacks.current = { onChange, onRun, onSubmit, onCursorChange };
  const createStateRef = useRef<(doc: string) => EditorState>(null);
  const mounted = useRef({ documentKey, initialCode, theme, fontSize });

  const attach = useCallback(
    (container: HTMLDivElement | null) => {
      if (!container) return;
      let replacing = false;
      const initial = mounted.current;
      const extensions: Extension[] = [
        lineNumbers(),
        highlightActiveLineGutter(),
        lintGutter(),
        history(),
        foldGutter(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        indentUnit.of('    '),
        bracketMatching(),
        closeBrackets(),
        tooltips({ position: 'fixed' }),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        searchPanel(),
        javaLanguage(),
        EditorView.contentAttributes.of({ 'aria-label': 'Java code editor' }),
        keymap.of([
          { key: 'Mod-Enter', run: () => (callbacks.current.onRun(), true) },
          { key: 'Mod-Shift-Enter', run: () => (callbacks.current.onSubmit(), true) },
        ]),
        Prec.high(keymap.of([{ key: 'Tab', run: acceptCompletion }, ...completionKeymap])),
        keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...searchKeymap, ...historyKeymap, ...foldKeymap, indentWithTab]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && !replacing) callbacks.current.onChange(update.state.doc.toString());
          if (update.selectionSet || update.docChanged) {
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head);
            callbacks.current.onCursorChange?.({ line: line.number, column: head - line.from + 1 });
          }
        }),
      ];
      const createState = (doc: string) =>
        EditorState.create({
          doc,
          extensions: [
            ...extensions,
            appearance.current.of(
              viewRef.current
                ? (appearance.current.get(viewRef.current.state) ?? [])
                : editorTheme(initial.theme, initial.fontSize),
            ),
          ],
        });
      createStateRef.current = createState;

      const view = new EditorView({ state: createState(initial.initialCode), parent: container });
      viewRef.current = view;
      handleRef.current = {
        replaceCode(code) {
          const doc = view.state.doc;
          if (doc.toString() === code) return;
          replacing = true;
          try {
            view.dispatch({ changes: { from: 0, to: doc.length, insert: code } });
          } finally {
            replacing = false;
          }
          callbacks.current.onChange(code);
        },
      };
      return () => {
        handleRef.current = null;
        viewRef.current = null;
        view.destroy();
      };
    },
    [handleRef],
  );

  // A different lesson or tab: a fresh document, so undo never crosses into another file.
  const shownKey = useRef(documentKey);
  useEffect(() => {
    const view = viewRef.current;
    if (!view || shownKey.current === documentKey) return;
    shownKey.current = documentKey;
    view.setState(createStateRef.current!(initialCode));
    callbacks.current.onCursorChange?.({ line: 1, column: 1 });
  }, [documentKey, initialCode]);

  useEffect(() => {
    viewRef.current?.dispatch({ effects: appearance.current.reconfigure(editorTheme(theme, fontSize)) });
  }, [theme, fontSize]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const items = diagnostics?.documentKey === documentKey ? diagnostics.items : [];
    view.dispatch(
      setDiagnostics(
        view.state,
        items.flatMap((d) => toCodeMirror(view.state, d)),
      ),
    );
  }, [diagnostics, documentKey]);

  return <div ref={attach} className="min-h-0 flex-1 overflow-hidden" />;
}

function toCodeMirror(state: EditorState, d: CompileDiagnostic): Diagnostic[] {
  if (d.line < 1 || d.line > state.doc.lines) return [];
  const line = state.doc.line(d.line);
  const from = Math.min(line.to, line.from + Math.max(0, d.column - 1));
  // javac points at one character; mark to the end of the word (or the line) for visibility.
  const rest = state.sliceDoc(from, line.to);
  const word = /^\w+/.exec(rest)?.[0].length ?? 1;
  return [{ from, to: Math.min(line.to, from + word), severity: d.severity, message: d.message }];
}
