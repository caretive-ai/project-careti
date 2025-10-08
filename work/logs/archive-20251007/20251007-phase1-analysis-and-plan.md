# Phase 1: 핵심 API 수정 - 분석 및 실행 계획

## 1. 현황

- `Phase 0` 긴급 복구를 통해 컴파일 에러가 **108개**로 감소했습니다.
- 남은 에러들은 `work/plan-recovery-and-migration-v2.md`에서 예측한 대로 핵심 API 변경 사항과 관련이 깊은 것으로 분석됩니다.

## 2. 목표

컴파일 로그(`work/logs/20251007-2-compile-after-recovery.log`)를 기반으로 남은 108개의 에러를 그룹화하고, `plan-recovery-and-migration-v2.md`의 `Phase 1` 계획에 따라 체계적으로 수정하여 컴파일 에러를 대폭 줄입니다.

## 3. 단계별 실행 계획

### Step 1.1: `PostHog` 및 `Telemetry/Error` 관련 에러 해결 (14개 에러)

- **대상 파일**:
  - `src/services/error/providers/PostHogErrorProvider.ts`
  - `src/services/telemetry/providers/PostHogTelemetryProvider.ts`
  - `src/services/telemetry/TelemetryService.ts`
  - `src/hosts/vscode/hostbridge/env/getTelemetrySettings.ts`
  - `src/hosts/vscode/hostbridge/env/subscribeToTelemetrySettings.ts`
- **예상 원인**: `PostHog` 설정 구조 변경 및 관련 `proto` 타입(`Setting`) 부재.
- **작업**: Cline의 변경된 `PostHog` 설정 방식과 `EnvServiceClientInterface`의 메서드 변경(`getTelemetrySettings`, `subscribeToTelemetrySettings` 등)을 코드에 반영합니다.

### Step 1.2: `Feature Flag` 관련 에러 해결

- **대상 파일**:
  - `src/services/feature-flags/FeatureFlagsService.ts`
  - `src/services/feature-flags/FeatureFlagsProviderFactory.ts`
- **예상 원인**: `FEATURE_FLAGS` 객체의 순회 방식 변경.
- **작업**: 로그에 직접적인 에러는 없으나, 이전 분석에서 변경이 확인된 부분이므로 관련 코드를 검토하고 Cline의 `Object.values()` 사용 방식 등으로 수정합니다.

### Step 1.3: `Proto` 및 `OCA` 관련 에러 해결 (16개 에러)

- **대상 파일**:
  - `src/core/controller/models/refreshOcaModels.ts`
  - `src/services/auth/oca/*`
  - `src/core/controller/state/getProcessInfo.ts`
- **예상 원인**: `Oca...ModelInfo`, `ProcessInfo` 등 `proto`에서 생성된 타입의 부재 또는 이름 변경.
- **작업**: 변경된 `proto` 정의를 확인하고, 새로운 타입 이름(예: `OpenAiCompatibleModelInfo`)으로 코드를 수정하거나 필요한 타입을 추가합니다. `ocaApiKey`, `ocaRefreshToken` 관련 시크릿 키 이름 변경도 함께 처리합니다.

### Step 1.4: `AuthService` 및 `Provider` 관련 에러 해결 (8개 에러)

- **대상 파일**:
  - `src/services/auth/providers/ClineAuthProvider.ts`
  - `src/services/auth/AuthService.ts`
- **예상 원인**: `ClineAuthInfo` 타입 변경 (`refreshToken`, `expiresAt` 속성 제거) 및 `HostProvider`의 `getCallbackUri` 메서드 이름 변경 (`getCallbackUrl`).
- **작업**: 변경된 타입 정의에 맞게 코드를 수정하고, 변경된 메서드 이름을 반영합니다.
