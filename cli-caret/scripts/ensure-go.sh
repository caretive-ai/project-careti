#!/usr/bin/env bash
set -euo pipefail

# Ensure Go is available (local portable install to /tmp/go if missing)

if command -v go >/dev/null 2>&1; then
  exit 0
fi

if [[ -x "/tmp/go/bin/go" ]]; then
  export PATH="/tmp/go/bin:${PATH}"
  exit 0
fi

echo "[caret-cli] Go not found. Downloading portable Go to /tmp/go ..."
GO_VERSION="1.23.0"
TAR="go${GO_VERSION}.linux-amd64.tar.gz"
URL="https://go.dev/dl/${TAR}"

mkdir -p /tmp
cd /tmp
curl -fsSLO "${URL}"
rm -rf /tmp/go
tar -C /tmp -xzf "${TAR}"
export PATH="/tmp/go/bin:${PATH}"
echo "[caret-cli] Go installed to /tmp/go"
