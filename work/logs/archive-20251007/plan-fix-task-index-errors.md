# 작업 계획: `src/core/task/index.ts` 마이그레이션

## 1. 목표

`cline/master` 병합으로 인해 손상된 `src/core/task/index.ts` 파일을 '덮어쓰기 후 재적용' 전략을 통해 복구하여, 관련된 대규모 컴파일 에러(현재 약 40~50개)를 해결한다.

## 2. 분석

- 현재 `src/core/task/index.ts` 파일은 병합 과정에서 내용이 불완전하게 처리되어, `ToolResponse`, `Task` 등 핵심 타입 정의를 제대로 export하지 못하고 있다.
- 이로 인해 `ToolExecutor` 및 다수의 `ToolHandler` 파일에서 연쇄적으로 모듈을 찾지 못하는 컴파일 에러가 발생하고 있다.

## 3. 해결 전략: 덮어쓰기 후 재적용 (Overwrite and Re-apply)

1.  **덮어쓰기 (Overwrite)**: `cline-latest`의 최신 `index.ts` 파일 내용으로 현재 작업 파일을 완전히 덮어써서, 깨끗한 원본 상태에서 시작한다.
2.  **재적용 (Re-apply)**: 병합 이전 Caret에만 존재했던 수정사항(`// CARET MODIFICATION`)을 분석하여, 덮어쓴 최신 파일 위에 다시 적용한다.

## 4. 작업 단계

### Step 1: 2-Way 소스 파일 읽기

- **Cline 원본**: `cline-latest/src/core/task/index.ts`
- **현재 작업 소스 (손상된 파일)**: `src/core/task/index.ts`

### Step 2: Caret 수정사항 식별

- 현재 작업 소스(`src/core/task/index.ts`)를 분석하여, `// CARET MODIFICATION` 주석이 포함된 부분을 찾는다.
- 만약 주석이 없다면, Cline 원본과 비교하여 Caret 고유의 로직으로 보이는 부분을 식별한다. (예: `CaretToolExecutor` 관련 로직)

### Step 3: 마이그레이션 실행 (`replace_in_file`)

- **(준비)** `cline-latest/src/core/task/index.ts`의 전체 내용을 복사한다.
- **(수정)** 복사된 내용에 Step 2에서 식별한 Caret 수정사항을 신중하게 재적용한다.
- **(실행)** `write_to_file`을 사용하여 `src/core/task/index.ts` 파일을 준비된 최종 내용으로 덮어쓴다.

### Step 4: 검증

- `npm run compile`을 실행하여 `src/core/task` 관련 에러가 대폭 감소했는지 확인한다.
- 모든 에러가 해결되지 않을 수 있으나, `Cannot find module` 관련 에러는 모두 해결되어야 한다.
