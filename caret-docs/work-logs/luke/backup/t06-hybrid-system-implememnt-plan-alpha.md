# 최종 실행 계획 v2.0: 궁극의 하이브리드 프롬프트 시스템 구축

## 0. 개요

본 문서는 Alpha, Claude, 그리고 `unified.md`의 모든 계획을 통합하여, **파일 및 코드 레벨의 구체적인 실행 방안**을 담은 최종 버전의 실행 계획입니다. 이 계획은 **Mission 1B-1 블로커 우선 해결**이라는 위험 관리 전략을 채택하고, 모든 단계를 TDD(테스트 주도 개발) 방식으로 진행하여 안정성을 극대화합니다.

**최종 목표:** `cline-latest`의 **컴포넌트 기반 아키텍처**와 **작업 관리 루프**를 구조적 뼈대로 채택하고, 그 위에 Caret의 **CHATBOT/AGENT 행동 철학**과 **JSON 기반 콘텐츠 관리**의 장점을 완벽하게 통합합니다.

---

## 1. 핵심 아키텍처 및 위험 분석

### 1.1. 핵심 아키텍처: 전략 + 어댑터 패턴

-   **`PromptSystemManager.ts` (전략 관리자):** `workspaceState`에 저장된 모드(`'caret'` | `'cline'`)에 따라 사용할 컴포넌트 제공자(전략)를 동적으로 선택합니다.
-   **`CaretJsonComponentProvider.ts` (어댑터):** Caret의 JSON 섹션들을 `cline-latest`의 `ComponentFunction` 형식으로 실시간 변환하여 `PromptRegistry`에 제공합니다.
-   **`ClineComponentProvider.ts` (순정 전략):** `cline-latest`의 순정 TypeScript 컴포넌트들을 그대로 `PromptRegistry`에 제공합니다.

### 1.2. 위험 분석 및 대응 전략

-   **🚨 Critical Risk: `Mission 1B-1` 테스트 블로킹**
    -   **원인:** `cline-latest`의 특정 컴포넌트가 하드코딩된 경로 별칭(`@utils/shell`)에 의존하여 발생하는 테스트 실패.
    -   **대응:** **Phase 1에서 해당 컴포넌트를 JSON 기반 어댑터로 우선 교체**하여 근본적인 의존성을 제거하고 프로젝트 블로커를 해결합니다.
-   **⚠️ Technical Risk: `PromptRegistry` 및 어댑터 구현 복잡성**
    -   **대응:** Phase 1에서 `cline-latest` 시스템을 그대로 복제하여 안정적인 기준점을 확보하고, TDD를 통해 하나의 컴포넌트씩 점진적으로 어댑터를 구현하여 복잡성을 관리합니다.

---

## 2. 구체적인 단계별 실행 계획 (TDD 접근)

### Phase 0: 기반 분석 및 설계 (완료)

-   **성과:** `cline-latest`와 Caret 시스템 분석을 완료하고, 통합 아키텍처 설계를 마쳤습니다.

### Phase 1: 기반 환경 구축 및 `Mission 1B-1` 블로커 해결

**목표:** `cline-latest`의 순정 시스템을 이식하여 안정적인 기준점을 마련하고, 최우선 과제인 `Mission 1B-1` 테스트를 통과시켜 프로젝트의 불확실성을 제거합니다.

1.  **[백업]** 현재 `src/core/prompts` 디렉토리를 `src/core/prompts_backup`으로 복사합니다.
2.  **[파일 복사]** `cline-latest/src/core/prompts/` 내의 모든 파일과 디렉토리를 `src/core/prompts/`로 덮어쓰기 복사합니다.
3.  **[연결 및 검증]** `src/extension.ts`에서 `cline-latest`의 `buildSystemPrompt`를 호출하도록 수정하고, `npm run compile` 및 `npm run test:backend`를 실행하여 순정 시스템이 정상 동작하는지 확인합니다.
4.  **[파일 생성]** `caret-src/core/prompts/` 경로에 `PromptSystemManager.ts`, `CaretJsonComponentProvider.ts`, 그리고 테스트를 위한 `__tests__/CaretJsonComponentProvider.test.ts` 파일을 생성합니다.
5.  **[RED] `Mission 1B-1` 해결을 위한 테스트 작성:**
    -   `CaretJsonComponentProvider.test.ts`에 `@utils/shell` 의존성이 있는 컴포넌트(예: `tool_use_section`)를 JSON 기반으로 대체했을 때, 오류 없이 프롬프트가 생성되는지 검증하는 테스트를 작성합니다.
6.  **[GREEN] 최소 어댑터 구현:**
    -   `CaretJsonComponentProvider.ts`에 `TOOL_DEFINITIONS.json`을 읽어 `tool_use_section` 컴포넌트의 내용을 생성하는 `adaptToolDefinitions()` 메서드를 구현합니다. 이 구현은 `@utils/shell`을 직접 import하지 않습니다.
7.  **[GREEN] 관리자 연동:**
    -   `PromptSystemManager`가 'caret' 모드일 때, 다른 모든 컴포넌트는 `cline-latest` 순정을 사용하되, 오직 `tool_use_section`만 `CaretJsonComponentProvider`의 어댑터를 사용하도록 구현합니다.
8.  **[VERIFY]** `Mission 1B-1` 관련 테스트를 포함한 전체 테스트를 실행하여 통과하는지 확인합니다.

**완료 기준:** `Mission 1B-1` 테스트가 통과하고, `cline-latest` 시스템 위에서 Caret의 JSON 기반 컴포넌트가 하나 이상 성공적으로 동작함.

### Phase 2: Caret 핵심 철학 이식 및 신규 기능 융합

**목표:** Caret의 핵심 철학(CHATBOT/AGENT, 도구 제한)을 시스템에 완전히 통합하고, `cline-latest`의 신규 기능(작업 관리 루프)을 Caret 철학에 맞게 변형하여 적용합니다.

1.  **[RED]** `CHATBOT/AGENT` 모드 테스트 작성:
    -   `context.mode`가 `'agent'`일 때 프롬프트에 "AGENT MODE"가 포함되고, `'chatbot'`일 때 "CHATBOT MODE"가 포함되는지 검증하는 테스트를 작성합니다.
    -   `context.mode`가 `'chatbot'`일 때 `TOOL_DEFINITIONS.json`의 `mode_restriction: "agent_only"`가 적용되어 `execute_command`가 프롬프트에서 제외되는지 검증하는 테스트를 작성합니다.
2.  **[GREEN]** `CaretJsonComponentProvider`에 `adaptChatbotAgentModes()`와 `adaptToolDefinitions()` 메서드를 `mode_restriction` 로직을 포함하여 완전하게 구현합니다.
3.  **[RED]** '작업 관리 루프' 테스트 작성:
    -   `auto_todo` 컴포넌트가 `'chatbot'` 모드에서는 '분석 계획' 스타일로, `'agent'` 모드에서는 '실행 계획' 스타일로 TODO를 생성하는지 검증하는 테스트를 작성합니다.
4.  **[GREEN]** `CARET_TODO_MANAGEMENT.json` 파일을 새로 생성하고, `CaretJsonComponentProvider`가 이 JSON 파일을 참조하여 모드별로 다른 TODO 프롬프트를 생성하는 `adaptAutoTodo()` 메서드를 구현합니다. `task_progress`, `feedback`도 동일한 패턴으로 구현합니다.
5.  **[VERIFY]** 관련 테스트를 모두 통과시키고, 토큰 효율성 분석 스크립트를 실행하여 14% 이상의 효율 우위를 유지하는지 확인합니다.

**완료 기준:** CHATBOT/AGENT 모드 및 도구 제한이 완벽하게 동작하고, '작업 관리 루프'가 Caret 철학에 맞게 차별화되어 동작함.

### Phase 3: 프론트엔드 통합 및 E2E 모드 전환 구현

**목표:** 사용자가 UI 설정을 통해 'Caret 하이브리드 시스템'과 'Cline 순정 시스템'을 실시간으로 전환할 수 있는 완전한 기능을 구현합니다.

1.  **[RED] E2E 테스트 작성 (`test:webview`):**
    -   `webview-ui/src/components/settings/providers/CaretProvider.test.tsx` (가칭) 파일에 다음 시나리오를 검증하는 E2E 테스트를 작성합니다.
        1.  초기 상태는 'Cline' 모드이며, 생성된 프롬프트에 "ACT MODE"가 포함된다.
        2.  UI에서 'Prompt System'을 'Caret'으로 변경하는 이벤트를 발생시킨다.
        3.  `vscode.postMessage`로 `{ type: 'promptSystem/setMode', payload: 'caret' }` 메시지가 전송된다.
        4.  백엔드 `workspaceState`가 `'caret'`으로 업데이트된다.
        5.  이후 생성되는 프롬프트에는 "AGENT MODE"가 포함되고 "ACT MODE"는 포함되지 않는다.
2.  **[GREEN] 프론트엔드 UI 구현:**
    -   `webview-ui/src/components/settings/providers/CaretProvider.tsx`에 `<select>` UI를 추가하고, `onChange` 이벤트 발생 시 위에서 정의한 `postMessage`를 호출하도록 구현합니다.
3.  **[GREEN] 백엔드 컨트롤러 구현:**
    -   `caret-src/controllers/PromptSystemController.ts` (신규) 파일에 `promptSystem/setMode` 메시지를 수신하는 핸들러를 구현합니다. 이 핸들러는 `workspaceState`를 업데이트하고 `PromptSystemManager.switchMode()`를 호출합니다.
    -   `extension.ts`에 이 컨트롤러와 메시지 핸들러를 등록합니다.
4.  **[VERIFY]** E2E 테스트를 통과시키고, F5로 확장 프로그램을 실행하여 UI 토글 시 시스템 프롬프트가 실시간으로 변경되는지 수동으로 최종 검증합니다.

**완료 기준:** 프론트엔드 UI를 통한 실시간 모드 전환 기능이 E2E 테스트와 수동 검증을 모두 통과함.

### Phase 4: 전체 시스템 안정화 및 최적화

**목표:** 모든 컴포넌트를 이식하고, 전체 테스트 스위트를 통과시키며, 성능 최적화를 적용하여 프로젝트를 안정화합니다.

1.  **[REFACTOR]** 나머지 모든 프롬프트 컴포넌트(Low Priority)를 JSON 기반 어댑터로 전환합니다.
2.  **[STABILIZE]** `npm run test:all`을 실행하고, 실패하는 모든 테스트 케이스를 수정하여 100% 통과 상태를 만듭니다.
3.  **[OPTIMIZE]** `CaretJsonComponentProvider`에 JSON 파일 내용을 캐싱하는 로직을 추가하여, 프롬프트 생성 시 파일 I/O가 반복적으로 발생하지 않도록 성능을 최적화합니다.
    ```typescript
    // CaretJsonComponentProvider.ts (최적화 예시)
    private static jsonCache = new Map<string, any>();
    private loadJsonSection(name: string): any {
        if (!CaretJsonComponentProvider.jsonCache.has(name)) {
            // ... 파일 읽기 로직 ...
            CaretJsonComponentProvider.jsonCache.set(name, content);
        }
        return CaretJsonComponentProvider.jsonCache.get(name);
    }
    ```
4.  **[VERIFY]** `npm run lint` 및 `npm run check-types`를 실행하여 코드 품질과 타입 안정성을 최종 확인합니다.

**완료 기준:** `npm run test:all`이 100% 통과하고, 성능 최적화가 적용되었으며, 코드 품질 검증을 통과함.

### Phase 5: 최종 문서화 및 인수 검증

**목표:** 프로젝트 산출물을 문서화하고, 최종 인수 기준에 따라 모든 기능이 완벽하게 동작하는지 검증합니다.

1.  **[DOCS]** 다음의 기술 문서를 작성합니다.
    -   `t06-implementation-guide.md`: 어댑터 패턴 구현 방법, 프론트엔드 연동 방식 등 기술적 내용을 상세히 기록합니다.
    -   `t06-user-migration-guide.md`: 새로운 시스템의 사용법과 모드 전환의 이점을 설명합니다.
2.  **[ACCEPTANCE TEST]** 최종 성공 기준 체크리스트의 모든 항목을 하나씩 실행하며 검증합니다.
    -   `Mission 1B-1` 통과 여부
    -   토큰 효율성 14.1% 이상 유지 여부
    -   CHATBOT/AGENT 모드 차별화 동작 여부
    -   UI 모드 전환 및 설정 영속성 여부
    -   기존 Caret 사용자 경험 보존 여부
3.  **[CLEANUP]** `src/core/prompts_backup` 디렉토리를 삭제하고, 최종 코드를 정리합니다.

**완료 기준:** 모든 기술 문서가 작성되고, 최종 인수 검증 체크리스트의 모든 항목을 통과함.

---

## 3. 최종 성공 기준 체크리스트

-   [ ] **`Mission 1B-1` 테스트 통과**
-   [ ] **`npm run test:all` 100% 통과**
-   [ ] **토큰 효율성 14.1% 이상 유지**
-   [ ] **기존 Caret 사용자 경험 100% 보존**
-   [ ] **CHATBOT/AGENT 철학 및 `mode_restriction` 완벽 구현**
-   [ ] **`cline-latest` 3대 신규 기능(작업 관리 루프) 융합 완료**
-   [ ] **프론트엔드 UI를 통한 실시간 모드 전환 및 설정 영속성 보장**
