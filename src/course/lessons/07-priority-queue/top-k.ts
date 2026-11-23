import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.topKLargest(new int[]{3, 2, 1, 5, 6, 4}, 2));
        System.out.println(Arrays.deepToString(solution.kClosest(new int[][]{{1, 3}, {-2, 2}, {2, -2}, {5, -1}}, 2)));
        System.out.println(solution.topKFrequent(new String[]{"i", "love", "code", "i", "love", "coding"}, 2));
    }
}
`;

export const topK: LessonData = {
  id: 'top-k',
  title: 'Top K Elements',
  summary:
    'Find the k largest, closest, or most frequent items with a size-k heap in O(n log k), and return them in a fixed order.',
  blocks: [
    {
      type: 'paragraph',
      text: 'To keep the k **largest** values, keep a **min-heap** of size k. Its top is the weakest of the current top k. Each new value goes in; when the heap grows past k, `poll()` throws out the smallest. What is left at the end is the k largest.',
    },
    {
      type: 'code',
      code: `int[] nums = {3, 2, 1, 5, 6, 4};
int k = 2;

PriorityQueue<Integer> best = new PriorityQueue<>(); // min-heap
for (int num : nums) {
    best.offer(num);
    if (best.size() > k) best.poll(); // evict the smallest of k + 1
}
best.peek(); // 5, the k-th largest

List<Integer> top = new ArrayList<>();
while (!best.isEmpty()) top.add(best.poll()); // [5, 6], ascending
Collections.reverse(top);                     // [6, 5]`,
    },
    {
      type: 'list',
      items: [
        'k largest → min-heap of size k. k smallest → max-heap of size k. The heap’s order is the opposite of what you keep.',
        'Each step costs O(log k), so the whole pass is O(n log k) time and O(k) space. Sorting everything is O(n log n); heapifying all n and polling k times is O(n + k log n) but O(n) space.',
        'Polling the final heap gives the kept items worst first. Reverse the list, or fill an array from its last index.',
      ],
    },
    {
      type: 'heading',
      text: 'k closest points',
    },
    {
      type: 'paragraph',
      text: 'Closest means smallest distance, so keep a max-heap on distance and evict the farthest. Compare **squared** distances: `Math.sqrt` is slower and gives a `double` you’d then compare with rounding error. Square in `long`: `x * x` overflows `int` once `|x|` passes 46,340.',
    },
    {
      type: 'code',
      code: `static long dist(int[] p) {
    return (long) p[0] * p[0] + (long) p[1] * p[1];
}

PriorityQueue<int[]> farthestFirst = new PriorityQueue<>(
    Comparator.comparingLong((int[] p) -> dist(p)).reversed());`,
      caption: 'Cast before multiplying. `(long) (p[0] * p[0])` overflows first and casts the wrong value.',
    },
    {
      type: 'note',
      title: 'Ties decide the answer',
      text: 'When the k-th and (k+1)-th items tie, “the top k” is ambiguous, and so is the heap’s output order. Interview problems usually fix a tie-breaker (alphabetical, smaller x). Put it in the comparator in the same direction as the main key, so `reversed()` flips both.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution` with a heap of size at most k:',
    methods: [
      {
        signature: 'List<Integer> topKLargest(int[] nums, int k)',
        description: 'Returns the k largest values, largest first, counting duplicates. `0 <= k <= nums.length`.',
      },
      {
        signature: 'int[][] kClosest(int[][] points, int k)',
        description:
          'Each point is `{x, y}`. Returns the k points closest to the origin, ordered by distance, then by `x`, then by `y`, all ascending. `0 <= k <= points.length`; coordinates are within ±100,000.',
      },
      {
        signature: 'List<String> topKFrequent(String[] words, int k)',
        description:
          'Returns the k most frequent words, most frequent first; equal counts in alphabetical order. `k` is at most the number of distinct words.',
      },
    ],
    notes: ['Count words with a `HashMap<String, Integer>` and `merge(word, 1, Integer::sum)`.'],
  },
  complexity: {
    time: 'O(n log k) for each method, plus O(n) to count words.',
    space: 'O(k) for the heap; O(d) for the counts of d distinct words.',
  },
  hints: [
    '`topKLargest`: offer each value to a min-heap and poll whenever its size exceeds k. Poll the rest into a list and reverse it.',
    '`kClosest`: build a comparator on (squared distance as `long`, x, y) ascending, and give the heap its `reversed()` so the worst kept point is on top. Fill the result array from index k − 1 down to 0.',
    '`topKFrequent`: the heap’s top must be the word to evict: lowest count, and among equal counts the alphabetically *last*. Try `Comparator.comparingInt((String w) -> counts.get(w)).thenComparing(Comparator.reverseOrder())`.',
    'Interview tip: say “min-heap of size k, O(n log k)” before coding. Interviewers often follow up with quickselect, which is O(n) on average but O(n²) in the worst case.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<Integer> topKLargest(int[] nums, int k) {
        // your code here
        return List.of();
    }

    public int[][] kClosest(int[][] points, int k) {
        // your code here
        return new int[0][];
    }

    public List<String> topKFrequent(String[] words, int k) {
        // your code here
        return List.of();
    }
}
${MAIN}`,
  expectedOutput: `[6, 5]
[[-2, 2], [2, -2]]
[i, love]`,
  solutionCode: `import java.util.*;

class Solution {
    public List<Integer> topKLargest(int[] nums, int k) {
        PriorityQueue<Integer> best = new PriorityQueue<>();
        for (int num : nums) {
            best.offer(num);
            if (best.size() > k) best.poll();
        }
        List<Integer> top = new ArrayList<>();
        while (!best.isEmpty()) top.add(best.poll());
        Collections.reverse(top);
        return top;
    }

    private static long dist(int[] p) {
        return (long) p[0] * p[0] + (long) p[1] * p[1];
    }

    public int[][] kClosest(int[][] points, int k) {
        Comparator<int[]> closer = Comparator.comparingLong((int[] p) -> dist(p))
            .thenComparingInt(p -> p[0])
            .thenComparingInt(p -> p[1]);
        PriorityQueue<int[]> kept = new PriorityQueue<>(closer.reversed());
        for (int[] point : points) {
            kept.offer(point);
            if (kept.size() > k) kept.poll();
        }
        int[][] result = new int[kept.size()][];
        for (int i = result.length - 1; i >= 0; i--) result[i] = kept.poll();
        return result;
    }

    public List<String> topKFrequent(String[] words, int k) {
        Map<String, Integer> counts = new HashMap<>();
        for (String word : words) counts.merge(word, 1, Integer::sum);
        PriorityQueue<String> kept = new PriorityQueue<>(
            Comparator.comparingInt((String w) -> counts.get(w)).thenComparing(Comparator.reverseOrder()));
        for (String word : counts.keySet()) {
            kept.offer(word);
            if (kept.size() > k) kept.poll();
        }
        List<String> top = new ArrayList<>();
        while (!kept.isEmpty()) top.add(kept.poll());
        Collections.reverse(top);
        return top;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each heap is ordered worst-first for what it keeps, so the element evicted when the size passes k is always the worst of k + 1 candidates. Polling the survivors gives them worst to best, so each method reverses that order; the full comparators make ties deterministic, and `long` squared distances can’t overflow.',
  testCases: [
    {
      name: 'topKLargest with duplicates and negatives',
      call: 'topKLargest(new int[]{-1, 7, 3, 7, -5, 0}, 3)',
      code: `t.equal(new Solution().topKLargest(new int[]{-1, 7, 3, 7, -5, 0}, 3), List.of(7, 7, 3));`,
    },
    {
      name: 'topKLargest edges',
      call: 'topKLargest(new int[]{4, 1}, 0), topKLargest(new int[]{4, 1}, 2), topKLargest(new int[]{-9}, 1)',
      code: `Solution s = new Solution();
t.equal(s.topKLargest(new int[]{4, 1}, 0), List.of());
t.equal(s.topKLargest(new int[]{4, 1}, 2), List.of(4, 1));
t.equal(s.topKLargest(new int[]{-9}, 1), List.of(-9));`,
    },
    {
      name: 'kClosest orders ties by x, then y',
      call: 'kClosest(new int[][]{{3, 3}, {1, -1}, {-1, 1}, {1, 1}, {0, 5}, {-1, -1}}, 4)',
      code: `t.equal(new Solution().kClosest(new int[][]{{3, 3}, {1, -1}, {-1, 1}, {1, 1}, {0, 5}, {-1, -1}}, 4),
    new int[][]{{-1, -1}, {-1, 1}, {1, -1}, {1, 1}});`,
    },
    {
      name: 'kClosest with large coordinates',
      call: 'kClosest(new int[][]{{50000, 50000}, {30000, 0}, {-100000, 0}}, 2)',
      code: `t.equal(new Solution().kClosest(new int[][]{{50000, 50000}, {30000, 0}, {-100000, 0}}, 2),
    new int[][]{{30000, 0}, {50000, 50000}}, "50000 * 50000 overflows an int. Compute squared distances as long.");`,
    },
    {
      name: 'kClosest edges',
      call: 'kClosest(new int[][]{{2, 2}}, 0), kClosest(new int[][]{{0, 0}, {0, 0}}, 2)',
      code: `Solution s = new Solution();
t.equal(s.kClosest(new int[][]{{2, 2}}, 0), new int[][]{});
t.equal(s.kClosest(new int[][]{{0, 0}, {0, 0}}, 2), new int[][]{{0, 0}, {0, 0}});`,
    },
    {
      name: 'topKFrequent breaks ties alphabetically',
      call: 'topKFrequent(new String[]{"the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"}, 4)',
      code: `t.equal(new Solution().topKFrequent(new String[]{"the", "day", "is", "sunny", "the", "the", "the", "sunny", "is", "is"}, 4),
    List.of("the", "is", "sunny", "day"));`,
    },
    {
      name: 'topKFrequent when the k-th place is tied',
      call: 'topKFrequent(new String[]{"b", "a", "c", "b", "a", "c", "d"}, 2)',
      code: `Solution s = new Solution();
t.equal(s.topKFrequent(new String[]{"b", "a", "c", "b", "a", "c", "d"}, 2), List.of("a", "b"),
    "Three words tie at count 2; keep the alphabetically first ones.");
t.equal(s.topKFrequent(new String[]{"solo"}, 1), List.of("solo"));`,
    },
  ],
};
