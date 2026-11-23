# Java for Coding Interviews

An interactive crash course in the Java you need for coding interviews. Each lesson explains one
idiom, then gives you a challenge to solve in a real Java editor. Your code compiles and runs
**in the browser**: there is no server and nothing to install, and it works offline once loaded.

Live at [java.evgenylevin.com](https://java.evgenylevin.com).

## Features

- **Lessons in sections:** Sorting, Java Essentials, Arrays and Lists, Stacks and Queues,
  2D Arrays, HashMap and HashSet, PriorityQueue, TreeMap and TreeSet.
- **Real Java, in the browser:** [TeaVM](https://teavm.org)'s build of OpenJDK `javac` compiles
  your code to WebAssembly in a Web Worker. Lessons teach Java 21.
- **Run and Submit:** **Run** (`Cmd/Ctrl + Enter`) compares your program's output with the
  expected output; **Submit** (`Cmd/Ctrl + Shift + Enter`) runs hidden tests and marks the lesson
  solved when they all pass. Infinite loops are stopped after a time limit, or with **Stop**.
- **Editor:** CodeMirror 6 with Java highlighting, completions, compile errors marked inline,
  several solution tabs per lesson, and adjustable font size.
- **Progress:** progressive hints, reference solutions, an interview stopwatch, and progress
  saved in the browser. **Save to link** copies a link that carries your solved lessons and code
  to another device; the data stays in the URL fragment and never reaches a server.

Concurrency isn't covered: the in-browser runtime runs threads one at a time and lacks most of
`java.util.concurrent`, so lessons on it couldn't behave as they do on a JVM.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # prerendered static site in dist/client
npm test           # unit tests
npm run typecheck
npm run verify     # grade every lesson on TeaVM and on the local JDK
```

`npm run verify` needs a JDK (17+) on the `PATH` for its second check; without one it checks
TeaVM only.

## How it fits together

| Path                        | What's there                                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/course/`               | Lesson content: one file per lesson, in section folders. See [docs/authoring-lessons.md](docs/authoring-lessons.md).              |
| `src/runtime/`              | Compiling, running, and grading Java. `grading/` is pure and shared with the verify script; `teavm/` drives TeaVM in Web Workers. |
| `src/features/`             | The app: workspace layout, lesson pane, editor, console, curriculum, progress.                                                    |
| `src/routes/`               | TanStack Start routes. Every page is prerendered to static HTML at build time.                                                    |
| `public/teavm/`             | The compiler's files, built by `scripts/build-teavm.sh` from a pinned teavm-javac commit.                                         |
| `scripts/verify-lessons.ts` | Checks each lesson's solution, starter code, and tests on TeaVM and the JDK.                                                      |

Run and Submit compile the learner's `Main.java` together with a small harness
(`src/runtime/grading/harness.java.ts`). Submit adds a generated test class; the harness reports
results through framed events on standard output, so the same grading works in the browser, in
Node, and on a real JVM.

### Updating the compiler

`scripts/build-teavm.sh` needs JDK 25. Change `TEAVM_JAVAC_COMMIT` (and `TEAVM_VERSION` if the
pinned TeaVM changed), run `npm run teavm:build`, update `TEAVM_ASSET_VERSION` in
`src/runtime/teavm/assets.ts`, delete the old `public/teavm/<version>/` folder, and run
`npm run verify`.

## License

[MIT](LICENSE) © 2026 Evgenii Levin. The compiler files in `public/teavm/` are from
[teavm-javac](https://github.com/konsoletyper/teavm-javac) (Apache 2.0) and include OpenJDK
components (GPLv2 with the Classpath Exception).
