/**
 * The first program a fresh TeaVM compiler instance compiles.
 *
 * teavm-javac keeps state between compiles, and a later program that reaches library code
 * the earlier ones never touched can crash it ("array element access out of bounds"), for
 * example the double formatting in the test harness after a Run that printed only strings.
 * Compiling a submit-mode program that touches the library code lessons commonly use, right
 * after the instance starts, keeps later compiles away from that bug. TeaVMCompiler still
 * recovers if a crash happens anyway.
 */

import { buildProgram, type Program } from '../grading/program.ts';

const SOURCE = `import java.util.*;
import java.util.function.*;
import java.util.stream.*;

record Pair(String name, int value) {}

public class Main {
    public static void main(String[] args) {
        List<Pair> pairs = new ArrayList<>(List.of(new Pair("b", 2), new Pair("a", 1)));
        pairs.sort(Comparator.comparingInt(Pair::value).thenComparing(Pair::name, Comparator.reverseOrder()));
        Map<String, Integer> counts = new HashMap<>();
        for (Pair p : pairs) counts.merge(p.name(), p.value(), Integer::sum);
        TreeMap<String, List<Integer>> groups = new TreeMap<>();
        groups.computeIfAbsent("x", k -> new ArrayList<>()).add(1);
        TreeSet<Integer> sorted = new TreeSet<>(Set.of(3, 1, 2));
        PriorityQueue<int[]> heap = new PriorityQueue<>((a, b) -> Integer.compare(b[0], a[0]));
        heap.offer(new int[]{1, 2});
        Deque<Character> stack = new ArrayDeque<>();
        stack.push('c');
        Set<Long> seen = new LinkedHashSet<>(List.of(1L, 2L));
        String joined = IntStream.rangeClosed(1, 3).boxed().map(String::valueOf).collect(Collectors.joining(","));
        Map<Integer, Long> byLength = Stream.of("a", "bb").collect(Collectors.groupingBy(String::length, Collectors.counting()));
        StringBuilder sb = new StringBuilder().append(1.5).append(2.5f).append('c').append(3L).reverse();
        Object any = pairs.get(0);
        String kind = switch (any) {
            case Pair(String name, int value) when value > 1 -> name;
            case Pair p -> p.toString();
            default -> "other";
        };
        System.out.println(String.format("%.2f %5d %s %b", Math.sqrt(2.0), 42, kind, Double.isNaN(0.0 / 0.0))
            + counts + groups + sorted + heap.peek()[0] + stack.peek() + seen + joined + byLength + sb
            + Arrays.toString(new double[]{1.0}) + Arrays.deepToString(new int[][]{{1}})
            + Optional.of(1).map(x -> x + 1).orElse(0) + Objects.hash(1, 2) + Character.isDigit('1')
            + Integer.parseInt("7") + Long.MAX_VALUE + Math.floorMod(-1, 3) + Double.compare(1.0, 2.0));
    }
}
`;

export const WARMUP_PROGRAM: Program = buildProgram({
  mode: 'submit',
  source: SOURCE,
  tests: [
    {
      name: 'warm-up',
      call: 'main',
      code: `t.equal(List.of(1.5, 2.0), List.of(1.5, 2.0));
t.unordered(new int[]{2, 1}, new int[]{1, 2});
t.check(new TreeMap<>(Map.of(1, 2.5)).firstKey() == 1, "warm-up");
Main.main(new String[0]);`,
    },
  ],
});
