/**
 * Course content model. Lessons are plain data authored in `src/course/lessons/**`;
 * nothing here depends on React or the browser, so the verify script can load it too.
 *
 * Text fields accept a small inline markup: `code`, **bold**, and *emphasis*.
 */

export type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'code'; code: string; caption?: string }
  | { type: 'list'; items: string[] }
  | { type: 'note'; title?: string; text: string };

/**
 * A hidden test run by Submit.
 *
 * `code` is the body of a Java method with `t` (a test context) in scope, compiled in a
 * file next to the learner's `Main.java` with `java.util.*`, `java.util.function.*` and
 * `java.util.stream.*` imported. It calls the learner's code and checks the result:
 *
 * - `t.equal(actual, expected)` / `t.equal(actual, expected, message)`: structural
 *   equality (arrays by content, lists in order, sets and maps by membership).
 * - `t.unordered(actual, expected)`: same elements in any order (arrays or collections).
 * - `t.check(condition, message)`: any other invariant, such as "the input wasn't changed".
 *
 * The first failing check decides what the learner sees.
 */
export interface TestCase {
  name: string;
  /** The call as the learner should read it, e.g. `sortWords(["pear", "fig"])`. */
  call: string;
  code: string;
}

export interface ChallengeMethod {
  /** Java signature as written in the starter code, e.g. `int[] sortNumbers(int[] numbers)`. */
  signature: string;
  description: string;
}

export interface LessonData {
  /** URL slug, unique across the course: `/lessons/<id>`. */
  id: string;
  title: string;
  /** One sentence for search results and link previews. */
  summary: string;
  blocks: ContentBlock[];
  challenge: {
    intro: string;
    methods: ChallengeMethod[];
    notes?: string[];
  };
  complexity: {
    time: string;
    space: string;
    note?: string;
  };
  /** Revealed one at a time, from a nudge to nearly the answer. */
  hints: string[];
  /** A complete `Main.java`: `class Solution` to fill in, and a `Main` that prints results. */
  starterCode: string;
  /** What the starter's `main` prints once `Solution` is correct. */
  expectedOutput: string;
  solutionCode: string;
  solutionExplanation: string;
  testCases: TestCase[];
}

export interface SectionData {
  id: string;
  title: string;
  lessons: LessonData[];
}

export interface Section {
  id: string;
  /** 1-based position in the course. */
  number: number;
  title: string;
  lessonIds: string[];
}

export interface Lesson extends LessonData {
  sectionId: string;
  /** 0-based position in the whole course. */
  index: number;
  /** 1-based position within its section. */
  positionInSection: number;
}
