import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.countMatches(List.of(1000, 5, 2024, 7), List.of(1000, 6, 2024, 7)));
        System.out.println(solution.sumNonNull(Arrays.asList(10, null, 20, null, 30)));

        Map<String, Integer> scores = new HashMap<>(Map.of("ana", 1500, "bo", 900));
        System.out.println(solution.scoreOf(scores, "ana") + " " + solution.scoreOf(scores, "cy"));

        System.out.println(solution.removeValue(new ArrayList<>(List.of(10, 20, 1, 30)), 1));
    }
}
`;

export const boxedIntegers: LessonData = {
  id: 'boxed-integers',
  title: 'Boxed Integers',
  summary: 'Know when Java boxes an int into an Integer, why == on Integer breaks above 127, and how unboxing null throws.',
  blocks: [
    {
      type: 'paragraph',
      text: '`int` is a primitive: a 32-bit value with no methods that can never be `null`. `Integer` is its wrapper class: an object on the heap. Collections and generics only hold objects, so `List<Integer>`, `Map<String, Integer>` and `Set<Integer>` store `Integer`s, and Java converts between the two for you. That is **autoboxing** (`int` to `Integer`) and **unboxing** (`Integer` to `int`).',
    },
    {
      type: 'code',
      code: `List<Integer> list = new ArrayList<>();
list.add(42);              // boxes: list.add(Integer.valueOf(42))
int first = list.get(0);   // unboxes: list.get(0).intValue()
int total = first + list.get(0);   // unboxes, adds ints`,
    },
    {
      type: 'note',
      title: '`==` on `Integer` compares references',
      text: '`a == b` with two `Integer`s asks whether they are the same object, not the same number. `Integer.valueOf` caches the objects for -128 to 127, so small values often share an object and `==` seems to work. Values like `1000` usually get separate objects, and `==` returns `false` for equal numbers. Tests with small numbers pass and the bug shows up later. Compare boxed values with `a.equals(b)`, `Objects.equals(a, b)` (null-safe), or unbox one side: `a.intValue() == b`.',
    },
    {
      type: 'code',
      code: `List<Integer> a = List.of(1000, 7);
List<Integer> b = List.of(1000, 7);
a.get(0) == b.get(0)          // unreliable: may be false
a.get(0).equals(b.get(0))     // true
(int) a.get(0) == b.get(0)    // true: one side is an int, so both unbox
Integer.compare(a.get(0), b.get(0))   // 0, for ordering`,
      caption: '`<`, `>`, `+` and the other arithmetic operators unbox automatically. Only `==` and `!=` stay on references.',
    },
    {
      type: 'heading',
      text: 'Unboxing `null` throws',
    },
    {
      type: 'paragraph',
      text: '`map.get(key)` returns `null` for a missing key. Assigning that to an `int`, or using it in arithmetic, unboxes it and throws `NullPointerException`. The line looks harmless, which makes this one of the most common interview crashes:',
    },
    {
      type: 'code',
      code: `Map<String, Integer> counts = new HashMap<>();
int n = counts.get("missing");              // NullPointerException
int m = counts.getOrDefault("missing", 0);  // 0
counts.merge("word", 1, Integer::sum);      // add 1, starting from 0`,
    },
    {
      type: 'note',
      title: '`remove(int)` vs `remove(Object)`',
      text: '`List<Integer>` has two `remove` methods. `list.remove(1)` removes the element at **index** 1, because an `int` argument matches `remove(int index)` without boxing. To remove the value 1, pass an object: `list.remove(Integer.valueOf(1))`. The same goes for `indexOf` and `contains`, which take `Object` and work with an `int` argument.',
    },
    {
      type: 'paragraph',
      text: 'Boxing also costs memory and time: each `Integer` is a separate object of about 16 bytes plus a reference to it. For large numeric data, prefer `int[]` to `List<Integer>`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int countMatches(List<Integer> a, List<Integer> b)',
        description: 'The lists have the same length. Returns the number of positions `i` where `a` and `b` hold the same value.',
      },
      {
        signature: 'int sumNonNull(List<Integer> values)',
        description: 'Returns the sum of the values, skipping `null` elements.',
      },
      {
        signature: 'int scoreOf(Map<String, Integer> scores, String name)',
        description: 'Returns the score for `name`, or `0` if `name` is not in the map.',
      },
      {
        signature: 'List<Integer> removeValue(List<Integer> list, int value)',
        description:
          'Removes the first occurrence of `value` from the list, if present, and returns the list. `value` is a value, not an index.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for `countMatches`, `sumNonNull` and `removeValue`; O(1) on average for `scoreOf`.',
    space: 'O(1) extra.',
  },
  hints: [
    'In `countMatches`, compare with `a.get(i).equals(b.get(i))`. `==` compares references and fails for values like 1000.',
    'In `sumNonNull`, loop over the `Integer`s and check `v != null` before adding; adding a `null` unboxes it and throws.',
    '`scores.getOrDefault(name, 0)` avoids unboxing a `null`.',
    '`list.remove(Integer.valueOf(value))` removes by value; `list.remove(value)` removes by index.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int countMatches(List<Integer> a, List<Integer> b) {
        // your code here
        return 0;
    }

    public int sumNonNull(List<Integer> values) {
        // your code here
        return 0;
    }

    public int scoreOf(Map<String, Integer> scores, String name) {
        // your code here
        return 0;
    }

    public List<Integer> removeValue(List<Integer> list, int value) {
        // your code here
        return list;
    }
}
${MAIN}`,
  expectedOutput: `3
60
1500 0
[10, 20, 30]`,
  solutionCode: `import java.util.*;

class Solution {
    public int countMatches(List<Integer> a, List<Integer> b) {
        int matches = 0;
        for (int i = 0; i < a.size(); i++) {
            if (a.get(i).equals(b.get(i))) matches++;
        }
        return matches;
    }

    public int sumNonNull(List<Integer> values) {
        int sum = 0;
        for (Integer v : values) {
            if (v != null) sum += v;
        }
        return sum;
    }

    public int scoreOf(Map<String, Integer> scores, String name) {
        return scores.getOrDefault(name, 0);
    }

    public List<Integer> removeValue(List<Integer> list, int value) {
        list.remove(Integer.valueOf(value));
        return list;
    }
}
${MAIN}`,
  solutionExplanation:
    '`equals` compares the numbers inside the `Integer`s, so `countMatches` works for any value. `sumNonNull` checks each element for `null` before it is unboxed, and `getOrDefault` never hands back a `null` to unbox. `Integer.valueOf(value)` makes `remove` pick its `remove(Object)` overload.',
  testCases: [
    {
      name: 'countMatches with values above 127',
      call: 'countMatches([1000, 5, 2024, -500], [1000, 6, 2024, -500])',
      code: `List<Integer> a = new ArrayList<>(List.of(1000, 5, 2024, -500));
List<Integer> b = new ArrayList<>(List.of(1000, 6, 2024, -500));
t.equal(new Solution().countMatches(a, b), 3, "Compare Integers with equals; == compares references.");`,
    },
    {
      name: 'countMatches with large values everywhere',
      call: 'countMatches([100000, 200000, 300000], [100000, 200000, 300000])',
      code: `List<Integer> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
for (int i = 1; i <= 3; i++) { a.add(i * 100_000); b.add(i * 100_000); }
t.equal(new Solution().countMatches(a, b), 3);
t.equal(new Solution().countMatches(List.of(), List.of()), 0);`,
    },
    {
      name: 'sumNonNull skips nulls',
      call: 'sumNonNull([5, null, -2, null, 1000])',
      code: `t.equal(new Solution().sumNonNull(Arrays.asList(5, null, -2, null, 1000)), 1003);`,
    },
    {
      name: 'sumNonNull with only nulls and empty',
      call: 'sumNonNull([null, null]), sumNonNull([])',
      code: `Solution s = new Solution();
t.equal(s.sumNonNull(Arrays.asList(null, null)), 0);
t.equal(s.sumNonNull(List.of()), 0);`,
    },
    {
      name: 'scoreOf a present and a missing name',
      call: 'scoreOf({ana=1500, bo=-3}, "bo"), scoreOf(..., "cy")',
      code: `Map<String, Integer> scores = new HashMap<>(Map.of("ana", 1500, "bo", -3));
Solution s = new Solution();
t.equal(s.scoreOf(scores, "bo"), -3);
t.equal(s.scoreOf(scores, "cy"), 0, "A missing key returns null from get; unboxing it throws.");`,
    },
    {
      name: 'removeValue removes by value, not index',
      call: 'removeValue([10, 20, 1, 30, 1], 1)',
      code: `t.equal(new Solution().removeValue(new ArrayList<>(List.of(10, 20, 1, 30, 1)), 1), List.of(10, 20, 30, 1),
    "remove(int) removes by index. Pass Integer.valueOf(value) to remove by value.");`,
    },
    {
      name: 'removeValue with a missing value',
      call: 'removeValue([3, 4], 7)',
      code: `t.equal(new Solution().removeValue(new ArrayList<>(List.of(3, 4)), 7), List.of(3, 4));`,
    },
  ],
};
