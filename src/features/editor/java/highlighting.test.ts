import { describe, expect, it } from 'vitest';
import { highlightJava, type HighlightedLine } from './highlighting';

/** Classes of every segment whose text is exactly `text`, in order. */
function classesOf(lines: HighlightedLine[], text: string): (string | null)[] {
  return lines
    .flat()
    .filter((segment) => segment.text === text)
    .map((segment) => segment.className);
}

function classOf(code: string, text: string): string | null {
  const found = classesOf(highlightJava(code), text);
  expect(found, `"${text}" is a segment of the output`).not.toHaveLength(0);
  return found[0];
}

describe('highlightJava', () => {
  it('reproduces the input text line by line', () => {
    const code = 'class A {\n\n  int x = 1; /* a\n  b */\n}\n';
    const lines = highlightJava(code);
    expect(lines).toHaveLength(code.split('\n').length);
    expect(lines.map((line) => line.map((s) => s.text).join('')).join('\n')).toBe(code);
    expect(lines[1]).toEqual([]);
  });

  it('counts CRLF line breaks as one', () => {
    expect(highlightJava('int a;\r\nint b;\r\n')).toHaveLength(3);
  });

  it('colors keywords, including modifiers and contextual keywords', () => {
    const code = 'public sealed interface Shape permits Circle {}\nfinal class A { void f() { for (;;) return; } }';
    for (const keyword of ['public', 'sealed', 'interface', 'permits', 'final', 'class', 'void', 'for', 'return']) {
      expect(classOf(code, keyword), keyword).toBe('java-keyword');
    }
  });

  it('colors strings, chars and text blocks', () => {
    const code = 'String s = "hi";\nchar c = \'x\';\nString t = """\n    two\n    lines""";';
    expect(classOf(code, '"hi"')).toBe('java-string');
    expect(classOf(code, "'x'")).toBe('java-string');
    const lines = highlightJava(code);
    // The text block spans three lines and is split so each line stands alone.
    expect(lines[2].at(-1)).toEqual({ text: '"""', className: 'java-string' });
    expect(lines[3]).toEqual([{ text: '    two', className: 'java-string' }]);
    expect(lines[4][0]).toEqual({ text: '    lines"""', className: 'java-string' });
  });

  it('colors line and block comments', () => {
    const code = 'int x = 1; // note\n/* block\n   comment */';
    expect(classOf(code, '// note')).toBe('java-comment');
    expect(classOf(code, '/* block')).toBe('java-comment');
    expect(classOf(code, '   comment */')).toBe('java-comment');
  });

  it('colors numbers, literals and this', () => {
    const code = 'long a = 1_000L; double d = 1e-9; boolean b = true; Object o = null; this.a = a;';
    expect(classOf(code, '1_000L')).toBe('java-number');
    expect(classOf(code, '1e-9')).toBe('java-number');
    expect(classOf(code, 'true')).toBe('java-atom');
    expect(classOf(code, 'null')).toBe('java-atom');
    expect(classOf(code, 'this')).toBe('java-atom');
  });

  it('colors generic types and primitives', () => {
    const code = 'class A { void f() { Map<String, List<Integer>> m = new HashMap<>(); int[] a = new int[3]; } }';
    expect(classesOf(highlightJava(code), 'String')).toEqual(['java-type']);
    expect(classOf(code, 'Map')).toBe('java-type');
    expect(classOf(code, 'List')).toBe('java-type');
    expect(classOf(code, 'Integer')).toBe('java-type');
    expect(classOf(code, 'HashMap')).toBe('java-type');
    expect(classesOf(highlightJava(code), 'int')).toEqual(['java-type', 'java-type']);
  });

  it('colors standard-library names in snippets outside a class', () => {
    // At the top level the grammar reads this as comparisons of plain names.
    const code = 'List<List<Integer>> rows = new ArrayList<>();';
    expect(classesOf(highlightJava(code), 'List')).toEqual(['java-type', 'java-type']);
    expect(classOf(code, 'Integer')).toBe('java-type');
    expect(classOf(code, 'rows')).toBe('java-variable');
  });

  it('colors static receivers, constants and method calls', () => {
    const code =
      'int n = Integer.MAX_VALUE;\nArrays.sort(nums);\nSystem.out.println(n);\nColor c = Color.RED;\nlist.forEach(System.out::println);';
    expect(classOf(code, 'Integer')).toBe('java-type');
    expect(classOf(code, 'MAX_VALUE')).toBe('java-constant');
    expect(classOf(code, 'Arrays')).toBe('java-type');
    expect(classOf(code, 'sort')).toBe('java-function');
    expect(classesOf(highlightJava(code), 'System')).toEqual(['java-type', 'java-type']);
    expect(classesOf(highlightJava(code), 'println')).toEqual(['java-function', 'java-function']);
    expect(classesOf(highlightJava(code), 'Color')).toEqual(['java-type', 'java-type']);
    expect(classOf(code, 'RED')).toBe('java-constant');
    expect(classOf(code, 'nums')).toBe('java-variable');
  });

  it('colors records, declarations and annotations', () => {
    const code =
      '@FunctionalInterface\nrecord Point(int x, int y) implements Comparable<Point> {\n' +
      '  @Override\n  public int compareTo(Point o) { return Integer.compare(x, o.x); }\n}\n' +
      'enum Dir { UP, DOWN }';
    expect(classOf(code, 'record')).toBe('java-keyword');
    expect(classesOf(highlightJava(code), 'Point')).toEqual(['java-type', 'java-type', 'java-type']);
    expect(classOf(code, 'compareTo')).toBe('java-function');
    // The `@` and the name share a class, so they come out as one segment.
    expect(classOf(code, '@FunctionalInterface')).toBe('java-annotation');
    expect(classOf(code, '@Override')).toBe('java-annotation');
    expect(classOf(code, 'Dir')).toBe('java-type');
    expect(classOf(code, 'UP')).toBe('java-constant');
    expect(classOf(code, 'x')).toBe('java-variable');
  });

  it('colors package names in imports', () => {
    const code = 'import java.util.Map;';
    expect(classOf(code, 'java')).toBe('java-type');
    expect(classOf(code, 'Map')).toBe('java-type');
  });
});
