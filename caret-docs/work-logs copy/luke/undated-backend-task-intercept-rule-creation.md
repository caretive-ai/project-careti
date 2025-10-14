# 백엔드 작업 계획: Caret 모드를 위한 규칙 생성 로직 가로채기 및 수정

## 1. 목표
`/newrule` 명령어의 동작을 수정하여, "Caret 모드"에서는 규칙 파일을 `.caretrules` 디렉토리에 생성하고, "Cline 모드"에서는 기본 동작(`.clinerules`에 생성)을 유지하도록 합니다. 이 작업은 Caret의 아키텍처 원칙에 따라 Cline 원본 코드 수정을 최소화하는 방식으로 이루어져야 합니다.

## 2. 분석
`f06-json-system-prompt.mdx` 문서와 마스터의 피드백에 따르면, `src/core/prompts/commands.ts`의 시스템 프롬프트를 직접 수정하는 것은 Cline 원본 파일을 변경하고 Cline의 도구 시스템 재사용 원칙에 위배되므로 이상적인 접근 방식이 아닙니다.

더 나은 접근 방식은 `new_rule` 도구의 실행을 가로채서 현재 모드나 브랜드에 따라 파일 경로를 동적으로 조정하는 것입니다. 이를 통해 로직 변경을 Caret 자체 로직(`caret-src/`) 내에 국한시키고 Cline 핵심 코드는 그대로 둘 수 있습니다.

## 3. 실행 계획

### 1단계: 도구 실행 지점 찾기
- `src/core/task/ToolExecutor.ts` 파일을 검토하여 시작합니다. 이 클래스는 AI가 호출하는 도구를 실행하는 역할을 합니다. `new_rule` 도구를 처리하는 특정 로직을 찾습니다.
- `new_rule` 도구는 일반적인 도구 실행 메커니즘을 통해 처리될 가능성이 높습니다. 도구 이름과 파라미터(특히 `path`)가 어떻게 처리되는지 추적합니다.

### 2단계: 모드 기반 경로 리디렉션 구현
- 현재 브랜드나 모드를 확인하는 로직을 도입합니다. `CaretBrandManager` 또는 `CaretModeManager`와 같은 기존 서비스를 찾아 현재 컨텍스트가 "Caret"인지 확인합니다.
- 파일이 쓰여지기 전에 조건을 추가합니다:
  - **만약** 현재 모드가 "Caret"이고 **그리고** AI의 `path` 파라미터가 `.clinerules/`로 시작하는 경우,
  - **그러면** `path` 변수를 수정하여 `.clinerules/`를 `.caretrules/`로 변경합니다.
- 이 변경 사항은 Cline 코드와의 분리를 유지하기 위해 `caret-src/` 디렉토리 내의 파일에 구현합니다.

### 3단계: 디렉토리 생성 확인
- `src/core/context/instructions/user-instructions/rule-helpers.ts`의 기존 로직은 `.clinerules` 디렉토리가 없는 경우 이를 생성하는 역할을 합니다.
- `.caretrules` 디렉토리도 없는 경우 생성되도록 보장해야 합니다. 기존 `ensureLocalClineDirExists` 로직을 적용하거나 새로운 `ensureLocalCaretDirExists` 함수를 추가하여 파일 작성 전에 `.caretrules` 디렉토리 생성을 처리합니다.

### 4단계: 검증
- 구현 후, 새로운 로직을 검증해야 합니다. 코드 변경 사항을 검토하여 다음을 확인합니다:
  1. 수정 사항이 `caret-src/` 내에 포함되어 있는지 확인합니다.
  2. 로직이 "Caret" 모드를 올바르게 확인하는지 확인합니다.
  3. 경로가 `.clinerules`에서 `.caretrules`로 올바르게 리디렉션되는지 확인합니다.
  4. "Cline" 모드의 기본 동작(`.clinerules`에 쓰기)이 유지되는지 확인합니다.
- 그런 다음 완료된 코드 변경 사항을 마스터에게 제출하여 최종 승인 및 테스트를 받습니다.

## 4. 조사할 파일
- **주요 수정/가로채기 대상:** `src/core/task/ToolExecutor.ts` (또는 이 클래스가 사용하는 헬퍼).
- **모드 확인 참조:** `caret-src/core/modes/CaretModeManager.ts` 또는 유사 파일.
- **디렉토리 생성 참조:** `src/core/context/instructions/user-instructions/rule-helpers.ts`.
- **수정하지 않을 파일:** `src/core/prompts/commands.ts`.
