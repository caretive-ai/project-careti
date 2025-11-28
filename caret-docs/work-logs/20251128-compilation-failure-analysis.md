# 컴파일 실패 심층 분석

## 1. 현상
- `rm -rf out` 후 `npm run compile-tests`를 실행했지만, `out/caret-src/__tests__/prompt-system/mode-system.test.js` 파일이 생성되지 않음.
- `find out -name "mode-system.test.js"` 결과가 없음.
- 하지만 `npx mocha` 실행 시에는 `Cannot find module 'vitest'` 에러가 발생하며, 스택 트레이스에 `out/caret-src/__tests__/prompt-system/mode-system.test.js`가 나타났었음 (이전 실행 기준).
- 현재는 파일이 없으므로 `npx mocha`도 실패할 것임.

## 2. 원인
- **`tsc` 설정**: `tsconfig.test.json`에서 `caret-src`를 `include`했지만, `rootDir` 설정(`"."`)으로 인해 `out` 디렉토리 구조가 예상과 다를 수 있음. `src`와 `caret-src`가 병합되거나, `caret-src`가 무시될 가능성.
- **`exclude` 설정**: 이전에 `exclude`에 `caret-src/**/*.test.ts`를 추가했다가 다시 제거하는 과정을 거침. 현재 설정은 올바르게 보이지만, `tsc`가 파일을 인식하지 못하는 다른 이유가 있을 수 있음.

## 3. `tsconfig.test.json` 재검토
```json
"rootDir": "."
```
- 소스 구조:
  - `src/`
  - `caret-src/`
- `outDir`: `out`
- 예상 출력 구조:
  - `out/src/`
  - `out/caret-src/`

만약 `rootDir`이 `.`이면 위 구조가 맞음.

## 4. 조치 계획
- `tsc` 명령을 직접 실행하여 `out` 디렉토리에 무엇이 생성되는지 확인.
- `caret-src`만 별도로 컴파일하는 임시 `tsconfig`를 만들거나, `tsc` 명령에 파일 목록을 직접 전달.

```bash
npx tsc -p tsconfig.test.json --outDir out --listFiles
