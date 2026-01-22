#!/usr/bin/env bash
set -euo pipefail

# Wrapper to build and install caret CLI locally
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

bash cli-caret/scripts/build-local.sh install
