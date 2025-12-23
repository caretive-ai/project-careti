#!/usr/bin/env bash
set -euo pipefail

# CARET: run existing built caret with given args (no rebuild). If no args, starts interactive mode.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# CARET MODIFICATION: allow running cline via caret script for consistent process handling
TARGET="caret"
if [ "${1:-}" = "--cline" ]; then
  TARGET="cline"
  shift
fi
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
  export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
TARGET_ROOT="$ROOT"
CLI_BIN_NAME="caret"
CONFIG_DIR="${HOME}/.caret"
if [ "$TARGET" = "cline" ]; then
  TARGET_ROOT="${ROOT}/cline"
  CLI_BIN_NAME="cline"
  CONFIG_DIR="${HOME}/.cline"
fi

export PATH="${TARGET_ROOT}/dist-standalone/bin:$PATH"

# CARET: default is to NOT kill other running instances (avoid cline/caret dev conflicts).
# Set CARET_FORCE_KILL=1 to stop only the caret-branded host and caret-configured core.
if [ -n "${CARET_FORCE_KILL:-}" ]; then
  if [ "$TARGET" = "cline" ]; then
    pkill -f "cline-host" >/dev/null 2>&1 || true
    pkill -f "cline-core.*--config[ =]${CONFIG_DIR}" >/dev/null 2>&1 || true
    echo "[info] CARET_FORCE_KILL set; stopped cline host/core processes before run"
  else
    pkill -f "caret-host" >/dev/null 2>&1 || true
    pkill -f "cline-core.*--config[ =]${CONFIG_DIR}" >/dev/null 2>&1 || true
    echo "[info] CARET_FORCE_KILL set; stopped caret host/core processes before run"
  fi
fi

exec "${TARGET_ROOT}/dist-standalone/bin/${CLI_BIN_NAME}" "$@"
