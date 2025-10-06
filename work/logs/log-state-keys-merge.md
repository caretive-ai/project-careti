# `src/core/storage/state-keys.ts` 병합 분석 및 해결 기록

## 1. 충돌 분석

`src/core/storage/state-keys.ts` 파일의 충돌은 `Settings`와 `Secrets` 인터페이스에서 발생했습니다. 각 브랜치의 변경 사항은 다음과 같습니다.

### HEAD (Caret)

-   **`Settings` 인터페이스**: Caret의 고유 기능인 브랜드 모드, 페르소나 시스템, 사용자 프로필, 입력 기록과 관련된 설정을 추가했습니다.
    ```typescript
    // CARET MODIFICATION: Caret 전역 브랜드 모드 시스템 (Caret/Cline 구분)
    caretModeSystem: "caret" | "cline" | undefined
    // CARET MODIFICATION: Persona system settings
    enablePersonaSystem: boolean | undefined
    currentPersona: string | undefined
    personaProfile: { ... } | undefined
    // CARET MODIFICATION: Persona image storage for persona system
    caretUserProfile: CaretUser | undefined //caret
    // CARET MODIFICATION: Input history for chat persistence
    inputHistory: string[] | undefined
    ```
-   **`Secrets` 인터페이스**: Caret 전용 인증 토큰 및 API 키를 추가했습니다.
    ```typescript
    caretAuthToken: string | undefined //caret
    caretApiKey: string | undefined //caret
    ```
-   **`LocalState` 인터페이스**: `.caretrules` 지원을 위해 `localCaretRulesToggles`를 추가했습니다. (충돌 없음)

### UPSTREAM (Cline)

-   **`Settings` 인터페이스**: 새로운 `Oca` 모델 지원을 위한 설정을 추가했습니다.
    ```typescript
    actModeOcaModelId: string | undefined
    actModeOcaModelInfo: OcaModelInfo | undefined
    ```
-   **`Secrets` 인터페이스**: `Oca` 공급자용 API 키와 리프레시 토큰을 추가했습니다.
    ```typescript
    ocaApiKey: string | undefined
    ocaRefreshToken: string | undefined
    ```

## 2. 병합 전략

두 브랜치의 변경 사항은 서로 다른 기능을 추가하는 것이므로 충돌이 논리적으로 발생하지 않습니다. 따라서 두 변경 사항을 모두 통합하는 방향으로 병합합니다.

1.  **`Settings` 인터페이스 병합**: Cline의 `Oca` 관련 설정과 Caret의 고유 기능 설정을 모두 포함합니다.
2.  **`Secrets` 인터페이스 병합**: Cline의 `Oca` 관련 시크릿과 Caret의 전용 시크릿을 모두 포함합니다.
3.  **`LocalState` 인터페이스 유지**: Caret의 `.caretrules` 지원 변경 사항을 그대로 유지합니다.

## 3. 최종 병합안

위 전략에 따라 두 브랜치의 추가 사항을 모두 통합하여 최종 파일을 구성합니다. 이 병합안은 양쪽 브랜치의 기능을 모두 지원하게 해줍니다.
