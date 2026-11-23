/**
 * Thin, typed wrappers over teavm-javac (https://github.com/konsoletyper/teavm-javac):
 * one compiler instance that turns Java sources into a WebAssembly module, and a
 * function that runs such a module. Shared by the browser workers and the verify script,
 * which pass in the platform's way of loading TeaVM's files.
 */

import type { CompileOutcome, Program, RawDiagnostic, Termination } from '../grading/program.ts';
import { WARMUP_PROGRAM } from './warmup.ts';

/** `load` from TeaVM's `compiler.wasm-runtime.js`. */
export type TeaVMLoad = (
  module: string | BufferSource,
  options?: {
    stackDeobfuscator?: { enabled: boolean; path?: string };
    installImports?: (imports: TeaVMImports) => void;
    onExit?: (code: number) => void;
  },
) => Promise<{ exports: Record<string, unknown> }>;

interface TeaVMImports {
  teavmConsole: { putcharStdout: (c: number) => void; putcharStderr: (c: number) => void };
}

interface TeaVMDiagnostic {
  type: 'javac' | 'teavm';
  severity: 'error' | 'warning' | 'other';
  fileName: string | null;
  lineNumber: number;
  columnNumber?: number;
  message: string;
}

interface NativeCompiler {
  setSdk(content: Int8Array): void;
  setTeaVMClasslib(content: Int8Array): void;
  onDiagnostic(listener: (d: TeaVMDiagnostic) => void): { destroy(): void };
  addSourceFile(path: string, content: string): void;
  clearSourceFiles(): void;
  clearOutputFiles(): void;
  compile(): boolean;
  generateWebAssembly(options: { outputName: string; mainClass: string; obfuscated?: boolean }): Promise<boolean>;
  getWebAssemblyOutputFile(path: string): Int8Array | null;
}

export interface TeaVMFiles {
  /** A URL (browser) or file path (Node), or the module's bytes. */
  compilerWasm: string | BufferSource;
  /** Java class library stubs javac compiles against. */
  sdk: ArrayBuffer;
  /** Java class library TeaVM links into the program. */
  classlib: ArrayBuffer;
}

export interface CompiledProgram {
  outcome: CompileOutcome;
  wasm: Uint8Array | null;
}

/**
 * Compiles one program at a time; reusing the instance keeps later compiles fast (about
 * 0.35 s instead of 0.8 s for a fresh one). teavm-javac's state can break between compiles
 * (see warmup.ts): a crashed instance is replaced and the program compiled again on the new one.
 */
export class TeaVMCompiler {
  private queue: Promise<unknown> = Promise.resolve();
  private diagnostics: RawDiagnostic[] = [];
  private native: NativeCompiler | null = null;
  private readonly load: TeaVMLoad;
  private readonly files: TeaVMFiles;

  private constructor(load: TeaVMLoad, files: TeaVMFiles) {
    this.load = load;
    this.files = files;
  }

  static async create(load: TeaVMLoad, files: TeaVMFiles): Promise<TeaVMCompiler> {
    const compiler = new TeaVMCompiler(load, files);
    await compiler.compile(WARMUP_PROGRAM);
    return compiler;
  }

  /** A compiler in a new WebAssembly instance, so no state carries over from a crashed one. */
  private async startInstance(): Promise<NativeCompiler> {
    const teavm = await this.load(this.files.compilerWasm);
    const native = (teavm.exports.createCompiler as () => NativeCompiler)();
    native.setSdk(new Int8Array(this.files.sdk));
    native.setTeaVMClasslib(new Int8Array(this.files.classlib));
    native.onDiagnostic((d) => {
      if (d.severity === 'other') return;
      this.diagnostics.push({
        file: d.fileName,
        severity: d.severity,
        line: Math.max(0, d.lineNumber),
        column: Math.max(0, d.columnNumber ?? 0),
        message: d.message,
      });
    });
    return native;
  }

  compile(program: Program): Promise<CompiledProgram> {
    const next = this.queue.then(() => this.compileNow(program));
    this.queue = next.catch(() => undefined);
    return next;
  }

  private async compileNow(program: Program): Promise<CompiledProgram> {
    const started = performance.now();
    this.native ??= await this.startInstance();
    try {
      return await this.compileWith(this.native, program, started);
    } catch {
      // The instance crashed and stays unusable. The first compile on a fresh one is safe.
      this.native = await this.startInstance();
      return this.compileWith(this.native, program, started);
    }
  }

  private async compileWith(native: NativeCompiler, program: Program, started: number): Promise<CompiledProgram> {
    this.diagnostics = [];
    native.clearSourceFiles();
    native.clearOutputFiles();
    for (const source of program.sources) native.addSourceFile(source.path, source.content);

    let ok = native.compile();
    let wasm: Uint8Array | null = null;
    if (ok) {
      // Unobfuscated keeps method names, so stack traces read like Java's.
      ok = await native.generateWebAssembly({ outputName: 'app', mainClass: program.mainClass, obfuscated: false });
      const file = ok ? native.getWebAssemblyOutputFile('app.wasm') : null;
      wasm = file ? new Uint8Array(file.buffer, file.byteOffset, file.byteLength).slice() : null;
      ok = wasm !== null;
    }
    const compileMs = Math.round(performance.now() - started);
    if (ok) return { outcome: { ok: true, compileMs }, wasm };
    const diagnostics = this.diagnostics.length
      ? this.diagnostics
      : [{ file: null, severity: 'error' as const, line: 0, column: 0, message: 'Compilation failed.' }];
    return { outcome: { ok: false, compileMs, diagnostics }, wasm: null };
  }
}

export interface ProgramRun {
  /** Resolves when the program ends by itself (not on timeout: the host decides that). */
  finished: Promise<Termination>;
}

/**
 * Starts a compiled program. Output arrives one UTF-16 code unit at a time through
 * `onStdout`/`onStderr`. A program that waits on timers keeps running after `main`
 * returns, so `poll` (called after `main` and then every few milliseconds) says when it
 * is done: when it returns true, `finished` resolves.
 */
export async function startProgram(
  load: TeaVMLoad,
  wasm: Uint8Array,
  options: {
    deobfuscatorPath: string;
    onStdout: (charCode: number) => void;
    onStderr: (charCode: number) => void;
    poll: () => boolean;
    /** Called once the module is loaded, right before `main`. */
    onStart?: () => void;
  },
): Promise<ProgramRun> {
  let settle!: (t: Termination) => void;
  const finished = new Promise<Termination>((resolve) => (settle = resolve));
  let timer: ReturnType<typeof setInterval> | null = null;
  const end = (t: Termination) => {
    if (timer !== null) clearInterval(timer);
    timer = null;
    settle(t);
  };

  const program = await load(wasm as Uint8Array<ArrayBuffer>, {
    stackDeobfuscator: { enabled: true, path: options.deobfuscatorPath },
    installImports(imports) {
      imports.teavmConsole.putcharStdout = options.onStdout;
      imports.teavmConsole.putcharStderr = options.onStderr;
    },
    onExit: () => end({ kind: 'exited' }),
  });

  options.onStart?.();
  try {
    (program.exports.main as (args: string[]) => void)([]);
  } catch (error) {
    end(classifyError(error));
    return { finished };
  }
  if (options.poll()) end({ kind: 'exited' });
  else timer = setInterval(() => options.poll() && end({ kind: 'exited' }), 10);
  return { finished };
}

/** A JS error thrown out of the program: running out of stack, or a runtime bug. */
export function classifyError(error: unknown): Termination {
  const message = error instanceof Error ? error.message : String(error);
  if (/call stack|too much recursion|stack overflow/i.test(message)) return { kind: 'stackOverflow' };
  return { kind: 'crashed', message };
}
