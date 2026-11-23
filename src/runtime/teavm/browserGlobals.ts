/**
 * TeaVM's runtime decides it is running in Node when a global `process` exists, then
 * reads files with `node:fs` and exits with `process.exit`. In the browser that global
 * should not exist, but the dev server defines a stub (`process.env.*` for TanStack
 * Start) in every worker. Removing a stub that isn't Node keeps TeaVM on its browser path.
 */
export function removeProcessStub(): void {
  const scope = globalThis as { process?: { versions?: { node?: string } } };
  if (scope.process && !scope.process.versions?.node) delete scope.process;
}
