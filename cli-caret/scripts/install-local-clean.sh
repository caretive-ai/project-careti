#!/usr/bin/env bash
set -euo pipefail

# Clean prior tgz artifacts and run local install
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "${ROOT_DIR}"

BRAND_SLUG="$(node -e '
const pkg = require(process.argv[1])
const displayName = (pkg.displayName || "").trim()
function toBrandSlug(name) {
  const s0 = (name || "").trim().toLowerCase()
  if (!s0) return "caret"
  const s1 = s0.split(/\\s+/).join("-")
  let out = ""
  let lastDash = false
  for (const ch of s1) {
    const isAZ = ch >= "a" && ch <= "z"
    const is09 = ch >= "0" && ch <= "9"
    if (isAZ || is09) {
      out += ch
      lastDash = false
      continue
    }
    if (ch === "-" && !lastDash) {
      out += "-"
      lastDash = true
    }
  }
  out = out.replace(/^-+|-+$/g, "")
  return out || "caret"
}
process.stdout.write(toBrandSlug(displayName))
' "${ROOT_DIR}/package.json")"

PKG_NAME="@caretive/${BRAND_SLUG}-cli"

echo "[caret-cli] Removing existing global ${PKG_NAME} (if installed)..."
npm uninstall -g "${PKG_NAME}" >/dev/null 2>&1 || true

find cli-caret -maxdepth 1 -name "caretive-${BRAND_SLUG}-cli-*.tgz" -print -delete
bash cli-caret/scripts/build-local.sh install
