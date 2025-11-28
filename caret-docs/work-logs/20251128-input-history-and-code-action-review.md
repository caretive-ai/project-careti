# 입력 히스토리 및 코드 액션 구현 리뷰

**검토 대상**:
1. 입력 히스토리 및 단축키 시스템 (`caret-docs/features/f10-input-history-and-shortcuts.md`)
2. 코드 액션 브랜딩 (`src/extension.ts`)

**검토 일자**: 2025-11-28
**검토자**: Caret (Alpha Yang)

---

## 1. 입력 히스토리 및 단축키 시스템

### 1.1 `ShortcutManager` 및 단축키 카탈로그
- **파일**: `webview-ui/src/caret/shortcuts/shortcuts.json`
- **구현 내용**:
  ```json
  {
      "cancel_stream": { "keys": ["Escape"], ... },
      "resume_task": { "keys": ["Control+Shift+R"], ... }
  }
  ```
- **평가**:
  - `shortcuts.json`에 스트리밍 취소(`Esc`)와 작업 재개(`Ctrl+Shift+R`)가 명확히 정의됨.
  - `ArrowUp`/`ArrowDown`은 터미널 UX의 일부로 `useInputHistory.ts`에서 하드코딩 처리됨 (설계 일치).
  - `ShortcutManager.ts`는 단순 getter 래퍼로 구현됨.

### 1.2 입력 히스토리 로직 (`useInputHistory.ts`)
- **파일**: `webview-ui/src/caret/hooks/useInputHistory.ts`
- **핵심 로직**:
  - `ArrowUp`/`ArrowDown` 키 이벤트 핸들링.
  - `selectionStart`를 확인하여 커서가 텍스트 시작/끝에 있을 때만 히스토리 탐색 (터미널 UX 준수).
  - `originalInput` 상태 관리로 탐색 중단 시 원래 입력 복원 기능 포함.
  - 사용자가 탐색 중 입력을 수정하면 히스토리 모드 종료 (`historyIndex = -1`).
- **평가**:
  - **터미널 일관성**: ✅ 커서 위치 기반 탐색 조건이 정확히 구현됨.
  - **사용자 경험**: ✅ 원본 입력 보존 및 복원 로직이 충실함.
  - **코드 품질**: ✅ `useCallback` 의존성 배열 및 상태 관리가 적절함.

### 1.3 영구 저장소 연동 (`usePersistentInputHistory.ts`)
- **파일**: `webview-ui/src/caret/hooks/usePersistentInputHistory.ts`
- **핵심 로직**:
  - `useExtensionState` 훅을 통해 `stateInputHistory` (백엔드 상태) 구독.
  - `addToHistory`:
    - 중복 제거 (마지막 항목과 동일하면 무시).
    - `MAX_HISTORY_SIZE` (1000) 제한.
    - `StateServiceClient.updateSettings` gRPC 호출로 즉시 백엔드 저장.
    - 로컬 상태(`localHistory`) 즉시 업데이트 (Optimistic Update).
    - 실패 시 롤백 로직 포함.
- **평가**:
  - **영구 저장**: ✅ gRPC를 통한 백엔드 저장 로직 구현됨.
  - **데이터 정확성**: ✅ 사용자 입력만 저장하며, 중복 제거 로직 포함.
  - **안정성**: ✅ 에러 핸들링 및 롤백 로직이 있어 견고함.

---

## 2. 코드 액션 브랜딩 (`src/extension.ts`)

### 2.1 구현 분석
- **파일**: `src/extension.ts` (lines 280~)
- **로직**:
  - `vscode.languages.registerCodeActionsProvider` 내부에서 `getCurrentBrandDisplayName()` 호출.
  - `addAction`, `explainAction`, `improveAction`, `fixAction` 생성 시 브랜드 이름 동적 삽입.
  - 예: `Add to ${brandName}`, `Explain with ${brandName}`.
- **코드 스니펫**:
  ```typescript
  const brandName = getCurrentBrandDisplayName()
  const addAction = new vscode.CodeAction(`Add to ${brandName}`, vscode.CodeActionKind.QuickFix)
  // ...
  ```
- **평가**:
  - **브랜딩**: ✅ `getCurrentBrandDisplayName()`을 사용하여 동적으로 브랜드명(Caret/Cline 등)을 표시.
  - **회귀 방지**: ✅ 하드코딩된 "Cline" 문자열이 제거되고 유틸리티 함수로 대체됨.
  - **기능성**: ✅ QuickFix, Refactor 종류별로 적절히 구현됨.

---

## 3. 종합 결론

### ✅ **승인 (Approved)**
- **입력 히스토리**: 설계 문서(`f10-input-history-and-shortcuts.md`)의 요구사항(터미널 UX, 영구 저장, 단축키)을 모두 충족하며 코드가 견고함.
- **코드 액션**: 브랜드 유틸리티를 활용하여 동적 브랜딩이 올바르게 적용됨.
- **코드 품질**: 전반적으로 깔끔하며, 예외 처리 및 UX 고려가 잘 되어 있음.

### 📝 **권장 사항 (Minor)**
- `shortcuts.json`의 키 바인딩이 실제 VS Code 키보드 이벤트 핸들러(`ChatTextArea.tsx` 등)와 일치하는지 통합 테스트에서 확인 필요 (현재는 코드 레벨 리뷰).
- `useInputHistory.ts`의 `originalInput` 복원 로직은 매우 중요하므로, E2E 테스트 케이스에 포함 권장.
