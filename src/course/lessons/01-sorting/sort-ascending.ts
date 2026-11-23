import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] numbers = {1, 5, 3, 2, 4, 11, 19, 9, 2, 5, 6, 7, 4, 2, 6};
        System.out.println(Arrays.toString(solution.sortNumbers(numbers)));

        String[] words = {"cherry", "apple", "blueberry", "banana", "watermelon", "zucchini", "kiwi", "pear"};
        System.out.println(Arrays.toString(solution.sortWords(words)));

        List<Double> prices = new ArrayList<>(List.of(3.14, 2.82, 6.433, 7.9, 21.555, 21.554));
        System.out.println(solution.sortPrices(prices));
    }
}
`;

export const sortAscending: LessonData = {
  id: 'sort-ascending',
  title: 'Sort Ascending',
  summary: 'Sort arrays with Arrays.sort and lists with Collections.sort, in place and in ascending order.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Java sorts **arrays** with `Arrays.sort` and **lists** with `Collections.sort` (or `list.sort(null)`). Both sort *in place*: they rearrange the elements you pass in and return `void`.',
    },
    {
      type: 'code',
      code: `int[] numbers = {5, 3, 6, 2, 1};
Arrays.sort(numbers);
System.out.println(Arrays.toString(numbers)); // [1, 2, 3, 5, 6]

List<String> fruits = new ArrayList<>(List.of("grape", "apple", "banana"));
Collections.sort(fruits);
System.out.println(fruits); // [apple, banana, grape]`,
    },
    {
      type: 'paragraph',
      text: 'Because they return `void`, `return Arrays.sort(numbers);` does not compile. Sort first, then return the array or list.',
    },
    {
      type: 'paragraph',
      text: 'Printing an array directly shows something like `[I@1b6d3586`, its type and identity, not its contents. Wrap it in `Arrays.toString` (or `Arrays.deepToString` for a 2-D array). Lists print their contents on their own.',
    },
    {
      type: 'heading',
      text: 'What "ascending" means for each type',
    },
    {
      type: 'list',
      items: [
        'Numbers sort from smallest to largest, negatives first.',
        'Strings sort lexicographically by character code, so every uppercase letter comes before every lowercase one: `"Zebra"` sorts before `"apple"`.',
        '`char`s sort by their code too: `\'A\'` (65) before `\'a\'` (97).',
      ],
    },
    {
      type: 'note',
      title: 'Primitives vs objects',
      text: 'For primitive arrays (`int[]`, `double[]`, `char[]`) `Arrays.sort` uses a dual-pivot quicksort. For objects (`String[]`, `Integer[]`, any `List`) it uses TimSort, which is **stable**: equal elements keep their original order. Stability matters once you sort records by one field and want ties to stay put.',
    },
    {
      type: 'note',
      title: 'Immutable lists',
      text: '`List.of(...)` and `stream.toList()` return lists you can’t modify, and sorting one throws `UnsupportedOperationException`. Copy into a mutable list first: `new ArrayList<>(List.of(...))`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one sorts its argument in ascending order, in place, and returns it:',
    methods: [
      {
        signature: 'int[] sortNumbers(int[] numbers)',
        description: 'Sorts the integers from smallest to largest.',
      },
      {
        signature: 'String[] sortWords(String[] words)',
        description: 'Sorts the words in lexicographic order.',
      },
      {
        signature: 'List<Double> sortPrices(List<Double> prices)',
        description: 'Sorts the prices from lowest to highest.',
      },
    ],
  },
  complexity: {
    time: 'O(n log n), where n is the number of elements.',
    space: 'O(log n) for the quicksort on primitives; up to O(n) for TimSort on objects.',
  },
  hints: [
    '`Arrays.sort(array)` sorts any array in place; `Collections.sort(list)` does the same for a list.',
    'Both return `void`, so call them on one line and `return` the argument on the next.',
    'Interview tip: ask whether you may modify the input before sorting it in place.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] sortNumbers(int[] numbers) {
        // your code here
        return numbers;
    }

    public String[] sortWords(String[] words) {
        // your code here
        return words;
    }

    public List<Double> sortPrices(List<Double> prices) {
        // your code here
        return prices;
    }
}
${MAIN}`,
  expectedOutput: `[1, 2, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 9, 11, 19]
[apple, banana, blueberry, cherry, kiwi, pear, watermelon, zucchini]
[2.82, 3.14, 6.433, 7.9, 21.554, 21.555]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] sortNumbers(int[] numbers) {
        Arrays.sort(numbers);
        return numbers;
    }

    public String[] sortWords(String[] words) {
        Arrays.sort(words);
        return words;
    }

    public List<Double> sortPrices(List<Double> prices) {
        Collections.sort(prices);
        return prices;
    }
}
${MAIN}`,
  solutionExplanation:
    '`Arrays.sort` sorts the two arrays in place and `Collections.sort` sorts the list in place, all in natural (ascending) order. Each method then returns the argument it was given, which now holds the sorted elements.',
  testCases: [
    {
      name: 'sortNumbers with duplicates and negatives',
      call: 'sortNumbers(new int[]{5, -2, 3, -2, 0, 11})',
      code: `t.equal(new Solution().sortNumbers(new int[]{5, -2, 3, -2, 0, 11}), new int[]{-2, -2, 0, 3, 5, 11});`,
    },
    {
      name: 'sortWords puts uppercase first',
      call: 'sortWords(new String[]{"pear", "Zebra", "apple", "Mango"})',
      code: `t.equal(new Solution().sortWords(new String[]{"pear", "Zebra", "apple", "Mango"}),
        new String[]{"Mango", "Zebra", "apple", "pear"});`,
    },
    {
      name: 'sortPrices',
      call: 'sortPrices([3.14, 2.82, 21.555, 21.554, -0.5])',
      code: `List<Double> prices = new ArrayList<>(List.of(3.14, 2.82, 21.555, 21.554, -0.5));
t.equal(new Solution().sortPrices(prices), List.of(-0.5, 2.82, 3.14, 21.554, 21.555));`,
    },
    {
      name: 'sorts in place',
      call: 'sortNumbers(numbers), then read numbers',
      code: `int[] numbers = {3, 1, 2};
new Solution().sortNumbers(numbers);
t.equal(numbers, new int[]{1, 2, 3}, "The original array should be sorted in place.");`,
    },
    {
      name: 'empty and single-element inputs',
      call: 'sortNumbers(new int[]{}), sortWords(new String[]{"solo"})',
      code: `Solution s = new Solution();
t.equal(s.sortNumbers(new int[]{}), new int[]{});
t.equal(s.sortWords(new String[]{"solo"}), new String[]{"solo"});`,
    },
  ],
};
