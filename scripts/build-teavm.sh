#!/usr/bin/env bash
# Builds the in-browser Java compiler (teavm-javac) from a pinned commit and
# copies its runtime files into public/teavm/<commit>/.
#
# Needs JDK 25 (set JAVA_HOME) and git. The output is committed, so this only
# runs when upgrading TeaVM: change TEAVM_JAVAC_COMMIT, run it, update
# TEAVM_ASSET_VERSION in src/runtime/teavm/assets.ts, and delete the old folder.
set -euo pipefail

TEAVM_JAVAC_REPO="https://github.com/konsoletyper/teavm-javac.git"
TEAVM_JAVAC_COMMIT="b89345ad7448692ca06fc5e77dfef96eccdbea88"
# The stack-trace deobfuscator ships as a TeaVM Maven artifact; its version must match
# the TeaVM version teavm-javac pins in gradle/libs.versions.toml.
TEAVM_VERSION="0.17.0"
DEOBFUSCATOR_JAR="https://repo1.maven.org/maven2/org/teavm/teavm-wasm-gc-deobfuscator/${TEAVM_VERSION}/teavm-wasm-gc-deobfuscator-${TEAVM_VERSION}.jar"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/teavm/${TEAVM_JAVAC_COMMIT:0:7}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

java_major="$("${JAVA_HOME:-/usr}/bin/java" -version 2>&1 | sed -n 's/.*version "\([0-9]*\).*/\1/p' | head -1)"
if [[ "$java_major" -lt 25 ]]; then
  echo "teavm-javac needs JDK 25+ (found ${java_major:-none}). Set JAVA_HOME." >&2
  exit 1
fi

git clone --quiet "$TEAVM_JAVAC_REPO" "$WORK/teavm-javac"
git -C "$WORK/teavm-javac" checkout --quiet "$TEAVM_JAVAC_COMMIT"
pinned_teavm="$(sed -n 's/^teavm *= *"\(.*\)"/\1/p' "$WORK/teavm-javac/gradle/libs.versions.toml")"
if [[ "$pinned_teavm" != "$TEAVM_VERSION" ]]; then
  echo "teavm-javac pins TeaVM $pinned_teavm, but TEAVM_VERSION is $TEAVM_VERSION." >&2
  exit 1
fi

(cd "$WORK/teavm-javac" && ./gradlew --no-daemon --quiet :compiler:build -x test)

build="$WORK/teavm-javac/compiler/build"
rm -rf "$OUT"
mkdir -p "$OUT"
cp "$build/generated/teavm/wasm-gc/compiler.wasm" \
   "$build/generated/teavm/wasm-gc/compiler.wasm-runtime.js" \
   "$build/classlib/compile-classlib-teavm.bin" \
   "$build/classlib/runtime-classlib-teavm.bin" \
   "$OUT/"
curl --fail --silent --show-error --location -o "$WORK/deobfuscator.jar" "$DEOBFUSCATOR_JAR"
unzip -p "$WORK/deobfuscator.jar" org/teavm/backend/wasm/deobfuscator.wasm > "$OUT/deobfuscator.wasm"

echo "TeaVM files written to ${OUT#"$ROOT"/}:"
ls -l "$OUT"
