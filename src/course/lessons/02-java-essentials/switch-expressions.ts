import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
sealed interface Shape permits Circle, Rect {}
record Circle(double radius) implements Shape {}
record Rect(double width, double height) implements Shape {}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.daysInMonth(2, true) + " " + solution.daysInMonth(4, false) + " " + solution.daysInMonth(12, false));
        System.out.println(solution.describe(42) + " | " + solution.describe("hi") + " | " + solution.describe(new int[3]));
        System.out.println(solution.describe(null) + " | " + solution.describe(2.5));
        System.out.println(String.format("%.2f %.2f", solution.area(new Circle(1)), solution.area(new Rect(2, 3.5))));
    }
}
`;

export const switchExpressions: LessonData = {
  id: 'switch-expressions',
  title: 'Switch Expressions and Patterns',
  summary:
    'Use arrow switch as an expression, match on types and record components with patterns, and let sealed interfaces make a switch exhaustive.',
  blocks: [
    {
      type: 'paragraph',
      text: 'The arrow form of `switch` is an **expression**: it produces a value you can assign or return. Arrow cases never fall through, so there is no `break` to forget, and one case can list several labels:',
    },
    {
      type: 'code',
      code: `String kind = switch (day) {
    case 1, 7 -> "weekend";
    case 2, 3, 4, 5, 6 -> "weekday";
    default -> throw new IllegalArgumentException("bad day: " + day);
};`,
    },
    {
      type: 'list',
      items: [
        'A switch expression must be **exhaustive**: every possible value needs a case. For `int` and `String` that means a `default`; for an `enum` listing every constant is enough.',
        'A case that needs statements uses a block and `yield` to produce its value: `case 2 -> { int d = leap ? 29 : 28; yield d; }`. `return` is not allowed inside a switch expression.',
        '`throw` counts as a case body, which is the usual way to reject invalid input.',
        'The old colon form (`case 1: ... break;`) still works and still falls through without `break`. Prefer arrows.',
      ],
    },
    {
      type: 'heading',
      text: 'Type patterns',
    },
    {
      type: 'paragraph',
      text: '`instanceof` can declare a variable of the tested type, so no cast is needed: `if (obj instanceof String s && !s.isEmpty())`. Since Java 21, `switch` takes the same patterns, plus `when` guards and an explicit `case null`:',
    },
    {
      type: 'code',
      code: `static String format(Object o) {
    return switch (o) {
        case null -> "nothing";
        case Integer i when i < 0 -> "minus " + -i;
        case Integer i -> "int " + i;
        case String s -> "text " + s;
        default -> o.toString();
    };
}`,
      caption:
        'Cases are tried top to bottom. A guarded case must come before the unguarded one for the same type, or the compiler reports it as unreachable. Without `case null`, a `null` selector throws `NullPointerException`.',
    },
    {
      type: 'heading',
      text: 'Sealed interfaces and record patterns',
    },
    {
      type: 'paragraph',
      text: 'A `sealed` interface lists every type that may implement it. The compiler then knows all the cases, so a switch that covers each permitted type is exhaustive **without** a `default`. Add a new shape later and every switch that misses it stops compiling. A **record pattern** takes the record apart in the case label:',
    },
    {
      type: 'code',
      code: `sealed interface Shape permits Circle, Square {}
record Circle(double radius) implements Shape {}
record Square(double side) implements Shape {}

static double perimeter(Shape shape) {
    return switch (shape) {
        case Circle(double r) -> 2 * Math.PI * r;   // binds the component to r
        case Square s -> 4 * s.side();              // a plain type pattern works too
    };
}`,
    },
    {
      type: 'note',
      title: 'Java 22+: unnamed variables',
      text: 'Java 22 lets you write `_` for a pattern variable you don’t use: `case Circle(_) -> "circle"`. Check the interview platform’s Java version before using it; on Java 21 it does not compile, so write `case Circle c` instead.',
    },
  ],
  challenge: {
    intro:
      'A `sealed interface Shape` with two records, `Circle(double radius)` and `Rect(double width, double height)`, is declared below the `Solution` class. Complete the methods with switch expressions:',
    methods: [
      {
        signature: 'int daysInMonth(int month, boolean leap)',
        description:
          'Returns the number of days in month 1–12: February has 29 days when `leap` is true and 28 otherwise. Throws `IllegalArgumentException` for any other month.',
      },
      {
        signature: 'String describe(Object value)',
        description:
          'Returns `"null"` for `null`; `"negative integer"` for an `Integer` below zero and `"integer " + value` for any other `Integer`; `"empty string"` for `""` and `"string of length " + length` for any other `String`; `"int array of length " + length` for an `int[]`; and `"unknown"` for anything else.',
      },
      {
        signature: 'double area(Shape shape)',
        description: 'Returns the area of the shape: `Math.PI * r * r` for a circle, width times height for a rectangle.',
      },
    ],
  },
  complexity: {
    time: 'O(1) for each method.',
    space: 'O(1).',
  },
  hints: [
    'In `daysInMonth`, group the months: `case 1, 3, 5, 7, 8, 10, 12 -> 31;` and `case 4, 6, 9, 11 -> 30;`, then February and a `default` that throws.',
    'In `describe`, switch on `value` with `case null`, guarded cases like `case Integer i when i < 0`, and `case int[] a`. Put each guarded case above the plain one for the same type.',
    'In `area`, `case Circle(double r) -> Math.PI * r * r;` and `case Rect(double w, double h) -> w * h;` cover every `Shape`, so no `default` is needed.',
    'Interview tip: modeling a fixed set of variants as a sealed interface of records, and switching over it, reads as clean, modern Java.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int daysInMonth(int month, boolean leap) {
        // your code here
        return 0;
    }

    public String describe(Object value) {
        // your code here
        return "";
    }

    public double area(Shape shape) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `29 30 31
integer 42 | string of length 2 | int array of length 3
null | unknown
3.14 7.00`,
  solutionCode: `import java.util.*;

class Solution {
    public int daysInMonth(int month, boolean leap) {
        return switch (month) {
            case 1, 3, 5, 7, 8, 10, 12 -> 31;
            case 4, 6, 9, 11 -> 30;
            case 2 -> {
                if (leap) yield 29;
                yield 28;
            }
            default -> throw new IllegalArgumentException("Invalid month: " + month);
        };
    }

    public String describe(Object value) {
        return switch (value) {
            case null -> "null";
            case Integer i when i < 0 -> "negative integer";
            case Integer i -> "integer " + i;
            case String s when s.isEmpty() -> "empty string";
            case String s -> "string of length " + s.length();
            case int[] a -> "int array of length " + a.length;
            default -> "unknown";
        };
    }

    public double area(Shape shape) {
        return switch (shape) {
            case Circle(double r) -> Math.PI * r * r;
            case Rect(double w, double h) -> w * h;
        };
    }
}
${MAIN}`,
  solutionExplanation:
    '`daysInMonth` groups months with multiple labels and uses `yield` for February, with a throwing `default`. `describe` relies on cases being tried in order, so the guarded patterns come first and `case null` handles `null` before any type test. `area` needs no `default` because `Shape` is sealed and both permitted records are covered.',
  testCases: [
    {
      name: 'daysInMonth for every month',
      call: 'daysInMonth(1..12, false)',
      code: `Solution s = new Solution();
int[] expected = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
int[] actual = new int[12];
for (int m = 1; m <= 12; m++) actual[m - 1] = s.daysInMonth(m, false);
t.equal(actual, expected);`,
    },
    {
      name: 'daysInMonth in a leap year',
      call: 'daysInMonth(2, true), daysInMonth(3, true)',
      code: `Solution s = new Solution();
t.equal(s.daysInMonth(2, true), 29);
t.equal(s.daysInMonth(3, true), 31, "Only February changes in a leap year.");`,
    },
    {
      name: 'daysInMonth rejects invalid months',
      call: 'daysInMonth(0, false), daysInMonth(13, false)',
      code: `Solution s = new Solution();
for (int month : new int[]{0, 13, -1}) {
    boolean threw = false;
    try {
        s.daysInMonth(month, false);
    } catch (IllegalArgumentException e) {
        threw = true;
    }
    t.check(threw, "daysInMonth(" + month + ", false) should throw IllegalArgumentException.");
}`,
    },
    {
      name: 'describe integers and strings',
      call: 'describe(7), describe(-3), describe(0), describe("abc"), describe("")',
      code: `Solution s = new Solution();
t.equal(s.describe(7), "integer 7");
t.equal(s.describe(-3), "negative integer");
t.equal(s.describe(0), "integer 0");
t.equal(s.describe("abc"), "string of length 3");
t.equal(s.describe(""), "empty string");`,
    },
    {
      name: 'describe null, arrays and other types',
      call: 'describe(null), describe(new int[5]), describe(3L), describe(List.of(1))',
      code: `Solution s = new Solution();
t.equal(s.describe(null), "null", "Without case null, switching on null throws NullPointerException.");
t.equal(s.describe(new int[5]), "int array of length 5");
t.equal(s.describe(new int[0]), "int array of length 0");
t.equal(s.describe(3L), "unknown", "A Long is not an Integer.");
t.equal(s.describe(List.of(1)), "unknown");`,
    },
    {
      name: 'area of circles and rectangles',
      call: 'area(new Circle(2)), area(new Rect(3, 4.5)), area(new Circle(0))',
      code: `Solution s = new Solution();
double circle = s.area(new Circle(2));
t.check(Math.abs(circle - 4 * Math.PI) < 1e-9, "area(new Circle(2)) should be 4π ≈ 12.566, got " + circle);
t.equal(s.area(new Rect(3, 4.5)), 13.5);
t.equal(s.area(new Circle(0)), 0.0);`,
    },
  ],
};
