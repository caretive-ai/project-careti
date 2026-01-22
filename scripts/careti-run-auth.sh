#!/usr/bin/env bash
set -euo pipefail

# CARET: run existing built caret auth (no rebuild)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
  export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$ROOT/dist-standalone/bin:$PATH"

# CARET: optionally skip killing existing auth/host/core (default: no kill)
if [ -z "${CARET_SKIP_KILL:-}" ]; then
  if pkill -f "careti-host|cline-host|cline-core|cline-host" >/dev/null 2>&1; then
    echo "[info] Stopped existing caret/cline host/core processes before auth run"
  fi
else
  echo "[info] CARET_SKIP_KILL set, skipping host/core shutdown before auth run"
fi

exec "${ROOT}/dist-standalone/bin/caret" auth -v "$@"
