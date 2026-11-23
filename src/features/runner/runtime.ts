import { useSyncExternalStore } from 'react';
import { TeaVMRuntime } from '@/runtime/teavm/TeaVMRuntime';
import type { JavaRuntime, RuntimeStatus } from '@/runtime/types';

/** The page's one Java runtime. Creating it is cheap; nothing loads until warmup or a run. */
export const javaRuntime: JavaRuntime = new TeaVMRuntime();

const IDLE: RuntimeStatus = { state: 'idle' };

export function useRuntimeStatus(): RuntimeStatus {
  return useSyncExternalStore(javaRuntime.subscribe, javaRuntime.getStatus, () => IDLE);
}
