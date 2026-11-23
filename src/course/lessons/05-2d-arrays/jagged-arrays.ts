import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(Arrays.deepToString(solution.pascal(5)));

        int[][] rows = {{1, 2, 3}, {}, {-4, 4}, {10}};
        System.out.println(Arrays.toString(solution.rowSums(rows)));
        System.out.println(Arrays.toString(solution.flatten(rows)));
    }
}
`;

export const jaggedArrays: LessonData = {
  id: 'jagged-arrays',
  title: 'Jagged Arrays',
  summary: 'Build 2D arrays whose rows have different lengths, iterate them safely, and know when a List of Lists fits better.',
  blocks: [
    {
      type: 'paragraph',
      text: 'An `int[][]` holds references to separate `int[]` rows, and nothing forces those rows to have the same length. `new int[n][]` allocates only the outer array; every row starts as `null` until you assign one.',
    },
    {
      type: 'code',
      code: `int[][] triangle = new int[3][];
for (int r = 0; r < 3; r++) triangle[r] = new int[r + 1];
System.out.println(Arrays.deepToString(triangle)); // [[0], [0, 0], [0, 0, 0]]

int[][] ragged = {{1}, {2, 3, 4}, {}};
for (int[] row : ragged) {
    for (int x : row) System.out.print(x + " ");
}
// 1 2 3 4`,
    },
    {
      type: 'list',
      items: [
        'Loop over each row with its own `row.length` (or `grid[r].length`). `grid[0].length` is the width of row 0 only.',
        'Reading `grid[r][0]` while `grid[r]` is still `null` throws `NullPointerException`; an empty row `{}` has length 0 and is safe to loop over.',
        'Rows can be shared or replaced: `grid[2] = grid[0]` makes rows 0 and 2 the same array.',
      ],
    },
    {
      type: 'heading',
      text: 'Pascal’s triangle',
    },
    {
      type: 'paragraph',
      text: 'Row `r` of Pascal’s triangle has `r + 1` entries. Both ends are `1`, and each inner entry is the sum of the two entries above it: `row[c] = prev[c - 1] + prev[c]`. A jagged array stores it with no wasted cells.',
    },
    {
      type: 'heading',
      text: 'A list of lists',
    },
    {
      type: 'paragraph',
      text: 'When you don’t know a row’s length up front (grouping, adjacency lists, results built step by step), use `List<List<Integer>>`. It grows as you add, at the cost of boxing every number.',
    },
    {
      type: 'code',
      code: `List<List<Integer>> rows = new ArrayList<>();
rows.add(new ArrayList<>(List.of(1)));
rows.add(new ArrayList<>(List.of(1, 1)));
rows.get(1).add(5);
System.out.println(rows);              // [[1], [1, 1, 5]]
System.out.println(rows.get(1).get(2)); // 5

int[] last = rows.get(1).stream().mapToInt(Integer::intValue).toArray(); // [1, 1, 5]`,
    },
    {
      type: 'note',
      title: 'Overflow',
      text: 'Pascal’s triangle grows fast. The largest entry of row 33 is about 1.17 billion, so `int` holds every entry through row 33 (34 rows) and row 34 overflows. Use `long` beyond that.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Rows may have any length, including 0:',
    methods: [
      {
        signature: 'int[][] pascal(int n)',
        description: 'Returns the first `n` rows of Pascal’s triangle; row `r` has `r + 1` entries. `0 <= n <= 30`.',
      },
      {
        signature: 'int[] rowSums(int[][] rows)',
        description: 'Returns the sum of each row. An empty row sums to `0`.',
      },
      {
        signature: 'int[] flatten(int[][] rows)',
        description: 'Returns every element in one array, row by row, left to right.',
      },
    ],
  },
  complexity: {
    time: 'O(total number of elements) for each method; `pascal(n)` writes n(n + 1) / 2 entries.',
    space: 'O(total number of elements) for the result.',
  },
  hints: [
    'In `pascal`, allocate `new int[n][]`, then `new int[r + 1]` for each row; set both ends to `1` and fill the middle from row `r - 1`.',
    'In `rowSums` and `flatten`, loop over `rows[r].length`, never `rows[0].length`.',
    'For `flatten`, sum the row lengths first to size the result, then copy with a running index (or `System.arraycopy`).',
    'Interview tip: when rows vary in length, say so and loop with each row’s own length; interviewers watch for `grid[0].length` used everywhere.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[][] pascal(int n) {
        // your code here
        return new int[0][];
    }

    public int[] rowSums(int[][] rows) {
        // your code here
        return new int[0];
    }

    public int[] flatten(int[][] rows) {
        // your code here
        return new int[0];
    }
}
${MAIN}`,
  expectedOutput: `[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]
[6, 0, 0, 10]
[1, 2, 3, -4, 4, 10]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[][] pascal(int n) {
        int[][] triangle = new int[n][];
        for (int r = 0; r < n; r++) {
            triangle[r] = new int[r + 1];
            triangle[r][0] = 1;
            triangle[r][r] = 1;
            for (int c = 1; c < r; c++) triangle[r][c] = triangle[r - 1][c - 1] + triangle[r - 1][c];
        }
        return triangle;
    }

    public int[] rowSums(int[][] rows) {
        int[] sums = new int[rows.length];
        for (int r = 0; r < rows.length; r++) {
            for (int x : rows[r]) sums[r] += x;
        }
        return sums;
    }

    public int[] flatten(int[][] rows) {
        int total = 0;
        for (int[] row : rows) total += row.length;
        int[] result = new int[total];
        int i = 0;
        for (int[] row : rows) {
            for (int x : row) result[i++] = x;
        }
        return result;
    }
}
${MAIN}`,
  solutionExplanation:
    '`pascal` gives each row its own length and builds it from the row above, so no cell is wasted. `rowSums` and `flatten` iterate every row with its own length, which handles empty rows and rows longer than the first; `flatten` sizes its result by summing the lengths first.',
  testCases: [
    {
      name: 'pascal(5)',
      call: 'pascal(5)',
      code: `t.equal(new Solution().pascal(5), new int[][]{{1}, {1, 1}, {1, 2, 1}, {1, 3, 3, 1}, {1, 4, 6, 4, 1}});`,
    },
    {
      name: 'pascal small and large',
      call: 'pascal(0), pascal(1), pascal(30)',
      code: `Solution s = new Solution();
t.equal(s.pascal(1), new int[][]{{1}});
t.equal(s.pascal(0).length, 0);
int[][] big = s.pascal(30);
boolean shaped = big.length == 30;
for (int r = 0; shaped && r < 30; r++) shaped = big[r].length == r + 1;
t.check(shaped, "Row r of the triangle should have exactly r + 1 entries.");
t.equal(big[29][14], 77558760);`,
    },
    {
      name: 'rowSums with empty rows and negatives',
      call: 'rowSums({{1, 2, 3}, {}, {-4, 4}, {-7}})',
      code: `t.equal(new Solution().rowSums(new int[][]{{1, 2, 3}, {}, {-4, 4}, {-7}}), new int[]{6, 0, 0, -7});`,
    },
    {
      name: 'rowSums with rows longer than the first',
      call: 'rowSums({{1}, {1, 2, 3, 4}, {5, 5}})',
      code: `Solution s = new Solution();
t.equal(s.rowSums(new int[][]{{1}, {1, 2, 3, 4}, {5, 5}}), new int[]{1, 10, 10}, "Loop over each row's own length, not rows[0].length.");
t.equal(s.rowSums(new int[][]{}), new int[]{});`,
    },
    {
      name: 'flatten keeps row-by-row order',
      call: 'flatten({{1}, {2, 3, 4}, {}, {5, 6}})',
      code: `Solution s = new Solution();
t.equal(s.flatten(new int[][]{{1}, {2, 3, 4}, {}, {5, 6}}), new int[]{1, 2, 3, 4, 5, 6});
t.equal(s.flatten(new int[][]{{}, {9, -9, 9}}), new int[]{9, -9, 9});`,
    },
    {
      name: 'flatten with nothing in it',
      call: 'flatten({}), flatten({{}, {}})',
      code: `Solution s = new Solution();
t.equal(s.flatten(new int[][]{{}, {}}), new int[]{});
t.equal(s.flatten(new int[][]{}), new int[]{});
t.equal(s.flatten(new int[][]{{7}}), new int[]{7});`,
    },
  ],
};
