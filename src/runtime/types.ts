/** What the UI asks the Java runtime to do, and what it gets back. */

import type { TestCase } from '../course/types.ts';

export type RunMode = 'run' | 'submit';

export type RunRequest =
  { mode: 'run'; source: string; expectedOutput: string } | { mode: 'submit'; source: string; tests: readonly TestCase[] };

export interface CompileDiagnostic {
  severity: 'error' | 'warning';
  /** 1-based; 0 when the compiler gave no position. */
  line: number;
  column: number;
  message: string;
}

/** A Java exception that escaped the learner's code. */
export interface JavaException {
  /** Fully qualified class name, e.g. `java.lang.ArrayIndexOutOfBoundsException`. */
  type: string;
  detail?: string;
  /** Frames inside the learner's file, innermost first. */
  trace: { method: string; line: number }[];
}

/** How the program ended, when it didn't simply finish. */
export type RunFailure =
  | { kind: 'compile'; diagnostics: CompileDiagnostic[] }
  /** The tests could not be compiled against the learner's code (renamed method, changed signature). */
  | { kind: 'mismatch'; diagnostics: CompileDiagnostic[] }
  | { kind: 'exception'; exception: JavaException }
  | { kind: 'stackOverflow' }
  | { kind: 'timeout'; limitMs: number }
  | { kind: 'stopped' }
  | { kind: 'internal'; message: string };

export type TestStatus = 'passed' | 'failed' | 'error' | 'notRun';

export interface TestResult {
  name: string;
  call: string;
  status: TestStatus;
  actual?: string;
  expected?: string;
  message?: string;
  exception?: JavaException;
  /** What the learner's code printed during this test. */
  stdout?: string;
}

interface BaseResult {
  /** Learner output; for Submit, only what was printed outside tests. */
  stdout: string;
  stderr: string;
  failure?: RunFailure;
  compileMs: number;
  runMs: number;
}

export interface RunOutcome extends BaseResult {
  mode: 'run';
  expectedOutput: string;
  outputMatches: boolean;
}

export interface SubmitOutcome extends BaseResult {
  mode: 'submit';
  tests: TestResult[];
  allPassed: boolean;
}

export type RunResult = RunOutcome | SubmitOutcome;

export type RuntimeStatus =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'ready' }
  | { state: 'running'; mode: RunMode }
  | { state: 'unsupported'; message: string }
  | { state: 'error'; message: string };

/** The only door between the UI and whatever compiles and runs Java. */
export interface JavaRuntime {
  getStatus(): RuntimeStatus;
  subscribe(listener: () => void): () => void;
  /** Starts loading the compiler ahead of the first run. */
  warmup(): void;
  execute(request: RunRequest): Promise<RunResult>;
  /** Stops the running program; its `execute` resolves with a `stopped` failure. */
  stop(): void;
}
