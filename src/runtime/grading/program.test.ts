import { describe, expect, it } from 'vitest';
import type { TestCase } from '../../course/types';
import { buildProgram, compileFailureResult, normalizeOutput, programResult, type RawDiagnostic } from './program';

const tests: TestCase[] = [
  { name: 'first', call: 'f(1)', code: 't.equal(new Solution().f(1), 2);' },
  { name: 'second', call: 'f(2)', code: '\n    int x = 2;\n    t.equal(new Solution().f(x), 3);\n' },
];

describe('buildProgram', () => {
  it('runs the learner’s main through the launcher', () => {
    const program = buildProgram({ mode: 'run', source: 'class Main {}', expectedOutput: '' });
    expect(program.mainClass).toBe('__Launcher');
    expect(program.sources.map((s) => s.path)).toEqual(['Main.java', '__Harness.java', '__Launcher.java']);
  });

  it('generates one grader method per test and records where each test’s code sits', () => {
    const program = buildProgram({ mode: 'submit', source: '', tests });
    const grader = program.sources.find((s) => s.path === '__Grader.java')!.content;
    const lines = grader.split('\n');
    expect(program.mainClass).toBe('__Grader');
    expect(grader).toContain('__Harness.test(0, __Grader::test0);');
    expect(grader).toContain('__Harness.test(1, __Grader::test1);');
    const second = program.testLines![1];
    expect(lines.slice(second.first - 1, second.last)).toEqual([
      '        int x = 2;',
      '        t.equal(new Solution().f(x), 3);',
    ]);
  });
});

describe('compileFailureResult', () => {
  const submit = { mode: 'submit' as const, source: '', tests };
  const program = buildProgram(submit);
  const diag = (file: string, line: number, message: string): RawDiagnostic => ({
    file,
    line,
    column: 1,
    severity: 'error',
    message,
  });

  it('reports errors in the learner’s file as compile errors', () => {
    const result = compileFailureResult(submit, program, {
      ok: false,
      compileMs: 5,
      diagnostics: [diag('Main.java', 3, 'oops')],
    });
    expect(result.failure).toEqual({
      kind: 'compile',
      diagnostics: [{ severity: 'error', line: 3, column: 1, message: 'oops' }],
    });
  });

  it('ties errors in the generated tests to the test that caused them', () => {
    const line = program.testLines![1].last;
    const result = compileFailureResult(submit, program, {
      ok: false,
      compileMs: 5,
      diagnostics: [diag('__Grader.java', line, 'cannot find symbol')],
    });
    expect(result.failure).toMatchObject({ kind: 'mismatch', diagnostics: [{ message: 'second: cannot find symbol' }] });
  });
});

describe('programResult', () => {
  const submit = { mode: 'submit' as const, source: '', tests };

  it('grades each test from its result event', () => {
    const result = programResult(submit, 10, {
      stdout: '',
      stderr: '',
      runMs: 3,
      termination: { kind: 'exited' },
      events: [
        { e: 'start', i: 0 },
        { e: 'result', i: 0, passed: true, actual: '2', expected: '2' },
        { e: 'start', i: 1 },
        { e: 'result', i: 1, passed: false, actual: '4', expected: '3' },
        { e: 'done' },
      ],
    });
    expect(result.mode === 'submit' && result.tests.map((t) => t.status)).toEqual(['passed', 'failed']);
    expect(result.mode === 'submit' && result.allPassed).toBe(false);
    expect(result.failure).toBeUndefined();
  });

  it('blames a timeout on the running test and marks the rest not run', () => {
    const result = programResult(submit, 10, {
      stdout: '',
      stderr: '',
      runMs: 6000,
      termination: { kind: 'timeout', limitMs: 6000 },
      events: [{ e: 'start', i: 0 }],
    });
    expect(result.failure).toEqual({ kind: 'timeout', limitMs: 6000 });
    expect(result.mode === 'submit' && result.tests.map((t) => t.status)).toEqual(['error', 'notRun']);
  });

  it('compares Run output ignoring trailing whitespace', () => {
    const result = programResult({ mode: 'run', source: '', expectedOutput: '[1, 2]\n' }, 1, {
      stdout: '[1, 2]   \n\n',
      stderr: '',
      runMs: 1,
      termination: { kind: 'exited' },
      events: [{ e: 'done' }],
    });
    expect(result.mode === 'run' && result.outputMatches).toBe(true);
  });

  it('reports an uncaught exception from main', () => {
    const result = programResult({ mode: 'run', source: '', expectedOutput: '' }, 1, {
      stdout: '',
      stderr: '',
      runMs: 1,
      termination: { kind: 'exited' },
      events: [{ e: 'exception', exception: 'java.lang.NullPointerException', trace: [['Solution.f', 4]] }, { e: 'done' }],
    });
    expect(result.failure).toEqual({
      kind: 'exception',
      exception: { type: 'java.lang.NullPointerException', detail: undefined, trace: [{ method: 'Solution.f', line: 4 }] },
    });
  });
});

describe('normalizeOutput', () => {
  it('ignores CRLF, trailing spaces, and blank edges', () => {
    expect(normalizeOutput('\r\n a  \r\nb\n\n')).toBe('a\nb');
  });
});
