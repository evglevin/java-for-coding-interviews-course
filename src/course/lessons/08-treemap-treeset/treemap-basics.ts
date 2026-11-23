import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.sortedCounts(new String[]{"pear", "fig", "apple", "fig", "Pear"}));

        TreeMap<Integer, String> tasks = new TreeMap<>(Map.of(2, "email", 5, "deploy", 1, "lunch", 3, "review"));
        System.out.println(solution.drainHighestFirst(tasks) + " " + tasks);

        System.out.println(solution.longestStableRun(new int[]{8, 2, 4, 7}, 4));
        System.out.println(solution.longestStableRun(new int[]{10, 1, 2, 4, 7, 2}, 5));
    }
}
`;

export const treemapBasics: LessonData = {
  id: 'treemap-basics',
  title: 'TreeMap Basics',
  summary:
    'Keep keys sorted with TreeMap: O(log n) operations, key-order iteration, the first/last/poll methods, and when it beats a HashMap.',
  blocks: [
    {
      type: 'paragraph',
      text: '`TreeMap` is a red-black tree: a self-balancing binary search tree. It keeps its keys sorted at all times, so `get`, `put`, `remove`, and `containsKey` cost O(log n), and iterating or printing it walks the keys in ascending order.',
    },
    {
      type: 'code',
      code: `TreeMap<String, Integer> ages = new TreeMap<>();
ages.put("mia", 31);
ages.put("al", 45);
ages.put("Zoe", 27);
System.out.println(ages);                 // {Zoe=27, al=45, mia=31}
System.out.println(ages.firstKey());      // Zoe
System.out.println(ages.lastEntry());     // mia=31
System.out.println(ages.descendingMap()); // {mia=31, al=45, Zoe=27}`,
      caption: 'Keys use their natural order, so uppercase `"Zoe"` comes before lowercase `"al"`.',
    },
    {
      type: 'heading',
      text: 'The two ends of the map',
    },
    {
      type: 'list',
      items: [
        '`firstKey()` / `lastKey()`: the smallest and largest key. They throw `NoSuchElementException` on an empty map.',
        '`firstEntry()` / `lastEntry()`: the whole entry (`getKey()`, `getValue()`), or `null` on an empty map.',
        '`pollFirstEntry()` / `pollLastEntry()`: remove and return the smallest or largest entry, or `null` when empty. Each is O(log n).',
        '`descendingMap()`: a reverse-order view of the same map, created in O(1). Changes to either one show in the other.',
      ],
    },
    {
      type: 'paragraph',
      text: 'These methods exist on `TreeMap` and on the `NavigableMap` interface, not on `Map`. Declare the variable as `TreeMap<K, V>` (or `NavigableMap<K, V>`); with `Map<K, V> m = new TreeMap<>()` the code still keeps keys sorted, but `m.firstKey()` does not compile.',
    },
    {
      type: 'heading',
      text: 'A sorted multiset',
    },
    {
      type: 'code',
      code: `TreeMap<Integer, Integer> counts = new TreeMap<>();
for (int x : new int[]{3, 1, 3}) counts.merge(x, 1, Integer::sum);
System.out.println(counts); // {1=1, 3=2}

// remove one copy; returning null from the function deletes the key
counts.computeIfPresent(1, (k, c) -> c == 1 ? null : c - 1);
counts.computeIfPresent(3, (k, c) -> c == 1 ? null : c - 1);
System.out.println(counts); // {3=1}`,
      caption:
        'Java has no built-in sorted multiset. A `TreeMap` from value to count gives you min, max, add, and remove-one in O(log n).',
    },
    {
      type: 'paragraph',
      text: 'Delete a key when its count reaches zero. A key left with count `0` still shows up as `firstKey()` or `lastKey()` and gives wrong answers.',
    },
    {
      type: 'heading',
      text: 'Keys must be comparable',
    },
    {
      type: 'paragraph',
      text: 'Keys must implement `Comparable` (`String`, `Integer`, and the other boxed types do; your own records don’t), or you pass a `Comparator` to the constructor: `new TreeMap<>(Comparator.reverseOrder())`. A key that is neither throws `ClassCastException` on the first `put`. A `null` key throws `NullPointerException`.',
    },
    {
      type: 'note',
      title: 'TreeMap or HashMap?',
      text: '`HashMap` is O(1) on average per operation; `TreeMap` is O(log n) and uses more memory per entry (each node holds left, right, and parent links). Use `TreeMap` when you need sorted iteration, the smallest or largest key, or the floor and ceiling lookups in the next lesson. If you only need sorted output once at the end, a `HashMap` plus one sort of its keys is often enough.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'TreeMap<String, Integer> sortedCounts(String[] words)',
        description: 'Returns how many times each word appears, with the words in their natural (sorted) order.',
      },
      {
        signature: 'List<String> drainHighestFirst(TreeMap<Integer, String> tasks)',
        description:
          'Maps priority to task name. Returns the task names from highest priority to lowest and leaves `tasks` empty.',
      },
      {
        signature: 'int longestStableRun(int[] nums, int limit)',
        description:
          'Returns the length of the longest contiguous subarray whose largest and smallest values differ by at most `limit`. Returns `0` for an empty array.',
      },
    ],
    notes: ['In `longestStableRun`, `limit >= 0` and every value is between -10^9 and 10^9, so `max - min` fits in an `int`.'],
  },
  complexity: {
    time: 'O(n log n) for each method: n map operations at O(log n) each.',
    space: 'O(n) for the maps.',
    note: '`longestStableRun` is a sliding window; each index enters and leaves the window once.',
  },
  hints: [
    '`sortedCounts`: `counts.merge(word, 1, Integer::sum)` on a `TreeMap` does the counting and the sorting.',
    '`drainHighestFirst`: loop while the map is not empty, calling `pollLastEntry()` and adding its value to the list.',
    '`longestStableRun`: keep a `TreeMap` of value to count for the current window. Add `nums[right]`; while `lastKey() - firstKey() > limit`, remove one copy of `nums[left]` and move `left` forward.',
    'Interview tip: say "I’ll use a TreeMap as a multiset" out loud. Interviewers know the idiom, and it explains why the solution is O(n log n).',
  ],
  starterCode: `import java.util.*;

class Solution {
    public TreeMap<String, Integer> sortedCounts(String[] words) {
        // your code here
        return new TreeMap<>();
    }

    public List<String> drainHighestFirst(TreeMap<Integer, String> tasks) {
        // your code here
        return List.of();
    }

    public int longestStableRun(int[] nums, int limit) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `{Pear=1, apple=1, fig=2, pear=1}
[deploy, review, email, lunch] {}
2
4`,
  solutionCode: `import java.util.*;

class Solution {
    public TreeMap<String, Integer> sortedCounts(String[] words) {
        TreeMap<String, Integer> counts = new TreeMap<>();
        for (String word : words) {
            counts.merge(word, 1, Integer::sum);
        }
        return counts;
    }

    public List<String> drainHighestFirst(TreeMap<Integer, String> tasks) {
        List<String> order = new ArrayList<>();
        while (!tasks.isEmpty()) {
            order.add(tasks.pollLastEntry().getValue());
        }
        return order;
    }

    public int longestStableRun(int[] nums, int limit) {
        TreeMap<Integer, Integer> window = new TreeMap<>();
        int best = 0;
        int left = 0;
        for (int right = 0; right < nums.length; right++) {
            window.merge(nums[right], 1, Integer::sum);
            while (window.lastKey() - window.firstKey() > limit) {
                window.computeIfPresent(nums[left], (k, c) -> c == 1 ? null : c - 1);
                left++;
            }
            best = Math.max(best, right - left + 1);
        }
        return best;
    }
}
${MAIN}`,
  solutionExplanation:
    'A `TreeMap` keeps keys sorted as you insert, so `sortedCounts` needs no separate sort, and `pollLastEntry` hands back the largest key while removing it. In `longestStableRun` the map counts the values in the window, so `firstKey()` and `lastKey()` are its min and max; removing a key only when its count drops to zero keeps duplicates correct.',
  testCases: [
    {
      name: 'sortedCounts counts and sorts, uppercase first',
      call: 'sortedCounts(new String[]{"pear", "fig", "Pear", "fig", "apple"})',
      code: `TreeMap<String, Integer> counts = new Solution().sortedCounts(new String[]{"pear", "fig", "Pear", "fig", "apple"});
t.equal(counts, Map.of("Pear", 1, "apple", 1, "fig", 2, "pear", 1));
t.equal(new ArrayList<>(counts.keySet()), List.of("Pear", "apple", "fig", "pear"));`,
    },
    {
      name: 'sortedCounts of an empty array',
      call: 'sortedCounts(new String[]{})',
      code: `t.equal(new Solution().sortedCounts(new String[]{}), new TreeMap<String, Integer>());
t.equal(new Solution().sortedCounts(new String[]{"solo"}), Map.of("solo", 1));`,
    },
    {
      name: 'drainHighestFirst orders by priority and empties the map',
      call: 'drainHighestFirst({2=email, 5=deploy, -1=nap, 3=review})',
      code: `TreeMap<Integer, String> tasks = new TreeMap<>(Map.of(2, "email", 5, "deploy", -1, "nap", 3, "review"));
t.equal(new Solution().drainHighestFirst(tasks), List.of("deploy", "review", "email", "nap"));
t.check(tasks.isEmpty(), "tasks should be empty afterwards. pollLastEntry() removes the entry it returns.");`,
    },
    {
      name: 'drainHighestFirst with zero or one task',
      call: 'drainHighestFirst({}), drainHighestFirst({7=solo})',
      code: `Solution s = new Solution();
t.equal(s.drainHighestFirst(new TreeMap<>()), List.of());
t.equal(s.drainHighestFirst(new TreeMap<>(Map.of(7, "solo"))), List.of("solo"));`,
    },
    {
      name: 'longestStableRun',
      call: 'longestStableRun(new int[]{10, 1, 2, 4, 7, 2}, 5), longestStableRun(new int[]{-3, -1, -2, 5}, 2)',
      code: `Solution s = new Solution();
t.equal(s.longestStableRun(new int[]{10, 1, 2, 4, 7, 2}, 5), 4);
t.equal(s.longestStableRun(new int[]{-3, -1, -2, 5}, 2), 3);`,
    },
    {
      name: 'longestStableRun with duplicates in the window',
      call: 'longestStableRun(new int[]{1, 1, 5, 5}, 0), longestStableRun(new int[]{1, 5, 5, 5}, 0)',
      code: `Solution s = new Solution();
t.equal(s.longestStableRun(new int[]{1, 1, 5, 5}, 0), 2, "Count each value: removing one 1 must not drop the other 1 from the window.");
t.equal(s.longestStableRun(new int[]{1, 5, 5, 5}, 0), 3, "Remove a key when its count reaches 0, or it stays the window's min.");`,
    },
    {
      name: 'longestStableRun of empty and single-element arrays',
      call: 'longestStableRun(new int[]{}, 3), longestStableRun(new int[]{42}, 0)',
      code: `Solution s = new Solution();
t.equal(s.longestStableRun(new int[]{}, 3), 0);
t.equal(s.longestStableRun(new int[]{42}, 0), 1);`,
    },
  ],
};
