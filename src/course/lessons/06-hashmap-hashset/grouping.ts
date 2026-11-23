import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        String[] words = {"eat", "tea", "tan", "ate", "nat", "bat"};
        List<List<String>> groups = new ArrayList<>(solution.groupAnagrams(words));
        groups.sort(Comparator.comparing((List<String> g) -> g.get(0)));
        System.out.println(groups);

        List<String> fruits = List.of("fig", "pear", "kiwi", "plum", "apple", "date");
        System.out.println(new TreeMap<>(solution.byLength(fruits)));

        String[] log = {"get", "put", "get", "del", "get"};
        System.out.println(new TreeMap<>(solution.positions(log)));
    }
}
`;

export const grouping: LessonData = {
  id: 'grouping',
  title: 'Grouping',
  summary: 'Group values under a shared key with Map<K, List<V>>, computeIfAbsent, and Collectors.groupingBy.',
  blocks: [
    {
      type: 'paragraph',
      text: 'To group values, map each key to a list and append to it. The list has to exist before you can `add` to it. `computeIfAbsent` creates it on first use and returns the list that is in the map, so one line does both:',
    },
    {
      type: 'code',
      code: `Map<Character, List<String>> byInitial = new HashMap<>();
for (String w : List.of("apple", "bean", "avocado", "beet")) {
    byInitial.computeIfAbsent(w.charAt(0), k -> new ArrayList<>()).add(w);
}
System.out.println(new TreeMap<>(byInitial)); // {a=[apple, avocado], b=[bean, beet]}`,
    },
    {
      type: 'paragraph',
      text: 'The lambda runs only when the key is missing, so you build one list per key, not one per element. Values in each list keep the order you added them.',
    },
    {
      type: 'heading',
      text: '`putIfAbsent` returns the old value',
    },
    {
      type: 'code',
      code: `map.putIfAbsent(key, new ArrayList<>()).add(w); // NullPointerException on a new key
map.putIfAbsent(key, new ArrayList<>());          // works, in two lines,
map.get(key).add(w);                              // but allocates a list every time`,
      caption:
        '`putIfAbsent` returns the _previous_ value, which is `null` for a new key. `computeIfAbsent` returns the current one.',
    },
    {
      type: 'heading',
      text: 'With streams',
    },
    {
      type: 'code',
      code: `Map<Integer, List<String>> byLength = words.stream()
    .collect(Collectors.groupingBy(String::length));
// each list keeps the stream's encounter order`,
    },
    {
      type: 'note',
      title: 'Choosing a group key',
      text: 'For anagrams, the key is the word with its letters sorted: `char[] cs = w.toCharArray(); Arrays.sort(cs); String key = new String(cs);`. Don’t use the `char[]` itself as the key: arrays use identity for `equals` and `hashCode`, so two equal arrays land in different groups. And `cs.toString()` gives `[C@1b6d3586`, not the letters.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'List<List<String>> groupAnagrams(String[] words)',
        description:
          'Groups words that are anagrams of each other. Within a group, words keep their input order; the groups themselves may come in any order. Duplicate words stay in the same group.',
      },
      {
        signature: 'Map<Integer, List<String>> byLength(List<String> words)',
        description: 'Maps each word length to the words of that length, in input order.',
      },
      {
        signature: 'Map<String, List<Integer>> positions(String[] words)',
        description: 'Maps each word to the list of indexes where it appears, in increasing order.',
      },
    ],
  },
  complexity: {
    time: 'O(n · k log k) for `groupAnagrams` (sorting each word of length up to k); O(n) for the others.',
    space: 'O(n · k) for the groups and their keys.',
  },
  hints: [
    'All three methods use the same line: `map.computeIfAbsent(key, k -> new ArrayList<>()).add(value)`.',
    'For `groupAnagrams`, the key is `new String(sortedChars)`. Return `new ArrayList<>(map.values())`.',
    '`byLength` can be a one-liner with `words.stream().collect(Collectors.groupingBy(String::length))`.',
    'Interview tip: say why the sorted-letters key works: two words are anagrams exactly when their sorted letters are equal.',
  ],
  starterCode: `import java.util.*;
import java.util.stream.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] words) {
        // your code here
        return List.of();
    }

    public Map<Integer, List<String>> byLength(List<String> words) {
        // your code here
        return new HashMap<>();
    }

    public Map<String, List<Integer>> positions(String[] words) {
        // your code here
        return new HashMap<>();
    }
}
${MAIN}`,
  expectedOutput: `[[bat], [eat, tea, ate], [tan, nat]]
{3=[fig], 4=[pear, kiwi, plum, date], 5=[apple]}
{del=[3], get=[0, 2, 4], put=[1]}`,
  solutionCode: `import java.util.*;
import java.util.stream.*;

class Solution {
    public List<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> groups = new HashMap<>();
        for (String w : words) {
            char[] cs = w.toCharArray();
            Arrays.sort(cs);
            groups.computeIfAbsent(new String(cs), k -> new ArrayList<>()).add(w);
        }
        return new ArrayList<>(groups.values());
    }

    public Map<Integer, List<String>> byLength(List<String> words) {
        return words.stream().collect(Collectors.groupingBy(String::length));
    }

    public Map<String, List<Integer>> positions(String[] words) {
        Map<String, List<Integer>> result = new HashMap<>();
        for (int i = 0; i < words.length; i++) {
            result.computeIfAbsent(words[i], k -> new ArrayList<>()).add(i);
        }
        return result;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each method picks a key (sorted letters, length, the word itself) and appends to that key’s list with `computeIfAbsent`, which creates the list only the first time. Appending in input order keeps each list in input order; `groupingBy` does the same for a stream.',
  testCases: [
    {
      name: 'groupAnagrams',
      call: 'groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])',
      code: `t.unordered(new Solution().groupAnagrams(new String[]{"eat", "tea", "tan", "ate", "nat", "bat"}),
    List.of(List.of("eat", "tea", "ate"), List.of("tan", "nat"), List.of("bat")));`,
    },
    {
      name: 'groupAnagrams keeps duplicates and empty words',
      call: 'groupAnagrams(["ab", "", "ba", "ab", ""])',
      code: `t.unordered(new Solution().groupAnagrams(new String[]{"ab", "", "ba", "ab", ""}),
    List.of(List.of("ab", "ba", "ab"), List.of("", "")));`,
    },
    {
      name: 'groupAnagrams with no words and one word',
      call: 'groupAnagrams([]), groupAnagrams(["solo"])',
      code: `Solution s = new Solution();
t.unordered(s.groupAnagrams(new String[]{}), List.of());
t.unordered(s.groupAnagrams(new String[]{"solo"}), List.of(List.of("solo")));`,
    },
    {
      name: 'byLength keeps input order within a length',
      call: 'byLength(["fig", "pear", "kiwi", "ox", "plum", "yam"])',
      code: `t.equal(new Solution().byLength(List.of("fig", "pear", "kiwi", "ox", "plum", "yam")),
    Map.of(3, List.of("fig", "yam"), 4, List.of("pear", "kiwi", "plum"), 2, List.of("ox")));`,
    },
    {
      name: 'byLength on an empty list',
      call: 'byLength([])',
      code: `t.equal(new Solution().byLength(List.of()), Map.of());`,
    },
    {
      name: 'positions',
      call: 'positions(["get", "put", "get", "del", "get"])',
      code: `t.equal(new Solution().positions(new String[]{"get", "put", "get", "del", "get"}),
    Map.of("get", List.of(0, 2, 4), "put", List.of(1), "del", List.of(3)));`,
    },
  ],
};
