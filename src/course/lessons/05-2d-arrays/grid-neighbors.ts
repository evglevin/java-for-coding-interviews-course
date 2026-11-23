import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[][] life = {{0, 1, 0}, {0, 1, 0}, {0, 1, 0}};
        System.out.println(Arrays.deepToString(solution.countLiveNeighbors(life)));

        String[] map = {"11000", "11000", "00100", "00011"};
        char[][] grid = new char[map.length][];
        for (int r = 0; r < map.length; r++) grid[r] = map[r].toCharArray();
        System.out.println(solution.countIslands(grid));
    }
}
`;

export const gridNeighbors: LessonData = {
  id: 'grid-neighbors',
  title: 'Grid Neighbors',
  summary: 'Visit the 4 or 8 neighbors of a cell with a direction array and a bounds check, and flood-fill connected regions.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Most grid problems look at the cells around `(r, c)`. Instead of four copies of the same `if`, loop over a **direction array** of `{dr, dc}` offsets and skip neighbors that fall off the grid.',
    },
    {
      type: 'code',
      code: `static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

boolean inBounds(int[][] grid, int r, int c) {
    return r >= 0 && r < grid.length && c >= 0 && c < grid[0].length;
}

for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (!inBounds(grid, nr, nc)) continue;
    // grid[nr][nc] is a neighbor of grid[r][c]
}`,
    },
    {
      type: 'list',
      items: [
        'Check the bounds **before** reading `grid[nr][nc]`. Java has no negative indexing: `grid[-1]` throws `ArrayIndexOutOfBoundsException`.',
        'Put the row check first: `r < grid.length` must hold before `grid[r]` is safe to touch.',
        'Declare `DIRS` as a `static final` field on `Solution`, so it isn’t rebuilt on every call.',
      ],
    },
    {
      type: 'heading',
      text: 'Eight directions',
    },
    {
      type: 'code',
      code: `for (int dr = -1; dr <= 1; dr++) {
    for (int dc = -1; dc <= 1; dc++) {
        if (dr == 0 && dc == 0) continue; // the cell itself
        int nr = r + dr, nc = c + dc;
        // ...
    }
}`,
      caption: 'Or list all eight `{dr, dc}` pairs in the direction array.',
    },
    {
      type: 'paragraph',
      text: 'Traverse in **row-major** order: rows in the outer loop, columns in the inner loop. Each row is its own contiguous array, so this reads memory in order; swapping the loops jumps between row arrays on every step.',
    },
    {
      type: 'heading',
      text: 'Flood fill',
    },
    {
      type: 'paragraph',
      text: "To count connected regions, scan the grid; when you find an unvisited cell of the region, count it and visit every cell connected to it with DFS or BFS, marking each one visited. Mark by overwriting the cell (`grid[r][c] = '0'`) or with a separate `boolean[][] seen` if you must not change the input.",
    },
    {
      type: 'code',
      code: `Deque<int[]> stack = new ArrayDeque<>();
stack.push(new int[]{r, c});
grid[r][c] = '0';
while (!stack.isEmpty()) {
    int[] cell = stack.pop();
    for (int[] d : DIRS) {
        int nr = cell[0] + d[0], nc = cell[1] + d[1];
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] == '1') {
            grid[nr][nc] = '0'; // mark when pushing, so no cell is pushed twice
            stack.push(new int[]{nr, nc});
        }
    }
}`,
    },
    {
      type: 'note',
      title: 'Recursion depth',
      text: 'Recursive DFS is shorter, but it recurses once per cell in the region. A 1000 x 1000 grid of land goes a million calls deep and throws `StackOverflowError`; the default stack holds roughly ten thousand frames. An explicit `ArrayDeque` stack or queue has no such limit. Mention the trade-off in an interview.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int[][] countLiveNeighbors(int[][] grid)',
        description:
          'The grid holds `0`s and `1`s. Returns a grid of the same size where each cell is the number of its 8 neighbors (including diagonals) that are `1`. A cell does not count itself.',
      },
      {
        signature: 'int countIslands(char[][] grid)',
        description:
          "The grid holds `'1'` (land) and `'0'` (water). Returns the number of islands: groups of land connected up, down, left or right (not diagonally). You may modify the grid.",
      },
    ],
    notes: ['`countLiveNeighbors` gets at least one row. `countIslands` may get an empty grid (`new char[0][0]`).'],
  },
  complexity: {
    time: 'O(rows · cols): each cell checks a constant number of neighbors, and the flood fill visits each land cell once.',
    space: 'O(rows · cols) for the result grid, and for the flood fill’s stack in the worst case.',
  },
  hints: [
    'In `countLiveNeighbors`, loop `dr` and `dc` from `-1` to `1`, skip `(0, 0)`, and add `grid[nr][nc]` when `(nr, nc)` is in bounds.',
    'In `countIslands`, return `0` right away when `grid.length == 0`, before reading `grid[0].length`.',
    "When the scan finds a `'1'`, increment the count and flood-fill its island to `'0'` with the 4 directions, so the scan never counts it again.",
    'Interview tip: ask whether you may modify the input. If not, use a `boolean[][] seen` of the same size.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[][] countLiveNeighbors(int[][] grid) {
        // your code here
        return new int[0][0];
    }

    public int countIslands(char[][] grid) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `[[2, 1, 2], [3, 2, 3], [2, 1, 2]]
3`,
  solutionCode: `import java.util.*;

class Solution {
    private static final int[][] DIRS = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

    public int[][] countLiveNeighbors(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        int[][] counts = new int[rows][cols];
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                for (int dr = -1; dr <= 1; dr++) {
                    for (int dc = -1; dc <= 1; dc++) {
                        if (dr == 0 && dc == 0) continue;
                        int nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) counts[r][c] += grid[nr][nc];
                    }
                }
            }
        }
        return counts;
    }

    public int countIslands(char[][] grid) {
        if (grid.length == 0) return 0;
        int rows = grid.length, cols = grid[0].length;
        int islands = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] != '1') continue;
                islands++;
                Deque<int[]> stack = new ArrayDeque<>();
                grid[r][c] = '0';
                stack.push(new int[]{r, c});
                while (!stack.isEmpty()) {
                    int[] cell = stack.pop();
                    for (int[] d : DIRS) {
                        int nr = cell[0] + d[0], nc = cell[1] + d[1];
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] == '1') {
                            grid[nr][nc] = '0';
                            stack.push(new int[]{nr, nc});
                        }
                    }
                }
            }
        }
        return islands;
    }
}
${MAIN}`,
  solutionExplanation:
    '`countLiveNeighbors` checks all 8 offsets around every cell and skips the ones outside the grid, so edge and corner cells see only the neighbors they have. `countIslands` counts a new island whenever the row-major scan meets unvisited land, then sinks the whole island with an explicit stack so the scan never counts it again and deep islands can’t overflow the call stack.',
  testCases: [
    {
      name: 'countLiveNeighbors on a blinker',
      call: 'countLiveNeighbors({{0,1,0},{0,1,0},{0,1,0}})',
      code: `t.equal(new Solution().countLiveNeighbors(new int[][]{{0, 1, 0}, {0, 1, 0}, {0, 1, 0}}),
    new int[][]{{2, 1, 2}, {3, 2, 3}, {2, 1, 2}});`,
    },
    {
      name: 'countLiveNeighbors at corners and edges',
      call: 'countLiveNeighbors({{1,1,1},{1,1,1},{1,1,1}})',
      code: `t.equal(new Solution().countLiveNeighbors(new int[][]{{1, 1, 1}, {1, 1, 1}, {1, 1, 1}}),
    new int[][]{{3, 5, 3}, {5, 8, 5}, {3, 5, 3}}, "Corners have 3 neighbors, edges 5, the middle 8; skip offsets outside the grid.");`,
    },
    {
      name: 'countLiveNeighbors on one row and one cell',
      call: 'countLiveNeighbors({{1,1,0,1}}), countLiveNeighbors({{1}})',
      code: `Solution s = new Solution();
t.equal(s.countLiveNeighbors(new int[][]{{1, 1, 0, 1}}), new int[][]{{1, 1, 2, 0}});
t.equal(s.countLiveNeighbors(new int[][]{{1}}), new int[][]{{0}}, "A cell is not its own neighbor.");
t.equal(s.countLiveNeighbors(new int[][]{{1}, {0}, {1}}), new int[][]{{0}, {2}, {0}});`,
    },
    {
      name: 'countIslands',
      call: 'countIslands({"11000", "11000", "00100", "00011"})',
      code: `String[] map = {"11000", "11000", "00100", "00011"};
char[][] grid = new char[map.length][];
for (int r = 0; r < map.length; r++) grid[r] = map[r].toCharArray();
t.equal(new Solution().countIslands(grid), 3);`,
    },
    {
      name: 'countIslands ignores diagonals',
      call: 'countIslands({"101", "010", "101"})',
      code: `char[][] grid = {"101".toCharArray(), "010".toCharArray(), "101".toCharArray()};
t.equal(new Solution().countIslands(grid), 5, "Diagonal cells are not connected: use only the 4 directions.");`,
    },
    {
      name: 'countIslands with winding islands',
      call: 'countIslands({"111", "101", "111"}), countIslands({"10111", "10101", "11101"})',
      code: `Solution s = new Solution();
t.equal(s.countIslands(new char[][]{"111".toCharArray(), "101".toCharArray(), "111".toCharArray()}), 1);
t.equal(s.countIslands(new char[][]{"10111".toCharArray(), "10101".toCharArray(), "11101".toCharArray()}), 1);
t.equal(s.countIslands(new char[][]{"0".toCharArray()}), 0);`,
    },
    {
      name: 'countIslands on an empty grid and one large island',
      call: 'countIslands(new char[0][0]), countIslands(40 x 40 of land)',
      code: `Solution s = new Solution();
t.equal(s.countIslands(new char[0][0]), 0, "Check grid.length == 0 before reading grid[0].length.");
char[][] big = new char[40][40];
for (char[] row : big) Arrays.fill(row, '1');
t.equal(s.countIslands(big), 1);`,
    },
  ],
};
