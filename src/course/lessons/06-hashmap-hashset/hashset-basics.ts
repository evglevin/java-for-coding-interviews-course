import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.hasDuplicate(new int[]{4, 1, 7, 1}));
        System.out.println(solution.hasDuplicate(new int[]{4, 1, 7}));

        System.out.println(solution.firstRepeated(new int[]{5, 2, 8, 2, 5}));

        System.out.println(solution.dedupeKeepOrder(List.of(3, 1, 3, 2, 1, 4)));
    }
}
`;

export const hashsetBasics: LessonData = {
  id: 'hashset-basics',
  title: 'HashSet Basics',
  summary: 'Track membership with HashSet: add, contains, remove, deduplicating, and LinkedHashSet for insertion order.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A `HashSet` is a `HashMap` without values: it stores distinct elements and answers "have I seen this?" in O(1) on average. Declare it as the `Set` interface.',
    },
    {
      type: 'code',
      code: `Set<Integer> seen = new HashSet<>();
System.out.println(seen.add(5));      // true: 5 was new
System.out.println(seen.add(5));      // false: already there, nothing changes
System.out.println(seen.contains(5)); // true
System.out.println(seen.remove(9));   // false: 9 wasn't there
System.out.println(seen.size());      // 1`,
    },
    {
      type: 'paragraph',
      text: 'Because `add` returns `false` for a duplicate, you can test and insert in one call: `if (!seen.add(x)) { /* x is a repeat */ }`. That saves a separate `contains` lookup.',
    },
    {
      type: 'heading',
      text: 'Deduplicating',
    },
    {
      type: 'code',
      code: `List<String> names = List.of("bo", "al", "bo", "cy", "al");

Set<String> unique = new HashSet<>(names);        // 3 elements, order unspecified
Set<String> ordered = new LinkedHashSet<>(names); // [bo, al, cy]: first-seen order
List<String> back = new ArrayList<>(ordered);     // [bo, al, cy]`,
      caption:
        '`LinkedHashSet` costs a little more memory but iterates in insertion order. Re-adding an element does not move it.',
    },
    {
      type: 'list',
      items: [
        'Like `HashMap`, a `HashSet` has no defined order. Don’t print one as an answer; copy it into a `TreeSet` or a sorted list.',
        '`Set.of(1, 2, 3)` is immutable and throws `IllegalArgumentException` if you pass a duplicate: `Set.of(1, 1)` fails at run time.',
        '`contains` uses `equals` and `hashCode`. `String`, boxed numbers, `List`s, and records work; arrays don’t (see Composite Keys).',
      ],
    },
    {
      type: 'note',
      title: 'Sets of boxed numbers',
      text: '`Set<Integer>` boxes each `int`. `set.remove(i)` on a `Set<Integer>` is fine, but on a `List<Integer>` `remove(int)` removes by _index_. If you switch between the two, write `list.remove(Integer.valueOf(i))` to remove by value.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'boolean hasDuplicate(int[] nums)',
        description: 'Returns `true` if any value appears more than once.',
      },
      {
        signature: 'int firstRepeated(int[] nums)',
        description:
          'Scanning left to right, returns the first value that has already appeared earlier, or `-1` if no value repeats. Values are non-negative.',
      },
      {
        signature: 'List<Integer> dedupeKeepOrder(List<Integer> nums)',
        description: 'Returns a new list with each value once, in the order of its first appearance. Doesn’t modify `nums`.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method: one pass with O(1) average set operations.',
    space: 'O(n) for the set.',
  },
  hints: [
    'In `hasDuplicate` and `firstRepeated`, `if (!seen.add(x))` is true exactly when `x` was seen before.',
    'In `firstRepeated`, the answer for `[5, 2, 8, 2, 5]` is `2`: it is the first value whose _second_ occurrence comes earliest.',
    '`dedupeKeepOrder` is one line: `new ArrayList<>(new LinkedHashSet<>(nums))`.',
    'Interview tip: "seen set" is the standard first step for duplicate and cycle questions; state its O(n) space cost.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public boolean hasDuplicate(int[] nums) {
        // your code here
        return false;
    }

    public int firstRepeated(int[] nums) {
        // your code here
        return 0;
    }

    public List<Integer> dedupeKeepOrder(List<Integer> nums) {
        // your code here
        return nums;
    }
}
${MAIN}`,
  expectedOutput: `true
false
2
[3, 1, 2, 4]`,
  solutionCode: `import java.util.*;

class Solution {
    public boolean hasDuplicate(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) {
                return true;
            }
        }
        return false;
    }

    public int firstRepeated(int[] nums) {
        Set<Integer> seen = new HashSet<>();
        for (int x : nums) {
            if (!seen.add(x)) {
                return x;
            }
        }
        return -1;
    }

    public List<Integer> dedupeKeepOrder(List<Integer> nums) {
        return new ArrayList<>(new LinkedHashSet<>(nums));
    }
}
${MAIN}`,
  solutionExplanation:
    '`add` returns `false` for a value already in the set, so the first failed `add` marks the first repeat. A `LinkedHashSet` drops duplicates while keeping the order values were first added, and copying it into an `ArrayList` gives a new list.',
  testCases: [
    {
      name: 'hasDuplicate',
      call: 'hasDuplicate(new int[]{4, 1, 7, 1}), hasDuplicate(new int[]{4, 1, 7})',
      code: `Solution s = new Solution();
t.equal(s.hasDuplicate(new int[]{4, 1, 7, 1}), true);
t.equal(s.hasDuplicate(new int[]{4, 1, 7}), false);`,
    },
    {
      name: 'hasDuplicate with negatives and edges',
      call: 'hasDuplicate(new int[]{-3, 3, -3}), hasDuplicate(new int[]{}), hasDuplicate(new int[]{9})',
      code: `Solution s = new Solution();
t.equal(s.hasDuplicate(new int[]{-3, 3, -3}), true);
t.equal(s.hasDuplicate(new int[]{}), false);
t.equal(s.hasDuplicate(new int[]{9}), false);`,
    },
    {
      name: 'firstRepeated returns the earliest second occurrence',
      call: 'firstRepeated(new int[]{5, 2, 8, 2, 5})',
      code: `t.equal(new Solution().firstRepeated(new int[]{5, 2, 8, 2, 5}), 2,
    "5 appears first, but 2 repeats first (at index 3).");`,
    },
    {
      name: 'firstRepeated with no repeat',
      call: 'firstRepeated(new int[]{1, 2, 3}), firstRepeated(new int[]{}), firstRepeated(new int[]{0, 0})',
      code: `Solution s = new Solution();
t.equal(s.firstRepeated(new int[]{1, 2, 3}), -1);
t.equal(s.firstRepeated(new int[]{}), -1);
t.equal(s.firstRepeated(new int[]{0, 0}), 0);`,
    },
    {
      name: 'dedupeKeepOrder keeps first-seen order',
      call: 'dedupeKeepOrder([3, 1, 3, 2, 1, -4, -4])',
      code: `List<Integer> nums = new ArrayList<>(List.of(3, 1, 3, 2, 1, -4, -4));
t.equal(new Solution().dedupeKeepOrder(nums), List.of(3, 1, 2, -4));
t.equal(nums, List.of(3, 1, 3, 2, 1, -4, -4), "dedupeKeepOrder should not modify its input.");`,
    },
    {
      name: 'dedupeKeepOrder on empty and all-equal lists',
      call: 'dedupeKeepOrder([]), dedupeKeepOrder([7, 7, 7])',
      code: `Solution s = new Solution();
t.equal(s.dedupeKeepOrder(new ArrayList<>()), List.of());
t.equal(s.dedupeKeepOrder(new ArrayList<>(List.of(7, 7, 7))), List.of(7));`,
    },
  ],
};
