import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.byLength(new String[]{"pear", "fig", "kiwi", "apple", "fig", "plum"}));

        System.out.println(solution.secondLargest(new int[]{4, 9, 1, 9, 7}) + " " + solution.secondLargest(new int[]{3, 3}));

        System.out.println(solution.containsNearbyValue(new int[]{1, 5, 9, 1, 5, 9}, 2, 3) + " "
            + solution.containsNearbyValue(new int[]{1, 2, 3, 1}, 3, 0));
    }
}
`;

export const treesetBasics: LessonData = {
  id: 'treeset-basics',
  title: 'TreeSet Basics',
  summary:
    'Keep unique elements sorted with TreeSet, navigate it with floor and ceiling, and avoid the trap where the comparator silently drops elements.',
  blocks: [
    {
      type: 'paragraph',
      text: '`TreeSet` is a `TreeMap` with keys only: it keeps unique elements in sorted order, and `add`, `remove`, and `contains` cost O(log n). It has the same navigation methods as `TreeMap`, named without the `Key` suffix.',
    },
    {
      type: 'code',
      code: `TreeSet<Integer> set = new TreeSet<>(List.of(5, 1, 9, 5, 3));
System.out.println(set);    // [1, 3, 5, 9]
set.first();                // 1
set.last();                 // 9
set.floor(4);               // 3     largest <= 4
set.ceiling(4);             // 5     smallest >= 4
set.lower(1);               // null  nothing < 1
set.higher(9);              // null  nothing > 9
set.pollFirst();            // 1, and removes it
System.out.println(set.descendingSet()); // [9, 5, 3]`,
    },
    {
      type: 'list',
      items: [
        '`first()` / `last()` throw `NoSuchElementException` on an empty set; `pollFirst()` / `pollLast()` return `null`.',
        '`floor`, `ceiling`, `lower`, and `higher` return `null` when nothing qualifies. Unboxing that `null` into an `int` throws `NullPointerException`.',
        '`add` returns `false` when the element is already there, so `if (!set.add(x))` detects a duplicate in one call.',
        '`descendingSet()` is a reverse-order view, not a copy. To loop from largest to smallest, use `for (int x : set.descendingSet())`.',
      ],
    },
    {
      type: 'heading',
      text: 'The comparator decides what counts as a duplicate',
    },
    {
      type: 'paragraph',
      text: 'A `TreeSet` never calls `equals`. Two elements are duplicates when the comparator returns `0` for them, so a comparator that looks at one field silently throws away every other element that ties on it.',
    },
    {
      type: 'code',
      code: `TreeSet<String> byLength = new TreeSet<>(Comparator.comparingInt(String::length));
byLength.addAll(List.of("fig", "pear", "kiwi", "apple", "plum"));
System.out.println(byLength);                 // [fig, pear, apple]
System.out.println(byLength.contains("lime")); // true

TreeSet<String> fixed = new TreeSet<>(
    Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
fixed.addAll(List.of("fig", "pear", "kiwi", "apple", "plum"));
System.out.println(fixed); // [fig, kiwi, pear, plum, apple]`,
      caption:
        '`"kiwi"` and `"plum"` have the same length as `"pear"`, so the first set drops them, and `contains("lime")` finds `"pear"`. A tie-breaker fixes it.',
    },
    {
      type: 'paragraph',
      text: 'The same rule applies to `TreeMap` keys: `put` with a key that compares equal to an existing one replaces the value and keeps the old key. Whenever you pass a comparator, make sure it returns `0` only for elements you really consider the same.',
    },
    {
      type: 'heading',
      text: 'TreeSet or PriorityQueue?',
    },
    {
      type: 'paragraph',
      text: 'Both give you the smallest element in O(log n). Pick `TreeSet` when you also need to remove an arbitrary element: `TreeSet.remove(x)` is O(log n), while `PriorityQueue.remove(x)` scans the whole heap in O(n). A `TreeSet` also gives you the largest element and floor and ceiling lookups. Its cost: it drops duplicates. When values can repeat, store counts in a `TreeMap`, or make every element unique, for example `int[]{value, index}` compared by value, then index.',
    },
    {
      type: 'note',
      title: 'Sliding windows',
      text: 'A `TreeSet` of the last k elements answers "is any value in the window within t of x?" with one `ceiling(x - t)` call. Each step adds the new element and removes the one leaving the window, both O(log n), so the whole scan is O(n log k).',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'List<String> byLength(String[] words)',
        description:
          'Returns the distinct words, shortest first; words of the same length in natural (alphabetical) order. Keep every distinct word.',
      },
      {
        signature: 'Integer secondLargest(int[] nums)',
        description: 'Returns the second-largest *distinct* value, or `null` if `nums` has fewer than two distinct values.',
      },
      {
        signature: 'boolean containsNearbyValue(int[] nums, int k, int t)',
        description: 'Returns `true` if two different indices `i` and `j` satisfy `|i - j| <= k` and `|nums[i] - nums[j]| <= t`.',
      },
    ],
    notes: [
      '`k >= 0` and `t >= 0`. Values can be anywhere in the `int` range, so a difference of two values can overflow an `int`.',
    ],
  },
  complexity: {
    time: 'O(n log n) for `byLength` and `secondLargest`; O(n log k) for `containsNearbyValue`, whose set never holds more than k + 1 elements.',
    space: 'O(n) for the first two sets; O(k) for the window.',
  },
  hints: [
    '`byLength`: build the `TreeSet` with `Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder())`, add the words, and return `new ArrayList<>(set)`.',
    '`secondLargest`: put the values in a `TreeSet`; with at least two of them, the answer is `set.lower(set.last())`.',
    '`containsNearbyValue`: keep a `TreeSet<Long>` of the last k values. For each `x`, find `ceiling(x - t)`; if it exists and is `<= x + t`, you found a pair. Then add `x`, and once the set covers more than k indices, remove `nums[i - k]`.',
    'Interview tip: say why you use `long` before you write it. Interviewers often add the `Integer.MAX_VALUE` test case to see whether you thought of overflow.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<String> byLength(String[] words) {
        // your code here
        return List.of();
    }

    public Integer secondLargest(int[] nums) {
        // your code here
        return null;
    }

    public boolean containsNearbyValue(int[] nums, int k, int t) {
        // your code here
        return false;
    }
}
${MAIN}`,
  expectedOutput: `[fig, kiwi, pear, plum, apple]
7 null
false true`,
  solutionCode: `import java.util.*;

class Solution {
    public List<String> byLength(String[] words) {
        TreeSet<String> set = new TreeSet<>(
            Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        for (String word : words) {
            set.add(word);
        }
        return new ArrayList<>(set);
    }

    public Integer secondLargest(int[] nums) {
        TreeSet<Integer> set = new TreeSet<>();
        for (int x : nums) {
            set.add(x);
        }
        return set.size() < 2 ? null : set.lower(set.last());
    }

    public boolean containsNearbyValue(int[] nums, int k, int t) {
        TreeSet<Long> window = new TreeSet<>();
        for (int i = 0; i < nums.length; i++) {
            long x = nums[i];
            Long closest = window.ceiling(x - t);
            if (closest != null && closest <= x + t) return true;
            window.add(x);
            if (i >= k) window.remove((long) nums[i - k]);
        }
        return false;
    }
}
${MAIN}`,
  solutionExplanation:
    'The tie-breaker makes the comparator return `0` only for identical words, so `byLength` keeps every distinct word. `lower(last())` is the largest value below the maximum. In `containsNearbyValue`, `ceiling(x - t)` is the smallest earlier value that could be close enough, and doing the arithmetic in `long` keeps `x - t` and `x + t` from wrapping around.',
  testCases: [
    {
      name: 'byLength keeps words that tie on length',
      call: 'byLength(new String[]{"pear", "fig", "kiwi", "apple", "plum"})',
      code: `t.equal(new Solution().byLength(new String[]{"pear", "fig", "kiwi", "apple", "plum"}),
    List.of("fig", "kiwi", "pear", "plum", "apple"),
    "Words of the same length compare as 0 without a tie-breaker, and the TreeSet drops them.");`,
    },
    {
      name: 'byLength removes duplicates, uppercase first on ties',
      call: 'byLength(new String[]{"bb", "a", "bb", "Bb", "a"}), byLength(new String[]{})',
      code: `Solution s = new Solution();
t.equal(s.byLength(new String[]{"bb", "a", "bb", "Bb", "a"}), List.of("a", "Bb", "bb"));
t.equal(s.byLength(new String[]{}), List.of());`,
    },
    {
      name: 'secondLargest skips copies of the largest',
      call: 'secondLargest(new int[]{4, 9, 1, 9, 7}), secondLargest(new int[]{-5, -1, -1, -3})',
      code: `Solution s = new Solution();
t.equal(s.secondLargest(new int[]{4, 9, 1, 9, 7}), 7, "The second-largest distinct value; 9 appears twice.");
t.equal(s.secondLargest(new int[]{-5, -1, -1, -3}), -3);`,
    },
    {
      name: 'secondLargest with fewer than two distinct values',
      call: 'secondLargest(new int[]{3, 3}), secondLargest(new int[]{}), secondLargest(new int[]{8})',
      code: `Solution s = new Solution();
t.equal(s.secondLargest(new int[]{2, 3}), 2);
t.check(s.secondLargest(new int[]{3, 3}) == null, "secondLargest({3, 3}) should be null.");
t.check(s.secondLargest(new int[]{}) == null, "secondLargest({}) should be null.");
t.check(s.secondLargest(new int[]{8}) == null, "secondLargest({8}) should be null.");`,
    },
    {
      name: 'containsNearbyValue',
      call: 'containsNearbyValue(new int[]{1, 2, 3, 1}, 3, 0), containsNearbyValue(new int[]{1, 5, 9, 1, 5, 9}, 2, 3)',
      code: `Solution s = new Solution();
t.equal(s.containsNearbyValue(new int[]{1, 2, 3, 1}, 3, 0), true);
t.equal(s.containsNearbyValue(new int[]{1, 5, 9, 1, 5, 9}, 2, 3), false);
t.equal(s.containsNearbyValue(new int[]{10, 20, 13}, 1, 3), false, "10 and 13 are within 3, but 2 indices apart and k is 1.");
t.equal(s.containsNearbyValue(new int[]{-8, 4, -6}, 2, 2), true);`,
    },
    {
      name: 'containsNearbyValue edges: k = 0, one element, empty',
      call: 'containsNearbyValue(new int[]{7, 7}, 0, 5), containsNearbyValue(new int[]{7}, 3, 3), containsNearbyValue(new int[]{}, 1, 1)',
      code: `Solution s = new Solution();
t.equal(s.containsNearbyValue(new int[]{7, 7}, 0, 5), false, "With k = 0 no two different indices qualify.");
t.equal(s.containsNearbyValue(new int[]{7}, 3, 3), false);
t.equal(s.containsNearbyValue(new int[]{}, 1, 1), false);`,
    },
    {
      name: 'containsNearbyValue near the ends of the int range',
      call: 'containsNearbyValue(new int[]{2147483646, 2147483647}, 1, 1), containsNearbyValue(new int[]{-1, 2147483647}, 1, 5)',
      code: `Solution s = new Solution();
t.equal(s.containsNearbyValue(new int[]{2147483646, 2147483647}, 1, 1), true,
    "x + t overflows an int when x is Integer.MAX_VALUE. Do the arithmetic in long.");
t.equal(s.containsNearbyValue(new int[]{-1, 2147483647}, 1, 5), false,
    "-1 - 2147483647 overflows an int. Do the arithmetic in long.");
t.equal(s.containsNearbyValue(new int[]{-2147483648, 2147483647}, 1, 2147483647), false);`,
    },
  ],
};
