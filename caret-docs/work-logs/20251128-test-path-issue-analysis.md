# 테스트 컴파일 경로 이슈 분석

## 1. 현상
- `npm run compile-tests`를 실행했음에도 불구하고 `out/caret-src/__tests__` 디렉토리가 존재하지 않음.
- `src` 디렉토리의 테스트 파일들은 `out/src`로 컴파일되지만, `caret-src` 디렉토리의 테스트 파일들은 `out` 디렉토리에 포함되지 않고 있음.

## 2. 원인 추정
- `scripts/build-tests.js` 또는 `tsconfig.test.json` 설정에서 `caret-src` 디렉토리가 포함되지 않았거나 `include` 패턴이 잘못되었을 가능성.

## 3. 해결 방안
- `scripts/build-tests.js` 및 `tsconfig.test.json` 확인.
- `caret-src` 디렉토리를 컴파일 대상에 포함하도록 설정 수정.
- `caret-src`의 테스트 파일들을 컴파일하여 `out` 디렉토리에 생성되도록 조치.

## 4. 임시 우회 방안
- `ts-node`를 사용하여 소스 파일(`ts`)을 직접 실행하는 방법 고려 (하지만 `requires.ts`의 모듈 로딩 로직과 충돌 가능성 있음).
- 가장 확실한 방법은 빌드 스크립트를 수정하여 `caret-src` 테스트 파일들도 컴파일되게 하는 것.
