#!/bin/bash
# 3-way diff 보기
# Usage: ./scripts/3way-diff.sh src/extension.ts

FILE=$1

echo "========================================"
echo "🔍 3-WAY DIFF: $FILE"
echo "========================================"

echo ""
echo "=== 1️⃣ 충돌 소스 (현재 파일, conflict markers 있음) ==="
cat "$FILE"

echo ""
echo ""
echo "=== 2️⃣ 캐럿 소스 (caret-main) ==="
git show caret-main:"$FILE" 2>/dev/null || echo "❌ File not found in caret-main"

echo ""
echo ""
echo "=== 3️⃣ 클라인 소스 (cline-latest) ==="
git show cline-latest:"$FILE" 2>/dev/null || echo "❌ File not found in cline-latest"

echo ""
echo "========================================"
echo "💡 분석 방법:"
echo "  1. 캐럿이 뭘 추가했는가? (2번 소스 확인)"
echo "  2. 클라인이 뭘 변경했는가? (3번 소스 확인)"
echo "  3. 충돌 지점에서 어떻게 통합할까? (1번 소스 수정)"
echo "========================================"
