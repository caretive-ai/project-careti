#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PKG_DIR="${ROOT_DIR}/cli-caret"

if [[ -z "${CARET_NPM_TOKEN:-}" ]]; then
  echo "[caret-cli] CARET_NPM_TOKEN not set. Set it (e.g., in .env) before publishing." >&2
  exit 1
fi

echo "//registry.npmjs.org/:_authToken=${CARET_NPM_TOKEN}" > "${PKG_DIR}/.npmrc"

cd "${PKG_DIR}"
echo "[caret-cli] Building..."
"${PKG_DIR}/scripts/build-local.sh"

echo "[caret-cli] Packing..."
TARBALL=$(npm pack)
echo "[caret-cli] Publishing ${TARBALL} to npm..."
npm publish "${TARBALL}"

echo "[caret-cli] Publish completed."
