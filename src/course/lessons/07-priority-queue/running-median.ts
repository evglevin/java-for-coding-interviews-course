import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        MedianFinder finder = new MedianFinder();
        finder.add(5);
        finder.add(15);
        System.out.println(finder.median());
        finder.add(1);
        System.out.println(finder.median());
        finder.add(3);
        System.out.println(finder.median());
    }
}
`;

export const runningMedian: LessonData = {
  id: 'running-median',
  title: 'Running Median',
  summary:
    'Design a MedianFinder with two heaps, a max-heap for the lower half and a min-heap for the upper half, for O(log n) adds and O(1) medians.',
  blocks: [
    {
      type: 'paragraph',
      text: 'To report the median of a stream after every new number, split the numbers into two halves. A **max-heap** holds the lower half, so its top is the largest small number. A **min-heap** holds the upper half, so its top is the smallest large number. The median sits at one or both tops.',
    },
    {
      type: 'code',
      code: `PriorityQueue<Integer> lower = new PriorityQueue<>(Comparator.reverseOrder()); // max-heap
PriorityQueue<Integer> upper = new PriorityQueue<>();                          // min-heap

// after adding 5, 15, 1, 3:
// lower = {3, 1}, top 3
// upper = {5, 15}, top 5
// median = (3 + 5) / 2.0 = 4.0`,
    },
    {
      type: 'heading',
      text: 'Two invariants',
    },
    {
      type: 'list',
      items: [
        '**Order:** every value in `lower` is `<=` every value in `upper`. Offer a new number to `lower` if it is `<= lower.peek()`, otherwise to `upper`.',
        '**Balance:** `lower.size()` equals `upper.size()` or is one more. After each offer, move one top across if a heap got too big.',
        'Odd count: the median is `lower.peek()`. Even count: the average of both tops.',
      ],
    },
    {
      type: 'paragraph',
      text: 'An add is at most three heap operations, O(log n). Reading the median peeks at two tops, O(1). Keeping a sorted list instead makes each add O(n) for the shifting, and sorting on every query is O(n log n).',
    },
    {
      type: 'note',
      title: 'Averaging two ints',
      text: '`(a + b) / 2` is integer division: `(3 + 4) / 2` is `3`. Divide by `2.0` to get `3.5`. And `a + b` is still `int` arithmetic before the division, so two values near `Integer.MAX_VALUE` overflow to a negative number. Widen first: `((long) a + b) / 2.0`, or `a / 2.0 + b / 2.0`.',
    },
    {
      type: 'note',
      title: 'Don’t compare two tops with ==',
      text: '`lower.peek() == upper.peek()` compares two `Integer` objects by identity. It happens to work for values from −128 to 127, which Java caches, and fails above that. Use `<=`, `<`, or `equals`, which unbox or compare values.',
    },
  ],
  challenge: {
    intro:
      'Write `class MedianFinder`, a data structure for a stream of numbers. Add the fields you need; `Main` and the tests create one with `new MedianFinder()`:',
    methods: [
      {
        signature: 'void add(int num)',
        description: 'Adds a number from the stream. Any `int` is allowed, including duplicates.',
      },
      {
        signature: 'double median()',
        description:
          'Returns the median of all numbers added so far: the middle value for an odd count, the average of the two middle values for an even count. It is called only after at least one `add`.',
      },
    ],
    notes: ['`add` should run in O(log n) and `median` in O(1). One test adds tens of thousands of numbers.'],
  },
  complexity: {
    time: 'O(log n) per `add`, O(1) per `median`.',
    space: 'O(n) for the two heaps.',
  },
  hints: [
    'Use two fields: `PriorityQueue<Integer> lower = new PriorityQueue<>(Comparator.reverseOrder())` and `PriorityQueue<Integer> upper = new PriorityQueue<>()`.',
    'In `add`, offer to `lower` when it is empty or `num <= lower.peek()`, otherwise to `upper`. Then rebalance: if `lower` has two more than `upper`, move `lower.poll()` to `upper`; if `upper` is bigger than `lower`, move `upper.poll()` to `lower`.',
    'In `median`, return `lower.peek()` when `lower` is bigger; otherwise `((long) lower.peek() + upper.peek()) / 2.0`.',
    'Interview tip: a common follow-up is “what if all numbers are in 0..100?” Then a count array of 101 slots finds the median in O(100) without heaps.',
  ],
  starterCode: `import java.util.*;

class MedianFinder {
    // your fields here

    public void add(int num) {
        // your code here
    }

    public double median() {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `10.0
5.0
4.0`,
  solutionCode: `import java.util.*;

class MedianFinder {
    private final PriorityQueue<Integer> lower = new PriorityQueue<>(Comparator.reverseOrder());
    private final PriorityQueue<Integer> upper = new PriorityQueue<>();

    public void add(int num) {
        if (lower.isEmpty() || num <= lower.peek()) lower.offer(num);
        else upper.offer(num);

        if (lower.size() > upper.size() + 1) upper.offer(lower.poll());
        else if (upper.size() > lower.size()) lower.offer(upper.poll());
    }

    public double median() {
        if (lower.size() > upper.size()) return lower.peek();
        return ((long) lower.peek() + upper.peek()) / 2.0;
    }
}
${MAIN}`,
  solutionExplanation:
    'Every add puts the number on the correct side of the split and then moves at most one top across, so `lower` always holds the smaller half (one extra for odd counts) and the middle values are the two tops. The average widens to `long` before adding and divides by `2.0`, so it neither overflows nor truncates.',
  testCases: [
    {
      name: 'median after each add',
      call: 'add 2, 9, 4, 7, 1, 8 with median() after each',
      code: `MedianFinder finder = new MedianFinder();
List<Double> medians = new ArrayList<>();
for (int num : new int[]{2, 9, 4, 7, 1, 8}) {
    finder.add(num);
    medians.add(finder.median());
}
t.equal(medians, List.of(2.0, 5.5, 4.0, 5.5, 4.0, 5.5));`,
    },
    {
      name: 'even count keeps the half',
      call: 'add 1, 2; median()',
      code: `MedianFinder finder = new MedianFinder();
finder.add(1);
finder.add(2);
t.equal(finder.median(), 1.5, "Divide by 2.0, not 2, or the .5 is lost.");`,
    },
    {
      name: 'single number',
      call: 'add -7; median()',
      code: `MedianFinder finder = new MedianFinder();
finder.add(-7);
t.equal(finder.median(), -7.0);`,
    },
    {
      name: 'negatives, duplicates, and a descending stream',
      call: 'add -1, -1, -3, -3, -5, -5, -6 with median() after each',
      code: `MedianFinder finder = new MedianFinder();
List<Double> medians = new ArrayList<>();
for (int num : new int[]{-1, -1, -3, -3, -5, -5, -6}) {
    finder.add(num);
    medians.add(finder.median());
}
t.equal(medians, List.of(-1.0, -1.0, -1.0, -2.0, -3.0, -3.0, -3.0));`,
    },
    {
      name: 'averaging values near the int limits',
      call: 'add Integer.MAX_VALUE twice; add Integer.MIN_VALUE twice (in a new finder)',
      code: `MedianFinder high = new MedianFinder();
high.add(Integer.MAX_VALUE);
high.add(Integer.MAX_VALUE);
t.equal(high.median(), 2147483647.0, "a + b overflows an int here. Widen to long before adding.");
MedianFinder low = new MedianFinder();
low.add(Integer.MIN_VALUE);
low.add(Integer.MIN_VALUE);
t.equal(low.median(), -2147483648.0, "a + b overflows an int here. Widen to long before adding.");`,
    },
    {
      name: 'many numbers, values above the Integer cache',
      call: 'add 1000 to 50999 in a shuffled order, median() at the end',
      code: `List<Integer> nums = new ArrayList<>();
for (int i = 1000; i < 51000; i++) nums.add(i);
Collections.shuffle(nums, new Random(7));
MedianFinder finder = new MedianFinder();
for (int num : nums) finder.add(num);
t.equal(finder.median(), 25999.5);
finder.add(26000);
t.equal(finder.median(), 26000.0);`,
    },
  ],
};
