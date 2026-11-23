import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        int[] counts = solution.letterCounts("banana");
        System.out.println("a=" + counts[0] + " b=" + counts[1] + " n=" + counts[13]);
        System.out.println(solution.digitSum("a1b2c39"));
        System.out.println(solution.isPalindrome("A man, a plan, a canal: Panama"));
        System.out.println(solution.shift("hello, zebra", 3));
    }
}
`;

export const characters: LessonData = {
  id: 'characters',
  title: 'Characters',
  summary:
    "Treat a char as a 16-bit number: index arrays with c - 'a', read digits with c - '0', and classify with the Character helpers.",
  blocks: [
    {
      type: 'paragraph',
      text: "A `char` is an unsigned 16-bit number (a UTF-16 code unit) that happens to print as a character. `'a'` is 97, `'A'` is 65 and `'0'` is 48, and the letters and digits are consecutive. That makes character arithmetic the standard trick for letter problems:",
    },
    {
      type: 'code',
      code: `int[] counts = new int[26];
for (char c : "hello".toCharArray()) counts[c - 'a']++;
System.out.println(counts['l' - 'a']);   // 2

char third = (char) ('a' + 2);           // 'c'
int digit = '7' - '0';                   // 7`,
    },
    {
      type: 'list',
      items: [
        "`c - 'a'` maps `'a'..'z'` to `0..25`: an index into an `int[26]`. Use it when the input is lowercase letters; it is faster and smaller than a `HashMap<Character, Integer>`.",
        "`(char) ('a' + i)` goes back from an index to a letter. The cast is required, because `'a' + i` is an `int`.",
        "`c - '0'` turns a digit character into its value. `Character.getNumericValue(c)` does the same and more, but is slower.",
        '`Character.isDigit(c)`, `isLetter(c)`, `isLetterOrDigit(c)`, `isWhitespace(c)`, `isUpperCase(c)`, `toLowerCase(c)` and `toUpperCase(c)` are static methods that take and return `char`.',
      ],
    },
    {
      type: 'note',
      title: '`char + char` is an `int`',
      text: "Arithmetic on `char`s promotes them to `int`. `'a' + 'b'` is `195`, and `System.out.println('a' + 1)` prints `98`. Concatenation only happens when a `String` is involved first: `\"\" + 'a' + 'b'` is `\"ab\"`. Compound assignment casts back for you, so `c += 1` keeps `c` a `char`, but `c = c + 1` does not compile.",
    },
    {
      type: 'heading',
      text: '`charAt` vs `toCharArray`',
    },
    {
      type: 'paragraph',
      text: '`s.charAt(i)` reads one character without copying. `s.toCharArray()` copies the whole string into a new `char[]`: O(n) extra space, but you can sort it, swap in it, or loop over it with a for-each. For a read-only scan either is fine; to rearrange characters you need the array.',
    },
    {
      type: 'code',
      code: `char[] chars = "listen".toCharArray();
Arrays.sort(chars);
String key = new String(chars);   // "eilnst", the same for every anagram
// String.valueOf(chars) works too; chars.toString() does not (it prints [C@1b6d3586)`,
    },
    {
      type: 'note',
      title: 'Comparing chars',
      text: "`char` is a primitive, so `==` compares values and is correct: `s.charAt(i) == 'x'`. `Character` (the boxed type, as in `List<Character>`) is an object, and `==` on two `Character`s compares references. Unbox or use `equals` there.",
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'int[] letterCounts(String s)',
        description:
          "Returns an `int[26]` where index 0 counts `'a'`, index 1 counts `'b'`, and so on. Characters other than `'a'..'z'` are ignored.",
      },
      {
        signature: 'int digitSum(String s)',
        description: 'Returns the sum of the digit characters in `s`: `"a1b2c39"` gives `15`. Other characters are ignored.',
      },
      {
        signature: 'boolean isPalindrome(String s)',
        description:
          'Returns whether `s` reads the same forwards and backwards when you keep only letters and digits and ignore case.',
      },
      {
        signature: 'String shift(String s, int k)',
        description:
          "Shifts every lowercase letter `k` places forward in the alphabet, wrapping from `'z'` to `'a'`. Other characters stay as they are. `k` is `0` or more and may exceed 26.",
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method, where n is the length of the string.',
    space: 'O(1) extra for the counts and the palindrome check; O(n) for the shifted string.',
  },
  hints: [
    "In `letterCounts`, check `c >= 'a' && c <= 'z'` before `counts[c - 'a']++`, or an uppercase letter or space gives a negative index or one past 25.",
    "In `digitSum`, add `c - '0'`, not `c`. Adding the char itself adds 48 too much per digit.",
    'In `isPalindrome`, move two indices toward each other, skip characters that fail `Character.isLetterOrDigit`, and compare with `Character.toLowerCase`.',
    "In `shift`, compute `(char) ('a' + (c - 'a' + k) % 26)` and append it to a `StringBuilder`.",
  ],
  starterCode: `import java.util.*;

class Solution {
    public int[] letterCounts(String s) {
        // your code here
        return new int[26];
    }

    public int digitSum(String s) {
        // your code here
        return 0;
    }

    public boolean isPalindrome(String s) {
        // your code here
        return false;
    }

    public String shift(String s, int k) {
        // your code here
        return s;
    }
}
${MAIN}`,
  expectedOutput: `a=3 b=1 n=2
15
true
khoor, cheud`,
  solutionCode: `import java.util.*;

class Solution {
    public int[] letterCounts(String s) {
        int[] counts = new int[26];
        for (char c : s.toCharArray()) {
            if (c >= 'a' && c <= 'z') counts[c - 'a']++;
        }
        return counts;
    }

    public int digitSum(String s) {
        int sum = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isDigit(c)) sum += c - '0';
        }
        return sum;
    }

    public boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;
        while (left < right) {
            if (!Character.isLetterOrDigit(s.charAt(left))) left++;
            else if (!Character.isLetterOrDigit(s.charAt(right))) right--;
            else {
                if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) return false;
                left++;
                right--;
            }
        }
        return true;
    }

    public String shift(String s, int k) {
        StringBuilder sb = new StringBuilder(s.length());
        for (char c : s.toCharArray()) {
            if (c >= 'a' && c <= 'z') sb.append((char) ('a' + (c - 'a' + k) % 26));
            else sb.append(c);
        }
        return sb.toString();
    }
}
${MAIN}`,
  solutionExplanation:
    "Each method relies on letters and digits being consecutive codes. `c - 'a'` turns a letter into an index, `c - '0'` a digit into its value, and `(char) ('a' + i)` an index back into a letter, with `% 26` wrapping past `'z'`. `isPalindrome` skips non-alphanumerics with two pointers instead of building a cleaned copy.",
  testCases: [
    {
      name: 'letterCounts ignores other characters',
      call: 'letterCounts("Hello, world!")',
      code: `int[] expected = new int[26];
expected['e' - 'a'] = 1; expected['l' - 'a'] = 3; expected['o' - 'a'] = 2;
expected['r' - 'a'] = 1; expected['d' - 'a'] = 1; expected['w' - 'a'] = 1;
t.equal(new Solution().letterCounts("Hello, world!"), expected, "Only 'a'..'z' are counted; 'H' is ignored.");`,
    },
    {
      name: 'letterCounts of an empty string',
      call: 'letterCounts("")',
      code: `t.equal(new Solution().letterCounts(""), new int[26]);`,
    },
    {
      name: 'digitSum uses digit values, not char codes',
      call: 'digitSum("a1b2c39"), digitSum("no digits")',
      code: `Solution s = new Solution();
t.equal(s.digitSum("a1b2c39"), 15, "Add c - '0', not the char code itself.");
t.equal(s.digitSum("no digits"), 0);`,
    },
    {
      name: 'isPalindrome ignores case and punctuation',
      call: 'isPalindrome("A man, a plan, a canal: Panama"), isPalindrome("race a car")',
      code: `Solution s = new Solution();
t.equal(s.isPalindrome("A man, a plan, a canal: Panama"), true);
t.equal(s.isPalindrome("race a car"), false);`,
    },
    {
      name: 'isPalindrome edge cases',
      call: 'isPalindrome(""), isPalindrome(".,"), isPalindrome("0P"), isPalindrome("1a1")',
      code: `Solution s = new Solution();
t.equal(s.isPalindrome(""), true);
t.equal(s.isPalindrome(".,"), true, "A string with no letters or digits is a palindrome.");
t.equal(s.isPalindrome("0P"), false);
t.equal(s.isPalindrome("1a1"), true);`,
    },
    {
      name: 'shift wraps past z',
      call: 'shift("xyz abc", 3)',
      code: `t.equal(new Solution().shift("xyz abc", 3), "abc def");`,
    },
    {
      name: 'shift by 26 or more, and non-letters',
      call: 'shift("az-Q!", 27), shift("same", 26)',
      code: `Solution s = new Solution();
t.equal(s.shift("az-Q!", 27), "ba-Q!", "Only lowercase letters move; everything else stays.");
t.equal(s.shift("same", 26), "same");`,
    },
  ],
};
