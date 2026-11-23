import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
record Task(String name, int priority) {}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        List<Task> tasks = List.of(
            new Task("deploy", 2), new Task("alert", 1), new Task("backup", 2), new Task("email", 3));
        System.out.println(solution.processOrder(tasks));

        System.out.println(solution.minMeetingRooms(new int[][]{{0, 30}, {5, 10}, {15, 20}}));
        System.out.println(Arrays.toString(solution.cpuOrder(new int[][]{{1, 2}, {2, 4}, {3, 2}, {4, 1}})));
    }
}
`;

export const customPriority: LessonData = {
  id: 'custom-priority',
  title: 'Custom Priority',
  summary:
    'Order a PriorityQueue of records or int[] arrays with a Comparator, and keep elements unchanged while they sit in the heap.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A heap of anything that isn’t `Comparable` needs a comparator, and the comparator is the priority. The same `Comparator.comparingInt(...).thenComparing(...)` chains you use for sorting work here; the head of the heap is whatever the comparator puts first.',
    },
    {
      type: 'code',
      code: `record Task(String name, int priority) {}

PriorityQueue<Task> queue = new PriorityQueue<>(
    Comparator.comparingInt(Task::priority).thenComparing(Task::name));
queue.offer(new Task("deploy", 2));
queue.offer(new Task("alert", 1));
queue.offer(new Task("backup", 2));

queue.poll();        // Task[name=alert, priority=1]
queue.poll().name(); // "backup" (ties on priority broken by name)`,
    },
    {
      type: 'note',
      title: 'Heaps are not stable',
      text: 'A sort with TimSort keeps equal elements in input order. A heap doesn’t: two tasks with the same priority come out in an unspecified order. If ties must break a certain way (by name, by arrival index), put that key in the comparator.',
    },
    {
      type: 'heading',
      text: 'Heaps of `int[]`',
    },
    {
      type: 'paragraph',
      text: 'For a quick tuple, store an `int[]` such as `{distance, node}` and compare by its slots. `int[]` has no natural order, so offering one to a heap without a comparator throws `ClassCastException` at runtime, not at compile time.',
    },
    {
      type: 'code',
      code: `// one key: the lambda's type is inferred from the heap
PriorityQueue<int[]> byFirst = new PriorityQueue<>(Comparator.comparingInt(a -> a[0]));

// a chain needs the parameter type spelled out
PriorityQueue<int[]> byBoth = new PriorityQueue<>(
    Comparator.comparingInt((int[] a) -> a[0]).thenComparingInt(a -> a[1]));

// the same, as a single lambda
PriorityQueue<int[]> also = new PriorityQueue<>(
    (a, b) -> a[0] != b[0] ? Integer.compare(a[0], b[0]) : Integer.compare(a[1], b[1]));`,
      caption: 'Without `(int[] a)`, the chained version fails with “array required, but Object found”.',
    },
    {
      type: 'heading',
      text: 'Don’t change an element inside the heap',
    },
    {
      type: 'code',
      code: `int[] a = {5, 0};
PriorityQueue<int[]> heap = new PriorityQueue<>(Comparator.comparingInt((int[] x) -> x[0]));
heap.offer(a);
heap.offer(new int[]{3, 1});
heap.offer(new int[]{2, 7});
heap.offer(new int[]{4, 8});

a[0] = 1; // the heap isn't told
// polling now yields keys 2, 1, 3, 4: out of order`,
    },
    {
      type: 'paragraph',
      text: 'The heap places each element when you offer it and never looks again. To change a priority, `remove(element)` first (O(n)), change it, then `offer` it back. In graph problems it is usually simpler to offer a new entry with the new priority and skip stale ones when you poll them. Records are immutable, which rules this bug out entirely.',
    },
  ],
  challenge: {
    intro:
      'A `record Task(String name, int priority)` is declared below the `Solution` class. Complete the methods with heaps ordered by a comparator:',
    methods: [
      {
        signature: 'List<String> processOrder(List<Task> tasks)',
        description:
          'Returns the task names in the order a scheduler runs them: lowest `priority` number first; equal priorities by name, A to Z.',
      },
      {
        signature: 'int minMeetingRooms(int[][] intervals)',
        description:
          'Each interval is `{start, end}` with `start < end`. Returns the fewest rooms needed so no two overlapping meetings share one. A meeting that ends at time `t` frees its room for one that starts at `t`.',
      },
      {
        signature: 'int[] cpuOrder(int[][] tasks)',
        description:
          'Task `i` is `{enqueueTime, processingTime}`. One CPU starts at time 0. When idle, it starts the available task (enqueued at or before now) with the shortest processing time, smallest index on ties, and runs it to completion. If nothing is available it waits for the next task. Returns the task indices in the order they run.',
      },
    ],
    notes: [
      'The input list may be immutable (`List.of`). Don’t sort it in place.',
      'Times in `cpuOrder` are up to 2,100,000,000, and running tasks back to back can push the clock past `Integer.MAX_VALUE`.',
    ],
  },
  complexity: {
    time: 'O(n log n) for each method: a sort or n offers and n polls on a heap of up to n elements.',
    space: 'O(n) for the heap and the sorted copy.',
  },
  hints: [
    '`processOrder`: offer every task to a heap ordered by `Comparator.comparingInt(Task::priority).thenComparing(Task::name)`, then poll names into a list.',
    '`minMeetingRooms`: sort a copy of the intervals by start with `Integer.compare`, and keep a min-heap of end times. Before placing a meeting, poll the earliest end if it is `<=` the start; the heap’s final size is the answer.',
    '`cpuOrder`: sort the task indices by enqueue time. Keep a heap of `int[]{processingTime, index}` ordered by both slots. If the heap is empty, jump the clock to the next enqueue time; then offer every task enqueued by now, poll one, and advance a `long` clock.',
    'Interview tip: say the comparator out loud before you code it: “shortest first, then lowest index”. Most heap bugs are a missing tie-breaker.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<String> processOrder(List<Task> tasks) {
        // your code here
        return List.of();
    }

    public int minMeetingRooms(int[][] intervals) {
        // your code here
        return 0;
    }

    public int[] cpuOrder(int[][] tasks) {
        // your code here
        return new int[0];
    }
}
${MAIN}`,
  expectedOutput: `[alert, backup, deploy, email]
2
[0, 2, 3, 1]`,
  solutionCode: `import java.util.*;

class Solution {
    public List<String> processOrder(List<Task> tasks) {
        PriorityQueue<Task> queue = new PriorityQueue<>(
            Comparator.comparingInt(Task::priority).thenComparing(Task::name));
        queue.addAll(tasks);
        List<String> order = new ArrayList<>();
        while (!queue.isEmpty()) order.add(queue.poll().name());
        return order;
    }

    public int minMeetingRooms(int[][] intervals) {
        int[][] meetings = intervals.clone();
        Arrays.sort(meetings, (a, b) -> Integer.compare(a[0], b[0]));
        PriorityQueue<Integer> ends = new PriorityQueue<>();
        for (int[] meeting : meetings) {
            if (!ends.isEmpty() && ends.peek() <= meeting[0]) ends.poll();
            ends.offer(meeting[1]);
        }
        return ends.size();
    }

    public int[] cpuOrder(int[][] tasks) {
        int n = tasks.length;
        Integer[] byEnqueue = new Integer[n];
        for (int i = 0; i < n; i++) byEnqueue[i] = i;
        Arrays.sort(byEnqueue, Comparator.comparingInt(i -> tasks[i][0]));

        PriorityQueue<int[]> ready = new PriorityQueue<>(
            Comparator.comparingInt((int[] a) -> a[0]).thenComparingInt(a -> a[1]));
        int[] order = new int[n];
        long time = 0;
        int next = 0;
        for (int done = 0; done < n; done++) {
            if (ready.isEmpty()) time = Math.max(time, tasks[byEnqueue[next]][0]);
            while (next < n && tasks[byEnqueue[next]][0] <= time) {
                int i = byEnqueue[next++];
                ready.offer(new int[]{tasks[i][1], i});
            }
            int[] task = ready.poll();
            order[done] = task[1];
            time += task[0];
        }
        return order;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each heap’s comparator encodes the rule the problem states, tie-breakers included. In `minMeetingRooms` the heap holds the end times of rooms in use, so its top is the room that frees up first. In `cpuOrder` the heap holds only tasks that have arrived, and the `long` clock can’t overflow when long tasks run back to back.',
  testCases: [
    {
      name: 'processOrder breaks ties by name',
      call: 'processOrder([deploy 2, alert 1, backup 2, email 3, audit 1])',
      code: `List<Task> tasks = List.of(new Task("deploy", 2), new Task("alert", 1), new Task("backup", 2),
    new Task("email", 3), new Task("audit", 1));
t.equal(new Solution().processOrder(tasks), List.of("alert", "audit", "backup", "deploy", "email"));`,
    },
    {
      name: 'processOrder with negatives, duplicates and empty input',
      call: 'processOrder([b 0, B 0, a -5, b 0]), processOrder([])',
      code: `Solution s = new Solution();
t.equal(s.processOrder(List.of(new Task("b", 0), new Task("B", 0), new Task("a", -5), new Task("b", 0))),
    List.of("a", "B", "b", "b"));
t.equal(s.processOrder(List.of()), List.of());`,
    },
    {
      name: 'minMeetingRooms',
      call: 'minMeetingRooms(new int[][]{{9, 10}, {4, 9}, {4, 17}, {2, 3}, {0, 30}})',
      code: `t.equal(new Solution().minMeetingRooms(new int[][]{{9, 10}, {4, 9}, {4, 17}, {2, 3}, {0, 30}}), 3);`,
    },
    {
      name: 'minMeetingRooms reuses a room that frees up exactly on time',
      call: 'minMeetingRooms(new int[][]{{5, 8}, {1, 5}, {8, 9}}), minMeetingRooms(new int[][]{}), minMeetingRooms(new int[][]{{-3, 4}})',
      code: `Solution s = new Solution();
t.equal(s.minMeetingRooms(new int[][]{{5, 8}, {1, 5}, {8, 9}}), 1, "A meeting ending at t frees its room for one starting at t.");
t.equal(s.minMeetingRooms(new int[][]{}), 0);
t.equal(s.minMeetingRooms(new int[][]{{-3, 4}}), 1);`,
    },
    {
      name: 'cpuOrder breaks ties by index',
      call: 'cpuOrder(new int[][]{{7, 10}, {7, 12}, {7, 5}, {7, 4}, {7, 2}, {8, 2}})',
      code: `t.equal(new Solution().cpuOrder(new int[][]{{7, 10}, {7, 12}, {7, 5}, {7, 4}, {7, 2}, {8, 2}}),
    new int[]{4, 5, 3, 2, 0, 1});`,
    },
    {
      name: 'cpuOrder waits when idle',
      call: 'cpuOrder(new int[][]{{5, 2}, {1, 1}, {20, 1}, {5, 1}}), cpuOrder(new int[][]{})',
      code: `Solution s = new Solution();
t.equal(s.cpuOrder(new int[][]{{5, 2}, {1, 1}, {20, 1}, {5, 1}}), new int[]{1, 3, 0, 2});
t.equal(s.cpuOrder(new int[][]{}), new int[]{});`,
    },
    {
      name: 'cpuOrder with a clock past Integer.MAX_VALUE',
      call: 'cpuOrder(new int[][]{{0, 1500000000}, {1, 1500000000}, {2100000000, 1}, {2000000000, 5}})',
      code: `t.equal(new Solution().cpuOrder(new int[][]{{0, 1500000000}, {1, 1500000000}, {2100000000, 1}, {2000000000, 5}}),
    new int[]{0, 1, 2, 3}, "After the first two tasks the clock is 3,000,000,000. Keep the time in a long.");`,
    },
  ],
};
