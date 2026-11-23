import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] nums = {1, 2, 3, 4, 5};
        System.out.println(Arrays.toString(solution.slice(nums, 1, 4)));
        System.out.println(Arrays.toString(solution.rotateLeft(nums, 2)) + " " + Arrays.toString(nums));
        System.out.println(solution.removeRange(new ArrayList<>(List.of(10, 20, 30, 40, 50)), 1, 3));

        List<List<Integer>> groups = List.of(new ArrayList<>(List.of(1, 2)), new ArrayList<>(List.of(3)));
        List<List<Integer>> copy = solution.deepCopy(groups);
        groups.get(0).add(99);
        System.out.println(groups + " " + copy);
    }
}
`;

export const copyingAndSlicing: LessonData = {
  id: 'copying-and-slicing',
  title: 'Copying and Slicing',
  summary: 'Arrays.copyOfRange, System.arraycopy, list copies, subList views that write through, and shallow vs deep copies.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Java has no slice syntax. `Arrays.copyOfRange(arr, from, to)` copies indices `from` up to, but not including, `to`. `Arrays.copyOf(arr, n)` copies the first `n` elements. Both pad with default values when the range runs past the end.',
    },
    {
      type: 'code',
      code: `int[] nums = {1, 2, 3, 4, 5};
int[] mid = Arrays.copyOfRange(nums, 1, 4);   // [2, 3, 4]
int[] tail = Arrays.copyOfRange(nums, 3, 7);  // [4, 5, 0, 0]  padded with zeros
int[] bigger = Arrays.copyOf(nums, 7);        // [1, 2, 3, 4, 5, 0, 0]
int[] shorter = Arrays.copyOf(nums, 2);       // [1, 2]
int[] same = nums.clone();                    // [1, 2, 3, 4, 5]`,
    },
    {
      type: 'paragraph',
      text: '`copyOfRange` throws `IllegalArgumentException` when `from > to` and `ArrayIndexOutOfBoundsException` when `from` is negative or past the end. To copy into an array you already have, use `System.arraycopy(src, srcPos, dest, destPos, length)`. It allocates nothing, and overlapping ranges in the same array work as if it copied through a temporary buffer.',
    },
    {
      type: 'code',
      code: `int[] dest = new int[5];
System.arraycopy(nums, 0, dest, 2, 3);  // dest = [0, 0, 1, 2, 3]
System.arraycopy(nums, 0, nums, 1, 4);  // shift right in place: nums = [1, 1, 2, 3, 4]`,
    },
    {
      type: 'heading',
      text: 'Copying lists',
    },
    {
      type: 'code',
      code: `List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
List<Integer> copy = new ArrayList<>(list);  // independent and modifiable
List<Integer> frozen = List.copyOf(list);    // independent and unmodifiable; rejects nulls`,
    },
    {
      type: 'heading',
      text: '`subList` is a view, not a copy',
    },
    {
      type: 'code',
      code: `List<Integer> nums = new ArrayList<>(List.of(10, 20, 30, 40, 50));
List<Integer> window = nums.subList(1, 4);  // [20, 30, 40], no copy
window.set(0, 99);                          // nums is now [10, 99, 30, 40, 50]
nums.subList(1, 3).clear();                 // removes a range: nums is now [10, 40, 50]
List<Integer> slice = new ArrayList<>(nums.subList(0, 2)); // [10, 40], independent`,
    },
    {
      type: 'paragraph',
      text: '`subList(from, to)` is O(1) and shares storage with its list, so writes go both ways. `list.subList(a, b).clear()` is the idiom for removing a range, with one O(n) shift. Once you add to or remove from the parent list directly, the old view is invalid and using it throws `ConcurrentModificationException`. Copy a sublist if you need to keep it.',
    },
    {
      type: 'note',
      title: 'Copies are shallow',
      text: '`new ArrayList<>(groups)` on a `List<List<Integer>>` copies the outer list, but both lists hold the same inner lists: adding to `copy.get(0)` changes `groups.get(0)` too. For a deep copy, copy each inner list. The classic interview bug is in backtracking: `result.add(path)` stores the list you keep changing; store `new ArrayList<>(path)`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int[] slice(int[] nums, int from, int to)',
        description:
          'Returns a new array with the elements from index `from` up to, but not including, `to`. `0 <= from <= to <= nums.length`.',
      },
      {
        signature: 'int[] rotateLeft(int[] nums, int k)',
        description:
          'Returns a new array with the elements shifted `k` places to the left, wrapping around: `[1, 2, 3, 4, 5]` with `k = 2` gives `[3, 4, 5, 1, 2]`. `k >= 0` and may exceed the length. `nums` stays unchanged.',
      },
      {
        signature: 'List<Integer> removeRange(List<Integer> nums, int from, int to)',
        description: 'Removes the elements from index `from` up to, but not including, `to`, in place, and returns `nums`.',
      },
      {
        signature: 'List<List<Integer>> deepCopy(List<List<Integer>> lists)',
        description:
          'Returns a copy that shares no list with the input: changing an inner list of the input must not change the copy.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method, where n is the number of elements copied or shifted.',
    space: 'O(n) for the new arrays and lists; O(1) extra for `removeRange`.',
  },
  hints: [
    '`Arrays.copyOfRange(nums, from, to)` is the whole of `slice`.',
    'In `rotateLeft`, reduce `k` with `k % n` first, and handle the empty array before you divide by its length. Then two `System.arraycopy` calls place the two halves.',
    '`nums.subList(from, to).clear()` removes the range from `nums` itself.',
    'In `deepCopy`, `new ArrayList<>(lists)` only copies the outer list. Build a new list and add `new ArrayList<>(inner)` for each inner list.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] slice(int[] nums, int from, int to) {
        // your code here
        return nums;
    }

    public int[] rotateLeft(int[] nums, int k) {
        // your code here
        return nums;
    }

    public List<Integer> removeRange(List<Integer> nums, int from, int to) {
        // your code here
        return nums;
    }

    public List<List<Integer>> deepCopy(List<List<Integer>> lists) {
        // your code here
        return lists;
    }
}
${MAIN}`,
  expectedOutput: `[2, 3, 4]
[3, 4, 5, 1, 2] [1, 2, 3, 4, 5]
[10, 40, 50]
[[1, 2, 99], [3]] [[1, 2], [3]]`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] slice(int[] nums, int from, int to) {
        return Arrays.copyOfRange(nums, from, to);
    }

    public int[] rotateLeft(int[] nums, int k) {
        int n = nums.length;
        int[] result = new int[n];
        if (n == 0) return result;
        k %= n;
        System.arraycopy(nums, k, result, 0, n - k);
        System.arraycopy(nums, 0, result, n - k, k);
        return result;
    }

    public List<Integer> removeRange(List<Integer> nums, int from, int to) {
        nums.subList(from, to).clear();
        return nums;
    }

    public List<List<Integer>> deepCopy(List<List<Integer>> lists) {
        List<List<Integer>> copy = new ArrayList<>(lists.size());
        for (List<Integer> inner : lists) {
            copy.add(new ArrayList<>(inner));
        }
        return copy;
    }
}
${MAIN}`,
  solutionExplanation:
    '`copyOfRange` copies a half-open range into a new array. `rotateLeft` writes the elements from `k` onward to the front of a new array and the first `k` after them, so the input is never touched. `subList(from, to).clear()` removes a range through the view, and `deepCopy` copies every inner list, not just the outer one.',
  testCases: [
    {
      name: 'slice middle, end and empty ranges',
      call: 'slice([4, -1, 7, 0], 1, 3), slice(..., 2, 4), slice(..., 2, 2)',
      code: `Solution s = new Solution();
int[] nums = {4, -1, 7, 0};
t.equal(s.slice(nums, 1, 3), new int[]{-1, 7}, "The end index is exclusive.");
t.equal(s.slice(nums, 2, 4), new int[]{7, 0});
t.equal(s.slice(nums, 2, 2), new int[]{});`,
    },
    {
      name: 'rotateLeft returns a new array',
      call: 'rotateLeft([1, 2, 3, 4, 5], 1)',
      code: `int[] nums = {1, 2, 3, 4, 5};
int[] result = new Solution().rotateLeft(nums, 1);
t.equal(result, new int[]{2, 3, 4, 5, 1});
t.equal(nums, new int[]{1, 2, 3, 4, 5}, "The input array should stay unchanged.");`,
    },
    {
      name: 'rotateLeft with k of 0, the length, and more',
      call: 'rotateLeft([1, 2, 3], 0), rotateLeft([1, 2, 3], 3), rotateLeft([1, 2, 3], 7)',
      code: `Solution s = new Solution();
t.equal(s.rotateLeft(new int[]{1, 2, 3}, 0), new int[]{1, 2, 3});
t.equal(s.rotateLeft(new int[]{1, 2, 3}, 3), new int[]{1, 2, 3});
t.equal(s.rotateLeft(new int[]{1, 2, 3}, 7), new int[]{2, 3, 1}, "Reduce k with k % n.");`,
    },
    {
      name: 'rotateLeft of empty and single-element arrays',
      call: 'rotateLeft(new int[]{}, 4), rotateLeft(new int[]{9}, 5)',
      code: `Solution s = new Solution();
t.equal(s.rotateLeft(new int[]{}, 4), new int[]{}, "Check for an empty array before computing k % n.");
t.equal(s.rotateLeft(new int[]{9}, 5), new int[]{9});`,
    },
    {
      name: 'removeRange in place',
      call: 'removeRange([10, 20, 30, 40, 50], 0, 2), removeRange([1, 2], 1, 1)',
      code: `Solution s = new Solution();
List<Integer> nums = new ArrayList<>(List.of(10, 20, 30, 40, 50));
List<Integer> result = s.removeRange(nums, 0, 2);
t.equal(result, List.of(30, 40, 50));
t.check(result == nums, "Remove the range from the given list and return it.");
t.equal(s.removeRange(new ArrayList<>(List.of(1, 2)), 1, 1), List.of(1, 2));
t.equal(s.removeRange(new ArrayList<>(List.of(1, 2)), 0, 2), List.of());`,
    },
    {
      name: 'deepCopy shares no inner list',
      call: 'deepCopy([[1, 2], [], [3]]), then change the input',
      code: `List<List<Integer>> lists = new ArrayList<>();
lists.add(new ArrayList<>(List.of(1, 2)));
lists.add(new ArrayList<>());
lists.add(new ArrayList<>(List.of(3)));
List<List<Integer>> copy = new Solution().deepCopy(lists);
t.equal(copy, List.of(List.of(1, 2), List.of(), List.of(3)));
lists.get(0).add(99);
lists.get(1).add(7);
lists.add(new ArrayList<>(List.of(5)));
t.equal(copy, List.of(List.of(1, 2), List.of(), List.of(3)),
    "The copy changed with the input. Copy each inner list, not just the outer one.");`,
    },
  ],
};
