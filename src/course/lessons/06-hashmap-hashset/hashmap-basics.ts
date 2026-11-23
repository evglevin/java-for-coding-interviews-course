import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(Arrays.toString(solution.twoSum(new int[]{2, 7, 11, 15}, 9)));
        System.out.println(Arrays.toString(solution.twoSum(new int[]{3, 2, 4}, 6)));

        System.out.println(new TreeMap<>(solution.firstIndex("banana")));

        Map<String, Integer> prices = Map.of("apple", 3, "bread", 5, "milk", 2);
        System.out.println(solution.totalPrice(prices, new String[]{"milk", "apple", "caviar", "milk"}));
    }
}
`;

export const hashmapBasics: LessonData = {
  id: 'hashmap-basics',
  title: 'HashMap Basics',
  summary: 'Store and look up key-value pairs with HashMap: put, get, containsKey, remove, and the null and ordering traps.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Declare the variable as the `Map` interface and create a `HashMap`. Keys and values must be objects, so `int` becomes `Integer` and `char` becomes `Character`; Java boxes and unboxes them for you.',
    },
    {
      type: 'code',
      code: `Map<String, Integer> ages = new HashMap<>();
ages.put("ann", 31);                     // null: there was no old value
ages.put("bob", 25);
System.out.println(ages.put("ann", 32)); // 31: put replaces and returns the old value

System.out.println(ages.get("ann"));         // 32
System.out.println(ages.get("zoe"));         // null: missing keys give null
System.out.println(ages.containsKey("bob")); // true
System.out.println(ages.remove("bob"));      // 25: the removed value
System.out.println(ages.size());             // 1`,
    },
    {
      type: 'paragraph',
      text: '`put`, `get`, `containsKey`, and `remove` run in O(1) on average. A bad hash function or many colliding keys can slow them down, but with `String`, `Integer`, and records you can count on O(1) in an interview.',
    },
    {
      type: 'heading',
      text: 'A missing key is `null`, and `null` does not unbox',
    },
    {
      type: 'code',
      code: `Map<String, Integer> stock = new HashMap<>();
int n = stock.get("pear");            // NullPointerException: null can't become an int
Integer m = stock.get("pear");        // fine, m is null
int k = stock.getOrDefault("pear", 0); // 0`,
      caption: 'Check with `containsKey` or use `getOrDefault` before assigning a lookup to an `int`.',
    },
    {
      type: 'list',
      items: [
        '`get` returning `null` means the key is missing _or_ maps to `null`. `HashMap` allows a `null` key and `null` values; avoid storing them.',
        'Compare `Integer` values from a map with `.equals`, not `==`. `==` compares references and is only reliable for small values (-128 to 127, which are cached).',
        '`HashMap` iteration order is unspecified and can change as the map grows. Never rely on it, and never print a `HashMap` as an answer. Copy it into a `TreeMap` to print it sorted by key.',
      ],
    },
    {
      type: 'note',
      title: 'Immutable maps',
      text: '`Map.of("a", 1, "b", 2)` builds a small map you can’t change: `put` and `remove` throw `UnsupportedOperationException`. It also rejects `null` keys or values and duplicate keys. Use it for test data; wrap it in `new HashMap<>(...)` when you need to modify it.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int[] twoSum(int[] nums, int target)',
        description:
          'Returns `[i, j]` with `i < j` and `nums[i] + nums[j] == target`, or an empty array if no pair exists. At most one pair matches. Do it in one pass.',
      },
      {
        signature: 'Map<Character, Integer> firstIndex(String s)',
        description: 'Maps each character of `s` to the index where it first appears.',
      },
      {
        signature: 'int totalPrice(Map<String, Integer> prices, String[] items)',
        description:
          'Adds up the price of every item, counting repeats. Items that are not in `prices` cost 0. Don’t modify `prices`.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method: one pass with O(1) average map operations.',
    space: 'O(n) for the maps built in `twoSum` and `firstIndex`.',
  },
  hints: [
    'In `twoSum`, map each value you have already seen to its index. For `nums[j]`, look up `target - nums[j]` before you store `nums[j]`.',
    'In `firstIndex`, `put` overwrites. Only store a character when `containsKey` says it isn’t there yet.',
    'In `totalPrice`, `prices.get(item)` is `null` for an unknown item, and adding it to an `int` throws. Use `getOrDefault(item, 0)`.',
    'Interview tip: say "O(1) average" for hash map operations, not "O(1)". Interviewers notice.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // your code here
        return new int[0];
    }

    public Map<Character, Integer> firstIndex(String s) {
        // your code here
        return new HashMap<>();
    }

    public int totalPrice(Map<String, Integer> prices, String[] items) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `[0, 1]
[1, 2]
{a=1, b=0, n=2}
7`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> indexOf = new HashMap<>();
        for (int j = 0; j < nums.length; j++) {
            Integer i = indexOf.get(target - nums[j]);
            if (i != null) {
                return new int[]{i, j};
            }
            indexOf.put(nums[j], j);
        }
        return new int[0];
    }

    public Map<Character, Integer> firstIndex(String s) {
        Map<Character, Integer> first = new HashMap<>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (!first.containsKey(c)) {
                first.put(c, i);
            }
        }
        return first;
    }

    public int totalPrice(Map<String, Integer> prices, String[] items) {
        int total = 0;
        for (String item : items) {
            total += prices.getOrDefault(item, 0);
        }
        return total;
    }
}
${MAIN}`,
  solutionExplanation:
    '`twoSum` checks for the complement before storing the current value, so an element never pairs with itself and the earlier index comes first. `firstIndex` stores a character only the first time it sees it, and `totalPrice` uses `getOrDefault` so a missing item adds 0 instead of unboxing `null`.',
  testCases: [
    {
      name: 'twoSum finds the pair',
      call: 'twoSum(new int[]{2, 7, 11, 15}, 9)',
      code: `t.equal(new Solution().twoSum(new int[]{2, 7, 11, 15}, 9), new int[]{0, 1});`,
    },
    {
      name: 'twoSum with duplicates and negatives',
      call: 'twoSum(new int[]{3, 3}, 6), twoSum(new int[]{-4, 8, 1, -1}, -5)',
      code: `Solution s = new Solution();
t.equal(s.twoSum(new int[]{3, 3}, 6), new int[]{0, 1});
t.equal(s.twoSum(new int[]{-4, 8, 1, -1}, -5), new int[]{0, 3});`,
    },
    {
      name: 'twoSum does not pair an element with itself',
      call: 'twoSum(new int[]{5, 1, 2}, 10), twoSum(new int[]{}, 0)',
      code: `Solution s = new Solution();
t.equal(s.twoSum(new int[]{5, 1, 2}, 10), new int[0], "5 + 5 uses the same element twice; there is no pair.");
t.equal(s.twoSum(new int[]{}, 0), new int[0]);`,
    },
    {
      name: 'firstIndex keeps the first occurrence',
      call: 'firstIndex("abcabc")',
      code: `t.equal(new Solution().firstIndex("abcabc"), Map.of('a', 0, 'b', 1, 'c', 2),
    "put overwrites the old value; keep the index where each character first appears.");`,
    },
    {
      name: 'firstIndex on empty and single-character strings',
      call: 'firstIndex(""), firstIndex("z")',
      code: `Solution s = new Solution();
t.equal(s.firstIndex(""), Map.of());
t.equal(s.firstIndex("z"), Map.of('z', 0));`,
    },
    {
      name: 'totalPrice treats missing items as free',
      call: 'totalPrice({apple=3, milk=2}, ["milk", "caviar", "apple", "milk"])',
      code: `Map<String, Integer> prices = new HashMap<>(Map.of("apple", 3, "milk", 2));
t.equal(new Solution().totalPrice(prices, new String[]{"milk", "caviar", "apple", "milk"}), 7);
t.equal(prices, Map.of("apple", 3, "milk", 2), "prices should not be modified.");`,
    },
    {
      name: 'totalPrice with no items',
      call: 'totalPrice({apple=3}, [])',
      code: `t.equal(new Solution().totalPrice(Map.of("apple", 3), new String[]{}), 0);`,
    },
  ],
};
