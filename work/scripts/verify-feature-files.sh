#!/bin/bash

# Feature 문서 보강을 위한 파일 검증 스크립트
# 사용법: ./verify-feature-files.sh <feature-id>
# 예: ./verify-feature-files.sh f06

set -e

FEATURE_ID=$1
CLINE_LATEST="cline-latest"
OUTPUT_DIR="work/verification-reports"

if [ -z "$FEATURE_ID" ]; then
    echo "❌ Usage: $0 <feature-id>"
    echo "   Example: $0 f06"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
REPORT_FILE="$OUTPUT_DIR/${FEATURE_ID}-verification-$(date +%Y%m%d-%H%M%S).md"

echo "# Feature ${FEATURE_ID} 검증 보고서" > "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "**생성일**: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_FILE"
echo "**검증 기준**: cline-latest 대비 실제 변경사항" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "---" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Feature별 파일 목록 정의
declare -A FEATURE_FILES

# F06: JSON System Prompt
FEATURE_FILES[f06]="
src/core/prompts/system-prompt/index.ts
src/core/prompts/system-prompt/registry/PromptRegistry.ts
src/core/prompts/system-prompt/variants/next-gen/template.ts
src/core/prompts/system-prompt/variants/gpt-5/template.ts
src/core/prompts/system-prompt/tools/attempt_completion.ts
src/core/prompts/system-prompt-legacy/families/next-gen-models/gpt-5.ts
src/core/prompts/system-prompt/types.ts
src/core/api/transform/openrouter-stream.ts
proto/caret/system.proto
"

# F07: Chatbot Agent (f06과 많은 파일 공유)
FEATURE_FILES[f07]="
src/core/prompts/system-prompt/index.ts
src/core/prompts/system-prompt/registry/PromptRegistry.ts
src/core/prompts/system-prompt/variants/next-gen/template.ts
src/core/prompts/system-prompt/variants/gpt-5/template.ts
proto/caret/system.proto
src/generated/grpc-js/cline/state.ts
src/generated/nice-grpc/cline/state.ts
src/core/controller/state/updateSettings.ts
src/shared/proto/cline/state.ts
"

# F03: Branding UI
FEATURE_FILES[f03]="
src/core/api/index.ts
src/core/api/providers/vercel-ai-gateway.ts
src/core/api/providers/vscode-lm.ts
src/shared/ExtensionMessage.ts
src/shared/mcp.ts
src/integrations/checkpoints/CheckpointUtils.ts
src/integrations/checkpoints/CheckpointGitOperations.ts
src/integrations/terminal/TerminalRegistry.ts
src/integrations/notifications/index.ts
src/integrations/editor/detect-omission.ts
src/hosts/vscode/commit-message-generator.ts
src/hosts/vscode/VscodeDiffViewProvider.ts
src/hosts/vscode/commandUtils.ts
src/extension.ts
src/core/storage/disk.ts
src/core/storage/state-keys.ts
scripts/report-issue.js
"

# F10: Enhanced Provider Setup
FEATURE_FILES[f10]="
src/core/api/providers/cline.ts
src/core/api/providers/doubao.ts
src/core/api/providers/fireworks.ts
src/core/api/providers/litellm.ts
src/core/api/providers/lmstudio.ts
src/core/api/providers/openai.ts
src/core/api/providers/openrouter.ts
src/core/api/providers/qwen.ts
src/core/api/providers/requesty.ts
src/core/api/providers/xai.ts
src/core/api/transform/openrouter-stream.ts
src/core/api/transform/vercel-ai-gateway-stream.ts
src/core/controller/models/getSapAiCoreModels.ts
src/core/controller/models/refreshOpenRouterModels.ts
src/core/controller/models/updateApiConfigurationProto.ts
webview-ui/src/components/settings/providers/LiteLlmProvider.tsx
proto/caret/system.proto
"

# F09: Feature Config System
FEATURE_FILES[f09]="
src/core/storage/StateManager.ts
src/core/storage/state-migrations.ts
src/core/storage/state-keys.ts
src/shared/ExtensionMessage.ts
"

# F02: Multilingual i18n
FEATURE_FILES[f02]="
src/shared/Languages.ts
src/shared/api.ts
webview-ui/src/caret/context/CaretI18nContext.tsx
webview-ui/src/caret/utils/i18n.ts
webview-ui/src/caret/utils/lazy-i18n.ts
webview-ui/src/caret/utils/i18n-performance.ts
webview-ui/src/caret/hooks/useCaretI18n.ts
"

# F01: Common Utilities
FEATURE_FILES[f01]="
src/common.ts
src/integrations/misc/extract-text.ts
src/integrations/editor/detect-omission.ts
webview-ui/src/caret/utils/urls.ts
webview-ui/src/caret/utils/CaretWebviewLogger.ts
webview-ui/src/caret/utils/brand-utils.ts
webview-ui/src/context/ExtensionStateContext.tsx
"

# F11: Input History System
FEATURE_FILES[f11]="
src/core/storage/state-keys.ts
src/shared/ExtensionMessage.ts
proto/cline/state.proto
src/generated/grpc-js/cline/state.ts
src/generated/nice-grpc/cline/state.ts
src/core/controller/state/updateSettings.ts
src/shared/proto/cline/state.ts
webview-ui/src/caret/hooks/usePersistentInputHistory.ts
webview-ui/src/components/chat/ChatTextArea.tsx
webview-ui/src/components/chat/ChatView.tsx
webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
"

# F04: Caret Account (검증용)
FEATURE_FILES[f04]="
src/core/api/providers/caret.ts
src/core/controller/caretAccount/getCaretOrganizationCredits.ts
src/core/controller/caretAccount/getCaretUserOrganizations.ts
src/core/controller/caretAccount/getCaretUserCredits.ts
src/core/controller/caretAccount/caretAccountLogoutClicked.ts
src/core/controller/caretAccount/caretAuthStateChanged.ts
src/core/controller/caretAccount/getCaretUserProfile.ts
src/core/controller/caretAccount/setCaretUserOrganization.ts
src/core/controller/caretAccount/caretAccountLoginClicked.ts
src/core/controller/caretAccount/subscribeToCaretAuthStatusUpdate.ts
src/services/account/CaretAccountService.ts
src/shared/api.ts
src/shared/CaretAccount.ts
src/shared/proto-conversions/models/api-configuration-conversion.ts
proto/caret/account.proto
proto/cline/models.proto
proto/cline/state.proto
"

# F05: Rule Priority System (검증용)
FEATURE_FILES[f05]="
src/core/context/instructions/user-instructions/external-rules.ts
src/core/storage/state-keys.ts
src/core/storage/utils/state-helpers.ts
src/core/storage/disk.ts
src/core/controller/file/refreshRules.ts
src/core/controller/file/toggleCaretRule.ts
src/core/task/index.ts
src/core/prompts/responses.ts
src/core/prompts/system-prompt/types.ts
proto/cline/file.proto
webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx
"

# F08: Persona System (검증용)
FEATURE_FILES[f08]="
scripts/generate-protobus-setup.mjs
scripts/proto-utils.mjs
src/extension.ts
src/core/storage/state-keys.ts
src/core/storage/disk.ts
src/core/controller/state/updateSettings.ts
src/core/controller/state/resetState.ts
proto/caret/persona.proto
proto/cline/state.proto
webview-ui/src/components/chat/ChatRow.tsx
webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx
"

# 파일 목록 가져오기
FILES="${FEATURE_FILES[$FEATURE_ID]}"

if [ -z "$FILES" ]; then
    echo "❌ Unknown feature ID: $FEATURE_ID"
    echo "   Available: f01, f02, f03, f04, f05, f06, f07, f08, f09, f10, f11"
    exit 1
fi

echo "## 📊 검증 결과 요약" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

total_files=0
modified_files=0
unmodified_files=0
missing_files=0
missing_comment_files=0

# 파일별 검증
echo "## 📋 파일별 상세 검증" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

for file in $FILES; do
    total_files=$((total_files + 1))

    echo "### \`$file\`" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"

    # 파일 존재 확인
    if [ ! -f "$file" ]; then
        echo "❌ **상태**: 파일이 존재하지 않음" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        missing_files=$((missing_files + 1))
        continue
    fi

    # cline-latest와 비교
    if [ ! -f "$CLINE_LATEST/$file" ]; then
        echo "✅ **상태**: Caret 신규 파일 (cline-latest에 없음)" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        modified_files=$((modified_files + 1))
        continue
    fi

    # diff 실행
    diff_output=$(diff -u "$CLINE_LATEST/$file" "$file" 2>&1 || true)

    if [ -z "$diff_output" ]; then
        echo "⚠️ **상태**: 변경사항 없음 (cline-latest와 동일)" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        unmodified_files=$((unmodified_files + 1))
    else
        # 변경 라인 수 계산
        added_lines=$(echo "$diff_output" | grep -c "^+" || echo "0")
        removed_lines=$(echo "$diff_output" | grep -c "^-" || echo "0")

        echo "✅ **상태**: 수정됨 (+$added_lines, -$removed_lines)" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"

        # CARET MODIFICATION 주석 확인
        if grep -q "CARET MODIFICATION" "$file"; then
            comment_count=$(grep -c "CARET MODIFICATION" "$file")
            echo "✅ **주석**: CARET MODIFICATION 존재 (${comment_count}개)" >> "$REPORT_FILE"
        else
            echo "❌ **주석**: CARET MODIFICATION 없음 - 주석 추가 필요!" >> "$REPORT_FILE"
            missing_comment_files=$((missing_comment_files + 1))
        fi
        echo "" >> "$REPORT_FILE"

        # Diff 일부 표시 (처음 20줄)
        echo "<details>" >> "$REPORT_FILE"
        echo "<summary>Diff 미리보기 (처음 20줄)</summary>" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        echo '```diff' >> "$REPORT_FILE"
        echo "$diff_output" | head -20 >> "$REPORT_FILE"
        if [ $(echo "$diff_output" | wc -l) -gt 20 ]; then
            echo "..." >> "$REPORT_FILE"
            echo "(생략됨, 전체 diff는 git diff 명령으로 확인)" >> "$REPORT_FILE"
        fi
        echo '```' >> "$REPORT_FILE"
        echo "</details>" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"

        modified_files=$((modified_files + 1))
    fi

    echo "---" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
done

# 요약 업데이트
sed -i.bak "s|^## 📊 검증 결과 요약|## 📊 검증 결과 요약\n\n- **총 파일 수**: $total_files\n- **수정된 파일**: $modified_files\n- **변경 없음**: $unmodified_files\n- **누락된 파일**: $missing_files\n- **주석 누락**: $missing_comment_files\n|" "$REPORT_FILE"
rm -f "${REPORT_FILE}.bak"

# 결과 출력
echo ""
echo "✅ 검증 완료!"
echo "📄 보고서: $REPORT_FILE"
echo ""
echo "📊 요약:"
echo "   총 파일: $total_files"
echo "   수정됨: $modified_files"
echo "   변경없음: $unmodified_files"
echo "   누락됨: $missing_files"
echo "   주석누락: $missing_comment_files"
echo ""

if [ $missing_comment_files -gt 0 ]; then
    echo "⚠️  경고: $missing_comment_files 개 파일에 CARET MODIFICATION 주석이 없습니다!"
fi

if [ $unmodified_files -gt 0 ]; then
    echo "⚠️  경고: $unmodified_files 개 파일이 cline-latest와 동일합니다! (분석 문서 오류 가능성)"
fi
