# t-03-3-2: 프론트엔드 i18n 전체 적용 작업 기록

**작성일**: 2025-09-05
**담당 AI**: 알파 (Alpha Yang)
**상위 작업**:
- [t03-3 프론트엔드 i18n 및 상호이식 개선](./t03-3-프론트i18n및상호이식개선.md)
- [t03-3-1 i18n 현황 분석 및 개선 계획](./t03-3-1-i18n-analysis-and-plan.md)

## 1. 작업 개요

이 문서는 `t03-3-1`에서 수립된 계획의 **Phase 3: i18n 전체 적용 (Implementation)** 단계를 수행하고 그 과정을 기록합니다.

**목표**: `i18n-real-target-files.md`에 명시된 실제 작업 대상 파일들에 대해 하드코딩된 UI 문자열을 `t()` 함수로 교체하고, 다국어 지원을 완료합니다.

## 2. 작업 절차

1.  `i18n-real-target-files.md` 목록에 따라 작업할 파일을 선정합니다. (우선순위: Settings → Chat → Common)
2.  대상 파일의 하드코딩된 문자열을 식별합니다.
3.  `find-existing-i18n-key.js` 스크립트를 사용해 기존 번역 키가 있는지 확인합니다.
4.  필요한 경우 `ko`와 `en` locale JSON 파일에 새로운 키와 번역문을 추가합니다.
5.  대상 `.tsx` 파일에 `t()` 함수를 적용하여 문자열을 교체합니다.
6.  이 문서에 작업 내역을 기록하고, 아래 체크리스트를 업데이트합니다.

## 3. 작업 대상 목록 (총 21개)

`i18n-real-target-files.md`의 수동 검토 결과를 바탕으로 정리된 최종 작업 목록입니다.

### Settings (8개)
- [ ] `webview-ui/src/components/settings/common/ApiKeyField.tsx`
- [ ] `webview-ui/src/components/settings/common/BaseUrlField.tsx`
- [ ] `webview-ui/src/components/settings/common/ModelSelector.tsx`
- [ ] `webview-ui/src/components/settings/OpenRouterModelPicker.tsx`
- [ ] `webview-ui/src/components/settings/providers/VertexProvider.tsx`
- [ ] `webview-ui/src/components/settings/providers/VSCodeLmProvider.tsx`
- [ ] `webview-ui/src/components/settings/RequestyModelPicker.tsx`
- [ ] `webview-ui/src/components/settings/SapAiCoreModelPicker.tsx`

### Chat (7개)
- [ ] `webview-ui/src/components/chat/BrowserSessionRow.tsx`
- [ ] `webview-ui/src/components/chat/ChatRow.tsx`
- [ ] `webview-ui/src/components/chat/ChatTextArea.tsx`
- [ ] `webview-ui/src/components/chat/QuoteButton.tsx`
- [ ] `webview-ui/src/components/chat/QuotedMessagePreview.tsx`
- [ ] `webview-ui/src/components/chat/task-header/TaskHeader.tsx`
- [ ] `webview-ui/src/components/chat/task-header/TaskTimelineTooltip.tsx`

### MCP (2개)
- [ ] `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpMarketplaceCard.tsx`
- [ ] `webview-ui/src/components/mcp/configuration/tabs/marketplace/McpSubmitCard.tsx`

### History (2개)
- [ ] `webview-ui/src/components/history/HistoryPreview.tsx`
- [ ] `webview-ui/src/components/history/HistoryView.tsx`

### Cline Rules (1개)
- [ ] `webview-ui/src/components/cline-rules/ClineRulesToggleModal.tsx`

### Common (1개)
- [ ] `webview-ui/src/components/common/CheckmarkControl.tsx`

## 4. 작업 기록

---