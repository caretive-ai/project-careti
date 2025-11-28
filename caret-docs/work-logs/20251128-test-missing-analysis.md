# 테스트 파일 누락 분석

## 1. 현상
- `tsc` 실행 후 `out/caret-src` 디렉토리에 ModeSystem 관련 테스트 파일(`mode-system.test.js` 등)이 생성되지 않음.
- `find out/caret-src -name "*.test.js"` 결과: `FeatureConfig.test.js` 등 일부 테스트만 존재.
- `caret-src/__tests__` 디렉토리의 컴파일 결과가 누락됨.

## 2. 원인 분석
- `tsconfig.test.json`의 `rootDir` 설정(`"rootDir": "."`)과 `exclude` 패턴 간의 상호작용 문제 가능성.
- 특히 `exclude`에서 `src/**/__tests__/*`는 설정했지만, `caret-src` 내의 `__tests__`가 포함되지 않도록 잘못 설정되었을 수 있음 (이전 시도에서 `exclude`를 수정했으나, `tsc`가 여전히 무시하는 것으로 보임).
- `scripts/build-tests.js`는 `esbuild`를 사용하여 `src/packages`만 번들링하므로, `caret-src` 테스트 파일 생성에는 관여하지 않음. 오직 `tsc` 단계에서 처리되어야 함.

## 3. 확인 사항
- `caret-src/__tests__/prompt-system/mode-system.test.ts` 파일이 실제로 존재하는지 확인 (이전 `ls` 명령으로 확인됨).
- `tsconfig.test.json`의 `include`에 `caret-src/**/*.test.ts`가 포함되어 있음.
- 하지만 `exclude`에 `caret-src/**/__tests__/*`가 없어야 함. (이전 수정에서 제거했는지 재확인 필요).

## 4. 조치 계획
- `tsconfig.test.json`을 다시 확인하여 `caret-src` 테스트 파일이 제외되지 않도록 설정.
- `tsc` 명령을 `files` 옵션으로 직접 실행하여 강제로 컴파일 시도.

```bash
npx tsc caret-src/__tests__/prompt-system/mode-system.test.ts --outDir out/caret-src/__tests__/prompt-system --module commonjs --target es2020 --esModuleInterop --resolveJsonModule --skipLibCheck
