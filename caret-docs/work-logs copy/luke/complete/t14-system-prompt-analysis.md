# T14 시스템 프롬프트 근본 원인 분석 및 개선 계획

**작성일:** 2025-09-21
**담당자:** Caret (AI)
**상태:** 분석 완료, 개선 계획 수립

## 1. 작업 시작 계기

Caret 에이전트가 사용자의 승인을 기다리지 않고 작업을 성급하게 진행하는 문제가 발생했습니다. 사용자는 이 행동의 근본적인 원인을 파악하기 위해 시스템 프롬프트 전달 과정을 분석하도록 지시했습니다.

## 2. 초기 분석 계획

Caret의 행동을 제어하는 시스템 프롬프트가 어떻게 구성되고 전달되는지 확인하여, 성급한 행동을 유발하는 규칙이나 누락된 지침이 있는지 파악하는 것을 목표로 삼았습니다.

1.  현재 시스템 프롬프트 생성 아키텍처를 분석한다.
2.  과거의 시점의 아키텍처와 비교하여 변경점을 찾는다. 현재 코드는 최신 Cline변경된 구조에 Agent/Chatbot과 json 로더의 하이브리드 방식으로 변경된 구조임
  - 그 과정중 일부 중요 agent, chatbot의 시스템프롬프트가 누락된것으로 보임 "자동실행"은 독단적으로 동작함
3.  누락되거나 잘못된 규칙을 식별하여 근본 원인을 규명한다.

## 3. 분석 내용 및 발견 사항

### 과거 vs. 현재 아키텍처 비교
- **현재:** `CaretJsonAdapter.ts`가 단일 `sectionNames` 배열을 통해 프롬프트 섹션을 순차적으로 조합하는 단순화된 구조. 
- **과거:** `JsonSectionAssembler.ts`가 `Base`, `Dynamic`, `Conditional`, `Final`의 4단계로 나누어 보다 복잡하고 세밀하게 프롬프트를 구성하는 구조
  => 위 방식 변화는 하드코딩된  Cline의 프롬프트 로딩 방식 변경으로 인해, 최소 침습으로 단순화 구조로 변경하였음. 특히 툴의 경우 그대로 사용하도록 하여 머징 용이성을 증가시켰음

### 핵심 원인 발견: `COLLABORATIVE_PRINCIPLES` 섹션 누락
- 과거 프롬프트에는 "계획 및 확인(Plan and Confirm)", "의도 기반 실행(Intent-Driven Execution)" 등 AI의 협업적 태도를 정의하는 **`COLLABORATIVE_PRINCIPLES`** 섹션이 명시적으로 포함되어 있었습니다.
- 현재 프롬프트 아키텍처에서는 이 섹션이 **완전히 누락**되었습니다.
- 이로 인해 "자율적 실행(autonomous execution)"이라는 규칙만 남아, AI가 사용자와의 협의 없이 작업을 즉시 수행하는 성급한 행동을 유발했습니다.


## 4. 향후 개선 계획

### 단기 조치 (완료)
1.  **`COLLABORATIVE_PRINCIPLES.json` 파일 복원:** 누락된 협업 원칙 파일을 과거 내용을 기반으로 재생성했습니다.
2.  **`CaretJsonAdapter.ts` 수정:** 복원된 협업 원칙이 시스템 프롬프트에 올바르게 포함되도록 수정했습니다.

### 장기적 검토 및 개선 사항
1.  **누락된 조건부 로직 복원 검토:** 특정 모델이나 상황에 맞는 프롬프트 최적화 로직을 다시 도입할지 검토가 필요합니다.
2.  **`CARET_TASK_OBJECTIVE` 섹션 위치 재조정:** AI가 최종 목표를 명확히 인지하도록 해당 섹션을 프롬프트의 마지막으로 이동하는 것을 고려해야 합니다.
3.  **전체 프롬프트 섹션 재검토:** 리팩토링 과정에서 누락된 다른 유용한 섹션이 있는지 전수 조사를 통해 프롬프트의 완성도를 높여야 합니다.

## 5. 주요 참조 파일 (Key Reference Files)

### 현재 시스템 (`caret` 프로젝트)
-   **프롬프트 관리자:** `caret-src/core/prompts/system/PromptSystemManager.ts`
-   **프롬프트 어댑터 (핵심 로직):** `caret-src/core/prompts/system/adapters/CaretJsonAdapter.ts`
-   **행동 규칙:** `caret-src/core/prompts/sections/CARET_BEHAVIOR_RULES.json`
-   **복원된 협업 원칙:** `caret-src/core/prompts/sections/COLLABORATIVE_PRINCIPLES.json`

### 과거 시스템 (`caret-old` 프로젝트 @ `c3726b6e`)
-   **과거 프롬프트 관리자:** `caret-old/caret-src/core/prompts/CaretSystemPrompt.ts`
-   **과거 프롬프트 조립기:** `caret-old/caret-src/core/prompts/JsonSectionAssembler.ts`
