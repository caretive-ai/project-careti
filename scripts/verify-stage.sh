#!/bin/bash
# 스테이지 검증
# Usage: ./scripts/verify-stage.sh 1

STAGE=$1

echo "🔍 Verifying Stage $STAGE..."

# 컴파일
npm run compile 2>&1 | tee .work-logs/verify-stage-$STAGE-compile.log
if [ $? -ne 0 ]; then
  echo "❌ Compilation failed"
  echo "💡 Check: .work-logs/verify-stage-$STAGE-compile.log"
  exit 1
fi

# 타입 체크
npm run check-types 2>&1 | tee .work-logs/verify-stage-$STAGE-types.log
if [ $? -ne 0 ]; then
  echo "❌ Type checking failed"
  echo "💡 Check: .work-logs/verify-stage-$STAGE-types.log"
  exit 1
fi

echo "✅ Stage $STAGE verification passed"
