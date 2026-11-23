/**
 * TeaVM's files live in public/teavm/<version>/ (built by scripts/build-teavm.sh) and are
 * served as-is, never bundled. The version folder makes them safe to cache forever.
 */
export const TEAVM_ASSET_VERSION = 'b89345a';

export const TEAVM_FILES = {
  runtime: 'compiler.wasm-runtime.js',
  compiler: 'compiler.wasm',
  sdk: 'compile-classlib-teavm.bin',
  classlib: 'runtime-classlib-teavm.bin',
  deobfuscator: 'deobfuscator.wasm',
} as const;

export function teavmAssetPath(file: string): string {
  return `/teavm/${TEAVM_ASSET_VERSION}/${file}`;
}
