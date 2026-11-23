import { highlightTree, styleTags, tagHighlighter, tags as t, type Highlighter, type Tag } from '@lezer/highlight';
import { parser } from '@lezer/java';

/**
 * Java syntax highlighting shared by the editor and the read-only lesson code blocks.
 *
 * Colors live in `java-tokens.css`: the highlighter only emits `java-*` class names, so the
 * same output works during server prerendering and switches with the `.dark` class.
 */

/** One rendered line: consecutive segments, `className` is null for unstyled text. */
export type HighlightedLine = { text: string; className: string | null }[];

/**
 * Tag → class mapping. The most specific tag wins. A plain lezer highlighter (not a
 * CodeMirror HighlightStyle) keeps the lesson code blocks free of CodeMirror.
 */
export const javaHighlightStyle: Highlighter = tagHighlighter([
  { tag: t.keyword, class: 'java-keyword' },
  { tag: [t.typeName, t.className, t.namespace], class: 'java-type' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], class: 'java-function' },
  { tag: t.annotation, class: 'java-annotation' },
  { tag: t.constant(t.variableName), class: 'java-constant' },
  { tag: t.name, class: 'java-variable' },
  { tag: t.number, class: 'java-number' },
  { tag: t.string, class: 'java-string' },
  { tag: t.comment, class: 'java-comment' },
  { tag: [t.bool, t.null, t.self, t.atom], class: 'java-atom' },
]);

/** `Parent/Child` selectors for `leaf` nested 0..maxDepth levels deep inside `context`. */
function nestedPaths(context: string, maxDepth: number, leaf: string): string {
  const paths: string[] = [];
  for (let depth = 0; depth <= maxDepth; depth++) {
    paths.push([context, ...Array<string>(depth).fill('ScopedIdentifier'), leaf].join('/'));
  }
  return paths.join(' ');
}

/**
 * Additions to the grammar's own `styleTags`. Without them declaration names are plain
 * definitions, annotations and the newer contextual keywords are unstyled, and package
 * names look like variables.
 */
export const javaStyleTags = styleTags({
  'record sealed non permits': t.modifier,
  [['ClassDeclaration', 'InterfaceDeclaration', 'EnumDeclaration', 'RecordDeclaration', 'TypeParameter']
    .map((decl) => `${decl}/Definition`)
    .join(' ')]: t.definition(t.className),
  'MethodDeclaration/Definition ConstructorDeclaration/Definition CompactConstructorDeclaration/Definition': t.function(
    t.definition(t.variableName),
  ),
  // The node covers the `@`; the name inside is a separate Identifier.
  'MarkerAnnotation Annotation MarkerAnnotation/Identifier Annotation/Identifier': t.annotation,
  [`${nestedPaths('ImportDeclaration', 6, 'Identifier')} ${nestedPaths('PackageDeclaration', 6, 'Identifier')}`]: t.namespace,
});

const javaParser = parser.configure({ props: [javaStyleTags] });

type Tree = ReturnType<typeof javaParser.parse>;
type SyntaxNode = Tree['topNode'];

/**
 * Standard-library classes colored as types wherever they appear by spelling, the way the
 * Python course colors builtins. This matters for statements outside a class (lesson
 * snippets), where the grammar reads `List<Integer> xs = ...` as comparisons of plain names.
 */
const KNOWN_CLASSES = new Set(
  (
    'Object String StringBuilder Character Integer Long Double Float Short Byte Boolean Number Math ' +
    'System Arrays Collections Objects Optional Comparator Comparable Iterable Iterator ' +
    'List ArrayList LinkedList Map HashMap LinkedHashMap TreeMap Set HashSet LinkedHashSet TreeSet ' +
    'Queue Deque ArrayDeque PriorityQueue Stack Collection Entry Stream IntStream LongStream ' +
    'DoubleStream Collectors Function BiFunction Supplier Consumer Predicate BigInteger BigDecimal ' +
    'Random Scanner Record Enum Exception RuntimeException IllegalArgumentException ' +
    'IllegalStateException IndexOutOfBoundsException ArrayIndexOutOfBoundsException ' +
    'NullPointerException ArithmeticException UnsupportedOperationException NoSuchElementException ' +
    'ConcurrentModificationException ClassCastException NumberFormatException StackOverflowError ' +
    'OutOfMemoryError Error Throwable Override FunctionalInterface SuppressWarnings Deprecated'
  ).split(/\s+/),
);

const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*[a-z][A-Za-z0-9]*$/;
/** `MAX_VALUE`, `RED`, `MOD`: two or more characters, so type variables like `T` are excluded. */
const CONSTANT_CASE = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/;

function isConstantName(name: string): boolean {
  return name.length > 1 && CONSTANT_CASE.test(name);
}

/**
 * The tag a name gets from its spelling and position, overriding the grammar's tag, or null
 * to keep the grammar's. The grammar can't tell `Math` in `Math.max(...)` from a variable.
 */
function retag(node: SyntaxNode, name: string): Tag | null {
  const parent = node.parent?.name;
  if (node.name === 'Definition') {
    return (parent === 'VariableDeclarator' || parent === 'EnumConstant') && isConstantName(name)
      ? t.constant(t.variableName)
      : null;
  }
  // `Identifier`: method-call names and annotations already have their own tags.
  if (parent === 'MethodName' || parent === 'MarkerAnnotation' || parent === 'Annotation') return null;
  // The method in `String::valueOf` or `System.out::println`.
  if (parent === 'MethodReference' && !node.nextSibling) return t.function(t.variableName);
  if (isConstantName(name)) return t.constant(t.variableName);
  if (KNOWN_CLASSES.has(name)) return t.className;
  // An unknown PascalCase receiver (`Color.RED`, `Solution::helper`) is a class by convention.
  const isReceiver = node.nextSibling?.name === '.' || (parent === 'MethodReference' && node.nextSibling);
  return isReceiver && PASCAL_CASE.test(name) ? t.className : null;
}

interface StyledSpan {
  from: number;
  to: number;
  classes: string;
}

/**
 * The one source of colors for the editor and the code blocks: grammar highlighting with
 * retagged names cut out of the grammar spans. Calls `putStyle` in document order.
 */
export function highlightJavaTree(
  tree: Tree,
  readText: (from: number, to: number) => string,
  from: number,
  to: number,
  putStyle: (from: number, to: number, classes: string) => void,
): void {
  const named: StyledSpan[] = [];
  tree.iterate({
    from,
    to,
    enter(node) {
      if (node.name !== 'Identifier' && node.name !== 'Definition') return;
      const tag = retag(node.node, readText(node.from, node.to));
      const classes = tag && javaHighlightStyle.style([tag]);
      if (classes) named.push({ from: node.from, to: node.to, classes });
    },
  });

  // Grammar spans can merge neighbors with equal classes, so cut each one around the names.
  const spans: StyledSpan[] = [...named];
  let first = 0;
  highlightTree(
    tree,
    javaHighlightStyle,
    (spanFrom, spanTo, classes) => {
      while (first < named.length && named[first].to <= spanFrom) first++;
      let pos = spanFrom;
      for (let i = first; i < named.length && named[i].from < spanTo; i++) {
        if (named[i].from > pos) spans.push({ from: pos, to: named[i].from, classes });
        pos = Math.max(pos, named[i].to);
      }
      if (pos < spanTo) spans.push({ from: pos, to: spanTo, classes });
    },
    from,
    to,
  );
  spans.sort((a, b) => a.from - b.from);
  for (const span of spans) putStyle(span.from, span.to, span.classes);
}

/** Parses with the same grammar configuration the editor uses. */
export function parseJava(code: string): Tree {
  return javaParser.parse(code);
}

/**
 * Highlights a whole snippet, one entry per input line (`\n`, `\r\n` or `\r`). Pure, so it
 * runs during server prerendering.
 */
export function highlightJava(code: string): HighlightedLine[] {
  const source = code.replace(/\r\n?/g, '\n');
  const lines: HighlightedLine[] = [[]];
  const push = (text: string, className: string | null) => {
    // Block comments and text blocks span lines: split them so each line stands alone.
    text.split('\n').forEach((part, i) => {
      if (i > 0) lines.push([]);
      if (part) lines[lines.length - 1].push({ text: part, className });
    });
  };

  let pos = 0;
  highlightJavaTree(
    parseJava(source),
    (from, to) => source.slice(from, to),
    0,
    source.length,
    (from, to, classes) => {
      if (from > pos) push(source.slice(pos, from), null);
      push(source.slice(from, to), classes);
      pos = to;
    },
  );
  if (pos < source.length) push(source.slice(pos), null);
  return lines;
}
