## 1. 개요

`t06-phase5-cross-validation` 단계에서 Luke의 통합 테스트를 통해 Chatbot/Agent 모드의 여러 심각한 문제가 발견되었다. 이 문서는 해당 문제들의 근본 원인을 분석하고, 명확한 해결 방안을 제시하는 것을 목표로 한다.

분석 결과, 대부분의 문제는 __상태 관리 동기화 실&#xD328;__&#xC640; __불완전한 JSON 기반 도구 시스&#xD15C;__&#xC774;라는 두 가지 핵심 원인에서 비롯된 것으로 파악된다.

---

## 2. 핵심 문제 분석 및 해결 방안

### 2.1. [CRITICAL] 문제 1: 상태 관리 불일치로 인한 모드 오작동

#### 🔴 현상 (What is the problem?)

- __UI-백엔드 모드 불일치__: 사용자가 UI에서 'Agent' 모드를 선택해도, 백엔드에서는 'Chatbot' 모드로 인식한다. (`Mode: undefined, isChatbotMode: 항상 false` 문제)
- __AI 혼란__: AI가 자신의 상태를 "시스템 모드는 `ACT MODE`이지만, 현재 행동 방식은 `CHATBOT 모드`" 와 같이 혼란스럽게 설명한다.
- __잘못된 기능 제한__: Agent 모드임에도 Chatbot 모드의 도구 제한이 적용되어 터미널, 파일 수정 등의 핵심 기능이 실패한다.

#### 🧐 근거 (Evidence)

1. __Luke 테스트 로그__:

   - Agent 모드에서 시작했으나, 프롬프트 생성 로그는 `Generating prompt for mode: chatbot`으로 기록됨.
   - Chatbot 모드로 전환 시, AI가 "PLAN 모드에서는... 실행할 수 없습니다"라고 응답하여 Caret 모드(Chatbot)가 아닌 Cline 모드(Plan) 용어를 사용함.

2. __`f06-json-system-prompt.mdx` 문서 자체 분석__:

   - 문서 후반부 `localStorage vs ExtensionState 동기화 문제` 섹션에서 근본 원인을 명확히 지적함.
   - __원인__: 백엔드(`ExtensionState`)의 최신 상태가 프론트엔드 `localStorage`에 동기화되지 않고, `ButtonConfig`와 같은 주요 컴포넌트가 `localStorage`의 오래된 값을 참조하여 상태 불일치가 발생함.

#### 🔧 해결 방안 (How to fix it?)

`f06-json-system-prompt.mdx` 문서에 제시된 해결책을 즉시 적용한다.

1. __상태 동기화 구현 (`ExtensionStateContext.tsx`)__:

   - 백엔드로부터 `ExtensionState`를 수신할 때, `modeSystem`과 `mode` 값을 `localStorage`에 즉시 저장하는 로직을 추가한다.

   ```typescript
   // webview-ui/src/context/ExtensionStateContext.tsx
   // CARET MODIFICATION: Sync ExtensionState to localStorage
   if (newState.modeSystem !== undefined) {
       localStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, newState.modeSystem)
   }
   if (newState.mode !== undefined) {
       localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newState.mode)
   }
   ```

2. __상태 조회 우선순위 변경 (`buttonConfig.ts` 등)__:

   - `localStorage`를 직접 읽는 대신, `ExtensionState`를 우선적으로 참조하고 `localStorage`는 fallback으로만 사용하도록 수정한다.

   ```typescript
   // webview-ui/src/components/chat/chat-view/shared/buttonConfig.ts
   // ExtensionState 우선, localStorage fallback
   export function getButtonConfig(..., extensionState?: ExtensionState): ButtonConfig {
       const modeSystem = extensionState?.modeSystem || 
           localStorage.getItem(STORAGE_KEYS.MODE_SYSTEM) as "caret" | "cline" || 
           MODE_SYSTEMS.CARET;
       // ...
   }
   ```

3. __기본값 통일__:

   - 여러 컴포넌트에 분산된 기본 모드 시스템 값을 `MODE_SYSTEMS.CARET`으로 통일하여 초기 진입 시 혼선을 방지한다.

### 2.2. [CRITICAL] 문제 2: JSON 기반 도구 시스템의 구조적 결함

#### 🔴 현상 (What is the problem?)

- __핵심 도구 실패__: Agent 모드에서 브라우저, 터미널 실행 등 핵심 기능이 실패한다.
- __필수 파라미터 누락__: `browser_action` 도구 호출 시 `url` 파라미터가 누락되는 등, AI가 도구를 올바르게 사용하지 못한다.
- __도구 로딩 실패__: 로그에 `[CaretJsonAdapter] ❌ No tools available from Cline system` 메시지가 출력되며 도구 시스템 자체가 로드되지 않는 경우가 발생한다.

#### 🧐 근거 (Evidence)

1. __Luke 테스트 로그__:

   - `Cline tried to use browser_action without value for required parameter 'url'. Retrying...`
   - `run_shell_command` 사용 시도 후, AI가 "쉘 명령 실행에 문제가 발생하고 있습니다"라며 실패를 보고함.

2. __`t06-phase5-cross-validation.md` 문서의 계획 수정__:
   - "도구 시스템에 한해 JSON화를 포기하고 Cline 원본을 사용하는 것으로 계획을 수정함"이라고 명시하며, JSON 기반 도구 시스템 구현이 실패했음을 인정함.

#### 🔧 해결 방안 (How to fix it?)

__하이브리드 프롬프트 전&#xB7B5;__&#xC744; 채택하여, 안정성이 검증된 Cline의 네이티브 도구 시스템을 그대로 사용한다.

1. __JSON 도구 정의 폐기__:

   - `TOOL_DEFINITIONS.json`과 같이 도구 명세를 관리하던 JSON 파일 사용을 중단한다.

2. __`CaretPromptWrapper` 수정__:

   - 프롬프트 생성 시, 도구 관련 부분은 JSON에서 로드하는 대신 Cline의 기존 도구 생성 로직을 직접 호출하여 결과를 삽입하도록 변경한다.

   ```typescript
   // caret-src/core/prompts/CaretPromptWrapper.ts (Concept Code)
   import { getToolsSection as getClineToolsSection } from '.../src/core/prompts/system-prompt/sections/tools';

   // ... 프롬프트 생성 로직 ...
   const promptSections = [
       // ... 다른 Caret JSON 섹션들 ...
       await getClineToolsSection(context), // Cline 네이티브 도구 섹션 사용
       // ... 다른 Caret JSON 섹션들 ...
   ];
   ```

   이 접근법은 Caret의 독자적인 행동 철학(Chatbot/Agent)은 유지하면서, 복잡하고 안정성이 중요한 도구 시스템은 Cline의 구현을 그대로 활용하여 안정성과 호환성을 모두 확보하는 최적의 방안이다.

---

## 3. 부수적 문제 및 해결 방안

### 3.1. i18n (국제화) 키 누락

- __현상__: `chat.caretWantsToUseBrowser`, `chat.startNewTask` 등 번역되지 않은 i18n 키가 UI에 그대로 노출된다.
- __해결__: 관련된 모든 `ko.json` 파일에 누락된 키와 번역 값을 추가한다. 이는 단순한 데이터 추가 작업이므로 즉시 해결 가능하다.

### 3.2. 불충분한 디버그 로깅

- __현상__: 모드 전환 시 명확한 로그가 남지 않아 문제 추적이 어렵다.
- __해결__: `t06-phase5-cross-validation.md`에 제안된 대로, 모드 전환의 전체 흐름(UI 클릭 → gRPC 요청 → 백엔드 상태 변경 → 프롬프트 생성)을 추적할 수 있도록 `PromptSystemManager`, `CaretPromptWrapper`, 프론트엔드 토글 핸들러에 상세한 디버그 로그를 추가한다.

---

## 4. 요약 및 실행 계획

| 우선순위 | 문제점 | 해결 방안 | 담당 | | :--- | :--- | :--- | :--- | | __CRITICAL__ | __상태 관리 불일치__ | `ExtensionState`와 `localStorage` 동기화 및 조회 로직 수정 | Frontend | | __CRITICAL__ | __도구 시스템 결함__ | Cline 네이티브 도구 시스템을 사용하도록 `CaretPromptWrapper` 수정 | Backend | | __HIGH__ | __디버그 로깅 부재__ | 모드 전환 흐름 전반에 상세 로깅 추가 | Fullstack | | __MEDIUM__ | __i18n 키 누락__ | `ko.json` 파일에 누락된 번역 키 추가 | Frontend |

위 계획에 따라 최우선순위인 상태 관리와 도구 시스템 문제를 먼저 해결하면, AI 혼란 및 기능 오작동 등 대부분의 파생 문제가 해결될 것으로 기대된다.
