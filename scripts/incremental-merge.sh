#!/usr/bin/env bash
set -euo pipefail

cat <<'NOTE'
[incremental-merge] Placeholder.
TODO: implement category-driven merge runner (proto -> controller -> services -> webview).
Recommended steps per batch:
 1) apply patches for a small file set (5~10 files)
 2) run pnpm exec tsc --noEmit
 3) record checkpoint tag
NOTE
