#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PKG_DIR="${ROOT_DIR}/cli-caret"
ENV_FILE="${ROOT_DIR}/.env"

if [[ -z "${CARET_NPM_TOKEN:-}" && -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

if [[ -z "${CARET_NPM_TOKEN:-}" ]]; then
  echo "[careti-cli] CARET_NPM_TOKEN not set. Add it to .env or export it before publishing." >&2
  exit 1
fi

echo "//registry.npmjs.org/:_authToken=${CARET_NPM_TOKEN}" > "${PKG_DIR}/.npmrc"

cd "${PKG_DIR}"
echo "[careti-cli] Building..."
"${PKG_DIR}/scripts/build-local.sh"

echo "[careti-cli] Packing..."
TARBALL=$(npm pack)
echo "[careti-cli] Publishing ${TARBALL} to npm..."
npm publish "${TARBALL}"

echo "[careti-cli] Publish completed."
