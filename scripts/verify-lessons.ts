/**
 * Checks every lesson the way a learner would meet it, on two Java implementations:
 * TeaVM (what the site runs) and the local JDK with --release 21 (real Java).
 *
 * For each lesson:
 * - the reference solution prints the expected output and passes every test;
 * - the starter code compiles, and does not already pass the tests;
 * - the part of `Main` below "do not modify" is the same in starter and solution.
 *
 * Usage: npm run verify [-- <lesson-id> ...] [-- --teavm-only]
 */

import { LESSONS } from '../src/course/index.ts';
import type { Lesson } from '../src/course/types.ts';
import { execute, type JavaBackend } from '../src/runtime/grading/execute.ts';
import { failureSummary } from '../src/runtime/grading/program.ts';
import type { RunResult } from '../src/runtime/types.ts';
import { createJdkBackend, jdkAvailable } from './verify/jdk-backend.ts';
import { createTeaVMBackend } from './verify/teavm-backend.ts';

const MARKER = '// do not modify below this line';

const args = process.argv.slice(2);
const teavmOnly = args.includes('--teavm-only');
const only = new Set(args.filter((a) => !a.startsWith('--')));
const lessons = only.size ? LESSONS.filter((l) => only.has(l.id)) : LESSONS;
if (only.size && lessons.length !== only.size) {
  const known = new Set(LESSONS.map((l) => l.id));
  console.error(`Unknown lesson id(s): ${[...only].filter((id) => !known.has(id)).join(', ')}`);
  process.exit(1);
}

const backends: [string, JavaBackend<unknown>][] = [['TeaVM', await createTeaVMBackend()]];
if (!teavmOnly) {
  if (jdkAvailable()) backends.push(['JDK', createJdkBackend()]);
  else console.warn('javac not found; checking with TeaVM only.\n');
}

console.log(`Verifying ${lessons.length} lesson(s) with ${backends.map(([name]) => name).join(' and ')}...\n`);

let failures = 0;
for (const lesson of lessons) {
  const problems = [...checkStructure(lesson)];
  for (const [name, backend] of backends) {
    for (const problem of await checkLesson(backend, lesson)) problems.push(`[${name}] ${problem}`);
  }
  if (problems.length === 0) {
    console.log(`  ✓ ${lesson.id}`);
  } else {
    failures++;
    console.log(`  ✗ ${lesson.id}`);
    for (const problem of problems) console.log(indent(problem, '      '));
  }
}

console.log(failures ? `\n${failures} lesson(s) failed.` : `\nAll ${lessons.length} lesson(s) passed.`);
process.exit(failures ? 1 : 0);

function* checkStructure(lesson: Lesson): Generator<string> {
  if (LESSONS.filter((l) => l.id === lesson.id).length > 1) yield `Duplicate lesson id`;
  if (!lesson.testCases.length) yield 'No test cases';
  if (!lesson.hints.length) yield 'No hints';
  const starterMain = lesson.starterCode.split(MARKER)[1];
  const solutionMain = lesson.solutionCode.split(MARKER)[1];
  if (starterMain === undefined || solutionMain === undefined) yield `Starter and solution need a "${MARKER}" line`;
  else if (starterMain !== solutionMain) yield 'The code below the marker differs between starter and solution';
  for (const test of lesson.testCases) {
    if (lesson.testCases.filter((t) => t.name === test.name).length > 1) yield `Duplicate test name: ${test.name}`;
  }
}

async function checkLesson(backend: JavaBackend<unknown>, lesson: Lesson): Promise<string[]> {
  const problems: string[] = [];
  const tests = lesson.testCases;
  const expectedOutput = lesson.expectedOutput;

  const solutionRun = await execute(backend, { mode: 'run', source: lesson.solutionCode, expectedOutput });
  if (!solutionRun.outputMatches) problems.push(`Solution output:\n${describe(solutionRun)}`);

  const solutionSubmit = await execute(backend, { mode: 'submit', source: lesson.solutionCode, tests });
  if (!solutionSubmit.allPassed) problems.push(`Solution fails tests:\n${describe(solutionSubmit)}`);

  const starterRun = await execute(backend, { mode: 'run', source: lesson.starterCode, expectedOutput });
  if (starterRun.failure?.kind === 'compile' || starterRun.failure?.kind === 'internal') {
    problems.push(`Starter code doesn't compile:\n${describe(starterRun)}`);
  }

  const starterSubmit = await execute(backend, { mode: 'submit', source: lesson.starterCode, tests });
  if (starterSubmit.failure?.kind === 'mismatch')
    problems.push(`Tests don't compile against the starter:\n${describe(starterSubmit)}`);
  else if (starterSubmit.allPassed) problems.push('The starter code already passes every test');

  return problems;
}

function describe(result: RunResult): string {
  const lines: string[] = [];
  const { failure } = result;
  if (failure) {
    lines.push(`failure: ${failureSummary(failure)}`);
    if (failure.kind === 'compile' || failure.kind === 'mismatch') {
      for (const d of failure.diagnostics) lines.push(`  line ${d.line}: ${d.message}`);
    }
    if (failure.kind === 'exception') {
      lines.push(`  ${failure.exception.type}: ${failure.exception.detail ?? ''}`);
      for (const f of failure.exception.trace) lines.push(`    at ${f.method} (line ${f.line})`);
    }
  }
  if (result.mode === 'run') {
    lines.push(`expected:\n${indent(result.expectedOutput, '  ')}`, `actual:\n${indent(result.stdout, '  ')}`);
  } else {
    for (const test of result.tests.filter((t) => t.status !== 'passed')) {
      lines.push(`${test.status}: ${test.name}`);
      if (test.expected !== undefined) lines.push(`  expected ${test.expected}`);
      if (test.actual !== undefined) lines.push(`  actual   ${test.actual}`);
      if (test.message) lines.push(`  ${test.message}`);
      if (test.exception) lines.push(`  ${test.exception.type}: ${test.exception.detail ?? ''}`);
    }
  }
  if (result.stderr) lines.push(`stderr:\n${indent(result.stderr, '  ')}`);
  return indent(lines.join('\n'), '  ');
}

function indent(text: string, prefix: string): string {
  return text
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
}
