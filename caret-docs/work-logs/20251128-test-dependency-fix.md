# 테스트 의존성 이슈 분석 및 해결

## 1. 현상
- `npx tsc`로 ModeSystem 테스트 파일 컴파일 시도 시 에러 발생:
  1. `Cannot find module 'vitest'`
  2. `Cannot find module '@core/prompts/system-prompt'`

## 2. 원인
- **Vitest 사용**: `mode-system.test.ts`가 `vitest`를 사용하도록 작성되어 있음. 하지만 프로젝트는 `mocha` 기반임.
- **경로 별칭**: `npx tsc` 직접 실행 시 `tsconfig.json`의 `paths` 설정을 인식하지 못할 수 있거나, `@core` 별칭이 올바르게 매핑되지 않음.

## 3. 해결 방안
1. **테스트 프레임워크 변경**: `vitest` 대신 `mocha`와 `chai`를 사용하도록 테스트 코드를 수정.
2. **경로 별칭 제거**: 테스트 코드 내에서 `@core` 대신 상대 경로(`../../../src/core`)를 사용.

## 4. 실행 계획
`caret-src/__tests__/prompt-system/mode-system.test.ts` 파일 수정:
- `import ... from "vitest"` 제거.
- `describe`, `it`은 글로벌(mocha) 사용.
- `expect`는 `chai` 등 사용하거나 `assert` 모듈 사용.
- `@core` import를 상대 경로로 변경.
