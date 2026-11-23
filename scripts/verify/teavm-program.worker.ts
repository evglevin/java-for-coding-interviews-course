import { pathToFileURL } from 'node:url';
import { parentPort, workerData } from 'node:worker_threads';
import { EventReader, FRAME_END_CODE } from '../../src/runtime/grading/events.ts';
import { TEAVM_FILES } from '../../src/runtime/teavm/assets.ts';
import { classifyError, startProgram, type TeaVMLoad } from '../../src/runtime/teavm/teavm.ts';
import { teavmFile } from './teavm-backend.ts';

const port = parentPort!;
let stdout = '';
let stderr = '';
const reader = new EventReader();
const flush = () => {
  if (!stdout && !stderr) return;
  reader.push(stdout);
  port.postMessage({ stdout, stderr });
  stdout = stderr = '';
};

process.on('uncaughtException', (error) => {
  flush();
  port.postMessage({ termination: classifyError(error) });
});

const { load } = (await import(pathToFileURL(teavmFile(TEAVM_FILES.runtime)).href)) as { load: TeaVMLoad };
const run = await startProgram(load, workerData.wasm as Uint8Array, {
  deobfuscatorPath: teavmFile(TEAVM_FILES.deobfuscator),
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
});
const termination = await run.finished;
flush();
port.postMessage({ termination });
