import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.squaresOfEvens(List.of(1, 2, 3, 4, -6)));
        System.out.println(solution.joinUpper(List.of("red", "Green", "blue")));
        System.out.println(solution.sumOfRange(1, 100));
        System.out.println(solution.maxOrDefault(List.of(3, -8, 12, 5), 0));
        System.out.println(solution.maxOrDefault(List.of(), -1));
    }
}
`;

export const streams: LessonData = {
  id: 'streams',
  title: 'Streams',
  summary:
    'Stream pipelines for lists and arrays: filter, map, toList, IntStream ranges and sums, joining, Optional results, and when a loop is better.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A stream is a one-pass pipeline over a source. Intermediate operations (`filter`, `map`, `sorted`) are lazy; nothing runs until a terminal operation (`toList`, `sum`, `count`, `collect`, `max`) pulls the elements through.',
    },
    {
      type: 'code',
      code: `List<Integer> nums = List.of(4, 7, 2, 9, 6);
List<Integer> big = nums.stream()
    .filter(n -> n > 3)  // 4, 7, 9, 6
    .map(n -> n * 10)    // 40, 70, 90, 60
    .toList();           // [40, 70, 90, 60]
int total = nums.stream().mapToInt(Integer::intValue).sum(); // 28`,
    },
    {
      type: 'heading',
      text: 'Primitive streams',
    },
    {
      type: 'paragraph',
      text: '`Stream<Integer>` holds boxed values and has no `sum`. `IntStream` holds `int`s and has `sum`, `average`, `min` and `max`. `mapToInt` goes from objects to an `IntStream`, `boxed()` goes back, and `Arrays.stream(int[])` starts as an `IntStream`.',
    },
    {
      type: 'code',
      code: `IntStream.range(0, 4).boxed().toList();           // [0, 1, 2, 3]   end exclusive
IntStream.rangeClosed(1, 4).sum();                // 10             end inclusive
IntStream.range(0, 3).map(i -> i * i).toArray();  // [0, 1, 4]

List<String> letters = List.of("a", "b", "c");
letters.stream().collect(Collectors.joining(", "));            // "a, b, c"
letters.stream().collect(Collectors.joining(", ", "[", "]"));  // "[a, b, c]"`,
    },
    {
      type: 'heading',
      text: '`max` and `min` return an Optional',
    },
    {
      type: 'code',
      code: `Optional<Integer> best = nums.stream().max(Integer::compare); // Optional[9]
int top = best.orElse(-1);                                     // 9
int low = nums.stream().mapToInt(Integer::intValue).min().getAsInt(); // 2
OptionalInt none = IntStream.empty().max();                    // OptionalInt.empty
none.orElse(0);                                                // 0`,
    },
    {
      type: 'paragraph',
      text: 'An empty stream has no maximum, so the result is wrapped. `Stream.max` needs a comparator (`Integer::compare` or `Comparator.naturalOrder()`) and returns `Optional<T>`; `IntStream.max()` takes none and returns `OptionalInt`. `get()` or `getAsInt()` on an empty one throws `NoSuchElementException`; `orElse(fallback)` doesn’t.',
    },
    {
      type: 'note',
      title: 'Streams are single use',
      text: 'Calling a second terminal operation on the same stream throws `IllegalStateException`. Store the source and call `.stream()` again. Also: `IntStream.sum()` returns an `int` and overflows silently; use `mapToLong(...)` or `.asLongStream().sum()` for large totals.',
    },
    {
      type: 'note',
      title: 'Stream or loop?',
      text: 'Streams read well for filter-map-collect. Prefer a loop when you need an early exit with state, neighbouring indices, or to update local variables (a lambda can only read effectively final ones). A stream also has setup cost, and a `Stream<Integer>` boxes every element, so in a hot inner loop a plain `for` is faster. In an interview, a clear loop is never wrong.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`, each with a stream:',
    methods: [
      {
        signature: 'List<Integer> squaresOfEvens(List<Integer> nums)',
        description: 'The squares of the even numbers, in their original order.',
      },
      {
        signature: 'String joinUpper(List<String> words)',
        description: 'The words in uppercase, joined with `", "`. An empty list gives `""`.',
      },
      {
        signature: 'int sumOfRange(int from, int to)',
        description: 'The sum of every integer from `from` to `to`, both included. If `from > to`, the sum is `0`.',
      },
      {
        signature: 'int maxOrDefault(List<Integer> nums, int fallback)',
        description: 'The largest number, or `fallback` if the list is empty.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method: one pass over the elements or the range.',
    space: 'O(n) for the result list or string; O(1) for the sum and the maximum.',
  },
  hints: [
    '`filter(n -> n % 2 == 0)` then `map(n -> n * n)` then `toList()`.',
    '`map(String::toUpperCase)` then `collect(Collectors.joining(", "))`.',
    '`IntStream.rangeClosed(from, to)` includes both ends and is already empty when `from > to`.',
    '`mapToInt(Integer::intValue).max()` gives an `OptionalInt`; finish with `orElse(fallback)`.',
  ],
  starterCode: `import java.util.*;
import java.util.stream.*;

class Solution {
    public List<Integer> squaresOfEvens(List<Integer> nums) {
        // your code here
        return List.of();
    }

    public String joinUpper(List<String> words) {
        // your code here
        return "";
    }

    public int sumOfRange(int from, int to) {
        // your code here
        return 0;
    }

    public int maxOrDefault(List<Integer> nums, int fallback) {
        // your code here
        return fallback;
    }
}
${MAIN}`,
  expectedOutput: `[4, 16, 36]
RED, GREEN, BLUE
5050
12
-1`,
  solutionCode: `import java.util.*;
import java.util.stream.*;

class Solution {
    public List<Integer> squaresOfEvens(List<Integer> nums) {
        return nums.stream().filter(n -> n % 2 == 0).map(n -> n * n).toList();
    }

    public String joinUpper(List<String> words) {
        return words.stream().map(String::toUpperCase).collect(Collectors.joining(", "));
    }

    public int sumOfRange(int from, int to) {
        return IntStream.rangeClosed(from, to).sum();
    }

    public int maxOrDefault(List<Integer> nums, int fallback) {
        return nums.stream().mapToInt(Integer::intValue).max().orElse(fallback);
    }
}
${MAIN}`,
  solutionExplanation:
    'Each method is one pipeline: `filter` then `map` then `toList`; `map` then `joining`; `rangeClosed` then `sum`, which is empty and sums to `0` when `from > to`; and `max` on an `IntStream`, whose `OptionalInt` falls back only when the list is empty.',
  testCases: [
    {
      name: 'squaresOfEvens with negatives and zero',
      call: 'squaresOfEvens([-4, 3, 0, -3, 2])',
      code: `t.equal(new Solution().squaresOfEvens(List.of(-4, 3, 0, -3, 2)), List.of(16, 0, 4));`,
    },
    {
      name: 'squaresOfEvens with no evens',
      call: 'squaresOfEvens([1, 3]), squaresOfEvens([])',
      code: `Solution s = new Solution();
t.equal(s.squaresOfEvens(List.of(1, 3)), List.of());
t.equal(s.squaresOfEvens(List.of()), List.of());`,
    },
    {
      name: 'joinUpper',
      call: 'joinUpper([a, Bb, ccC]), joinUpper([solo]), joinUpper([])',
      code: `Solution s = new Solution();
t.equal(s.joinUpper(List.of("a", "Bb", "ccC")), "A, BB, CCC");
t.equal(s.joinUpper(List.of("solo")), "SOLO", "A single word has no separator.");
t.equal(s.joinUpper(List.of()), "");`,
    },
    {
      name: 'sumOfRange includes both ends',
      call: 'sumOfRange(-5, 2), sumOfRange(4, 4)',
      code: `Solution s = new Solution();
t.equal(s.sumOfRange(-5, 2), -12, "Both from and to are included.");
t.equal(s.sumOfRange(4, 4), 4);`,
    },
    {
      name: 'sumOfRange with from > to',
      call: 'sumOfRange(3, 1)',
      code: `t.equal(new Solution().sumOfRange(3, 1), 0);
t.equal(new Solution().sumOfRange(1, 3), 6);`,
    },
    {
      name: 'maxOrDefault with all negatives',
      call: 'maxOrDefault([-9, -2, -5], 0)',
      code: `t.equal(new Solution().maxOrDefault(List.of(-9, -2, -5), 0), -2,
    "The fallback is only for an empty list. Use Optional.orElse, not a max that starts at the fallback.");`,
    },
    {
      name: 'maxOrDefault with duplicates and an empty list',
      call: 'maxOrDefault([7, 7, 1], -1), maxOrDefault([], 42)',
      code: `Solution s = new Solution();
t.equal(s.maxOrDefault(List.of(7, 7, 1), -1), 7);
t.equal(s.maxOrDefault(List.of(), 42), 42);`,
    },
  ],
};
