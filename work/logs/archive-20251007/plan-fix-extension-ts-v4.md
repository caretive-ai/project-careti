# 작업 계획: `extension.ts`의 `initialize` 호출 수정

## 1. 목표
`src/common.ts`의 `initialize` 함수 시그니처 변경에 맞춰, `src/extension.ts`에서 `initialize` 함수를 호출할 때 `workspaceManager` 인스턴스를 전달하도록 수정하여 타입 에러를 해결한다.

## 2. 작업 단계
- `activate` 함수 내에서 `initialize` 함수를 호출하는 부분에 `workspaceManager`를 두 번째 인자로 추가합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/extension.ts</path>
<diff>
------- SEARCH
	// CARET MODIFICATION: Wrap with CaretProviderWrapper for image injection
	const clineWebview = (await initialize(context)) as VscodeWebviewProvider
	const sidebarWebview = new CaretProviderWrapper(context, clineWebview)
=======
	// CARET MODIFICATION: Wrap with CaretProviderWrapper for image injection
	const clineWebview = (await initialize(context, workspaceManager)) as VscodeWebviewProvider
	const sidebarWebview = new CaretProviderWrapper(context, clineWebview)
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `src/extension.ts`에서 `initialize` 함수 호출과 관련된 타입 에러가 해결됩니다.
- `VscodeWebviewProvider` 생성자 호출과 관련된 에러는 아직 남아있으며, 이는 다음 단계에서 `VscodeWebviewProvider.ts` 파일을 수정하여 해결할 것입니다.
