/**
 * Turns a run request into the Java sources to compile, and reads the compiler's and
 * program's results back into a RunResult. Pure functions: the browser worker and the
 * verify script (TeaVM and a real JDK) all grade through here.
 */

import type { TestCase } from '../../course/types.ts';
import type {
  CompileDiagnostic,
  JavaException,
  RunFailure,
  RunRequest,
  RunResult,
  TestResult,
} from '../types.ts';
import type { ProgramEvent } from './events.ts';
import {
  GRADER_CLASS,
  HARNESS_FILE,
  HARNESS_JAVA,
  LAUNCHER_CLASS,
  LAUNCHER_JAVA,
  USER_FILE,
} from './harness.java.ts';

export interface SourceFile {
  path: string;
  content: string;
}

export interface Program {
  sources: SourceFile[];
  mainClass: string;
  /** For Submit: the grader's line span of each test, to tie compile errors to a test. */
  testLines?: { first: number; last: number }[];
}

const GRADER_FILE = `${GRADER_CLASS}.java`;
const LAUNCHER_FILE = `${LAUNCHER_CLASS}.java`;

export function buildProgram(request: RunRequest): Program {
  const user = { path: USER_FILE, content: request.source };
  const harness = { path: HARNESS_FILE, content: HARNESS_JAVA };
  if (request.mode === 'run') {
    return {
      sources: [user, harness, { path: LAUNCHER_FILE, content: LAUNCHER_JAVA }],
      mainClass: LAUNCHER_CLASS,
    };
  }
  const { content, testLines } = graderSource(request.tests);
  return {
    sources: [user, harness, { path: GRADER_FILE, content }],
    mainClass: GRADER_CLASS,
    testLines,
  };
}

function graderSource(tests: readonly TestCase[]) {
  const head = [
    'import java.util.*;',
    'import java.util.function.*;',
    'import java.util.stream.*;',
    '',
    `public final class ${GRADER_CLASS} {`,
    '    public static void main(String[] args) {',
    ...tests.map((_, i) => `        __Harness.test(${i}, ${GRADER_CLASS}::test${i});`),
    '        __Harness.done();',
    '    }',
  ];
  const lines = [...head];
  const testLines: { first: number; last: number }[] = [];
  tests.forEach((test, i) => {
    lines.push('', `    private static void test${i}(__T t) throws Throwable {`);
    const first = lines.length + 1;
    lines.push(...dedent(test.code).split('\n').map((line) => (line ? `        ${line}` : line)));
    testLines.push({ first, last: lines.length });
    lines.push('    }');
  });
  lines.push('}', '');
  return { content: lines.join('\n'), testLines };
}

function dedent(code: string): string {
  const lines = code.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length);
  const cut = Math.min(...indents, Infinity);
  return lines.map((l) => l.slice(Number.isFinite(cut) ? cut : 0)).join('\n');
}

// ---- Reading results back --------------------------------------------------------------

export interface RawDiagnostic extends CompileDiagnostic {
  /** Source path the compiler reported, e.g. `Main.java`. */
  file: string | null;
}

export type CompileOutcome =
  | { ok: true; compileMs: number }
  | { ok: false; compileMs: number; diagnostics: RawDiagnostic[] };

/** How the program process ended, from the host's point of view. */
export type Termination =
  | { kind: 'exited' }
  | { kind: 'stackOverflow' }
  | { kind: 'timeout'; limitMs: number }
  | { kind: 'stopped' }
  | { kind: 'crashed'; message: string };

export interface ProgramOutput {
  /** Program output with harness frames removed. */
  stdout: string;
  stderr: string;
  events: ProgramEvent[];
  termination: Termination;
  runMs: number;
}

/** A RunResult for a program that failed to compile. */
export function compileFailureResult(
  request: RunRequest,
  program: Program,
  compile: Extract<CompileOutcome, { ok: false }>
): RunResult {
  const errors = compile.diagnostics.filter((d) => d.severity === 'error');
  const inUserFile = errors.filter((d) => d.file === null || d.file.endsWith(USER_FILE));
  let failure: RunFailure;
  if (inUserFile.length > 0) {
    failure = { kind: 'compile', diagnostics: inUserFile.map(stripFile) };
  } else if (errors.some((d) => d.file?.endsWith(GRADER_FILE))) {
    failure = {
      kind: 'mismatch',
      diagnostics: errors.map((d) => {
        const test = program.testLines?.findIndex((r) => d.line >= r.first && d.line <= r.last) ?? -1;
        const testName = request.mode === 'submit' && test >= 0 ? request.tests[test].name : null;
        return { ...stripFile(d), line: 0, column: 0, message: testName ? `${testName}: ${d.message}` : d.message };
      }),
    };
  } else if (errors.some((d) => d.file?.endsWith(LAUNCHER_FILE))) {
    failure = {
      kind: 'compile',
      diagnostics: [
        {
          severity: 'error',
          line: 0,
          column: 0,
          message: 'The program needs a `public class Main` with `public static void main(String[] args)`.',
        },
      ],
    };
  } else {
    // An error in the harness itself means the learner's code clashes with it (or a bug here).
    failure = {
      kind: 'internal',
      message: errors.map((d) => `${d.file ?? '?'}:${d.line}: ${d.message}`).join('\n') || 'Compilation failed.',
    };
  }
  return emptyResult(request, failure, compile.compileMs, 0);
}

export function programResult(request: RunRequest, compileMs: number, output: ProgramOutput): RunResult {
  const { events, termination, stdout, stderr, runMs } = output;
  const finished = events.some((e) => e.e === 'done');
  const exception = events.find((e) => e.e === 'exception');
  const failure = terminationFailure(termination, finished, exception ? toJavaException(exception) : undefined);

  if (request.mode === 'run') {
    return {
      mode: 'run',
      stdout,
      stderr,
      failure,
      compileMs,
      runMs,
      expectedOutput: request.expectedOutput,
      outputMatches: failure === undefined && normalizeOutput(stdout) === normalizeOutput(request.expectedOutput),
    };
  }

  const started = new Set(events.flatMap((e) => (e.e === 'start' ? [e.i] : [])));
  const results = new Map(events.flatMap((e) => (e.e === 'result' ? [[e.i, e] as const] : [])));
  const tests: TestResult[] = request.tests.map((test, i) => {
    const base = { name: test.name, call: test.call };
    const result = results.get(i);
    if (!result) {
      // The test that was running when the program died gets the blame.
      if (started.has(i) && failure) return { ...base, status: 'error', message: failureSummary(failure) };
      return { ...base, status: 'notRun' };
    }
    const exception = result.exception ? toJavaException(result) : undefined;
    return {
      ...base,
      status: exception ? 'error' : result.passed ? 'passed' : 'failed',
      actual: result.actual,
      expected: result.expected,
      message: result.message,
      exception,
      stdout: result.stdout,
    };
  });
  return {
    mode: 'submit',
    stdout,
    stderr,
    failure,
    compileMs,
    runMs,
    tests,
    allPassed: failure === undefined && tests.length > 0 && tests.every((t) => t.status === 'passed'),
  };
}

export function emptyResult(request: RunRequest, failure: RunFailure, compileMs: number, runMs: number): RunResult {
  if (request.mode === 'run') {
    return { mode: 'run', stdout: '', stderr: '', failure, compileMs, runMs, expectedOutput: request.expectedOutput, outputMatches: false };
  }
  return {
    mode: 'submit',
    stdout: '',
    stderr: '',
    failure,
    compileMs,
    runMs,
    tests: request.tests.map((t) => ({ name: t.name, call: t.call, status: 'notRun' })),
    allPassed: false,
  };
}

function terminationFailure(
  termination: Termination,
  finished: boolean,
  exception: JavaException | undefined
): RunFailure | undefined {
  if (exception) return { kind: 'exception', exception };
  switch (termination.kind) {
    case 'stackOverflow':
      return { kind: 'stackOverflow' };
    case 'timeout':
      return { kind: 'timeout', limitMs: termination.limitMs };
    case 'stopped':
      return { kind: 'stopped' };
    case 'crashed':
      return { kind: 'internal', message: termination.message };
    case 'exited':
      // System.exit() before the harness finished.
      return finished ? undefined : { kind: 'internal', message: 'The program exited before it finished.' };
  }
}

export function failureSummary(failure: RunFailure): string {
  switch (failure.kind) {
    case 'compile':
    case 'mismatch':
      return 'Compilation failed';
    case 'exception':
      return failure.exception.type.split('.').pop()!;
    case 'stackOverflow':
      return 'StackOverflowError: the recursion went too deep';
    case 'timeout':
      return `Time limit exceeded (${failure.limitMs / 1000}s)`;
    case 'stopped':
      return 'Stopped';
    case 'internal':
      return failure.message;
  }
}

function toJavaException(e: { exception?: string; detail?: string; trace?: [string, number][] }): JavaException {
  return {
    type: e.exception ?? 'java.lang.Throwable',
    detail: e.detail,
    trace: (e.trace ?? []).map(([method, line]) => ({ method, line })),
  };
}

function stripFile({ severity, line, column, message }: RawDiagnostic): CompileDiagnostic {
  return { severity, line, column, message };
}

/** Output comparison ignores trailing spaces on each line and blank lines at either end. */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .trim();
}
