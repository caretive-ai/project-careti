# `TS2554` (함수 시그니처) 에러 해결 계획

## 1. 문제점

Cline API가 변경되면서 다수의 함수 시그니처(매개변수)가 변경되었다. 이로 인해 이전 시그니처에 맞춰 함수를 호출하는 여러 파일에서 `error TS2554: Expected X arguments, but got Y` 컴파일 에러가 발생하고 있다.

- **첫 번째 대상**: `src/common.ts(51,66): error TS2554: Expected 0 arguments, but got 1.`

## 2. 목표

변경된 함수 시그니처에 맞게 호출 코드를 수정하여 `TS2554` 에러 그룹을 점진적으로 해결한다.

## 3. 작업 단계

### Step 1: `src/common.ts` 에러 분석 및 수정

- **대상 파일**: `src/common.ts`
- **작업**:
  1. 파일을 읽어 51번째 줄의 코드를 분석한다.
  2. 에러 메시지에 따라 불필요한 인수를 제거하여 수정한다.
- **원칙 준수 검증**: 최소 침습 원칙에 따라 1줄만 수정하며, `CARET MODIFICATION` 주석을 추가한다.

### Step 2: `reconstructTaskHistory.ts` 에러 그룹 수정

- **대상 파일**: `src/core/commands/reconstructTaskHistory.ts`
- **작업**: `common.ts` 수정 후 재컴파일하여 남은 에러를 확인하고, `reconstructTaskHistory.ts`에서 발생하는 4개의 `TS2554` 에러를 동일한 방식으로 분석하고 수정한다.

### Step 3: `extension.ts` 에러 수정

- **대상 파일**: `src/extension.ts`
- **작업**: `reconstructTaskHistory.ts` 수정 후 재컴파일하여 남은 에러를 확인하고, `extension.ts`에서 발생하는 `TS2554` 에러를 분석하고 수정한다.

## 4. 다음 단계

- **Step 1**을 실행하기 위해 `src/common.ts` 파일을 읽고 분석을 시작한다.
