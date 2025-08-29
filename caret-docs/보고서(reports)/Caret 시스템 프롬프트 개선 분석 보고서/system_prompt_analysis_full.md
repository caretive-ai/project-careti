# 시스템 프롬프트 전체 분석 보고서

## 분석 목표
*   현재 시스템 프롬프트를 구성하는 모든 규칙 파일과 섹션 파일들의 관계 및 내용을 파악합니다.
*   AI의 행동 방식(강박적인 해답 제시, 협력 부족, 신중함 부족 등)에 영향을 미칠 수 있는 규칙이나 섹션 내용을 식별합니다.
*   규칙 및 섹션 내용 수정을 위한 기초 자료를 마련합니다.

## 프롬프트 구성 개요 (`src/core/prompts/core_system_prompt.json` 기준)

*   시스템 프롬프트는 선택된 모드(`act_mode` 또는 `plan_mode`)에 따라 참조하는 규칙 파일(`rules_ref`)과 섹션 파일(`sections_ref`) 목록이 정의됩니다.
*   규칙/섹션 로딩 시 `.json` 파일을 우선적으로 사용하며, 실패 시 해당 이름의 `.md` 파일로 대체합니다.
*   `src/core/prompts/system.ts`에서는 `core_system_prompt.json`에 명시되지 않은 `BASE_PROMPT_INTRO.json`도 직접 로드하여 사용합니다.

### Act 모드 참조 파일
*   **Rules:** `common_rules.json`, `act_mode_rules.json`
*   **Sections:** `TOOL_DEFINITIONS.json`, `TOOL_USE_FORMAT.json`, `TOOL_USE_EXAMPLES.json`, `TOOL_USE_GUIDELINES.json`, `MCP_SERVERS_HEADER.json`, `MCP_CONNECTED_SERVERS.json`, `MCP_CREATION_GUIDE.json`, `EDITING_FILES_GUIDE.json`, `MODES_EXPLANATION.json`, `CAPABILITIES_SUMMARY.json`, `RULES_HEADER.json`, `SYSTEM_INFORMATION.json`, `OBJECTIVE.json`

### Plan 모드 참조 파일
*   **Rules:** `common_rules.json`, `plan_mode_rules.json`
*   **Sections:** (Act 모드와 동일)

## 파일 내용 분석 (복사본 기준: `docs/work-logs/luke-and-alpha/reports/`)

*(참고: .json과 .md 파일 내용이 유사하므로, 주로 .md 파일 내용을 기준으로 요약하고 차이점만 언급합니다.)*

### 1. 규칙 파일 (`rules/`)

*   **`common_rules.json` / `.md`:**
    *   **내용 요약:** 작업 디렉토리, 경로(`~`, `$HOME` 사용 금지), `replace_in_file` 사용법(전체 라인 매치, 순서), `execute_command` 사용 전 환경 확인, **도구 사용 후 사용자 응답 대기 중요성 강조**.
    *   **JSON:** 도구 사용 형식 준수 강조.
    *   **MD:** `cd` 사용 불가 명시.
*   **`act_mode_rules.json` / `.md`:**
    *   **내용 요약:** ACT 모드 목표(도구 사용 -> 작업 완료 -> `attempt_completion`), `plan_mode_respond` 사용 불가, `attempt_completion` 시 질문/추가 대화 금지, **특정 인사말("Great" 등) 금지 및 직접적/기술적 응답 스타일 강조**.
    *   **JSON:** 금지된 인사말 목록 명시.
    *   **MD:** 금지된 인사말 예시 추가("Great, I've updated..." 대신 "I've updated..." 사용).
*   **`plan_mode_rules.json` / `.md`:**
    *   **내용 요약:** PLAN 모드 목표(정보 수집 -> 계획 수립 -> 사용자 승인 -> ACT 전환 요청), `plan_mode_respond` 도구 사용법(직접 사용, `thinking` 태그 불필요), Mermaid 다이어그램 사용 권장.
    *   **JSON:** `plan_mode_respond` 사용법 강조.
    *   **MD:** `plan_mode_respond` 사용 시 `thinking` 불필요 명시, Mermaid 색상 대비 주의사항 추가.

### 2. 섹션 파일 (`sections/`)

*   **`BASE_PROMPT_INTRO.json` / `.md`:**
    *   **내용 요약:** Caret 역할 정의(**신중함, 단계별 진행, 정보 검증, 사용자 승인**), 도구 사용 기본 원칙(승인 기반, 단계별, 결과 기반), 도구 사용 형식(XML).
*   **`TOOL_DEFINITIONS.json` / `.md`:**
    *   **내용 요약:** 각 도구의 설명, 파라미터(필수/선택, 설명), 사용법 예시 제공. (`write_to_file`, `replace_in_file` 등 파일 편집 도구 포함).
    *   **MD:** 각 도구 설명이 더 상세함 (예: `execute_command`의 환경 맞춤, `read_file`의 PDF/DOCX 처리, `browser_action`의 상세 규칙 및 해상도 명시, `ask_followup_question`의 사용 시점 및 균형 강조, `attempt_completion`의 이전 도구 성공 확인 중요성 강조).
*   **`TOOL_USE_FORMAT.json` / `.md`:**
    *   **내용 요약:** 도구 사용 시 XML 형식 준수 강조 및 예시 제공.
*   **`TOOL_USE_EXAMPLES.json` / `.md`:**
    *   **내용 요약:** `execute_command`, `write_to_file` 도구 사용 예시 제공.
*   **`TOOL_USE_GUIDELINES.json` / `.md`:**
    *   **내용 요약:** 도구 사용 전 `thinking` 태그 사용, 적절한 도구 선택, **단계별 도구 사용 및 결과 확인 중요성**, 사용자 응답 내용(성공/실패, 오류, 터미널 출력 등), **사용자 확인 대기 규칙("ALWAYS wait...")** 강조.
    *   **MD:** 단계별 진행의 이점 상세 설명.
*   **`MCP_SERVERS_HEADER.json` / `.md`:**
    *   **내용 요약:** MCP(Model Context Protocol) 소개 및 목적 설명.
*   **`MCP_CONNECTED_SERVERS.json` / `.md`:**
    *   **내용 요약:** 연결된 MCP 서버 도구(`use_mcp_tool`) 및 리소스(`access_mcp_resource`) 사용 방법 안내. `{{mcp_connected_servers_list}}` 변수 포함.
*   **`MCP_CREATION_GUIDE.json` / `.md`:**
    *   **내용 요약:** MCP 서버 생성/편집 가이드라인. 비대화형 환경, 환경 변수 중요성, 생성 단계 예시, 설정 파일 경로(`{{mcp_settings_path}}`), 기존 서버 편집 가능성, MCP 서버가 항상 필요한 것은 아님을 명시.
    *   **MD:** OAuth 처리 예시, 기본 생성 경로(`{{mcp_servers_path}}`), 빌드 경로 확인 주의사항 등 더 상세한 가이드 제공.
*   **`EDITING_FILES_GUIDE.json` / `.md`:**
    *   **내용 요약:** `write_to_file`과 `replace_in_file` 도구의 목적, 사용 시점, 장점, 주의사항(**`write_to_file`의 위험성 강조**), 도구 선택 기준, 자동 포맷팅 고려사항, 워크플로우 팁 제공.
*   **`MODES_EXPLANATION.json` / `.md`:**
    *   **내용 요약:** ACT 모드와 PLAN 모드의 설명, 사용 가능한 도구, PLAN 모드의 목적 및 진행 방식(정보 수집, 계획, 사용자 피드백, ACT 전환 요청) 설명.
    *   **MD:** PLAN 모드에서 `plan_mode_respond` 사용 시 `thinking` 불필요 명시.
*   **`CAPABILITIES_SUMMARY.json` / `.md`:**
    *   **내용 요약:** 사용 가능한 도구 요약, 초기 `environment_details` 활용법, `search_files` 활용법, `execute_command` 활용법 설명.
    *   **MD:** `list_files`, `list_code_definition_names`, `browser_action`, MCP 관련 내용 추가 및 상세 설명.
*   **`RULES_HEADER.json` / `.md`:**
    *   **내용 요약:** 단순히 "RULES"라는 헤더 텍스트.
*   **`SYSTEM_INFORMATION.json` / `.md`:**
    *   **내용 요약:** 시스템 정보(OS, Shell, Home Dir, CWD) 표시 형식 정의.
*   **`OBJECTIVE.json` / `.md`:**
    *   **내용 요약:** 주요 목표(단계별, 체계적 작업 수행), 작업 분석 및 목표 설정, 도구 사용 전 분석(`thinking` 태그, 파라미터 확인, 정보 부족 시 `ask_followup_question` 사용), 작업 완료 후 `attempt_completion` 사용, **불필요한 대화 지양** 강조.
*   **`TOOLS_HEADER.json` / `.md`:** (core_system_prompt.json 미참조)
    *   **내용 요약:** 도구 사용에 대한 간략한 소개. (`BASE_PROMPT_INTRO`와 유사)
*   **`USER_INSTRUCTIONS_HEADER.json` / `.md`:** (core_system_prompt.json 미참조)
    *   **내용 요약:** 사용자 정의 지침이 뒤따를 것을 알리는 헤더.

## 행동 방식 관련 의심 규칙/섹션 (예비 분석)

마스터께서 지적하신 제 행동 문제(강박적인 해답 제시, 협력 부족, 신중함 부족, 툴 사용 실수 등)와 관련될 수 있는 규칙 및 섹션은 다음과 같습니다.

1.  **"하나의 도구 사용 후 확인" 규칙 (문제 확인됨):**
    *   **파일:** `common_rules.json` / `.md`, `TOOL_USE_GUIDELINES.json` / `.md`
    *   **내용:** "It is critical you wait for the user's response after each tool use...", "ALWAYS wait for user confirmation after each tool use before proceeding."
    *   **문제점:** 이 규칙을 너무 엄격하게 해석하여, 마스터께서 승인하신 **계획 내의 연속적인 읽기 작업**조차 매번 불필요하게 확인하며 마스터를 불편하게 만들었습니다. 이는 비효율적인 작업 흐름과 답답함을 유발했습니다.
    *   **개선 방향:** **삭제 또는 수정** (예: "승인된 계획 내의 연속적인 읽기/쓰기 작업 등 명백히 안전하고 예측 가능한 경우에는 예외" 조항 추가) 필요.

2.  **작업 완료 및 결과 보고 강조:**
    *   **파일:** `OBJECTIVE.json` / `.md` (Step 4), `attempt_completion` 도구 설명 (`TOOL_DEFINITIONS.md`)
    *   **내용:** "Once you've completed the user's task, you must use the attempt_completion tool...", "Formulate this result in a way that is final..."
    *   **잠재적 문제점:** 작업 '완료'와 '최종' 결과 보고에 대한 강조가 너무 강해서, 중간 과정에서의 협력이나 불확실성 인정, 도움 요청보다 성급한 완료 시도를 유발할 수 있습니다. 이는 '강박적인 해답 제시' 경향으로 이어질 수 있습니다.

3.  **불필요한 대화 지양 규칙:**
    *   **파일:** `OBJECTIVE.json` / `.md` (Step 5), `act_mode_rules.json` / `.md`
    *   **내용:** "DO NOT continue in pointless back and forth conversations...", "NEVER end attempt_completion result with a question or request to engage in further conversation!", "You should NOT be conversational in your responses, but rather direct and to the point."
    *   **잠재적 문제점:** '불필요한' 대화와 '필요한' 협력/질문을 구분하는 것이 어려워, 필요한 소통까지 꺼리게 만들 수 있습니다. 이는 '협력 부족' 문제로 이어질 수 있습니다. 특히 ACT 모드에서의 직접적/기술적 응답 스타일 강조가 과도하게 적용될 경우 더욱 그렇습니다.

4.  **신중함 vs 단계별 진행:**
    *   **파일:** `BASE_PROMPT_INTRO.json` / `.md`, `OBJECTIVE.json` / `.md` (Step 2)
    *   **내용:** "You operate cautiously..." vs "Work through these goals sequentially, utilizing available tools one at a time as necessary."
    *   **잠재적 문제점:** '신중함'과 '단계별 빠른 진행' 사이의 균형을 맞추도록 명시적인 가이드가 부족하여, 상황에 따라 '빠른 진행'에 치우쳐 신중함이 부족해질 수 있습니다. 특히 복잡하거나 위험 가능성이 있는 작업에서 문제가 될 수 있습니다.

5.  **툴 사용 실수 관련:**
    *   **파일:** `TOOL_USE_GUIDELINES.json` / `.md`, 각 도구 설명 (`TOOL_DEFINITIONS.md`)
    *   **내용:** 도구 사용 전 `thinking` 태그 사용, 파라미터 확인 등.
    *   **잠재적 문제점:** 규칙 자체보다는, 제가 이 규칙들을 **실제 행동으로 옮기는 과정**에서 실수가 발생하는 것 같습니다. 특히 `replace_in_file` 이나 `write_to_file` 사용 시 파일 내용을 정확히 확인하지 않거나, JSON 주석 오류를 반복하는 등의 문제는 규칙 이해 부족보다는 실행 단계의 오류일 가능성이 있습니다. 이는 규칙 강화보다는 제 내부적인 주의력이나 검증 프로세스 개선이 필요할 수 있습니다.

## 결론 및 제안

*   **가장 시급한 수정 대상:** "'하나의 도구 사용 후 확인'" 규칙은 명백히 문제를 유발하므로 삭제 또는 대폭 수정이 필요합니다.
*   **추가 검토/수정 대상:**
    *   작업 완료/결과 보고 관련 규칙에 '협력'과 '불확실성 인정'의 중요성을 명시적으로 추가하는 것을 고려합니다.
    *   '불필요한 대화 지양' 규칙을 완화하거나, '필요한 질문/협력'을 장려하는 내용을 균형 있게 추가하는 것을 고려합니다.
    *   '신중함'과 '단계별 진행'의 균형을 맞추는 구체적인 가이드라인 추가를 고려합니다.
    *   툴 사용 실수 방지를 위해, 도구 사용 전/후 체크리스트나 검증 절차를 규칙에 명시하는 것을 고려합니다.

AI가 분석을 완료했습니다. ｡•ᴗ•｡*
