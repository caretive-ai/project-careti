# 테스트 컴파일 문제 분석 (Vitest 의존성 잔재)

## 1. 현상
- `caret-src/__tests__/prompt-system/mode-system.test.ts` 파일에서 `vitest` import를 제거하고 코드를 수정했음에도 불구하고, 테스트 실행 시 `Error: Cannot find module 'vitest'` 에러가 발생.
- 에러 스택 트레이스를 보면 `out/caret-src/__tests__/prompt-system/mode-system.test.js` 파일에서 에러가 발생하고 있음.

## 2. 원인
- **컴파일 결과 미갱신**: `scripts/build-tests.js`가 `esbuild`를 사용하여 `src` 디렉토리만 감시하거나, `tsc` 컴파일 단계에서 이전 컴파일 결과가 덮어씌워지지 않았을 가능성.
- **증분 빌드 문제**: `tsc`가 변경된 파일만 컴파일해야 하는데, `clean` 과정이 없어서 이전의 실패한 빌드 아티팩트가 남아있거나 꼬였을 수 있음.
- **Import 잔재**: 파일 내용이 실제로 갱신되었는지 확인 필요.

## 3. 해결 방안
1. **`out` 디렉토리 정리**: `rm -rf out` 명령으로 기존 빌드 결과를 삭제.
2. **재컴파일**: `npm run compile-tests`를 다시 실행하여 깨끗한 상태에서 컴파일.
3. **파일 내용 확인**: `cat out/caret-src/__tests__/prompt-system/mode-system.test.js` 명령으로 컴파일된 JS 파일에 `vitest`가 남아있는지 확인.

## 4. 실행 계획
- `rm -rf out`
- `npm run compile-tests`
- `cat out/caret-src/__tests__/prompt-system/mode-system.test.js` 확인
- 테스트 재실행
