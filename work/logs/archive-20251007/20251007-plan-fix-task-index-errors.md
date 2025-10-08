# `src/core/task/index.ts` 컴파일 에러 수정 계획

## 1. 문제 분석

`cline/master` 병합 이후, `context` 의존성을 `HostProvider`로 이전하는 리팩토링이 진행되었다. 하지만 `src/core/task/index.ts` 파일 내의 `Task` 클래스에서는 여전히 이전 방식으로 `context`를 직접 여러 생성자와 함수에 전달하고 있어 다수의 `TS2554 (Expected 1 arguments, but got 2)` 및 `TS2353 ('context' does not exist)` 타입 에러가 발생하고 있다.

## 2. 해결 목표

`src/core/task/index.ts` 파일 내에서 `vscode.ExtensionContext`를 직접 인자로 전달하는 모든 코드를 수정하여, 변경된 함수 및 생성자 시그니처에 맞게 리팩토링한다. 이를 통해 관련된 11개의 컴파일 에러를 해결한다.

## 3. 새로운 작업 원칙 (마스터와 합의)

### 3.1. 소스 디렉토리 원칙

- **`cline`, `cline-latest`, `caret-main`, `caret-org`**: 이 디렉토리들은 서브모듈이 아니며, 병합 작업을 위한 **참고용 소스**이다.
  - `cline-latest` 소스: `https://github.com/cline/cline.git`
  - `caret-main` 소스: `https://github.com/aicoding-caret/caret.git`
- **`caret-b2b`**: 서브모듈이 아닌 B2B 브랜드 전환용 코드이며, `.gitignore`에 의해 관리된다.

### 3.2. 파일 수정 원칙

단순히 함수 시그니처를 수정하는 것을 넘어, 파일의 구조적 변경이 클 가능성을 고려하여 다음 원칙에 따라 작업을 진행한다.

1.  **선 분석, 후 실행**: 코드 수정 전에, 현재 Caret의 파일(`src/core/task/index.ts`)과 Cline 원본 참고 소스(`cline-latest/src/core/task/index.ts`)의 차이점을 정밀하게 비교 분석한다.
2.  **최적의 방법론 선택**:
    -   **단순 동기화**: 분석 결과, 변경점이 주로 API 시그니처 불일치 등 단순한 내용일 경우, 최소한의 `replace_in_file` 작업으로 동기화한다. (기존 계획)
    -   **덮어쓰기 후 재적용**: 분석 결과, 파일의 핵심 구조나 로직 흐름에 큰 차이가 발견될 경우, Cline 원본 파일로 덮어쓴 후 `CARET MODIFICATION` 주석을 참고하여 Caret의 고유 변경 사항을 다시 적용한다.
3.  **결과 기반 진행**: 분석 결과를 바탕으로 마스터와 최종 작업 방향을 결정한 후 실행에 옮긴다.

## 4. 실행 계획

1.  **파일 비교 분석**: `diff` 또는 관련 도구를 사용하여 `src/core/task/index.ts`와 `cline-latest/src/core/task/index.ts`의 차이점을 분석하고 그 결과를 로그 파일로 저장한다.
2.  **분석 결과 보고**: 분석 결과를 마스터께 보고하고, 위 '파일 수정 원칙'에 따라 '단순 동기화'와 '덮어쓰기 후 재적용' 중 어떤 방식이 더 적합할지 최종 결정을 받는다.
3.  **선택된 방식으로 수정 작업 실행**: 결정된 방식에 따라 실제 파일 수정 작업을 진행한다.

## 5. 기대 효과

- 가장 안전하고 효율적인 방법으로 컴파일 에러를 해결한다.
- `cline/master`와의 잠재적인 구조적 불일치 문제를 사전에 파악하고 대응할 수 있다.
- '최소 침습 원칙'을 보다 정확하게 준수하여 작업의 안정성을 높인다.
