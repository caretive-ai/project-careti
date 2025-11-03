#!/bin/bash
# 머징 문제 디버깅 가이드
# Usage: ./scripts/debug-merge.sh src/extension.ts

FILE=$1

echo "🔍 Merge Debugging Guide for: $FILE"
echo ""
echo "⚠️ IMPORTANT: Do NOT try to debug code!"
echo "✅ ALWAYS use 3-way comparison to understand changes"
echo ""
echo "Step 1: View 3-way diff"
echo "  ./scripts/3way-diff.sh $FILE"
echo ""
echo "Step 2: Understand each change"
echo "  - What did Cline improve? (performance, features, refactoring?)"
echo "  - What did Caret add? (branding, i18n, custom logic?)"
echo ""
echo "Step 3: Decide integration strategy"
echo "  Option A: Accept Cline's structure + Re-apply Caret's additions"
echo "  Option B: Keep Caret's structure + Merge Cline's improvements"
echo "  Option C: Create hybrid (both changes in different sections)"
echo ""
echo "Step 4: Apply manually"
echo "  code $FILE"
