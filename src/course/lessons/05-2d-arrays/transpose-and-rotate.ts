import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[][] wide = {{1, 2, 3}, {4, 5, 6}};
        System.out.println(Arrays.deepToString(solution.transpose(wide)));

        int[][] square = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        solution.rotate(square);
        System.out.println(Arrays.deepToString(square));

        int[][] copy = solution.deepCopy(square);
        copy[0][0] = 0;
        System.out.println(Arrays.deepToString(square));
        System.out.println(Arrays.deepToString(copy));
    }
}
`;

export const transposeAndRotate: LessonData = {
  id: 'transpose-and-rotate',
  title: 'Transpose and Rotate',
  summary: 'Transpose a matrix into a new array, rotate a square matrix in place, and deep-copy a 2D array.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Transposing swaps rows and columns: cell `(r, c)` moves to `(c, r)`. A `rows x cols` matrix becomes `cols x rows`, so unless it is square, the result needs a new array.',
    },
    {
      type: 'code',
      code: `int[][] m = {{1, 2, 3}, {4, 5, 6}};
int rows = m.length, cols = m[0].length;
int[][] t = new int[cols][rows];
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) t[c][r] = m[r][c];
}
System.out.println(Arrays.deepToString(t)); // [[1, 4], [2, 5], [3, 6]]`,
      caption: 'Allocate `new int[cols][rows]`, not `new int[rows][cols]`.',
    },
    {
      type: 'heading',
      text: 'Rotating 90° clockwise in place',
    },
    {
      type: 'paragraph',
      text: 'For a square `n x n` matrix, a clockwise rotation is a transpose followed by reversing each row. Both steps swap cells in place, so the rotation needs O(1) extra space. Counterclockwise is a transpose followed by reversing the order of the rows.',
    },
    {
      type: 'code',
      code: `// transpose in place: swap across the main diagonal
for (int i = 0; i < n; i++) {
    for (int j = i + 1; j < n; j++) {
        int tmp = m[i][j];
        m[i][j] = m[j][i];
        m[j][i] = tmp;
    }
}
// {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}} is now {{1, 4, 7}, {2, 5, 8}, {3, 6, 9}}`,
      caption: 'Start `j` at `i + 1`. Starting at `0` swaps every pair twice and leaves the matrix unchanged.',
    },
    {
      type: 'heading',
      text: '`clone()` is shallow',
    },
    {
      type: 'code',
      code: `int[][] m = {{1, 2}, {3, 4}};
int[][] shallow = m.clone();  // new outer array, same row arrays
shallow[0][0] = 99;
System.out.println(m[0][0]);  // 99

int[][] deep = new int[m.length][];
for (int r = 0; r < m.length; r++) deep[r] = m[r].clone();
deep[0][0] = 7;
System.out.println(m[0][0]);  // 99`,
    },
    {
      type: 'list',
      items: [
        '`m.clone()`, `Arrays.copyOf(m, m.length)` and `System.arraycopy` on the outer array all copy row **references**. Changing a cell through the copy changes the original.',
        'A deep copy clones each row: `m[r].clone()` or `Arrays.copyOf(m[r], m[r].length)`. It works for jagged arrays too.',
        'One line: `Arrays.stream(m).map(int[]::clone).toArray(int[][]::new)`.',
      ],
    },
    {
      type: 'note',
      title: 'Comparing 2D arrays',
      text: '`Arrays.equals(a, b)` on two `int[][]`s compares rows by reference, so it returns `false` for a correct deep copy. Use `Arrays.deepEquals(a, b)`, which compares the contents.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int[][] transpose(int[][] m)',
        description:
          'Returns a new `cols x rows` matrix where `result[c][r] == m[r][c]`. `m` is rectangular with at least one row and one column, and must not be changed.',
      },
      {
        signature: 'void rotate(int[][] m)',
        description: 'Rotates the square matrix `m` 90° clockwise, in place. `m` may be empty.',
      },
      {
        signature: 'int[][] deepCopy(int[][] m)',
        description:
          'Returns a copy that shares no arrays with `m`: changing either one afterwards must not change the other. Rows may have different lengths.',
      },
    ],
  },
  complexity: {
    time: 'O(rows · cols) for each method: every cell is read or swapped a constant number of times.',
    space: 'O(rows · cols) for the transpose and the copy; O(1) extra for `rotate`.',
  },
  hints: [
    'In `transpose`, read `rows = m.length` and `cols = m[0].length`, allocate `new int[cols][rows]`, and write `t[c][r] = m[r][c]`.',
    'In `rotate`, transpose in place with `j` starting at `i + 1`, then reverse each row with two indices moving toward the middle.',
    'In `deepCopy`, allocate `new int[m.length][]` and assign `copy[r] = m[r].clone()` for every row.',
    'Interview tip: for rotation, write out a 3 x 3 example and check where one corner goes before coding. It catches clockwise/counterclockwise mix-ups.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[][] transpose(int[][] m) {
        // your code here
        return m;
    }

    public void rotate(int[][] m) {
        // your code here
    }

    public int[][] deepCopy(int[][] m) {
        // your code here
        return m;
    }
}
${MAIN}`,
  expectedOutput: `[[1, 4], [2, 5], [3, 6]]
[[7, 4, 1], [8, 5, 2], [9, 6, 3]]
[[7, 4, 1], [8, 5, 2], [9, 6, 3]]
[[0, 4, 1], [8, 5, 2], [9, 6, 3]]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[][] transpose(int[][] m) {
        int rows = m.length, cols = m[0].length;
        int[][] t = new int[cols][rows];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) t[c][r] = m[r][c];
        }
        return t;
    }

    public void rotate(int[][] m) {
        int n = m.length;
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                int tmp = m[i][j];
                m[i][j] = m[j][i];
                m[j][i] = tmp;
            }
        }
        for (int[] row : m) {
            for (int lo = 0, hi = n - 1; lo < hi; lo++, hi--) {
                int tmp = row[lo];
                row[lo] = row[hi];
                row[hi] = tmp;
            }
        }
    }

    public int[][] deepCopy(int[][] m) {
        int[][] copy = new int[m.length][];
        for (int r = 0; r < m.length; r++) copy[r] = m[r].clone();
        return copy;
    }
}
${MAIN}`,
  solutionExplanation:
    '`transpose` writes each cell to its mirrored position in a new `cols x rows` array. `rotate` swaps each pair across the diagonal once and then reverses every row, which together move `(r, c)` to `(c, n - 1 - r)`: a clockwise turn. `deepCopy` clones every row, so the copy shares no row arrays with the original.',
  testCases: [
    {
      name: 'transpose a non-square matrix',
      call: 'transpose({{1, 2, 3}, {4, 5, 6}}), transpose({{1}, {2}, {3}})',
      code: `Solution s = new Solution();
t.equal(s.transpose(new int[][]{{1, 2, 3}, {4, 5, 6}}), new int[][]{{1, 4}, {2, 5}, {3, 6}}, "A 2 x 3 matrix transposes to 3 x 2: allocate new int[cols][rows].");
t.equal(s.transpose(new int[][]{{1}, {2}, {3}}), new int[][]{{1, 2, 3}});`,
    },
    {
      name: 'transpose leaves the input alone',
      call: 'transpose({{1, -2}, {3, 4}}), then read the input',
      code: `int[][] m = {{1, -2}, {3, 4}};
t.equal(new Solution().transpose(m), new int[][]{{1, 3}, {-2, 4}});
t.equal(m, new int[][]{{1, -2}, {3, 4}}, "transpose must return a new array and leave m unchanged.");`,
    },
    {
      name: 'rotate 3 x 3',
      call: 'rotate({{1, 2, 3}, {4, 5, 6}, {7, 8, 9}})',
      code: `int[][] m = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
new Solution().rotate(m);
t.equal(m, new int[][]{{7, 4, 1}, {8, 5, 2}, {9, 6, 3}}, "Clockwise: the first column, read bottom to top, becomes the first row.");`,
    },
    {
      name: 'rotate even sizes',
      call: 'rotate(4 x 4), rotate({{1, 2}, {3, 4}})',
      code: `int[][] m = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}, {13, 14, 15, 16}};
new Solution().rotate(m);
t.equal(m, new int[][]{{13, 9, 5, 1}, {14, 10, 6, 2}, {15, 11, 7, 3}, {16, 12, 8, 4}});
int[][] two = {{1, 2}, {3, 4}};
new Solution().rotate(two);
t.equal(two, new int[][]{{3, 1}, {4, 2}});`,
    },
    {
      name: 'rotate tiny matrices',
      call: 'rotate({{5}}), rotate(new int[0][0])',
      code: `int[][] one = {{5}};
new Solution().rotate(one);
t.equal(one, new int[][]{{5}});
int[][] empty = new int[0][0];
new Solution().rotate(empty);
t.equal(empty.length, 0);
int[][] neg = {{-1, -2}, {-3, -4}};
new Solution().rotate(neg);
t.equal(neg, new int[][]{{-3, -1}, {-4, -2}});`,
    },
    {
      name: 'deepCopy is independent',
      call: 'copy = deepCopy({{1, 2}, {3, 4}}); copy[0][0] = 99',
      code: `int[][] m = {{1, 2}, {3, 4}};
int[][] copy = new Solution().deepCopy(m);
t.equal(copy, new int[][]{{1, 2}, {3, 4}});
t.check(copy != m, "deepCopy must return a new outer array.");
t.check(copy[0] != m[0] && copy[1] != m[1], "Each row must be a new array too: clone() on the outer array is shallow.");
copy[0][0] = 99;
m[1][1] = -1;
t.equal(m, new int[][]{{1, 2}, {3, -1}});
t.equal(copy, new int[][]{{99, 2}, {3, 4}});`,
    },
    {
      name: 'deepCopy with jagged and empty input',
      call: 'deepCopy({{1}, {2, 3, 4}, {}}), deepCopy(new int[0][])',
      code: `Solution s = new Solution();
int[][] m = {{1}, {2, 3, 4}, {}};
int[][] copy = s.deepCopy(m);
t.equal(copy, new int[][]{{1}, {2, 3, 4}, {}});
t.check(copy != m && copy[1] != m[1], "deepCopy must copy every row.");
t.equal(s.deepCopy(new int[0][]).length, 0);`,
    },
  ],
};
