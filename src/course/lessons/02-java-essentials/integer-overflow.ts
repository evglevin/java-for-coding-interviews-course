import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.sum(new int[]{2_000_000_000, 2_000_000_000, 1}));
        System.out.println(solution.product(100_000, 100_000));
        System.out.println(solution.midpoint(2_000_000_000, 2_100_000_000) + " " + solution.midpoint(-7, -2));
        System.out.println(solution.wrap(-1, 5) + " " + solution.wrap(7, 5));
    }
}
`;

export const integerOverflow: LessonData = {
  id: 'integer-overflow',
  title: 'Integer Overflow and Division',
  summary: 'Spot silent int overflow, widen to long before it happens, and handle truncating division and negative remainders.',
  blocks: [
    {
      type: 'paragraph',
      text: 'An `int` is 32 bits, from `Integer.MIN_VALUE` (-2,147,483,648) to `Integer.MAX_VALUE` (2,147,483,647), roughly ±2.1 × 10⁹. A `long` is 64 bits, roughly ±9.2 × 10¹⁸. Arithmetic that goes past the range does not throw: it **wraps around** silently.',
    },
    {
      type: 'code',
      code: `int big = Integer.MAX_VALUE;
System.out.println(big + 1);          // -2147483648
System.out.println(100_000 * 100_000); // 1410065408

long wrong = 100_000 * 100_000;       // still 1410065408: int math, then widened
long right = 1L * 100_000 * 100_000;  // 10000000000
long sum = 0;
for (int x : new int[]{big, big}) sum += x;   // 4294967294: sum is a long`,
    },
    {
      type: 'paragraph',
      text: 'The type of an expression comes from its operands, not from the variable it is assigned to. `long r = a * b` multiplies two `int`s, overflows, and only then widens. Make one operand a `long` first: `1L * a * b` or `(long) a * b`. Sums of many `int`s, products, and squares of coordinates are the usual suspects; check the constraints (values up to 10⁹, n up to 10⁵) and do the multiplication in your head.',
    },
    {
      type: 'list',
      items: [
        '`Math.addExact(a, b)`, `multiplyExact` and `toIntExact` throw `ArithmeticException` instead of wrapping, which is useful when overflow should be impossible.',
        '`Math.abs(Integer.MIN_VALUE)` is still `Integer.MIN_VALUE`, a negative number: its positive value does not fit. `-Integer.MIN_VALUE` has the same problem.',
        '`(a, b) -> a - b` as a comparator overflows for far-apart values. Use `Integer.compare(a, b)` (see the Custom Comparator lesson).',
        "`Integer.MAX_VALUE` is the usual starting value for a running minimum, and `Integer.MIN_VALUE` for a maximum. Don't add to them: `best + 1` wraps.",
      ],
    },
    {
      type: 'note',
      title: 'Binary search midpoint',
      text: '`(lo + hi) / 2` overflows when `lo + hi` passes `Integer.MAX_VALUE`, which happens on large arrays and on searches over a value range. `lo + (hi - lo) / 2` never does when `lo <= hi`. You will also see `(lo + hi) >>> 1`, which treats the sum as unsigned and is correct only when both are non-negative.',
    },
    {
      type: 'heading',
      text: 'Division and remainder',
    },
    {
      type: 'paragraph',
      text: 'Integer division **truncates toward zero**: `7 / 2` is `3` and `-7 / 2` is `-3`, not `-4`. The remainder takes the sign of the dividend, so `-7 % 3` is `-1`. That breaks the common `index % size` wrap-around for negative indices. `Math.floorDiv` and `Math.floorMod` round toward negative infinity instead, and `floorMod(x, n)` is always in `0..n-1` for positive `n`.',
    },
    {
      type: 'code',
      code: `System.out.println(-7 / 2);                 // -3
System.out.println(Math.floorDiv(-7, 2));   // -4
System.out.println(-7 % 3);                 // -1
System.out.println(Math.floorMod(-7, 3));   // 2
System.out.println(7 / 2.0);                // 3.5: one double operand makes it floating-point`,
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one must give the right answer for inputs anywhere in the `int` range:',
    methods: [
      {
        signature: 'long sum(int[] nums)',
        description: 'Returns the sum of the numbers.',
      },
      {
        signature: 'long product(int a, int b)',
        description: 'Returns `a * b`.',
      },
      {
        signature: 'int midpoint(int lo, int hi)',
        description:
          'Given `lo <= hi`, returns the middle of the range rounded down (toward negative infinity): `midpoint(2, 5)` is `3` and `midpoint(-7, -2)` is `-5`.',
      },
      {
        signature: 'int wrap(int index, int size)',
        description:
          'Wraps any index, including negative ones, into `0..size-1` as in a circular array: `wrap(-1, 5)` is `4`. `size` is positive.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for `sum`; O(1) for the others.',
    space: 'O(1).',
  },
  hints: [
    'Declare the accumulator in `sum` as a `long`; `sum += x` then adds in 64 bits.',
    'In `product`, `a * b` overflows before the `return` widens it. Write `(long) a * b`.',
    'In `midpoint`, `lo + (hi - lo) / 2` avoids overflow, and since `hi - lo` is never negative, its division rounds down. `hi - lo` itself can overflow when `lo` is very negative, so compute it as a `long` and cast the result back.',
    '`Math.floorMod(index, size)` does what `wrap` needs; `index % size` is negative for negative indices.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public long sum(int[] nums) {
        // your code here
        return 0;
    }

    public long product(int a, int b) {
        // your code here
        return 0;
    }

    public int midpoint(int lo, int hi) {
        // your code here
        return 0;
    }

    public int wrap(int index, int size) {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `4000000001
10000000000
2050000000 -5
4 2`,
  solutionCode: `import java.util.*;

class Solution {
    public long sum(int[] nums) {
        long total = 0;
        for (int x : nums) total += x;
        return total;
    }

    public long product(int a, int b) {
        return (long) a * b;
    }

    public int midpoint(int lo, int hi) {
        return (int) (lo + ((long) hi - lo) / 2);
    }

    public int wrap(int index, int size) {
        return Math.floorMod(index, size);
    }
}
${MAIN}`,
  solutionExplanation:
    'Every risky operation is done in `long`: the running sum, the product (by casting one operand first), and the width of the range in `midpoint`, whose half always fits back into an `int`. `Math.floorMod` rounds toward negative infinity, so negative indices wrap to the end of the range.',
  testCases: [
    {
      name: 'sum past the int range',
      call: 'sum(new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE, 2})',
      code: `t.equal(new Solution().sum(new int[]{Integer.MAX_VALUE, Integer.MAX_VALUE, 2}), 4294967296L,
    "An int accumulator wraps around; use a long.");`,
    },
    {
      name: 'sum with negatives and empty',
      call: 'sum(new int[]{Integer.MIN_VALUE, -1, 5}), sum(new int[]{})',
      code: `Solution s = new Solution();
t.equal(s.sum(new int[]{Integer.MIN_VALUE, -1, 5}), -2147483644L);
t.equal(s.sum(new int[]{}), 0L);`,
    },
    {
      name: 'product widens before multiplying',
      call: 'product(100000, 100000), product(-3, 7)',
      code: `Solution s = new Solution();
t.equal(s.product(100_000, 100_000), 10_000_000_000L, "a * b overflows before return widens it; cast one side to long.");
t.equal(s.product(-3, 7), -21L);`,
    },
    {
      name: 'product of extremes',
      call: 'product(Integer.MIN_VALUE, Integer.MIN_VALUE)',
      code: `t.equal(new Solution().product(Integer.MIN_VALUE, Integer.MIN_VALUE), 4611686018427387904L);`,
    },
    {
      name: 'midpoint of large values',
      call: 'midpoint(2000000000, 2100000000), midpoint(2, 5), midpoint(4, 4)',
      code: `Solution s = new Solution();
t.equal(s.midpoint(2_000_000_000, 2_100_000_000), 2_050_000_000, "(lo + hi) / 2 overflows here.");
t.equal(s.midpoint(2, 5), 3);
t.equal(s.midpoint(4, 4), 4);`,
    },
    {
      name: 'midpoint rounds down for negatives',
      call: 'midpoint(-7, -2), midpoint(Integer.MIN_VALUE, Integer.MAX_VALUE)',
      code: `Solution s = new Solution();
t.equal(s.midpoint(-7, -2), -5, "Division truncates toward zero, so (lo + hi) / 2 rounds -4.5 up to -4.");
t.equal(s.midpoint(Integer.MIN_VALUE, Integer.MAX_VALUE), -1);`,
    },
    {
      name: 'wrap negative and large indices',
      call: 'wrap(-1, 5), wrap(-12, 5), wrap(7, 5), wrap(0, 1)',
      code: `Solution s = new Solution();
t.equal(s.wrap(-1, 5), 4, "% keeps the sign of the dividend; Math.floorMod does not.");
t.equal(s.wrap(-12, 5), 3);
t.equal(s.wrap(7, 5), 2);
t.equal(s.wrap(0, 1), 0);`,
    },
  ],
};
