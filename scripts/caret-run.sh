#!/usr/bin/env bash
set -euo pipefail

# CARET: run existing built caret with given args (default: version), no rebuild
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
  export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$ROOT/dist-standalone/bin:$PATH"

# CARET: optionally skip killing existing host/core (default: no kill)
if [ -z "${CARET_SKIP_KILL:-}" ]; then
  if pkill -f "caret-host|cline-host|cline-core|cline-host" >/dev/null 2>&1; then
    echo "[info] Stopped existing caret/cline host/core processes before run"
  fi
else
  echo "[info] CARET_SKIP_KILL set, skipping host/core shutdown before run"
fi

if [ "$#" -eq 0 ]; then
  exec "${ROOT}/dist-standalone/bin/caret"
fi

exec "${ROOT}/dist-standalone/bin/caret" "$@"
