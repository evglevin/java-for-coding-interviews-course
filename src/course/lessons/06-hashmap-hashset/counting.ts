import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        String[] words = {"to", "be", "or", "not", "to", "be"};
        System.out.println(new TreeMap<>(solution.wordCounts(words)));

        System.out.println(solution.isAnagram("listen", "silent"));
        System.out.println(solution.isAnagram("aab", "abb"));

        System.out.println(solution.mostFrequent("mississippi"));
    }
}
`;

export const counting: LessonData = {
  id: 'counting',
  title: 'Counting',
  summary:
    'Count occurrences with getOrDefault, merge, an int[26] array, or Collectors.groupingBy, and know which one to reach for.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Counting is the most common use of a map in interviews. The naive `map.put(w, map.get(w) + 1)` throws `NullPointerException` the first time a word appears, because `get` returns `null`. Two idioms avoid that:',
    },
    {
      type: 'code',
      code: `Map<String, Integer> counts = new HashMap<>();
for (String w : words) {
    counts.put(w, counts.getOrDefault(w, 0) + 1);
}

// same thing, one lookup instead of two
for (String w : words) {
    counts.merge(w, 1, Integer::sum);
}`,
    },
    {
      type: 'paragraph',
      text: '`merge(key, value, fn)` stores `value` if the key is missing; otherwise it stores `fn(oldValue, value)`. With `Integer::sum` that means "start at 1, then add 1". Both idioms box and unbox an `Integer` per update, which is fine at interview sizes.',
    },
    {
      type: 'heading',
      text: 'Small alphabets: use an array',
    },
    {
      type: 'code',
      code: `int[] freq = new int[26];
for (char c : "banana".toCharArray()) {
    freq[c - 'a']++;            // 'a' -> 0, 'b' -> 1, ...
}
System.out.println(freq[0]);    // 3 (a)
System.out.println(freq['n' - 'a']); // 2`,
      caption:
        'When keys are lowercase letters, an `int[26]` is faster than a map and needs no boxing. Use `int[128]` for ASCII.',
    },
    {
      type: 'paragraph',
      text: "`char` arithmetic gives an `int`, so `c - 'a'` is a valid index. Two strings are anagrams when their frequency arrays are equal, which `Arrays.equals` checks in O(26).",
    },
    {
      type: 'heading',
      text: 'With streams',
    },
    {
      type: 'code',
      code: `Map<String, Long> counts = Arrays.stream(words)
    .collect(Collectors.groupingBy(w -> w, Collectors.counting()));
// values are Long, not Integer: counts.get("to") is 2L`,
    },
    {
      type: 'note',
      title: '`Long`, not `Integer`',
      text: '`Collectors.counting()` produces `Long` values, so the result is a `Map<String, Long>`. Assigning it to `Map<String, Integer>` does not compile, and `counts.get("to").equals(2)` is `false` because `2` is an `Integer`. Use the loop with `merge` when you need `Integer` counts.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'Map<String, Integer> wordCounts(String[] words)',
        description: 'Maps each word to the number of times it appears. Words are case-sensitive.',
      },
      {
        signature: 'boolean isAnagram(String a, String b)',
        description:
          'Returns `true` when `b` uses exactly the same letters as `a`, each the same number of times. Both strings contain only lowercase letters `a`–`z`.',
      },
      {
        signature: 'char mostFrequent(String s)',
        description:
          'Returns the character that appears most often in the non-empty string `s`. On a tie, returns the smallest character.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method, where n is the total input length.',
    space: 'O(k) for k distinct words or characters; O(1) for the `int[26]` in `isAnagram`.',
  },
  hints: [
    'In `wordCounts`, `counts.merge(w, 1, Integer::sum)` handles both the first and later occurrences.',
    'In `isAnagram`, return `false` early when the lengths differ. Otherwise add 1 for each letter of `a` and subtract 1 for each letter of `b`; every slot must end at 0.',
    'In `mostFrequent`, count first, then scan the counts. Replace the best character when a count is higher, or equal with a smaller character.',
    'Interview tip: mention the `int[26]` option when the input is lowercase letters; it shows you know the constant factors.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public Map<String, Integer> wordCounts(String[] words) {
        // your code here
        return new HashMap<>();
    }

    public boolean isAnagram(String a, String b) {
        // your code here
        return false;
    }

    public char mostFrequent(String s) {
        // your code here
        return ' ';
    }
}
${MAIN}`,
  expectedOutput: `{be=2, not=1, or=1, to=2}
true
false
i`,
  solutionCode: `import java.util.*;

class Solution {
    public Map<String, Integer> wordCounts(String[] words) {
        Map<String, Integer> counts = new HashMap<>();
        for (String w : words) {
            counts.merge(w, 1, Integer::sum);
        }
        return counts;
    }

    public boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int[] freq = new int[26];
        for (int i = 0; i < a.length(); i++) {
            freq[a.charAt(i) - 'a']++;
            freq[b.charAt(i) - 'a']--;
        }
        for (int f : freq) {
            if (f != 0) {
                return false;
            }
        }
        return true;
    }

    public char mostFrequent(String s) {
        Map<Character, Integer> counts = new HashMap<>();
        for (char c : s.toCharArray()) {
            counts.merge(c, 1, Integer::sum);
        }
        char best = s.charAt(0);
        for (char c : s.toCharArray()) {
            int n = counts.get(c);
            int bestCount = counts.get(best);
            if (n > bestCount || (n == bestCount && c < best)) {
                best = c;
            }
        }
        return best;
    }
}
${MAIN}`,
  solutionExplanation:
    '`merge` with `Integer::sum` starts each word at 1 and adds 1 on every repeat. `isAnagram` balances one frequency array up for `a` and down for `b`, so any letter left non-zero means the counts differ. `mostFrequent` counts every character, then picks the highest count and breaks ties by the smaller `char`.',
  testCases: [
    {
      name: 'wordCounts counts repeats',
      call: 'wordCounts(["to", "be", "or", "not", "to", "be"])',
      code: `t.equal(new Solution().wordCounts(new String[]{"to", "be", "or", "not", "to", "be"}),
    Map.of("to", 2, "be", 2, "or", 1, "not", 1));`,
    },
    {
      name: 'wordCounts is case-sensitive and handles empty input',
      call: 'wordCounts(["Go", "go", "go"]), wordCounts([])',
      code: `Solution s = new Solution();
t.equal(s.wordCounts(new String[]{"Go", "go", "go"}), Map.of("Go", 1, "go", 2));
t.equal(s.wordCounts(new String[]{}), Map.of());`,
    },
    {
      name: 'isAnagram',
      call: 'isAnagram("listen", "silent"), isAnagram("rat", "car")',
      code: `Solution s = new Solution();
t.equal(s.isAnagram("listen", "silent"), true);
t.equal(s.isAnagram("rat", "car"), false);`,
    },
    {
      name: 'isAnagram compares counts, not just letters',
      call: 'isAnagram("aab", "abb"), isAnagram("ab", "abb")',
      code: `Solution s = new Solution();
t.equal(s.isAnagram("aab", "abb"), false, "Same letters, different counts: not an anagram.");
t.equal(s.isAnagram("ab", "abb"), false);
t.equal(s.isAnagram("", ""), true);`,
    },
    {
      name: 'mostFrequent',
      call: 'mostFrequent("mississippi"), mostFrequent("z")',
      code: `Solution s = new Solution();
t.equal(s.mostFrequent("mississippi"), 'i');
t.equal(s.mostFrequent("z"), 'z');`,
    },
    {
      name: 'mostFrequent breaks ties by the smallest character',
      call: 'mostFrequent("bbaacc"), mostFrequent("zyx")',
      code: `Solution s = new Solution();
t.equal(s.mostFrequent("bbaacc"), 'a', "a, b and c all appear twice; return the smallest, 'a'.");
t.equal(s.mostFrequent("zyx"), 'x');`,
    },
  ],
};
