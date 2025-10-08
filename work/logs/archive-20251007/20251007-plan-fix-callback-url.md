# `getCallbackUrl` 이름 변경 관련 컴파일 에러 해결 계획

## 1. 문제점

`HostProvider`의 인증 콜백 URL을 가져오는 메서드 이름이 `getCallbackUri`에서 `getCallbackUrl`로 변경되었다. 이로 인해 이전 이름을 사용하고 있는 다음 파일들에서 컴파일 에러가 발생하고 있다.

- `src/core/controller/account/openrouterAuthClicked.ts`
- `src/services/auth/AuthService.ts`

- `error TS2551: Property 'getCallbackUri' does not exist on type 'HostProvider'. Did you mean 'getCallbackUrl'?`

## 2. 목표

메서드 이름 변경에 대응하여 관련 컴파일 에러를 모두 해결한다.

## 3. 작업 단계

### Step 1: `openrouterAuthClicked.ts` 수정

- **대상 파일**: `src/core/controller/account/openrouterAuthClicked.ts`
- **작업**: `HostProvider.getCallbackUri` 호출을 `HostProvider.get().getCallbackUrl`로 수정한다. 싱글턴 패턴에 맞춰 `get()`을 통해 인스턴스를 얻는 방식도 함께 적용한다.
- **원칙 준수 검증**: 최소 침습 원칙에 따라 1줄만 수정하며, `CARET MODIFICATION` 주석을 추가한다.

### Step 2: `AuthService.ts` 수정

- **대상 파일**: `src/services/auth/AuthService.ts`
- **작업**: `this.hostProvider.getCallbackUri` 호출을 `this.hostProvider.getCallbackUrl`로 수정한다. 이 파일에서는 `HostProvider` 인스턴스를 주입받아 사용하므로 `get()` 호출은 필요 없다.
- **원칙 준수 검증**: 최소 침습 원칙에 따라 1줄만 수정하며, `CARET MODIFICATION` 주석을 추가한다.

## 4. 다음 단계

- **Step 1**을 실행하여 `src/core/controller/account/openrouterAuthClicked.ts` 파일을 수정한다.
- **Step 2**를 실행하여 `src/services/auth/AuthService.ts` 파일을 수정한다.
- 모든 수정이 완료된 후, 재컴파일을 통해 에러가 해결되었는지 검증한다.
