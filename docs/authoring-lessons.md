# Authoring lessons

Each lesson is one TypeScript file exporting a `LessonData` object (see `src/course/types.ts`),
listed in order in its section's `index.ts`. `src/course/lessons/01-sorting/sort-ascending.ts` is
the reference lesson: match its tone, depth, and structure.

Run `npm run verify` (or `npm run verify -- <lesson-id>`) after every change. It compiles and grades
each lesson on TeaVM, the in-browser compiler the site uses, and on the local JDK with
`--release 21`. A lesson is done when verify passes.

## Audience and voice

- Readers are programmers who already know another language and want the Java they need in a
  coding interview. Don't explain what a loop or a hash map is; explain how Java does it, what it
  costs, and where Java bites.
- Never mention Python or compare Java to other specific languages.
- Short, plain sentences. Second person. No filler ("Let's dive in", "simply", "just").
- Lesson code is Java 21. A feature from Java 22+ may appear only in a `note`, labeled with its
  version and a warning to check the interview platform's Java version first.
- Inline markup in text fields: `code`, **bold**, _emphasis_. Nothing else.

## Structure of a lesson

- `blocks`: the teaching part, usually 3–8 blocks. Lead with the idiom in a small code example
  (printing results in trailing comments, `// [1, 2, 3]`), then the rules and gotchas. Use `note`
  for a sidebar that matters in interviews (stability, overflow, immutability, complexity).
  Code examples are fragments; they don't need a class or `main`.
- `challenge`: 2–4 methods on `class Solution` that exercise exactly what the lesson taught.
  `signature` is the Java signature without `public`.
- `complexity`: time and space of the reference solution, with a short reason.
- `hints`: 2–4 hints, from a nudge to nearly the answer. The last may be an interview tip.
- `starterCode` / `solutionCode`: a complete `Main.java` (see below).
- `expectedOutput`: exactly what the solution's `main` prints.
- `solutionExplanation`: 1–3 sentences on why the solution works.
- `testCases`: 4–7 hidden tests (see below).
- `summary`: one sentence for search results and link previews.

## The Java file

```java
import java.util.*;

class Solution {
    public int[] sortNumbers(int[] numbers) {
        // your code here
        return numbers;
    }
}

// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();
        System.out.println(Arrays.toString(solution.sortNumbers(new int[]{3, 1, 2})));
    }
}
```

- `class Solution` (not public) holds instance methods the learner fills in. For a lesson where the
  learner designs a data structure, use a named class instead (`class MinStack`).
- Everything from the `// do not modify below this line` line down must be identical in the starter
  and the solution (verify checks). Keep the shared `Main` in a `const MAIN` in the lesson file, as
  the reference lesson does.
- The starter must compile and run. Give each method a placeholder body that returns the simplest
  value of the right type (the argument, `0`, `false`, `null`, `new int[0]`, `List.of()`), after a
  `// your code here` comment. It must not pass the tests (verify checks).
- `main` prints results so Run can compare them with `expectedOutput`. Print arrays with
  `Arrays.toString` / `Arrays.deepToString`; collections print themselves. Avoid printing a
  `HashMap`/`HashSet` directly (iteration order is unspecified; sort or use a `TreeMap` first).
- Types the tests also need (a `record Student(...)` the methods take or return) go right below the
  marker, before `public class Main`, so they're shared by starter, solution, and tests.
- Imports: `java.util.*` (add `java.util.stream.*` / `java.util.function.*` if used).
- Stick to the standard library the browser runtime supports: `java.lang`, `java.util`
  (collections, `Arrays`, `Collections`, `Comparator`, `Objects`, `Optional`), streams and
  `Collectors`, records, `StringBuilder`, `Math`. No `Scanner`, no I/O, no threads, no
  `java.util.concurrent` beyond `ConcurrentHashMap`/atomics, no `System.exit`. If verify passes on
  TeaVM, it's supported.

## Hidden tests

Each test's `code` is the body of a Java method run with a test context `t`, compiled next to the
learner's file with `java.util.*`, `java.util.function.*`, and `java.util.stream.*` imported:

```ts
{
  name: 'sortNumbers with duplicates and negatives',
  call: 'sortNumbers(new int[]{5, -2, 3, -2})',
  code: `t.equal(new Solution().sortNumbers(new int[]{5, -2, 3, -2}), new int[]{-2, -2, 3, 5});`,
}
```

- `t.equal(actual, expected)` compares structurally: arrays by content, lists and other sequences
  in order, sets and maps by membership. Boxed types must match (`1` is not `1L`; use `3L` for a
  `long` result). An optional third argument is the message shown on failure.
- `t.unordered(actual, expected)` compares elements in any order (arrays or collections).
- `t.check(condition, message)` checks any other invariant (input unchanged, result is a copy,
  heap property).
- The first failing check decides what the learner sees, so put the main check first.
- `call` is what the learner reads: the call with its arguments, Java-style.
- Cover the normal case, duplicates, negatives/empty/single-element edges, and the lesson's
  specific trap (stability, overflow, mutation, uppercase-before-lowercase).
- Tests run in order in one program; a crash in one test still lets the others report, but an
  infinite loop or stack overflow stops the rest.
