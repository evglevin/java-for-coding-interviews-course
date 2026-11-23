import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(Arrays.deepToString(solution.createGrid(2, 3, 7)));
        System.out.println(Arrays.deepToString(solution.identity(3)));
        System.out.println(Arrays.deepToString(solution.toGrid(new String[]{"#..", ".#.", "..#"})));
    }
}
`;

export const creatingGrids: LessonData = {
  id: 'creating-grids',
  title: 'Creating a Grid',
  summary: 'Allocate and fill 2D arrays, read their dimensions, print them, and turn strings into a char grid.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A Java 2D array is an array of row arrays. `new int[rows][cols]` allocates the outer array and every row, all zero-filled (`0`, `false`, `null`, or char code 0, by element type). Index it as `grid[row][col]`.',
    },
    {
      type: 'code',
      code: `int[][] grid = new int[2][3];
grid[1][2] = 5;
System.out.println(grid.length);    // 2  (rows)
System.out.println(grid[0].length); // 3  (columns)
System.out.println(Arrays.deepToString(grid)); // [[0, 0, 0], [0, 0, 5]]

int[][] literal = {{1, 2}, {3, 4}};
System.out.println(Arrays.toString(literal)); // [[I@4e25154f, [I@70dea4e]`,
    },
    {
      type: 'list',
      items: [
        '`grid.length` is the number of rows; `grid[0].length` is the number of columns. Read them into `rows` and `cols` once at the top of the method.',
        '`grid[0].length` throws `ArrayIndexOutOfBoundsException` when the grid has no rows. Check `grid.length == 0` first if that input is possible.',
        '`Arrays.toString` prints each row’s identity; `Arrays.deepToString` prints the contents.',
      ],
    },
    {
      type: 'heading',
      text: 'Filling with a value',
    },
    {
      type: 'paragraph',
      text: '`Arrays.fill` works on one-dimensional arrays, so fill each row:',
    },
    {
      type: 'code',
      code: `int[][] dist = new int[3][4];
for (int[] row : dist) Arrays.fill(row, -1);`,
    },
    {
      type: 'note',
      title: 'One row, many references',
      text: '`Arrays.fill(grid, row)` stores the **same** row array in every slot. Writing `grid[0][0] = 1` then changes `grid[1][0]` and every other row too, because they are one array. Each row needs its own `new int[cols]` (or `Arrays.fill` on each row of a `new int[rows][cols]`).',
    },
    {
      type: 'code',
      code: `int[] row = new int[2];
int[][] grid = new int[3][];
Arrays.fill(grid, row);  // three references to one row
grid[0][0] = 1;
System.out.println(Arrays.deepToString(grid)); // [[1, 0], [1, 0], [1, 0]]`,
    },
    {
      type: 'heading',
      text: 'Character grids',
    },
    {
      type: 'paragraph',
      text: 'Grid puzzles often arrive as `String[]`. Strings are immutable, so convert each line with `toCharArray()`, which returns a new `char[]` you can modify. `new String(row)` turns a row back into a string.',
    },
    {
      type: 'code',
      code: `String[] lines = {"#.", ".#"};
char[][] grid = new char[lines.length][];
for (int r = 0; r < lines.length; r++) grid[r] = lines[r].toCharArray();
grid[0][1] = '#';
System.out.println(new String(grid[0])); // ##
System.out.println(lines[0]);            // #.`,
      caption: '`new char[lines.length][]` leaves the rows `null` until you assign them.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one returns a new grid:',
    methods: [
      {
        signature: 'int[][] createGrid(int rows, int cols, int value)',
        description: 'Returns a `rows x cols` grid with every cell set to `value`. Each row must be its own array.',
      },
      {
        signature: 'int[][] identity(int n)',
        description: 'Returns the `n x n` identity matrix: `1` on the main diagonal, `0` elsewhere.',
      },
      {
        signature: 'char[][] toGrid(String[] lines)',
        description: 'Returns a char grid where row `r` holds the characters of `lines[r]`.',
      },
    ],
    notes: ['`rows`, `cols` and `n` can be `0`.'],
  },
  complexity: {
    time: 'O(rows · cols) for each method: every cell is written once.',
    space: 'O(rows · cols) for the new grid.',
  },
  hints: [
    '`new int[rows][cols]` already gives each row its own array; fill each one with `Arrays.fill(row, value)`.',
    '`new int[n][n]` is all zeros, so `identity` only sets `m[i][i] = 1`.',
    'In `toGrid`, allocate `new char[lines.length][]` and assign `grid[r] = lines[r].toCharArray()`.',
    'Interview tip: say "rows" and "cols" out loud and name your variables `r` and `c`, not `i` and `j`. Swapped indices are the most common grid bug.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[][] createGrid(int rows, int cols, int value) {
        // your code here
        return new int[0][0];
    }

    public int[][] identity(int n) {
        // your code here
        return new int[0][0];
    }

    public char[][] toGrid(String[] lines) {
        // your code here
        return new char[0][0];
    }
}
${MAIN}`,
  expectedOutput: `[[7, 7, 7], [7, 7, 7]]
[[1, 0, 0], [0, 1, 0], [0, 0, 1]]
[[#, ., .], [., #, .], [., ., #]]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[][] createGrid(int rows, int cols, int value) {
        int[][] grid = new int[rows][cols];
        for (int[] row : grid) Arrays.fill(row, value);
        return grid;
    }

    public int[][] identity(int n) {
        int[][] m = new int[n][n];
        for (int i = 0; i < n; i++) m[i][i] = 1;
        return m;
    }

    public char[][] toGrid(String[] lines) {
        char[][] grid = new char[lines.length][];
        for (int r = 0; r < lines.length; r++) grid[r] = lines[r].toCharArray();
        return grid;
    }
}
${MAIN}`,
  solutionExplanation:
    '`new int[rows][cols]` allocates a separate array for every row, so filling each row with `Arrays.fill` never shares one row between two indices. `identity` relies on the zero-filled allocation and only writes the diagonal, and `toCharArray` gives each grid row its own mutable copy of a line.',
  testCases: [
    {
      name: 'createGrid fills every cell',
      call: 'createGrid(3, 2, -1)',
      code: `t.equal(new Solution().createGrid(3, 2, -1), new int[][]{{-1, -1}, {-1, -1}, {-1, -1}});`,
    },
    {
      name: 'createGrid rows are independent',
      call: 'grid = createGrid(3, 3, 4); grid[0][0] = 99',
      code: `int[][] grid = new Solution().createGrid(3, 3, 4);
t.check(grid.length == 3 && grid[0] != grid[1] && grid[1] != grid[2], "Each row must be its own array; Arrays.fill(grid, row) shares one row.");
grid[0][0] = 99;
t.equal(grid, new int[][]{{99, 4, 4}, {4, 4, 4}, {4, 4, 4}}, "Changing grid[0][0] must not change the other rows.");`,
    },
    {
      name: 'createGrid with zero rows or columns',
      call: 'createGrid(0, 5, 1), createGrid(2, 0, 1), createGrid(1, 1, 0)',
      code: `Solution s = new Solution();
t.equal(s.createGrid(2, 0, 1), new int[][]{{}, {}});
t.equal(s.createGrid(1, 1, 0), new int[][]{{0}});
t.equal(s.createGrid(0, 5, 1).length, 0);`,
    },
    {
      name: 'identity',
      call: 'identity(4), identity(1), identity(0)',
      code: `Solution s = new Solution();
t.equal(s.identity(4), new int[][]{{1, 0, 0, 0}, {0, 1, 0, 0}, {0, 0, 1, 0}, {0, 0, 0, 1}});
t.equal(s.identity(1), new int[][]{{1}});
t.equal(s.identity(0).length, 0);`,
    },
    {
      name: 'toGrid',
      call: 'toGrid(new String[]{"ab.", "#cd"})',
      code: `char[][] grid = new Solution().toGrid(new String[]{"ab.", "#cd"});
t.equal(grid, new char[][]{{'a', 'b', '.'}, {'#', 'c', 'd'}});
t.check(grid[1][2] == 'd', "grid[row][col]: row 1, column 2 should be 'd'.");`,
    },
    {
      name: 'toGrid with one line and with none',
      call: 'toGrid(new String[]{"x"}), toGrid(new String[]{})',
      code: `Solution s = new Solution();
t.equal(s.toGrid(new String[]{"x"}), new char[][]{{'x'}});
t.equal(s.toGrid(new String[]{"...."}), new char[][]{{'.', '.', '.', '.'}});
t.equal(s.toGrid(new String[]{}).length, 0);`,
    },
  ],
};
