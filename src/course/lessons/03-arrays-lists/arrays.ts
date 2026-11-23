import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] nums = {3, -1, 4, 1, 5};
        System.out.println(Arrays.toString(solution.prefixSums(nums)));
        System.out.println(Arrays.toString(solution.filled(4, 7)));
        System.out.println(solution.sameElements(new int[]{1, 2, 3}, new int[]{1, 2, 3}));
        solution.doubleInPlace(nums);
        System.out.println(Arrays.toString(nums));
    }
}
`;

export const arrays: LessonData = {
  id: 'arrays',
  title: 'Arrays',
  summary: 'Java arrays: fixed size, default values, the length field, bounds errors, Arrays.fill and Arrays.equals.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A Java array has a fixed size, set when you create it. `new int[n]` allocates `n` slots and fills them with the type’s default value. A literal `{...}` works only in a declaration; anywhere else, write the type: `new int[]{...}`.',
    },
    {
      type: 'code',
      code: `int[] counts = new int[3];        // [0, 0, 0]
boolean[] seen = new boolean[3];  // [false, false, false]
String[] names = new String[2];   // [null, null]
int[] primes = {2, 3, 5, 7};      // literal in a declaration
primes = new int[]{11, 13};       // anywhere else, name the type
System.out.println(primes.length); // 2`,
    },
    {
      type: 'list',
      items: [
        "Defaults: `0` for every numeric type, `false` for `boolean`, `'\\u0000'` for `char`, and `null` for any object type. `names[0].length()` on a fresh `String[]` throws `NullPointerException`.",
        'Size is `arr.length`, a field with no parentheses. A `String` uses `s.length()` and a collection uses `list.size()`. Mixing them up is a compile error.',
        'Valid indices run from `0` to `arr.length - 1`. `arr[arr.length]` and `arr[-1]` both throw `ArrayIndexOutOfBoundsException`: there is no negative indexing. The last element is `arr[arr.length - 1]`.',
      ],
    },
    {
      type: 'heading',
      text: 'Filling and comparing',
    },
    {
      type: 'code',
      code: `int[] dist = new int[4];
Arrays.fill(dist, Integer.MAX_VALUE); // every slot
Arrays.fill(dist, 1, 3, 0);           // indices 1 and 2 only (end is exclusive)

int[] a = {1, 2, 3};
int[] b = {1, 2, 3};
System.out.println(a == b);              // false: two different arrays
System.out.println(a.equals(b));         // false: arrays don't override equals
System.out.println(Arrays.equals(a, b)); // true: same length, same elements in order`,
    },
    {
      type: 'paragraph',
      text: '`==` and `equals` on arrays both compare identity. Use `Arrays.equals` for content (and `Arrays.deepEquals` for nested arrays). For the same reason, an `int[]` used as a `HashSet` element or a map key is matched by identity, not by content.',
    },
    {
      type: 'heading',
      text: 'Enhanced for vs indexed loop',
    },
    {
      type: 'code',
      code: `int[] nums = {1, 2, 3};
for (int x : nums) x *= 2;  // changes the local copy x; nums is still [1, 2, 3]

for (int i = 0; i < nums.length; i++) {
    nums[i] *= 2;           // writes into the array: [2, 4, 6]
}`,
      caption: 'The enhanced for loop reads elements. To write, or when you need the index, loop over indices.',
    },
    {
      type: 'note',
      title: 'Cost',
      text: 'Indexing is O(1). Creating `new int[n]` is O(n), because Java zeroes every slot. An array can’t grow: to add an element you allocate a bigger array and copy, which is what `ArrayList` does for you. An `int[]` stores the values themselves, so it is smaller and faster than an `Integer[]` or a `List<Integer>`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int[] prefixSums(int[] nums)',
        description:
          'Returns a new array of length `nums.length + 1` where element `i` is the sum of the first `i` numbers. Element `0` is `0`.',
      },
      {
        signature: 'int[] filled(int n, int value)',
        description: 'Returns a new array of length `n` with every element set to `value`.',
      },
      {
        signature: 'boolean sameElements(int[] a, int[] b)',
        description: 'Returns whether `a` and `b` have the same length and the same elements in the same order.',
      },
      {
        signature: 'int[] doubleInPlace(int[] nums)',
        description: 'Doubles every element of `nums` in place and returns `nums`.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method: one pass over the array.',
    space: 'O(n) for the new arrays from `prefixSums` and `filled`; O(1) extra for the other two.',
  },
  hints: [
    'A new `int[]` already holds zeros, so `prefix[0]` needs no assignment. Then `prefix[i + 1] = prefix[i] + nums[i]`.',
    '`Arrays.fill(array, value)` fills an existing array; `Arrays.equals(a, b)` compares contents.',
    'In `doubleInPlace`, an enhanced for loop only changes its loop variable. Loop over indices and assign `nums[i]`.',
    'Interview tip: prefix sums of length `n + 1` turn any range sum into `prefix[to] - prefix[from]` with no special case for `from == 0`.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] prefixSums(int[] nums) {
        // your code here
        return new int[0];
    }

    public int[] filled(int n, int value) {
        // your code here
        return new int[0];
    }

    public boolean sameElements(int[] a, int[] b) {
        // your code here
        return false;
    }

    public int[] doubleInPlace(int[] nums) {
        // your code here
        return nums;
    }
}
${MAIN}`,
  expectedOutput: `[0, 3, 2, 6, 7, 12]
[7, 7, 7, 7]
true
[6, -2, 8, 2, 10]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] prefixSums(int[] nums) {
        int[] prefix = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) {
            prefix[i + 1] = prefix[i] + nums[i];
        }
        return prefix;
    }

    public int[] filled(int n, int value) {
        int[] result = new int[n];
        Arrays.fill(result, value);
        return result;
    }

    public boolean sameElements(int[] a, int[] b) {
        return Arrays.equals(a, b);
    }

    public int[] doubleInPlace(int[] nums) {
        for (int i = 0; i < nums.length; i++) {
            nums[i] *= 2;
        }
        return nums;
    }
}
${MAIN}`,
  solutionExplanation:
    '`prefixSums` relies on the zero default for `prefix[0]` and builds each sum from the one before it. `filled` uses `Arrays.fill`, `sameElements` uses `Arrays.equals` because `==` compares identity, and `doubleInPlace` writes through indices because the enhanced for loop only hands out copies.',
  testCases: [
    {
      name: 'prefixSums with negatives',
      call: 'prefixSums(new int[]{3, -1, 4, -6})',
      code: `t.equal(new Solution().prefixSums(new int[]{3, -1, 4, -6}), new int[]{0, 3, 2, 6, 0});`,
    },
    {
      name: 'prefixSums of an empty array',
      call: 'prefixSums(new int[]{})',
      code: `t.equal(new Solution().prefixSums(new int[]{}), new int[]{0}, "The result has nums.length + 1 elements, so an empty input gives [0].");`,
    },
    {
      name: 'filled',
      call: 'filled(3, -5), filled(0, 9)',
      code: `Solution s = new Solution();
t.equal(s.filled(3, -5), new int[]{-5, -5, -5});
t.equal(s.filled(0, 9), new int[]{});`,
    },
    {
      name: 'sameElements compares contents, not identity',
      call: 'sameElements(new int[]{1, 2, 2}, new int[]{1, 2, 2})',
      code: `t.check(new Solution().sameElements(new int[]{1, 2, 2}, new int[]{1, 2, 2}),
    "Two different arrays with the same elements should count as the same. == compares identity; use Arrays.equals.");`,
    },
    {
      name: 'sameElements with different order or length',
      call: 'sameElements([1, 2], [2, 1]), sameElements([1, 2], [1, 2, 3]), sameElements([], [])',
      code: `Solution s = new Solution();
t.check(!s.sameElements(new int[]{1, 2}, new int[]{2, 1}), "Order matters.");
t.check(!s.sameElements(new int[]{1, 2}, new int[]{1, 2, 3}), "Lengths differ.");
t.check(s.sameElements(new int[]{}, new int[]{}), "Two empty arrays are the same.");`,
    },
    {
      name: 'doubleInPlace changes the array',
      call: 'doubleInPlace(nums), then read nums',
      code: `int[] nums = {4, -3, 0, 7};
new Solution().doubleInPlace(nums);
t.equal(nums, new int[]{8, -6, 0, 14}, "The original array should change. Assigning to an enhanced-for variable doesn't write into the array.");`,
    },
  ],
};
