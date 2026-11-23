import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.isValid("{[()]}") + " " + solution.isValid("([)]"));
        System.out.println(solution.evalRPN(new String[]{"2", "1", "+", "3", "*"}));
        System.out.println(solution.evalRPN(new String[]{"4", "13", "5", "/", "+"}));
        System.out.println(solution.removeAdjacentDuplicates("abbaca"));
    }
}
`;

export const stacks: LessonData = {
  id: 'stacks',
  title: 'Stacks with ArrayDeque',
  summary: 'Use ArrayDeque through the Deque interface as a stack, and avoid the legacy java.util.Stack.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Java’s stack is an `ArrayDeque` declared as a `Deque`. `push` puts an element on top, `pop` removes and returns the top, `peek` reads it without removing it.',
    },
    {
      type: 'code',
      code: `Deque<Integer> stack = new ArrayDeque<>();
stack.push(1);
stack.push(2);
stack.push(3);
System.out.println(stack);         // [3, 2, 1]  (top first)
System.out.println(stack.peek());  // 3
System.out.println(stack.pop());   // 3
System.out.println(stack.size());  // 2
System.out.println(stack.isEmpty()); // false`,
    },
    {
      type: 'heading',
      text: 'Why not `java.util.Stack`',
    },
    {
      type: 'list',
      items: [
        '`Stack` is a legacy class from Java 1.0. It extends `Vector`, so every call takes a lock you never need in an interview.',
        'Because it is a `Vector`, it also exposes `get(i)`, `add(0, x)` and `remove(i)`, which break the stack abstraction.',
        'It iterates and prints **bottom to top** (`[1, 2, 3]`), while `ArrayDeque` iterates **top to bottom** (`[3, 2, 1]`). Code that loops over the stack gives opposite results.',
        'The `Stack` Javadoc itself recommends `Deque`. Interviewers notice which one you reach for.',
      ],
    },
    {
      type: 'heading',
      text: 'Empty stacks and null',
    },
    {
      type: 'code',
      code: `Deque<Integer> stack = new ArrayDeque<>();
stack.peek();             // null
stack.pop();              // throws NoSuchElementException
int top = stack.peek();   // throws NullPointerException (unboxing null)
stack.push(null);         // throws NullPointerException`,
    },
    {
      type: 'list',
      items: [
        '`pop` on an empty stack throws; `peek` returns `null`. Check `isEmpty()` before either one whenever the stack can run dry, such as when a closing bracket arrives first.',
        'Assigning that `null` to an `int` unboxes it and throws `NullPointerException`, so `peek` is not a free pass.',
        '`ArrayDeque` rejects `null` elements, because `peek` and `poll` use `null` to mean "empty".',
      ],
    },
    {
      type: 'note',
      title: 'Cost',
      text: '`push`, `pop` and `peek` are amortized O(1). `ArrayDeque` is a circular array that doubles when full, so it allocates far less than `LinkedList`, which creates a node per element. A `Deque<Integer>` still boxes each `int`; when the values are small ints and you know the maximum size, an `int[]` plus a `top` index is faster.',
    },
    {
      type: 'note',
      title: 'Comparing strings',
      text: 'Tokens like `"+"` are `String`s, so compare them with `equals` or a `switch`, never `==`. `==` compares references and only works by accident for string literals, not for strings produced by `split` or `substring`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`. Each one uses a `Deque` as a stack:',
    methods: [
      {
        signature: 'boolean isValid(String s)',
        description:
          'Returns `true` if the brackets `()[]{}` in `s` are balanced: every opener is closed by the matching closer, in the right order. The empty string is valid.',
      },
      {
        signature: 'int evalRPN(String[] tokens)',
        description:
          'Evaluates an expression in reverse Polish notation. Tokens are integers (possibly negative) or one of `+ - * /`. Division truncates toward zero. The expression is always well formed.',
      },
      {
        signature: 'String removeAdjacentDuplicates(String s)',
        description:
          'Repeatedly removes pairs of equal adjacent letters until none are left, and returns what remains: `"abbaca"` becomes `"ca"`.',
      },
    ],
    notes: ['For `a b -`, the right operand `b` is on top of the stack: pop it first.'],
  },
  complexity: {
    time: 'O(n) for each method: every character or token is pushed and popped at most once.',
    space: 'O(n) for the stack.',
  },
  hints: [
    'In `isValid`, push each opener. On a closer, the stack must be non-empty and its top must be the matching opener.',
    'In `evalRPN`, pop `b` first, then `a`, and push `a op b`. Java’s `/` on `int`s already truncates toward zero.',
    'In `removeAdjacentDuplicates`, pop when the top equals the current letter, otherwise push. The deque iterates top first, so build the result with `pollLast()` or `descendingIterator()`.',
    'Interview tip: say "I use `ArrayDeque` as a stack, not `Stack`, which is synchronized and legacy." It shows you know the library.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        // your code here
        return false;
    }

    public int evalRPN(String[] tokens) {
        // your code here
        return 0;
    }

    public String removeAdjacentDuplicates(String s) {
        // your code here
        return s;
    }
}
${MAIN}`,
  expectedOutput: `true false
9
6
ca`,
  solutionCode: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                char open = c == ')' ? '(' : c == ']' ? '[' : '{';
                if (stack.isEmpty() || stack.pop() != open) return false;
            }
        }
        return stack.isEmpty();
    }

    public int evalRPN(String[] tokens) {
        Deque<Integer> stack = new ArrayDeque<>();
        for (String token : tokens) {
            switch (token) {
                case "+" -> stack.push(stack.pop() + stack.pop());
                case "*" -> stack.push(stack.pop() * stack.pop());
                case "-" -> {
                    int b = stack.pop();
                    stack.push(stack.pop() - b);
                }
                case "/" -> {
                    int b = stack.pop();
                    stack.push(stack.pop() / b);
                }
                default -> stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    public String removeAdjacentDuplicates(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (!stack.isEmpty() && stack.peek() == c) stack.pop();
            else stack.push(c);
        }
        StringBuilder sb = new StringBuilder();
        while (!stack.isEmpty()) sb.append(stack.pollLast());
        return sb.toString();
    }
}
${MAIN}`,
  solutionExplanation:
    'Each method keeps the unfinished part of the input on the stack: unmatched openers, operands waiting for an operator, letters not yet cancelled. Checking `isEmpty()` before popping turns a stray closer into `false` instead of an exception, and reading the deque from the bottom with `pollLast()` rebuilds the remaining letters in their original order.',
  testCases: [
    {
      name: 'isValid accepts balanced brackets',
      call: 'isValid("()[]{}"), isValid("{[()]}"), isValid("")',
      code: `Solution s = new Solution();
t.equal(s.isValid("()[]{}"), true);
t.equal(s.isValid("{[()]}"), true);
t.equal(s.isValid(""), true, "The empty string has no unmatched brackets.");`,
    },
    {
      name: 'isValid rejects wrong types and wrong order',
      call: 'isValid("(]"), isValid("([)]")',
      code: `Solution s = new Solution();
t.equal(s.isValid("([)]"), false);
t.equal(s.isValid("(]"), false);
t.equal(s.isValid("{[]}"), true);`,
    },
    {
      name: 'isValid with a closer on an empty stack',
      call: 'isValid("]"), isValid("())"), isValid("((")',
      code: `Solution s = new Solution();
t.equal(s.isValid("]"), false, "A closer with nothing open is invalid; check isEmpty() before pop().");
t.equal(s.isValid("())"), false);
t.equal(s.isValid("(("), false, "Openers left on the stack at the end make the string invalid.");`,
    },
    {
      name: 'evalRPN operand order and truncating division',
      call: 'evalRPN(["10", "3", "-"]), evalRPN(["-7", "2", "/"])',
      code: `Solution s = new Solution();
t.equal(s.evalRPN(new String[]{"10", "3", "-"}), 7, "The top of the stack is the right operand: pop b first, then a, and compute a - b.");
t.equal(s.evalRPN(new String[]{"-7", "2", "/"}), -3);
t.equal(s.evalRPN(new String[]{"4", "13", "5", "/", "+"}), 6);`,
    },
    {
      name: 'evalRPN with tokens from split',
      call: 'evalRPN("2 1 + 3 *".split(" ")), evalRPN(["42"])',
      code: `Solution s = new Solution();
t.equal(s.evalRPN("2 1 + 3 *".split(" ")), 9, "Compare tokens with equals() or switch, not ==.");
t.equal(s.evalRPN("3 -4 * 5 -".split(" ")), -17);
t.equal(s.evalRPN(new String[]{"42"}), 42);`,
    },
    {
      name: 'removeAdjacentDuplicates keeps the original order',
      call: 'removeAdjacentDuplicates("abbaca"), removeAdjacentDuplicates("abc")',
      code: `Solution s = new Solution();
t.equal(s.removeAdjacentDuplicates("abbaca"), "ca");
t.equal(s.removeAdjacentDuplicates("abc"), "abc", "ArrayDeque iterates top first; read it from the bottom to keep the order.");`,
    },
    {
      name: 'removeAdjacentDuplicates down to nothing',
      call: 'removeAdjacentDuplicates("aaaa"), removeAdjacentDuplicates("")',
      code: `Solution s = new Solution();
t.equal(s.removeAdjacentDuplicates("abccba"), "");
t.equal(s.removeAdjacentDuplicates("aaaa"), "");
t.equal(s.removeAdjacentDuplicates("aaa"), "a");
t.equal(s.removeAdjacentDuplicates(""), "");`,
    },
  ],
};
