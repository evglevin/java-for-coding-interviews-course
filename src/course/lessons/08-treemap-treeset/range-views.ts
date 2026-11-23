import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        TreeMap<Integer, Integer> sales = new TreeMap<>(Map.of(1, 50, 3, 20, 5, 70, 8, 10));
        System.out.println(solution.totalInRange(sales, 3, 8) + " " + solution.totalInRange(sales, 6, 2));

        TreeMap<Integer, String> log = new TreeMap<>(Map.of(1, "boot", 4, "login", 7, "save", 9, "logout"));
        solution.truncateFrom(log, 7);
        System.out.println(log);

        MyCalendar calendar = new MyCalendar();
        System.out.println(calendar.book(10, 20) + " " + calendar.book(15, 25) + " " + calendar.book(20, 30) + " " + calendar.book(5, 10));
    }
}
`;

export const rangeViews: LessonData = {
  id: 'range-views',
  title: 'Range Views',
  summary:
    'Work with key ranges through headMap, tailMap, and subMap (and their TreeSet versions), learn their bounds and live-view behavior, and build an interval booking calendar.',
  blocks: [
    {
      type: 'paragraph',
      text: '`headMap`, `tailMap`, and `subMap` return a *view* of the keys in a range. Nothing is copied: creating a view is O(1), and reading it walks the original tree.',
    },
    {
      type: 'code',
      code: `TreeMap<Integer, String> m = new TreeMap<>(Map.of(1, "a", 3, "b", 5, "c", 7, "d"));
m.headMap(5);                 // {1=a, 3=b}        keys < 5
m.tailMap(5);                 // {5=c, 7=d}        keys >= 5
m.subMap(3, 7);               // {3=b, 5=c}        3 <= key < 7
m.headMap(5, true);           // {1=a, 3=b, 5=c}   keys <= 5
m.subMap(3, false, 7, true);  // {5=c, 7=d}        3 < key <= 7

TreeSet<Integer> s = new TreeSet<>(List.of(1, 3, 5, 7));
s.headSet(5);                 // [1, 3]
s.headSet(5, true);           // [1, 3, 5]
s.tailSet(5, false);          // [7]
s.subSet(3, 7);               // [3, 5]`,
    },
    {
      type: 'list',
      items: [
        'Without flags, the lower bound is inclusive and the upper bound is exclusive: `headMap(to)` is `< to`, `tailMap(from)` is `>= from`, `subMap(from, to)` is `from <= key < to`.',
        'The overloads with `boolean` flags set each end yourself: `headMap(to, inclusive)`, `tailMap(from, inclusive)`, `subMap(from, fromInclusive, to, toInclusive)`.',
        '`TreeSet` has the same methods as `headSet`, `tailSet`, and `subSet`.',
        'The versions without flags return a `SortedMap` / `SortedSet`, which lack `floorKey` and the other navigation methods. The versions with flags return a `NavigableMap` / `NavigableSet`, which have them.',
      ],
    },
    {
      type: 'note',
      title: 'Inclusive upper bounds without hi + 1',
      text: 'To include `hi`, use `subMap(lo, true, hi, true)`, not `subMap(lo, hi + 1)`: when `hi` is `Integer.MAX_VALUE`, `hi + 1` wraps to `Integer.MIN_VALUE`. A range whose lower bound is above its upper bound throws `IllegalArgumentException`, so check `lo > hi` first.',
    },
    {
      type: 'heading',
      text: 'Views are live',
    },
    {
      type: 'code',
      code: `SortedMap<Integer, String> late = m.tailMap(4);
late.clear();                // removes 5 and 7 from m itself
System.out.println(m);       // {1=a, 3=b}
m.put(6, "z");
System.out.println(late);    // {6=z}
late.put(2, "x");            // IllegalArgumentException: key out of range`,
    },
    {
      type: 'paragraph',
      text: 'Writes through a view change the original map, and the view sees later changes to the map. `m.tailMap(t).clear()` is the idiom to drop every key from `t` up, in one line. To keep a range after the map changes, copy it: `new TreeMap<>(m.tailMap(4))`.',
    },
    {
      type: 'note',
      title: 'size() on a view is O(k)',
      text: 'A view doesn’t know how many keys it holds, so `size()` walks them: O(log n + k) for k keys in the range. `subMap(lo, true, hi, true).size()` counts a range correctly, but not in O(log n). If you must answer many range counts fast, sort the values into an array and binary-search both ends instead.',
    },
    {
      type: 'heading',
      text: 'Booking intervals',
    },
    {
      type: 'paragraph',
      text: 'A calendar that rejects double bookings stores each booking as `start → end` in a `TreeMap`. Bookings are half-open, `[start, end)`, so `[10, 20)` and `[20, 30)` don’t overlap. The stored bookings never overlap each other, so a new booking `[s, e)` only has to be checked against its two neighbors:',
    },
    {
      type: 'list',
      items: [
        'The booking that starts at or before `s`, from `floorEntry(s)`, must end at or before `s`.',
        'The booking that starts at or after `s`, from `ceilingEntry(s)`, must start at or after `e`.',
        'If both checks pass (or the neighbor is `null`), store the booking; otherwise reject it and store nothing.',
      ],
    },
  ],
  challenge: {
    intro:
      'Complete the two methods of `Solution`, then the `MyCalendar` class below it. `MyCalendar` keeps its own bookings, so add the fields it needs:',
    methods: [
      {
        signature: 'int totalInRange(TreeMap<Integer, Integer> sales, int from, int to)',
        description:
          '`sales` maps a day to that day’s sales. Returns the total sales of the days from `from` to `to`, both inclusive. Returns `0` if `from > to`.',
      },
      {
        signature: 'TreeMap<Integer, String> truncateFrom(TreeMap<Integer, String> log, int time)',
        description: 'Removes every entry whose key is `time` or later from `log` itself, then returns `log`.',
      },
      {
        signature: 'boolean book(int start, int end)',
        description:
          'In `MyCalendar`. Books the half-open interval `[start, end)` and returns `true` if it overlaps no earlier booking. Otherwise returns `false` and books nothing.',
      },
    ],
    notes: ['Every booking has `start < end`. Values can be negative.'],
  },
  complexity: {
    time: '`totalInRange`: O(log n + k) for k days in the range. `truncateFrom`: O(m log n) to remove m entries. `book`: O(log n).',
    space: 'O(1) extra for the first two; O(b) for b stored bookings.',
  },
  hints: [
    '`totalInRange`: after handling `from > to`, loop over `sales.subMap(from, true, to, true).values()` and add them up.',
    '`truncateFrom`: `log.tailMap(time)` is a live view of the keys from `time` up; clearing it clears them from `log`.',
    '`book`: keep a `TreeMap<Integer, Integer>` from start to end. Reject if `floorEntry(start)` ends after `start`, or if `ceilingEntry(start)` starts before `end`. Put the booking only after both checks pass.',
    'Interview tip: confirm whether intervals are closed or half-open before you code. It decides whether to compare with `<` or `<=`.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int totalInRange(TreeMap<Integer, Integer> sales, int from, int to) {
        // your code here
        return 0;
    }

    public TreeMap<Integer, String> truncateFrom(TreeMap<Integer, String> log, int time) {
        // your code here
        return log;
    }
}

class MyCalendar {
    public boolean book(int start, int end) {
        // your code here
        return false;
    }
}
${MAIN}`,
  expectedOutput: `100 0
{1=boot, 4=login}
true false true true`,
  solutionCode: `import java.util.*;

class Solution {
    public int totalInRange(TreeMap<Integer, Integer> sales, int from, int to) {
        if (from > to) return 0;
        int total = 0;
        for (int amount : sales.subMap(from, true, to, true).values()) {
            total += amount;
        }
        return total;
    }

    public TreeMap<Integer, String> truncateFrom(TreeMap<Integer, String> log, int time) {
        log.tailMap(time).clear();
        return log;
    }
}

class MyCalendar {
    private final TreeMap<Integer, Integer> bookings = new TreeMap<>();

    public boolean book(int start, int end) {
        Map.Entry<Integer, Integer> before = bookings.floorEntry(start);
        if (before != null && before.getValue() > start) return false;
        Map.Entry<Integer, Integer> after = bookings.ceilingEntry(start);
        if (after != null && after.getKey() < end) return false;
        bookings.put(start, end);
        return true;
    }
}
${MAIN}`,
  solutionExplanation:
    '`subMap(from, true, to, true)` includes both bounds without computing `to + 1`, and the `from > to` check avoids the exception for an inverted range. `tailMap(time)` is a live view that includes `time`, so clearing it removes those entries from `log`. `MyCalendar` keeps non-overlapping bookings sorted by start, so a new one can only collide with the booking just before it or just after it.',
  testCases: [
    {
      name: 'totalInRange includes both bounds',
      call: 'totalInRange({1=50, 3=20, 5=70, 8=10}, 3, 8), (..., 5, 5), (..., 9, 20), (..., -10, 100)',
      code: `TreeMap<Integer, Integer> sales = new TreeMap<>(Map.of(1, 50, 3, 20, 5, 70, 8, 10));
Solution s = new Solution();
t.equal(s.totalInRange(sales, 3, 8), 100, "Days 3 and 8 both count. subMap(from, to) excludes to.");
t.equal(s.totalInRange(sales, 5, 5), 70);
t.equal(s.totalInRange(sales, 9, 20), 0);
t.equal(s.totalInRange(sales, -10, 100), 150);`,
    },
    {
      name: 'totalInRange with an inverted range, no sales, and the int limits',
      call: 'totalInRange({1=5, 4=6}, 9, 2), totalInRange({}, 0, 10), totalInRange({-5=1, 0=2, 2147483647=4}, 0, Integer.MAX_VALUE)',
      code: `Solution s = new Solution();
t.equal(s.totalInRange(new TreeMap<>(Map.of(1, 5, 4, 6)), 9, 2), 0, "from > to should return 0, not throw.");
t.equal(s.totalInRange(new TreeMap<>(), 0, 10), 0);
TreeMap<Integer, Integer> sales = new TreeMap<>(Map.of(-5, 1, 0, 2, Integer.MAX_VALUE, 4));
t.equal(s.totalInRange(sales, 0, Integer.MAX_VALUE), 6,
    "to + 1 overflows when to is Integer.MAX_VALUE. Use the subMap overload with inclusive flags.");
t.equal(s.totalInRange(sales, Integer.MIN_VALUE, 0), 3);`,
    },
    {
      name: 'truncateFrom removes the key and everything after it, in place',
      call: 'truncateFrom({1=boot, 4=login, 7=save, 9=logout}, 7)',
      code: `TreeMap<Integer, String> log = new TreeMap<>(Map.of(1, "boot", 4, "login", 7, "save", 9, "logout"));
TreeMap<Integer, String> result = new Solution().truncateFrom(log, 7);
t.equal(log, Map.of(1, "boot", 4, "login"), "log itself should lose the key 7 and every key after it.");
t.check(result == log, "truncateFrom should return the same map it was given, not a copy.");`,
    },
    {
      name: 'truncateFrom before all keys and after all keys',
      call: 'truncateFrom({-3=a, 2=b}, -10), truncateFrom({-3=a, 2=b}, 100), truncateFrom({-3=a, 2=b}, 0)',
      code: `Solution s = new Solution();
t.equal(s.truncateFrom(new TreeMap<>(Map.of(-3, "a", 2, "b")), -10), new TreeMap<Integer, String>());
t.equal(s.truncateFrom(new TreeMap<>(Map.of(-3, "a", 2, "b")), 100), Map.of(-3, "a", 2, "b"));
t.equal(s.truncateFrom(new TreeMap<>(Map.of(-3, "a", 2, "b")), 0), Map.of(-3, "a"));`,
    },
    {
      name: 'MyCalendar accepts touching intervals and rejects overlaps',
      call: 'book(10, 20), book(15, 25), book(20, 30), book(5, 10), book(5, 15)',
      code: `MyCalendar c = new MyCalendar();
t.equal(c.book(10, 20), true);
t.equal(c.book(15, 25), false);
t.equal(c.book(20, 30), true, "[10, 20) and [20, 30) only touch; intervals are half-open.");
t.equal(c.book(5, 10), true);
t.equal(c.book(5, 15), false);`,
    },
    {
      name: 'MyCalendar rejects intervals that contain or sit inside a booking',
      call: 'book(10, 20), book(5, 30), book(12, 18), book(10, 11)',
      code: `MyCalendar c = new MyCalendar();
t.equal(c.book(10, 20), true);
t.equal(c.book(5, 30), false, "[5, 30) contains [10, 20). Check the booking that starts after 5 too.");
t.equal(c.book(12, 18), false, "[12, 18) sits inside [10, 20).");
t.equal(c.book(10, 11), false);
t.equal(c.book(-20, -10), true);`,
    },
    {
      name: 'MyCalendar stores nothing for a rejected booking, and calendars are separate',
      call: 'book(10, 20), book(15, 25), book(20, 25); new MyCalendar().book(15, 25)',
      code: `MyCalendar c = new MyCalendar();
t.equal(c.book(10, 20), true);
t.equal(c.book(15, 25), false);
t.equal(c.book(20, 25), true, "A rejected booking must not be stored.");
t.equal(new MyCalendar().book(15, 25), true, "Each MyCalendar has its own bookings; don't make the map static.");`,
    },
  ],
};
