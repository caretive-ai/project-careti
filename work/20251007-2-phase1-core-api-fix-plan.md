# Phase 1: 핵심 API 수정 계획

## 목표
`HostProvider` 복원 후 남은 121개의 컴파일 에러 중, Cline v3.32.6의 핵심 API 변경 사항과 직접적으로 관련된 문제들을 해결합니다.

### Step 1.1: `PostHog` 설정 구조 변경 대응

- **문제**: `isPostHogConfigValid` 함수와 `PostHogClientConfig` 타입이 제거되고 `posthogConfig` 상수로 대체되었습니다.
- **대상 파일**:
  - `src/services/error/ErrorProviderFactory.ts`
  - `src/services/feature-flags/FeatureFlagsProviderFactory.ts`
  - `src/services/telemetry/TelemetryProviderFactory.ts`
  - `src/services/telemetry/TelemetryService.test.ts`
- **작업**: 각 파일에서 `isPostHogConfigValid`를 사용하는 로직을 제거하고, `posthogConfig` 상수를 직접 확인하는 방식으로 수정합니다.

### Step 1.2: `Feature Flag` 이터레이션 수정

- **문제**: `FEATURE_FLAGS` 상수가 더 이상 이터러블(iterable)하지 않아 `for...of` 루프에서 에러가 발생합니다.
- **대상 파일**: `src/services/feature-flags/FeatureFlagsService.ts`
- **작업**: `for (const flag of FEATURE_FLAGS)` 구문을 `for (const flag of Object.values(FEATURE_FLAGS))` 와 같이 수정하여 문제를 해결합니다.

### Step 1.3: Proto `OCA` 타입 이름 변경 대응

- **문제**: `OcaCompatibleModelInfo`와 `OcaModelInfo` 타입이 존재하지 않습니다. Cline에서 이름이 변경된 것으로 보입니다.
- **대상 파일**: `src/core/controller/models/refreshOcaModels.ts`
- **작업**:
  - `OcaCompatibleModelInfo`를 `OpenAiCompatibleModelInfo`로 변경합니다.
  - `OcaModelInfo`를 `CaretModelInfo`로 변경합니다.
  - 이 외에도 `planModeOcaModelId` -> `planModeApiModelId` 와 같이 `Oca` 접두사가 붙은 여러 속성 이름들을 컴파일 에러 로그에 따라 수정합니다.

## 검증
- 모든 수정이 완료된 후 `npm run compile`을 다시 실행하여 에러 수가 감소했는지 확인합니다.
