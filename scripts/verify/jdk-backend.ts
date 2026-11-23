/** Grades programs on the local JDK, as a check that lesson code is real Java 21. */

import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { EventReader } from '../../src/runtime/grading/events.ts';
import type { JavaBackend } from '../../src/runtime/grading/execute.ts';
import type { ProgramOutput, RawDiagnostic, Termination } from '../../src/runtime/grading/program.ts';

const RELEASE = '21';

export function jdkAvailable(): boolean {
  const result = spawnSync('javac', ['-version'], { encoding: 'utf8' });
  return result.status === 0;
}

export function createJdkBackend(): JavaBackend<string> {
  return {
    async compile(program) {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'java-course-'));
      for (const source of program.sources) fs.writeFileSync(path.join(dir, source.path), source.content);
      const started = performance.now();
      const result = spawnSync(
        'javac',
        [
          '--release',
          RELEASE,
          '-encoding',
          'UTF-8',
          '-Xlint:none',
          '-d',
          path.join(dir, 'out'),
          ...program.sources.map((s) => s.path),
        ],
        { cwd: dir, encoding: 'utf8' },
      );
      const compileMs = Math.round(performance.now() - started);
      if (result.status === 0) return { outcome: { ok: true, compileMs }, artifact: dir };
      fs.rmSync(dir, { recursive: true, force: true });
      return { outcome: { ok: false, compileMs, diagnostics: parseJavacErrors(result.stderr) }, artifact: null };
    },
    run(dir, program, limitMs) {
      return new Promise<ProgramOutput>((resolve) => {
        const child = spawn('java', ['-Xss8m', '-cp', path.join(dir, 'out'), program.mainClass], { cwd: dir });
        const reader = new EventReader();
        let stderr = '';
        const started = performance.now();
        let termination: Termination = { kind: 'exited' };
        const timer = setTimeout(() => {
          termination = { kind: 'timeout', limitMs };
          child.kill('SIGKILL');
        }, limitMs);
        child.stdout.setEncoding('utf8').on('data', (chunk: string) => reader.push(chunk));
        child.stderr.setEncoding('utf8').on('data', (chunk: string) => (stderr += chunk));
        child.on('close', () => {
          clearTimeout(timer);
          fs.rmSync(dir, { recursive: true, force: true });
          resolve({
            stdout: reader.stdout,
            stderr,
            events: reader.events,
            termination,
            runMs: Math.round(performance.now() - started),
          });
        });
      });
    },
  };
}

/** `Main.java:3: error: incompatible types: ...` lines from javac. */
function parseJavacErrors(output: string): RawDiagnostic[] {
  const diagnostics: RawDiagnostic[] = [];
  for (const line of output.split('\n')) {
    const match = /^(.+?\.java):(\d+): (error|warning): (.*)$/.exec(line);
    if (match) {
      diagnostics.push({
        file: match[1],
        line: Number(match[2]),
        column: 0,
        severity: match[3] as 'error' | 'warning',
        message: match[4],
      });
    }
  }
  return diagnostics.length ? diagnostics : [{ file: null, line: 0, column: 0, severity: 'error', message: output.trim() }];
}
