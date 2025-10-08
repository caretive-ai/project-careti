# 컴파일 에러 분석 보고서 및 해결 계획

## 1. 개요

`npm run compile` 실행 결과, 총 78개의 타입스크립트 컴파일 에러를 확인했습니다. 이 보고서는 에러의 근본 원인을 분석 및 그룹화하고, '최소 침습' 및 '`caret-src` 우선' 원칙에 입각한 해결 전략을 제시합니다.

## 2. 에러 그룹화 및 분석

### 그룹 A: 핵심 API 및 아키텍처 변경 (22개 에러)

- **현상**: `HostProvider`, `AuthService`, `DictationService` 등 핵심 서비스의 메서드 시그니처, 속성명, 클래스 구조가 크게 변경되었습니다.
  - `HostProvider.watch` 서비스 분리 (`focus-chain/index.ts`)
  - `transcribeAudio` 기능 제거 또는 이동 (`VoiceTranscriptionService.ts`)
  - `getCallbackUri` ↔ `getCallbackUrl` 이름 변경 및 혼용 (`openrouterAuthClicked.ts`, `AuthService.ts`)
  - `WebviewProviderCreator` 시그니처 변경 (`extension.ts`)
- **근본 원인**: Cline의 핵심 아키텍처 리팩토링으로 인한 Breaking Changes.
- **해결 전략**:
  1. `caret-src/hosts/CaretHostProviderWrapper.ts`를 생성하여 `watch` 서비스 분리 등 `HostProvider`의 구조적 변경을 흡수합니다.
  2. `caret-src/services/dictation/CaretDictationService.ts`를 생성하여 변경된 `transcribeAudio` 호출 로직을 처리합니다.
  3. `extension.ts`에서는 `CaretHostProviderWrapper`를 사용하도록 최소한으로 수정합니다.

### 그룹 B: 상태 관리(State) 및 보안 저장소(Secrets) 키 변경 (14개 에러)

- **현상**: `GlobalState` 또는 `Secrets` 객체에 접근할 때 사용하던 키 이름이 유효하지 않아 타입 에러가 발생합니다.
  - `keyof GlobalState`: `workspaceRoots`, `multiRootEnabled` 등
  - `keyof Secrets`: `ocaApiKey`, `ocaRefreshToken` 등
- **근본 원인**: 상태 키 관리 방식의 변경 또는 중앙화.
- **해결 전략**:
  1. Cline의 `src/core/storage/state-keys.ts`와 같은 파일을 분석하여 새로운 키 정의를 찾습니다.
  2. `caret-src` 내에 상태 접근을 위한 Wrapper 유틸리티를 구현하여, Cline의 변경에 직접적으로 의존하지 않도록 격리합니다.

### 그룹 D: 모듈 및 Export 변경 (5개 에러)

- **현상**: 기존에 사용하던 함수나 타입이 더 이상 해당 모듈에서 export 되지 않습니다.
  - `@/utils/git`: `isGitRepository`, `getGitDiff` 함수 누락
  - `@/config`: `EnvironmentConfig` 타입 미노출
  - `posthog-config`: `PostHogClientValidConfig` 타입 누락
- **근본 원인**: 유틸리티 모듈의 분리 또는 내부 구현의 캡슐화.
- **해결 전략**:
  1. `git` 관련 유틸리티의 새로운 위치를 찾거나, `caret-src/utils/git-compat.ts`와 같은 호환성 모듈을 만들어 기능을 대체합니다.
  2. 설정 관련 타입은 Cline의 새로운 설정 주입(DI) 또는 관리 방식을 파악하여 대응합니다.

### 그룹 C: 타입 변경 및 엄격성 강화 (19개 에러)

- **현상**: 타입 추론 결과가 `never`로 귀결되거나, `boolean`을 `string` 파라미터에 전달하는 등 타입 불일치 에러가 발생합니다.
  - `refreshOcaModels.ts`: 다수의 `assignable to type 'never'` 에러 발생
  - `checkpoints/index.ts`: `boolean` 값을 `string` 타입의 파라미터로 전달
- **근본 원인**: Cline의 타입 정의가 더 엄격해졌거나, 관련 로직의 리팩토링으로 인해 타입 추론 흐름이 변경되었습니다.
- **해결 전략**:
  1. `refreshOcaModels`의 경우, 변경된 `CaretModelInfo` 타입과 관련 로직을 분석하여 정확한 타입으로 데이터를 할당하도록 수정합니다. 이는 `caret-src` 내 Adapter 패턴 적용을 검토합니다.
  2. 타입 불일치 문제는 변경된 함수 시그니처에 맞게 인자 타입을 변환하여 전달하도록 수정합니다.

### 그룹 E: 테스트 코드 에러 (18개 에러)

- **현상**: `SharedUriHandler.test.ts` 파일에 집중적으로 에러가 발생했습니다.
- **근본 원인**: 테스트 대상인 `SharedUriHandler` 또는 테스트 환경의 변경.
- **해결 전략**: 애플리케이션 코드의 컴파일 에러를 모두 해결한 후, 별도의 단계에서 테스트 코드를 수정합니다.

## 3. 다음 단계 계획

1. **Phase 1-A**: `CaretHostProviderWrapper`와 `CaretDictationService`의 기본 골격을 `caret-src`에 생성하여 **그룹 A** 문제 해결을 시작합니다.
2. **Phase 1-B**: 상태 관리 키 변경에 대응하기 위한 유틸리티 분석 및 구현 계획을 수립하여 **그룹 B** 문제 해결을 준비합니다.
3. **Phase 2**: 구현된 Wrapper와 서비스를 `extension.ts` 등 기존 코드에 '최소 침습 원칙'을 준수하며 연동합니다.
