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
# CARET: 기본은 실행 중 인스턴스를 종료하고 빌드 (CARE_SKIP_KILL=1이면 보존)
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
# Build standalone JS bundle for local run
npm run compile-standalone
# CARET MODIFICATION: package-standalone를 포함해 dist-standalone/runtime 의존성 준비
npm run postcompile-standalone
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
