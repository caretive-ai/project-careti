#!/usr/bin/env bash
set -euo pipefail

# Ensure Go is available (local portable install to /tmp/go if missing or too old)

MIN_GO_VERSION="1.24.0"

version_ge() {
  [[ "$1" == "$2" ]] && return 0
  local first
  first=$(printf '%s\n' "$1" "$2" | sort -V | head -n1)
  [[ "$first" == "$2" ]]
}

get_go_version() {
  local go_bin="$1"
  GOWORK=off GOTOOLCHAIN=local "$go_bin" env GOVERSION 2>/dev/null | sed 's/^go//'
}

use_go_if_sufficient() {
  local go_bin="$1"
  if [[ -x "$go_bin" ]]; then
    local current
    current=$(get_go_version "$go_bin")
    if [[ -n "$current" ]] && version_ge "$current" "$MIN_GO_VERSION"; then
      export PATH="$(dirname "$go_bin"):${PATH}"
      return 0
    fi
  fi
  return 1
}

if use_go_if_sufficient "/tmp/go/bin/go"; then
  exit 0
fi

if command -v go >/dev/null 2>&1; then
  if use_go_if_sufficient "$(command -v go)"; then
    exit 0
  fi
fi

echo "[careti-cli] Go not found. Downloading portable Go to /tmp/go ..."
GO_VERSION="1.24.0"
TAR="go${GO_VERSION}.linux-amd64.tar.gz"
URL="https://go.dev/dl/${TAR}"

mkdir -p /tmp
cd /tmp
curl -fsSLO "${URL}"
rm -rf /tmp/go
tar -C /tmp -xzf "${TAR}"
export PATH="/tmp/go/bin:${PATH}"
echo "[careti-cli] Go installed to /tmp/go"
