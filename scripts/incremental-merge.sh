#!/usr/bin/env bash
set -euo pipefail

BASE_REF="v3.38.1"
CARET_REF="backup/attempt2-docs"

CATEGORIES=(
  "proto"
  "src/core/controller"
  "src/core/api"
  "src/core/services"
  "webview-ui"
  "package-root"
  "scripts"
  "docs"
)

apply_category() {
  local category="$1"
  local patch
  patch=$(mktemp)

  case "$category" in
    package-root)
      git diff "$BASE_REF".."$CARET_REF" -- package.json pnpm-lock.yaml tsconfig*.json .vscode .github playwright.config.ts > "$patch"
      ;;
    scripts)
      git diff "$BASE_REF".."$CARET_REF" -- scripts caret-scripts slexn-codecenter > "$patch"
      ;;
    docs)
      git diff "$BASE_REF".."$CARET_REF" -- docs caret-docs .caretrules .claude > "$patch"
      ;;
    *)
      git diff "$BASE_REF".."$CARET_REF" -- "$category" > "$patch"
      ;;
  esac

  if [[ ! -s "$patch" ]]; then
    echo "[$category] 변경 사항 없음"
    rm "$patch"
    return
  fi

  echo "\n=== Applying $category ==="
  echo "diff saved at $patch"
  if git apply --3way --stat "$patch" >/dev/null; then
    git apply --3way "$patch"
    echo "[완료] $category"
  else
    echo "[주의] 자동 적용 실패, 수동 머지 필요 ($patch)"
  fi
}

if [[ ${1:-} == "--list" ]]; then
  printf '%s\n' "${CATEGORIES[@]}"
  exit 0
fi

if [[ ${1:-} != "" ]]; then
  apply_category "$1"
  exit 0
fi

for category in "${CATEGORIES[@]}"; do
  apply_category "$category"
  git status -sb
  read -rp "계속하려면 Enter (중단은 Ctrl+C)" _

done
