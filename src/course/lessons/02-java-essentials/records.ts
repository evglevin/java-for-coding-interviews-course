import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
record Point(int x, int y) {}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        List<Point> points = List.of(new Point(1, 2), new Point(-3, 4), new Point(1, 2), new Point(0, -5));
        System.out.println(solution.translate(new Point(1, 2), 10, -10));
        System.out.println(solution.farthest(points));
        System.out.println(solution.countDistinct(points));
    }
}
`;

export const records: LessonData = {
  id: 'records',
  title: 'Records',
  summary: 'Declare small immutable data types with record, use them as map and set keys, and add validation and methods.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A `record` (Java 16+) declares a class whose whole job is to hold some values. One line gives you a constructor, an accessor per component, and `equals`, `hashCode` and `toString` based on all the components:',
    },
    {
      type: 'code',
      code: `record Point(int x, int y) {}

Point p = new Point(3, 4);
System.out.println(p.x());                       // 3: accessor is x(), not getX()
System.out.println(p);                           // Point[x=3, y=4]
System.out.println(p.equals(new Point(3, 4)));   // true: compares components`,
    },
    {
      type: 'paragraph',
      text: 'In interviews, records replace `int[]` pairs and hand-written classes for things like coordinates, intervals, edges and `(node, distance)` states. Declare one at the top level of the file or nested inside a class; a nested record is implicitly `static`, so it can be created from anywhere.',
    },
    {
      type: 'heading',
      text: 'Records as map and set keys',
    },
    {
      type: 'paragraph',
      text: 'Because `equals` and `hashCode` come from the components, two records with the same values are the same key. An `int[]` uses identity instead: two arrays with the same contents are different keys, so `visited.contains(new int[]{r, c})` is always `false`.',
    },
    {
      type: 'code',
      code: `Set<Point> visited = new HashSet<>();
visited.add(new Point(0, 0));
System.out.println(visited.contains(new Point(0, 0)));   // true

Set<int[]> broken = new HashSet<>();
broken.add(new int[]{0, 0});
System.out.println(broken.contains(new int[]{0, 0}));   // false`,
    },
    {
      type: 'heading',
      text: 'Validation, factories and methods',
    },
    {
      type: 'code',
      code: `record Interval(int start, int end) {
    Interval {                                  // compact constructor
        if (start > end) throw new IllegalArgumentException(start + " > " + end);
    }

    static Interval of(int a, int b) {          // static factory
        return new Interval(Math.min(a, b), Math.max(a, b));
    }

    int length() { return end - start; }        // instance method

    Interval withEnd(int newEnd) { return new Interval(start, newEnd); }
}`,
      caption:
        'A compact constructor has no parameter list; it runs before the fields are assigned and can check or normalize the parameters.',
    },
    {
      type: 'note',
      title: 'Immutable, but only shallowly',
      text: 'Record fields are `final`: there are no setters, so to "change" one you build a new record (`withEnd` above). The values they point to are not frozen, though. A `record Path(List<Integer> nodes)` can still have `nodes` modified through `path.nodes().add(5)`, which also changes its `hashCode` and breaks it as a map key. Keep record components immutable (`List.copyOf` in the compact constructor) or primitive.',
    },
    {
      type: 'paragraph',
      text: 'Records cannot extend another class (they extend `java.lang.Record`) and cannot declare extra instance fields, but they can implement interfaces, including `Comparable`.',
    },
  ],
  challenge: {
    intro: 'A `record Point(int x, int y)` is declared below the `Solution` class. Complete the methods:',
    methods: [
      {
        signature: 'Point translate(Point p, int dx, int dy)',
        description: 'Returns a new point moved by `dx` and `dy`. `p` itself is not changed.',
      },
      {
        signature: 'Point farthest(List<Point> points)',
        description:
          'Returns the point farthest from the origin `(0, 0)`; on a tie, the one that comes first. Returns `null` for an empty list. Coordinates can be anywhere in the `int` range.',
      },
      {
        signature: 'int countDistinct(List<Point> points)',
        description: 'Returns the number of different points in the list.',
      },
    ],
  },
  complexity: {
    time: 'O(1) for `translate`; O(n) for `farthest`; O(n) on average for `countDistinct`.',
    space: 'O(n) for the set in `countDistinct`; O(1) otherwise.',
  },
  hints: [
    'Records are immutable, so `translate` returns `new Point(p.x() + dx, p.y() + dy)`.',
    'Compare squared distances, `x * x + y * y`, to avoid `Math.sqrt`. Compute them as `long`: in `int` math, the sum passes `Integer.MAX_VALUE` once coordinates reach about 33,000, so write `1L * x * x + 1L * y * y`.',
    '`new HashSet<>(points).size()` works because `Point` has value-based `equals` and `hashCode`.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public Point translate(Point p, int dx, int dy) {
        // your code here
        return p;
    }

    public Point farthest(List<Point> points) {
        // your code here
        return null;
    }

    public int countDistinct(List<Point> points) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `Point[x=11, y=-8]
Point[x=-3, y=4]
3`,
  solutionCode: `import java.util.*;

class Solution {
    public Point translate(Point p, int dx, int dy) {
        return new Point(p.x() + dx, p.y() + dy);
    }

    public Point farthest(List<Point> points) {
        Point best = null;
        long bestDistance = -1;
        for (Point p : points) {
            long distance = 1L * p.x() * p.x() + 1L * p.y() * p.y();
            if (distance > bestDistance) {
                best = p;
                bestDistance = distance;
            }
        }
        return best;
    }

    public int countDistinct(List<Point> points) {
        return new HashSet<>(points).size();
    }
}
${MAIN}`,
  solutionExplanation:
    '`translate` builds a new record, since a record cannot be changed. `farthest` keeps the point with the largest squared distance, computed in `long` so large coordinates do not overflow, and uses `>` so the first of equal points wins. `countDistinct` relies on the generated `equals` and `hashCode`, which make equal points collapse in a `HashSet`.',
  testCases: [
    {
      name: 'translate returns a new point',
      call: 'translate(new Point(1, 2), 3, -5)',
      code: `Point p = new Point(1, 2);
t.equal(new Solution().translate(p, 3, -5), new Point(4, -3));
t.equal(p, new Point(1, 2), "The original point must not change.");`,
    },
    {
      name: 'farthest from the origin',
      call: 'farthest([(1, 1), (-6, 2), (3, -5), (0, 0)])',
      code: `t.equal(new Solution().farthest(List.of(new Point(1, 1), new Point(-6, 2), new Point(3, -5), new Point(0, 0))),
    new Point(-6, 2));`,
    },
    {
      name: 'farthest breaks ties by position',
      call: 'farthest([(3, 4), (0, -5), (5, 0)])',
      code: `t.equal(new Solution().farthest(List.of(new Point(3, 4), new Point(0, -5), new Point(5, 0))), new Point(3, 4),
    "All three are at distance 5; return the first.");`,
    },
    {
      name: 'farthest with large coordinates',
      call: 'farthest([(100000, 0), (99999, 99999)])',
      code: `t.equal(new Solution().farthest(List.of(new Point(100_000, 0), new Point(99_999, 99_999))), new Point(99_999, 99_999),
    "x * x overflows an int here; compute squared distances as long.");`,
    },
    {
      name: 'farthest of empty and single lists',
      call: 'farthest([]), farthest([(0, 0)])',
      code: `Solution s = new Solution();
t.equal(s.farthest(List.of()), null);
t.equal(s.farthest(List.of(new Point(0, 0))), new Point(0, 0));`,
    },
    {
      name: 'countDistinct with duplicates',
      call: 'countDistinct([(1, 2), (2, 1), (1, 2), (-1, -2), (2, 1)])',
      code: `Solution s = new Solution();
t.equal(s.countDistinct(List.of(new Point(1, 2), new Point(2, 1), new Point(1, 2), new Point(-1, -2), new Point(2, 1))), 3);
t.equal(s.countDistinct(List.of()), 0);`,
    },
  ],
};
