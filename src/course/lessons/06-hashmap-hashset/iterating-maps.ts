import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        Map<String, Integer> scores = new HashMap<>(Map.of("ann", 90, "bob", 75, "cid", 90, "dee", 60));
        System.out.println(solution.topScorer(scores));

        System.out.println(new TreeMap<>(solution.invert(scores)));

        solution.removeBelow(scores, 70);
        System.out.println(new TreeMap<>(scores));
    }
}
`;

export const iteratingMaps: LessonData = {
  id: 'iterating-maps',
  title: 'Iterating a Map',
  summary: 'Loop over a map with entrySet, keySet, values, and forEach; remove entries safely; and get a sorted view.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A `Map` is not `Iterable`, so `for (x : map)` does not compile. Iterate one of its three views instead. `entrySet()` gives you key and value together, without a second lookup:',
    },
    {
      type: 'code',
      code: `Map<String, Integer> stock = new HashMap<>(Map.of("pear", 4, "fig", 0, "kiwi", 7));

for (Map.Entry<String, Integer> e : stock.entrySet()) {
    System.out.println(e.getKey() + " -> " + e.getValue());
}
for (String fruit : stock.keySet()) { /* keys only */ }
for (int count : stock.values()) { /* values only, unboxed */ }
stock.forEach((fruit, count) -> System.out.println(fruit + " " + count));`,
      caption:
        'All four loops visit the entries in the same unspecified order. `var e : stock.entrySet()` saves typing the entry type.',
    },
    {
      type: 'heading',
      text: "Don't modify a map while you loop over it",
    },
    {
      type: 'code',
      code: `for (String fruit : stock.keySet()) {
    if (stock.get(fruit) == 0) stock.remove(fruit); // ConcurrentModificationException
}

stock.entrySet().removeIf(e -> e.getValue() == 0); // safe
stock.values().removeIf(count -> count == 0);      // same, by value only`,
      caption:
        'Adding or removing keys during a for-each loop makes the next step of the iterator throw. Changing a value with `e.setValue(...)` is allowed.',
    },
    {
      type: 'paragraph',
      text: 'Removing through a view removes from the map itself. `keySet().removeIf(...)`, `values().removeIf(...)`, and `entrySet().removeIf(...)` all edit the original map in one O(n) pass.',
    },
    {
      type: 'heading',
      text: 'Sorted output',
    },
    {
      type: 'code',
      code: `System.out.println(new TreeMap<>(stock)); // {fig=0, kiwi=7, pear=4}: sorted by key

List<Map.Entry<String, Integer>> entries = new ArrayList<>(stock.entrySet());
entries.sort(Map.Entry.<String, Integer>comparingByValue().reversed());
// entries by value, highest first: kiwi=7, pear=4, fig=0`,
    },
    {
      type: 'note',
      title: 'Type witnesses',
      text: '`Map.Entry.comparingByValue().reversed()` needs the explicit `<String, Integer>` because Java can’t infer the types once you chain `.reversed()`. Without chaining, `entries.sort(Map.Entry.comparingByValue())` compiles as is. `Collections.max(map.entrySet(), Map.Entry.comparingByValue())` finds the largest entry in O(n) without sorting.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'String topScorer(Map<String, Integer> scores)',
        description:
          'Returns the name with the highest score. On a tie, returns the name that comes first alphabetically. Returns `null` for an empty map.',
      },
      {
        signature: 'Map<Integer, List<String>> invert(Map<String, Integer> m)',
        description: 'Maps each value to the keys that had it, sorted alphabetically. Doesn’t modify `m`.',
      },
      {
        signature: 'void removeBelow(Map<String, Integer> m, int min)',
        description: 'Removes every entry of `m` whose value is less than `min`, in place.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for `topScorer` and `removeBelow`; O(n log n) for `invert`, which sorts the key lists.',
    space: 'O(1) extra for `topScorer` and `removeBelow`; O(n) for the inverted map.',
  },
  hints: [
    'In `topScorer`, loop over `entrySet()` and keep the best entry so far. Replace it when the score is higher, or equal with a name where `compareTo` is negative.',
    'In `invert`, group with `computeIfAbsent(e.getValue(), k -> new ArrayList<>()).add(e.getKey())`, then sort each list. The map’s order is unspecified, so the lists won’t come out sorted on their own.',
    '`removeBelow` is one line: `m.values().removeIf(v -> v < min)`.',
    'Interview tip: if you need to remove while iterating with an explicit `Iterator`, call `it.remove()`, never `map.remove(key)`.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public String topScorer(Map<String, Integer> scores) {
        // your code here
        return null;
    }

    public Map<Integer, List<String>> invert(Map<String, Integer> m) {
        // your code here
        return new HashMap<>();
    }

    public void removeBelow(Map<String, Integer> m, int min) {
        // your code here
    }
}
${MAIN}`,
  expectedOutput: `ann
{60=[dee], 75=[bob], 90=[ann, cid]}
{ann=90, bob=75, cid=90}`,
  solutionCode: `import java.util.*;

class Solution {
    public String topScorer(Map<String, Integer> scores) {
        String best = null;
        int bestScore = 0;
        for (Map.Entry<String, Integer> e : scores.entrySet()) {
            String name = e.getKey();
            int score = e.getValue();
            if (best == null || score > bestScore || (score == bestScore && name.compareTo(best) < 0)) {
                best = name;
                bestScore = score;
            }
        }
        return best;
    }

    public Map<Integer, List<String>> invert(Map<String, Integer> m) {
        Map<Integer, List<String>> result = new HashMap<>();
        for (Map.Entry<String, Integer> e : m.entrySet()) {
            result.computeIfAbsent(e.getValue(), k -> new ArrayList<>()).add(e.getKey());
        }
        for (List<String> keys : result.values()) {
            Collections.sort(keys);
        }
        return result;
    }

    public void removeBelow(Map<String, Integer> m, int min) {
        m.values().removeIf(v -> v < min);
    }
}
${MAIN}`,
  solutionExplanation:
    '`topScorer` reads each entry once and keeps the best, comparing names only on a score tie. `invert` groups keys by value and then sorts each group, since the input order is unspecified. `removeBelow` removes through the `values()` view, which edits the map safely instead of throwing `ConcurrentModificationException`.',
  testCases: [
    {
      name: 'topScorer',
      call: 'topScorer({bob=75, dee=60, eve=82})',
      code: `t.equal(new Solution().topScorer(new HashMap<>(Map.of("bob", 75, "dee", 60, "eve", 82))), "eve");`,
    },
    {
      name: 'topScorer breaks ties alphabetically and handles negatives',
      call: 'topScorer({zed=90, ann=90, mo=90, bo=-5}), topScorer({x=-3, y=-1})',
      code: `Solution s = new Solution();
t.equal(s.topScorer(new HashMap<>(Map.of("zed", 90, "ann", 90, "mo", 90, "bo", -5))), "ann",
    "Several names share the top score; return the alphabetically first one.");
t.equal(s.topScorer(new HashMap<>(Map.of("x", -3, "y", -1))), "y");`,
    },
    {
      name: 'topScorer on an empty map',
      call: 'topScorer({})',
      code: `t.equal(new Solution().topScorer(new HashMap<>()), null);`,
    },
    {
      name: 'invert sorts each key list',
      call: 'invert({pear=1, fig=2, apple=1, kiwi=2, plum=1, date=3})',
      code: `Map<String, Integer> m = new HashMap<>(Map.of("pear", 1, "fig", 2, "apple", 1, "kiwi", 2, "plum", 1, "date", 3));
t.equal(new Solution().invert(m),
    Map.of(1, List.of("apple", "pear", "plum"), 2, List.of("fig", "kiwi"), 3, List.of("date")));
t.equal(m.size(), 6, "invert should not modify its input.");`,
    },
    {
      name: 'invert on an empty map',
      call: 'invert({})',
      code: `t.equal(new Solution().invert(new HashMap<>()), Map.of());`,
    },
    {
      name: 'removeBelow edits the map in place',
      call: 'removeBelow(m, 50) with 20 entries',
      code: `Map<String, Integer> m = new HashMap<>();
Map<String, Integer> expected = new HashMap<>();
for (int i = 0; i < 20; i++) {
    int score = (i * 37) % 100;
    m.put("p" + i, score);
    if (score >= 50) expected.put("p" + i, score);
}
new Solution().removeBelow(m, 50);
t.equal(m, expected, "Entries below 50 should be removed from the map you were given.");`,
    },
    {
      name: 'removeBelow keeps values equal to min',
      call: 'removeBelow({a=5, b=4, c=-1}, 5), removeBelow({}, 0)',
      code: `Solution s = new Solution();
Map<String, Integer> m = new HashMap<>(Map.of("a", 5, "b", 4, "c", -1));
s.removeBelow(m, 5);
t.equal(m, Map.of("a", 5));
Map<String, Integer> empty = new HashMap<>();
s.removeBelow(empty, 0);
t.equal(empty, Map.of());`,
    },
  ],
};
