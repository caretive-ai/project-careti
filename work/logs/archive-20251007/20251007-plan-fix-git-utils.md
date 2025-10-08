# `git` 유틸리티 관련 컴파일 에러 해결 계획

## 1. 문제점

`src/core/workspace/detection.ts`와 `src/hosts/vscode/commit-message-generator.ts` 파일에서 `@/utils/git` 모듈로부터 `isGitRepository` 및 `getGitDiff` 함수를 import 하려 하지만, 해당 함수들이 더 이상 export 되지 않아 컴파일 에러가 발생하고 있다.

- `error TS2305: Module '"@/utils/git"' has no exported member 'isGitRepository'.`
- `error TS2305: Module '"@/utils/git"' has no exported member 'getGitDiff'.`

## 2. 목표

'최소 침습' 및 '`caret-src` 우선' 원칙에 따라 `git` 유틸리티 관련 에러를 해결한다.

## 3. 작업 단계

### Step 1: `src/utils/git.ts` 파일 분석

- **대상 파일**: `src/utils/git.ts`
- **작업**: 파일을 직접 읽어 현재 export 되는 멤버 목록을 확인하고, `isGitRepository`와 `getGitDiff`의 행방을 추적한다. (이름 변경, 다른 파일로 이동 등)

### Step 2: 호환성 모듈 구현 (`caret-src`)

- **분석 결과에 따른 분기**:
  - **Case A (함수 이동/이름 변경)**: 새로운 위치나 이름으로 import 경로를 수정한다.
  - **Case B (함수 제거)**: Cline이 더 이상 해당 기능을 제공하지 않는 경우, `caret-src`에 대체 기능을 구현한다.
- **작업 (Case B의 경우)**:
  - **경로**: `caret-src/utils/git-compat.ts`
  - **내용**: `isGitRepository`와 `getGitDiff` 함수를 `HostProvider`의 `cli.exec` 등을 사용하여 새로 구현한다. 이는 Cline의 내부 구현 변경으로부터 Caret 코드를 보호하는 역할을 한다.

### Step 3: 최소 침습 수정 실행

- **대상 파일**:
  - `src/core/workspace/detection.ts`
  - `src/hosts/vscode/commit-message-generator.ts`
- **작업**: `// CARET MODIFICATION` 주석과 함께, `@/utils/git` 대신 새로운 import 경로 또는 `caret-src`에 구현한 호환성 모듈을 사용하도록 import 구문을 수정한다.
- **원칙 준수 검증**:
  - **불가피성**: 예. Cline 원본 파일의 컴파일 에러 수정.
  - **최소 범위**: 예. import 구문 1줄 수정.
  - **주석 포함**: 예. `CARET MODIFICATION` 주석 추가.
  - **병합 영향**: 예. 변경된 모듈 구조를 반영하는 것이므로 향후 병합에 긍정적.

## 4. 다음 단계

- **Step 1**을 실행하기 위해 `src/utils/git.ts` 파일을 읽고 분석을 시작한다.
