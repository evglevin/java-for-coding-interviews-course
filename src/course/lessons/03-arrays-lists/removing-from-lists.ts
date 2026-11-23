import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.removeValue(new ArrayList<>(List.of(5, 1, 3, 1, 1, 2)), 1));
        System.out.println(solution.removeAt(new ArrayList<>(List.of(10, 20, 30, 40, 50)), new int[]{1, 3}));
        System.out.println(solution.removeShort(new ArrayList<>(List.of("a", "tree", "is", "green", "fig")), 3));
    }
}
`;

export const removingFromLists: LessonData = {
  id: 'removing-from-lists',
  title: 'Removing from a List',
  summary:
    'remove(int) vs remove(Object), why removing inside a for-each fails, and the safe ways: removeIf, an Iterator, or a backwards loop.',
  blocks: [
    {
      type: 'paragraph',
      text: '`List` has two `remove` methods: `remove(int index)` removes the element at a position and returns it; `remove(Object o)` removes the first element equal to `o` and returns whether it found one. On a `List<Integer>` the two look the same, and an `int` argument always picks the index version.',
    },
    {
      type: 'code',
      code: `List<Integer> nums = new ArrayList<>(List.of(5, 1, 3, 1));
nums.remove(1);                  // index 1 → [5, 3, 1]
nums.remove(Integer.valueOf(1)); // the value 1 → [5, 3]
nums.remove(7);                  // IndexOutOfBoundsException, not "remove the 7"`,
    },
    {
      type: 'paragraph',
      text: "Java picks an overload that needs no boxing before one that does, so `remove(int)` wins for an `int`. Pass an `Integer` to remove by value: `Integer.valueOf(x)` or `(Integer) x`. The same trap hits `List<Character>`: `list.remove('a')` widens the `char` to the index `97`.",
    },
    {
      type: 'heading',
      text: 'Don’t remove inside a for-each',
    },
    {
      type: 'code',
      code: `for (int x : nums) {
    if (x % 2 == 0) nums.remove(Integer.valueOf(x)); // ConcurrentModificationException
}`,
    },
    {
      type: 'paragraph',
      text: 'A for-each loop runs on an `Iterator`, which notices the list changed underneath it and throws `ConcurrentModificationException` on its next step. The check is best effort: removing the second-to-last element ends the loop before the check, so the bug can hide in small tests. Use one of these instead:',
    },
    {
      type: 'code',
      code: `nums.removeIf(x -> x % 2 == 0);  // one O(n) pass; returns whether anything was removed

Iterator<Integer> it = nums.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove(); // removes the element next() returned
}

for (int i = nums.size() - 1; i >= 0; i--) {
    if (nums.get(i) % 2 == 0) nums.remove(i); // only already-visited elements shift
}`,
    },
    {
      type: 'note',
      title: 'Forward index loops skip elements',
      text: 'In `for (int i = 0; i < nums.size(); i++)`, removing at `i` shifts the next element into position `i`, and `i++` then steps past it. On `[2, 2, 3]`, removing evens this way leaves `[2, 3]`. Loop backwards, or decrement `i` after each removal.',
    },
    {
      type: 'note',
      title: 'Cost',
      text: 'Each `remove(i)` shifts everything after `i`, so it is O(n). Removing k elements one at a time costs O(n·k), up to O(n²); `removeIf` compacts the list in a single O(n) pass. Draining a list from the front with `remove(0)` in a loop is O(n²): keep an index instead, or use an `ArrayDeque`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one modifies the list it is given and returns that same list:',
    methods: [
      {
        signature: 'List<Integer> removeValue(List<Integer> nums, int value)',
        description: 'Removes every occurrence of `value`.',
      },
      {
        signature: 'List<Integer> removeAt(List<Integer> nums, int[] indices)',
        description:
          'Removes the elements at the given positions. `indices` are distinct, in ascending order, and refer to positions in the original list.',
      },
      {
        signature: 'List<String> removeShort(List<String> words, int minLength)',
        description: 'Removes every word shorter than `minLength`.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for `removeValue` and `removeShort` with `removeIf`; O(n·k) for `removeAt`, where k is the number of indices.',
    space: 'O(1) extra: the list changes in place.',
  },
  hints: [
    '`value` is an `int`, so `nums.remove(value)` removes by position. Removing by value needs an `Integer`.',
    '`removeIf` with a lambda removes every match in one pass, for both `removeValue` and `removeShort`.',
    'In `removeAt`, each removal shifts the elements after it. Walk `indices` from the last to the first so earlier positions stay valid.',
    'Interview tip: when you filter a list in place, say which approach you use and why it can’t skip elements.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<Integer> removeValue(List<Integer> nums, int value) {
        // your code here
        return nums;
    }

    public List<Integer> removeAt(List<Integer> nums, int[] indices) {
        // your code here
        return nums;
    }

    public List<String> removeShort(List<String> words, int minLength) {
        // your code here
        return words;
    }
}
${MAIN}`,
  expectedOutput: `[5, 3, 2]
[10, 30, 50]
[tree, green, fig]`,
  solutionCode: `import java.util.*;

class Solution {
    public List<Integer> removeValue(List<Integer> nums, int value) {
        nums.removeIf(x -> x == value);
        return nums;
    }

    public List<Integer> removeAt(List<Integer> nums, int[] indices) {
        for (int i = indices.length - 1; i >= 0; i--) {
            nums.remove(indices[i]);
        }
        return nums;
    }

    public List<String> removeShort(List<String> words, int minLength) {
        words.removeIf(w -> w.length() < minLength);
        return words;
    }
}
${MAIN}`,
  solutionExplanation:
    '`removeIf` removes every match in one pass, and `x == value` unboxes `x` because `value` is an `int`. `removeAt` removes from the highest index down, so each removal only shifts elements that are already handled, and `nums.remove(indices[i])` is the index overload because the argument is an `int`.',
  testCases: [
    {
      name: 'removeValue removes by value, not by index',
      call: 'removeValue([5, 1, 3, 1], 1)',
      code: `t.equal(new Solution().removeValue(new ArrayList<>(List.of(5, 1, 3, 1)), 1), List.of(5, 3),
    "remove(int) removes by position. Remove the value 1, not the element at index 1.");`,
    },
    {
      name: 'removeValue with adjacent duplicates and negatives',
      call: 'removeValue([-2, -2, -2, 4, -2], -2)',
      code: `t.equal(new Solution().removeValue(new ArrayList<>(List.of(-2, -2, -2, 4, -2)), -2), List.of(4));`,
    },
    {
      name: 'removeValue when the value is absent',
      call: 'removeValue([1, 2], 9), removeValue([], 0)',
      code: `Solution s = new Solution();
t.equal(s.removeValue(new ArrayList<>(List.of(1, 2)), 9), List.of(1, 2));
t.equal(s.removeValue(new ArrayList<>(), 0), List.of());`,
    },
    {
      name: 'removeAt uses original positions',
      call: 'removeAt([10, 20, 30, 40, 50], new int[]{0, 1, 4})',
      code: `t.equal(new Solution().removeAt(new ArrayList<>(List.of(10, 20, 30, 40, 50)), new int[]{0, 1, 4}), List.of(30, 40),
    "Each removal shifts later elements left. Remove from the highest index first.");`,
    },
    {
      name: 'removeAt with no indices and with every index',
      call: 'removeAt([7, 8], new int[]{}), removeAt([7, 8, 9], new int[]{0, 1, 2})',
      code: `Solution s = new Solution();
t.equal(s.removeAt(new ArrayList<>(List.of(7, 8)), new int[]{}), List.of(7, 8));
t.equal(s.removeAt(new ArrayList<>(List.of(7, 8, 9)), new int[]{0, 1, 2}), List.of());`,
    },
    {
      name: 'removeShort with consecutive short words, in place',
      call: 'removeShort([a, is, tree, of, an, green], 3)',
      code: `List<String> words = new ArrayList<>(List.of("a", "is", "tree", "of", "an", "green"));
List<String> result = new Solution().removeShort(words, 3);
t.equal(result, List.of("tree", "green"));
t.check(result == words, "Modify the given list and return it, rather than building a new one.");`,
    },
    {
      name: 'removeShort can empty the list',
      call: 'removeShort([hi, yo], 5)',
      code: `t.equal(new Solution().removeShort(new ArrayList<>(List.of("hi", "yo")), 5), List.of());`,
    },
  ],
};
