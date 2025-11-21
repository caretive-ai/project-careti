# 최종 실행 계획 v3.0: 하이브리드 프롬프트 시스템 구축 (검증 기반)

## 0. 개요

이 문서는 기존 계획 문서들(`t06-master-implementation-tracker.md`, `t06-hybrid-system-implement-plan-unified.md`)의 분석을 통해 발견된 **프로젝트 구조에 대한 오해**를 바로잡고, 실제 소스 코드 검증을 바탕으로 수립된 **최종 실행 계획**입니다.

**핵심 목표:** 현재 `cline-latest` 기반 프로젝트(`caret-merging`)에 `caret-main`의 핵심 철학인 **CHATBOT/AGENT 모드**와 **JSON 기반 프롬프트 관리 시스템**을 **어댑터 패턴**을 통해 완벽하게 통합합니다.

---

## 1. 기존 계획 문서 분석 및 문제점 식별

### 1.1. 분석 대상 문서
- `t06-master-implementation-tracker.md`
- `t06-hybrid-system-implement-plan-unified.md`

### 1.2. 핵심 문제점: 잘못된 전제

- **가장 큰 오해:** "현재 프로젝트가 `cline-latest` 기반이 아니므로, 해당 시스템을 외부에서 복사해와야 한다"는 잘못된 전제에서 계획이 시작되었습니다.
- **소스 코드 검증 결과:** `src/core/prompts/system-prompt/registry` 디렉토리의 존재를 통해, 현재 프로젝트는 **이미 `cline-latest`의 `PromptRegistry` 아키텍처를 포함**하고 있음이 확인되었습니다.
- **결론:** `Phase 1.1`에 명시된 **`cline-latest` 소스 코드 복사 및 덮어쓰기 단계는 불필요하며, 프로젝트 구조를 파괴할 수 있는 위험한 작업**입니다.

### 1.3. 수정 방향
- `cline-latest`에서 파일을 가져오는 모든 단계를 제거합니다.
- 현재 프로젝트에 이미 존재하는 `PromptRegistry` 시스템을 **활용**하여, `caret-main`의 JSON 시스템을 통합하는 방향으로 계획을 전면 수정합니다.
- **"구조는 cline-latest, 영혼은 Caret"** 라는 핵심 전략은 그대로 유지하되, "구조를 가져온다"가 아닌 **"이미 있는 구조를 활용한다"** 로 접근 방식을 변경합니다.

---

## 2. 최종 실행 계획 (TDD 접근)

### Phase 1: 상세 분석 기반 어댑터 뼈대 구축

**목표:** 현재 시스템의 `PromptRegistry` 동작 방식을 완벽히 파악하고, 이를 바탕으로 Caret의 JSON 시스템을 연결할 어댑터의 핵심 구조를 TDD로 구현합니다.

1.  **[상세 분석]**
    -   **`PromptRegistry.ts` 분석:** `getInstance()`(싱글톤), `registerComponent()`, `get()` 메소드를 중심으로 컴포넌트 등록 및 프롬프트 빌드 과정을 파악합니다.
    -   **`components` 디렉토리 분석:** `act_vs_plan_mode.ts`, `agent_role.ts` 등 핵심 컴포넌트들이 `ComponentFunction` 타입으로 어떻게 구현되어 있는지 분석합니다.
    -   **`index.ts` 분석:** `getSystemPromptComponents()` 함수가 어떻게 컴포넌트 ID와 함수를 매핑하여 `PromptRegistry`에 제공하는지 확인합니다.
2.  **[백업]** 만일의 사태를 대비해 `src/core/prompts` 디렉토리를 `src/core/prompts_backup`으로 복사합니다.
3.  **[파일 생성]** `caret-src/core/prompts/` 경로에 다음 파일들을 생성합니다.
    -   `CaretJsonComponentProvider.ts` (어댑터)
    -   `PromptSystemManager.ts` (전략 관리자)
    -   `__tests__/CaretJsonComponentProvider.test.ts` (테스트 파일)
4.  **[RED] 테스트 작성:**
    -   `CaretJsonComponentProvider.test.ts`에, `TOOL_DEFINITIONS.json` 파일을 읽어 `ComponentFunction` 형태로 변환하고, 이 함수가 `SystemPromptContext`를 인자로 받아 특정 문자열을 포함하는 프롬프트를 생성하는지 검증하는 **실패하는 테스트**를 작성합니다.
5.  **[GREEN] 최소 어댑터 구현:**
    -   `CaretJsonComponentProvider.ts`에 `TOOL_DEFINITIONS.json`을 읽고, `ComponentFunction`을 반환하는 `adaptToolDefinitions()` 메서드를 **최소한으로 구현**하여 테스트를 통과시킵니다. 이 어댑터는 `PromptRegistry`의 기존 컴포넌트와 동일한 인터페이스를 가져야 합니다.
6.  **[GREEN] 관리자 및 연동 구현:**
    -   `PromptSystemManager`가 'caret' 모드일 때, `PromptRegistry.getInstance().registerComponent()`를 호출하여 기존 `tool_use_section` 컴포넌트를 `CaretJsonComponentProvider`의 어댑터로 **대체(override)**하도록 구현합니다.
    -   `src/core/prompts/system-prompt/index.ts`에 `PromptSystemManager`를 호출하는 분기 로직을 **CARET MODIFICATION**으로 추가합니다.

**완료 기준:**
-   `Mission 1B-1` 관련 테스트가 통과합니다. ⭐
-   기존 `PromptRegistry` 시스템 위에서 Caret의 JSON 기반 컴포넌트가 최소 1개 이상 성공적으로 동작합니다.
-   `npm run compile`이 성공합니다.

### Phase 2: Caret 핵심 철학 이식 및 기능 융합

**목표:** Caret의 핵심 철학(CHATBOT/AGENT, 도구 제한)을 시스템에 완전히 통합하고, `cline-latest`의 신규 기능(작업 관리 루프)을 Caret 철학에 맞게 변형하여 적용합니다.

1.  **[RED]** `CHATBOT/AGENT` 모드 테스트 작성:
    -   `context.mode`에 따라 프롬프트에 "AGENT MODE" 또는 "CHATBOT MODE"가 포함되는지, 그리고 `mode_restriction`이 적용되어 특정 도구가 제외되는지 검증하는 테스트를 작성합니다.
2.  **[GREEN]** `CaretJsonComponentProvider`에 `act_vs_plan_mode` 컴포넌트를 대체할 `adaptChatbotAgentModes()` 메서드를 구현하고, `adaptToolDefinitions()`에 `mode_restriction` 로직을 추가합니다.
3.  **[RED]** '작업 관리 루프'(`auto_todo` 등)가 모드별로 다른 스타일의 프롬프트를 생성하는지 검증하는 테스트를 작성합니다.
4.  **[GREEN]** `CARET_TODO_MANAGEMENT.json` 등 관련 JSON 파일을 생성하고, 이를 참조하여 모드별 프롬프트를 생성하는 어댑터 메서드(`adaptAutoTodo()` 등)를 구현합니다.
5.  **[VERIFY]** 관련 테스트를 모두 통과시키고, 토큰 효율성을 분석하여 14% 이상의 우위를 유지하는지 확인합니다.

**완료 기준:**
-   CHATBOT/AGENT 모드 및 도구 제한이 완벽하게 동작합니다.
-   '작업 관리 루프'가 Caret 철학에 맞게 차별화되어 동작합니다.

### Phase 3: 프론트엔드 통합 및 E2E 모드 전환 구현

**목표:** 사용자가 UI 설정을 통해 'Caret 하이브리드 시스템'과 'Cline 순정 시스템'을 실시간으로 전환할 수 있는 완전한 기능을 구현합니다.

1.  **[RED] E2E 테스트 작성 (`test:webview`):**
    -   UI에서 'Prompt System'을 'Caret'으로 변경했을 때, 백엔드의 `workspaceState`가 업데이트되고, 이후 생성되는 프롬프트에 "AGENT MODE"가 포함되는 시나리오를 검증하는 E2E 테스트를 작성합니다.
2.  **[GREEN] 프론트엔드 UI 구현:**
    -   `webview-ui/src/components/settings/providers/CaretProvider.tsx`에 모드 전환 UI를 추가하고, `vscode.postMessage`를 호출하도록 구현합니다.
3.  **[GREEN] 백엔드 컨트롤러 구현:**
    -   `caret-src/controllers/PromptSystemController.ts`를 신규 생성하여 `promptSystem/setMode` 메시지를 처리하고, `workspaceState` 업데이트 및 `PromptSystemManager.switchMode()`를 호출하는 핸들러를 구현합니다.
    -   `extension.ts`에 컨트롤러와 메시지 핸들러를 등록합니다.
4.  **[VERIFY]** E2E 테스트를 통과시키고, F5로 확장 프로그램을 실행하여 UI 토글 시 시스템 프롬프트가 실시간으로 변경되는지 수동으로 최종 검증합니다.

**완료 기준:**
-   프론트엔드 UI를 통한 실시간 모드 전환 기능이 E2E 테스트와 수동 검증을 모두 통과합니다.
-   모드 설정이 `workspaceState`에 영속적으로 저장됩니다.

### Phase 4: 전체 시스템 안정화 및 최적화

**목표:** 모든 컴포넌트를 이식하고, 전체 테스트 스위트를 통과시키며, 성능 최적화를 적용하여 프로젝트를 안정화합니다.

1.  **[REFACTOR]** 나머지 모든 프롬프트 컴포넌트를 JSON 기반 어댑터로 전환합니다.
2.  **[STABILIZE]** `npm run test:all`을 실행하고, 실패하는 모든 테스트 케이스를 수정하여 100% 통과 상태를 만듭니다.
3.  **[OPTIMIZE]** `CaretJsonComponentProvider`에 JSON 파일 내용을 캐싱하는 로직을 추가하여 성능을 최적화합니다.
4.  **[VERIFY]** `npm run lint` 및 `npm run check-types`를 실행하여 코드 품질과 타입 안정성을 최종 확인합니다.

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

---

## 3. 최종 성공 기준 체크리스트

-   [ ] **`Mission 1B-1` 테스트 통과**
-   [ ] **`npm run test:all` 100% 통과**
-   [ ] **토큰 효율성 14.1% 이상 유지**
-   [ ] **기존 Caret 사용자 경험 100% 보존**
-   [ ] **CHATBOT/AGENT 철학 및 `mode_restriction` 완벽 구현**
-   [ ] **`cline-latest` 3대 신규 기능(작업 관리 루프) 융합 완료**
-   [ ] **프론트엔드 UI를 통한 실시간 모드 전환 및 설정 영속성 보장**
