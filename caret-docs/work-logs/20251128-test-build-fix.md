# 테스트 빌드 설정 수정 계획

## 1. 문제 분석
- `scripts/build-tests.js`는 `tsc -p ./tsconfig.test.json --outDir out`을 실행합니다.
- `tsconfig.test.json`에 `caret-src`를 `include`로 추가했지만, `tsc` 컴파일 결과가 예상대로 `out/caret-src`에 생성되지 않고 있습니다.
- `rootDir` 설정이 `.`으로 되어 있어 소스 구조가 유지되어야 하지만, `tsc`가 `src`와 `caret-src`를 모두 포함할 때 `out` 디렉토리 구조가 꼬이거나 일부가 누락될 수 있습니다.

## 2. 수정 방안
- `tsconfig.test.json` 설정 재검토: `include`에 `caret-src`가 올바르게 추가되었는지 확인 (완료).
- **`rootDirs` 옵션 활용**: `src`와 `caret-src`를 가상 루트로 묶거나, `rootDir`을 명확히 지정하여 구조를 보존합니다.
- 또는 **`scripts/build-tests.js` 수정**: `esbuild` 빌드 설정에 `caret-src` 엔트리포인트를 추가하여 컴파일 대상에 포함시킵니다.

## 3. 실행 계획
1. `scripts/build-tests.js`의 `esbuild` 설정 확인: 현재 `src/packages/**/*.ts`만 엔트리포인트로 잡혀 있음. 이는 테스트 파일 빌드와는 무관해 보임 (테스트 파일은 `tsc`로 빌드됨).
2. `tsc` 실행 결과 확인: `out` 디렉토리에 `src`만 생기고 `caret-src`가 안 생기는지 직접 확인.
3. `tsconfig.test.json`의 `rootDir`을 제거하고 `rootDirs` 사용 고려, 또는 단순히 `rootDir`을 `.`으로 유지하되 `tsc`가 모든 파일을 인식하도록 `files` 목록을 명시적으로 지정하는 방법 등 검토.

## 4. 임시 조치 (빠른 진행을 위해)
`tsc`가 `caret-src`를 무시하는 것 같다면, `npx tsc` 명령을 직접 사용하여 `caret-src`만 별도로 컴파일해 봅니다.

```bash
npx tsc caret-src/__tests__/prompt-system/*.test.ts --outDir out/caret-src/__tests__/prompt-system --module commonjs --target es6 --esModuleInterop --resolveJsonModule
```

하지만 위 방법은 의존성 해결이 복잡할 수 있으므로, `tsconfig.test.json`을 수정한 후 전체 재컴파일을 시도하는 것이 정석입니다.
