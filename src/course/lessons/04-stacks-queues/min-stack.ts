import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        MinStack stack = new MinStack();
        stack.push(5);
        stack.push(3);
        stack.push(7);
        System.out.println(stack.top() + " " + stack.getMin());
        stack.pop();
        stack.pop();
        System.out.println(stack.top() + " " + stack.getMin());
        stack.push(-2);
        System.out.println(stack.top() + " " + stack.getMin());
    }
}
`;

export const minStack: LessonData = {
  id: 'min-stack',
  title: 'Min Stack',
  summary: 'Design a stack that returns its minimum in O(1) by storing the running minimum next to each value.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A classic design question: build a stack with `push`, `pop`, `top` and `getMin`, all in O(1). Scanning the stack for the minimum is O(n), and keeping a single `min` field breaks as soon as you pop the minimum: you don’t know what the next one is.',
    },
    {
      type: 'paragraph',
      text: 'The fix uses the one thing a stack guarantees: only the top changes. The minimum of everything **below** an element never changes while that element is on the stack. So each entry can record the minimum at the moment it was pushed.',
    },
    {
      type: 'code',
      code: `// push 5, push 3, push 7: each entry is {value, minimum so far}
// top    {7, 3}
//        {3, 3}
// bottom {5, 5}
// getMin() reads the top's minimum: 3
// pop() twice leaves {5, 5}: getMin() is 5 again`,
    },
    {
      type: 'heading',
      text: 'Writing the class',
    },
    {
      type: 'code',
      code: `class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>();

    public void push(int val) {
        // ...
    }
}`,
    },
    {
      type: 'list',
      items: [
        'Initialize fields where you declare them; you don’t need a constructor.',
        'Make the fields instance fields. A `static` field would be shared by every `MinStack`, and two stacks would corrupt each other.',
        'A `Deque<int[]>` stores a pair per entry without a helper class. A `record Entry(int value, int min)` reads better if the interviewer prefers it.',
      ],
    },
    {
      type: 'heading',
      text: 'The two-stack variant',
    },
    {
      type: 'paragraph',
      text: 'A second stack holds only the minimums. Push onto it when the new value is `<=` its top, and pop it when the popped value equals its top. The `<=` matters: with `<`, pushing the minimum twice and popping it once loses it.',
    },
    {
      type: 'note',
      title: 'The `Integer` trap',
      text: 'With two `Deque<Integer>`s, `if (stack.pop() == mins.peek())` compares two `Integer` references. Java caches boxes only for `-128` to `127`, so the check passes on small test values and silently fails on `300`. Unbox first: `int value = stack.pop(); if (value == mins.peek()) mins.pop();`.',
    },
    {
      type: 'note',
      title: 'Cost',
      text: 'Every operation is O(1). The pair version stores two `int`s per element; the two-stack version stores fewer when the minimum rarely changes, but both are O(n) extra space in the worst case.',
    },
  ],
  challenge: {
    intro: 'Complete `class MinStack`. Every method must run in O(1):',
    methods: [
      { signature: 'void push(int val)', description: 'Pushes `val` onto the stack.' },
      { signature: 'void pop()', description: 'Removes the top element.' },
      { signature: 'int top()', description: 'Returns the top element without removing it.' },
      { signature: 'int getMin()', description: 'Returns the smallest element currently on the stack.' },
    ],
    notes: [
      '`pop`, `top` and `getMin` are only called on a non-empty stack.',
      'Values can be any `int`, including `Integer.MIN_VALUE` and `Integer.MAX_VALUE`.',
    ],
  },
  complexity: {
    time: 'O(1) for every operation.',
    space: 'O(n) for n elements on the stack.',
  },
  hints: [
    'Store a pair `{val, min}` per entry, where `min` is the smallest value at or below that entry.',
    'On `push`, the new minimum is `val` if the stack is empty, otherwise `Math.min(val, stack.peek()[1])`.',
    '`top()` returns `stack.peek()[0]`, `getMin()` returns `stack.peek()[1]`, and `pop()` is `stack.pop()`.',
    'Interview tip: before coding, state the invariant ("each entry knows the minimum of the entries below it") and walk through a pop of the current minimum.',
  ],
  starterCode: `import java.util.*;

class MinStack {
    public void push(int val) {
        // your code here
    }

    public void pop() {
        // your code here
    }

    public int top() {
        // your code here
        return 0;
    }

    public int getMin() {
        // your code here
        return 0;
    }
}
${MAIN}`,
  expectedOutput: `7 3
5 5
-2 -2`,
  solutionCode: `import java.util.*;

class MinStack {
    private final Deque<int[]> stack = new ArrayDeque<>();

    public void push(int val) {
        int min = stack.isEmpty() ? val : Math.min(val, stack.peek()[1]);
        stack.push(new int[]{val, min});
    }

    public void pop() {
        stack.pop();
    }

    public int top() {
        return stack.peek()[0];
    }

    public int getMin() {
        return stack.peek()[1];
    }
}
${MAIN}`,
  solutionExplanation:
    'Each entry stores its value together with the minimum of itself and everything below it. Popping removes an entry and its minimum together, so the entry underneath already holds the correct minimum for the smaller stack.',
  testCases: [
    {
      name: 'top and getMin after pushes',
      call: 'push(5), push(3), push(7), top(), getMin()',
      code: `MinStack s = new MinStack();
s.push(5);
s.push(3);
s.push(7);
t.equal(s.top(), 7);
t.equal(s.getMin(), 3);`,
    },
    {
      name: 'pop restores the previous minimum',
      call: 'push(4), push(2), push(1), pop(), getMin(), pop(), getMin()',
      code: `MinStack s = new MinStack();
s.push(4);
s.push(2);
s.push(1);
s.pop();
t.equal(s.getMin(), 2, "After popping the minimum, getMin() returns the minimum of what is left.");
t.equal(s.top(), 2);
s.pop();
t.equal(s.getMin(), 4);
t.equal(s.top(), 4);`,
    },
    {
      name: 'duplicate minimums',
      call: 'push(2), push(1), push(1), pop(), getMin()',
      code: `MinStack s = new MinStack();
s.push(2);
s.push(1);
s.push(1);
s.pop();
t.equal(s.getMin(), 1, "The minimum 1 was pushed twice; one pop must leave the other.");
s.pop();
t.equal(s.getMin(), 2);`,
    },
    {
      name: 'values outside the Integer cache',
      call: 'push(500), push(300), pop(), getMin()',
      code: `MinStack s = new MinStack();
s.push(500);
s.push(300);
t.equal(s.getMin(), 300);
s.pop();
t.equal(s.getMin(), 500, "Compare unboxed ints: == on two Integer objects above 127 compares references.");
s.push(1000);
s.push(1000);
s.pop();
t.equal(s.getMin(), 500);`,
    },
    {
      name: 'negatives and int extremes',
      call: 'push(Integer.MAX_VALUE), push(-1), push(Integer.MIN_VALUE), ...',
      code: `MinStack s = new MinStack();
s.push(Integer.MAX_VALUE);
t.equal(s.getMin(), Integer.MAX_VALUE);
s.push(-1);
s.push(Integer.MIN_VALUE);
t.equal(s.getMin(), Integer.MIN_VALUE);
s.pop();
t.equal(s.getMin(), -1);
t.equal(s.top(), -1);`,
    },
    {
      name: 'two stacks don’t share state',
      call: 'a.push(1), b.push(10), b.getMin()',
      code: `MinStack a = new MinStack();
MinStack b = new MinStack();
a.push(1);
b.push(10);
t.equal(b.getMin(), 10, "Each MinStack needs its own fields; a static field is shared by every instance.");
t.equal(b.top(), 10);
t.equal(a.top(), 1);`,
    },
    {
      name: 'long sequence matches a brute-force minimum',
      call: '200 mixed pushes and pops',
      code: `MinStack s = new MinStack();
List<Integer> model = new ArrayList<>();
long seed = 42;
boolean ok = true;
for (int step = 0; step < 200 && ok; step++) {
    seed = (seed * 1103515245 + 12345) % 2147483648L;
    int value = (int) (seed % 2001) - 1000;
    if (model.isEmpty() || seed % 3 != 0) {
        s.push(value);
        model.add(value);
    } else {
        s.pop();
        model.remove(model.size() - 1);
    }
    if (!model.isEmpty()) {
        ok = s.top() == model.get(model.size() - 1) && s.getMin() == Collections.min(model);
    }
}
t.check(ok, "top() or getMin() disagreed with a brute-force check during a sequence of pushes and pops.");`,
    },
  ],
};
