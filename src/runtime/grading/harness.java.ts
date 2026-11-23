/**
 * Java source compiled next to the learner's `Main.java` on every run.
 *
 * `__Harness` reports to the page through framed events on the real standard output:
 * EVENT_START + JSON + EVENT_END. JSON escapes every control character, so a frame
 * never contains the delimiters, and the learner's own output between frames is kept
 * byte for byte (no newline bookkeeping). See `events.ts` for the reading side.
 *
 * It must compile with both TeaVM's class library and a real JDK (`--release 21`):
 * no reflection, no APIs TeaVM lacks.
 */
export const HARNESS_JAVA = String.raw`import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.io.UnsupportedEncodingException;
import java.util.*;

final class __Harness {
    private static final PrintStream OUT = System.out;
    private static final PrintStream ERR = System.err;
    private static final String USER_FILE = "Main.java";
    private static final int MAX_CAPTURE = 4000;
    private static final int MAX_SHOW = 600;
    private static final int MAX_FRAMES = 12;

    private __Harness() {}

    interface Test {
        void run(__T t) throws Throwable;
    }

    /** Reports an exception that escaped the learner's main(). */
    static void uncaught(Throwable e) {
        System.out.flush();
        emit("{\"e\":\"exception\"," + throwableJson(e) + "}");
    }

    /** Runs one hidden test, capturing what the learner's code prints while it runs. */
    static void test(int index, Test body) {
        emit("{\"e\":\"start\",\"i\":" + index + "}");
        ByteArrayOutputStream captured = new ByteArrayOutputStream();
        PrintStream capture;
        try {
            capture = new PrintStream(captured, true, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new IllegalStateException(e);
        }
        System.setOut(capture);
        System.setErr(capture);
        __T t = new __T();
        String error = null;
        try {
            body.run(t);
        } catch (Throwable e) {
            error = throwableJson(e);
        } finally {
            capture.flush();
            System.setOut(OUT);
            System.setErr(ERR);
        }
        String stdout;
        try {
            stdout = captured.toString("UTF-8");
        } catch (UnsupportedEncodingException e) {
            stdout = "";
        }
        if (stdout.length() > MAX_CAPTURE) stdout = stdout.substring(0, MAX_CAPTURE) + "\n…";
        StringBuilder json = new StringBuilder("{\"e\":\"result\",\"i\":").append(index);
        json.append(",\"passed\":").append(error == null && t.passed);
        if (t.actual != null) json.append(",\"actual\":").append(quote(t.actual));
        if (t.expected != null) json.append(",\"expected\":").append(quote(t.expected));
        if (t.message != null) json.append(",\"message\":").append(quote(t.message));
        if (error != null) json.append(",").append(error);
        if (!stdout.isEmpty()) json.append(",\"stdout\":").append(quote(stdout));
        emit(json.append("}").toString());
    }

    static void done() {
        emit("{\"e\":\"done\"}");
    }

    private static void emit(String json) {
        OUT.print("\u001E" + json + "\u001F");
        OUT.flush();
    }

    /** "exception":"java.lang.Foo","detail":"...","trace":[["Solution.method",12],...] */
    private static String throwableJson(Throwable e) {
        StringBuilder json = new StringBuilder("\"exception\":").append(quote(e.getClass().getName()));
        if (e.getMessage() != null) json.append(",\"detail\":").append(quote(e.getMessage()));
        json.append(",\"trace\":[");
        int frames = 0;
        for (StackTraceElement frame : e.getStackTrace()) {
            if (!USER_FILE.equals(frame.getFileName())) continue;
            if (frames == MAX_FRAMES) break;
            if (frames++ > 0) json.append(',');
            json.append('[').append(quote(frame.getClassName() + "." + frame.getMethodName()))
                .append(',').append(frame.getLineNumber()).append(']');
        }
        return json.append(']').toString();
    }

    static String quote(String s) {
        StringBuilder sb = new StringBuilder(s.length() + 2).append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                default -> {
                    if (c < 0x20 || c == 0x7F || (c >= 0x2028 && c <= 0x2029)) {
                        String hex = Integer.toHexString(c);
                        sb.append("\\u").append("0000", hex.length(), 4).append(hex);
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        return sb.append('"').toString();
    }

    // ---- Showing values -------------------------------------------------------------------

    /** Java-like text for a value: strings and chars quoted, arrays and collections expanded. */
    static String show(Object value) {
        StringBuilder sb = new StringBuilder();
        show(value, sb);
        if (sb.length() > MAX_SHOW) return sb.substring(0, MAX_SHOW) + "…";
        return sb.toString();
    }

    private static void show(Object v, StringBuilder sb) {
        if (sb.length() > MAX_SHOW) return;
        if (v == null) sb.append("null");
        else if (v instanceof String s) sb.append(quote(s));
        else if (v instanceof Character c) sb.append('\'').append(c).append('\'');
        else if (v instanceof Long l) sb.append(l).append('L');
        else if (v instanceof Float f) sb.append(f).append('f');
        else if (v instanceof int[] a) showAll(boxed(a), sb, "[", "]");
        else if (v instanceof long[] a) showAll(boxed(a), sb, "[", "]");
        else if (v instanceof double[] a) showAll(boxed(a), sb, "[", "]");
        else if (v instanceof char[] a) showAll(boxed(a), sb, "[", "]");
        else if (v instanceof boolean[] a) showAll(boxed(a), sb, "[", "]");
        else if (v instanceof Object[] a) showAll(Arrays.asList(a), sb, "[", "]");
        else if (v instanceof Map<?, ?> m) {
            sb.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> entry : m.entrySet()) {
                if (!first) sb.append(", ");
                first = false;
                show(entry.getKey(), sb);
                sb.append('=');
                show(entry.getValue(), sb);
            }
            sb.append('}');
        } else if (v instanceof Collection<?> c) showAll(c, sb, "[", "]");
        else sb.append(v);
    }

    private static void showAll(Iterable<?> items, StringBuilder sb, String open, String close) {
        sb.append(open);
        boolean first = true;
        for (Object item : items) {
            if (!first) sb.append(", ");
            first = false;
            show(item, sb);
        }
        sb.append(close);
    }

    // ---- Comparing values -----------------------------------------------------------------

    /**
     * Structural equality: arrays by content, lists and other sequences in order, sets and
     * maps by membership. Boxed numbers must match in type too (1 is not 1L), as in Java.
     */
    static boolean same(Object a, Object b) {
        if (a == b) return true;
        if (a == null || b == null) return false;
        if (a instanceof int[] x) return b instanceof int[] y && Arrays.equals(x, y);
        if (a instanceof long[] x) return b instanceof long[] y && Arrays.equals(x, y);
        if (a instanceof double[] x) return b instanceof double[] y && Arrays.equals(x, y);
        if (a instanceof char[] x) return b instanceof char[] y && Arrays.equals(x, y);
        if (a instanceof boolean[] x) return b instanceof boolean[] y && Arrays.equals(x, y);
        if (a instanceof Object[] x) return b instanceof Object[] y && sameSequence(Arrays.asList(x), Arrays.asList(y));
        if (a instanceof Set<?> x) return b instanceof Set<?> y && x.equals(y);
        if (a instanceof Map<?, ?> x) {
            if (!(b instanceof Map<?, ?> y) || x.size() != y.size()) return false;
            for (Map.Entry<?, ?> entry : x.entrySet()) {
                if (!y.containsKey(entry.getKey()) || !same(entry.getValue(), y.get(entry.getKey()))) return false;
            }
            return true;
        }
        if (a instanceof Collection<?> x) return b instanceof Collection<?> y && !(b instanceof Set<?>) && sameSequence(x, y);
        return a.equals(b);
    }

    private static boolean sameSequence(Collection<?> a, Collection<?> b) {
        if (a.size() != b.size()) return false;
        Iterator<?> ia = a.iterator();
        Iterator<?> ib = b.iterator();
        while (ia.hasNext()) {
            if (!same(ia.next(), ib.next())) return false;
        }
        return true;
    }

    /** The elements of an array or collection, for order-insensitive comparison. */
    static List<Object> elements(Object v) {
        if (v instanceof int[] a) return new ArrayList<>(boxed(a));
        if (v instanceof long[] a) return new ArrayList<>(boxed(a));
        if (v instanceof double[] a) return new ArrayList<>(boxed(a));
        if (v instanceof char[] a) return new ArrayList<>(boxed(a));
        if (v instanceof boolean[] a) return new ArrayList<>(boxed(a));
        if (v instanceof Object[] a) return new ArrayList<>(Arrays.asList(a));
        if (v instanceof Collection<?> c) return new ArrayList<>(c);
        return null;
    }

    static String typeName(Object v) {
        return v == null ? "null" : v.getClass().getSimpleName();
    }

    private static List<Object> boxed(int[] a) { List<Object> r = new ArrayList<>(); for (int x : a) r.add(x); return r; }
    private static List<Object> boxed(long[] a) { List<Object> r = new ArrayList<>(); for (long x : a) r.add(x); return r; }
    private static List<Object> boxed(double[] a) { List<Object> r = new ArrayList<>(); for (double x : a) r.add(x); return r; }
    private static List<Object> boxed(char[] a) { List<Object> r = new ArrayList<>(); for (char x : a) r.add(x); return r; }
    private static List<Object> boxed(boolean[] a) { List<Object> r = new ArrayList<>(); for (boolean x : a) r.add(x); return r; }
}

/** What a hidden test checks. The first failed check decides the result shown. */
final class __T {
    boolean passed = true;
    String actual;
    String expected;
    String message;

    /** Passes when the values are structurally equal (see __Harness.same). */
    void equal(Object actual, Object expected) {
        equal(actual, expected, null);
    }

    void equal(Object actual, Object expected, String message) {
        boolean ok = __Harness.same(actual, expected);
        String why = message;
        if (!ok && why == null) {
            String shownActual = __Harness.show(actual);
            if (shownActual.equals(__Harness.show(expected))) {
                why = "Same value, different type: got " + __Harness.typeName(actual)
                    + ", expected " + __Harness.typeName(expected) + ".";
            }
        }
        record(ok, __Harness.show(actual), __Harness.show(expected), why);
    }

    /** Passes when both hold the same elements, in any order. */
    void unordered(Object actual, Object expected) {
        List<Object> a = __Harness.elements(actual);
        List<Object> b = __Harness.elements(expected);
        boolean ok = a != null && b != null && a.size() == b.size();
        if (ok) {
            for (Object item : a) {
                boolean found = false;
                for (Iterator<Object> it = b.iterator(); it.hasNext(); ) {
                    if (__Harness.same(item, it.next())) {
                        it.remove();
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    ok = false;
                    break;
                }
            }
        }
        record(ok, __Harness.show(actual), __Harness.show(expected) + " (any order)", null);
    }

    /** Passes when the condition holds; the message explains a failure. */
    void check(boolean condition, String message) {
        if (!condition) record(false, null, null, message);
    }

    private void record(boolean ok, String actual, String expected, String message) {
        if (!passed) return;
        if (this.actual == null || !ok) {
            this.actual = actual;
            this.expected = expected;
        }
        if (!ok) {
            passed = false;
            this.message = message;
        }
    }
}
`;

/** The Run button's entry point. */
export const LAUNCHER_JAVA = `public final class __Launcher {
    public static void main(String[] args) {
        try {
            Main.main(args);
        } catch (Throwable e) {
            __Harness.uncaught(e);
        }
        __Harness.done();
    }
}
`;

export const HARNESS_FILE = '__Harness.java';
export const LAUNCHER_CLASS = '__Launcher';
export const GRADER_CLASS = '__Grader';
export const USER_FILE = 'Main.java';
