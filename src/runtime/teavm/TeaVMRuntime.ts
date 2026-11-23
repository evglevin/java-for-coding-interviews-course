/**
 * JavaRuntime backed by TeaVM in Web Workers: one long-lived worker compiles, and each
 * program runs in a throwaway worker that is terminated on timeout or Stop.
 */

import { EventReader } from '../grading/events.ts';
import { execute, type JavaBackend } from '../grading/execute.ts';
import type { Program, ProgramOutput, Termination } from '../grading/program.ts';
import type { JavaRuntime, RunRequest, RunResult, RuntimeStatus } from '../types.ts';
import { emptyResult } from '../grading/program.ts';
import type { CompilerRequest, CompilerResponse, ProgramResponse } from './protocol.ts';

/** TeaVM emits WebAssembly GC code: Chrome/Edge 119+, Firefox 120+, Safari 18.2+. */
export function supportsWasmGC(): boolean {
  try {
    // A module whose only content is a GC struct type.
    return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 95, 1, 127, 0]));
  } catch {
    return false;
  }
}

const UNSUPPORTED_MESSAGE =
  'This browser can’t run the Java compiler (it needs WebAssembly GC). ' +
  'Update to a current Chrome, Edge, Firefox, or Safari 18.2+ to run code.';

/** Loading a compiled program takes milliseconds; this only catches a broken worker. */
const START_TIMEOUT_MS = 20_000;

type Pending = { resolve: (r: Extract<CompilerResponse, { type: 'compiled' }>) => void; reject: (e: Error) => void };

export class TeaVMRuntime implements JavaRuntime {
  private status: RuntimeStatus = { state: 'idle' };
  private readonly listeners = new Set<() => void>();
  private compiler: { worker: Worker; ready: Promise<void> } | null = null;
  private readonly pending = new Map<number, Pending>();
  private nextId = 1;
  private stopCurrent: (() => void) | null = null;
  private stopRequested = false;

  getStatus = (): RuntimeStatus => this.status;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  warmup(): void {
    if (!supportsWasmGC()) {
      this.setStatus({ state: 'unsupported', message: UNSUPPORTED_MESSAGE });
      return;
    }
    void this.ensureCompiler().catch(() => undefined);
  }

  async execute(request: RunRequest): Promise<RunResult> {
    if (!supportsWasmGC()) {
      this.setStatus({ state: 'unsupported', message: UNSUPPORTED_MESSAGE });
      return emptyResult(request, { kind: 'internal', message: UNSUPPORTED_MESSAGE }, 0, 0);
    }
    this.stopRequested = false;
    try {
      await this.ensureCompiler();
    } catch (error) {
      return emptyResult(request, { kind: 'internal', message: errorMessage(error) }, 0, 0);
    }
    this.setStatus({ state: 'running', mode: request.mode });
    try {
      return await execute(this.backend, request);
    } catch (error) {
      return emptyResult(request, { kind: 'internal', message: errorMessage(error) }, 0, 0);
    } finally {
      this.stopCurrent = null;
      if (this.status.state === 'running') this.setStatus({ state: 'ready' });
    }
  }

  stop(): void {
    this.stopRequested = true;
    this.stopCurrent?.();
  }

  private readonly backend: JavaBackend<Uint8Array> = {
    compile: async (program) => {
      const response = await this.compile(program);
      return { outcome: response.outcome, artifact: response.wasm };
    },
    run: (wasm, _program, limitMs) => this.runProgram(wasm, limitMs),
  };

  private ensureCompiler(): Promise<void> {
    if (this.compiler) return this.compiler.ready;
    this.setStatus({ state: 'loading' });
    const worker = new Worker(new URL('./compiler.worker.ts', import.meta.url), { type: 'module' });
    const ready = new Promise<void>((resolve, reject) => {
      worker.onmessage = ({ data }: MessageEvent<CompilerResponse>) => {
        switch (data.type) {
          case 'ready':
            this.setStatus({ state: 'ready' });
            resolve();
            break;
          case 'initError':
            this.failCompiler(new Error(`The Java compiler failed to load: ${data.message}`));
            reject(new Error(data.message));
            break;
          case 'compiled':
            this.pending.get(data.id)?.resolve(data);
            this.pending.delete(data.id);
            break;
          case 'compileError':
            this.pending.get(data.id)?.reject(new Error(data.message));
            this.pending.delete(data.id);
            break;
        }
      };
      worker.onerror = (event) => {
        event.preventDefault();
        const error = new Error(`The Java compiler stopped unexpectedly: ${event.message || 'unknown error'}`);
        this.failCompiler(error);
        reject(error);
      };
    });
    this.compiler = { worker, ready };
    return ready;
  }

  /** Drops a broken compiler so the next run starts a new one. */
  private failCompiler(error: Error) {
    this.compiler?.worker.terminate();
    this.compiler = null;
    for (const { reject } of this.pending.values()) reject(error);
    this.pending.clear();
    this.setStatus({ state: 'error', message: error.message });
  }

  private compile(program: Program) {
    const compiler = this.compiler;
    if (!compiler) return Promise.reject(new Error('The Java compiler is not loaded.'));
    const id = this.nextId++;
    return new Promise<Extract<CompilerResponse, { type: 'compiled' }>>((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      const message: CompilerRequest = { type: 'compile', id, program };
      compiler.worker.postMessage(message);
    });
  }

  private runProgram(wasm: Uint8Array, limitMs: number): Promise<ProgramOutput> {
    return new Promise((resolve) => {
      const worker = new Worker(new URL('./program.worker.ts', import.meta.url), { type: 'module' });
      const reader = new EventReader();
      let stderr = '';
      let startedAt: number | null = null;
      let timer: ReturnType<typeof setTimeout> | null = null;

      const finish = (termination: Termination) => {
        if (timer !== null) clearTimeout(timer);
        worker.terminate();
        this.stopCurrent = null;
        const runMs = startedAt === null ? 0 : Math.round(performance.now() - startedAt);
        resolve({ stdout: reader.stdout, stderr, events: reader.events, termination, runMs });
      };

      this.stopCurrent = () => finish({ kind: 'stopped' });
      if (this.stopRequested) return finish({ kind: 'stopped' });
      timer = setTimeout(() => finish({ kind: 'crashed', message: 'The program did not start.' }), START_TIMEOUT_MS);

      worker.onmessage = ({ data }: MessageEvent<ProgramResponse>) => {
        switch (data.type) {
          case 'started':
            startedAt = performance.now();
            if (timer !== null) clearTimeout(timer);
            // The clock starts once the module is loaded, so a slow load is never a timeout.
            timer = setTimeout(() => finish({ kind: 'timeout', limitMs }), limitMs);
            break;
          case 'output':
            reader.push(data.stdout);
            stderr += data.stderr;
            break;
          case 'exit':
            finish(data.termination);
            break;
        }
      };
      worker.onerror = (event) => {
        event.preventDefault();
        finish({ kind: 'crashed', message: event.message || 'The program stopped unexpectedly.' });
      };
      worker.postMessage({ type: 'run', wasm }, [wasm.buffer]);
    });
  }

  private setStatus(status: RuntimeStatus) {
    this.status = status;
    for (const listener of this.listeners) listener();
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
