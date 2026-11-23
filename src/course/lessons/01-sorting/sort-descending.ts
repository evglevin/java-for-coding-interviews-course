import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] numbers = {1, 5, 3, 2, 4, 11, 19, 9, 2, 5, 6, 7, 4, 2, 6};
        System.out.println(Arrays.toString(solution.sortNumbersDescending(numbers)));

        String[] words = {"cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"};
        System.out.println(Arrays.toString(solution.sortWordsDescending(words)));

        List<Integer> scores = new ArrayList<>(List.of(88, 92, 75, 92, 60));
        System.out.println(solution.sortScoresDescending(scores));
    }
}
`;

export const sortDescending: LessonData = {
  id: 'sort-descending',
  title: 'Sort Descending',
  summary: 'Sort object arrays and lists in descending order with reverseOrder, and reverse primitive arrays in place.',
  blocks: [
    {
      type: 'paragraph',
      text: 'To sort from largest to smallest, pass a comparator that flips the natural order. `Collections.reverseOrder()` and `Comparator.reverseOrder()` both return one, and they are interchangeable here.',
    },
    {
      type: 'code',
      code: `String[] words = {"grape", "apple", "banana"};
Arrays.sort(words, Collections.reverseOrder());
System.out.println(Arrays.toString(words)); // [grape, banana, apple]

List<Integer> scores = new ArrayList<>(List.of(70, 95, 82));
scores.sort(Comparator.reverseOrder());
System.out.println(scores); // [95, 82, 70]

// same result: Collections.sort(scores, Collections.reverseOrder());`,
    },
    {
      type: 'paragraph',
      text: 'Reversing the order also reverses the case rule: lowercase words now come before uppercase ones, so `"apple"` sorts before `"Zebra"`.',
    },
    {
      type: 'heading',
      text: 'The `int[]` trap',
    },
    {
      type: 'paragraph',
      text: 'A comparator compares objects, and `int` is a primitive. There is no `Arrays.sort(int[], Comparator)` overload, so `Arrays.sort(numbers, Collections.reverseOrder())` does not compile when `numbers` is an `int[]`. Sort ascending, then reverse the array in place with two pointers:',
    },
    {
      type: 'code',
      code: `int[] numbers = {5, 3, 6, 2, 1};
Arrays.sort(numbers);
for (int i = 0, j = numbers.length - 1; i < j; i++, j--) {
    int tmp = numbers[i];
    numbers[i] = numbers[j];
    numbers[j] = tmp;
}
System.out.println(Arrays.toString(numbers)); // [6, 5, 3, 2, 1]`,
      caption: 'The loop stops when the pointers meet, so it works for odd and even lengths.',
    },
    {
      type: 'note',
      title: 'Boxing costs',
      text: 'You can box to `Integer[]` with `Arrays.stream(numbers).boxed().toArray(Integer[]::new)` and sort that with `Collections.reverseOrder()`. It works, but every element becomes a separate heap object, the sort switches to TimSort with O(n) extra space, and you need another pass to copy the values back into the `int[]`. The sort-then-reverse loop adds only O(n) time and O(1) space.',
    },
    {
      type: 'note',
      title: 'Don’t negate',
      text: 'Negating every value, sorting, and negating back looks clever but breaks on `Integer.MIN_VALUE`: `-Integer.MIN_VALUE` overflows back to `Integer.MIN_VALUE`, so it ends up in the wrong place.',
    },
    {
      type: 'note',
      title: 'Stability',
      text: 'Sorting objects with `reverseOrder()` is still stable: equal elements keep their input order. Sorting ascending and then reversing flips the order of equal elements. For `int`s that difference is invisible; for records sorted by one field it isn’t.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one sorts its argument in descending order, in place, and returns it:',
    methods: [
      {
        signature: 'int[] sortNumbersDescending(int[] numbers)',
        description: 'Sorts the integers from largest to smallest.',
      },
      {
        signature: 'String[] sortWordsDescending(String[] words)',
        description: 'Sorts the words in reverse lexicographic order.',
      },
      {
        signature: 'List<Integer> sortScoresDescending(List<Integer> scores)',
        description: 'Sorts the scores from highest to lowest.',
      },
    ],
    notes: ['`sortNumbersDescending` must work on the `int[]` it is given; it can’t take a comparator.'],
  },
  complexity: {
    time: 'O(n log n) for each sort; the in-place reverse adds O(n).',
    space:
      'O(log n) for the quicksort on `int[]` (the reverse uses O(1)); up to O(n) for TimSort on the `String[]` and the list.',
  },
  hints: [
    'Object arrays and lists accept `Collections.reverseOrder()` as a second argument.',
    'For the `int[]`, call `Arrays.sort(numbers)` first, then swap `numbers[i]` and `numbers[j]` while `i < j`, moving the pointers toward each other.',
    'For the list, `scores.sort(Comparator.reverseOrder())` sorts in place.',
    'Interview tip: when you need a max-first order of primitives, sort ascending and read the array from the end. Often you don’t need to reverse at all.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] sortNumbersDescending(int[] numbers) {
        // your code here
        return numbers;
    }

    public String[] sortWordsDescending(String[] words) {
        // your code here
        return words;
    }

    public List<Integer> sortScoresDescending(List<Integer> scores) {
        // your code here
        return scores;
    }
}
${MAIN}`,
  expectedOutput: `[19, 11, 9, 7, 6, 6, 5, 5, 4, 4, 3, 2, 2, 2, 1]
[zucchini, watermelon, pear, kiwi, cherry, blueberry, banana, apple]
[92, 92, 88, 75, 60]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] sortNumbersDescending(int[] numbers) {
        Arrays.sort(numbers);
        for (int i = 0, j = numbers.length - 1; i < j; i++, j--) {
            int tmp = numbers[i];
            numbers[i] = numbers[j];
            numbers[j] = tmp;
        }
        return numbers;
    }

    public String[] sortWordsDescending(String[] words) {
        Arrays.sort(words, Collections.reverseOrder());
        return words;
    }

    public List<Integer> sortScoresDescending(List<Integer> scores) {
        scores.sort(Comparator.reverseOrder());
        return scores;
    }
}
${MAIN}`,
  solutionExplanation:
    'The `int[]` can’t take a comparator, so it is sorted ascending and then reversed in place by swapping from both ends until the pointers meet. The `String[]` and the list are objects, so `reverseOrder()` sorts them descending directly.',
  testCases: [
    {
      name: 'sortNumbersDescending with duplicates and negatives',
      call: 'sortNumbersDescending(new int[]{5, -2, 3, -2, 0, 11})',
      code: `t.equal(new Solution().sortNumbersDescending(new int[]{5, -2, 3, -2, 0, 11}), new int[]{11, 5, 3, 0, -2, -2});`,
    },
    {
      name: 'sortNumbersDescending with extreme values',
      call: 'sortNumbersDescending(new int[]{Integer.MIN_VALUE, 0, Integer.MAX_VALUE, -1})',
      code: `t.equal(new Solution().sortNumbersDescending(new int[]{Integer.MIN_VALUE, 0, Integer.MAX_VALUE, -1}),
        new int[]{Integer.MAX_VALUE, 0, -1, Integer.MIN_VALUE});`,
    },
    {
      name: 'sortNumbersDescending sorts in place',
      call: 'sortNumbersDescending(numbers), then read numbers',
      code: `int[] numbers = {2, 9, 4, 7};
int[] result = new Solution().sortNumbersDescending(numbers);
t.equal(numbers, new int[]{9, 7, 4, 2}, "The original array should be sorted in place.");
t.check(result == numbers, "Return the same array you were given.");`,
    },
    {
      name: 'sortNumbersDescending with odd, even, empty, and single lengths',
      call: 'sortNumbersDescending({1, 2}), ({3, 1, 2}), ({}), ({7})',
      code: `Solution s = new Solution();
t.equal(s.sortNumbersDescending(new int[]{1, 2}), new int[]{2, 1});
t.equal(s.sortNumbersDescending(new int[]{3, 1, 2}), new int[]{3, 2, 1});
t.equal(s.sortNumbersDescending(new int[]{}), new int[]{});
t.equal(s.sortNumbersDescending(new int[]{7}), new int[]{7});`,
    },
    {
      name: 'sortWordsDescending puts lowercase first',
      call: 'sortWordsDescending(new String[]{"pear", "Zebra", "apple", "Mango"})',
      code: `t.equal(new Solution().sortWordsDescending(new String[]{"pear", "Zebra", "apple", "Mango"}),
        new String[]{"pear", "apple", "Zebra", "Mango"});`,
    },
    {
      name: 'sortScoresDescending',
      call: 'sortScoresDescending([88, -5, 92, 75, 92, 0])',
      code: `List<Integer> scores = new ArrayList<>(List.of(88, -5, 92, 75, 92, 0));
t.equal(new Solution().sortScoresDescending(scores), List.of(92, 92, 88, 75, 0, -5));`,
    },
  ],
};
