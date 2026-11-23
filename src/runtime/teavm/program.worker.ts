/// <reference lib="webworker" />
/**
 * Runs one compiled program. A fresh worker per run: the page stops a runaway program
 * (infinite loop, Stop button) by terminating it.
 */

import { EventReader, FRAME_END_CODE } from '../grading/events.ts';
import type { Termination } from '../grading/program.ts';
import type { ProgramRequest, ProgramResponse } from './protocol.ts';
import { TEAVM_FILES, teavmAssetPath } from './assets.ts';
import { removeProcessStub } from './browserGlobals.ts';
import { classifyError, startProgram, type TeaVMLoad } from './teavm.ts';

declare const self: DedicatedWorkerGlobalScope;

removeProcessStub();

const post = (message: ProgramResponse) => self.postMessage(message);
const assetUrl = (file: string) => new URL(teavmAssetPath(file), self.location.origin).href;

let stdout = '';
let stderr = '';
const reader = new EventReader();
let exited = false;

/** Hands buffered output to the page; also feeds the reader that spots the end. */
function flush() {
  if (!stdout && !stderr) return;
  reader.push(stdout);
  post({ type: 'output', stdout, stderr });
  stdout = '';
  stderr = '';
}

function exit(termination: Termination) {
  if (exited) return;
  exited = true;
  flush();
  post({ type: 'exit', termination });
}

// Errors from code resumed by timers (after Thread.sleep, say) surface here.
self.addEventListener('error', (event) => {
  event.preventDefault();
  exit(classifyError(event.error ?? event.message));
});

self.onmessage = async ({ data }: MessageEvent<ProgramRequest>) => {
  try {
    const { load } = (await import(/* @vite-ignore */ assetUrl(TEAVM_FILES.runtime))) as { load: TeaVMLoad };
    const flushTimer = setInterval(flush, 30);
    const run = await startProgram(load, data.wasm, {
      deobfuscatorPath: assetUrl(TEAVM_FILES.deobfuscator),
      onStdout: (c) => {
        stdout += String.fromCharCode(c);
        // Hand over each harness event at once: a program stuck in a loop never yields to timers.
        if (c === FRAME_END_CODE) flush();
      },
      onStderr: (c) => (stderr += String.fromCharCode(c)),
      poll: () => {
        flush();
        return reader.events.some((e) => e.e === 'done');
      },
      onStart: () => post({ type: 'started' }),
    });
    const termination = await run.finished;
    clearInterval(flushTimer);
    exit(termination);
  } catch (error) {
    exit(classifyError(error));
  }
};
