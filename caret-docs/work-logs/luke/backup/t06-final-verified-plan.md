# 최종 실행 계획 v4.0: 하이브리드 프롬프트 시스템 구축 (심층 분석 기반)

## 0. 개요

이 문서는 `caret-merging` 프로젝트의 프론트엔드 및 백엔드 소스 코드에 대한 **심층 분석**을 완료하고, 이를 바탕으로 수립된 **최종적이고 검증된 실행 계획**입니다. 기존 계획들의 모든 오해를 바로잡고, 실제 아키텍처에 기반하여 구체적인 실행 단계를 제시합니다.

**핵심 목표:** 현재 `cline-latest` 기반 프로젝트에 이미 존재하는 **`PromptRegistry` 아키텍처를 활용**하여, `caret-main`의 핵심 철학인 **CHATBOT/AGENT 모드**와 **JSON 기반 프롬프트 관리 시스템**을 **어댑터 패턴**을 통해 완벽하게 통합합니다.

---

## 1. 심층 분석 결과 및 핵심 전략

### 1.1. 백엔드 분석 (`src/core/prompts/system-prompt`)
- **확인된 사실:** `PromptRegistry`와 `ComponentFunction` 기반의 컴포넌트 시스템이 완벽하게 구현되어 있습니다.
- **통합 지점:** `PromptRegistry.getInstance().registerComponent()` 메소드를 사용하여 기존 컴포넌트를 Caret의 JSON 기반 어댑터로 **대체(override)**하는 것이 핵심 통합 전략입니다.

### 1.2. 프론트엔드 분석 (`webview-ui/src`)
- **확인된 사실:** `ExtensionStateContext`가 상태 관리의 중심이며, `vscode.postMessage`를 통해 백엔드와 통신합니다. `caret/` 디렉토리에 이미 Caret 전용 기능이 분리되어 있어 확장성이 좋습니다.
- **통합 지점:** `SettingsView.tsx` 내에 새로운 UI를 추가하고, `CaretProvider.tsx` 또는 유사한 Caret 전용 설정 컴포넌트를 통해 백엔드로 프롬프트 시스템 모드 변경을 요청합니다.

### 1.3. 최종 전략: "활용과 대체"
- **구조:** 현재 프로젝트의 `PromptRegistry` 구조를 **그대로 활용**합니다.
- **영혼:** `act_vs_plan_mode.ts`와 같은 핵심 컴포넌트들을 Caret의 JSON 철학을 담은 **어댑터로 대체**합니다.

---

## 2. 최종 실행 계획 (TDD 접근)

### Phase 1: 어댑터 뼈대 구축 및 핵심 컴포넌트 1개 대체

**목표:** 상세 분석을 바탕으로 어댑터의 기본 구조를 TDD로 구현하고, 가장 중요한 `act_vs_plan_mode` 컴포넌트를 성공적으로 대체하여 기술적 가능성을 검증합니다.

1.  **[백업]** `src/core/prompts` 디렉토리를 `src/core/prompts_backup`으로 복사합니다.
2.  **[파일 생성]** `caret-src/core/prompts/` 경로에 다음 파일들을 생성합니다.
    -   `CaretJsonComponentProvider.ts` (어댑터)
    -   `PromptSystemManager.ts` (전략 관리자)
    -   `__tests__/CaretJsonComponentProvider.test.ts` (테스트 파일)
3.  **[RED] 테스트 작성:**
    -   `CaretJsonComponentProvider.test.ts`에, `CHATBOT_AGENT_MODES.json`을 읽어 `ComponentFunction`을 생성하고, 이 함수가 `context.mode`에 따라 "AGENT MODE" 또는 "CHATBOT MODE" 문자열을 포함하는 프롬프트를 반환하는지 검증하는 **실패하는 테스트**를 작성합니다.
4.  **[GREEN] 최소 어댑터 구현:**
    -   `CaretJsonComponentProvider.ts`에 `adaptChatbotAgentModes()` 메서드를 **최소한으로 구현**하여 테스트를 통과시킵니다.
5.  **[GREEN] 관리자 및 연동 구현:**
    -   `PromptSystemManager`가 'caret' 모드일 때, `PromptRegistry.getInstance().registerComponent('act_vs_plan_mode', ...)`를 호출하여 기존 컴포넌트를 새로 만든 어댑터로 **대체**하도록 구현합니다.
    -   `src/core/prompts/system-prompt/index.ts`에 `PromptSystemManager`를 호출하는 분기 로직을 **CARET MODIFICATION**으로 추가합니다.

**완료 기준:**
-   `act_vs_plan_mode` 컴포넌트가 성공적으로 JSON 기반으로 대체되어 동작합니다.
-   관련 단위 테스트가 모두 통과합니다.
-   `npm run compile`이 성공합니다.

### Phase 2: Caret 철학 전체 이식 및 기능 융합

**목표:** 나머지 핵심 컴포넌트들을 모두 어댑터로 대체하고, `mode_restriction`과 같은 Caret 고유의 철학을 시스템에 완전히 통합합니다.

1.  **[RED]** `mode_restriction` 테스트 작성: `context.mode`가 'chatbot'일 때 `TOOL_DEFINITIONS.json`의 `mode_restriction`이 적용되어 특정 도구가 프롬프트에서 제외되는지 검증하는 테스트를 작성합니다.
2.  **[GREEN]** `adaptToolDefinitions()` 메서드에 `mode_restriction` 로직을 추가하여 구현합니다.
3.  **[REFACTOR]** `agent_role`, `objective`, `system_info` 등 나머지 핵심 컴포넌트들을 JSON 기반 어댑터로 전환하는 작업을 TDD 사이클로 반복합니다.
4.  **[VERIFY]** 관련 테스트를 모두 통과시키고, 토큰 효율성을 분석하여 14% 이상의 우위를 유지하는지 확인합니다.

**완료 기준:**
-   CHATBOT/AGENT 모드 및 도구 제한이 완벽하게 동작합니다.
-   주요 프롬프트 컴포넌트들이 JSON 기반으로 성공적으로 전환됩니다.

### Phase 3: 프론트엔드 통합 및 E2E 모드 전환 구현

**목표:** 사용자가 UI 설정을 통해 'Caret 하이브리드 시스템'과 'Cline 순정 시스템'을 실시간으로 전환할 수 있는 완전한 기능을 구현합니다.

1.  **[RED] E2E 테스트 작성 (`test:webview`):**
    -   UI에서 'Prompt System'을 'Caret'으로 변경했을 때, 백엔드의 `workspaceState`가 업데이트되고, 이후 생성되는 프롬프트에 "AGENT MODE"가 포함되는 시나리오를 검증하는 E2E 테스트를 작성합니다.
2.  **[GREEN] 프론트엔드 UI 구현:**
    -   `webview-ui/src/caret/components/`에 `CaretPromptSystemSetting.tsx`와 같은 새로운 설정 컴포넌트를 만들고, 이를 `SettingsView.tsx`에 통합합니다. 이 컴포넌트는 `vscode.postMessage`를 호출합니다.
3.  **[GREEN] 백엔드 컨트롤러 구현:**
    -   `caret-src/controllers/PromptSystemController.ts`를 신규 생성하여 `promptSystem/setMode` 메시지를 처리하고, `workspaceState` 업데이트 및 `PromptSystemManager.switchMode()`를 호출하는 핸들러를 구현합니다.
    -   `extension.ts`에 컨트롤러와 메시지 핸들러를 등록합니다.
4.  **[VERIFY]** E2E 테스트를 통과시키고, F5로 확장 프로그램을 실행하여 UI 토글 시 시스템 프롬프트가 실시간으로 변경되는지 수동으로 최종 검증합니다.

**완료 기준:**
-   프론트엔드 UI를 통한 실시간 모드 전환 기능이 E2E 테스트와 수동 검증을 모두 통과합니다.
-   모드 설정이 `workspaceState`에 영속적으로 저장됩니다.

### Phase 4: 전체 시스템 안정화 및 최적화

**목표:** 전체 테스트 스위트를 통과시키고, 성능 최적화를 적용하여 프로젝트를 안정화합니다.

1.  **[STABILIZE]** `npm run test:all`을 실행하고, 실패하는 모든 테스트 케이스를 수정하여 100% 통과 상태를 만듭니다.
2.  **[OPTIMIZE]** `CaretJsonComponentProvider`에 JSON 파일 내용을 캐싱하는 로직을 추가하여 성능을 최적화합니다.
3.  **[VERIFY]** `npm run lint` 및 `npm run check-types`를 실행하여 코드 품질과 타입 안정성을 최종 확인합니다.

**완료 기준:**
-   `npm run test:all`이 100% 통과합니다. ⭐
-   성능 최적화가 적용되었으며, 코드 품질 검증을 통과합니다.

### Phase 5: 최종 문서화 및 인수 검증

**목표:** 프로젝트 산출물을 문서화하고, 최종 인수 기준에 따라 모든 기능이 완벽하게 동작하는지 검증합니다.

1.  **[DOCS]** `t06-implementation-guide.md`와 `t06-user-migration-guide.md` 기술 문서를 작성합니다.
2.  **[ACCEPTANCE TEST]** 최종 성공 기준 체크리스트의 모든 항목을 하나씩 실행하며 검증합니다.
3.  **[CLEANUP]** `src/core/prompts_backup` 디렉토리를 삭제하고, 최종 코드를 정리합니다.

**완료 기준:**
-   모든 기술 문서가 작성되고, 최종 인수 검증 체크리스트의 모든 항목을 통과합니다.
