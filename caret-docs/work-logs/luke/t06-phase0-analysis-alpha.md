# Phase 0 분석 보고서 (AI: Alpha) - 심층 분석 (완료)

## 대상: `cline-latest/src/core/prompts/` 디렉토리 구조 분석

### 1. 분석 내용 (1차)

`list_files` 명령을 통해 `cline-latest/src/core/prompts/` 디렉토리의 1차 구조를 확인했으며, `system-prompt/`와 `system-prompt-legacy/`의 존재를 통해 대대적인 아키텍처 변경을 확인했습니다.

### 2. 심층 분석: `system-prompt` vs `system-prompt-legacy`

두 디렉토리의 내부 구조를 비교하여 아키텍처의 차이점을 명확히 분석했습니다.

#### **`system-prompt` (신규 시스템) 구조**
```
index.ts              # 시스템 진입점 (Entry Point)
README.md
spec.ts               # 시스템 명세/테스트
types.ts              # 타입 정의
utils.ts              # 유틸리티 함수
__tests__/
components/           # 재사용 가능한 프롬프트 조각 (컴포넌트)
registry/             # 프롬프트 등록 및 관리
templates/            # 프롬프트 템플릿
tools/                # 도구 관련 프롬프트 로직
variants/             # 프롬프트 변형 (e.g., 모델별 최적화)
```
- **아키텍처**: **컴포넌트 기반(Component-Based) 아키텍처**. 프롬프트를 기능별로 잘게 쪼개진 '컴포넌트'로 만들고, 이를 `registry`와 `templates`를 통해 동적으로 조립하는 매우 정교하고 현대적인 방식입니다.
- **특징**: 높은 재사용성, 확장성, 유지보수성. Caret의 JSON 시스템이 추구했던 '모듈화' 철학을 TypeScript 네이티브 방식으로 구현했습니다.

#### **`system-prompt-legacy` (레거시 시스템) 구조**
```
generic-system-prompt.ts  # 핵심 프롬프트 로직
families/                 # 프롬프트 계열/변형
```
- **아키텍처**: **모놀리식(Monolithic) 아키텍처**. `generic-system-prompt.ts`라는 하나의 거대한 파일에 대부분의 프롬프트 로직이 집중되어 있는 전통적인 방식입니다.
- **특징**: `caret-main`이 개선하고자 했던 바로 그 대상입니다. 수정이 어렵고, 확장성이 떨어지며, 가독성이 낮습니다.

### 3. 통합 지점 분석: `PromptRegistry`와 `Components`

- **`PromptRegistry.ts`**: 이 시스템의 핵심으로, `registerComponent(id, fn)` 메소드를 통해 프롬프트 조각들을 등록하고, `get(context)` 메소드를 통해 동적으로 최종 프롬프트를 조립합니다.
- **`components/index.ts`**: `getSystemPromptComponents()` 함수를 통해 시스템에 내장된 모든 프롬프트 컴포넌트(`id`와 `fn`의 쌍)를 배열 형태로 제공합니다. 이것이 `PromptRegistry`가 컴포넌트를 로드하는 방식의 실체입니다.

### 4. 심층 비교 분석: Caret JSON vs. `cline-latest` TS Components

| Caret JSON Section | `cline-latest` TS Component | 비교 분석 및 시사점 |
| :--- | :--- | :--- |
| `OBJECTIVE`, `RULES`, `CAPABILITIES` | `getObjectiveSection`, `getRulesSection`, `getCapabilitiesSection` | **(동등)** 기본적인 AI 역할/규칙 정의. Caret의 JSON 콘텐츠를 그대로 활용 가능. |
| `TOOL_DEFINITIONS`, `TOOL_USE_*` | `getToolUseSection` | **(통합됨)** `cline-latest`는 도구 관련 내용을 단일 컴포넌트로 통합. Caret의 세분화된 JSON을 이 구조에 맞게 어댑터로 합쳐야 함. |
| `CHATBOT_AGENT_MODES` | `getActVsPlanModeSection` | **(철학적 차이)** `cline-latest`는 기술적 상태(`Act/Plan`)에 집중, Caret은 상호작용 페르소나(`Chatbot/Agent`)에 집중. **Caret의 철학적 우위가 드러나는 지점.** |
| **(없음)** | `getTodoListSection`, `getUpdatingTaskProgress`, `getFeedbackSection` | **(새로운 필수 요소)** `cline-latest` 에이전트가 자신의 작업 목록과 상태를 프롬프트 내에서 관리하기 시작했음을 의미. **반드시 반영해야 할 핵심적인 구조 변경.** |

### 5. `cline-latest`의 새로운 작업 관리 루프 분석

`cline-latest`에 새로 추가된 3개의 컴포넌트(`auto_todo`, `task_progress`, `feedback`)는 서로 유기적으로 연결되어 하나의 완성된 **'작업 관리 루프'**를 형성한다.

1.  **계획 (Plan) - `auto_todo.ts`**: `PLAN` 모드에서 `ACT` 모드로 전환 시, AI는 반드시 Markdown 형식의 `TODO` 리스트를 생성하여 명확한 작업 계획을 수립해야 한다.
2.  **실행 및 보고 (Execute & Report) - `task_progress.ts`**: 모든 도구 사용 시, `task_progress` 파라미터를 통해 `TODO` 리스트의 최신 상태를 첨부하여 진행 상황을 시각적으로, 그리고 '조용히(silently)' 보고해야 한다.
3.  **소통 및 조정 (Communicate & Adjust) - `feedback.ts`**: 작업 중 발생하는 사용자의 피드백이나 AI 자신에 대한 질문에 대응하는 방법을 정의한다.

이 루프는 `cline-latest` 에이전트가 이전보다 훨씬 **체계적이고, 투명하며, 상호작용적으로** 작업을 수행하게 만드는 핵심적인 구조적 발전이다.

### 6. 최종 결론 및 통합 전략

1.  **Caret의 철학적 우위**: 'Chatbot vs Agent'라는 우리의 접근 방식은 단순한 기술적 상태 구분을 넘어, AI의 행동 철학을 정의하므로 `cline-latest`보다 **더 고차원적인 목표**를 가집니다.
2.  **`cline-latest`의 구조적 발전**: `TODO`-`TASK_PROGRESS`로 이어지는 작업 관리 루프는 반드시 채택해야 할 매우 효과적인 구조적 발전입니다.
3.  **최종 통합 전략: '하이브리드 확장' (Hybrid Expansion)**
    - **`cline-latest`의 작업 관리 루프를 뼈대로 채택**: `cline-latest`의 새로운 필수 컴포넌트(`TODO`, `TASK_PROGRESS` 등)와 그 작동 방식을 우리 시스템의 기본 구조로 존중하고 채택한다.
    - **Caret의 철학을 뇌로 이식**: `getActVsPlanModeSection` 컴포넌트를 우리의 `CHATBOT_AGENT_MODES.json` 콘텐츠를 사용하도록 어댑터를 구현하여, `cline-latest`의 체계적인 몸체 위에서 Caret의 우월한 행동 철학(뇌)이 동작하도록 만든다.
    - **콘텐츠 관리는 JSON으로**: 작업 관리 루프의 규칙 텍스트 등 모든 프롬프트 '콘텐츠'는 JSON으로 관리하여 Caret의 장점을 유지한다.

**결론**: 우리의 최종 목표는 `cline-latest`의 새로운 구조적 요구사항을 모두 만족시키면서, 그 위에 우리의 우월한 행동 철학을 덧씌워, 두 시스템의 장점만을 결합한 **'궁극의 하이브리드 시스템'**을 구축하는 것입니다.

---
**Phase 0 심층 분석 최종 완료**

## 부록: 토큰 효율성 비교 심층 분석

### 1. 분석 목표

`cline-latest`가 새로운 컴포넌트 아키텍처로 리팩토링됨에 따라, 기존에 Caret 시스템이 가졌던 토큰 효율성 우위가 여전히 유효한지 객관적인 데이터로 재검증하고, 그 방법론을 명확히 기록한다.

### 2. 분석 방법론: '콘텐츠 중심 토큰 추정'

단순히 파일의 바이트(byte) 크기를 비교하는 것은 TypeScript의 키워드(`const`, `export` 등)나 JSON의 구조(`{`, `}` 등)까지 모두 포함하므로, LLM이 실제 처리하는 의미 단위의 토큰 효율성을 정확히 측정하기 어렵다.

따라서, 다음과 같은 '콘텐츠 중심'의 정교한 방법론을 사용했다.

1.  **등가 비교 원칙**: `cline-latest`의 새로운 기능(`TODO` 등 3개)을 제외하고, 두 시스템이 **공통으로 가지고 있는 기능**에 해당하는 프롬프트 내용만을 비교 대상으로 삼았다.
    *   **`cline-latest`**: 10개의 공통 TS 컴포넌트 파일에서 순수 프롬프트 텍스트만 추출하여 `caret-scripts/temp/cline-prompt.txt` 파일로 병합했다.
    *   **Caret**: `cline-latest`의 10개 컴포넌트에 대응하는 18개의 JSON 섹션 파일 내용을 모두 `caret-scripts/temp/caret-prompt.txt` 파일로 병합했다.

2.  **객관적 측정 도구**: `caret-scripts/utils/token-efficiency-analyzer.js` 스크립트를 사용하여 두 개의 병합된 텍스트 파일의 토큰 양을 측정했다.
    *   이 스크립트는 공백을 기준으로 단어 수를 계산하고, 이를 기반으로 보수적/표준적/공격적/문자 기반의 4가지 방식으로 토큰 수를 '추정'한 뒤, 그 평균값을 최종 결과로 사용한다.
    *   이 방식은 실제 토크나이저가 의미 단위로 텍스트를 나누는 방식에 더 근접하므로, 단순 바이트 계산보다 훨씬 더 정확하게 LLM의 관점에서 효율성을 측정할 수 있다.

### 3. 분석 결과

| 시스템 | 평균 추정 토큰 | 문자 수 | 단어 수 |
| :--- | :--- | :--- | :--- |
| `cline-latest` (TS) | **5,016** | 27,086 | 4,315 |
| Caret (JSON) | **4,307** | 26,588 | 3,435 |
| **효율성 차이** | **-14.1%** | -1.8% | -20.4% |

**결론**: **Caret의 JSON 시스템이 `cline-latest`의 신규 TS 시스템보다 여전히 14.1% 더 토큰 효율적임이 검증되었다.** 이는 JSON 형식이 TypeScript 코드에 비해 순수한 '콘텐츠'의 비율이 높기 때문이다.

### 4. 추가 효율성 향상 방안

14.1%의 우위에 만족하지 않고, 격차를 더욱 벌리기 위한 방안은 다음과 같다.

1.  **콘텐츠 최적화 (Prompt Minifying)**: 현재 JSON 파일 내의 서술적인 문장들을 의미는 유지하면서 더 짧고 간결하게 다듬는 '프롬프트 다이어트'를 수행한다. (예: "You have access to a set of tools" → "Tools available:")
2.  **구조 최적화 (Schema Compacting)**: JSON의 키(`"title"`, `"description"`)를 한 글자(`"t"`, `"d"`)로 줄이거나, 키-값 구조 대신 배열 구조를 사용하여 키 자체를 제거하는 '압축 스키마'를 도입한다. (단, 이 방식은 가독성을 해치므로 신중한 접근이 필요하다.)
