import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        TreeMap<Integer, Integer> prices = new TreeMap<>(Map.of(10, 100, 20, 120, 30, 90));
        System.out.println(solution.priceAt(prices, 25) + " " + solution.priceAt(prices, 30) + " " + solution.priceAt(prices, 5));

        TreeMap<Integer, String> events = new TreeMap<>(Map.of(9, "standup", 12, "lunch", 17, "retro"));
        System.out.println(solution.nextEvent(events, 9) + " " + solution.nextEvent(events, 13) + " [" + solution.nextEvent(events, 17) + "]");

        TreeMap<Integer, String> stops = new TreeMap<>(Map.of(0, "depot", 40, "mall", 100, "park"));
        System.out.println(solution.nearestStop(stops, 25) + " " + solution.nearestStop(stops, 20) + " " + solution.nearestStop(stops, 250));
    }
}
`;

export const floorAndCeiling: LessonData = {
  id: 'floor-and-ceiling',
  title: 'Floor and Ceiling',
  summary:
    'Find the nearest key in a TreeMap with floorKey, ceilingKey, lowerKey, and higherKey, and handle the null they return when nothing qualifies.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A `TreeMap` can find the key *nearest* to a value, not only an exact match. Each lookup walks one path down the tree, so it costs O(log n), the same as `get`.',
    },
    {
      type: 'code',
      code: `TreeMap<Integer, String> m = new TreeMap<>(Map.of(10, "a", 20, "b", 30, "c"));
m.floorKey(25);    // 20    largest key <= 25
m.ceilingKey(25);  // 30    smallest key >= 25
m.floorKey(20);    // 20    floor and ceiling include an exact match
m.lowerKey(20);    // 10    largest key < 20
m.higherKey(30);   // null  no key > 30
m.floorEntry(25);  // 20=b`,
    },
    {
      type: 'list',
      items: [
        '`floorKey(x)`: largest key `<= x`. `ceilingKey(x)`: smallest key `>= x`.',
        '`lowerKey(x)`: largest key `< x`. `higherKey(x)`: smallest key `> x`.',
        '`floorEntry`, `ceilingEntry`, `lowerEntry`, `higherEntry`: the same lookups, returning the whole entry so you get the value without a second `get`.',
        '`TreeSet` has the same four as `floor`, `ceiling`, `lower`, and `higher` (next lesson).',
      ],
    },
    {
      type: 'note',
      title: 'They return null, and unboxing null throws',
      text: 'When no key qualifies, all eight methods return `null`. `int k = m.floorKey(5);` compiles, then throws `NullPointerException` at run time, because Java unboxes the `Integer` into an `int`. Store the result in an `Integer` or an `Entry` and check it for `null` before you use it.',
    },
    {
      type: 'heading',
      text: 'Lookups by time',
    },
    {
      type: 'paragraph',
      text: 'Many interview problems store values by timestamp and ask "what was the value at time t?". Store time as the key, and the answer is the entry with the latest time not after `t`: `floorEntry(t)`.',
    },
    {
      type: 'code',
      code: `TreeMap<Integer, String> status = new TreeMap<>();
status.put(1, "queued");
status.put(5, "running");
status.put(9, "done");

Map.Entry<Integer, String> e = status.floorEntry(7);
System.out.println(e == null ? "unknown" : e.getValue()); // running`,
    },
    {
      type: 'heading',
      text: 'The closest key',
    },
    {
      type: 'paragraph',
      text: 'The key closest to `x` is either its floor or its ceiling. Look up both, skip whichever is `null`, and compare the distances. Decide in advance which one wins a tie; interviewers usually ask for the smaller one.',
    },
    {
      type: 'note',
      title: 'Distances can overflow',
      text: 'With keys near the ends of the `int` range, `x - floor` can exceed `Integer.MAX_VALUE` and wrap around to a negative number, which then looks like the closest. Compute distances as `long`: `(long) x - floor`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each takes a `TreeMap` and leaves it unchanged:',
    methods: [
      {
        signature: 'int priceAt(TreeMap<Integer, Integer> prices, int time)',
        description:
          '`prices` maps the time a price was set to the price. Returns the price in effect at `time`: the one set most recently at or before `time`. Returns `-1` if no price was set by then.',
      },
      {
        signature: 'String nextEvent(TreeMap<Integer, String> events, int time)',
        description:
          'Returns the name of the first event strictly after `time`, or `""` if there is none. An event at exactly `time` has already started and doesn’t count.',
      },
      {
        signature: 'String nearestStop(TreeMap<Integer, String> stops, int position)',
        description:
          '`stops` maps a position on a line to a stop name. Returns the name of the stop closest to `position`; on a tie, the stop at the smaller position. Returns `""` if there are no stops.',
      },
    ],
    notes: ['Positions and times can be any `int`, including negative ones.'],
  },
  complexity: {
    time: 'O(log n) per call: one or two tree lookups.',
    space: 'O(1) extra.',
  },
  hints: [
    '`priceAt` is a floor lookup and `nextEvent` is a strictly-greater lookup. Use the `Entry` versions so you get the value directly.',
    'Check every result for `null` before calling `getValue()` or unboxing it.',
    '`nearestStop`: get `floorEntry(position)` and `ceilingEntry(position)`. If one is `null`, return the other; otherwise compare `(long) position - floor.getKey()` with `(long) ceiling.getKey() - position` and prefer the floor on a tie.',
    'Interview tip: when a problem says "the most recent value at or before time t", reach for `floorEntry` and mention the O(log n) lookup.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int priceAt(TreeMap<Integer, Integer> prices, int time) {
        // your code here
        return 0;
    }

    public String nextEvent(TreeMap<Integer, String> events, int time) {
        // your code here
        return "";
    }

    public String nearestStop(TreeMap<Integer, String> stops, int position) {
        // your code here
        return "";
    }
}
${MAIN}`,
  expectedOutput: `120 90 -1
lunch retro []
mall depot park`,
  solutionCode: `import java.util.*;

class Solution {
    public int priceAt(TreeMap<Integer, Integer> prices, int time) {
        Map.Entry<Integer, Integer> entry = prices.floorEntry(time);
        return entry == null ? -1 : entry.getValue();
    }

    public String nextEvent(TreeMap<Integer, String> events, int time) {
        Map.Entry<Integer, String> entry = events.higherEntry(time);
        return entry == null ? "" : entry.getValue();
    }

    public String nearestStop(TreeMap<Integer, String> stops, int position) {
        Map.Entry<Integer, String> below = stops.floorEntry(position);
        Map.Entry<Integer, String> above = stops.ceilingEntry(position);
        if (below == null && above == null) return "";
        if (below == null) return above.getValue();
        if (above == null) return below.getValue();
        long toBelow = (long) position - below.getKey();
        long toAbove = (long) above.getKey() - position;
        return toBelow <= toAbove ? below.getValue() : above.getValue();
    }
}
${MAIN}`,
  solutionExplanation:
    '`floorEntry` finds the latest price set at or before `time`, and `higherEntry` skips an event at exactly `time` because it is strict. The nearest stop is the floor or the ceiling of `position`; comparing their distances as `long` avoids overflow, and `<=` sends ties to the smaller position.',
  testCases: [
    {
      name: 'priceAt between, on, and after the recorded times',
      call: 'priceAt({10=100, 20=120, 30=90}, 25), priceAt(..., 10), priceAt(..., 99)',
      code: `TreeMap<Integer, Integer> prices = new TreeMap<>(Map.of(10, 100, 20, 120, 30, 90));
Solution s = new Solution();
t.equal(s.priceAt(prices, 25), 120);
t.equal(s.priceAt(prices, 10), 100, "A price set at exactly the requested time is already in effect.");
t.equal(s.priceAt(prices, 99), 90);`,
    },
    {
      name: 'priceAt before any price was set',
      call: 'priceAt({10=100, 20=120}, 5), priceAt({}, 0)',
      code: `Solution s = new Solution();
t.equal(s.priceAt(new TreeMap<>(Map.of(10, 100, 20, 120)), 5), -1, "floorEntry returns null when no key is <= time.");
t.equal(s.priceAt(new TreeMap<>(), 0), -1);`,
    },
    {
      name: 'nextEvent is strictly after the time',
      call: 'nextEvent({9=standup, 12=lunch, 17=retro}, 12), nextEvent(..., -5)',
      code: `TreeMap<Integer, String> events = new TreeMap<>(Map.of(9, "standup", 12, "lunch", 17, "retro"));
Solution s = new Solution();
t.equal(s.nextEvent(events, 12), "retro", "An event at exactly the given time doesn't count. Use higherEntry, not ceilingEntry.");
t.equal(s.nextEvent(events, -5), "standup");`,
    },
    {
      name: 'nextEvent when nothing is left',
      call: 'nextEvent({9=standup, 12=lunch}, 12), nextEvent({}, 0)',
      code: `Solution s = new Solution();
t.equal(s.nextEvent(new TreeMap<>(Map.of(9, "standup", 12, "lunch")), 12), "");
t.equal(s.nextEvent(new TreeMap<>(), 0), "");`,
    },
    {
      name: 'nearestStop picks the closer side and breaks ties low',
      call: 'nearestStop({0=depot, 40=mall, 100=park}, 25), (..., 20), (..., -30), (..., 40)',
      code: `TreeMap<Integer, String> stops = new TreeMap<>(Map.of(0, "depot", 40, "mall", 100, "park"));
Solution s = new Solution();
t.equal(s.nearestStop(stops, 25), "mall");
t.equal(s.nearestStop(stops, 20), "depot", "On a tie, return the stop at the smaller position.");
t.equal(s.nearestStop(stops, -30), "depot");
t.equal(s.nearestStop(stops, 40), "mall");`,
    },
    {
      name: 'nearestStop with no stops or one stop',
      call: 'nearestStop({}, 5), nearestStop({-7=only}, 1000)',
      code: `Solution s = new Solution();
t.equal(s.nearestStop(new TreeMap<>(), 5), "");
t.equal(s.nearestStop(new TreeMap<>(Map.of(-7, "only")), 1000), "only");`,
    },
    {
      name: 'nearestStop with distances that overflow int',
      call: 'nearestStop({-2000000000=west, 2000000000=east}, 1000000000)',
      code: `TreeMap<Integer, String> stops = new TreeMap<>(Map.of(-2_000_000_000, "west", 2_000_000_000, "east"));
t.equal(new Solution().nearestStop(stops, 1_000_000_000), "east",
    "position - floor is 3,000,000,000 here, which overflows an int. Compute distances as long.");`,
    },
  ],
};
