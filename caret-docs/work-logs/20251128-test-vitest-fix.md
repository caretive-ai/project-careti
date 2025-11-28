# 테스트 빌드 실패 분석 및 대응 (Vitest 의존성)

## 1. 현상
- `npm run compile-tests` 실행 시 `tsc` 에러 발생.
- 에러 내용: `Cannot find module 'vitest' or its corresponding type declarations.`
- 영향 범위:
  - `caret-src/core/controller/fetchLiteLlmModels.integration.test.ts`
  - `caret-src/core/controller/fetchLiteLlmModels.test.ts`
  - `caret-src/shared/FeatureConfig.test.ts`

## 2. 원인
- Caret 소스(`caret-src`)에 포함된 일부 테스트 파일들이 `vitest`를 사용하고 있음.
- 현재 프로젝트는 `mocha` 기반 테스트 환경을 사용 중이며, `tsconfig.test.json`에 `vitest` 타입 정의가 포함되지 않음.
- `caret-src`를 `include`에 추가하면서 이 파일들이 컴파일 대상이 되어 에러 발생.

## 3. 해결 방안
**전략**: 현재 목표(ModeSystem 검증)에 불필요한 `vitest` 기반 테스트 파일들을 컴파일에서 제외한다.

1. **`tsconfig.test.json` 수정**:
   - `exclude` 목록에 `caret-src/**/*.integration.test.ts` 추가.
   - `caret-src` 내의 `vitest` 의존 파일들을 구체적으로 제외.

2. **(대안) `vitest` 설치**:
   - 프로젝트에 `vitest`를 설치하고 설정을 추가하는 것은 현재 작업 범위를 벗어남. 제외 전략이 타당함.

## 4. 실행 계획
`tsconfig.test.json`의 `exclude` 패턴 업데이트:
```json
"exclude": [
    // ... 기존 항목
    "caret-src/**/*.integration.test.ts",
    "caret-src/core/controller/fetchLiteLlmModels.test.ts",
    "caret-src/shared/FeatureConfig.test.ts"
]
