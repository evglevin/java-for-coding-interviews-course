/// <reference lib="webworker" />
/** Owns the TeaVM compiler, kept warm between runs. */

import type { CompilerRequest, CompilerResponse } from './protocol.ts';
import { TEAVM_FILES, teavmAssetPath } from './assets.ts';
import { removeProcessStub } from './browserGlobals.ts';
import { TeaVMCompiler, type TeaVMLoad } from './teavm.ts';

declare const self: DedicatedWorkerGlobalScope;

removeProcessStub();

const post = (message: CompilerResponse, transfer: Transferable[] = []) => self.postMessage(message, transfer);
const assetUrl = (file: string) => new URL(teavmAssetPath(file), self.location.origin).href;

async function fetchBytes(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not download ${url} (${response.status})`);
  return response.arrayBuffer();
}

async function init(): Promise<TeaVMCompiler> {
  const { load } = (await import(/* @vite-ignore */ assetUrl(TEAVM_FILES.runtime))) as { load: TeaVMLoad };
  const [sdk, classlib] = await Promise.all([fetchBytes(assetUrl(TEAVM_FILES.sdk)), fetchBytes(assetUrl(TEAVM_FILES.classlib))]);
  return TeaVMCompiler.create(load, { compilerWasm: assetUrl(TEAVM_FILES.compiler), sdk, classlib });
}

const compiler = init();
compiler.then(
  () => post({ type: 'ready' }),
  (error: unknown) => post({ type: 'initError', message: error instanceof Error ? error.message : String(error) }),
);

self.onmessage = async ({ data }: MessageEvent<CompilerRequest>) => {
  try {
    const { outcome, wasm } = await (await compiler).compile(data.program);
    post({ type: 'compiled', id: data.id, outcome, wasm }, wasm ? [wasm.buffer] : []);
  } catch (error) {
    post({ type: 'compileError', id: data.id, message: error instanceof Error ? error.message : String(error) });
  }
};
