#!/usr/bin/env bash
set -euo pipefail

# Build caret CLI binaries from ../cli sources (minimal fork)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PKG_DIR="${ROOT_DIR}/cli-caret"
CLI_DIR="${ROOT_DIR}/cli"
OUT_DIR="${ROOT_DIR}/cli-caret/bin"

BRAND_DISPLAY_NAME="$(node -p "require('${ROOT_DIR}/package.json').displayName || 'Caret'")"
BRAND_SLUG="$(node -e '
const pkg = require(process.argv[1])
const displayName = (pkg.displayName || "").trim()
function toBrandSlug(name) {
  const s0 = (name || "").trim().toLowerCase()
  if (!s0) return "caret"
  const s1 = s0.split(/\\s+/).join("-")
  let out = ""
  let lastDash = false
  for (const ch of s1) {
    const isAZ = ch >= "a" && ch <= "z"
    const is09 = ch >= "0" && ch <= "9"
    if (isAZ || is09) {
      out += ch
      lastDash = false
      continue
    }
    if (ch === "-" && !lastDash) {
      out += "-"
      lastDash = true
    }
  }
  out = out.replace(/^-+|-+$/g, "")
  return out || "caret"
}
process.stdout.write(toBrandSlug(displayName))
' "${ROOT_DIR}/package.json")"

CLI_COMMAND_NAME="${BRAND_SLUG}"
HOST_COMMAND_NAME="${BRAND_SLUG}-host"
NPM_PACKAGE_NAME="@caretive/${BRAND_SLUG}-cli"

echo "[caret-cli] Brand: ${BRAND_DISPLAY_NAME} (slug=${BRAND_SLUG})"

export ROOT_DIR
export PKG_DIR
export BRAND_DISPLAY_NAME
export CLI_COMMAND_NAME
export HOST_COMMAND_NAME
export NPM_PACKAGE_NAME

node - <<'NODE'
const fs = require('fs')
const path = require('path')

const pkgDir = process.env.PKG_DIR
const rootDir = process.env.ROOT_DIR
const brandDisplayName = process.env.BRAND_DISPLAY_NAME
const npmPackageName = process.env.NPM_PACKAGE_NAME
const cliCommandName = process.env.CLI_COMMAND_NAME
const hostCommandName = process.env.HOST_COMMAND_NAME

const pkgPath = path.join(pkgDir, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
const rootPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
const cliPkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'cli', 'package.json'), 'utf8'))

pkg.name = npmPackageName
pkg.version = cliPkg.version
pkg.displayName = brandDisplayName
pkg.description = `${brandDisplayName} CLI (minimal fork, packaged for caretive)`
pkg.bin = {
  [cliCommandName]: `./bin/${cliCommandName}`,
  [hostCommandName]: `./bin/${hostCommandName}`,
}

if (rootPkg.repository) pkg.repository = rootPkg.repository
if (rootPkg.bugs) pkg.bugs = rootPkg.bugs

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '\t') + '\n')
NODE

echo "[caret-cli] Building binaries into ${OUT_DIR} ..."
mkdir -p "${OUT_DIR}"
rm -f "${OUT_DIR}/"* 2>/dev/null || true

# Go toolchain check (auto-download to /tmp/go if missing)
if ! command -v go >/dev/null 2>&1 && [[ ! -x "/tmp/go/bin/go" ]]; then
  "${PKG_DIR}/scripts/ensure-go.sh"
fi
export PATH="/tmp/go/bin:${PATH}"

# Ensure protos (TS + Go)
echo "[caret-cli] Running protos (TS)..."
npm run protos
echo "[caret-cli] Running protos-go..."
PATH=/tmp/go/bin:${PATH} npm run protos-go

# Copy extension package.json (for dist-standalone usage)
mkdir -p "${ROOT_DIR}/dist-standalone/extension"
cp "${ROOT_DIR}/package.json" "${ROOT_DIR}/dist-standalone/extension"

# CARET MODIFICATION: ensure dist-standalone/core is bundled for npm install path
CORE_DIST="${ROOT_DIR}/dist-standalone"
if [[ ! -f "${CORE_DIST}/cline-core.js" ]]; then
  echo "[caret-cli] ERROR: cline-core.js not found in dist-standalone. Run 'npm run compile-standalone-npm' first."
  exit 1
fi
mkdir -p "${PKG_DIR}/dist-standalone"
rsync -a --delete "${CORE_DIST}/" "${PKG_DIR}/dist-standalone/"
# also place top-level copy for core lookup fallback
cp "${CORE_DIST}/cline-core.js" "${PKG_DIR}/cline-core.js"
# CARET MODIFICATION: bundle extension directory expected by core
mkdir -p "${PKG_DIR}/extension"
rsync -a --delete "${ROOT_DIR}/dist-standalone/extension/" "${PKG_DIR}/extension/"
# CARET MODIFICATION: cline-core loads caret-src prompts from extension path even in CLI installs
rsync -a --delete "${ROOT_DIR}/caret-src/" "${PKG_DIR}/extension/caret-src/"
# CARET MODIFICATION: cline-core reads proto/descriptor_set.pb from package root
mkdir -p "${PKG_DIR}/proto"
cp "${ROOT_DIR}/dist-standalone/proto/descriptor_set.pb" "${PKG_DIR}/proto/"
# CARET MODIFICATION: rebuild better-sqlite3 against local Node version for CLI runtime
if command -v npm >/dev/null 2>&1; then
  (
    cd "${PKG_DIR}/dist-standalone/binaries/linux-x64/node_modules/better-sqlite3"
    npm rebuild --build-from-source --unsafe-perm
  )
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

(
  cd "${CLI_DIR}"
  PATH=/tmp/go/bin:${PATH} GOWORK=off GOCACHE=/tmp/go-build \
    go build -ldflags "$LDFLAGS" -o "${OUT_DIR}/${CLI_COMMAND_NAME}" ./cmd/cline

  PATH=/tmp/go/bin:${PATH} GOWORK=off GOCACHE=/tmp/go-build \
    go build -ldflags "$LDFLAGS" -o "${OUT_DIR}/${HOST_COMMAND_NAME}" ./cmd/cline-host
)

echo "[caret-cli] Done. Binaries:"
ls -l "${OUT_DIR}"

# Pack & install locally when requested
if [[ "${1:-}" == "install" ]]; then
  cd "${PKG_DIR}"
  echo "[caret-cli] Packing npm tarball..."
  TARBALL=$(npm pack)
  PREFIX=${NPM_CONFIG_PREFIX:-"$HOME/.local"}
  echo "[caret-cli] Installing ${TARBALL} with prefix=${PREFIX} ..."
  NPM_CONFIG_PREFIX="${PREFIX}" npm i -g "${TARBALL}"
  echo "Done. Add to PATH if needed:"
  echo "  export PATH=\"${PREFIX}/bin:\$PATH\""
fi
