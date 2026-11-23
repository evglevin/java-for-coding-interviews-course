import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] numbers = {5, 3, 8, 1, 9, 2};
        System.out.println(Arrays.toString(solution.sortedNumbers(numbers)));
        System.out.println(Arrays.toString(numbers));

        List<String> words = List.of("cherry", "apple", "fig", "banana", "kiwi");
        System.out.println(solution.sortedWords(words));
        System.out.println(solution.sortedByLength(words));
        System.out.println(words);
    }
}
`;

export const sortedCopy: LessonData = {
  id: 'sorted-copy',
  title: 'Sorted Copy',
  summary: 'Sort a copy of an array or list, or sort with a stream, so the input stays unchanged.',
  blocks: [
    {
      type: 'paragraph',
      text: '`Arrays.sort` and `list.sort` change their argument. When the caller still needs the original order (to look up indices, say) or the input is immutable, copy it first and sort the copy.',
    },
    {
      type: 'code',
      code: `int[] numbers = {3, 1, 2};
int[] sorted = numbers.clone(); // or Arrays.copyOf(numbers, numbers.length)
Arrays.sort(sorted);
System.out.println(Arrays.toString(sorted));  // [1, 2, 3]
System.out.println(Arrays.toString(numbers)); // [3, 1, 2]

List<String> words = List.of("pear", "fig", "apple");
List<String> copy = new ArrayList<>(words);
Collections.sort(copy);
System.out.println(copy);  // [apple, fig, pear]
System.out.println(words); // [pear, fig, apple]`,
    },
    {
      type: 'note',
      title: 'Assignment is not a copy',
      text: '`int[] sorted = numbers;` copies the reference, not the array. Both names point to the same array, so sorting `sorted` also sorts `numbers`. The same goes for lists.',
    },
    {
      type: 'heading',
      text: 'Sorting with streams',
    },
    {
      type: 'paragraph',
      text: 'A stream never modifies its source. `sorted()` takes an optional comparator, and the result goes into a new list or array:',
    },
    {
      type: 'code',
      code: `List<String> words = List.of("pear", "fig", "apple");
List<String> byName = words.stream().sorted().toList();
// [apple, fig, pear]
List<String> byLength = words.stream().sorted(Comparator.comparingInt(String::length)).toList();
// [fig, pear, apple]

int[] numbers = {3, 1, 2};
int[] sorted = Arrays.stream(numbers).sorted().toArray();
// [1, 2, 3]`,
    },
    {
      type: 'note',
      title: '`toList()` is unmodifiable',
      text: '`stream.toList()` (Java 16+) returns an unmodifiable list: `add`, `set`, and `sort` on it throw `UnsupportedOperationException`. If the caller will change the result, collect into an `ArrayList` with `.collect(Collectors.toCollection(ArrayList::new))`, or copy the input with `new ArrayList<>(list)` and sort that.',
    },
    {
      type: 'note',
      title: 'Cost and shallow copies',
      text: 'The copy costs O(n) time and O(n) space on top of the O(n log n) sort. Copies are shallow: `grid.clone()` on an `int[][]` copies the outer array, but both arrays share the same rows. Reordering the copy’s rows leaves the original alone; writing into a row changes both.',
    },
  ],
  challenge: {
    intro:
      'Complete the methods of `Solution`. Each one returns a new sorted array or list and leaves its argument unchanged. The lists may be immutable:',
    methods: [
      {
        signature: 'int[] sortedNumbers(int[] numbers)',
        description: 'Returns a new array with the integers in ascending order.',
      },
      {
        signature: 'List<String> sortedWords(List<String> words)',
        description: 'Returns a new list with the words in lexicographic order.',
      },
      {
        signature: 'List<String> sortedByLength(List<String> words)',
        description: 'Returns a new list with the words from shortest to longest; equal lengths keep their input order.',
      },
    ],
  },
  complexity: {
    time: 'O(n log n) for each sort, plus O(n) to copy.',
    space: 'O(n) for the copy, plus the sort’s own O(log n) on `int[]` or up to O(n) for TimSort on the lists.',
  },
  hints: [
    'Never sort the argument itself. Make a copy first, or use a stream.',
    'For the array: `int[] copy = numbers.clone();` then `Arrays.sort(copy);`. Or `Arrays.stream(numbers).sorted().toArray()`.',
    'For the lists: `words.stream().sorted().toList()`, and pass `Comparator.comparingInt(String::length)` to `sorted` for length. Stream sorting is stable, so ties keep their order.',
    'Interview tip: before sorting an input in place, ask whether the caller needs it afterwards. Copying costs O(n), which the sort dominates.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] sortedNumbers(int[] numbers) {
        // your code here
        return numbers;
    }

    public List<String> sortedWords(List<String> words) {
        // your code here
        return words;
    }

    public List<String> sortedByLength(List<String> words) {
        // your code here
        return words;
    }
}
${MAIN}`,
  expectedOutput: `[1, 2, 3, 5, 8, 9]
[5, 3, 8, 1, 9, 2]
[apple, banana, cherry, fig, kiwi]
[fig, kiwi, apple, cherry, banana]
[cherry, apple, fig, banana, kiwi]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] sortedNumbers(int[] numbers) {
        int[] copy = numbers.clone();
        Arrays.sort(copy);
        return copy;
    }

    public List<String> sortedWords(List<String> words) {
        return words.stream().sorted().toList();
    }

    public List<String> sortedByLength(List<String> words) {
        return words.stream().sorted(Comparator.comparingInt(String::length)).toList();
    }
}
${MAIN}`,
  solutionExplanation:
    '`clone()` makes a new array, so `Arrays.sort` rearranges the copy and not the caller’s array. The streams read the input lists without modifying them and collect the sorted elements into new lists, which also works when the input is immutable.',
  testCases: [
    {
      name: 'sortedNumbers returns a sorted copy',
      call: 'sortedNumbers(new int[]{5, -2, 3, -2, 0, 11})',
      code: `int[] numbers = {5, -2, 3, -2, 0, 11};
int[] result = new Solution().sortedNumbers(numbers);
t.equal(result, new int[]{-2, -2, 0, 3, 5, 11});
t.equal(numbers, new int[]{5, -2, 3, -2, 0, 11}, "The input array should not change.");
t.check(result != numbers, "Return a new array, not the input.");`,
    },
    {
      name: 'sortedNumbers with an already sorted input',
      call: 'sortedNumbers(new int[]{1, 2, 3})',
      code: `int[] numbers = {1, 2, 3};
int[] result = new Solution().sortedNumbers(numbers);
t.equal(result, new int[]{1, 2, 3});
t.check(result != numbers, "Return a new array, even when the input is already sorted.");`,
    },
    {
      name: 'sortedWords from an immutable list',
      call: 'sortedWords(List.of("pear", "Zebra", "apple", "Mango"))',
      code: `List<String> words = List.of("pear", "Zebra", "apple", "Mango");
t.equal(new Solution().sortedWords(words), List.of("Mango", "Zebra", "apple", "pear"));`,
    },
    {
      name: 'sortedWords leaves a mutable input unchanged',
      call: 'sortedWords(new ArrayList<>(List.of("kiwi", "fig", "kiwi", "date")))',
      code: `List<String> words = new ArrayList<>(List.of("kiwi", "fig", "kiwi", "date"));
List<String> result = new Solution().sortedWords(words);
t.equal(result, List.of("date", "fig", "kiwi", "kiwi"));
t.equal(words, List.of("kiwi", "fig", "kiwi", "date"), "The input list should not change.");`,
    },
    {
      name: 'sortedByLength keeps ties in input order',
      call: 'sortedByLength(new ArrayList<>(List.of("pear", "fig", "banana", "kiwi", "apple")))',
      code: `List<String> words = new ArrayList<>(List.of("pear", "fig", "banana", "kiwi", "apple"));
t.equal(new Solution().sortedByLength(words), List.of("fig", "pear", "kiwi", "apple", "banana"));
t.equal(words, List.of("pear", "fig", "banana", "kiwi", "apple"), "The input list should not change.");`,
    },
    {
      name: 'empty and single-element inputs',
      call: 'sortedNumbers(new int[]{}), sortedWords(List.of()), sortedByLength(List.of("solo"))',
      code: `Solution s = new Solution();
t.equal(s.sortedNumbers(new int[]{}), new int[]{});
t.equal(s.sortedWords(List.of()), List.of());
t.equal(s.sortedByLength(List.of("solo")), List.of("solo"));`,
    },
  ],
};
