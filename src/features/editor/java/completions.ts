import {
  snippetCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
  type CompletionSource,
} from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import type { EditorState } from '@codemirror/state';

/**
 * Java completions without type inference: static members after a known class name, a
 * merged list of common instance methods after any other `.`, and otherwise the document's
 * own declarations, keywords, common types and a few snippets.
 */

/**
 * `[label, detail, info]`. A detail starting with `(` makes the entry a method, otherwise
 * it is a constant (`MAX_VALUE`) or a property (`System.out`).
 */
type MemberSpec = [label: string, detail: string, info: string];

/**
 * Boosts rank entries that match the typed text equally well. They stay well under the
 * matcher's 100-point penalty for a partial match, so `add` still beats `addAll` on "add".
 */
const MAX_BOOST = 40;
const CONSTANT_CASE = /^[A-Z][A-Z0-9_]*$/;

function memberType([label, detail]: MemberSpec): Completion['type'] {
  if (detail.startsWith('(')) return 'method';
  return CONSTANT_CASE.test(label) ? 'constant' : 'property';
}

// ---------------------------------------------------------------------------------------
// Static members, listed most interview-relevant first.
// ---------------------------------------------------------------------------------------

const ARRAYS: MemberSpec[] = [
  [
    'sort',
    '(a[, from, to][, cmp]): void',
    'Sorts in place. Primitives use dual-pivot quicksort, objects use stable TimSort. O(n log n).',
  ],
  ['fill', '(a, val): void', 'Assigns val to every element, e.g. a dp table to -1.'],
  ['asList', '(T... a): List<T>', 'Fixed-size list backed by the array: set works, add and remove throw.'],
  ['stream', '(a): IntStream | Stream<T>', 'Stream over the array, e.g. Arrays.stream(nums).sum().'],
  ['toString', '(a): String', 'Readable form of a 1-D array: "[1, 2, 3]".'],
  ['copyOf', '(a, newLength): T[]', 'Copy truncated, or padded with 0 / false / null, to newLength.'],
  ['copyOfRange', '(a, from, to): T[]', 'Copy of a[from, to); to is exclusive.'],
  ['deepToString', '(Object[] a): String', 'Readable form of nested arrays such as int[][].'],
  ['equals', '(a, b): boolean', 'True if both arrays hold equal elements in the same order.'],
  ['binarySearch', '(a, key): int', 'Index of key in a sorted array, or -(insertionPoint) - 1 if absent. O(log n).'],
  ['setAll', '(a, i -> value): void', 'Sets every element from a function of its index.'],
  ['deepEquals', '(Object[] a, Object[] b): boolean', 'Element-wise equality for nested arrays.'],
  ['hashCode', '(a): int', 'Content-based hash, e.g. to use an array’s contents as a key.'],
];

const COLLECTIONS: MemberSpec[] = [
  ['sort', '(list[, cmp]): void', 'Sorts the list in place. Stable. O(n log n).'],
  ['reverse', '(list): void', 'Reverses the list in place. O(n).'],
  ['max', '(coll[, cmp]): T', 'Largest element. O(n).'],
  ['min', '(coll[, cmp]): T', 'Smallest element. O(n).'],
  ['swap', '(list, i, j): void', 'Swaps the elements at indices i and j.'],
  [
    'reverseOrder',
    '([cmp]): Comparator<T>',
    'Descending comparator, e.g. new PriorityQueue<>(Collections.reverseOrder()) for a max-heap.',
  ],
  ['frequency', '(coll, o): int', 'Number of elements equal to o. O(n).'],
  ['nCopies', '(n, o): List<T>', 'Immutable list of n copies of o.'],
  ['emptyList', '(): List<T>', 'Immutable empty list.'],
  ['unmodifiableList', '(list): List<T>', 'Read-only view of the list.'],
  ['addAll', '(coll, T... elements): boolean', 'Adds all the given elements to coll.'],
  ['shuffle', '(list[, rnd]): void', 'Randomly permutes the list.'],
  ['singletonList', '(o): List<T>', 'Immutable one-element list.'],
];

const MATH: MemberSpec[] = [
  ['max', '(a, b)', 'Larger of two int, long, float or double values.'],
  ['min', '(a, b)', 'Smaller of two int, long, float or double values.'],
  ['abs', '(a)', 'Absolute value. Math.abs(Integer.MIN_VALUE) is still negative.'],
  ['pow', '(double a, double b): double', 'a raised to b, as a double: cast for integer results.'],
  ['sqrt', '(double a): double', 'Square root.'],
  ['floorMod', '(a, b)', 'Modulo with the sign of b: never negative for positive b, unlike %.'],
  ['floorDiv', '(a, b)', 'Division rounded toward negative infinity.'],
  ['ceil', '(double a): double', 'Smallest integer value ≥ a, as a double.'],
  ['floor', '(double a): double', 'Largest integer value ≤ a, as a double.'],
  ['round', '(double a): long', 'Nearest whole number, ties rounding up.'],
  ['log', '(double a): double', 'Natural logarithm.'],
  ['log10', '(double a): double', 'Base-10 logarithm.'],
  ['hypot', '(double x, double y): double', 'sqrt(x² + y²) without intermediate overflow.'],
  ['addExact', '(a, b)', 'a + b, throwing ArithmeticException on overflow.'],
  ['multiplyExact', '(a, b)', 'a * b, throwing ArithmeticException on overflow.'],
  ['toIntExact', '(long a): int', 'Narrows to int, throwing on overflow.'],
  ['signum', '(double d): double', '-1.0, 0.0 or 1.0 by the sign of d.'],
  ['random', '(): double', 'Uniform random double in [0, 1).'],
  ['PI', 'double', 'π ≈ 3.14159.'],
  ['E', 'double', 'e ≈ 2.71828.'],
];

const INTEGER: MemberSpec[] = [
  ['MAX_VALUE', 'int', '2147483647 (2³¹ − 1). Common "infinity" for min searches.'],
  ['MIN_VALUE', 'int', '-2147483648 (−2³¹).'],
  ['parseInt', '(String s[, int radix]): int', 'Parses a decimal (or radix) string; throws NumberFormatException.'],
  ['valueOf', '(int | String): Integer', 'Boxed Integer; use list.remove(Integer.valueOf(x)) to remove by value.'],
  ['compare', '(int x, int y): int', 'Overflow-safe comparison. Use it instead of x - y in comparators.'],
  ['toString', '(int i[, int radix]): String', 'Decimal (or radix) string of i.'],
  ['toBinaryString', '(int i): String', 'Unsigned binary digits of i, without leading zeros.'],
  ['bitCount', '(int i): int', 'Number of one bits (popcount).'],
  ['max', '(int a, int b): int', 'Larger value; handy as a method reference: Integer::max.'],
  ['min', '(int a, int b): int', 'Smaller value; handy as a method reference: Integer::min.'],
  ['sum', '(int a, int b): int', 'a + b; handy as a method reference: map.merge(k, 1, Integer::sum).'],
  ['signum', '(int i): int', '-1, 0 or 1 by the sign of i.'],
  ['highestOneBit', '(int i): int', 'i with only its highest one bit kept.'],
  ['lowestOneBit', '(int i): int', 'i with only its lowest one bit kept (i & -i).'],
  ['numberOfTrailingZeros', '(int i): int', 'Zero bits below the lowest one bit.'],
  ['numberOfLeadingZeros', '(int i): int', 'Zero bits above the highest one bit.'],
  ['toHexString', '(int i): String', 'Unsigned hexadecimal digits of i.'],
];

const LONG: MemberSpec[] = [
  ['MAX_VALUE', 'long', '9223372036854775807 (2⁶³ − 1).'],
  ['MIN_VALUE', 'long', '-9223372036854775808 (−2⁶³).'],
  ['parseLong', '(String s[, int radix]): long', 'Parses a decimal (or radix) string.'],
  ['valueOf', '(long | String): Long', 'Boxed Long.'],
  ['compare', '(long x, long y): int', 'Overflow-safe comparison for comparators.'],
  ['toString', '(long i[, int radix]): String', 'Decimal (or radix) string of i.'],
  ['bitCount', '(long i): int', 'Number of one bits (popcount).'],
  ['toBinaryString', '(long i): String', 'Unsigned binary digits of i.'],
  ['max', '(long a, long b): long', 'Larger value.'],
  ['min', '(long a, long b): long', 'Smaller value.'],
  ['sum', '(long a, long b): long', 'a + b; handy as Long::sum.'],
];

const DOUBLE: MemberSpec[] = [
  ['MAX_VALUE', 'double', 'Largest finite double, about 1.8e308.'],
  ['MIN_VALUE', 'double', 'Smallest positive double, about 4.9e-324. Not the most negative!'],
  ['POSITIVE_INFINITY', 'double', 'Positive infinity.'],
  ['NEGATIVE_INFINITY', 'double', 'Negative infinity.'],
  ['parseDouble', '(String s): double', 'Parses a decimal string.'],
  ['compare', '(double a, double b): int', 'Total-order comparison for comparators.'],
  ['valueOf', '(double | String): Double', 'Boxed Double.'],
  ['isNaN', '(double v): boolean', 'True if v is NaN.'],
  ['isInfinite', '(double v): boolean', 'True if v is ±infinity.'],
];

const CHARACTER: MemberSpec[] = [
  ['isDigit', '(char c): boolean', 'True for 0-9 (and other Unicode digits).'],
  ['isLetter', '(char c): boolean', 'True for letters.'],
  ['isLetterOrDigit', '(char c): boolean', 'True for letters and digits, e.g. for palindrome checks.'],
  ['isUpperCase', '(char c): boolean', 'True for uppercase letters.'],
  ['isLowerCase', '(char c): boolean', 'True for lowercase letters.'],
  ['toUpperCase', '(char c): char', 'Uppercase form of c.'],
  ['toLowerCase', '(char c): char', 'Lowercase form of c.'],
  ['isWhitespace', '(char c): boolean', 'True for spaces, tabs and line breaks.'],
  ['isAlphabetic', '(int codePoint): boolean', 'True for alphabetic code points.'],
  ['getNumericValue', '(char c): int', "Digit value of c: '7' → 7. Same as c - '0' for 0-9."],
  ['toString', '(char c): String', 'One-character string.'],
  ['compare', '(char x, char y): int', 'Comparison for comparators.'],
  ['MAX_VALUE', 'char', "'\\uffff', the largest char."],
  ['MIN_VALUE', 'char', "'\\u0000', the smallest char."],
];

const STRING: MemberSpec[] = [
  ['valueOf', '(x): String', 'String form of any value, including char[] contents.'],
  ['join', '(CharSequence delim, elements): String', 'Joins strings with a delimiter: String.join(",", list).'],
  ['format', '(String format, Object... args): String', 'printf-style formatting: String.format("%d:%02d", h, m).'],
  ['CASE_INSENSITIVE_ORDER', 'Comparator<String>', 'Comparator ignoring case.'],
];

const LIST_STATIC: MemberSpec[] = [
  ['of', '(E... elements): List<E>', 'Immutable list; nulls not allowed.'],
  ['copyOf', '(Collection<E> coll): List<E>', 'Immutable copy.'],
];

const SET_STATIC: MemberSpec[] = [
  ['of', '(E... elements): Set<E>', 'Immutable set; duplicates throw.'],
  ['copyOf', '(Collection<E> coll): Set<E>', 'Immutable copy.'],
];

const MAP_STATIC: MemberSpec[] = [
  ['of', '(k1, v1, ...): Map<K, V>', 'Immutable map of up to 10 pairs.'],
  ['entry', '(K k, V v): Map.Entry<K, V>', 'Immutable key-value pair; also a handy pair type.'],
  ['ofEntries', '(Map.Entry... entries): Map<K, V>', 'Immutable map from entries.'],
  ['copyOf', '(Map<K, V> map): Map<K, V>', 'Immutable copy.'],
];

const ENTRY_STATIC: MemberSpec[] = [
  ['comparingByValue', '([cmp]): Comparator<Map.Entry>', 'Orders entries by value, e.g. to sort a map’s entries.'],
  ['comparingByKey', '([cmp]): Comparator<Map.Entry>', 'Orders entries by key.'],
];

const COMPARATOR: MemberSpec[] = [
  ['comparingInt', '(T -> int key): Comparator<T>', 'Orders by an int key without overflow: comparingInt(a -> a[0]).'],
  ['comparing', '(T -> key[, cmp]): Comparator<T>', 'Orders by a Comparable key, optionally with a comparator for the key.'],
  ['reverseOrder', '(): Comparator<T>', 'Descending natural order.'],
  ['naturalOrder', '(): Comparator<T>', 'Ascending natural order.'],
  ['comparingLong', '(T -> long key): Comparator<T>', 'Orders by a long key.'],
  ['comparingDouble', '(T -> double key): Comparator<T>', 'Orders by a double key.'],
  ['nullsFirst', '(cmp): Comparator<T>', 'Wraps cmp so nulls sort first.'],
  ['nullsLast', '(cmp): Comparator<T>', 'Wraps cmp so nulls sort last.'],
];

const SYSTEM: MemberSpec[] = [
  ['out', 'PrintStream', 'Standard output: System.out.println(x).'],
  ['err', 'PrintStream', 'Standard error stream.'],
  ['in', 'InputStream', 'Standard input stream.'],
  ['arraycopy', '(src, srcPos, dest, destPos, length): void', 'Fast copy between arrays (or within one).'],
  ['currentTimeMillis', '(): long', 'Wall-clock time in milliseconds.'],
  ['nanoTime', '(): long', 'High-resolution timer for measuring elapsed time.'],
  ['identityHashCode', '(Object o): int', 'Identity-based hash, ignoring hashCode overrides.'],
  ['exit', '(int status): void', 'Terminates the program.'],
];

const PRINT_STREAM: MemberSpec[] = [
  ['println', '([x]): void', 'Prints x (any type) followed by a line break.'],
  ['print', '(x): void', 'Prints x without a line break.'],
  ['printf', '(String format, Object... args): PrintStream', 'Formatted print: printf("%d %s%n", n, s).'],
];

const COLLECTORS: MemberSpec[] = [
  ['toList', '(): Collector', 'Collects into a List.'],
  ['toSet', '(): Collector', 'Collects into a Set.'],
  ['toMap', '(keyFn, valueFn[, mergeFn]): Collector', 'Collects into a Map; duplicate keys throw unless mergeFn is given.'],
  [
    'groupingBy',
    '(classifier[, downstream]): Collector',
    'Map from key to the list (or downstream result) of matching elements.',
  ],
  ['counting', '(): Collector', 'Counts elements, e.g. groupingBy(x -> x, counting()).'],
  ['joining', '([delim[, prefix, suffix]]): Collector', 'Concatenates strings.'],
  ['partitioningBy', '(predicate): Collector', 'Map<Boolean, List<T>> split by the predicate.'],
  ['summingInt', '(T -> int): Collector', 'Sum of an int property.'],
  ['averagingInt', '(T -> int): Collector', 'Average of an int property.'],
  ['mapping', '(mapper, downstream): Collector', 'Maps elements before a downstream collector.'],
  ['toCollection', '(supplier): Collector', 'Collects into a given collection, e.g. TreeSet::new.'],
];

const INT_STREAM_STATIC: MemberSpec[] = [
  ['range', '(int start, int end): IntStream', 'start, start + 1, ..., end - 1.'],
  ['rangeClosed', '(int start, int end): IntStream', 'start, ..., end (inclusive).'],
  ['of', '(int... values): IntStream', 'Stream of the given ints.'],
  ['iterate', '(seed, f): IntStream', 'seed, f(seed), f(f(seed)), ...'],
  ['concat', '(a, b): IntStream', 'a followed by b.'],
];

const STREAM_STATIC: MemberSpec[] = [
  ['of', '(T... values): Stream<T>', 'Stream of the given values.'],
  ['iterate', '(seed, f): Stream<T>', 'seed, f(seed), f(f(seed)), ...'],
  ['generate', '(supplier): Stream<T>', 'Infinite stream of supplier results.'],
  ['concat', '(a, b): Stream<T>', 'a followed by b.'],
  ['empty', '(): Stream<T>', 'Empty stream.'],
];

const OBJECTS: MemberSpec[] = [
  ['equals', '(Object a, Object b): boolean', 'Null-safe equality.'],
  ['hash', '(Object... values): int', 'Combined hash, e.g. for a hashCode override.'],
  ['requireNonNull', '(T obj[, String message]): T', 'Throws NullPointerException if obj is null.'],
  ['isNull', '(Object o): boolean', 'o == null, usable as a method reference.'],
  ['nonNull', '(Object o): boolean', 'o != null, usable as a method reference.'],
  ['hashCode', '(Object o): int', 'Null-safe hashCode (0 for null).'],
  ['toString', '(Object o[, String nullDefault]): String', 'Null-safe toString.'],
];

const OPTIONAL_STATIC: MemberSpec[] = [
  ['of', '(T value): Optional<T>', 'Optional holding a non-null value.'],
  ['ofNullable', '(T value): Optional<T>', 'Empty if value is null.'],
  ['empty', '(): Optional<T>', 'Empty Optional.'],
];

/** Keyed by the receiver as written, so `System.out` and `Map.Entry` work too. */
const STATIC_MEMBERS: Record<string, MemberSpec[]> = {
  Arrays: ARRAYS,
  Collections: COLLECTIONS,
  Math: MATH,
  Integer: INTEGER,
  Long: LONG,
  Double: DOUBLE,
  Character: CHARACTER,
  String: STRING,
  List: LIST_STATIC,
  Set: SET_STATIC,
  Map: MAP_STATIC,
  'Map.Entry': ENTRY_STATIC,
  Entry: ENTRY_STATIC,
  Comparator: COMPARATOR,
  System: SYSTEM,
  'System.out': PRINT_STREAM,
  'System.err': PRINT_STREAM,
  Collectors: COLLECTORS,
  IntStream: INT_STREAM_STATIC,
  Stream: STREAM_STATIC,
  Objects: OBJECTS,
  Optional: OPTIONAL_STATIC,
};

/** Earlier members rank higher; the matcher still prefers better text matches. */
function staticCompletions(specs: MemberSpec[]): Completion[] {
  return specs.map((spec, i) => ({
    label: spec[0],
    detail: spec[1],
    info: spec[2],
    type: memberType(spec),
    boost: Math.max(0, MAX_BOOST - i),
  }));
}

const STATIC_COMPLETIONS = new Map(
  Object.entries(STATIC_MEMBERS).map(([receiver, specs]) => [receiver, staticCompletions(specs)]),
);

// ---------------------------------------------------------------------------------------
// Instance methods, by the type they belong to.
// ---------------------------------------------------------------------------------------

/** `[label, signature, info]`; the signature is everything after the name. */
type MethodSpec = [label: string, signature: string, info: string];

const INSTANCE_METHODS: [typeName: string, methods: MethodSpec[]][] = [
  ['array', [['length', ': int', 'Number of elements: a field, so no parentheses.']]],
  [
    'String',
    [
      ['length', '(): int', 'Number of chars. O(1).'],
      ['charAt', '(int i): char', 'The char at index i. O(1).'],
      ['substring', '(int begin[, int end]): String', 'Copy of [begin, end). O(n): it copies.'],
      ['toCharArray', '(): char[]', 'New char array of the contents, e.g. to sort or mutate.'],
      ['equals', '(Object o): boolean', 'Content equality. Never compare strings with ==.'],
      ['indexOf', '(String | char s[, int from]): int', 'First index of s, or -1.'],
      ['split', '(String regex): String[]', 'Splits around regex matches, e.g. s.split("\\\\s+").'],
      ['isEmpty', '(): boolean', 'True if length() == 0.'],
      ['contains', '(CharSequence s): boolean', 'True if s occurs anywhere.'],
      ['startsWith', '(String prefix): boolean', 'True if the string starts with prefix.'],
      ['endsWith', '(String suffix): boolean', 'True if the string ends with suffix.'],
      ['trim', '(): String', 'Strips leading and trailing whitespace.'],
      ['toLowerCase', '(): String', 'Lowercase copy.'],
      ['toUpperCase', '(): String', 'Uppercase copy.'],
      ['compareTo', '(String o): int', 'Lexicographic comparison: negative, zero or positive.'],
      ['replace', '(old, replacement): String', 'Replaces every occurrence of a char or literal string.'],
      ['lastIndexOf', '(String | char s): int', 'Last index of s, or -1.'],
      ['chars', '(): IntStream', 'Stream of the chars as ints.'],
      ['repeat', '(int n): String', 'The string repeated n times.'],
      ['strip', '(): String', 'Unicode-aware trim.'],
      ['equalsIgnoreCase', '(String o): boolean', 'Equality ignoring case.'],
      ['isBlank', '(): boolean', 'True if empty or only whitespace.'],
      ['matches', '(String regex): boolean', 'True if the whole string matches regex.'],
      ['hashCode', '(): int', 'Content-based hash.'],
    ],
  ],
  [
    'StringBuilder',
    [
      ['append', '(x): StringBuilder', 'Appends any value. Amortized O(1) per char.'],
      ['toString', '(): String', 'The built string.'],
      ['length', '(): int', 'Number of chars.'],
      ['charAt', '(int i): char', 'The char at index i.'],
      ['reverse', '(): StringBuilder', 'Reverses the contents in place.'],
      ['insert', '(int offset, x): StringBuilder', 'Inserts at offset. O(n): shifts the rest.'],
      ['deleteCharAt', '(int i): StringBuilder', 'Removes one char: O(1) at the end, O(n) elsewhere.'],
      ['setCharAt', '(int i, char c): void', 'Replaces the char at index i.'],
      ['setLength', '(int n): void', 'Truncates to n chars; setLength(length() - 1) drops the last one.'],
      ['indexOf', '(String s): int', 'First index of s, or -1.'],
      ['delete', '(int start, int end): StringBuilder', 'Removes [start, end).'],
      ['replace', '(int start, int end, String s): StringBuilder', 'Replaces [start, end) with s.'],
    ],
  ],
  [
    'List',
    [
      ['add', '([int i, ]E e): boolean', 'Appends (amortized O(1)) or inserts at index i (O(n)).'],
      ['get', '(int i): E', 'Element at index i: O(1) for ArrayList, O(n) for LinkedList.'],
      ['set', '(int i, E e): E', 'Replaces the element at i and returns the old one.'],
      ['size', '(): int', 'Number of elements.'],
      ['isEmpty', '(): boolean', 'True if there are no elements.'],
      [
        'remove',
        '(int i | Object o): E | boolean',
        'remove(int) removes by index; remove(Integer.valueOf(x)) removes by value. O(n).',
      ],
      ['contains', '(Object o): boolean', 'Linear search. O(n).'],
      ['indexOf', '(Object o): int', 'First index of o, or -1. O(n).'],
      ['addAll', '(Collection c): boolean', 'Appends every element of c.'],
      ['clear', '(): void', 'Removes every element.'],
      ['sort', '(Comparator c): void', 'Stable in-place sort; null means natural order.'],
      ['subList', '(int from, int to): List<E>', 'View of [from, to), backed by the list.'],
      ['stream', '(): Stream<E>', 'Stream over the elements.'],
      ['forEach', '(Consumer action): void', 'Runs action on each element.'],
      ['iterator', '(): Iterator<E>', 'Iterator over the elements.'],
      ['removeIf', '(Predicate filter): boolean', 'Removes every element matching filter.'],
      ['toArray', '([T[] a]): T[]', 'Copy as an array: list.toArray(new String[0]).'],
      ['lastIndexOf', '(Object o): int', 'Last index of o, or -1.'],
      ['equals', '(Object o): boolean', 'Same elements in the same order.'],
    ],
  ],
  [
    'Map',
    [
      ['put', '(K k, V v): V', 'Inserts or replaces; returns the previous value or null. O(1) average for HashMap.'],
      ['get', '(Object k): V', 'Value for k, or null if absent.'],
      ['getOrDefault', '(Object k, V fallback): V', 'Counting idiom: map.put(x, map.getOrDefault(x, 0) + 1).'],
      ['containsKey', '(Object k): boolean', 'True if k has a mapping. O(1) average for HashMap.'],
      ['merge', '(K k, V v, BiFunction f): V', 'Counting in one call: map.merge(x, 1, Integer::sum).'],
      ['putIfAbsent', '(K k, V v): V', 'Inserts only if k is absent.'],
      ['computeIfAbsent', '(K k, Function f): V', 'Grouping idiom: map.computeIfAbsent(k, x -> new ArrayList<>()).add(v).'],
      ['remove', '(Object k): V', 'Removes k and returns its value, or null.'],
      ['keySet', '(): Set<K>', 'View of the keys.'],
      ['values', '(): Collection<V>', 'View of the values.'],
      ['entrySet', '(): Set<Map.Entry<K, V>>', 'View of the pairs: for (var e : map.entrySet()).'],
      ['size', '(): int', 'Number of mappings.'],
      ['isEmpty', '(): boolean', 'True if there are no mappings.'],
      ['containsValue', '(Object v): boolean', 'True if any key maps to v. O(n).'],
      ['compute', '(K k, BiFunction f): V', 'Replaces the value with f(k, oldValue); null removes it.'],
      ['computeIfPresent', '(K k, BiFunction f): V', 'Like compute, only when k is present.'],
      ['forEach', '(BiConsumer action): void', 'Runs action on each (key, value).'],
      ['clear', '(): void', 'Removes every mapping.'],
    ],
  ],
  [
    'TreeMap',
    [
      ['firstKey', '(): K', 'Smallest key; throws if empty. O(log n).'],
      ['lastKey', '(): K', 'Largest key; throws if empty. O(log n).'],
      ['floorKey', '(K k): K', 'Greatest key ≤ k, or null. O(log n).'],
      ['ceilingKey', '(K k): K', 'Least key ≥ k, or null. O(log n).'],
      ['lowerKey', '(K k): K', 'Greatest key < k, or null. O(log n).'],
      ['higherKey', '(K k): K', 'Least key > k, or null. O(log n).'],
      ['firstEntry', '(): Map.Entry<K, V>', 'Entry with the smallest key, or null.'],
      ['lastEntry', '(): Map.Entry<K, V>', 'Entry with the largest key, or null.'],
      ['pollFirstEntry', '(): Map.Entry<K, V>', 'Removes and returns the smallest entry, or null.'],
      ['pollLastEntry', '(): Map.Entry<K, V>', 'Removes and returns the largest entry, or null.'],
      ['floorEntry', '(K k): Map.Entry<K, V>', 'Entry with the greatest key ≤ k, or null.'],
      ['ceilingEntry', '(K k): Map.Entry<K, V>', 'Entry with the least key ≥ k, or null.'],
      ['headMap', '(K to): SortedMap<K, V>', 'View of keys < to.'],
      ['tailMap', '(K from): SortedMap<K, V>', 'View of keys ≥ from.'],
      ['subMap', '(K from, K to): SortedMap<K, V>', 'View of keys in [from, to).'],
      ['descendingMap', '(): NavigableMap<K, V>', 'Reverse-order view.'],
    ],
  ],
  [
    'Map.Entry',
    [
      ['getKey', '(): K', 'The key.'],
      ['getValue', '(): V', 'The value.'],
      ['setValue', '(V v): V', 'Replaces the value in the map.'],
    ],
  ],
  [
    'Set',
    [
      ['add', '(E e): boolean', 'Adds e if absent; false if it was already present.'],
      ['contains', '(Object o): boolean', 'Membership: O(1) average for HashSet, O(log n) for TreeSet.'],
      ['remove', '(Object o): boolean', 'Removes o; false if it was absent.'],
      ['size', '(): int', 'Number of elements.'],
      ['isEmpty', '(): boolean', 'True if there are no elements.'],
      ['addAll', '(Collection c): boolean', 'Union, in place.'],
      ['retainAll', '(Collection c): boolean', 'Intersection, in place.'],
      ['removeAll', '(Collection c): boolean', 'Difference, in place.'],
      ['containsAll', '(Collection c): boolean', 'Subset test.'],
      ['clear', '(): void', 'Removes every element.'],
      ['stream', '(): Stream<E>', 'Stream over the elements.'],
      ['iterator', '(): Iterator<E>', 'Iterator over the elements.'],
    ],
  ],
  [
    'TreeSet',
    [
      ['first', '(): E', 'Smallest element; throws if empty. O(log n).'],
      ['last', '(): E', 'Largest element; throws if empty. O(log n).'],
      ['floor', '(E e): E', 'Greatest element ≤ e, or null. O(log n).'],
      ['ceiling', '(E e): E', 'Least element ≥ e, or null. O(log n).'],
      ['lower', '(E e): E', 'Greatest element < e, or null. O(log n).'],
      ['higher', '(E e): E', 'Least element > e, or null. O(log n).'],
      ['pollFirst', '(): E', 'Removes and returns the smallest element, or null.'],
      ['pollLast', '(): E', 'Removes and returns the largest element, or null.'],
      ['headSet', '(E to): SortedSet<E>', 'View of elements < to.'],
      ['tailSet', '(E from): SortedSet<E>', 'View of elements ≥ from.'],
      ['subSet', '(E from, E to): SortedSet<E>', 'View of elements in [from, to).'],
      ['descendingSet', '(): NavigableSet<E>', 'Reverse-order view.'],
    ],
  ],
  [
    'Deque',
    [
      ['push', '(E e): void', 'Stack push onto the front. O(1).'],
      ['pop', '(): E', 'Stack pop from the front; throws if empty. O(1).'],
      ['peek', '(): E', 'Front element, or null if empty.'],
      ['offer', '(E e): boolean', 'Queue enqueue at the back. O(1).'],
      ['poll', '(): E', 'Queue dequeue from the front, or null if empty. O(1).'],
      ['offerFirst', '(E e): boolean', 'Adds at the front.'],
      ['offerLast', '(E e): boolean', 'Adds at the back.'],
      ['pollFirst', '(): E', 'Removes from the front, or null if empty.'],
      ['pollLast', '(): E', 'Removes from the back, or null if empty.'],
      ['peekFirst', '(): E', 'Front element, or null if empty.'],
      ['peekLast', '(): E', 'Back element, or null if empty.'],
      ['addFirst', '(E e): void', 'Adds at the front.'],
      ['addLast', '(E e): void', 'Adds at the back.'],
      ['removeFirst', '(): E', 'Removes from the front; throws if empty.'],
      ['removeLast', '(): E', 'Removes from the back; throws if empty.'],
      ['getFirst', '(): E', 'Front element; throws if empty.'],
      ['getLast', '(): E', 'Back element; throws if empty.'],
      ['isEmpty', '(): boolean', 'True if there are no elements.'],
      ['size', '(): int', 'Number of elements.'],
      ['descendingIterator', '(): Iterator<E>', 'Iterates from back to front.'],
    ],
  ],
  [
    'Queue',
    [
      ['offer', '(E e): boolean', 'Enqueues at the back.'],
      ['poll', '(): E', 'Dequeues the head, or null if empty.'],
      ['peek', '(): E', 'The head, or null if empty.'],
      ['add', '(E e): boolean', 'Enqueues; throws if a bounded queue is full.'],
      ['remove', '(): E', 'Dequeues the head; throws if empty.'],
      ['element', '(): E', 'The head; throws if empty.'],
      ['isEmpty', '(): boolean', 'True if there are no elements.'],
      ['size', '(): int', 'Number of elements.'],
    ],
  ],
  [
    'PriorityQueue',
    [
      ['offer', '(E e): boolean', 'Inserts. O(log n).'],
      ['poll', '(): E', 'Removes the smallest element by the comparator, or null. O(log n).'],
      ['peek', '(): E', 'The smallest element, or null. O(1).'],
      ['add', '(E e): boolean', 'Inserts. O(log n).'],
      ['size', '(): int', 'Number of elements.'],
      ['isEmpty', '(): boolean', 'True if there are no elements.'],
      ['remove', '(Object o): boolean', 'Removes one occurrence of o. O(n).'],
      ['contains', '(Object o): boolean', 'Linear search. O(n).'],
      ['clear', '(): void', 'Removes every element.'],
    ],
  ],
  [
    'Iterator',
    [
      ['hasNext', '(): boolean', 'True if more elements remain.'],
      ['next', '(): E', 'The next element.'],
      ['remove', '(): void', 'Removes the last element returned by next().'],
    ],
  ],
  [
    'Optional',
    [
      ['isPresent', '(): boolean', 'True if a value is present.'],
      ['get', '(): T', 'The value; throws if empty.'],
      ['orElse', '(T other): T', 'The value, or other if empty.'],
      ['ifPresent', '(Consumer action): void', 'Runs action on the value if present.'],
      ['isEmpty', '(): boolean', 'True if no value is present.'],
      ['orElseThrow', '(): T', 'The value; throws NoSuchElementException if empty.'],
      ['orElseGet', '(Supplier s): T', 'The value, or s.get() if empty.'],
      ['map', '(Function f): Optional<U>', 'Transforms the value if present.'],
      ['filter', '(Predicate p): Optional<T>', 'Empty unless the value matches p.'],
    ],
  ],
  [
    'Stream',
    [
      ['map', '(Function f): Stream<R>', 'Transforms each element.'],
      ['filter', '(Predicate p): Stream<T>', 'Keeps elements matching p.'],
      ['collect', '(Collector c): R', 'Terminal: gathers into a collection, e.g. collect(Collectors.toList()).'],
      ['toList', '(): List<T>', 'Terminal: unmodifiable list of the elements.'],
      ['forEach', '(Consumer action): void', 'Terminal: runs action on each element.'],
      ['mapToInt', '(T -> int): IntStream', 'Maps to an IntStream, e.g. for sum().'],
      ['sorted', '([Comparator c]): Stream<T>', 'Sorted stream.'],
      ['distinct', '(): Stream<T>', 'Drops duplicates.'],
      ['count', '(): long', 'Terminal: number of elements.'],
      ['reduce', '(identity, BinaryOperator op): T', 'Terminal: folds the elements.'],
      ['max', '(Comparator c): Optional<T>', 'Terminal: largest element.'],
      ['min', '(Comparator c): Optional<T>', 'Terminal: smallest element.'],
      ['anyMatch', '(Predicate p): boolean', 'Terminal: true if any element matches.'],
      ['allMatch', '(Predicate p): boolean', 'Terminal: true if every element matches.'],
      ['noneMatch', '(Predicate p): boolean', 'Terminal: true if no element matches.'],
      ['findFirst', '(): Optional<T>', 'Terminal: first element.'],
      ['limit', '(long n): Stream<T>', 'At most the first n elements.'],
      ['skip', '(long n): Stream<T>', 'Drops the first n elements.'],
      ['flatMap', '(Function f): Stream<R>', 'Maps each element to a stream and concatenates them.'],
      ['toArray', '([generator]): Object[]', 'Terminal: array of the elements, e.g. toArray(String[]::new).'],
    ],
  ],
  [
    'IntStream',
    [
      ['sum', '(): int', 'Terminal: sum of the elements.'],
      ['max', '(): OptionalInt', 'Terminal: largest element; getAsInt() unwraps it.'],
      ['min', '(): OptionalInt', 'Terminal: smallest element; getAsInt() unwraps it.'],
      ['average', '(): OptionalDouble', 'Terminal: mean of the elements.'],
      ['boxed', '(): Stream<Integer>', 'Boxes to a Stream<Integer>, e.g. before collect.'],
      ['mapToObj', '(int -> T): Stream<T>', 'Maps each int to an object.'],
      ['toArray', '(): int[]', 'Terminal: int array of the elements.'],
    ],
  ],
];

/** Interview staples, most common first, ranked above the rest after an unknown `.`. */
const INSTANCE_PRIORITY = [
  'length',
  'size',
  'get',
  'add',
  'put',
  'charAt',
  'getOrDefault',
  'containsKey',
  'contains',
  'isEmpty',
  'append',
  'toString',
  'equals',
  'offer',
  'poll',
  'peek',
  'push',
  'pop',
  'remove',
  'set',
  'substring',
  'toCharArray',
  'sort',
  'merge',
  'computeIfAbsent',
  'keySet',
  'values',
  'entrySet',
  'getKey',
  'getValue',
  'stream',
  'indexOf',
  'reverse',
  'addAll',
  'clear',
  'split',
  'hasNext',
  'next',
  'pollFirst',
  'pollLast',
  'peekFirst',
  'peekLast',
  'offerFirst',
  'offerLast',
];

/**
 * Renders info as one block per distinct signature, so a merged entry like `remove` explains
 * each variant. Only runs in the browser, when the info panel opens.
 */
function infoPanel(groups: { heading: string; text: string }[]): () => Node {
  return () => {
    const dom = document.createElement('div');
    groups.forEach(({ heading, text }, i) => {
      const head = document.createElement('div');
      head.style.fontFamily = 'var(--font-mono, monospace)';
      if (i > 0) head.style.marginTop = '0.5em';
      head.textContent = heading;
      const body = document.createElement('div');
      body.textContent = text;
      dom.append(head, body);
    });
    return dom;
  };
}

/** Shows the first few owning types, e.g. "List, Set, Map +4". */
function typeList(types: string[]): string {
  return types.length > 3 ? `${types.slice(0, 3).join(', ')} +${types.length - 3}` : types.join(', ');
}

/** One completion per method name, listing every type that has it. */
function buildInstanceCompletions(): Completion[] {
  const byLabel = new Map<string, { types: string[]; groups: Map<string, { types: string[]; text: string }> }>();
  for (const [typeName, methods] of INSTANCE_METHODS) {
    for (const [label, signature, text] of methods) {
      let entry = byLabel.get(label);
      if (!entry) byLabel.set(label, (entry = { types: [], groups: new Map() }));
      entry.types.push(typeName);
      // Variants with the same signature and text share one block.
      const key = `${signature}\n${text}`;
      const group = entry.groups.get(key);
      if (group) group.types.push(typeName);
      else entry.groups.set(key, { types: [typeName], text });
    }
  }

  return [...byLabel].map(([label, { types, groups }]) => {
    const rank = INSTANCE_PRIORITY.indexOf(label);
    const blocks = [...groups].map(([key, group]) => ({
      heading: `${group.types.join(', ')}: ${label}${key.slice(0, key.indexOf('\n'))}`,
      text: group.text,
    }));
    return {
      label,
      type: label === 'length' ? 'property' : 'method',
      detail: typeList(types),
      info: infoPanel(blocks),
      boost: rank === -1 ? 0 : INSTANCE_PRIORITY.length - rank,
    };
  });
}

const INSTANCE_COMPLETIONS = buildInstanceCompletions();

// ---------------------------------------------------------------------------------------
// Plain words: keywords, types and snippets.
// ---------------------------------------------------------------------------------------

const KEYWORDS: Completion[] = (
  'int long double boolean char byte short float void ' +
  'if else for while do switch case default break continue return new ' +
  'public private protected static final abstract class interface enum record extends implements ' +
  'this super null true false var import package try catch finally throw throws instanceof ' +
  'yield assert synchronized'
)
  .split(' ')
  .map((label) => ({ label, type: 'keyword' }));

/** Most-used types first; the first tier gets a small boost over the rest. */
const COMMON_TYPES = (
  'String Integer List ArrayList Map HashMap Set HashSet Arrays Collections Math System ' +
  'StringBuilder Deque ArrayDeque PriorityQueue Queue LinkedList TreeMap TreeSet Character ' +
  'Long Double Comparator Boolean Object Objects Optional Iterator LinkedHashMap LinkedHashSet ' +
  'Stack Collectors Stream IntStream Map.Entry Record Exception RuntimeException ' +
  'IllegalArgumentException IllegalStateException UnsupportedOperationException'
).split(' ');
const TOP_TIER_TYPES = 16;

const TYPE_COMPLETIONS: Completion[] = COMMON_TYPES.map((label, i) => ({
  label,
  type: 'class',
  boost: i < TOP_TIER_TYPES ? 2 : 1,
}));

const SNIPPETS: Completion[] = [
  snippetCompletion('System.out.println(${});', {
    label: 'sout',
    type: 'keyword',
    detail: 'System.out.println(…)',
    info: 'Prints a line to standard output.',
    boost: 3,
  }),
  snippetCompletion('for (int ${i} = 0; ${i} < ${n}; ${i}++) {\n\t${}\n}', {
    label: 'fori',
    type: 'keyword',
    detail: 'for (int i = 0; i < n; i++)',
    info: 'Indexed for loop.',
    boost: 1,
  }),
  snippetCompletion('for (${var} ${x} : ${items}) {\n\t${}\n}', {
    label: 'foreach',
    type: 'keyword',
    detail: 'for (var x : items)',
    info: 'Enhanced for loop over an array or Iterable.',
    boost: 1,
  }),
  snippetCompletion('public static void main(String[] args) {\n\t${}\n}', {
    label: 'main',
    type: 'keyword',
    detail: 'public static void main(String[] args)',
    info: 'Program entry point.',
    boost: 1,
  }),
];

// ---------------------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------------------

const NO_COMPLETION_NODES = new Set(['LineComment', 'BlockComment', 'StringLiteral', 'TextBlock', 'CharacterLiteral']);

/** True for `//` comments and open string/char literals that the parser may not close yet. */
function lineEndsInCommentOrString(lineBefore: string): boolean {
  let quote: string | null = null;
  for (let i = 0; i < lineBefore.length; i++) {
    const ch = lineBefore[i];
    if (quote) {
      if (ch === '\\') i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '/' && lineBefore[i + 1] === '/') {
      return true;
    }
  }
  return quote !== null;
}

function inCommentOrString(state: EditorState, pos: number): boolean {
  if (NO_COMPLETION_NODES.has(syntaxTree(state).resolveInner(pos, -1).name)) return true;
  const line = state.doc.lineAt(pos);
  return lineEndsInCommentOrString(line.text.slice(0, pos - line.from));
}

const DECLARATION_TYPES: Record<string, Completion['type']> = {
  ClassDeclaration: 'class',
  InterfaceDeclaration: 'class',
  EnumDeclaration: 'class',
  RecordDeclaration: 'class',
  TypeParameter: 'class',
  MethodDeclaration: 'method',
  EnumConstant: 'constant',
};

/** Names declared in the document (classes, methods, fields, locals, parameters). */
function declaredNames(state: EditorState, excludeFrom: number): Completion[] {
  const seen = new Set<string>();
  const names: Completion[] = [];
  syntaxTree(state).iterate({
    enter(node) {
      // Skip the name being typed right now.
      if (node.name !== 'Definition' || node.from === excludeFrom) return;
      const label = state.doc.sliceString(node.from, node.to);
      if (seen.has(label)) return;
      seen.add(label);
      const parent = node.node.parent?.name ?? '';
      names.push({ label, type: DECLARATION_TYPES[parent] ?? 'variable', boost: 5 });
    },
  });
  return names;
}

const IDENTIFIER = /^[\w$]*$/;

/** The receiver before a `.` or `::`, e.g. `System.out` in `System.out.pr`; null for `foo().`. */
function receiverBefore(textBefore: string): string | null {
  const match = /([A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*)\s*$/.exec(textBefore);
  return match ? match[1].replace(/\s+/g, '') : null;
}

/** Longest known class path at the end of the receiver: `java.util.Arrays` → `Arrays`. */
function staticMembersFor(receiver: string): Completion[] | undefined {
  const parts = receiver.split('.');
  for (let i = 0; i < parts.length; i++) {
    const members = STATIC_COMPLETIONS.get(parts.slice(i).join('.'));
    if (members) return members;
  }
  return undefined;
}

export const javaCompletions: CompletionSource = (context: CompletionContext): CompletionResult | null => {
  if (inCommentOrString(context.state, context.pos)) return null;

  // Member access and method references: `Arrays.so`, `System.out.`, `list.ad`, `Integer::`
  const member = context.matchBefore(/(?:\.|::)[\w$]*$/);
  if (member) {
    const separator = member.text.startsWith('::') ? 2 : 1;
    const line = context.state.doc.lineAt(member.from);
    const textBefore = line.text.slice(0, member.from - line.from);
    // `1.` starts a floating-point literal, not a member access.
    if (separator === 1 && /(?:^|[^\w$])\d\w*$/.test(textBefore)) return null;
    const receiver = receiverBefore(textBefore);
    return {
      from: member.from + separator,
      options: (receiver && staticMembersFor(receiver)) || INSTANCE_COMPLETIONS,
      validFor: IDENTIFIER,
    };
  }

  const word = context.matchBefore(/[A-Za-z_$][\w$]*$/);
  if (!word && !context.explicit) return null;
  const from = word ? word.from : context.pos;

  const options: Completion[] = [];
  const seen = new Set<string>();
  for (const option of [...declaredNames(context.state, from), ...SNIPPETS, ...TYPE_COMPLETIONS, ...KEYWORDS]) {
    if (seen.has(option.label)) continue;
    seen.add(option.label);
    options.push(option);
  }
  return { from, options, validFor: IDENTIFIER };
};
