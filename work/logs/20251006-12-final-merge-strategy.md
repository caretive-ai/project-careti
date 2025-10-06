# 최종 업스트림 병합 전략 및 실행 계획

## 1. 목표
심층 분석 단계에서 도출된 모든 결과를 종합하여, `cline/main`을 `caret/main`으로 병합하기 위한 포괄적이고 단계적인 실행 계획을 수립합니다. 이 문서는 병합 구현 단계의 마스터 가이드 역할을 합니다.

## 2. 분석 요약
분석 결과, 두 저장소 간에 상당하지만 관리 가능한 수준의 차이점이 발견되었습니다.
- **주요 충돌**: `package.json`(테스트 프레임워크), `proto/cline/models.proto`(enum 값), `src/extension.ts`(아키텍처)에서 직접적인 충돌이 확인되었습니다.
- **주요 기능 분기**: Caret은 자체 계정 시스템, i18n 시스템 및 여러 핵심 기능(페르소나, 이중 프롬프트 시스템)을 구현했으며, 이는 코드베이스에 깊숙이 통합되어 있습니다.
- **신규 기능**: 두 저장소 모두 충돌하지 않는 새로운 기능(예: Cline의 OCA 공급자, Caret의 파일 파서)을 포함하고 있어 통합이 필요합니다.
- **결론**: 단순 `git merge`는 불가능합니다. Cline의 최신 코드를 기반으로 Caret의 수정 사항을 신중하게 재통합하는 수동, 파일 단위 병합이 유일한 실행 가능한 경로입니다.

---

## 3. 상위 수준 병합 전략

1.  **브랜치 전략**: 현재 `main`에서 `feature/cline-merge-20251006`라는 새 기능 브랜치를 생성합니다. 모든 작업은 이 브랜치에서 수행됩니다.
2.  **기준**: Cline의 `upstream/main`을 병합의 "기준"으로 사용합니다. 즉, 충돌하는 각 파일에 대해 Cline 버전에서 시작하여 Caret의 변경 사항을 다시 적용합니다.
3.  **단계적 접근**: 병합은 가장 기초적인 파일부터 시작하여 애플리케이션 로직으로 이동하는 단계별로 실행됩니다.
4.  **검증**: 각 주요 단계가 끝난 후, 프로젝트는 성공적으로 컴파일되어야 하며(`npm run compile`) 모든 Caret 관련 테스트를 통과해야 합니다(`npm run test:webview`).

---

## 4. 상세 단계별 실행 계획

### **1단계: 기반 파일 병합 (최고 위험도)**

1.  **`proto/cline/models.proto`**:
    - `cline-latest/proto/cline/models.proto`를 기준으로 시작합니다.
    - **작업**: Caret의 수정 사항을 수동으로 추가합니다:
        - `ApiProvider` enum에 `CARET = 1000;` 추가 (미래 충돌 방지를 위해 큰 오프셋 적용).
        - `CaretModelInfo` 메시지 추가.
        - `ModelsApiConfiguration`에 `1073+` 오프셋을 사용하여 `caret_*` 필드 추가.
    - **작업**: `npm run protos`를 실행하여 모든 TypeScript 코드를 다시 생성하고 발생하는 모든 유형 오류를 즉시 수정합니다.

2.  **`package.json`**:
    - `cline-latest/package.json`을 기준으로 시작합니다.
    - **작업**: Caret의 변경 사항을 수동으로 병합합니다:
        - Caret의 `devDependencies`(`vitest` 등) 추가.
        - Caret의 `dependencies`(`firebase`, `cheerio` 등) 추가.
        - 버전 충돌 시, 두 파일 중 최신 버전을 채택합니다.
        - `scripts` 섹션을 수동으로 병합하여, Caret의 `vitest` 및 `i18n` 스크립트를 유지하면서 Cline의 새로운 유용한 스크립트를 채택합니다.
    - **작업**: `npm install`을 실행하여 의존성을 업데이트합니다.

3.  **`.github/workflows/`**:
    - **작업**: `test.yml` 및 `publish.yml`을 수동으로 검토하고 병합하여 Caret의 테스트 명령어(`vitest`)와 게시 비밀키가 유지되도록 합니다.
    - **작업**: Cline에서 `publish-nightly.yml`을 복사하고 Caret의 필요에 맞게 수정합니다.

### **2단계: 핵심 로직 및 진입점 병합**

1.  **`src/extension.ts`**:
    - `cline-latest/src/extension.ts`를 기준으로 시작합니다.
    - **작업**: Caret의 수정 사항을 꼼꼼하게 재통합합니다:
        - `CaretProviderWrapper` 아키텍처를 다시 도입합니다.
        - 모든 Caret 관련 초기화(`CaretGlobalManager`, `PersonaInitializer` 등) 호출을 다시 추가합니다.
        - Cline의 동적 구현을 채택하여 `getCallbackUri` 버그를 수정합니다.
        - `getBinaryLocation` 기능을 통합합니다.
        - 모든 명령어와 컨텍스트 키를 `caret.*` 네임스페이스로 다시 변경합니다.

2.  **상태 관리 및 통신 파일**:
    - **대상**: `src/shared/ExtensionMessage.ts`, `src/core/storage/state-keys.ts`, `src/core/storage/utils/state-helpers.ts`.
    - **작업**: Cline의 최신 버전을 기준으로, `modeSystem`, `personaProfile`, `inputHistory` 등 Caret의 상태 확장 기능을 수동으로 다시 추가합니다.

3.  **계정 시스템**:
    - **대상**: `src/services/account/CaretAccountService.ts`, `src/core/controller/caretAccount/`.
    - **작업**: Caret의 계정 시스템은 그대로 유지합니다. Cline의 새로운 계정 관련 기능(예: OCA)은 `CaretAccountService`와 충돌하지 않도록 신중하게 통합하거나, 초기에는 비활성화합니다.

### **3단계: UI 및 i18n 시스템 병합**

1.  **i18n 시스템**:
    - **전략**: Caret의 커스텀 i18n 시스템(`@/caret/utils/i18n`)을 유지합니다. 이것이 프론트엔드에서 가장 큰 구조적 차이입니다.
    - **작업**: Cline에서 가져온 새롭거나 수정된 모든 UI 컴포넌트를 Caret의 i18n 패턴을 사용하도록 리팩토링합니다.

2.  **주요 UI 컴포넌트**:
    - **대상**: `webview-ui/src/components/settings/SettingsView.tsx`, `ApiOptions.tsx`, `welcome/WelcomeView.tsx`.
    - **작업**: 3-way diff를 사용하여 Cline의 새로운 기능/개선 사항을 가져오면서 Caret의 브랜딩, 페르소나 통합 및 i18n 시스템을 유지합니다.

### **4단계: 최종 검증 및 정리**

1.  **전체 컴파일 및 테스트**:
    - **작업**: `npm run compile` 및 `npm run check-types`를 실행하여 모든 타입 오류를 해결합니다.
    - **작업**: `npm run test:webview`를 실행하여 모든 프론트엔드 테스트가 통과하는지 확인합니다.
2.  **수동 E2E 테스트**:
    - **작업**: 익스텐션을 실행하고 Caret의 핵심 기능(페르소나, 이중 프롬프트 모드, 계정 로그인, `.caretrules` 등)이 모두 정상적으로 작동하는지 수동으로 테스트합니다.
3.  **정리**: 모든 분석 문서를 `work/` 디렉토리에서 `caret-docs/merging/`으로 이동하여 보관합니다.

이 계획은 Cline 머지 작업을 위한 포괄적인 로드맵입니다. 각 단계는 신중하게 진행되어야 하며, 단계별 검증을 통해 안정성을 확보해야 합니다.
