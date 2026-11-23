/** Messages between the page and the TeaVM workers. */

import type { CompileOutcome, Program, Termination } from '../grading/program.ts';

export type CompilerRequest = { type: 'compile'; id: number; program: Program };

export type CompilerResponse =
  | { type: 'ready' }
  | { type: 'initError'; message: string }
  | { type: 'compiled'; id: number; outcome: CompileOutcome; wasm: Uint8Array | null }
  | { type: 'compileError'; id: number; message: string };

export type ProgramRequest = { type: 'run'; wasm: Uint8Array };

export type ProgramResponse =
  /** The module is loaded and `main` is about to be called. */
  | { type: 'started' }
  | { type: 'output'; stdout: string; stderr: string }
  | { type: 'exit'; termination: Termination };
