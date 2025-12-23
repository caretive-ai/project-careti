#!/usr/bin/env bash
set -euo pipefail

# CARET: rebuild CLI (protos + Go) and run caret auth with local binaries
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Prefer Node 20 if available (avoid system node mismatch)
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
	export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$HOME/go/bin:$PATH"
export GOCACHE="${ROOT}/.cache/go-build"
export GOPATH="${ROOT}/.gopath" # CARET: isolate Go module/cache to project

pushd "$ROOT" >/dev/null
# CARET: 기본은 실행 중 인스턴스를 종료하고 빌드 (CARET_SKIP_KILL=1이면 보존)
if [ -n "${CARET_SKIP_KILL:-}" ]; then
  echo "[info] CARET_SKIP_KILL set; keeping existing host/core processes running during rebuild"
else
  # CARET: only stop caret-branded processes; do not touch cline (separate product)
  pkill -f "caret-host" >/dev/null 2>&1 || true
  pkill -f "caret-core.*--config[ =]${HOME}/\\.caret" >/dev/null 2>&1 || true
  pkill -f "/dist-standalone/bin/caret(\\s|$)" >/dev/null 2>&1 || true
  echo "[info] Stopped existing caret host/core/cli processes before rebuild"
  rm -f "$HOME/.caret/locks.db"
fi

npm run protos
npm run protos-go
# Build standalone JS bundle for local run
npm run compile-standalone
# CARET MODIFICATION: allow selecting core source (caret default, cline override via CARET_CORE_SOURCE=cline).
CORE_SOURCE="${CARET_CORE_SOURCE:-caret}"
CLI_COMMAND_NAME="$(node -p "Object.keys(require('./cli/package.json').bin || {}).find((n) => n.endsWith('-host') === false) || 'caret'")"
if [ "${CORE_SOURCE}" = "cline" ]; then
  if [ -d "${ROOT}/cline" ]; then
    echo "[info] Building cline core for CLI baseline (${CLI_COMMAND_NAME}-core.js)"
    (cd "${ROOT}/cline" && node esbuild.mjs --standalone)
    if [ -f "${ROOT}/cline/dist-standalone/cline-core.js" ]; then
      cp "${ROOT}/cline/dist-standalone/cline-core.js" "${ROOT}/dist-standalone/${CLI_COMMAND_NAME}-core.js"
      if [ -f "${ROOT}/cline/dist-standalone/cline-core.js.map" ]; then
        cp "${ROOT}/cline/dist-standalone/cline-core.js.map" "${ROOT}/dist-standalone/${CLI_COMMAND_NAME}-core.js.map"
      fi
    else
      echo "[warn] cline/dist-standalone/cline-core.js not found; skipping core copy"
    fi
  else
    echo "[warn] cline/ directory not found; skipping core copy"
  fi
fi
# CARET: ensure prompt sections are packaged for core startup
mkdir -p "${ROOT}/dist-standalone/extension/caret-src/core/prompts/sections"
cp -r "${ROOT}/caret-src/core/prompts/sections/." "${ROOT}/dist-standalone/extension/caret-src/core/prompts/sections/"
bash scripts/build-cli.sh
export PATH="${ROOT}/dist-standalone/bin:$PATH"
if [ -n "${CARET_AUTH_KILL:-}" ]; then
  exec "${ROOT}/dist-standalone/bin/caret" auth -v
else
  # Leave auth instance running for manual checks unless CARET_AUTH_KILL is set
  exec "${ROOT}/dist-standalone/bin/caret" auth -v
fi
