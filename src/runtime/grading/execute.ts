import type { RunOutcome, RunRequest, RunResult, SubmitOutcome } from '../types.ts';
import {
  buildProgram,
  compileFailureResult,
  type CompileOutcome,
  type Program,
  type ProgramOutput,
  programResult,
} from './program.ts';

/** Something that can compile a program and then run what it compiled. */
export interface JavaBackend<Artifact> {
  compile(program: Program): Promise<{ outcome: CompileOutcome; artifact: Artifact | null }>;
  run(artifact: Artifact, program: Program, limitMs: number): Promise<ProgramOutput>;
}

/** How long a program may run, compilation not included. */
export const RUN_TIME_LIMIT_MS = 6000;

export function execute<A>(backend: JavaBackend<A>, request: RunRequest & { mode: 'run' }, limitMs?: number): Promise<RunOutcome>;
export function execute<A>(
  backend: JavaBackend<A>,
  request: RunRequest & { mode: 'submit' },
  limitMs?: number,
): Promise<SubmitOutcome>;
export function execute<A>(backend: JavaBackend<A>, request: RunRequest, limitMs?: number): Promise<RunResult>;
export async function execute<Artifact>(
  backend: JavaBackend<Artifact>,
  request: RunRequest,
  limitMs = RUN_TIME_LIMIT_MS,
): Promise<RunResult> {
  const program = buildProgram(request);
  const { outcome, artifact } = await backend.compile(program);
  if (!outcome.ok) return compileFailureResult(request, program, outcome);
  if (artifact === null) throw new Error('Compiler reported success without output');
  const output = await backend.run(artifact, program, limitMs);
  return programResult(request, outcome.compileMs, output);
}
