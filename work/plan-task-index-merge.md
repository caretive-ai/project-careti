# `src/core/task/index.ts` 병합 충돌 해결 계획

## 1. 충돌 분석

`src/core/task/index.ts` 파일의 충돌은 `Task` 클래스의 기능이 대폭 확장되면서 발생했습니다.

1.  **Cline 구조 개선**:
    *   **체크포인트 (`CheckpointManager`)**: 코드 변경 사항을 자동으로 커밋하고 복원하는 기능이 통합되었습니다.
    *   **멀티루트 작업공간 (`WorkspaceRootManager`)**: 여러 폴더로 구성된 작업공간 지원이 강화되었습니다.
    *   **컨텍스트 관리 고도화**: `ContextManager`를 통해 대화 내역을 요약하고 토큰 사용량을 관리하는 로직이 정교해졌습니다.
    *   **의존성 변경**: `StateManager`와 `Controller` 등 핵심 모듈의 역할이 변경됨에 따라 `Task` 클래스의 생성자와 메서드 시그니처가 크게 변경되었습니다.

2.  **Caret 고유 기능**:
    *   **규칙 우선순위 시스템**: `.caretrules`, `.clinerules` 등 다양한 규칙 파일의 우선순위를 정하는 로직이 `attemptApiRequest` 메서드 내에 추가되었습니다.

## 2. 병합 전략

Cline의 최신 아키텍처를 기반으로 `Task` 클래스를 재구성하고, Caret의 규칙 시스템을 해당 구조에 맞게 이식합니다.

1.  **Cline 구조 채택**: `CheckpointManager`, `WorkspaceRootManager` 등을 포함한 `upstream/main`의 `Task` 클래스 구조와 의존성 주입 방식을 그대로 수용합니다.
2.  **Caret 기능 통합**:
    *   `attemptApiRequest` 메서드 내 시스템 프롬프트 생성 로직에서, Caret의 규칙 우선순위 시스템(`localCaretRulesFileInstructions` 등)을 적용하는 코드를 새로운 구조에 맞게 통합합니다. 기존의 여러 규칙을 개별적으로 로드하는 대신, 우선순위에 따라 하나의 활성 규칙만 전달하도록 로직을 유지합니다.
3.  **임포트 경로 수정**: 현재 파일에 깨져있는 임포트 경로(`"'core/prompts/system-prompt"'` 등)를 올바른 경로 에일리어스(`@core/prompts/system-prompt` 등)로 수정합니다.

## 3. 실행 계획

1.  `src/core/task/index.ts` 파일의 전체 내용을 Cline의 구조를 기반으로 재구성하고, Caret의 수정 사항을 통합한 최종 버전으로 작성합니다.
2.  `write_to_file` 도구를 사용하여 병합된 내용으로 파일을 한 번에 덮어씁니다.
3.  수정 후 `npm run compile`을 실행하여 `StateManager.ts` 수정으로 인해 발생했던 오류들이 `Task` 클래스와 관련하여 얼마나 해결되었는지 확인하고 진행 상황을 기록합니다.
