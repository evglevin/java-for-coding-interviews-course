/** Grades programs with the same TeaVM build the site serves, running in Node. */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Worker } from 'node:worker_threads';
import { EventReader } from '../../src/runtime/grading/events.ts';
import type { JavaBackend } from '../../src/runtime/grading/execute.ts';
import type { ProgramOutput, Termination } from '../../src/runtime/grading/program.ts';
import { TEAVM_FILES, teavmAssetPath } from '../../src/runtime/teavm/assets.ts';
import { TeaVMCompiler, type TeaVMLoad } from '../../src/runtime/teavm/teavm.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
export const teavmFile = (file: string) => path.join(ROOT, 'public', teavmAssetPath(file));

export async function createTeaVMBackend(): Promise<JavaBackend<Uint8Array>> {
  const { load } = (await import(pathToFileURL(teavmFile(TEAVM_FILES.runtime)).href)) as { load: TeaVMLoad };
  const read = (file: string) => {
    const bytes = fs.readFileSync(teavmFile(file));
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  };
  const compiler = await TeaVMCompiler.create(load, {
    compilerWasm: new Uint8Array(read(TEAVM_FILES.compiler)),
    sdk: read(TEAVM_FILES.sdk),
    classlib: read(TEAVM_FILES.classlib),
  });
  return {
    async compile(program) {
      const { outcome, wasm } = await compiler.compile(program);
      return { outcome, artifact: wasm };
    },
    run: (wasm, _program, limitMs) => runInWorker(wasm, limitMs),
  };
}

/** Runs the program in a worker thread so an infinite loop can be cut off. */
function runInWorker(wasm: Uint8Array, limitMs: number): Promise<ProgramOutput> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./teavm-program.worker.ts', import.meta.url), { workerData: { wasm } });
    const reader = new EventReader();
    let stderr = '';
    const started = performance.now();
    let settled = false;
    const finish = (termination: Termination) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      resolve({ stdout: reader.stdout, stderr, events: reader.events, termination, runMs: Math.round(performance.now() - started) });
    };
    const timer = setTimeout(() => finish({ kind: 'timeout', limitMs }), limitMs);
    worker.on('message', (message: { stdout: string; stderr: string } | { termination: Termination }) => {
      if ('termination' in message) finish(message.termination);
      else {
        reader.push(message.stdout);
        stderr += message.stderr;
      }
    });
    worker.on('error', (error) => finish({ kind: 'crashed', message: error.message }));
    worker.on('exit', () => finish({ kind: 'crashed', message: 'The program exited without finishing.' }));
  });
}
