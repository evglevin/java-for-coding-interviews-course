import type { LessonData } from '../../types.ts';

const MAIN = `
// do not modify below this line
record Student(String name, int grade) {}

public class Main {
    public static void main(String[] args) {
        Solution solution = new Solution();

        List<Student> roster = List.of(
            new Student("Cara", 90), new Student("Abe", 85), new Student("Bo", 90),
            new Student("Dan", 72), new Student("Eve", 85), new Student("Al", 90));

        System.out.println(solution.byGradeThenName(new ArrayList<>(roster)));
        System.out.println(solution.byGradeDescThenName(new ArrayList<>(roster)));
        System.out.println(solution.byNameLengthThenGradeDesc(new ArrayList<>(roster)));
    }
}
`;

export const comparatorChaining: LessonData = {
  id: 'comparator-chaining',
  title: 'Comparator Chaining',
  summary: 'Build multi-key sorts from Comparator.comparing, thenComparing, and reversed, with records and method references.',
  blocks: [
    {
      type: 'paragraph',
      text: 'Hand-written comparators with tie-breakers get long and easy to get wrong. `Comparator` has factory methods that build one from *key extractors*: functions that pull the field to sort by out of each element.',
    },
    {
      type: 'code',
      code: `record Student(String name, int grade) {}

List<Student> students = new ArrayList<>(List.of(
    new Student("Cara", 90), new Student("Abe", 85), new Student("Bo", 90)));

students.sort(Comparator.comparingInt(Student::grade));
// order: Abe, Cara, Bo (grade ties keep input order)

students.sort(Comparator.comparingInt(Student::grade).thenComparing(Student::name));
System.out.println(students);
// [Student[name=Abe, grade=85], Student[name=Bo, grade=90], Student[name=Cara, grade=90]]`,
    },
    {
      type: 'list',
      items: [
        '`Comparator.comparing(key)`: sorts by a key that is `Comparable`, such as a `String` or an `Integer`.',
        '`Comparator.comparingInt(key)`: sorts by an `int` key without boxing it. `comparingLong` and `comparingDouble` work the same way.',
        '`.thenComparing(key)` / `.thenComparingInt(key)`: a tie-breaker, used only when everything before it compares as equal.',
        '`.reversed()`: flips the order of the comparator it is called on.',
        '`.thenComparing(key, Comparator.reverseOrder())`: reverses one key without touching the others.',
      ],
    },
    {
      type: 'paragraph',
      text: '`Student::grade` is a *method reference*, short for `s -> s.grade()`. A record generates a constructor, accessors named after its fields (`grade()`, not `getGrade()`), and `equals`, `hashCode`, and `toString`. Declare it at the top level of the file or nested inside a class. A nested record is implicitly `static`.',
    },
    {
      type: 'heading',
      text: '`reversed()` applies to the whole chain',
    },
    {
      type: 'code',
      code: `// grade high to low, then name A to Z
Comparator.comparingInt(Student::grade).reversed().thenComparing(Student::name);

// wrong: grade high to low, then name Z to A
Comparator.comparingInt(Student::grade).thenComparing(Student::name).reversed();`,
      caption: '`reversed()` reverses everything to its left. Call it right after the key you want reversed.',
    },
    {
      type: 'note',
      title: 'Lambdas lose their type in a chain',
      text: '`Comparator.comparing(s -> s.name()).reversed()` does not compile: once you chain a call, Java infers `s` as `Object`, which has no `name()`. Use a method reference (`Student::name`) or give the parameter a type: `(Student s) -> s.name()`. A lambda alone, with nothing chained, is fine: `students.sort(Comparator.comparing(s -> s.name()))`.',
    },
    {
      type: 'note',
      title: 'Cost',
      text: 'A chained comparator still makes O(n log n) comparisons. Each comparison calls the extractors, and comparing `String` keys costs up to their length. The sort is stable, so elements that tie on every key keep their input order.',
    },
  ],
  challenge: {
    intro:
      'A `record Student(String name, int grade)` is declared below the `Solution` class. Complete the methods; each one sorts the list in place with a chained comparator and returns it:',
    methods: [
      {
        signature: 'List<Student> byGradeThenName(List<Student> students)',
        description: 'Lowest grade first; equal grades by name, A to Z.',
      },
      {
        signature: 'List<Student> byGradeDescThenName(List<Student> students)',
        description: 'Highest grade first; equal grades by name, A to Z.',
      },
      {
        signature: 'List<Student> byNameLengthThenGradeDesc(List<Student> students)',
        description:
          'Shortest name first; equal lengths by grade, highest first. Students that tie on both keep their input order.',
      },
    ],
    notes: ['Names compare with `String`’s natural order, so uppercase letters sort before lowercase ones.'],
  },
  complexity: {
    time: 'O(n log n · k), where k is the cost of one comparison: O(1) for `int` keys, up to the name length for `String` keys.',
    space: 'Up to O(n) for TimSort.',
  },
  hints: [
    'Start each chain with `Comparator.comparingInt(Student::grade)` or `Comparator.comparing(Student::name)` and add tie-breakers with `thenComparing`.',
    'For highest grade first, call `.reversed()` right after the grade key, before `.thenComparing(Student::name)`.',
    'For name length, use `Comparator.comparingInt((Student s) -> s.name().length())`, then `.thenComparing(Student::grade, Comparator.reverseOrder())`.',
    'Interview tip: a record plus a chained comparator turns "sort by X, then by Y descending" into one readable line.',
  ],
  starterCode: `import java.util.*;

class Solution {
    public List<Student> byGradeThenName(List<Student> students) {
        // your code here
        return students;
    }

    public List<Student> byGradeDescThenName(List<Student> students) {
        // your code here
        return students;
    }

    public List<Student> byNameLengthThenGradeDesc(List<Student> students) {
        // your code here
        return students;
    }
}
${MAIN}`,
  expectedOutput: `[Student[name=Dan, grade=72], Student[name=Abe, grade=85], Student[name=Eve, grade=85], Student[name=Al, grade=90], Student[name=Bo, grade=90], Student[name=Cara, grade=90]]
[Student[name=Al, grade=90], Student[name=Bo, grade=90], Student[name=Cara, grade=90], Student[name=Abe, grade=85], Student[name=Eve, grade=85], Student[name=Dan, grade=72]]
[Student[name=Bo, grade=90], Student[name=Al, grade=90], Student[name=Abe, grade=85], Student[name=Eve, grade=85], Student[name=Dan, grade=72], Student[name=Cara, grade=90]]`,
  solutionCode: `import java.util.*;

class Solution {
    public List<Student> byGradeThenName(List<Student> students) {
        students.sort(Comparator.comparingInt(Student::grade).thenComparing(Student::name));
        return students;
    }

    public List<Student> byGradeDescThenName(List<Student> students) {
        students.sort(Comparator.comparingInt(Student::grade).reversed().thenComparing(Student::name));
        return students;
    }

    public List<Student> byNameLengthThenGradeDesc(List<Student> students) {
        students.sort(Comparator.comparingInt((Student s) -> s.name().length())
            .thenComparing(Student::grade, Comparator.reverseOrder()));
        return students;
    }
}
${MAIN}`,
  solutionExplanation:
    'Each chain names its primary key first and its tie-breaker second. In `byGradeDescThenName`, `reversed()` comes before `thenComparing`, so it flips only the grade; in the last method, `thenComparing(key, Comparator.reverseOrder())` flips only the grade tie-breaker, and the stable sort keeps full ties in input order.',
  testCases: [
    {
      name: 'byGradeThenName breaks grade ties by name',
      call: 'byGradeThenName([Cara 90, Abe 85, Bo 90, Dan 72])',
      code: `List<Student> students = new ArrayList<>(List.of(
    new Student("Cara", 90), new Student("Abe", 85), new Student("Bo", 90), new Student("Dan", 72)));
t.equal(new Solution().byGradeThenName(students), List.of(
    new Student("Dan", 72), new Student("Abe", 85), new Student("Bo", 90), new Student("Cara", 90)));`,
    },
    {
      name: 'byGradeDescThenName keeps names A to Z',
      call: 'byGradeDescThenName([Abe 85, Cara 90, Eve 85, Bo 90])',
      code: `List<Student> students = new ArrayList<>(List.of(
    new Student("Abe", 85), new Student("Cara", 90), new Student("Eve", 85), new Student("Bo", 90)));
t.equal(new Solution().byGradeDescThenName(students), List.of(
    new Student("Bo", 90), new Student("Cara", 90), new Student("Abe", 85), new Student("Eve", 85)),
    "Grades go high to low, but names within a grade stay A to Z. Call reversed() before thenComparing.");`,
    },
    {
      name: 'byNameLengthThenGradeDesc',
      call: 'byNameLengthThenGradeDesc([Cara 90, Abe 72, Bo 60, Eve 95])',
      code: `List<Student> students = new ArrayList<>(List.of(
    new Student("Cara", 90), new Student("Abe", 72), new Student("Bo", 60), new Student("Eve", 95)));
t.equal(new Solution().byNameLengthThenGradeDesc(students), List.of(
    new Student("Bo", 60), new Student("Eve", 95), new Student("Abe", 72), new Student("Cara", 90)));`,
    },
    {
      name: 'byNameLengthThenGradeDesc keeps full ties in input order',
      call: 'byNameLengthThenGradeDesc([Zed 80, Ann 80, Bob 80, Al 50])',
      code: `List<Student> students = new ArrayList<>(List.of(
    new Student("Zed", 80), new Student("Ann", 80), new Student("Bob", 80), new Student("Al", 50)));
t.equal(new Solution().byNameLengthThenGradeDesc(students), List.of(
    new Student("Al", 50), new Student("Zed", 80), new Student("Ann", 80), new Student("Bob", 80)));`,
    },
    {
      name: 'uppercase names and duplicate students',
      call: 'byGradeThenName([ann 70, Zoe 70, Max 70, Max 70])',
      code: `List<Student> students = new ArrayList<>(List.of(
    new Student("ann", 70), new Student("Zoe", 70), new Student("Max", 70), new Student("Max", 70)));
t.equal(new Solution().byGradeThenName(students), List.of(
    new Student("Max", 70), new Student("Max", 70), new Student("Zoe", 70), new Student("ann", 70)));`,
    },
    {
      name: 'empty and single-element lists',
      call: 'byGradeThenName([]), byGradeDescThenName([Solo 0])',
      code: `Solution s = new Solution();
t.equal(s.byGradeThenName(new ArrayList<>()), List.of());
t.equal(s.byGradeDescThenName(new ArrayList<>(List.of(new Student("Solo", 0)))), List.of(new Student("Solo", 0)));`,
    },
  ],
};
