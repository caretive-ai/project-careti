# 작업 계획: `extension.ts`의 `dispose` 관련 에러 수정

## 1. 목표
`WorkspaceRootManager` 클래스가 `Disposable` 인터페이스를 구현하지 않으므로, `src/extension.ts`에서 `context.subscriptions.push(workspaceManager)` 라인을 제거하여 관련 타입 에러를 해결한다.

## 2. 분석
- `WorkspaceRootManager`는 더 이상 `onDidChangeWorkspaceFolders` 이벤트를 직접 수신하지 않으므로, `dispose` 메소드가 필요 없다.
- 따라서 `extension.ts`에서 `workspaceManager` 인스턴스를 `context.subscriptions`에 추가하려는 시도는 타입 에러를 발생시킨다.

## 3. 작업 단계
- `src/extension.ts` 파일에서 `context.subscriptions.push(workspaceManager)` 라인을 제거한다.

## 4. 실행할 명령어

```xml
<replace_in_file>
<path>src/extension.ts</path>
<diff>
------- SEARCH
	const workspaceManager = new WorkspaceRootManager()
	context.subscriptions.push(workspaceManager)

	// CARET MODIFICATION: Wrap with CaretProviderWrapper for image injection
=======
	const workspaceManager = new WorkspaceRootManager()

	// CARET MODIFICATION: Wrap with CaretProviderWrapper for image injection
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 5. 예상 결과
- `src/extension.ts`의 `Property 'dispose' is missing` 타입 에러가 해결됩니다.
- `Controller` 생성자 호출과 관련된 에러는 여전히 남아있으며, 이는 다음 단계에서 `common.ts`와 `VscodeWebviewProvider.ts` 파일을 수정하여 해결할 것입니다.
