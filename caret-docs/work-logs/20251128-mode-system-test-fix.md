# ModeSystem 테스트 파일 생성 실패 및 해결

## 1. 현상
- `npm run compile-tests`를 실행해도 `out/caret-src/__tests__/prompt-system/mode-system.test.js` 파일이 생성되지 않음.
- `find out -name "mode-system.test.js"` 결과가 없음.
- 원인 추정: `tsconfig.test.json`의 `include` 패턴에는 포함되어 있으나, `tsc`가 `caret-src` 루트 파일을 처리하면서 의존성이 없는 테스트 파일들을 건너뛸 가능성이 있음 (하지만 보통은 include된 모든 파일을 컴파일함). 또는 `rootDir` 설정 이슈.

## 2. 수동 컴파일 재시도 (확실한 경로)
`tsconfig.test.json`을 우회하여 직접 컴파일을 시도했지만, 모듈 해석 문제가 있었음.
이제 `scripts/build-tests.js`가 사용하는 방식(`tsc -p ./tsconfig.test.json`)이 실패하고 있으므로, 파일별 직접 컴파일을 통해 `out`에 생성해본다.

## 3. 실행 계획
```bash
npx tsc caret-src/__tests__/prompt-system/mode-system.test.ts --outDir out/caret-src/__tests__/prompt-system --module commonjs --target es2020 --esModuleInterop --resolveJsonModule --skipLibCheck --baseUrl . --paths "@core/*:src/core/*"
```
위 명령은 `tsconfig.json`의 설정을 무시하고 cli 인자로만 컴파일하므로 복잡함.

대신, `tsconfig.mode-system.json`을 임시로 생성하여 컴파일한다.

## 4. `tsconfig.mode-system.json` 내용
```json
{
  "extends": "./tsconfig.test.json",
  "include": ["caret-src/__tests__/prompt-system/mode-system.test.ts"],
  "compilerOptions": {
    "noEmit": false,
    "outDir": "out"
  }
}
