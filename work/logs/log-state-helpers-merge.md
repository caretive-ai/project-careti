# `src/core/storage/utils/state-helpers.ts` 병합 분석 및 해결 기록

## 1. 충돌 분석

`src/core/storage/utils/state-helpers.ts` 파일의 충돌은 여러 `import` 구문과 함수에서 복합적으로 발생했습니다. 이는 Cline `upstream` 브랜치에서 대규모 리팩토링이 있었기 때문입니다.

### `import` 구문 충돌

-   **HEAD (Caret)**: Caret 고유 기능(`FeatureConfig`, `CaretUser` 등)을 위한 모듈을 임포트합니다.
-   **UPSTREAM (Cline)**: `Oca`, `Dictation` 등 신규 기능과 리팩토링된 `disk` 모듈(`readTaskHistoryFromState`)을 임포트합니다.
-   **분석**: 양쪽 브랜치의 기능이 모두 필요하므로, 모든 `import`를 통합하고 중복을 제거해야 합니다.

### `readSecretsFromDisk` 함수 충돌

-   **HEAD (Caret)**: `caretApiKey`, `caretAuthToken`을 `secrets`에서 읽어옵니다.
-   **UPSTREAM (Cline)**: `ocaApiKey`, `ocaRefreshToken`을 읽어오며, 타입 캐스팅을 `Promise<Secrets["keyName"]>` 형태로 개선하여 타입 안전성을 높였습니다.
-   **분석**: Cline의 타입 안전성이 높은 방식을 채택하고, Caret과 Cline의 키를 모두 포함하도록 통합합니다.

### `readGlobalStateFromDisk` 함수 충돌

-   **HEAD (Caret)**: `GlobalState` 타입을 반환하며, `context.globalState.get()`을 사용하여 상태를 읽습니다. Caret 고유의 상태(`caretModeSystem`, `enablePersonaSystem` 등)와 `FeatureConfig`를 이용한 기본값 설정 로직이 포함되어 있습니다.
-   **UPSTREAM (Cline)**: `GlobalStateAndSettings` 타입을 반환하며, 타입이 명시된 `context.globalState.get<Type>()`을 사용합니다. `taskHistory`를 `globalState`가 아닌 `disk`에서 직접 읽도록 변경되었고, 신규 상태(`yoloModeToggled`, `dictationSettings` 등)가 대거 추가되었습니다.
-   **분석**: Cline의 리팩토링된 구조가 월등히 우수합니다. Cline의 구조를 기반으로 하되, Caret의 고유 상태와 기본값 설정 로직을 해당 구조에 맞게 이식해야 합니다.

### `resetGlobalState` 함수 충돌

-   **HEAD (Caret)**: 상태 초기화 시 Caret 고유의 설정(`caretModeSystem`, `enablePersonaSystem`)을 기본값으로 되돌리는 로직이 포함되어 있습니다.
-   **UPSTREAM (Cline)**: 초기화할 `secretKeys` 목록에 `ocaApiKey`, `ocaRefreshToken`이 추가되었습니다.
-   **분석**: Cline의 확장된 `secretKeys` 목록을 사용하고, Caret의 고유 설정 초기화 로직을 유지하여 통합합니다.

## 2. 병합 전략

1.  **아키텍처 채택**: Cline의 리팩토링된 구조(타입 안전성 강화, `disk` 모듈 의존성 변경 등)를 전면적으로 수용합니다.
2.  **기능 통합**: Caret의 고유 기능(페르소나, 브랜드 모드, `FeatureConfig` 기반 기본값 설정)과 Cline의 신규 기능(`Oca`, `Dictation`, `YOLO` 모드 등)을 모두 포함하도록 코드를 통합합니다.
3.  **Caret 로직 이식**: Caret의 커스텀 로직을 Cline의 새로운 코드 구조에 맞게 재배치하고 수정합니다. 예를 들어, `readGlobalStateFromDisk`의 `return` 객체에 Caret 상태를 추가하고, `resetGlobalState`에 Caret 초기화 로직을 유지합니다.

## 3. 최종 병합안

위 전략에 따라, Cline의 발전된 아키텍처의 이점을 취하면서 Caret의 핵심 기능을 보존하는 방향으로 코드를 병합합니다.
