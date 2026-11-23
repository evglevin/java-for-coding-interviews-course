import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        List<List<Integer>> lists = List.of(List.of(1, 4, 5), List.of(1, 3, 4), List.of(2, 6));
        System.out.println(solution.mergeSorted(lists));

        int[][] matrix = {{1, 5, 9}, {10, 11, 13}, {12, 13, 15}};
        System.out.println(solution.kthSmallestInMatrix(matrix, 8));

        System.out.println(solution.kSmallestPairs(new int[]{1, 7, 11}, new int[]{2, 4, 6}, 3));
    }
}
`;

export const mergeKSorted: LessonData = {
  id: 'merge-k-sorted',
  title: 'Merge K Sorted Lists',
  summary:
    'Merge k sorted lists in O(N log k) with a heap of {value, list, index} entries, and reuse the pattern on sorted matrices and pairs.',
  blocks: [
    {
      type: 'paragraph',
      text: 'The smallest remaining value of k sorted lists is always at the front of one of them. Keep a min-heap holding the front of each list. Poll the smallest, append it to the output, and offer the next element from the same list. The heap never holds more than k entries.',
    },
    {
      type: 'code',
      code: `List<List<Integer>> lists = List.of(List.of(1, 4, 5), List.of(1, 3, 4), List.of(2, 6));

// entry: {value, listIndex, elementIndex}
PriorityQueue<int[]> fronts = new PriorityQueue<>(Comparator.comparingInt(e -> e[0]));
for (int i = 0; i < lists.size(); i++) {
    if (!lists.get(i).isEmpty()) fronts.offer(new int[]{lists.get(i).get(0), i, 0});
}

List<Integer> merged = new ArrayList<>();
while (!fronts.isEmpty()) {
    int[] e = fronts.poll();
    merged.add(e[0]);
    List<Integer> source = lists.get(e[1]);
    int next = e[2] + 1;
    if (next < source.size()) fronts.offer(new int[]{source.get(next), e[1], next});
}
System.out.println(merged); // [1, 1, 2, 3, 4, 4, 5, 6]`,
    },
    {
      type: 'paragraph',
      text: 'The entry carries where its value came from, so after a poll you know which list to advance. An `int[]` is the quick way to do that; a `record Entry(int value, int list, int index)` reads better and costs the same.',
    },
    {
      type: 'list',
      items: [
        'Time: O(N log k) for N values in total. Each value is offered and polled once, on a heap of at most k entries.',
        'Space: O(k) for the heap, plus the output.',
        'Dumping all N values into one heap is O(N log N). Merging lists two at a time, left to right, is O(N·k).',
        'Skip empty lists when seeding the heap; `get(0)` on an empty list throws `IndexOutOfBoundsException`.',
      ],
    },
    {
      type: 'note',
      title: 'get(i) is only fast on ArrayList',
      text: '`list.get(i)` is O(1) on an `ArrayList` or `List.of`, but O(i) on a `LinkedList`, which turns this merge quadratic. If the lists may be linked, keep an `Iterator<Integer>` per list instead of an index.',
    },
    {
      type: 'heading',
      text: 'Same pattern, other shapes',
    },
    {
      type: 'paragraph',
      text: 'Anything that is “k sorted sequences” works the same way: the rows of a matrix whose rows are sorted, or the pairs `(nums1[i], nums2[j])` of two sorted arrays, where row `i` is `nums1[i] + nums2[0], nums1[i] + nums2[1], …`. Seed the heap with the first element of each sequence, and after each poll offer that sequence’s next element. To find the k-th smallest, stop after k polls instead of draining the heap.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution` with a heap that holds one entry per sorted sequence:',
    methods: [
      {
        signature: 'List<Integer> mergeSorted(List<List<Integer>> lists)',
        description:
          'Each list is sorted ascending. Returns one ascending list with all their values, duplicates kept. Any list may be empty, and so may `lists`.',
      },
      {
        signature: 'int kthSmallestInMatrix(int[][] matrix, int k)',
        description:
          'Every row and every column of the m × n matrix is sorted ascending. Returns the k-th smallest value, counting duplicates. `1 <= k <= m * n`.',
      },
      {
        signature: 'List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k)',
        description:
          'Both arrays are sorted ascending. Returns the k pairs `[nums1[i], nums2[j]]` with the smallest sums, ordered by sum, then by `i`, then by `j`. Returns all pairs if there are fewer than k.',
      },
    ],
    notes: ['Values can be anywhere in the `int` range, so a sum of two of them may not fit in an `int`.'],
  },
  complexity: {
    time: 'O(N log k) for `mergeSorted`; O(m + k log m) for the matrix; O(k log k) for the pairs.',
    space: 'O(k) for `mergeSorted`, O(m) for the matrix, O(k) for the pairs, plus the output.',
  },
  hints: [
    '`mergeSorted`: offer `{lists.get(i).get(0), i, 0}` for every non-empty list, then poll, append, and offer the next element of the same list.',
    '`kthSmallestInMatrix`: treat each row as a sorted list. Seed with `{matrix[r][0], r, 0}` for every row, poll k − 1 times (offering the next column each time), then peek.',
    '`kSmallestPairs`: store `{i, j}` and compare by `(long) nums1[a[0]] + nums2[a[1]]`, then `i`, then `j`. Seed with `{i, 0}` for the first `min(k, nums1.length)` rows; after polling `{i, j}`, offer `{i, j + 1}`.',
    'Interview tip: state the bound before you code: “the heap never holds more than k entries, so each step is O(log k).”',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<Integer> mergeSorted(List<List<Integer>> lists) {
        // your code here
        return List.of();
    }

    public int kthSmallestInMatrix(int[][] matrix, int k) {
        // your code here
        return 0;
    }

    public List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        // your code here
        return List.of();
    }
}
${MAIN}`,
  expectedOutput: `[1, 1, 2, 3, 4, 4, 5, 6]
13
[[1, 2], [1, 4], [1, 6]]`,
  solutionCode: `import java.util.*;

class Solution {
    public List<Integer> mergeSorted(List<List<Integer>> lists) {
        PriorityQueue<int[]> fronts = new PriorityQueue<>(Comparator.comparingInt(e -> e[0]));
        for (int i = 0; i < lists.size(); i++) {
            if (!lists.get(i).isEmpty()) fronts.offer(new int[]{lists.get(i).get(0), i, 0});
        }
        List<Integer> merged = new ArrayList<>();
        while (!fronts.isEmpty()) {
            int[] e = fronts.poll();
            merged.add(e[0]);
            List<Integer> source = lists.get(e[1]);
            int next = e[2] + 1;
            if (next < source.size()) fronts.offer(new int[]{source.get(next), e[1], next});
        }
        return merged;
    }

    public int kthSmallestInMatrix(int[][] matrix, int k) {
        PriorityQueue<int[]> fronts = new PriorityQueue<>(Comparator.comparingInt(e -> e[0]));
        for (int r = 0; r < matrix.length; r++) fronts.offer(new int[]{matrix[r][0], r, 0});
        for (int i = 1; i < k; i++) {
            int[] e = fronts.poll();
            int r = e[1], c = e[2] + 1;
            if (c < matrix[r].length) fronts.offer(new int[]{matrix[r][c], r, c});
        }
        return fronts.peek()[0];
    }

    public List<List<Integer>> kSmallestPairs(int[] nums1, int[] nums2, int k) {
        List<List<Integer>> pairs = new ArrayList<>();
        if (nums1.length == 0 || nums2.length == 0) return pairs;
        PriorityQueue<int[]> fronts = new PriorityQueue<>(
            Comparator.comparingLong((int[] a) -> (long) nums1[a[0]] + nums2[a[1]])
                .thenComparingInt(a -> a[0])
                .thenComparingInt(a -> a[1]));
        for (int i = 0; i < Math.min(k, nums1.length); i++) fronts.offer(new int[]{i, 0});
        while (pairs.size() < k && !fronts.isEmpty()) {
            int[] a = fronts.poll();
            pairs.add(List.of(nums1[a[0]], nums2[a[1]]));
            if (a[1] + 1 < nums2.length) fronts.offer(new int[]{a[0], a[1] + 1});
        }
        return pairs;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each heap holds one entry per sorted sequence, its smallest unused element, so the heap’s top is the smallest unused value overall. After polling an entry, only its successor in the same sequence can become a new candidate, so offering it keeps the invariant. The pair comparator sums in `long` and breaks ties by index, so the order is exact.',
  testCases: [
    {
      name: 'mergeSorted with duplicates and negatives',
      call: 'mergeSorted([[-3, 0, 0, 200], [-5, 200], [1, 2, 300]])',
      code: `List<List<Integer>> lists = List.of(List.of(-3, 0, 0, 200), List.of(-5, 200), List.of(1, 2, 300));
t.equal(new Solution().mergeSorted(lists), List.of(-5, -3, 0, 0, 1, 2, 200, 200, 300));`,
    },
    {
      name: 'mergeSorted with empty lists',
      call: 'mergeSorted([[], [4], [], [1, 9]]), mergeSorted([]), mergeSorted([[]])',
      code: `Solution s = new Solution();
t.equal(s.mergeSorted(List.of(List.of(), List.of(4), List.of(), List.of(1, 9))), List.of(1, 4, 9));
t.equal(s.mergeSorted(List.of()), List.of());
t.equal(s.mergeSorted(List.of(List.of())), List.of());`,
    },
    {
      name: 'kthSmallestInMatrix',
      call: 'kthSmallestInMatrix({{1, 5, 9}, {10, 11, 13}, {12, 13, 15}}, k) for k = 1, 6, 9',
      code: `Solution s = new Solution();
int[][] matrix = {{1, 5, 9}, {10, 11, 13}, {12, 13, 15}};
t.equal(s.kthSmallestInMatrix(matrix, 1), 1);
t.equal(s.kthSmallestInMatrix(matrix, 6), 12);
t.equal(s.kthSmallestInMatrix(matrix, 9), 15);`,
    },
    {
      name: 'kthSmallestInMatrix with negatives, duplicates and one row',
      call: 'kthSmallestInMatrix({{-5, -4}, {-5, -4}, {0, 7}}, 3), kthSmallestInMatrix({{2, 3, 8}}, 3)',
      code: `Solution s = new Solution();
t.equal(s.kthSmallestInMatrix(new int[][]{{-5, -4}, {-5, -4}, {0, 7}}, 3), -4);
t.equal(s.kthSmallestInMatrix(new int[][]{{2, 3, 8}}, 3), 8);`,
    },
    {
      name: 'kSmallestPairs breaks sum ties by index',
      call: 'kSmallestPairs(new int[]{1, 1, 2}, new int[]{1, 2, 3}, 4)',
      code: `t.equal(new Solution().kSmallestPairs(new int[]{1, 1, 2}, new int[]{1, 2, 3}, 4),
    List.of(List.of(1, 1), List.of(1, 1), List.of(1, 2), List.of(1, 2)));`,
    },
    {
      name: 'kSmallestPairs with fewer pairs than k, or none',
      call: 'kSmallestPairs(new int[]{1, 2}, new int[]{3}, 5), kSmallestPairs(new int[]{}, new int[]{1}, 2)',
      code: `Solution s = new Solution();
t.equal(s.kSmallestPairs(new int[]{1, 2}, new int[]{3}, 5), List.of(List.of(1, 3), List.of(2, 3)));
t.equal(s.kSmallestPairs(new int[]{}, new int[]{1}, 2), List.of());`,
    },
    {
      name: 'kSmallestPairs with sums past the int range',
      call: 'kSmallestPairs(new int[]{-2000000000, 2000000000}, new int[]{-2000000000, 2000000000}, 3)',
      code: `int big = 2000000000;
t.equal(new Solution().kSmallestPairs(new int[]{-big, big}, new int[]{-big, big}, 3),
    List.of(List.of(-big, -big), List.of(-big, big), List.of(big, -big)),
    "-2000000000 + -2000000000 overflows an int. Compare the sums as long.");`,
    },
  ],
};
