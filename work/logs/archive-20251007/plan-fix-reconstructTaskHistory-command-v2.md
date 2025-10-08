# 작업 계획: `reconstructTaskHistory` 커맨드 통합 및 컴파일 에러 해결

## 1. 목표

Cline에서 새로 추가된 `reconstructTaskHistory` 커맨드가 Caret 환경에서 정상적으로 동작하도록 수정하여 관련 컴파일 에러를 해결한다.

## 2. 분석 내용

- `reconstructTaskHistory.ts`는 Cline의 신규 파일이며, 병합 시 내용은 변경되지 않았다.
- 에러의 원인은 파일 내용이 아닌, Caret의 `HostProvider` 및 전역 `context` 의존성 문제로 추정된다.
- 이 커맨드는 `vscode.ExtensionContext`가 필요한 `HostProvider`의 기능들을 직접 호출하고 있다.

## 3. 해결 전략

'최소 침습 원칙'에 따라 `src` 디렉토리의 원본 파일 수정은 최소화한다. 대신, `extension.ts`에서 커맨드를 등록하는 시점에 필요한 `context`를 전달하는 방식으로 문제를 해결한다.

## 4. 작업 단계

### Step 1: 커맨드 등록 위치 확인

- `extension.ts` 파일과 관련 컨트롤러 파일을 분석하여 `reconstructTaskHistory` 커맨드가 어디에서, 어떻게 등록되는지 확인한다.
- `search_files`를 사용하여 `"reconstructTaskHistory"` 문자열을 검색하여 등록 위치를 찾는다.

### Step 2: `ExtensionContext` 전달 구조 분석

- `extension.ts`에서 `activate` 함수가 받는 `context: vscode.ExtensionContext`가 다른 커맨드 핸들러들에게 어떻게 전달되는지 분석한다.
- `reconstructTaskHistory` 함수가 `context`를 인자로 받을 수 있도록 시그니처를 수정할 필요가 있는지 검토한다.

### Step 3: `reconstructTaskHistory.ts` 수정

- `reconstructTaskHistory` 함수가 `context`를 인자로 받도록 수정한다.
- `HostProvider.get().globalStorageFsPath`와 같이 전역 상태에 의존하는 코드들을, 전달받은 `context.globalStorageUri.fsPath`를 사용하도록 변경한다.
- `HostProvider.window.showMessage`는 그대로 사용하되, `HostProvider`가 `context`를 통해 올바르게 초기화되었는지 확인한다.

### Step 4: `extension.ts` 수정

- `reconstructTaskHistory` 커맨드를 등록하는 부분에서 `vscode.ExtensionContext`를 인자로 전달하도록 수정한다.
- 예시: `vscode.commands.registerCommand('cline.reconstructTaskHistory', () => reconstructTaskHistory(context));`

### Step 5: 검증

- `npm run compile`을 실행하여 관련 컴파일 에러가 모두 해결되었는지 확인한다.
