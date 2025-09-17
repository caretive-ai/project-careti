# 하이브리드 프롬프트 시스템 심층 분석 및 최종 실행 계획 v5.0

## 0. 문서의 목적

이 문서는 기존 계획들의 근본적인 오해를 바로잡고, `caret-merging` (cline-latest 기반) 프로젝트와 `caret-main`의 철학을 올바르게 통합하기 위한 심층 분석과 최종 실행 계획을 담고 있다. **코딩에 앞서, 이 문서를 통해 "무엇을, 왜, 어떻게" 만들 것인지 완벽하게 정의하는 것을 목표로 한다.**

---

## 1. 심층 분석 (Analysis)

### 1.1. `cline-latest` (현 프로젝트 베이스) 아키텍처 분석

#### 1.1.1. `PromptRegistry` 시스템
- **역할:** 시스템 프롬프트를 구성하는 `ComponentFunction`들을 등록하고, 컨텍스트에 따라 조합하여 최종 프롬프트를 생성하는 중앙 관리 시스템.
- **핵심 메소드:** `getInstance()`, `registerComponent()`, `get()`.
- **결론:** 이 구조를 그대로 활용하여 안정성을 확보한다.

#### 1.1.2. 신규 핵심 컴포넌트 3가지 분석 (기존 계획에서 누락된 부분)
- **`auto_todo.ts`:**
  - **역할:** 사용자의 요청을 바탕으로 작업 계획(TODO 리스트)을 자동으로 생성하여 프롬프트에 주입한다.
  - **Caret 통합 과제:** CHATBOT 모드에서는 '분석 및 제안' 중심의 TODO를, AGENT 모드에서는 '실행 가능한 명령어' 중심의 TODO를 생성하도록 만들어야 한다.
- **`task_progress.ts`:**
  - **역할:** 진행된 작업 단계를 요약하여 AI가 다음 단계를 인지하도록 돕는다.
  - **Caret 통합 과제:** Caret의 연속적인 대화 흐름과 이 컴포넌트를 어떻게 조화시킬지 정의가 필요하다.
- **`feedback.ts`:**
  - **역할:** AI에게 작업 결과에 대한 피드백을 요청하거나, 사용자에게 질문을 유도하는 프롬프트를 추가한다.
  - **Caret 통합 과제:** CHATBOT 모드의 '상담' 역할과 AGENT 모드의 '보고' 역할에 맞게 피드백 요청 방식을 다르게 설계해야 한다.

### 1.2. `caret-main` 핵심 철학 분석

#### 1.2.1. JSON 기반 프롬프트 시스템
- **역할:** 프롬프트의 내용을 코드와 분리하여 JSON 파일로 관리. 이를 통해 프롬프트의 수정, 확장, 다국어화가 용이하다.
- **핵심 자산:** `caret-src/core/prompts/sections/` 내의 18개 JSON 파일.
- **이식 목표:** 이 JSON 파일들이 `PromptRegistry`의 `ComponentFunction`으로 동작하도록 어댑터를 구현한다.

#### 1.2.2. CHATBOT/AGENT 모드 철학
- **CHATBOT Mode:** AI는 분석과 조언만 제공. 파일 수정, 명령어 실행 등 위험한 도구 사용이 금지됨 (`mode_restriction`).
- **AGENT Mode:** AI가 직접 코드를 수정하고 명령을 실행하는 협력적 개발 파트너.
- **이식 목표:** `mode_restriction`을 포함한 이 철학이 `cline-latest`의 모든 컴포넌트(신규 3가지 포함)에 일관되게 적용되도록 설계한다.

### 1.3. 통합 전략 및 갭 분석
- **전략:** 어댑터 패턴을 사용하여 `caret-main`의 JSON 파일들을 `cline-latest`의 `ComponentFunction`으로 변환하고, `PromptSystemManager`를 통해 'caret' 모드일 때 기존 컴포넌트를 이 어댑터로 대체(override)한다.
- **주요 과제:**
  1.  `auto_todo`, `task_progress`, `feedback` 컴포넌트를 위한 새로운 JSON 템플릿을 정의하고, 이들이 CHATBOT/AGENT 모드에 따라 동적으로 다른 내용을 생성하도록 어댑터를 구현해야 한다.
  2.  `mode_restriction` 로직이 `tool_use/tools.ts` 컴포넌트 어댑터에 정확히 구현되어, CHATBOT 모드에서 위험한 도구가 프롬프트에서 원천적으로 제외되도록 해야 한다.
  3.  모든 `cline-latest`의 기본 기능이 Caret 모드에서도 손상 없이 동작함을 보장해야 한다.

---

## 2. 최종 실행 계획 v5.0 (Plan)

이 계획은 심층 분석 결과를 바탕으로, TDD(테스트 주도 개발) 접근법에 따라 구체적인 실행 단계를 정의한다.

### Phase 1: 어댑터 뼈대 구축 및 핵심 철학(CHATBOT/AGENT) 이식

**목표:** 어댑터의 기본 구조를 TDD로 구현하고, 가장 중요한 `act_vs_plan_mode` 컴포넌트를 Caret의 CHATBOT/AGENT 철학으로 성공적으로 대체하여 기술적 가능성을 검증한다.

1.  **[백업]** `src/core/prompts` 디렉토리를 `src/core/prompts_backup`으로 복사한다.
2.  **[파일 생성]** `caret-src/core/prompts/` 경로에 다음 파일들을 생성한다.
    -   `CaretJsonComponentProvider.ts` (어댑터)
    -   `PromptSystemManager.ts` (전략 관리자)
    -   `__tests__/CaretJsonComponentProvider.test.ts` (테스트 파일)
3.  **[RED] 테스트 작성:**
    -   `CaretJsonComponentProvider.test.ts`에, `CHATBOT_AGENT_MODES.json`을 읽어 `ComponentFunction`을 생성하고, 이 함수가 `context.mode`에 따라 "AGENT MODE" 또는 "CHATBOT MODE" 문자열을 포함하는 프롬프트를 반환하는지 검증하는 **실패하는 테스트**를 작성한다.
4.  **[GREEN] 최소 어댑터 구현:**
    -   `CaretJsonComponentProvider.ts`에 `adaptChatbotAgentModes()` 메서드를 **최소한으로 구현**하여 테스트를 통과시킨다.
5.  **[GREEN] 관리자 및 연동 구현:**
    -   `PromptSystemManager`가 'caret' 모드일 때, `PromptRegistry.getInstance().registerComponent('act_vs_plan_mode', ...)`를 호출하여 기존 컴포넌트를 새로 만든 어댑터로 **대체**하도록 구현한다.
    -   `src/core/prompts/system-prompt/index.ts`에 `PromptSystemManager`를 호출하는 분기 로직을 **CARET MODIFICATION**으로 추가한다.

**완료 기준:**
-   `act_vs_plan_mode` 컴포넌트가 성공적으로 JSON 기반으로 대체되어 동작한다.
-   관련 단위 테스트가 모두 통과한다.
-   `npm run compile`이 성공한다.

### Phase 2: 신규 기능(작업 관리 루프) 융합 및 도구 제한 구현

**목표:** `cline-latest`의 신규 컴포넌트 3가지를 Caret 철학에 맞게 융합하고, `mode_restriction`을 구현하여 CHATBOT 모드의 안전성을 확보한다.

1.  **[RED]** `mode_restriction` 테스트 작성: `context.mode`가 'chatbot'일 때 `TOOL_DEFINITIONS.json`의 `mode_restriction`이 적용되어 `execute_command`가 프롬프트에서 제외되는지 검증하는 테스트를 작성한다.
2.  **[GREEN]** `adaptToolDefinitions()` 메서드에 `mode_restriction` 로직을 추가하여 구현한다.
3.  **[RED]** '작업 관리 루프' 테스트 작성: `auto_todo` 컴포넌트가 CHATBOT 모드에서는 '분석 계획' 스타일로, AGENT 모드에서는 '실행 계획' 스타일로 TODO를 생성하는지 검증하는 테스트를 작성한다.
4.  **[GREEN]** `CARET_TODO_MANAGEMENT.json` 등 신규 기능 융합을 위한 JSON 파일을 생성하고, 이를 참조하여 모드별 프롬프트를 생성하는 어댑터 메서드(`adaptAutoTodo()` 등)를 구현한다.
5.  **[VERIFY]** 관련 테스트를 모두 통과시키고, 토큰 효율성을 분석하여 14% 이상의 우위를 유지하는지 확인한다.

**완료 기준:**
-   CHATBOT 모드에서 위험한 도구가 프롬프트에서 제외된다.
-   `auto_todo` 등 신규 기능이 CHATBOT/AGENT 모드에 따라 다르게 동작한다.
