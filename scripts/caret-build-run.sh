#!/usr/bin/env bash
set -euo pipefail

# CARET: rebuild CLI (protos + Go) and run caret with provided args (default: version)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# CARET MODIFICATION: allow building/running cline via caret script for consistent process handling
TARGET="caret"
if [ "${1:-}" = "--cline" ]; then
  TARGET="cline"
  shift
fi
# Prefer Node 20 if available (avoid system node mismatch)
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
	export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$HOME/go/bin:$PATH"
export GOCACHE="${ROOT}/.cache/go-build"

TARGET_ROOT="$ROOT"
CLI_BIN_NAME="caret"
CONFIG_DIR="${HOME}/.caret"
if [ "$TARGET" = "cline" ]; then
  TARGET_ROOT="${ROOT}/cline"
  CLI_BIN_NAME="cline"
  CONFIG_DIR="${HOME}/.cline"
fi

pushd "$TARGET_ROOT" >/dev/null
# CARET: 기본은 실행 중 caret 인스턴스를 종료하고 빌드 (CARET_SKIP_KILL=1이면 보존)
if [ -n "${CARET_SKIP_KILL:-}" ]; then
  echo "[info] CARET_SKIP_KILL set; keeping existing ${CLI_BIN_NAME} host/core processes running during rebuild"
else
  if [ "$TARGET" = "cline" ]; then
    pkill -f "cline-host" >/dev/null 2>&1 || true
    pkill -f "cline-core.*--config[ =]${HOME}/\\.cline" >/dev/null 2>&1 || true
    pkill -f "/dist-standalone/bin/cline(\\s|$)" >/dev/null 2>&1 || true
    echo "[info] Stopped existing cline host/core/cli processes before rebuild"
    rm -f "$HOME/.cline/locks.db"
  else
    pkill -f "caret-host" >/dev/null 2>&1 || true
    pkill -f "caret-core.*--config[ =]${HOME}/\\.caret" >/dev/null 2>&1 || true
    pkill -f "/dist-standalone/bin/caret(\\s|$)" >/dev/null 2>&1 || true
    echo "[info] Stopped existing caret host/core/cli processes before rebuild"
    rm -f "$HOME/.caret/locks.db"
  fi
fi

# CARET MODIFICATION: use cline-safe build path (skip biome postprotos) to keep workspace-compatible
if [ "$TARGET" = "cline" ]; then
  npm_config_ignore_scripts=true npm run protos
  npm_config_ignore_scripts=true npm run protos-go
  node esbuild.mjs --standalone
  node scripts/package-standalone.mjs
  npm_config_ignore_scripts=true bash scripts/build-cli.sh
else
  npm run protos
  npm run protos-go
  # CARET MODIFICATION: include standalone JS bundle for CLI runs
  npm run compile-standalone
  # CARET MODIFICATION: allow selecting core source (cline default, caret override via CARET_CORE_SOURCE=caret).
  CORE_SOURCE="${CARET_CORE_SOURCE:-cline}"
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
  bash scripts/build-cli.sh
fi
export PATH="${TARGET_ROOT}/dist-standalone/bin:$PATH"

if [ "$#" -eq 0 ]; then
  set -- version
fi

exec "${TARGET_ROOT}/dist-standalone/bin/${CLI_BIN_NAME}" "$@"
