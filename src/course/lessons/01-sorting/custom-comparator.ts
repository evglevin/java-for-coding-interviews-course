import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        String[] words = {"banana", "kiwi", "apple", "fig", "cherry", "pear"};
        System.out.println(Arrays.toString(solution.sortByLength(words)));

        int[][] intervals = {{8, 10}, {1, 3}, {15, 18}, {2, 6}};
        System.out.println(Arrays.deepToString(solution.sortIntervals(intervals)));

        List<Integer> numbers = new ArrayList<>(List.of(1, 9, 4, 6, 5, 2));
        System.out.println(solution.sortByDistance(numbers, 5));
    }
}
`;

export const customComparator: LessonData = {
  id: 'custom-comparator',
  title: 'Custom Comparator',
  summary: 'Write a Comparator as a lambda to sort by any rule, including int[][] intervals by start, without overflow.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A `Comparator<T>` decides the order of two elements. Write it as a lambda `(a, b) -> ...` and pass it to `Arrays.sort` or `list.sort`. Java infers the parameter types from the array or list.',
    },
    {
      type: 'code',
      code: `String[] words = {"banana", "fig", "apple"};
Arrays.sort(words, (a, b) -> Integer.compare(a.length(), b.length()));
System.out.println(Arrays.toString(words)); // [fig, apple, banana]

List<Integer> numbers = new ArrayList<>(List.of(3, 1, 2));
numbers.sort((a, b) -> Integer.compare(b, a)); // swap the arguments for descending
System.out.println(numbers); // [3, 2, 1]`,
    },
    {
      type: 'heading',
      text: 'The compare contract',
    },
    {
      type: 'list',
      items: [
        '**Negative**: `a` comes before `b`.',
        '**Zero**: they tie.',
        '**Positive**: `a` comes after `b`.',
        'Only the sign matters. The comparator must also be consistent: if `a < b` and `b < c`, then `a < c`. TimSort may throw `IllegalArgumentException: Comparison method violates its general contract!` when it isn’t.',
      ],
    },
    {
      type: 'note',
      title: 'Overflow',
      text: '`(a, b) -> a - b` is a classic bug. When `a` is `Integer.MAX_VALUE` and `b` is `-1`, `a - b` overflows to `Integer.MIN_VALUE`, a negative number, so the largest value sorts first. `Integer.compare(a, b)` never overflows. Use it, and `Long.compare` for `long`s, every time.',
    },
    {
      type: 'heading',
      text: 'Sorting intervals',
    },
    {
      type: 'paragraph',
      text: 'An `int[][]` is an array of objects: each row is an `int[]`. So unlike a plain `int[]`, it takes a comparator. Sorting intervals by their start is the first step of merge-intervals, meeting-rooms, and many greedy problems:',
    },
    {
      type: 'code',
      code: `int[][] intervals = {{5, 7}, {1, 3}, {2, 4}};
Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
System.out.println(Arrays.deepToString(intervals)); // [[1, 3], [2, 4], [5, 7]]`,
    },
    {
      type: 'note',
      title: 'Stability',
      text: 'Sorts of objects (`String[]`, `int[][]`, any `List`) use TimSort, which is stable: elements that compare as zero keep their input order. Sort `{"pear", "kiwi"}` by length and `"pear"` stays first. You can rely on that instead of adding a tie-breaker when the problem asks for input order.',
    },
    {
      type: 'note',
      title: 'Captured variables',
      text: 'A lambda can read local variables and parameters from the enclosing method, but only if they are *effectively final*: never reassigned after their first assignment. Otherwise the code doesn’t compile.',
    },
  ],
  challenge: {
    intro:
      'Complete the methods of `Solution`. Each one sorts its argument in place with a comparator and returns it. Elements that tie keep their input order:',
    methods: [
      {
        signature: 'String[] sortByLength(String[] words)',
        description: 'Sorts the words from shortest to longest.',
      },
      {
        signature: 'int[][] sortIntervals(int[][] intervals)',
        description: 'Sorts the `[start, end]` intervals by start, smallest first. Starts can be any `int`.',
      },
      {
        signature: 'List<Integer> sortByDistance(List<Integer> numbers, int target)',
        description: 'Sorts the numbers by their distance from `target`, closest first.',
      },
    ],
  },
  complexity: {
    time: 'O(n log n) comparisons, each O(1).',
    space: 'Up to O(n) for TimSort, which all three sorts use because they sort objects.',
  },
  hints: [
    'Each method is one call: `Arrays.sort(array, comparator)` or `list.sort(comparator)`, then `return` the argument.',
    'Compare with `Integer.compare(x, y)`, never `x - y`. One test uses `Integer.MIN_VALUE` and `Integer.MAX_VALUE` as starts.',
    'For distance, compare `Math.abs(a - target)` with `Math.abs(b - target)`. The sort is stable, so ties already stay in input order.',
    'Interview tip: say "sort intervals by start" out loud and write `Integer.compare(a[0], b[0])`. Interviewers watch for the subtraction bug.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public String[] sortByLength(String[] words) {
        // your code here
        return words;
    }

    public int[][] sortIntervals(int[][] intervals) {
        // your code here
        return intervals;
    }

    public List<Integer> sortByDistance(List<Integer> numbers, int target) {
        // your code here
        return numbers;
    }
}
${MAIN}`,
  expectedOutput: `[fig, kiwi, pear, apple, banana, cherry]
[[1, 3], [2, 6], [8, 10], [15, 18]]
[5, 4, 6, 2, 1, 9]`,
  solutionCode: `import java.util.*;

class Solution {
    public String[] sortByLength(String[] words) {
        Arrays.sort(words, (a, b) -> Integer.compare(a.length(), b.length()));
        return words;
    }

    public int[][] sortIntervals(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        return intervals;
    }

    public List<Integer> sortByDistance(List<Integer> numbers, int target) {
        numbers.sort((a, b) -> Integer.compare(Math.abs(a - target), Math.abs(b - target)));
        return numbers;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each comparator returns the sign of the comparison through `Integer.compare`, so no subtraction of two arbitrary values can overflow. All three sorts are object sorts, so TimSort keeps tied elements in their input order without a tie-breaker.',
  testCases: [
    {
      name: 'sortByLength keeps ties in input order',
      call: 'sortByLength(new String[]{"pear", "fig", "banana", "kiwi", "apple"})',
      code: `t.equal(new Solution().sortByLength(new String[]{"pear", "fig", "banana", "kiwi", "apple"}),
        new String[]{"fig", "pear", "kiwi", "apple", "banana"});`,
    },
    {
      name: 'sortIntervals by start',
      call: 'sortIntervals(new int[][]{{5, 7}, {1, 3}, {8, 10}, {-4, 2}})',
      code: `t.equal(new Solution().sortIntervals(new int[][]{{5, 7}, {1, 3}, {8, 10}, {-4, 2}}),
        new int[][]{{-4, 2}, {1, 3}, {5, 7}, {8, 10}});`,
    },
    {
      name: 'sortIntervals keeps equal starts in input order',
      call: 'sortIntervals(new int[][]{{3, 9}, {1, 2}, {3, 4}})',
      code: `t.equal(new Solution().sortIntervals(new int[][]{{3, 9}, {1, 2}, {3, 4}}),
        new int[][]{{1, 2}, {3, 9}, {3, 4}});`,
    },
    {
      name: 'sortIntervals with extreme starts',
      call: 'sortIntervals(new int[][]{{Integer.MAX_VALUE, Integer.MAX_VALUE}, {Integer.MIN_VALUE, 0}, {0, 1}})',
      code: `t.equal(new Solution().sortIntervals(new int[][]{{Integer.MAX_VALUE, Integer.MAX_VALUE}, {Integer.MIN_VALUE, 0}, {0, 1}}),
        new int[][]{{Integer.MIN_VALUE, 0}, {0, 1}, {Integer.MAX_VALUE, Integer.MAX_VALUE}},
        "a[0] - b[0] overflows for these starts; use Integer.compare(a[0], b[0]).");`,
    },
    {
      name: 'sortByDistance with ties and negatives',
      call: 'sortByDistance([4, 6, 5, 7, 3], 5), sortByDistance([3, -5, -2, 0, -4], -2)',
      code: `Solution s = new Solution();
t.equal(s.sortByDistance(new ArrayList<>(List.of(4, 6, 5, 7, 3)), 5), List.of(5, 4, 6, 7, 3));
t.equal(s.sortByDistance(new ArrayList<>(List.of(3, -5, -2, 0, -4)), -2), List.of(-2, 0, -4, -5, 3));`,
    },
    {
      name: 'empty and single-element inputs',
      call: 'sortByLength(new String[]{}), sortIntervals(new int[][]{{1, 2}}), sortByDistance([], 0)',
      code: `Solution s = new Solution();
t.equal(s.sortByLength(new String[]{}), new String[]{});
t.equal(s.sortIntervals(new int[][]{{1, 2}}), new int[][]{{1, 2}});
t.equal(s.sortByDistance(new ArrayList<>(), 0), List.of());`,
    },
  ],
};
