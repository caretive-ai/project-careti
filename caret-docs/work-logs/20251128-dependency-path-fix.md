# 테스트 의존성 경로 문제 분석 및 해결

## 1. 현상
- `npx mocha` 실행 시 `Cannot find module '../../out/caret-src/shared/prompts'` 에러 발생.
- 스택 트레이스:
  - `PromptRegistry.ts` -> `index.ts` -> `mode-system.test.ts`
  - `PromptRegistry`가 컴파일된 `out` 디렉토리 내에서 `caret-src` 모듈을 찾으려 하지만 경로가 맞지 않음.

## 2. 원인 분석
- `src/core/prompts/system-prompt/registry/PromptRegistry.ts`가 `caret-src/shared/prompts`를 import하고 있음.
- 컴파일된 `out/src/...` 파일에서 `../../out/caret-src/...` 경로를 찾으려 하는데, `tsc` 컴파일 시 상대 경로 변환이 예상과 다르게 되거나 `requires.ts`의 매핑이 완전하지 않을 수 있음.
- `PromptRegistry.ts`는 `out/src/core/prompts/system-prompt/registry/PromptRegistry.js`로 컴파일됨.
- `caret-src`는 `out/caret-src/...`로 컴파일됨.
- 상대 경로 계산: `out/src/core/prompts/system-prompt/registry` -> `../../../../caret-src/shared/prompts` (깊이 4단계)
- 하지만 에러 메시지는 `../../out/caret-src/shared/prompts`를 찾고 있다고 함. 이는 소스 코드 레벨에서의 경로가 그대로 컴파일되었거나, 별칭(`@caret`)이 잘못 치환되었을 가능성.

## 3. 해결 방안
`src/test/requires.ts` 파일에서 `@caret/` 별칭에 대한 폴백 처리 로직을 보강하거나, 경로 깊이에 따른 상대 경로 계산을 더 유연하게 수정해야 함.

현재 `requires.ts` 로직:
```javascript
if (path.startsWith("@caret/")) {
    const resolvedPath = path.replace("@caret/", "../../out/caret-src/")
    // ...
}
```
`src/test/requires.ts` 위치 기준으로는 `../../out/caret-src/`가 맞을 수 있지만, 다른 깊이의 파일에서 호출될 때는 맞지 않음.

하지만 `Module.prototype.require` 훅은 호출자의 위치가 아닌, 요청된 모듈 경로 문자열을 가로챔. `originalRequire.call(this, path)`를 호출할 때 `this` (현재 모듈) 컨텍스트에서 상대 경로가 해결됨.

따라서 `src/test/requires.ts`에서 경로를 변환할 때 절대 경로로 변환해주는 것이 안전함.

## 4. 실행 계획
`src/test/requires.ts`를 수정하여 `@caret/` 및 `@/` 별칭을 프로젝트 루트 기준 절대 경로로 매핑.
`process.cwd()` 또는 `__dirname`을 사용하여 절대 경로 구성.
