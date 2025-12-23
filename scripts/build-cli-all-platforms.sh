#!/bin/bash
set -eu

npm run protos
npm run protos-go
# CARET MODIFICATION: include standalone JS bundle for all-platform CLI artifacts
npm run compile-standalone

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

# Define target platforms for cross-compilation
PLATFORMS=(
  "darwin/arm64"
  "darwin/amd64"
  "linux/amd64"
  "linux/arm64"
)

# Build binaries for all platforms
for platform in "${PLATFORMS[@]}"; do
  GOOS=${platform%/*}
  GOARCH=${platform#*/}
  
  echo "Building for $GOOS/$GOARCH..."
  
  # Build CLI binary
  OUTPUT_NAME="bin/${CLI_BIN_NAME}-${GOOS}-${GOARCH}"
  if [ "$GOOS" = "windows" ]; then
    OUTPUT_NAME="${OUTPUT_NAME}.exe"
  fi
  
  GO111MODULE=on GOOS=$GOOS GOARCH=$GOARCH go build -ldflags "$LDFLAGS" -o "$OUTPUT_NAME" ./cmd/cline
  echo "  ✓ $OUTPUT_NAME built"
  
  # Build CLI host binary
  OUTPUT_NAME="bin/${CLI_HOST_BIN_NAME}-${GOOS}-${GOARCH}"
  if [ "$GOOS" = "windows" ]; then
    OUTPUT_NAME="${OUTPUT_NAME}.exe"
  fi
  
  GO111MODULE=on GOOS=$GOOS GOARCH=$GOARCH go build -ldflags "$LDFLAGS" -o "$OUTPUT_NAME" ./cmd/cline-host
  echo "  ✓ $OUTPUT_NAME built"
done

echo ""
echo "All platform binaries built successfully!"

# Copy binaries to dist-standalone/bin
cd ..
mkdir -p dist-standalone/bin
rm -f dist-standalone/bin/cline-* dist-standalone/bin/cline-host-*
cp "cli/bin/${CLI_BIN_NAME}-"* dist-standalone/bin/
cp "cli/bin/${CLI_HOST_BIN_NAME}-"* dist-standalone/bin/
echo "Copied all platform binaries to dist-standalone/bin/"
