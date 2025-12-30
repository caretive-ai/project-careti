#!/usr/bin/env bash
set -euo pipefail

# CARET: rebuild CLI (protos + Go) and run caret with provided args (default: version)
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Prefer Node 20 if available (avoid system node mismatch)
if [ -d "$HOME/.config/nvm/versions/node/v20.19.5/bin" ]; then
	export PATH="$HOME/.config/nvm/versions/node/v20.19.5/bin:$PATH"
fi
export PATH="$HOME/go/bin:$PATH"
export GOCACHE="${ROOT}/.cache/go-build"
export CARET_FORCE_KILL="${CARET_FORCE_KILL:-1}" # CARET MODIFICATION: ensure build copy can overwrite running binaries

pushd "$ROOT" >/dev/null
# CARET MODIFICATION: default는 실행 중 인스턴스를 종료하고 빌드 (CARET_SKIP_KILL=1이면 보존)
if [ -n "${CARET_SKIP_KILL:-}" ]; then
  echo "[info] CARET_SKIP_KILL set; keeping existing host/core processes running during rebuild"
else
  pkill -f "caret-host|cline-host|cline-core|caret-core|/bin/caret" >/dev/null 2>&1 && \
    echo "[info] Stopped existing caret/cline host/core/cli processes before rebuild"
  rm -f "$HOME/.caret/locks.db" "$HOME/.cline/locks.db"
fi
npm run protos
npm run protos-go
# CARET MODIFICATION: Node 버전 불일치로 인한 better-sqlite3 로딩 실패 방지
npm rebuild better-sqlite3
bash scripts/build-cli.sh
# CARET MODIFICATION: standalone 빌드 산출물(cline-core.js) 포함
npm run compile-standalone
npm run postcompile-standalone
export PATH="${ROOT}/dist-standalone/bin:$PATH"

if [ "$#" -eq 0 ]; then
  exec "${ROOT}/dist-standalone/bin/caret"
fi

exec "${ROOT}/dist-standalone/bin/caret" "$@"
