import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(Arrays.toString(solution.heapSort(new int[]{5, 1, 4, 2, 3, -7, 4})));
        System.out.println(solution.kthSmallest(new int[]{7, 10, 4, 3, 20, 15}, 3));
        System.out.println(solution.connectSticks(new int[]{2, 4, 3}));
        System.out.println(solution.connectSticks(new int[]{1, 8, 3, 5}));
    }
}
`;

export const priorityQueueBasics: LessonData = {
  id: 'priority-queue-basics',
  title: 'PriorityQueue Basics',
  summary: 'Use java.util.PriorityQueue as a binary min-heap: offer, poll, peek, their costs, and why it never prints sorted.',
  blocks: [
    {
      type: 'paragraph',
      text: '`PriorityQueue<E>` is Java’s heap. By default it is a **min-heap** in natural order: `poll()` always removes the smallest element. It holds objects, so an `int` heap is a `PriorityQueue<Integer>`.',
    },
    {
      type: 'code',
      code: `PriorityQueue<Integer> heap = new PriorityQueue<>();
heap.offer(5);
heap.offer(1);
heap.offer(4);

heap.peek();  // 1 (looks, doesn't remove)
heap.poll();  // 1 (removes the smallest)
heap.poll();  // 4
heap.size();  // 1

PriorityQueue<Integer> empty = new PriorityQueue<>();
empty.peek(); // null
empty.poll(); // null`,
    },
    {
      type: 'list',
      items: [
        '`offer(e)` (or `add(e)`): inserts in O(log n).',
        '`poll()`: removes and returns the smallest in O(log n), or `null` when the heap is empty.',
        '`peek()`: returns the smallest without removing it, in O(1), or `null` when empty.',
        '`size()` and `isEmpty()`: O(1). Loop with `while (!heap.isEmpty())`.',
        '`contains(o)` and `remove(o)` scan the whole array: O(n). A heap is not a set.',
      ],
    },
    {
      type: 'note',
      title: 'Unboxing a null',
      text: '`int top = heap.poll();` compiles, but on an empty heap `poll()` returns `null` and the unboxing throws `NullPointerException`. Check `isEmpty()` first. `remove()` and `element()` (no arguments) throw `NoSuchElementException` instead of returning `null`.',
    },
    {
      type: 'heading',
      text: 'Only the head is in order',
    },
    {
      type: 'code',
      code: `PriorityQueue<Integer> heap = new PriorityQueue<>(List.of(5, 1, 4, 2, 3));
System.out.println(heap); // [1, 2, 4, 5, 3]  heap order, not sorted

List<Integer> sorted = new ArrayList<>();
while (!heap.isEmpty()) sorted.add(heap.poll());
System.out.println(sorted); // [1, 2, 3, 4, 5]`,
      caption: 'Printing, a for-each loop, `toArray()` and `stream()` all walk the backing array in heap order.',
    },
    {
      type: 'paragraph',
      text: 'The heap guarantees only that each parent is no larger than its children, so the backing array is partly ordered at best. To get elements in order, poll them one at a time. Never print a `PriorityQueue` and expect sorted output.',
    },
    {
      type: 'note',
      title: 'Building from a collection is O(n)',
      text: '`new PriorityQueue<>(collection)` heapifies all the elements at once in O(n). Calling `offer` n times costs O(n log n). Both give a valid heap; the constructor is faster when you have all the values up front.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution` using a `PriorityQueue<Integer>`:',
    methods: [
      {
        signature: 'int[] heapSort(int[] nums)',
        description: 'Returns a new array with the values of `nums` in ascending order.',
      },
      {
        signature: 'int kthSmallest(int[] nums, int k)',
        description:
          'Returns the k-th smallest value, counting duplicates: in `{3, 1, 1}`, the 2nd smallest is `1`. `1 <= k <= nums.length`.',
      },
      {
        signature: 'int connectSticks(int[] sticks)',
        description:
          'Joining two sticks of lengths `x` and `y` costs `x + y` and gives one stick of that length. Returns the minimum total cost to join all the sticks into one; `0` for zero or one stick.',
      },
    ],
    notes: ['Don’t call `Arrays.sort`; the point is to let the heap do the ordering.'],
  },
  complexity: {
    time: 'O(n log n) for `heapSort` and `connectSticks`; O(n + k log n) for `kthSmallest` with a heapified constructor.',
    space: 'O(n) for the heap.',
  },
  hints: [
    'Offer every value into a `PriorityQueue<Integer>`, then poll until it is empty. The polls come out smallest first.',
    'For `kthSmallest`, poll k − 1 times and then `peek()` (or poll once more).',
    'For `connectSticks`, always join the two shortest sticks: poll twice, add the sum to the cost, and offer the sum back. Stop when one stick is left.',
    'Interview tip: the “always combine the two smallest” greedy is the same idea as Huffman coding. Say so, and name the heap.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] heapSort(int[] nums) {
        // your code here
        return nums;
    }

    public int kthSmallest(int[] nums, int k) {
        // your code here
        return 0;
    }

    public int connectSticks(int[] sticks) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `[-7, 1, 2, 3, 4, 4, 5]
7
14
30`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] heapSort(int[] nums) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int num : nums) heap.offer(num);
        int[] sorted = new int[nums.length];
        for (int i = 0; i < sorted.length; i++) sorted[i] = heap.poll();
        return sorted;
    }

    public int kthSmallest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int num : nums) heap.offer(num);
        for (int i = 1; i < k; i++) heap.poll();
        return heap.peek();
    }

    public int connectSticks(int[] sticks) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int stick : sticks) heap.offer(stick);
        int cost = 0;
        while (heap.size() > 1) {
            int joined = heap.poll() + heap.poll();
            cost += joined;
            heap.offer(joined);
        }
        return cost;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each method loads the values into a min-heap and polls, so values come out smallest first. `connectSticks` repeatedly joins the two shortest sticks; joining short sticks first keeps them out of the most later sums, which minimizes the total.',
  testCases: [
    {
      name: 'heapSort with duplicates and negatives',
      call: 'heapSort(new int[]{5, -2, 3, -2, 0, 11})',
      code: `t.equal(new Solution().heapSort(new int[]{5, -2, 3, -2, 0, 11}), new int[]{-2, -2, 0, 3, 5, 11});`,
    },
    {
      name: 'heapSort polls instead of copying heap order',
      call: 'heapSort(new int[]{5, 1, 4, 2, 3})',
      code: `t.equal(new Solution().heapSort(new int[]{5, 1, 4, 2, 3}), new int[]{1, 2, 3, 4, 5},
    "Iterating a PriorityQueue (or calling toArray) gives heap order, not sorted order. Poll the elements one at a time.");`,
    },
    {
      name: 'heapSort of empty and single-element arrays',
      call: 'heapSort(new int[]{}), heapSort(new int[]{42})',
      code: `Solution s = new Solution();
t.equal(s.heapSort(new int[]{}), new int[]{});
t.equal(s.heapSort(new int[]{42}), new int[]{42});`,
    },
    {
      name: 'kthSmallest counts duplicates',
      call: 'kthSmallest(new int[]{3, 1, 1, 2, -4}, 3)',
      code: `Solution s = new Solution();
t.equal(s.kthSmallest(new int[]{3, 1, 1, 2, -4}, 3), 1);
t.equal(s.kthSmallest(new int[]{3, 1, 1, 2, -4}, 2), 1);`,
    },
    {
      name: 'kthSmallest at both ends',
      call: 'kthSmallest(new int[]{9, -3, 6}, 1), kthSmallest(new int[]{9, -3, 6}, 3)',
      code: `Solution s = new Solution();
t.equal(s.kthSmallest(new int[]{9, -3, 6}, 1), -3);
t.equal(s.kthSmallest(new int[]{9, -3, 6}, 3), 9);`,
    },
    {
      name: 'connectSticks',
      call: 'connectSticks(new int[]{1, 8, 3, 5, 5})',
      code: `t.equal(new Solution().connectSticks(new int[]{1, 8, 3, 5, 5}), 48);`,
    },
    {
      name: 'connectSticks with zero or one stick',
      call: 'connectSticks(new int[]{}), connectSticks(new int[]{7})',
      code: `Solution s = new Solution();
t.equal(s.connectSticks(new int[]{}), 0);
t.equal(s.connectSticks(new int[]{7}), 0);`,
    },
  ],
};
