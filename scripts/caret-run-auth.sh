#!/usr/bin/env bash
set -euo pipefail

# CARET: run existing built caret auth (no rebuild)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
  export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$ROOT/dist-standalone/bin:$PATH"

# CARET: default is to NOT kill other running instances (avoid cline/caret dev conflicts).
# Set CARET_FORCE_KILL=1 to stop only the caret-branded host and caret-configured core.
if [ -n "${CARET_FORCE_KILL:-}" ]; then
  pkill -f "caret-host" >/dev/null 2>&1 || true
  pkill -f "caret-core.*--config[ =]${HOME}/\\.caret" >/dev/null 2>&1 || true
  echo "[info] CARET_FORCE_KILL set; stopped caret host/core processes before auth run"
fi

exec "${ROOT}/dist-standalone/bin/caret" auth -v "$@"
