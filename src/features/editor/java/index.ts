import { autocompletion } from '@codemirror/autocomplete';
import { javaLanguage as javaLRLanguage } from '@codemirror/lang-java';
import { LanguageSupport, syntaxTree } from '@codemirror/language';
import { Prec, RangeSetBuilder, type Extension } from '@codemirror/state';
import { Decoration, ViewPlugin, type DecorationSet, type EditorView, type ViewUpdate } from '@codemirror/view';
import { javaCompletions } from './completions';
import { highlightJavaTree, javaStyleTags } from './highlighting';

export { highlightJava, javaHighlightStyle, type HighlightedLine } from './highlighting';
export { javaCompletions } from './completions';

/** lang-java's indentation and folding, with the course's extra highlighting tags. */
const javaLanguageSupport = new LanguageSupport(javaLRLanguage.configure({ props: [javaStyleTags] }));

/**
 * Stands in for `syntaxHighlighting(javaHighlightStyle)`: the same grammar classes, plus the
 * spelling-based recoloring (`Math`, `MAX_VALUE`, ...) that a plain HighlightStyle can't do,
 * so the editor matches the lesson code blocks exactly.
 */
function javaSyntaxHighlighting(): Extension {
  const marks = new Map<string, Decoration>();
  const markFor = (classes: string) => {
    let mark = marks.get(classes);
    if (!mark) marks.set(classes, (mark = Decoration.mark({ class: classes })));
    return mark;
  };

  const build = (view: EditorView): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>();
    const tree = syntaxTree(view.state);
    const readText = (from: number, to: number) => view.state.doc.sliceString(from, to);
    for (const { from, to } of view.visibleRanges) {
      highlightJavaTree(tree, readText, from, to, (spanFrom, spanTo, classes) => builder.add(spanFrom, spanTo, markFor(classes)));
    }
    return builder.finish();
  };

  const plugin = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      constructor(view: EditorView) {
        this.decorations = build(view);
      }
      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged || syntaxTree(update.startState) !== syntaxTree(update.state)) {
          this.decorations = build(update.view);
        }
      }
    },
    { decorations: (value) => value.decorations },
  );

  return Prec.high(plugin);
}

/**
 * Autocompletion configured like the Python course's editor. Already part of
 * `javaLanguage()`; use it on its own only when composing the extensions by hand, and never
 * alongside another `autocompletion()` (their configs conflict).
 */
export function javaAutocompletion(): Extension {
  return autocompletion({
    activateOnTyping: true,
    override: [javaCompletions],
    maxRenderedOptions: 30,
    icons: true,
  });
}

/**
 * Everything the editor needs for Java: parsing, indentation, folding, highlighting (colors
 * from `java-tokens.css`) and completions. Don't add `syntaxHighlighting(...)` or
 * `autocompletion(...)` next to it.
 */
export function javaLanguage(): Extension {
  return [javaLanguageSupport, javaSyntaxHighlighting(), javaAutocompletion()];
}
