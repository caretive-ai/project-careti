# `OcaAuthService` 콜백 에러 조사 및 해결 계획

## 1. 문제점

`getCallbackUri`를 `getCallbackUrl`로 수정하는 과정에서, `src/services/auth/oca/OcaAuthService.ts` 파일에 다음과 같은 새로운 컴파일 에러가 발생했다.

- `error TS2551: Property 'getCallbackUrl' does not exist on type 'AuthHandler'. Did you mean 'getCallbackUri'?`

이는 `AuthHandler` 타입이 `HostProvider`와 다른 인터페이스를 가지고 있음을 시사하며, 일괄적인 이름 변경이 올바르지 않았음을 의미한다.

## 2. 목표

`AuthHandler`의 정확한 인터페이스를 파악하고, `OcaAuthService.ts`의 컴파일 에러를 올바르게 수정한다.

## 3. 작업 단계

### Step 1: `OcaAuthService.ts` 코드 분석

- **대상 파일**: `src/services/auth/oca/OcaAuthService.ts`
- **작업**: 파일을 직접 읽어 에러가 발생하는 라인과 `AuthHandler` 타입의 변수가 어떻게 초기화되고 사용되는지 전체적인 맥락을 파악한다.

### Step 2: `AuthHandler` 타입 정의 추적

- **작업**: 코드 베이스에서 `AuthHandler` 타입이 어디에 정의되어 있는지 검색하고, 해당 인터페이스의 정확한 명세를 확인한다. 이를 통해 `getCallbackUri`가 올바른 이름인지, 혹은 다른 메커니즘으로 대체되었는지 분석한다.

### Step 3: 최소 침습 수정 실행

- **대상 파일**: `src/services/auth/oca/OcaAuthService.ts`
- **작업**: 분석 결과를 바탕으로 올바른 메서드 이름을 사용하도록 코드를 수정한다. 타입스크립트의 제안대로 `getCallbackUri`가 맞다면, 해당 파일에 한해 이름을 되돌리는 수정을 적용한다.
- **원칙 준수 검증**:
  - **불가피성**: 예. Cline 원본 파일의 컴파일 에러 수정.
  - **최소 범위**: 예. 메서드 이름 1줄 수정.
  - **주석 포함**: 예. `CARET MODIFICATION` 주석 추가.
  - **병합 영향**: 예. 변경된 API에 정확히 대응하는 것이므로 향후 병합에 긍정적.

## 4. 다음 단계

- **Step 1**을 실행하기 위해 `src/services/auth/oca/OcaAuthService.ts` 파일을 읽고 분석을 시작한다.
