#!/bin/bash
set -eu

# CARETI MODIFICATION: default는 실행 중 인스턴스를 보존; 강제 종료하려면 CARET_FORCE_KILL=1
if [ -n "${CARET_FORCE_KILL:-}" ]; then
    if pkill -f "careti-host|cline-host|cline-core|careti-core|/bin/caret" >/dev/null 2>&1; then
        echo "[info] Stopped existing caret/cline host/core/cli processes before build copy step"
    fi
else
    echo "[info] CARET_FORCE_KILL not set; keeping existing host/core processes running during build"
fi

npm run protos
npm run protos-go

mkdir -p dist-standalone/extension
cp package.json dist-standalone/extension

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

# Build for current platform only (Caret binary names)
echo "Building for current platform ($OS-$ARCH)..."

GO111MODULE=on go build -ldflags "$LDFLAGS" -o bin/caret ./cmd/cline
echo "  ✓ bin/caret built"

GO111MODULE=on go build -ldflags "$LDFLAGS" -o bin/careti-host ./cmd/cline-host
echo "  ✓ bin/careti-host built"

echo ""
echo "Build complete for current platform!"

# CARET: ensure careti-only binary names (legacy cline bins removed)
rm -f bin/cline bin/cline-host

# Copy binaries to dist-standalone/bin with platform-specific names AND generic names
cd ..
mkdir -p dist-standalone/bin
# CARET: clean legacy cline-named outputs (careti-only distribution)
rm -f dist-standalone/bin/cline dist-standalone/bin/cline-* dist-standalone/bin/cline-host dist-standalone/bin/cline-host-*

cp cli/bin/caret dist-standalone/bin/caret
cp cli/bin/caret dist-standalone/bin/careti-${OS}-${ARCH}
cp cli/bin/careti-host dist-standalone/bin/careti-host
cp cli/bin/careti-host dist-standalone/bin/careti-host-${OS}-${ARCH}
echo "Copied binaries to dist-standalone/bin/ (Caret naming)"
