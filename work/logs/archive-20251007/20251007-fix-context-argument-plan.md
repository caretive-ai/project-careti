# Plan: `context` 인자 누락 문제 해결 (1단계)

## 1. 목표

`vscode.ExtensionContext`를 필요로 하는 함수 호출 시 `context` 인자가 누락되어 발생하는 컴파일 에러를 해결합니다. 먼저 `src/core/commands/reconstructTaskHistory.ts` 파일의 에러 4개를 해결하는 것을 목표로 합니다.

## 2. 분석

`reconstructTaskHistory` 함수는 `vscode.ExtensionContext`를 인자로 받지 않기 때문에, 내부에서 호출하는 `writeTaskHistoryToState`, `readTaskHistoryFromState`, `getSavedClineMessages`, `getTaskMetadata` 함수에 `context`를 전달할 수 없습니다.

## 3. 수정 계획

### 3.1. `src/core/commands/reconstructTaskHistory.ts` 수정

1.  `reconstructTaskHistory` 함수의 시그니처를 변경하여 첫 번째 인자로 `context: vscode.ExtensionContext`를 받도록 수정합니다.
2.  함수 내부의 `writeTaskHistoryToState`, `readTaskHistoryFromState`, `getSavedClineMessages`, `getTaskMetadata` 함수를 호출할 때, 전달받은 `context`를 첫 번째 인자로 넘겨줍니다.

### 3.2. `reconstructTaskHistory` 호출부 수정

`reconstructTaskHistory` 함수를 호출하는 모든 부분을 찾아 `extensionContext`를 첫 번째 인자로 전달하도록 수정해야 합니다. `search_files`를 통해 호출부를 찾고 수정 계획에 반영하겠습니다.

## 4. 검증

1.  관련 파일들을 수정한 후 `npm run compile`을 실행합니다.
2.  `src/core/commands/reconstructTaskHistory.ts` 관련 에러가 해결되었는지 확인하고, 전체 에러 수가 감소했는지 확인합니다.
3.  결과를 마스터께 보고합니다.
