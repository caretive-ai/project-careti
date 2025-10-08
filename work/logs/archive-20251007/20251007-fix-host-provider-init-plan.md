# Plan: `HostProvider.initialize` API 변경점 수정

## 1. 목표

`HostProvider.initialize` 함수의 시그니처 변경으로 인해 발생하는 `src/standalone/cline-core.ts`와 `src/test/host-provider-test-utils.ts` 파일의 컴파일 에러를 해결합니다.

## 2. 분석

`src/hosts/host-provider.ts` 파일 분석 결과, `initialize` 함수에 다음 3개의 인자가 추가되었습니다:
- `getBinaryLocation: (name: string) => Promise<string>`
- `extensionFsPath: string`
- `globalStorageFsPath: string`

## 3. 수정 계획

### 3.1. `src/standalone/cline-core.ts` 수정

`HostProvider.initialize` 호출부에 누락된 3개의 인자를 추가합니다. standalone 환경에 맞게 기본값을 제공합니다.

- **`getBinaryLocation`**: `async () => ""` (빈 문자열을 반환하는 mock 함수)
- **`extensionFsPath`**: `""` (빈 문자열)
- **`globalStorageFsPath`**: `""` (빈 문자열)

### 3.2. `src/test/host-provider-test-utils.ts` 수정

테스트 유틸리티의 `HostProvider.initialize` 호출부에도 누락된 3개의 인자를 추가합니다. 테스트 환경에 맞게 mock 값을 제공합니다.

- **`getBinaryLocation`**: `options?.getBinaryLocation ?? (async () => "/bin/mock")`
- **`extensionFsPath`**: `options?.extensionFsPath ?? "/mock/extension/path"`
- **`globalStorageFsPath`**: `options?.globalStorageFsPath ?? "/mock/global/storage/path"`

## 4. 검증

1.  두 파일을 수정한 후 `npm run compile`을 실행합니다.
2.  `HostProvider.initialize` 관련 에러가 해결되었는지 확인하고, 전체 에러 수가 감소했는지 확인합니다.
3.  결과를 마스터께 보고합니다.
