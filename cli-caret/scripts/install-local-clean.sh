#!/usr/bin/env bash
set -euo pipefail

# Clean prior tgz artifacts and run local install
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "[caret-cli] Removing existing global @caretive/caret-cli (if installed)..."
npm uninstall -g @caretive/caret-cli >/dev/null 2>&1 || true

find cli-caret -maxdepth 1 -name "caretive-caret-cli-*.tgz" -print -delete
bash cli-caret/scripts/build-local.sh install
