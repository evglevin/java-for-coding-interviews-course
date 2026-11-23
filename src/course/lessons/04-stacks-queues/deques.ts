import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        System.out.println(Arrays.toString(solution.maxInWindows(nums, 3)));
        System.out.println(solution.isPalindrome("A man, a plan, a canal: Panama"));
        System.out.println(solution.isPalindrome("race a car"));
    }
}
`;

export const deques: LessonData = {
  id: 'deques',
  title: 'Double-Ended Queues',
  summary: 'Add and remove at both ends of an ArrayDeque, and keep a monotonic deque of indices for sliding window maximums.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A `Deque` adds, removes and reads at both ends in O(1). Each operation has a `First` and a `Last` version:',
    },
    {
      type: 'code',
      code: `Deque<Integer> deque = new ArrayDeque<>();
deque.offerLast(2);
deque.offerLast(3);
deque.offerFirst(1);
System.out.println(deque);             // [1, 2, 3]
System.out.println(deque.peekFirst()); // 1
System.out.println(deque.peekLast());  // 3
System.out.println(deque.pollLast());  // 3
System.out.println(deque.pollFirst()); // 1
System.out.println(deque);             // [2]`,
    },
    {
      type: 'list',
      items: [
        '`offerFirst`/`offerLast`, `pollFirst`/`pollLast` and `peekFirst`/`peekLast` return `null` (or `false`) instead of throwing. The `addFirst`, `removeFirst` and `getFirst` family throws on an empty deque.',
        'The stack methods work on the **front**: `push` is `addFirst`, `pop` is `removeFirst`, `peek` is `peekFirst`.',
        'The queue methods add at the **back** and remove from the front: `offer` is `offerLast`, `poll` is `pollFirst`.',
        'When you use both ends, write the `First`/`Last` names everywhere. Mixing `push` and `offer` on one deque compiles, but nobody can tell which end is which.',
      ],
    },
    {
      type: 'heading',
      text: 'Monotonic deque',
    },
    {
      type: 'paragraph',
      text: 'For the minimum (or maximum) of every window of size `k`, keep a deque of **indices** whose values increase from front to back. The front is always the current window’s minimum. Each index enters and leaves once, so the whole pass is O(n), not O(n · k).',
    },
    {
      type: 'code',
      code: `// minimum of each window of size k
int[] result = new int[nums.length - k + 1];
Deque<Integer> window = new ArrayDeque<>(); // indices, values increasing
for (int i = 0; i < nums.length; i++) {
    // drop the front once it has left the window
    if (!window.isEmpty() && window.peekFirst() <= i - k) window.pollFirst();
    // drop values that can never be the minimum again
    while (!window.isEmpty() && nums[window.peekLast()] >= nums[i]) window.pollLast();
    window.offerLast(i);
    if (i >= k - 1) result[i - k + 1] = nums[window.peekFirst()];
}`,
      caption: 'A newer, smaller value makes every larger value before it useless: they leave the window first and never win.',
    },
    {
      type: 'note',
      title: 'Why indices',
      text: 'The deque stores indices, not values, so you can tell when the front has slid out of the window (`index <= i - k`). With values alone, duplicates make that impossible to tell.',
    },
    {
      type: 'note',
      title: '`==` on boxed values',
      text: '`deque.peekFirst() == deque.peekLast()` compares two `Integer` (or `Character`) references. Java caches boxes for `-128` to `127`, so it works on small test cases and fails on larger values. Compare with `.equals`, or assign to an `int`/`char` first.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution` with an `ArrayDeque`:',
    methods: [
      {
        signature: 'int[] maxInWindows(int[] nums, int k)',
        description:
          'Returns the maximum of every window of `k` consecutive elements, from left to right. The result has `nums.length - k + 1` elements. `1 <= k <= nums.length`.',
      },
      {
        signature: 'boolean isPalindrome(String s)',
        description:
          'Returns `true` if `s` reads the same both ways, ignoring case and every character that is not a letter or digit (`Character.isLetterOrDigit`). Compare characters from both ends of a deque.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for both: each index enters and leaves the window deque once; each character is added and removed once.',
    space: 'O(k) for the window deque; O(n) for the characters.',
  },
  hints: [
    'Adapt the minimum template: keep values **decreasing** from front to back, so pop from the back while `nums[back] <= nums[i]`.',
    'Evict the front when its index is `<= i - k`, and record `nums[front]` once `i >= k - 1`.',
    'For `isPalindrome`, `offerLast(Character.toLowerCase(c))` every letter or digit, then compare `pollFirst()` with `pollLast()` while at least two remain. Unbox to `char` before comparing.',
    'Interview tip: "each index is pushed and popped at most once" is the argument interviewers want for why a monotonic deque is O(n).',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] maxInWindows(int[] nums, int k) {
        // your code here
        return new int[0];
    }

    public boolean isPalindrome(String s) {
        // your code here
        return false;
    }
}
${MAIN}`,
  expectedOutput: `[3, 3, 5, 5, 6, 7]
true
false`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] maxInWindows(int[] nums, int k) {
        int[] result = new int[nums.length - k + 1];
        Deque<Integer> window = new ArrayDeque<>();
        for (int i = 0; i < nums.length; i++) {
            if (!window.isEmpty() && window.peekFirst() <= i - k) window.pollFirst();
            while (!window.isEmpty() && nums[window.peekLast()] <= nums[i]) window.pollLast();
            window.offerLast(i);
            if (i >= k - 1) result[i - k + 1] = nums[window.peekFirst()];
        }
        return result;
    }

    public boolean isPalindrome(String s) {
        Deque<Character> chars = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (Character.isLetterOrDigit(c)) chars.offerLast(Character.toLowerCase(c));
        }
        while (chars.size() > 1) {
            char first = chars.pollFirst();
            char last = chars.pollLast();
            if (first != last) return false;
        }
        return true;
    }
}
${MAIN}`,
  solutionExplanation:
    'The window deque holds indices whose values decrease from front to back, so its front is the maximum of the current window; an index leaves from the front when it slides out, or from the back when a larger value arrives. `isPalindrome` keeps only the normalized letters and digits and peels matching pairs off both ends, unboxing each `Character` to `char` so the comparison is by value.',
  testCases: [
    {
      name: 'maxInWindows',
      call: 'maxInWindows(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3)',
      code: `t.equal(new Solution().maxInWindows(new int[]{1, 3, -1, -3, 5, 3, 6, 7}, 3), new int[]{3, 3, 5, 5, 6, 7});`,
    },
    {
      name: 'maxInWindows with k = 1 and k = n',
      call: 'maxInWindows(new int[]{4, -2, 7}, 1), maxInWindows(new int[]{4, -2, 7, 1}, 4)',
      code: `Solution s = new Solution();
t.equal(s.maxInWindows(new int[]{4, -2, 7}, 1), new int[]{4, -2, 7});
t.equal(s.maxInWindows(new int[]{4, -2, 7, 1}, 4), new int[]{7});
t.equal(s.maxInWindows(new int[]{5}, 1), new int[]{5});`,
    },
    {
      name: 'maxInWindows evicts the front',
      call: 'maxInWindows(new int[]{9, 8, 7, 6, 5}, 2)',
      code: `t.equal(new Solution().maxInWindows(new int[]{9, 8, 7, 6, 5}, 2), new int[]{9, 8, 7, 6},
    "On a decreasing array the maximum must leave from the front once its index is out of the window.");`,
    },
    {
      name: 'maxInWindows with duplicates and negatives',
      call: 'maxInWindows(new int[]{-4, -4, -2, -4, -4}, 2), maxInWindows(new int[]{500, 500, 500, 100}, 3)',
      code: `Solution s = new Solution();
t.equal(s.maxInWindows(new int[]{-4, -4, -2, -4, -4}, 2), new int[]{-4, -2, -2, -4});
t.equal(s.maxInWindows(new int[]{500, 500, 500, 100}, 3), new int[]{500, 500});`,
    },
    {
      name: 'isPalindrome ignores case and punctuation',
      call: 'isPalindrome("A man, a plan, a canal: Panama"), isPalindrome("race a car")',
      code: `Solution s = new Solution();
t.equal(s.isPalindrome("A man, a plan, a canal: Panama"), true);
t.equal(s.isPalindrome("race a car"), false);
t.equal(s.isPalindrome("No 'x' in Nixon"), true);`,
    },
    {
      name: 'isPalindrome edge cases',
      call: 'isPalindrome(""), isPalindrome("a"), isPalindrome(".,!"), isPalindrome("0P")',
      code: `Solution s = new Solution();
t.equal(s.isPalindrome(""), true);
t.equal(s.isPalindrome("a"), true);
t.equal(s.isPalindrome(".,!"), true, "With no letters or digits left, the string is a palindrome.");
t.equal(s.isPalindrome("0P"), false);
t.equal(s.isPalindrome("12321"), true);`,
    },
    {
      name: 'isPalindrome with characters outside the box cache',
      call: 'isPalindrome("\\u00c9t\\u00e9"), isPalindrome("\\u00e9a\\u00e8")',
      code: `Solution s = new Solution();
t.equal(s.isPalindrome("\\u00c9t\\u00e9"), true, "Compare chars by value: == on two Character objects above 127 compares references.");
t.equal(s.isPalindrome("\\u00e9a\\u00e8"), false);`,
    },
  ],
};
