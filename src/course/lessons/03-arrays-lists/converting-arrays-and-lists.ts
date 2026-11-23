import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        System.out.println(solution.toList(new int[]{4, -2, 7}));
        System.out.println(Arrays.toString(solution.toArray(List.of(9, 0, -3))));
        System.out.println(Arrays.toString(solution.toStringArray(List.of("red", "green"))));
        String[] words = {"one", "two"};
        System.out.println(solution.withExtra(words, "three"));
        System.out.println(Arrays.toString(words));
    }
}
`;

export const convertingArraysAndLists: LessonData = {
  id: 'converting-arrays-and-lists',
  title: 'Converting Arrays and Lists',
  summary:
    'Arrays.asList, List.of, boxing int[] through streams, and toArray: how to move between arrays and lists without surprises.',
  blocks: [
    {
      type: 'paragraph',
      text: '`Arrays.asList(arr)` does not copy. It returns a fixed-size list *backed by* the array: `set` writes through to the array, changes to the array show in the list, and anything that changes the size throws `UnsupportedOperationException`.',
    },
    {
      type: 'code',
      code: `String[] arr = {"b", "a", "c"};
List<String> view = Arrays.asList(arr);
view.set(0, "z");   // arr is now [z, a, c]
arr[1] = "y";       // view is now [z, y, c]
view.add("d");      // UnsupportedOperationException: the size is fixed

List<String> list = new ArrayList<>(Arrays.asList(arr)); // an independent, resizable copy`,
    },
    {
      type: 'paragraph',
      text: '`List.of(...)` builds an immutable list: `add`, `set`, `remove` and `sort` all throw `UnsupportedOperationException`, and it rejects `null` elements with a `NullPointerException`. Wrap it in `new ArrayList<>(...)` when you need to change it.',
    },
    {
      type: 'heading',
      text: 'Primitive arrays don’t box',
    },
    {
      type: 'code',
      code: `int[] nums = {3, 1, 2};
List<int[]> oops = Arrays.asList(nums);  // one element: the array itself
// List<Integer> bad = Arrays.asList(nums);  // does not compile

List<Integer> boxed = Arrays.stream(nums).boxed().toList();  // [3, 1, 2], unmodifiable
List<Integer> mutable = Arrays.stream(nums).boxed()
    .collect(Collectors.toCollection(ArrayList::new));        // [3, 1, 2], modifiable

int[] back = boxed.stream().mapToInt(Integer::intValue).toArray(); // [3, 1, 2]`,
    },
    {
      type: 'paragraph',
      text: '`Arrays.asList` takes varargs of objects. An `int[]` is one object, so it becomes a single element. An `Integer[]` works as expected. To go from `int[]` to `List<Integer>`, box through a stream or loop and `add`; to go back, unbox with `mapToInt` or a loop.',
    },
    {
      type: 'heading',
      text: 'List to object array',
    },
    {
      type: 'code',
      code: `List<String> words = List.of("x", "y");
String[] arr = words.toArray(new String[0]);   // [x, y]
Object[] objs = words.toArray();               // Object[], not String[]
String[] bad = (String[]) words.toArray();     // ClassCastException`,
      caption:
        'The array you pass tells `toArray` the element type. A zero-length array is the idiom; `toArray` allocates one of the right size.',
    },
    {
      type: 'paragraph',
      text: 'There is no `toArray` that returns an `int[]`: `list.toArray(new Integer[0])` gives an `Integer[]`. Use `mapToInt(Integer::intValue).toArray()`, which throws `NullPointerException` if the list holds a `null`.',
    },
    {
      type: 'note',
      title: 'Cost',
      text: '`Arrays.asList` is O(1): it wraps the array. Every other conversion here copies, so it is O(n) time and O(n) space, and boxing allocates an object per element outside the cached range −128 to 127.',
    },
  ],
  challenge: {
    intro: 'Complete the methods of `Solution`:',
    methods: [
      {
        signature: 'List<Integer> toList(int[] nums)',
        description: 'Returns the numbers as a list, in the same order.',
      },
      {
        signature: 'int[] toArray(List<Integer> nums)',
        description: 'Returns the numbers as an `int[]`, in the same order.',
      },
      {
        signature: 'String[] toStringArray(List<String> words)',
        description: 'Returns the words as a `String[]`, in the same order.',
      },
      {
        signature: 'List<String> withExtra(String[] words, String extra)',
        description: 'Returns a new list with the words in order, followed by `extra`. The array stays unchanged.',
      },
    ],
  },
  complexity: {
    time: 'O(n) for each method: every element is copied once.',
    space: 'O(n) for the new list or array.',
  },
  hints: [
    '`Arrays.asList` can’t box an `int[]`. Use `Arrays.stream(nums).boxed().toList()`.',
    'Unbox with `nums.stream().mapToInt(Integer::intValue).toArray()`, and pass `new String[0]` to `toArray` to get a `String[]`.',
    'In `withExtra`, `Arrays.asList(words)` is fixed-size, so `add` throws. Copy it into `new ArrayList<>(...)` first.',
  ],
  starterCode: `import java.util.*;
import java.util.stream.*;

class Solution {
    public List<Integer> toList(int[] nums) {
        // your code here
        return List.of();
    }

    public int[] toArray(List<Integer> nums) {
        // your code here
        return new int[0];
    }

    public String[] toStringArray(List<String> words) {
        // your code here
        return new String[0];
    }

    public List<String> withExtra(String[] words, String extra) {
        // your code here
        return List.of();
    }
}
${MAIN}`,
  expectedOutput: `[4, -2, 7]
[9, 0, -3]
[red, green]
[one, two, three]
[one, two]`,
  solutionCode: `import java.util.*;
import java.util.stream.*;

class Solution {
    public List<Integer> toList(int[] nums) {
        return Arrays.stream(nums).boxed().toList();
    }

    public int[] toArray(List<Integer> nums) {
        return nums.stream().mapToInt(Integer::intValue).toArray();
    }

    public String[] toStringArray(List<String> words) {
        return words.toArray(new String[0]);
    }

    public List<String> withExtra(String[] words, String extra) {
        List<String> result = new ArrayList<>(Arrays.asList(words));
        result.add(extra);
        return result;
    }
}
${MAIN}`,
  solutionExplanation:
    '`boxed()` turns the `IntStream` into a `Stream<Integer>` and `mapToInt` turns it back, since `Arrays.asList` and `toArray` only handle object arrays. `toArray(new String[0])` returns a real `String[]`, and `withExtra` copies the fixed-size `Arrays.asList` view into an `ArrayList` before adding.',
  testCases: [
    {
      name: 'toList with negatives and duplicates',
      call: 'toList(new int[]{5, -1, 5, 0})',
      code: `t.equal(new Solution().toList(new int[]{5, -1, 5, 0}), List.of(5, -1, 5, 0));`,
    },
    {
      name: 'toArray',
      call: 'toArray([-7, 300, -7, 2])',
      code: `t.equal(new Solution().toArray(List.of(-7, 300, -7, 2)), new int[]{-7, 300, -7, 2});`,
    },
    {
      name: 'toStringArray',
      call: 'toStringArray([b, a, b])',
      code: `t.equal(new Solution().toStringArray(List.of("b", "a", "b")), new String[]{"b", "a", "b"});`,
    },
    {
      name: 'withExtra adds to a fixed-size view',
      call: 'withExtra(new String[]{"x", "y"}, "z")',
      code: `String[] words = {"x", "y"};
t.equal(new Solution().withExtra(words, "z"), List.of("x", "y", "z"),
    "Arrays.asList returns a fixed-size list; copy it into an ArrayList before add.");
t.equal(words, new String[]{"x", "y"}, "The array should stay unchanged.");`,
    },
    {
      name: 'empty inputs',
      call: 'toList(new int[]{}), toArray([]), toStringArray([]), withExtra(new String[]{}, "solo")',
      code: `Solution s = new Solution();
t.equal(s.toList(new int[]{}), List.of());
t.equal(s.toArray(List.of()), new int[]{});
t.equal(s.toStringArray(List.of()), new String[]{});
t.equal(s.withExtra(new String[]{}, "solo"), List.of("solo"));`,
    },
  ],
};
