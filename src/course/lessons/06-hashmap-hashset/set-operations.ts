import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        Set<Integer> a = Set.of(1, 2, 3, 4);
        Set<Integer> b = Set.of(3, 4, 5);

        System.out.println(new TreeSet<>(solution.union(a, b)));
        System.out.println(new TreeSet<>(solution.intersection(a, b)));
        System.out.println(new TreeSet<>(solution.difference(a, b)));
        System.out.println(solution.isSubset(Set.of(3, 4), a));
    }
}
`;

export const setOperations: LessonData = {
  id: 'set-operations',
  title: 'Set Operations',
  summary:
    'Union, intersection, difference, and subset tests with addAll, retainAll, removeAll, and containsAll, without clobbering the inputs.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Java has no `union` or `intersect` method that returns a new set. The bulk methods on `Collection` change the set you call them on, and return a `boolean` that says whether it changed:',
    },
    {
      type: 'list',
      items: [
        '`a.addAll(b)`: union. Adds every element of `b` to `a`.',
        '`a.retainAll(b)`: intersection. Keeps only the elements of `a` that are also in `b`.',
        '`a.removeAll(b)`: difference. Removes from `a` every element that is in `b`.',
        '`a.containsAll(b)`: subset test. `true` when every element of `b` is in `a`. Changes nothing.',
      ],
    },
    {
      type: 'heading',
      text: 'Copy first',
    },
    {
      type: 'code',
      code: `Set<Integer> a = new HashSet<>(Set.of(1, 2, 3));
Set<Integer> b = Set.of(2, 3, 4);

Set<Integer> common = a;      // not a copy: both names point to one set
common.retainAll(b);          // a is now {2, 3} as well

Set<Integer> both = new HashSet<>(a); // a real copy
both.retainAll(b);                    // a is untouched`,
      caption:
        'Assigning a set copies the reference, not the elements. Build a new `HashSet` from one input, then apply the operation to the copy.',
    },
    {
      type: 'paragraph',
      text: 'Calling a bulk method on an immutable set (`Set.of`, `Set.copyOf`, `Collections.unmodifiableSet`) throws `UnsupportedOperationException`, even if nothing would change. Inputs you didn’t create may be immutable, which is one more reason to copy.',
    },
    {
      type: 'note',
      title: 'Cost',
      text: 'On a `HashSet`, `addAll(b)` and `containsAll(b)` cost O(|b|). `retainAll(b)` checks every element of the receiver with `b.contains`, so it costs O(|a|) when `b` is a hash set, but O(|a| · |b|) when `b` is a `List`. Convert a list to a `HashSet` before using it as the argument.',
    },
    {
      type: 'note',
      title: 'Set.copyOf',
      text: '`Set.copyOf(c)` returns an immutable copy, which is handy for returning a snapshot. It is not a starting point for `retainAll`; use `new HashSet<>(c)` when you need to keep modifying it.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. None of them may modify `a` or `b`, which may be immutable:',
    methods: [
      {
        signature: 'Set<Integer> union(Set<Integer> a, Set<Integer> b)',
        description: 'Returns a new set with every element that is in `a` or `b`.',
      },
      {
        signature: 'Set<Integer> intersection(Set<Integer> a, Set<Integer> b)',
        description: 'Returns a new set with the elements that are in both `a` and `b`.',
      },
      {
        signature: 'Set<Integer> difference(Set<Integer> a, Set<Integer> b)',
        description: 'Returns a new set with the elements of `a` that are not in `b`.',
      },
      {
        signature: 'boolean isSubset(Set<Integer> a, Set<Integer> b)',
        description: 'Returns `true` when every element of `a` is also in `b`.',
      },
    ],
  },
  complexity: {
    time: 'O(|a| + |b|) for `union`; O(|a|) for `intersection`, `difference`, and `isSubset`, with hash-set arguments.',
    space: 'O(|a| + |b|) for the new set.',
  },
  hints: [
    'Start each of the first three methods with `Set<Integer> result = new HashSet<>(a);`.',
    'Then call `addAll`, `retainAll`, or `removeAll` on `result`, passing `b`, and return `result`.',
    'Mind the direction in `isSubset`: `a` is a subset of `b` when `b.containsAll(a)`.',
    'Interview tip: when you return a set built from the inputs, say whether you copied; mutating a caller’s collection is a classic bug.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public Set<Integer> union(Set<Integer> a, Set<Integer> b) {
        // your code here
        return a;
    }

    public Set<Integer> intersection(Set<Integer> a, Set<Integer> b) {
        // your code here
        return a;
    }

    public Set<Integer> difference(Set<Integer> a, Set<Integer> b) {
        // your code here
        return a;
    }

    public boolean isSubset(Set<Integer> a, Set<Integer> b) {
        // your code here
        return false;
    }
}
${MAIN}`,
  expectedOutput: `[1, 2, 3, 4, 5]
[3, 4]
[1, 2]
true`,
  solutionCode: `import java.util.*;

class Solution {
    public Set<Integer> union(Set<Integer> a, Set<Integer> b) {
        Set<Integer> result = new HashSet<>(a);
        result.addAll(b);
        return result;
    }

    public Set<Integer> intersection(Set<Integer> a, Set<Integer> b) {
        Set<Integer> result = new HashSet<>(a);
        result.retainAll(b);
        return result;
    }

    public Set<Integer> difference(Set<Integer> a, Set<Integer> b) {
        Set<Integer> result = new HashSet<>(a);
        result.removeAll(b);
        return result;
    }

    public boolean isSubset(Set<Integer> a, Set<Integer> b) {
        return b.containsAll(a);
    }
}
${MAIN}`,
  solutionExplanation:
    'Each operation copies `a` into a new `HashSet` and runs the matching bulk method on the copy, so the inputs stay unchanged and immutable inputs don’t throw. `isSubset` asks `b` whether it contains all of `a`.',
  testCases: [
    {
      name: 'union',
      call: 'union({1, 2, 3}, {3, 4, -5})',
      code: `t.equal(new Solution().union(Set.of(1, 2, 3), Set.of(3, 4, -5)), Set.of(1, 2, 3, 4, -5));`,
    },
    {
      name: 'intersection',
      call: 'intersection({1, 2, 3, 4}, {3, 4, 5})',
      code: `t.equal(new Solution().intersection(Set.of(1, 2, 3, 4), Set.of(3, 4, 5)), Set.of(3, 4));`,
    },
    {
      name: 'difference',
      call: 'difference({1, 2, 3, 4}, {3, 4, 5})',
      code: `t.equal(new Solution().difference(Set.of(1, 2, 3, 4), Set.of(3, 4, 5)), Set.of(1, 2));`,
    },
    {
      name: 'operations leave the inputs unchanged',
      call: 'union(a, b), intersection(a, b), difference(a, b) with mutable a = {1, 2, 3}, b = {2, 3, 4}',
      code: `Solution s = new Solution();
Set<Integer> a = new HashSet<>(Set.of(1, 2, 3));
Set<Integer> b = new HashSet<>(Set.of(2, 3, 4));
t.equal(s.intersection(a, b), Set.of(2, 3));
t.equal(s.difference(a, b), Set.of(1));
t.equal(s.union(a, b), Set.of(1, 2, 3, 4));
t.check(a.equals(Set.of(1, 2, 3)) && b.equals(Set.of(2, 3, 4)), "a and b must not change. Copy a into a new HashSet before calling retainAll, removeAll, or addAll.");`,
    },
    {
      name: 'empty and disjoint sets',
      call: 'intersection({1, 2}, {3}), union({}, {}), difference({}, {1})',
      code: `Solution s = new Solution();
t.equal(s.intersection(Set.of(1, 2), Set.of(3)), Set.of());
t.equal(s.union(Set.of(), Set.of()), Set.of());
t.equal(s.difference(Set.of(), Set.of(1)), Set.of());`,
    },
    {
      name: 'isSubset checks the right direction',
      call: 'isSubset({3, 4}, {1, 2, 3, 4}), isSubset({1, 2, 3, 4}, {3, 4})',
      code: `Solution s = new Solution();
t.equal(s.isSubset(Set.of(3, 4), Set.of(1, 2, 3, 4)), true);
t.equal(s.isSubset(Set.of(1, 2, 3, 4), Set.of(3, 4)), false, "a is a subset of b when b contains all of a.");`,
    },
    {
      name: 'isSubset with empty and equal sets',
      call: 'isSubset({}, {1}), isSubset({2, 5}, {5, 2}), isSubset({0}, {})',
      code: `Solution s = new Solution();
t.equal(s.isSubset(Set.of(), Set.of(1)), true);
t.equal(s.isSubset(Set.of(2, 5), Set.of(5, 2)), true);
t.equal(s.isSubset(Set.of(0), Set.of()), false);`,
    },
  ],
};
