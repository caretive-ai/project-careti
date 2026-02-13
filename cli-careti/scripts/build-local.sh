#!/usr/bin/env bash
set -euo pipefail

# Build caret CLI binaries from ../cli sources (minimal fork)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PKG_DIR="${ROOT_DIR}/cli-careti"
CLI_DIR="${ROOT_DIR}/cli"
OUT_DIR="${ROOT_DIR}/cli-careti/bin"

echo "[careti-cli] Building binaries into ${OUT_DIR} ..."
mkdir -p "${OUT_DIR}"

# Go toolchain check (auto-download to /tmp/go if missing or too old)
"${PKG_DIR}/scripts/ensure-go.sh"
export PATH="/tmp/go/bin:${PATH}"
# CARETI MODIFICATION: keep Go caches inside repo to avoid permission issues
GOCACHE_DIR="${ROOT_DIR}/.cache/go-build"
GOPATH_DIR="${ROOT_DIR}/.gopath"
GOMODCACHE_DIR="${ROOT_DIR}/.cache/go-mod"
mkdir -p "${GOCACHE_DIR}" "${GOPATH_DIR}" "${GOMODCACHE_DIR}"
export GOCACHE="${GOCACHE_DIR}"
export GOPATH="${GOPATH_DIR}"
export GOMODCACHE="${GOMODCACHE_DIR}"
# CARETI MODIFICATION: avoid auto toolchain downloads triggered by go.work
export GOWORK=off
export GOTOOLCHAIN=local

# Ensure protos (TS + Go)
echo "[careti-cli] Running protos (TS)..."
(cd "${ROOT_DIR}" && npm run protos)
echo "[careti-cli] Running protos-go..."
(cd "${ROOT_DIR}" && PATH=/tmp/go/bin:${PATH} GOWORK=off GOTOOLCHAIN=local npm run protos-go)

# Copy extension package.json (for dist-standalone usage)
mkdir -p "${ROOT_DIR}/dist-standalone/extension"
cp "${ROOT_DIR}/package.json" "${ROOT_DIR}/dist-standalone/extension"

# CARETI MODIFICATION: ensure dist-standalone/core is bundled for npm install path
CORE_DIST="${ROOT_DIR}/dist-standalone"
if [[ ! -f "${CORE_DIST}/cline-core.js" ]]; then
  echo "[careti-cli] ERROR: cline-core.js not found in dist-standalone. Run 'npm run compile-standalone-npm' first."
  exit 1
fi
# CARETI MODIFICATION: ensure better-sqlite3 is present in dist-standalone runtime deps
if command -v npm >/dev/null 2>&1 && [[ ! -d "${CORE_DIST}/node_modules/better-sqlite3" ]]; then
  if [[ -d "${ROOT_DIR}/node_modules/better-sqlite3" ]]; then
    mkdir -p "${CORE_DIST}/node_modules"
    rsync -a --delete "${ROOT_DIR}/node_modules/better-sqlite3" "${CORE_DIST}/node_modules/"
  else
    (
      cd "${CORE_DIST}"
      NPM_CACHE_DIR="${ROOT_DIR}/.npm-cache"
      mkdir -p "${NPM_CACHE_DIR}"
      NPM_CONFIG_CACHE="${NPM_CACHE_DIR}" npm install --no-audit --no-fund
    )
  fi
fi
mkdir -p "${PKG_DIR}/dist-standalone"
rsync -a --delete "${CORE_DIST}/" "${PKG_DIR}/dist-standalone/"
# CARETI MODIFICATION: avoid nested .npmignore stripping packaged ripgrep binaries
rm -f "${PKG_DIR}/dist-standalone/.npmignore"
# also place top-level copy for core lookup fallback
cp "${CORE_DIST}/cline-core.js" "${PKG_DIR}/cline-core.js"
# CARETI MODIFICATION: bundle extension directory expected by core
mkdir -p "${PKG_DIR}/extension"
rsync -a --delete "${ROOT_DIR}/dist-standalone/extension/" "${PKG_DIR}/extension/"
# CARETI MODIFICATION: cline-core loads careti-src prompts from extension path even in CLI installs
rsync -a --delete "${ROOT_DIR}/careti-src/" "${PKG_DIR}/extension/careti-src/"
# CARETI MODIFICATION: cline-core reads proto/descriptor_set.pb from package root
mkdir -p "${PKG_DIR}/proto"
cp "${ROOT_DIR}/dist-standalone/proto/descriptor_set.pb" "${PKG_DIR}/proto/"
# CARETI MODIFICATION: rebuild better-sqlite3 against local Node version for CLI runtime
if command -v npm >/dev/null 2>&1; then
  BETTER_SQLITE_DIR=""
  if [[ -d "${CORE_DIST}/binaries/linux-x64/node_modules/better-sqlite3" ]]; then
    BETTER_SQLITE_DIR="${CORE_DIST}/binaries/linux-x64/node_modules/better-sqlite3"
  elif [[ -d "${CORE_DIST}/node_modules/better-sqlite3" ]]; then
    BETTER_SQLITE_DIR="${CORE_DIST}/node_modules/better-sqlite3"
  fi

  if [[ -n "${BETTER_SQLITE_DIR}" ]]; then
    (
      cd "${BETTER_SQLITE_DIR}"
      NPM_CACHE_DIR="${ROOT_DIR}/.npm-cache"
      mkdir -p "${NPM_CACHE_DIR}"
      if ! NPM_CONFIG_CACHE="${NPM_CACHE_DIR}" npm rebuild --build-from-source --unsafe-perm; then
        echo "[careti-cli] Warning: better-sqlite3 rebuild failed; continuing"
      fi
    )
  else
    echo "[careti-cli] Warning: better-sqlite3 not found; skipping rebuild"
  fi
fi

# ldflags (reusing cline globals)
CORE_VERSION=$(node -p "require('${ROOT_DIR}/package.json').version")
CLI_VERSION=$(node -p "require('${ROOT_DIR}/cli/package.json').version")
COMMIT=$(git -C "${ROOT_DIR}" rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
BUILT_BY="${USER:-unknown}"
LDFLAGS="-X 'github.com/cline/cli/pkg/cli/global.Version=${CORE_VERSION}' \
         -X 'github.com/cline/cli/pkg/cli/global.CliVersion=${CLI_VERSION}' \
         -X 'github.com/cline/cli/pkg/cli/global.Commit=${COMMIT}' \
         -X 'github.com/cline/cli/pkg/cli/global.Date=${DATE}' \
         -X 'github.com/cline/cli/pkg/cli/global.BuiltBy=${BUILT_BY}'"

# CARETI MODIFICATION: build platform-specific binaries for cross-platform npm installs
PLATFORMS=(
  "darwin/arm64"
  "darwin/amd64"
  "linux/amd64"
  "linux/arm64"
  "windows/amd64"
)

(
  cd "${CLI_DIR}"
  for platform in "${PLATFORMS[@]}"; do
    GOOS=${platform%/*}
    GOARCH=${platform#*/}
    EXT=""
    if [ "$GOOS" = "windows" ]; then
      EXT=".exe"
    fi

    PATH=/tmp/go/bin:${PATH} GOWORK=off \
      GOOS=$GOOS GOARCH=$GOARCH CGO_ENABLED=0 \
      go build -ldflags "$LDFLAGS" -o "${OUT_DIR}/careti-${GOOS}-${GOARCH}${EXT}" ./cmd/cline

    PATH=/tmp/go/bin:${PATH} GOWORK=off \
      GOOS=$GOOS GOARCH=$GOARCH CGO_ENABLED=0 \
      go build -ldflags "$LDFLAGS" -o "${OUT_DIR}/careti-host-${GOOS}-${GOARCH}${EXT}" ./cmd/cline-host
  done
)

create_wrapper() {
  local name="$1"
  cat > "${OUT_DIR}/${name}" <<EOF
#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const name = ${name@Q};
const platform = process.platform === "win32" ? "windows" : process.platform;
const arch = process.arch === "x64" ? "amd64" : process.arch;
const ext = platform === "windows" ? ".exe" : "";
const binary = path.join(__dirname, \`\${name}-\${platform}-\${arch}\${ext}\`);

if (!fs.existsSync(binary)) {
  console.error(\`[careti-cli] Missing binary: \${binary}\`);
  process.exit(1);
}

const result = spawnSync(binary, process.argv.slice(2), { stdio: "inherit" });
if (result.error) {
  console.error(\`[careti-cli] Failed to run \${binary}: \${result.error.message}\`);
  process.exit(1);
}
process.exit(result.status ?? 1);
EOF
  chmod +x "${OUT_DIR}/${name}"
}

create_wrapper "careti"
create_wrapper "careti-host"
# CARETI MODIFICATION: provide Cline-compatible names for legacy lookups
cp "${OUT_DIR}/careti" "${OUT_DIR}/cline"
cp "${OUT_DIR}/careti-host" "${OUT_DIR}/cline-host"

echo "[careti-cli] Done. Binaries:"
ls -l "${OUT_DIR}"

# Pack & install locally when requested
if [[ "${1:-}" == "install" ]]; then
  cd "${PKG_DIR}"
  echo "[careti-cli] Packing npm tarball..."
  TARBALL=$(npm pack)
  PREFIX=${NPM_CONFIG_PREFIX:-"$HOME/.local"}
  echo "[careti-cli] Installing ${TARBALL} with prefix=${PREFIX} ..."
  NPM_CONFIG_PREFIX="${PREFIX}" npm i -g "${TARBALL}"
  echo "Done. Add to PATH if needed:"
  echo "  export PATH=\"${PREFIX}/bin:\$PATH\""
fi
