# `multi-root-utils.ts` 컴파일 에러 해결 계획

## 1. 문제점

`src/core/workspace/multi-root-utils.ts` 파일의 `isMultiRootEnabled` 함수가 더 이상 `GlobalState`에 존재하지 않는 `"multiRootEnabled"` 키를 참조하여 컴파일 에러가 발생하고 있다.

```typescript
// src/core/workspace/multi-root-utils.ts(16,53): error TS2345:
// Argument of type '"multiRootEnabled"' is not assignable to parameter of type 'keyof GlobalState'.
```

## 2. 목표

`isMultiRootEnabled` 함수를 Cline의 새로운 아키텍처에 맞게 수정하여 컴파일 에러를 해결한다. 이 과정에서 '최소 침습 원칙'을 철저히 준수한다.

## 3. 작업 단계

### Step 1: `multi-root-utils.ts` 코드 분석

- **대상 파일**: `src/core/workspace/multi-root-utils.ts`
- **작업**: 파일을 직접 읽어 `isMultiRootEnabled` 함수의 로직과 의존성을 정확히 파악한다.

### Step 2: 새로운 멀티-루트 확인 방식 분석

- **작업**: `setup.ts` 등 관련 파일을 다시 참조하여, Cline이 멀티-루트 워크스페이스 활성화 여부를 어떻게 판단하는지 새로운 표준 방식을 분석한다. (예: `HostProvider`의 특정 기능, Feature Flag 등)

### Step 3: 최소 침습 수정 실행

- **대상 파일**: `src/core/workspace/multi-root-utils.ts`
- **작업**: 분석된 새로운 표준 방식을 사용하여 `isMultiRootEnabled` 함수를 수정한다. 수정 시 `// CARET MODIFICATION` 주석과 함께 변경 사유를 명확히 기재한다.
- **원칙 준수 검증**:
  - **불가피성**: 예. Cline 원본 파일의 컴파일 에러 수정.
  - **최소 범위**: 예. 함수 내부 로직 1~2줄 수정.
  - **주석 포함**: 예. `CARET MODIFICATION` 주석 추가.
  - **병합 영향**: 예. 레거시 코드를 새로운 방식으로 변경하므로 향후 병합에 긍정적.

## 4. 다음 단계

- **Step 1**을 실행하기 위해 `src/core/workspace/multi-root-utils.ts` 파일을 읽고 분석을 시작한다.
