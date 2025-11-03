#!/bin/bash

# Caret 파일 자동 복사 스크립트
# 사용법: ./scripts/sync-caret-files.sh

set -e

echo "📦 Syncing Caret files from caret-main..."
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
SUCCESS=0
MISSING=0
FAILED=0

# Function to copy file
copy_file() {
  local file=$1
  if [ -f "caret-main/$file" ]; then
    mkdir -p "$(dirname "$file")"
    if cp "caret-main/$file" "$file"; then
      echo -e "${GREEN}✅ Copied:${NC} $file"
      ((SUCCESS++))
    else
      echo -e "${RED}❌ Failed:${NC} $file"
      ((FAILED++))
    fi
  else
    echo -e "${YELLOW}⚠️  Missing:${NC} caret-main/$file"
    ((MISSING++))
  fi
}

# Function to copy directory
copy_dir() {
  local dir=$1
  if [ -d "caret-main/$dir" ]; then
    mkdir -p "$(dirname "$dir")"
    if cp -r "caret-main/$dir" "$dir"; then
      echo -e "${GREEN}✅ Copied dir:${NC} $dir"
      ((SUCCESS++))
    else
      echo -e "${RED}❌ Failed dir:${NC} $dir"
      ((FAILED++))
    fi
  else
    echo -e "${YELLOW}⚠️  Missing dir:${NC} caret-main/$dir"
    ((MISSING++))
  fi
}

echo "📋 Part 1: Critical Frontend Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Critical Frontend Files
copy_file "webview-ui/src/App.tsx"
copy_file "webview-ui/src/Providers.tsx"
copy_file "webview-ui/src/components/welcome/WelcomeView.tsx"
copy_file "webview-ui/src/components/chat/ChatView.tsx"
copy_file "webview-ui/src/components/settings/SettingsView.tsx"
copy_file "webview-ui/src/components/settings/ApiOptions.tsx"
copy_file "webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx"
copy_file "webview-ui/src/components/common/TelemetryBanner.tsx"

echo ""
echo "📋 Part 2: Critical Frontend Directories"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Critical Directories
copy_dir "webview-ui/src/caret"
copy_dir "webview-ui/src/components/settings/sections"
copy_dir "webview-ui/src/components/chat/task-header"

echo ""
echo "📋 Part 3: Backend Files"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Backend files (if needed)
# Uncomment if you want to sync backend files too
# copy_file "src/core/storage/disk.ts"
# copy_file "src/extension.ts"

echo ""
echo "📋 Part 4: Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

copy_file "CHANGELOG.md"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo -e "${GREEN}✅ Success: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Missing: $MISSING${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${RED}⚠️  Some files failed to copy. Please check manually.${NC}"
  exit 1
fi

if [ $MISSING -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Some files were missing in caret-main.${NC}"
fi

echo "✅ Sync completed!"
echo ""
echo "🔍 Next steps:"
echo "  1. npm run compile         # Verify TypeScript compilation"
echo "  2. npm run lint            # Check linting"
echo "  3. F5                      # Launch Extension Development Host"
echo "  4. DevTools                # Verify runtime behavior"
echo "  5. Take screenshots        # Document successful integration"
echo ""
