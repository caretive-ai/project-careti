# `src/core/storage/StateManager.ts` 병합 충돌 해결 계획

## 1. 충돌 분석

`StateManager.ts` 파일의 충돌은 주로 `upstream/main` (Cline)에서 이루어진 두 가지 주요 구조 개선과 Caret의 고유 기능 추가가 겹치면서 발생했습니다.

1.  **파일 감시 기능 (`chokidar`)**: Cline은 `taskHistory.json` 파일의 외부 변경을 감지하여 상태를 동기화하는 기능을 추가했습니다.
2.  **태스크별 설정**: Cline은 `taskStateCache`를 도입하여 각 태스크가 독립적인 모델 설정을 가질 수 있도록 리팩토링했습니다.
3.  **Caret 고유 기능**: Caret은 최초 실행 시 기본 프로바이더를 설정하는 로직과 Caret API 관련 설정값들을 추가했습니다.

## 2. 병합 전략

Cline의 발전된 아키텍처를 수용하는 것을 기본 방향으로 설정하고, 그 위에 Caret의 기능을 안전하게 통합합니다.

1.  **Cline 구조 채택**: `chokidar`를 이용한 파일 감시 기능과 태스크별 설정을 지원하는 `upstream/main`의 코드 구조를 기본으로 채택합니다.
2.  **Caret 기능 통합**:
    *   `initialize` 메서드에 Cline의 `setupTaskHistoryWatcher` 호출과 Caret의 '최초 실행 시 기본 프로바이더 설정' 로직을 모두 포함시킵니다.
    *   `getApiConfiguration`과 `setApiConfiguration` 메서드에 Cline의 태스크별 설정 로직을 유지하면서 Caret 전용 API 설정값(`caretApiKey`, `planModeCaretModelId` 등)을 추가합니다.

## 3. 실행 계획

1.  `StateManager.ts` 파일의 전체 내용을 Cline의 구조를 기반으로 재구성하고, Caret의 수정 사항을 통합한 최종 버전으로 작성합니다.
2.  `write_to_file` 도구를 사용하여 병합된 내용으로 파일을 한 번에 덮어씁니다.
3.  수정 후 `npm run compile`을 실행하여 `StateManager.ts`와 관련된 컴파일 오류가 모두 해결되었는지 확인합니다.
