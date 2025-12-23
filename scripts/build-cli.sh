#!/bin/bash
set -eu

# CARET MODIFICATION: build 단계는 기본적으로 caret 인스턴스를 종료 (CARET_SKIP_KILL=1이면 보존)
if [ -n "${CARET_SKIP_KILL:-}" ]; then
    echo "[info] CARET_SKIP_KILL set; keeping existing caret host/core processes running during build"
else
    pkill -f "caret-host" >/dev/null 2>&1 || true
    pkill -f "caret-core.*--config[ =]${HOME}/\\.caret" >/dev/null 2>&1 || true
    echo "[info] Stopped existing caret host/core processes before build copy step"
fi

npm run protos
npm run protos-go

mkdir -p dist-standalone/extension
cp package.json dist-standalone/extension
# CARET MODIFICATION: include Caret prompt JSON sections in standalone build outputs
mkdir -p dist-standalone/extension/caret-src/core/prompts/sections && cp -r caret-src/core/prompts/sections/. dist-standalone/extension/caret-src/core/prompts/sections/

# Extract version information for ldflags
CORE_VERSION=$(node -p "require('./package.json').version")
CLI_VERSION=$(node -p "require('./cli/package.json').version")
COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
DATE=$(date -u '+%Y-%m-%dT%H:%M:%SZ')
BUILT_BY="${USER:-unknown}"

# Build ldflags to inject version info
LDFLAGS="-X 'github.com/cline/cli/pkg/cli/global.Version=${CORE_VERSION}' \
         -X 'github.com/cline/cli/pkg/cli/global.CliVersion=${CLI_VERSION}' \
         -X 'github.com/cline/cli/pkg/cli/global.Commit=${COMMIT}' \
         -X 'github.com/cline/cli/pkg/cli/global.Date=${DATE}' \
         -X 'github.com/cline/cli/pkg/cli/global.BuiltBy=${BUILT_BY}'"

# CARET MODIFICATION: derive CLI binary names from cli/package.json to avoid hardcoding.
CLI_BIN_NAME=$(node -p "Object.keys(require('./cli/package.json').bin || {}).find((n) => n.endsWith('-host') === false) || 'caret'")
CLI_HOST_BIN_NAME=$(node -p "Object.keys(require('./cli/package.json').bin || {}).find((n) => n.endsWith('-host')) || ''")
if [ -z "$CLI_HOST_BIN_NAME" ]; then
  CLI_HOST_BIN_NAME="${CLI_BIN_NAME}-host"
fi

cd cli

# Detect current platform
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Normalize architecture names
case "$ARCH" in
    x86_64)
        ARCH="amd64"
        ;;
    aarch64)
        ARCH="arm64"
        ;;
    arm64)
        ARCH="arm64"
        ;;
esac

# Build for current platform only (brand-aware binary names)
echo "Building for current platform ($OS-$ARCH)..."

GO111MODULE=on go build -ldflags "$LDFLAGS" -o "bin/${CLI_BIN_NAME}" ./cmd/cline
echo "  ✓ bin/${CLI_BIN_NAME} built"

GO111MODULE=on go build -ldflags "$LDFLAGS" -o "bin/${CLI_HOST_BIN_NAME}" ./cmd/cline-host
echo "  ✓ bin/${CLI_HOST_BIN_NAME} built"

echo ""
echo "Build complete for current platform!"

# CARET: ensure legacy cline bins are removed (caret-only distribution)
rm -f bin/cline bin/cline-host

# Copy binaries to dist-standalone/bin with platform-specific names AND generic names
cd ..
mkdir -p dist-standalone/bin
# CARET: clean legacy cline-named outputs (caret-only distribution)
rm -f dist-standalone/bin/cline dist-standalone/bin/cline-* dist-standalone/bin/cline-host dist-standalone/bin/cline-host-*

cp "cli/bin/${CLI_BIN_NAME}" "dist-standalone/bin/${CLI_BIN_NAME}"
cp "cli/bin/${CLI_BIN_NAME}" "dist-standalone/bin/${CLI_BIN_NAME}-${OS}-${ARCH}"
cp "cli/bin/${CLI_HOST_BIN_NAME}" "dist-standalone/bin/${CLI_HOST_BIN_NAME}"
cp "cli/bin/${CLI_HOST_BIN_NAME}" "dist-standalone/bin/${CLI_HOST_BIN_NAME}-${OS}-${ARCH}"
echo "Copied binaries to dist-standalone/bin/ (${CLI_BIN_NAME} naming)"
