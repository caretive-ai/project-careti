# `src/core/storage/disk.ts` 병합 분석 및 해결 기록

## 1. 충돌 분석

`src/core/storage/disk.ts` 파일의 충돌은 여러 함수에서 발생했으며, 주로 저장소 경로 처리 방식의 아키텍처 변경과 관련된 것입니다.

### `ensureMcpServersDirectoryExists` 함수

-   **HEAD (Caret)**: 오류 발생 시 대체 경로로 `"~/Documents/Caret/MCP"`를 사용합니다.
-   **UPSTREAM (Cline)**: 오류 발생 시 대체 경로로 `path.join(os.homedir(), "Documents", "Cline", "MCP")`를 사용합니다.
-   **분석**: 기능적으로 동일하며 브랜딩만 다릅니다. Caret의 정체성을 유지해야 합니다.

### `taskHistory` 관련 함수들

-   **HEAD (Caret)**: `ensureStateDirectoryExists`, `getTaskHistoryStateFilePath`, `readTaskHistoryFromState`, `writeTaskHistoryToState` 등의 함수들이 `context: vscode.ExtensionContext`를 인자로 받아 `context.globalStorageUri.fsPath`를 사용합니다.
-   **UPSTREAM (Cline)**: `HostProvider` 추상화를 도입하여 `vscode.ExtensionContext`에 대한 직접적인 의존성을 제거했습니다. `getGlobalStorageDir`라는 새로운 헬퍼 함수를 통해 전역 저장소 경로를 가져옵니다. 이는 코드의 결합도를 낮추는 중요한 아키텍처 개선입니다.

### 신규 함수 추가 (UPSTREAM)

-   **UPSTREAM (Cline)**: `readTaskSettingsFromStorage`와 `writeTaskSettingsToStorage` 함수가 추가되어 태스크별로 설정을 저장하는 기능이 도입되었습니다.

## 2. 병합 전략

1.  **아키텍처 채택**: Cline의 `HostProvider` 기반 리팩토링을 전면적으로 채택합니다. 이는 코드의 모듈성과 테스트 용이성을 향상시키는 긍정적인 변화입니다.
2.  **브랜딩 유지**: `ensureMcpServersDirectoryExists`와 같이 브랜딩과 관련된 경로에서는 "Caret"을 유지합니다. Cline의 경로 생성 방식(`path.join`)을 사용하되, "Cline"을 "Caret"으로 변경합니다.
3.  **함수 시그니처 통일**: `taskHistory` 관련 함수들에서 `context` 인자를 제거하여 Cline의 리팩토링된 시그니처를 따릅니다.
4.  **신규 기능 통합**: Cline에서 추가된 `readTaskSettingsFromStorage`, `writeTaskSettingsToStorage` 및 관련 헬퍼 함수들을 병합 결과에 포함합니다.

## 3. 최종 병합안

위 전략에 따라, Cline의 개선된 아키텍처를 수용하면서 Caret의 정체성을 유지하는 방향으로 코드를 통합합니다. 이를 통해 `state-migrations.ts`에서 발생했던 타입 오류도 함께 해결될 것으로 기대됩니다.
