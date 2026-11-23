import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
record Point(int x, int y) {}
record Domino(int lo, int hi) {}
record Cell(int r, int c) {}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[][] points = {{1, 2}, {3, 4}, {1, 2}, {-1, 2}, {3, 4}};
        System.out.println(solution.countDistinctPoints(points));

        int[][] dominoes = {{1, 2}, {2, 1}, {3, 4}, {5, 6}, {4, 3}, {1, 2}};
        System.out.println(solution.countEquivalentDominoes(dominoes));

        char[][] grid = {
            "..#.".toCharArray(),
            ".##.".toCharArray(),
            "...#".toCharArray(),
        };
        System.out.println(solution.reachableCells(grid, 0, 0));
        System.out.println(solution.reachableCells(grid, 0, 3));
    }
}
`;

export const compositeKeys: LessonData = {
  id: 'composite-keys',
  title: 'Composite Keys',
  summary: 'Use records as multi-field HashMap and HashSet keys, and avoid the int[] key trap and mutable keys.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Grid and geometry problems need keys made of two or more values: a cell `(r, c)`, a point `(x, y)`. A `HashMap` finds a key by calling `hashCode` and then `equals`, so the key type must define both by value. A record does that for you:',
    },
    {
      type: 'code',
      code: `record Cell(int r, int c) {}

Set<Cell> visited = new HashSet<>();
visited.add(new Cell(1, 2));
System.out.println(visited.contains(new Cell(1, 2))); // true: equal fields, equal records

Map<Cell, Integer> dist = new HashMap<>();
dist.put(new Cell(0, 0), 0);
System.out.println(dist.get(new Cell(0, 0)));        // 0`,
      caption:
        'A record generates `equals` and `hashCode` from all of its fields. Declare it at the top level or nested in a class.',
    },
    {
      type: 'heading',
      text: 'Arrays as keys fail silently',
    },
    {
      type: 'code',
      code: `Set<int[]> seen = new HashSet<>();
seen.add(new int[]{1, 2});
System.out.println(seen.contains(new int[]{1, 2})); // false
seen.add(new int[]{1, 2});
System.out.println(seen.size());                    // 2`,
      caption:
        'Arrays inherit `equals` and `hashCode` from `Object`, which compare identity. It compiles, runs, and gives wrong answers.',
    },
    {
      type: 'heading',
      text: 'Other options and their costs',
    },
    {
      type: 'list',
      items: [
        '**String key**: `r + "," + c`. Works and is quick to write, but builds a new string on every lookup. Keep the separator: without it, `(1, 23)` and `(12, 3)` both become `"123"`.',
        '**List key**: `List.of(r, c)`. Value-based `equals` and `hashCode`, but boxes every number. Never modify a list after using it as a key: its hash changes and the map can no longer find it.',
        '**Encoded number**: `r * cols + c` (or a `long` for large ranges). The fastest, but you must know the bounds.',
        '**Hand-written class**: override _both_ `equals` and `hashCode` (`return Objects.hash(r, c);`). Overriding only `equals` makes equal keys land in different buckets.',
      ],
    },
    {
      type: 'note',
      title: 'Keys must not change',
      text: 'A key’s `hashCode` decides where the map stores it. If a key changes after insertion, the entry is stranded in the wrong bucket: `get` and `contains` miss it, and you can end up with duplicates. Records with primitive fields can’t change, which makes them the safest choice.',
    },
  ],
  challenge: {
    intro:
      'Three records are declared below the `Solution` class: `Point(int x, int y)`, `Domino(int lo, int hi)`, and `Cell(int r, int c)`. Complete the methods:',
    methods: [
      {
        signature: 'int countDistinctPoints(int[][] points)',
        description: 'Each `points[i]` is `{x, y}`. Returns how many different points there are.',
      },
      {
        signature: 'int countEquivalentDominoes(int[][] dominoes)',
        description:
          'Each `dominoes[i]` is `{a, b}`. Two dominoes are equivalent when they have the same two numbers in either order, so `{1, 2}` matches `{2, 1}`. Returns the number of pairs `i < j` of equivalent dominoes.',
      },
      {
        signature: 'int reachableCells(char[][] grid, int row, int col)',
        description:
          "Returns how many open cells (`'.'`) you can reach from `(row, col)`, including the start, moving up, down, left, or right. Walls are `'#'`. Returns 0 if the start is a wall.",
      },
    ],
  },
  complexity: {
    time: 'O(n) for the first two methods; O(R · C) for `reachableCells`, which visits each cell at most once.',
    space: 'O(n) for the set or map; O(R · C) for the visited set and queue.',
  },
  hints: [
    'In `countDistinctPoints`, add `new Point(p[0], p[1])` to a `HashSet` and return its size.',
    'In `countEquivalentDominoes`, normalize each domino to `new Domino(Math.min(a, b), Math.max(a, b))`. Before counting it, add the number of equal dominoes seen so far: `pairs += counts.getOrDefault(key, 0)`.',
    'In `reachableCells`, run a BFS with an `ArrayDeque<Cell>` and a `Set<Cell> visited`. Mark a cell visited when you enqueue it, so it is never queued twice.',
    'Interview tip: a `record` key is one line and can’t be wrong. Use it unless the interviewer asks for the fastest encoding.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int countDistinctPoints(int[][] points) {
        // your code here
        return 0;
    }

    public int countEquivalentDominoes(int[][] dominoes) {
        // your code here
        return 0;
    }

    public int reachableCells(char[][] grid, int row, int col) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `3
4
6
2`,
  solutionCode: `import java.util.*;

class Solution {
    public int countDistinctPoints(int[][] points) {
        Set<Point> distinct = new HashSet<>();
        for (int[] p : points) {
            distinct.add(new Point(p[0], p[1]));
        }
        return distinct.size();
    }

    public int countEquivalentDominoes(int[][] dominoes) {
        Map<Domino, Integer> counts = new HashMap<>();
        int pairs = 0;
        for (int[] d : dominoes) {
            Domino key = new Domino(Math.min(d[0], d[1]), Math.max(d[0], d[1]));
            pairs += counts.getOrDefault(key, 0);
            counts.merge(key, 1, Integer::sum);
        }
        return pairs;
    }

    public int reachableCells(char[][] grid, int row, int col) {
        if (grid[row][col] != '.') {
            return 0;
        }
        int[][] moves = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        Set<Cell> visited = new HashSet<>();
        Deque<Cell> queue = new ArrayDeque<>();
        Cell start = new Cell(row, col);
        visited.add(start);
        queue.add(start);
        while (!queue.isEmpty()) {
            Cell cell = queue.poll();
            for (int[] m : moves) {
                int r = cell.r() + m[0];
                int c = cell.c() + m[1];
                if (r < 0 || r >= grid.length || c < 0 || c >= grid[r].length || grid[r][c] != '.') {
                    continue;
                }
                Cell next = new Cell(r, c);
                if (visited.add(next)) {
                    queue.add(next);
                }
            }
        }
        return visited.size();
    }
}
${MAIN}`,
  solutionExplanation:
    'Records compare by their fields, so equal points, dominoes, and cells collapse to one key. Normalizing each domino to `(min, max)` makes `{1, 2}` and `{2, 1}` the same key, and adding the count seen so far counts each pair once. The BFS marks cells in `visited` as it queues them, and the size of `visited` is the answer.',
  testCases: [
    {
      name: 'countDistinctPoints with duplicates',
      call: 'countDistinctPoints({{1, 2}, {3, 4}, {1, 2}, {-1, 2}, {3, 4}})',
      code: `t.equal(new Solution().countDistinctPoints(new int[][]{{1, 2}, {3, 4}, {1, 2}, {-1, 2}, {3, 4}}), 3,
    "Equal points must count once. int[] keys compare by identity; use a record.");`,
    },
    {
      name: 'countDistinctPoints treats (x, y) and (y, x) as different',
      call: 'countDistinctPoints({{1, 2}, {2, 1}, {12, 3}, {1, 23}})',
      code: `t.equal(new Solution().countDistinctPoints(new int[][]{{1, 2}, {2, 1}, {12, 3}, {1, 23}}), 4);`,
    },
    {
      name: 'countDistinctPoints on empty and single inputs',
      call: 'countDistinctPoints({}), countDistinctPoints({{0, 0}})',
      code: `Solution s = new Solution();
t.equal(s.countDistinctPoints(new int[][]{}), 0);
t.equal(s.countDistinctPoints(new int[][]{{0, 0}}), 1);`,
    },
    {
      name: 'countEquivalentDominoes matches either order',
      call: 'countEquivalentDominoes({{1, 2}, {2, 1}, {3, 4}, {5, 6}})',
      code: `t.equal(new Solution().countEquivalentDominoes(new int[][]{{1, 2}, {2, 1}, {3, 4}, {5, 6}}), 1);`,
    },
    {
      name: 'countEquivalentDominoes counts every pair',
      call: 'countEquivalentDominoes({{1, 2}, {1, 2}, {1, 1}, {2, 1}, {2, 2}}), countEquivalentDominoes({})',
      code: `Solution s = new Solution();
t.equal(s.countEquivalentDominoes(new int[][]{{1, 2}, {1, 2}, {1, 1}, {2, 1}, {2, 2}}), 3,
    "Three equivalent dominoes form 3 pairs, not 2.");
t.equal(s.countEquivalentDominoes(new int[][]{}), 0);`,
    },
    {
      name: 'reachableCells',
      call: 'reachableCells(["..#.", ".##.", "...#"], 0, 0)',
      code: `char[][] grid = {"..#.".toCharArray(), ".##.".toCharArray(), "...#".toCharArray()};
Solution s = new Solution();
t.equal(s.reachableCells(grid, 0, 0), 6);
t.equal(s.reachableCells(grid, 1, 3), 2);`,
    },
    {
      name: 'reachableCells from a wall or a single cell',
      call: 'reachableCells(["#."], 0, 0), reachableCells(["."], 0, 0)',
      code: `Solution s = new Solution();
t.equal(s.reachableCells(new char[][]{"#.".toCharArray()}, 0, 0), 0);
t.equal(s.reachableCells(new char[][]{".".toCharArray()}, 0, 0), 1);`,
    },
  ],
};
