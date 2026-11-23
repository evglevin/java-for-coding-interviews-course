import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.evensThenOdds(List.of(3, 8, -5, 2, 7, -4)));
        System.out.println(solution.runningMax(new int[]{2, 1, 5, 3, 6}));
        System.out.println(solution.interleave(List.of("a", "b", "c"), List.of("1", "2")));
        System.out.println(solution.zeros(4));
    }
}
`;

export const arrayList: LessonData = {
  id: 'arraylist',
  title: 'ArrayList',
  summary: 'ArrayList, the resizable array: get, set, add and size, what each costs, boxed types, and capacity vs size.',
  blocks: [
    {
      type: 'paragraph',
      text: '`ArrayList` is a resizable array. Declare the variable as the `List` interface and let the diamond `<>` infer the type argument. There is no `list[i]` syntax: read with `get` and write with `set`.',
    },
    {
      type: 'code',
      code: `List<Integer> nums = new ArrayList<>();
nums.add(10);             // [10]
nums.add(30);             // [10, 30]
nums.add(1, 20);          // [10, 20, 30]  inserts and shifts the rest right
nums.set(0, 5);           // [5, 20, 30]   replaces; returns the old value
int first = nums.get(0);  // 5
System.out.println(nums.size()); // 3`,
    },
    {
      type: 'paragraph',
      text: '`get` and `set` accept only indices from `0` to `size() - 1` and throw `IndexOutOfBoundsException` otherwise. `set` can’t append; use `add`.',
    },
    {
      type: 'heading',
      text: 'What each operation costs',
    },
    {
      type: 'list',
      items: [
        '`get(i)`, `set(i, x)`, `size()`: O(1). The elements live in an array.',
        '`add(x)` at the end: amortized O(1). When the array is full, `ArrayList` copies it into one about 1.5 times bigger.',
        '`add(i, x)` and `remove(i)`: O(n − i), because every element after `i` shifts. `add(0, x)` and `remove(0)` are O(n).',
        '`contains(x)` and `indexOf(x)`: O(n), a linear scan with `equals`. Inside a loop that is O(n²); use a `HashSet` for membership.',
      ],
    },
    {
      type: 'heading',
      text: 'Generics need boxed types',
    },
    {
      type: 'paragraph',
      text: 'A type argument must be a class, so `List<int>` does not compile. Use `List<Integer>`, `List<Long>`, `List<Character>`, `List<Double>`. Java boxes an `int` when you `add` it and unboxes it when you assign `get` to an `int`. Each element is a separate object, so a `List<Integer>` uses several times the memory of an `int[]`.',
    },
    {
      type: 'note',
      title: 'Boxed values bite',
      text: '`list.get(i) == list.get(j)` compares two `Integer` references. It happens to work for values from −128 to 127, which are cached, and fails above that. Compare with `equals`, or unbox first: `int a = list.get(i);`. Unboxing a `null` element throws `NullPointerException`.',
    },
    {
      type: 'note',
      title: 'Capacity is not size',
      text: '`new ArrayList<>(n)` reserves room for `n` elements, but the list is still empty: `size()` is `0` and `set(0, x)` throws. Capacity only saves the regrowth copies when you know the final size. For a list of `n` zeros, use `new ArrayList<>(Collections.nCopies(n, 0))`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one returns a new list and leaves its input unchanged:',
    methods: [
      {
        signature: 'List<Integer> evensThenOdds(List<Integer> nums)',
        description: 'All even numbers in their original order, then all odd numbers in their original order.',
      },
      {
        signature: 'List<Integer> runningMax(int[] nums)',
        description: 'Element `i` is the largest of `nums[0]` through `nums[i]`.',
      },
      {
        signature: 'List<String> interleave(List<String> a, List<String> b)',
        description:
          'Alternates elements, starting with `a`: `a0, b0, a1, b1, ...`. When one list runs out, the rest of the other follows in order.',
      },
      {
        signature: 'List<Integer> zeros(int n)',
        description: 'A modifiable list of `n` zeros.',
      },
    ],
    notes: ['Inputs may contain negative numbers.'],
  },
  complexity: {
    time: 'O(n) for each method, since appending is amortized O(1).',
    space: 'O(n) for the result list.',
  },
  hints: [
    'Build each result with `new ArrayList<>()` and `add`. Appending is cheap; inserting at the front is not.',
    'A negative odd number has remainder `-1`, so test evenness with `n % 2 == 0`, not oddness with `n % 2 == 1`.',
    'In `runningMax`, compare each number with the last element you added, `result.get(result.size() - 1)`, rather than starting a max at `0`.',
    'In `interleave`, loop `i` up to the larger size and add from each list only while `i` is in its range.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<Integer> evensThenOdds(List<Integer> nums) {
        // your code here
        return nums;
    }

    public List<Integer> runningMax(int[] nums) {
        // your code here
        return List.of();
    }

    public List<String> interleave(List<String> a, List<String> b) {
        // your code here
        return a;
    }

    public List<Integer> zeros(int n) {
        // your code here
        return List.of();
    }
}
${MAIN}`,
  expectedOutput: `[8, 2, -4, 3, -5, 7]
[2, 2, 5, 5, 6]
[a, 1, b, 2, c]
[0, 0, 0, 0]`,
  solutionCode: `import java.util.*;

class Solution {
    public List<Integer> evensThenOdds(List<Integer> nums) {
        List<Integer> evens = new ArrayList<>();
        List<Integer> odds = new ArrayList<>();
        for (int n : nums) {
            if (n % 2 == 0) evens.add(n);
            else odds.add(n);
        }
        evens.addAll(odds);
        return evens;
    }

    public List<Integer> runningMax(int[] nums) {
        List<Integer> result = new ArrayList<>(nums.length);
        for (int n : nums) {
            if (result.isEmpty() || n > result.get(result.size() - 1)) result.add(n);
            else result.add(result.get(result.size() - 1));
        }
        return result;
    }

    public List<String> interleave(List<String> a, List<String> b) {
        List<String> result = new ArrayList<>(a.size() + b.size());
        for (int i = 0; i < Math.max(a.size(), b.size()); i++) {
            if (i < a.size()) result.add(a.get(i));
            if (i < b.size()) result.add(b.get(i));
        }
        return result;
    }

    public List<Integer> zeros(int n) {
        return new ArrayList<>(Collections.nCopies(n, 0));
    }
}
${MAIN}`,
  solutionExplanation:
    'Every method appends to a fresh `ArrayList`, which is amortized O(1) per element. `evensThenOdds` splits with `n % 2 == 0` so negative odds land on the right side, `runningMax` carries the last maximum forward, and `zeros` copies `Collections.nCopies` into an `ArrayList` because a capacity argument alone leaves the list empty.',
  testCases: [
    {
      name: 'evensThenOdds keeps order within each group',
      call: 'evensThenOdds([5, 4, 1, 2, 3, 6])',
      code: `t.equal(new Solution().evensThenOdds(List.of(5, 4, 1, 2, 3, 6)), List.of(4, 2, 6, 5, 1, 3));`,
    },
    {
      name: 'evensThenOdds with negatives',
      call: 'evensThenOdds([-3, -2, 7, 0, -1])',
      code: `t.equal(new Solution().evensThenOdds(List.of(-3, -2, 7, 0, -1)), List.of(-2, 0, -3, 7, -1),
    "-3 % 2 is -1 in Java, so check n % 2 == 0 for evens.");`,
    },
    {
      name: 'runningMax with all negatives',
      call: 'runningMax(new int[]{-4, -7, -2, -9})',
      code: `t.equal(new Solution().runningMax(new int[]{-4, -7, -2, -9}), List.of(-4, -4, -2, -2),
    "Don't start the maximum at 0; start from the first element.");`,
    },
    {
      name: 'runningMax with duplicates and an empty array',
      call: 'runningMax(new int[]{3, 3, 1, 5, 5}), runningMax(new int[]{})',
      code: `Solution s = new Solution();
t.equal(s.runningMax(new int[]{3, 3, 1, 5, 5}), List.of(3, 3, 3, 5, 5));
t.equal(s.runningMax(new int[]{}), List.of());`,
    },
    {
      name: 'interleave with uneven lengths',
      call: 'interleave([a], [x, y, z]), interleave([], [q])',
      code: `Solution s = new Solution();
t.equal(s.interleave(List.of("a"), List.of("x", "y", "z")), List.of("a", "x", "y", "z"));
t.equal(s.interleave(List.of("a", "b", "c", "d"), List.of("x")), List.of("a", "x", "b", "c", "d"));
t.equal(s.interleave(List.of(), List.of("q")), List.of("q"));`,
    },
    {
      name: 'zeros has n elements and can be changed',
      call: 'zeros(3), then set(1, 5)',
      code: `List<Integer> list = new Solution().zeros(3);
t.equal(list, List.of(0, 0, 0), "new ArrayList<>(n) sets the capacity, not the size: the list is still empty.");
list.set(1, 5);
t.equal(list, List.of(0, 5, 0));
t.equal(new Solution().zeros(0), List.of());`,
    },
  ],
};
