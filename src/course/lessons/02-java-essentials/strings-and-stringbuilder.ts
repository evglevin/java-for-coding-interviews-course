import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.reverseWords("  the sky   is blue "));
        System.out.println(solution.compress("aaabccdddd"));
        System.out.println(Arrays.toString(solution.splitVersion("1.10.3")));
    }
}
`;

export const stringsAndStringbuilder: LessonData = {
  id: 'strings-and-stringbuilder',
  title: 'Strings and StringBuilder',
  summary:
    'Compare strings with equals, build them with StringBuilder instead of += in a loop, and avoid the substring and split traps.',
  blocks: [
    {
      type: 'paragraph',
      text: 'A Java `String` is **immutable**. Every method that seems to change it (`toUpperCase`, `replace`, `trim`, `+`) returns a new string and leaves the original alone. To build a string piece by piece, use a `StringBuilder`, which is a growable buffer of characters.',
    },
    {
      type: 'code',
      code: `StringBuilder sb = new StringBuilder();
for (int i = 0; i < 3; i++) sb.append(i).append(',');
sb.setLength(sb.length() - 1);    // drop the last comma
System.out.println(sb);           // 0,1,2

sb.insert(0, '[').append(']');    // [0,1,2]
sb.deleteCharAt(1);               // [,1,2]
sb.reverse();                     // ]2,1,[
String result = sb.toString();    // back to an immutable String`,
    },
    {
      type: 'paragraph',
      text: '`append`, `insert`, `reverse` and `deleteCharAt` change the builder and return it, so calls chain. `setLength(0)` empties it for reuse. `sb.charAt(i)` and `sb.setCharAt(i, c)` read and write one character.',
    },
    {
      type: 'note',
      title: '`+=` in a loop is O(n²)',
      text: '`s += x` copies all of `s` into a new string every time. Doing it n times copies 1 + 2 + … + n characters, which is O(n²). `StringBuilder.append` is amortized O(1), so a loop of appends is O(n). A single expression like `a + ":" + b` is fine; the compiler builds it in one go.',
    },
    {
      type: 'heading',
      text: 'Compare with `equals`, never `==`',
    },
    {
      type: 'paragraph',
      text: '`==` on objects compares references: are these the same object? Two strings with the same characters are often different objects, so `==` can be `false` for equal text. It sometimes happens to work for string literals, which makes the bug hard to spot. Always use `a.equals(b)` (or `equalsIgnoreCase`), and `"text".equals(s)` when `s` may be `null`.',
    },
    {
      type: 'code',
      code: `String a = "hello";
String b = new StringBuilder("hel").append("lo").toString();
System.out.println(a == b);       // false: different objects
System.out.println(a.equals(b));  // true: same characters`,
    },
    {
      type: 'heading',
      text: 'Everyday methods',
    },
    {
      type: 'list',
      items: [
        '`s.length()` is a method on `String` (`array.length` is a field, `list.size()` a method).',
        '`s.charAt(i)` returns a `char`; it throws `StringIndexOutOfBoundsException` past the end.',
        '`s.substring(begin, end)` is **end-exclusive**: `"interview".substring(0, 5)` is `"inter"`. `substring(begin)` runs to the end. It copies, so it costs O(length).',
        '`String.join(", ", list)` joins any `Iterable<String>` or varargs; `"ab".repeat(3)` is `"ababab"`.',
        '`s.indexOf("x")` returns `-1` when not found; `s.contains`, `startsWith` and `endsWith` return booleans.',
        '`s.toCharArray()` copies the characters into a `char[]` you can sort or modify; `new String(chars)` turns it back.',
      ],
    },
    {
      type: 'note',
      title: '`split` takes a regex',
      text: '`"1.2.3".split(".")` returns an **empty array**: `.` is a regex that matches every character. Escape it: `split("\\\\.")`. The same applies to `|`, `+`, `*`, `?`, `$` and `(`. Use `split("\\\\s+")` for runs of whitespace, and `trim()` first, or a leading space gives you an empty first element. Trailing empty strings are dropped: `"a,b,,".split(",")` is `[a, b]`.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'String reverseWords(String sentence)',
        description:
          'Returns the words in reverse order, separated by single spaces. The input may have leading, trailing or repeated spaces; the result has none. A sentence with no words gives `""`.',
      },
      {
        signature: 'String compress(String s)',
        description:
          'Replaces each run of the same character with the character followed by the run length: `"aaabcc"` becomes `"a3b1c2"`. The empty string stays empty.',
      },
      {
        signature: 'String[] splitVersion(String version)',
        description: 'Splits a dotted version string into its parts: `"1.10.3"` becomes `["1", "10", "3"]`.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method, where n is the length of the string.',
    space: 'O(n) for the builder, the word array and the result.',
  },
  hints: [
    'For `reverseWords`, `sentence.trim().split("\\\\s+")` gives you the words; walk them from the end.',
    'For `compress`, keep a `StringBuilder` and a run counter. When the next character differs (or the string ends), append the character and the count.',
    'For `splitVersion`, `.` is a regex wildcard. Escape it as `"\\\\."` inside the Java string.',
    'Interview tip: when you build a result in a loop, reach for `StringBuilder` first and say why: `+=` is quadratic.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public String reverseWords(String sentence) {
        // your code here
        return sentence;
    }

    public String compress(String s) {
        // your code here
        return s;
    }

    public String[] splitVersion(String version) {
        // your code here
        return new String[0];
    }
}
${MAIN}`,
  expectedOutput: `blue is sky the
a3b1c2d4
[1, 10, 3]`,
  solutionCode: `import java.util.*;

class Solution {
    public String reverseWords(String sentence) {
        String trimmed = sentence.trim();
        if (trimmed.isEmpty()) return "";
        String[] words = trimmed.split("\\\\s+");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) sb.append(' ');
        }
        return sb.toString();
    }

    public String compress(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i);
            int j = i;
            while (j < s.length() && s.charAt(j) == c) j++;
            sb.append(c).append(j - i);
            i = j;
        }
        return sb.toString();
    }

    public String[] splitVersion(String version) {
        return version.split("\\\\.");
    }
}
${MAIN}`,
  solutionExplanation:
    '`reverseWords` trims and splits on runs of whitespace, then appends the words back to front. `compress` scans each run with a second index and appends the character and run length to one `StringBuilder`, so the whole method is O(n). `splitVersion` escapes the dot, because `split` treats its argument as a regex.',
  testCases: [
    {
      name: 'reverseWords with extra spaces',
      call: 'reverseWords("  hello   world  ")',
      code: `t.equal(new Solution().reverseWords("  hello   world  "), "world hello");`,
    },
    {
      name: 'reverseWords with one word and no words',
      call: 'reverseWords("solo"), reverseWords("   ")',
      code: `Solution s = new Solution();
t.equal(s.reverseWords("solo"), "solo");
t.equal(s.reverseWords("   "), "", "A sentence with only spaces has no words.");`,
    },
    {
      name: 'compress',
      call: 'compress("aaabcc")',
      code: `t.equal(new Solution().compress("aaabcc"), "a3b1c2");`,
    },
    {
      name: 'compress repeats of a letter in separate runs',
      call: 'compress("aabaaaz")',
      code: `t.equal(new Solution().compress("aabaaaz"), "a2b1a3z1");`,
    },
    {
      name: 'compress counts runs of 10 or more',
      call: 'compress("xxxxxxxxxxxx") (12 x)',
      code: `Solution s = new Solution();
t.equal(s.compress("x".repeat(12)), "x12");
t.equal(s.compress(""), "");`,
    },
    {
      name: 'compress a long string',
      call: 'compress("ab" repeated 50,000 times)',
      code: `String result = new Solution().compress("ab".repeat(50_000));
t.equal(result.length(), 200_000);
t.check(result.startsWith("a1b1a1b1"), "Each single letter becomes the letter followed by 1.");`,
    },
    {
      name: 'splitVersion escapes the dot',
      call: 'splitVersion("1.10.3"), splitVersion("7")',
      code: `Solution s = new Solution();
t.equal(s.splitVersion("1.10.3"), new String[]{"1", "10", "3"}, "split takes a regex, and . matches any character.");
t.equal(s.splitVersion("7"), new String[]{"7"});`,
    },
  ],
};
