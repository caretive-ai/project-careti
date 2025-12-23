#!/usr/bin/env bash
set -euo pipefail

# End-to-end Caret CLI auth test against the local mock API.
# - Kills running caret core/host (does not touch cline)
# - Scrubs Caret/Cline tokens from ~/.caret/data
# - Starts the mock API (scripts/mock-caret-api.js)
# - Launches `caret auth -v` against CARET_ENVIRONMENT=local
# - Cleans up the mock server on exit

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOCK_PORT="${MOCK_CARET_PORT:-8000}"

if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
  export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$ROOT/dist-standalone/bin:$PATH"

kill_procs() {
  pkill -f "caret-host" >/dev/null 2>&1 || true
  pkill -f "caret-core.*--config[ =]${HOME}/\\.caret" >/dev/null 2>&1 || true
  pkill -f "caret-core" >/dev/null 2>&1 || true
  echo "[info] Stopped existing caret host/core processes"
}

scrub_state() {
  local ts
  ts=$(date +%Y%m%d%H%M%S)
  mkdir -p "$HOME/.caret/data"
  if [ -f "$HOME/.caret/data/secrets.json" ]; then
    cp "$HOME/.caret/data/secrets.json" "$HOME/.caret/data/secrets.json.bak.$ts"
  fi
  if [ -f "$HOME/.caret/data/globalState.json" ]; then
    cp "$HOME/.caret/data/globalState.json" "$HOME/.caret/data/globalState.json.bak.$ts"
  fi

  python3 - <<'PY'
import json, pathlib
paths = [
    pathlib.Path("~/.caret/data/secrets.json").expanduser(),
    pathlib.Path("~/.caret/data/globalState.json").expanduser(),
]
for p in paths:
    if not p.exists():
        continue
    try:
        data = json.loads(p.read_text())
    except Exception as e:
        print(f"[warn] failed to read {p}: {e}")
        continue
    for key in ["caret:caretAccountId", "caretAccountId", "cline:clineAccountId", "clineAccountId", "userInfo"]:
        data.pop(key, None)
    p.write_text(json.dumps(data, indent=2))
    print(f"[info] scrubbed keys in {p}")
PY

  if [ -n "${CARET_PURGE_STATE:-}" ]; then
    rm -rf "$HOME/.caret/data/state"
    echo "[info] Purged ~/.caret/data/state"
  fi
}

start_mock() {
  node "$ROOT/scripts/mock-caret-api.js" > /tmp/mock-caret-api.log 2>&1 &
  MOCK_PID=$!
  echo "[info] mock-caret-api running on http://localhost:${MOCK_PORT} (pid ${MOCK_PID})"
}

cleanup() {
  if [ -n "${MOCK_PID:-}" ]; then
    kill "${MOCK_PID}" >/dev/null 2>&1 || true
    echo "[info] stopped mock-caret-api (pid ${MOCK_PID})"
  fi
}

trap cleanup EXIT

kill_procs
scrub_state
start_mock

CARET_ENVIRONMENT_OVERRIDE=local "${ROOT}/scripts/caret-run-auth.sh"
