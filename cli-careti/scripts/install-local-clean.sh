#!/usr/bin/env bash
set -euo pipefail

# Clean prior tgz artifacts and run local install
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

echo "[careti-cli] Removing existing global @caretive/careti-cli (if installed)..."
npm uninstall -g @caretive/careti-cli >/dev/null 2>&1 || true

find cli-caret -maxdepth 1 -name "caretive-careti-cli-*.tgz" -print -delete
bash cli-caret/scripts/build-local.sh install
