import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.lastStoneWeight(new int[]{2, 7, 4, 1, 8, 1}));
        System.out.println(solution.kthLargest(new int[]{3, 2, 3, 1, 2, 4, 5, 5, 6}, 4));
        System.out.println(solution.pickGifts(new int[]{25, 64, 9, 4, 100}, 4));
    }
}
`;

export const maxHeap: LessonData = {
  id: 'max-heap',
  title: 'Max Heap',
  summary: 'Turn PriorityQueue into a max-heap with Comparator.reverseOrder, and avoid the (a, b) -> b - a overflow bug.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Java has no separate max-heap class. Pass a comparator that reverses the natural order, and `poll()` returns the largest element instead of the smallest.',
    },
    {
      type: 'code',
      code: `PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
maxHeap.addAll(List.of(3, 1, 4, 1, 5));

maxHeap.poll(); // 5
maxHeap.poll(); // 4
maxHeap.peek(); // 3

// the same thing, older spelling
PriorityQueue<Integer> other = new PriorityQueue<>(Collections.reverseOrder());`,
    },
    {
      type: 'paragraph',
      text: 'The comparator decides which element counts as “smallest”; the heap always polls that one first. All costs stay the same: O(log n) `offer` and `poll`, O(1) `peek`. To heapify a collection in O(n) with a comparator, create the heap with the comparator first and then call `addAll`, or use `new PriorityQueue<>(n, comparator)` to presize it. There is no constructor that takes both a collection and a comparator.',
    },
    {
      type: 'heading',
      text: 'The `b - a` trap',
    },
    {
      type: 'code',
      code: `// looks fine, is wrong
PriorityQueue<Integer> broken = new PriorityQueue<>((a, b) -> b - a);
broken.addAll(List.of(2_000_000_000, -2_000_000_000, 5));
broken.poll(); // 5, not 2000000000

// correct
PriorityQueue<Integer> fixed = new PriorityQueue<>((a, b) -> Integer.compare(b, a));`,
      caption: '`2_000_000_000 - (-2_000_000_000)` overflows to a negative number, so the comparator lies.',
    },
    {
      type: 'paragraph',
      text: 'A sort with a lying comparator sometimes throws “Comparison method violates its general contract”. A heap never checks: it builds a broken tree and polls elements in the wrong order without any error. Use `Comparator.reverseOrder()` or `Integer.compare(b, a)`, never subtraction.',
    },
    {
      type: 'note',
      title: 'Negating values is not a max-heap',
      text: 'Storing `-x` in a min-heap and negating on the way out breaks on `Integer.MIN_VALUE`, because `-Integer.MIN_VALUE` is still `Integer.MIN_VALUE`. A reversed comparator costs nothing extra and has no edge case.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution` with a max-heap:',
    methods: [
      {
        signature: 'int lastStoneWeight(int[] stones)',
        description:
          'Repeatedly smash the two heaviest stones `x <= y`: if they are equal both are destroyed, otherwise one stone of weight `y - x` remains. Returns the weight of the last stone, or `0` if none is left.',
      },
      {
        signature: 'int kthLargest(int[] nums, int k)',
        description:
          'Returns the k-th largest value, counting duplicates: in `{3, 3, 1}`, the 2nd largest is `3`. `1 <= k <= nums.length`.',
      },
      {
        signature: 'long pickGifts(int[] gifts, int k)',
        description:
          'Each of `k` seconds, take the largest pile and leave `(int) Math.sqrt(pile)` gifts behind in it. Returns the total number of gifts left afterwards.',
      },
    ],
    notes: [
      'Values can be anywhere in the `int` range, including `Integer.MIN_VALUE` and `Integer.MAX_VALUE`.',
      'Stone weights and gift piles are never negative.',
    ],
  },
  complexity: {
    time: 'O(n log n) for `lastStoneWeight`; O(n + k log n) for `kthLargest` and `pickGifts`.',
    space: 'O(n) for the heap.',
  },
  hints: [
    'Create the heap with `new PriorityQueue<>(Comparator.reverseOrder())`, then offer every value.',
    'For `lastStoneWeight`, loop while the heap has at least two stones: poll `y`, poll `x`, and offer `y - x` back if it is not zero.',
    'For `pickGifts`, the total can exceed `int`: sum into a `long` after the k rounds.',
    'Interview tip: when you write a comparator out loud, say `Integer.compare`. Interviewers watch for `b - a`.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int lastStoneWeight(int[] stones) {
        // your code here
        return 0;
    }

    public int kthLargest(int[] nums, int k) {
        // your code here
        return 0;
    }

    public long pickGifts(int[] gifts, int k) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `1
4
29`,
  solutionCode: `import java.util.*;

class Solution {
    public int lastStoneWeight(int[] stones) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());
        for (int stone : stones) heap.offer(stone);
        while (heap.size() > 1) {
            int y = heap.poll();
            int x = heap.poll();
            if (y != x) heap.offer(y - x);
        }
        return heap.isEmpty() ? 0 : heap.peek();
    }

    public int kthLargest(int[] nums, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());
        for (int num : nums) heap.offer(num);
        for (int i = 1; i < k; i++) heap.poll();
        return heap.peek();
    }

    public long pickGifts(int[] gifts, int k) {
        PriorityQueue<Integer> heap = new PriorityQueue<>(Comparator.reverseOrder());
        for (int gift : gifts) heap.offer(gift);
        for (int i = 0; i < k; i++) {
            heap.offer((int) Math.sqrt(heap.poll()));
        }
        long total = 0;
        for (int pile : heap) total += pile;
        return total;
    }
}
${MAIN}`,
  solutionExplanation:
    'A heap built with `Comparator.reverseOrder()` polls the largest value first, so each method reads the maximum in O(log n). `pickGifts` sums the leftover piles by iterating the heap, which is fine for a sum because order doesn’t matter, and it sums into a `long` because the piles can add up past `Integer.MAX_VALUE`.',
  testCases: [
    {
      name: 'lastStoneWeight',
      call: 'lastStoneWeight(new int[]{2, 7, 4, 1, 8, 1})',
      code: `t.equal(new Solution().lastStoneWeight(new int[]{2, 7, 4, 1, 8, 1}), 1);`,
    },
    {
      name: 'lastStoneWeight when every stone is destroyed',
      call: 'lastStoneWeight(new int[]{3, 3}), lastStoneWeight(new int[]{5}), lastStoneWeight(new int[]{})',
      code: `Solution s = new Solution();
t.equal(s.lastStoneWeight(new int[]{3, 3}), 0);
t.equal(s.lastStoneWeight(new int[]{5}), 5);
t.equal(s.lastStoneWeight(new int[]{}), 0);`,
    },
    {
      name: 'kthLargest with duplicates and negatives',
      call: 'kthLargest(new int[]{-1, 3, 3, -7, 2}, 2), kthLargest(new int[]{-1, 3, 3, -7, 2}, 5)',
      code: `Solution s = new Solution();
t.equal(s.kthLargest(new int[]{-1, 3, 3, -7, 2}, 2), 3);
t.equal(s.kthLargest(new int[]{-1, 3, 3, -7, 2}, 5), -7);`,
    },
    {
      name: 'kthLargest near the int limits',
      call: 'kthLargest(new int[]{2000000000, -2000000000, 5, Integer.MIN_VALUE, Integer.MAX_VALUE}, k)',
      code: `Solution s = new Solution();
int[] nums = {2000000000, -2000000000, 5, Integer.MIN_VALUE, Integer.MAX_VALUE};
String hint = "A comparator written as (a, b) -> b - a overflows for these values. Use Comparator.reverseOrder() or Integer.compare(b, a).";
t.equal(s.kthLargest(nums.clone(), 1), Integer.MAX_VALUE, hint);
t.equal(s.kthLargest(nums.clone(), 2), 2000000000, hint);
t.equal(s.kthLargest(nums.clone(), 5), Integer.MIN_VALUE, hint);`,
    },
    {
      name: 'pickGifts',
      call: 'pickGifts(new int[]{25, 64, 9, 4, 100}, 4)',
      code: `t.equal(new Solution().pickGifts(new int[]{25, 64, 9, 4, 100}, 4), 29L);`,
    },
    {
      name: 'pickGifts with a total past Integer.MAX_VALUE',
      call: 'pickGifts(new int[]{2000000000, 2000000000, 1000000000}, 1)',
      code: `t.equal(new Solution().pickGifts(new int[]{2000000000, 2000000000, 1000000000}, 1), 3000044721L,
    "The piles add up past Integer.MAX_VALUE. Sum them into a long.");`,
    },
    {
      name: 'pickGifts with more rounds than piles',
      call: 'pickGifts(new int[]{1, 1, 1}, 4), pickGifts(new int[]{16}, 3)',
      code: `Solution s = new Solution();
t.equal(s.pickGifts(new int[]{1, 1, 1}, 4), 3L);
t.equal(s.pickGifts(new int[]{16}, 3), 1L);`,
    },
  ],
};
