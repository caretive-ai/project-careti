# Agent Guidelines for Caret-Cline Merge

- Read and follow `.caretrules/build-system.md` and `caret-docs/merging/merge-standard-guide.md` before touching files.
- **Cline-owned files** (`src/`, `webview-ui/`, `scripts/`):
  - Prefer build/lint config tweaks over code edits for merge/lint fixes.
  - If you must change code, keep it to 1–3 lines and add `// CARET MODIFICATION: <reason>` on the block you touched.
- **Baseline first**: 머지 시작 시 upstream `package.json`/정적 자산(`assets/**`, public/icons 등)을 그대로 복사해 빌드·런타임을 먼저 살린 뒤 Caret 브랜딩/기능을 덮어쓴다. (누락된 아이콘/CLI 자산 방지)
- **Caret-owned files** (`caret-src/`, `caret-scripts/`, `caret-docs/`, assets) can be edited freely within feature/branding policies.
- When adding lint/format overrides, keep scope minimal and note the reason in merge docs.
