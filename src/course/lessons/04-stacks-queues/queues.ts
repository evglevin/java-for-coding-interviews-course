import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}};
        System.out.println(Arrays.toString(solution.distances(6, edges, 0)));
        System.out.println(solution.levels(6, edges, 0));
        System.out.println(solution.eliminationOrder(7, 3));
    }
}
`;

export const queues: LessonData = {
  id: 'queues',
  title: 'Queues with ArrayDeque',
  summary: 'Use ArrayDeque as a FIFO queue with offer, poll and peek, and write breadth-first search level by level.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A FIFO queue is an `ArrayDeque` declared as a `Queue`. `offer` adds at the tail, `poll` removes from the head, `peek` reads the head.',
    },
    {
      type: 'code',
      code: `Queue<Integer> queue = new ArrayDeque<>();
queue.offer(1);
queue.offer(2);
queue.offer(3);
System.out.println(queue);        // [1, 2, 3]  (head first)
System.out.println(queue.poll()); // 1
System.out.println(queue.peek()); // 2
System.out.println(queue.size()); // 2`,
    },
    {
      type: 'heading',
      text: 'Two method families',
    },
    {
      type: 'list',
      items: [
        '`offer(x)`, `poll()`, `peek()`: on an empty queue, `poll` and `peek` return `null`.',
        '`add(x)`, `remove()`, `element()`: the same operations, but `remove` and `element` throw `NoSuchElementException` on an empty queue.',
        'Pick one family and stick to it. Most interview code uses `offer`/`poll` with a `while (!queue.isEmpty())` loop.',
        '`ArrayDeque` rejects `null`, so a `null` from `poll` always means "empty".',
      ],
    },
    {
      type: 'note',
      title: '`LinkedList` and `remove(1)`',
      text: '`LinkedList` also implements `Queue`, but it allocates a node per element, so `ArrayDeque` is faster. If you do use it, declare it as `Queue<Integer>`: on a variable typed `LinkedList<Integer>`, `remove(1)` picks the `remove(int index)` overload and removes the element at index 1, not the value 1.',
    },
    {
      type: 'heading',
      text: 'Breadth-first search, level by level',
    },
    {
      type: 'code',
      code: `List<List<Integer>> graph = new ArrayList<>();
for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
for (int[] e : edges) {
    graph.get(e[0]).add(e[1]);
    graph.get(e[1]).add(e[0]);
}

boolean[] seen = new boolean[n];
Queue<Integer> queue = new ArrayDeque<>();
queue.offer(start);
seen[start] = true;
int depth = 0;
while (!queue.isEmpty()) {
    for (int size = queue.size(); size > 0; size--) {
        int node = queue.poll();
        // node is at distance depth from start
        for (int next : graph.get(node)) {
            if (!seen[next]) {
                seen[next] = true;
                queue.offer(next);
            }
        }
    }
    depth++;
}`,
    },
    {
      type: 'list',
      items: [
        'Mark a node as seen when you **enqueue** it, not when you dequeue it. Otherwise two neighbors can both enqueue the same node, and it shows up twice in its level.',
        '`for (int size = queue.size(); size > 0; size--)` reads the size once, so the inner loop handles exactly one level. `for (int i = 0; i < queue.size(); i++)` re-reads the size while you add the next level, and mixes levels.',
        'Build the adjacency list with a loop of `new ArrayList<>()`. `Collections.nCopies(n, new ArrayList<>())` puts the **same** list in every slot.',
      ],
    },
    {
      type: 'note',
      title: 'Cost',
      text: 'BFS visits each node once and each edge twice (once from each end): O(V + E) time, O(V + E) space for the adjacency list, O(V) for the queue and the `seen` array. In an unweighted graph, the first time BFS reaches a node is along a shortest path.',
    },
  ],
  challenge: {
    intro:
      'Complete the methods of `Solution`. In the graph methods, nodes are numbered `0` to `n - 1` and each `edges[i] = {a, b}` is an undirected edge:',
    methods: [
      {
        signature: 'int[] distances(int n, int[][] edges, int start)',
        description:
          'Returns, for every node, the number of edges on the shortest path from `start`, or `-1` if the node can’t be reached.',
      },
      {
        signature: 'List<List<Integer>> levels(int n, int[][] edges, int start)',
        description:
          'Groups the nodes reachable from `start` by distance: `start` alone first, then its neighbors, and so on. Each level lists its nodes in ascending order.',
      },
      {
        signature: 'List<Integer> eliminationOrder(int n, int k)',
        description:
          'People numbered `1` to `n` stand in a circle. Counting starts at person 1; every `k`-th person leaves the circle, and counting continues with the next one. Returns the people in the order they leave.',
      },
    ],
    notes: [
      '`k` is at least 1. For `eliminationOrder`, a queue models the circle: move people from the head to the tail as you count.',
    ],
  },
  complexity: {
    time: 'O(n + e) for the graph methods (plus O(n log n) to sort the levels); O(n · k) for `eliminationOrder`.',
    space: 'O(n + e) for the adjacency list; O(n) for the queue.',
  },
  hints: [
    'Fill a `dist` array with `-1` (`Arrays.fill`); a node with `dist == -1` hasn’t been seen yet, so the array doubles as the `seen` set.',
    'For `levels`, start a new list at the top of each pass of the `while` loop, add every node polled in the inner `for`, and sort it before adding it to the result.',
    'For `eliminationOrder`, `offer(poll())` moves the head to the tail. Do it `k - 1` times, then `poll()` the person who leaves.',
    'Interview tip: say why BFS finds shortest paths (it explores in order of distance) and that it only works for unweighted edges.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] distances(int n, int[][] edges, int start) {
        // your code here
        return new int[0];
    }

    public List<List<Integer>> levels(int n, int[][] edges, int start) {
        // your code here
        return List.of();
    }

    public List<Integer> eliminationOrder(int n, int k) {
        // your code here
        return List.of();
    }
}
${MAIN}`,
  expectedOutput: `[0, 1, 1, 2, 3, -1]
[[0], [1, 2], [3], [4]]
[3, 6, 2, 7, 5, 1, 4]`,
  solutionCode: `import java.util.*;

class Solution {
    private List<List<Integer>> buildGraph(int n, int[][] edges) {
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        for (int[] e : edges) {
            graph.get(e[0]).add(e[1]);
            graph.get(e[1]).add(e[0]);
        }
        return graph;
    }

    public int[] distances(int n, int[][] edges, int start) {
        List<List<Integer>> graph = buildGraph(n, edges);
        int[] dist = new int[n];
        Arrays.fill(dist, -1);
        Queue<Integer> queue = new ArrayDeque<>();
        dist[start] = 0;
        queue.offer(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            for (int next : graph.get(node)) {
                if (dist[next] == -1) {
                    dist[next] = dist[node] + 1;
                    queue.offer(next);
                }
            }
        }
        return dist;
    }

    public List<List<Integer>> levels(int n, int[][] edges, int start) {
        List<List<Integer>> graph = buildGraph(n, edges);
        boolean[] seen = new boolean[n];
        Queue<Integer> queue = new ArrayDeque<>();
        List<List<Integer>> result = new ArrayList<>();
        seen[start] = true;
        queue.offer(start);
        while (!queue.isEmpty()) {
            List<Integer> level = new ArrayList<>();
            for (int size = queue.size(); size > 0; size--) {
                int node = queue.poll();
                level.add(node);
                for (int next : graph.get(node)) {
                    if (!seen[next]) {
                        seen[next] = true;
                        queue.offer(next);
                    }
                }
            }
            Collections.sort(level);
            result.add(level);
        }
        return result;
    }

    public List<Integer> eliminationOrder(int n, int k) {
        Queue<Integer> circle = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) circle.offer(i);
        List<Integer> order = new ArrayList<>();
        while (!circle.isEmpty()) {
            for (int i = 1; i < k; i++) circle.offer(circle.poll());
            order.add(circle.poll());
        }
        return order;
    }
}
${MAIN}`,
  solutionExplanation:
    'BFS dequeues nodes in order of distance, so the first time it reaches a node sets that node’s shortest distance; setting `dist` or `seen` on enqueue keeps every node in the queue at most once. The level loop captures `queue.size()` before polling, so each pass handles exactly one distance. In `eliminationOrder`, rotating `k - 1` people from head to tail brings the `k`-th person to the head.',
  testCases: [
    {
      name: 'distances along a branching graph',
      call: 'distances(6, [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5]], 0)',
      code: `int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}, {3, 4}, {4, 5}};
t.equal(new Solution().distances(6, edges, 0), new int[]{0, 1, 1, 2, 3, 4});`,
    },
    {
      name: 'distances with unreachable nodes and another start',
      call: 'distances(5, [[1,2],[2,3]], 2)',
      code: `Solution s = new Solution();
t.equal(s.distances(5, new int[][]{{1, 2}, {2, 3}}, 2), new int[]{-1, 1, 0, 1, -1}, "Nodes BFS never reaches stay at -1.");
t.equal(s.distances(1, new int[][]{}, 0), new int[]{0});`,
    },
    {
      name: 'distances in a graph with cycles',
      call: 'distances(5, [[0,1],[1,2],[2,0],[2,3],[3,4],[4,2]], 0)',
      code: `int[][] edges = {{0, 1}, {1, 2}, {2, 0}, {2, 3}, {3, 4}, {4, 2}};
t.equal(new Solution().distances(5, edges, 0), new int[]{0, 1, 1, 2, 2});`,
    },
    {
      name: 'levels lists each node once',
      call: 'levels(4, [[0,1],[0,2],[1,3],[2,3]], 0)',
      code: `int[][] edges = {{0, 1}, {0, 2}, {1, 3}, {2, 3}};
t.equal(new Solution().levels(4, edges, 0), List.of(List.of(0), List.of(1, 2), List.of(3)),
    "Node 3 is a neighbor of both 1 and 2. Mark nodes as seen when you enqueue them, so it is queued once.");`,
    },
    {
      name: 'levels sorted, from a middle start',
      call: 'levels(7, [[3,6],[3,1],[3,4],[1,0],[6,5],[4,5]], 3)',
      code: `int[][] edges = {{3, 6}, {3, 1}, {3, 4}, {1, 0}, {6, 5}, {4, 5}};
t.equal(new Solution().levels(7, edges, 3), List.of(List.of(3), List.of(1, 4, 6), List.of(0, 5)));`,
    },
    {
      name: 'levels with an isolated start',
      call: 'levels(3, [[1,2]], 0)',
      code: `t.equal(new Solution().levels(3, new int[][]{{1, 2}}, 0), List.of(List.of(0)));`,
    },
    {
      name: 'eliminationOrder',
      call: 'eliminationOrder(7, 3), eliminationOrder(5, 1), eliminationOrder(1, 4), eliminationOrder(0, 2)',
      code: `Solution s = new Solution();
t.equal(s.eliminationOrder(7, 3), List.of(3, 6, 2, 7, 5, 1, 4));
t.equal(s.eliminationOrder(5, 1), List.of(1, 2, 3, 4, 5));
t.equal(s.eliminationOrder(1, 4), List.of(1));
t.equal(s.eliminationOrder(0, 2), List.of());`,
    },
  ],
};
