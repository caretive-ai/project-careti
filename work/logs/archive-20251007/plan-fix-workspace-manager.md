# 작업 계획: `WorkspaceRootManager`에 `dispose` 메소드 추가

## 1. 목표
`src/core/workspace/WorkspaceRootManager.ts` 파일에 `dispose` 메소드를 구현하여, `extension.ts`에서 발생하는 `Property 'dispose' is missing` 타입 에러를 해결한다.

## 2. 작업 단계
1. `vscode.Disposable` 인터페이스를 구현하도록 클래스 선언을 수정합니다.
2. `onDidChangeWorkspaceFolders` 이벤트 리스너를 담을 `disposable` 클래스 속성을 추가합니다.
3. 생성자에서 이벤트 리스너를 등록하고 그 결과를 `disposable` 속성에 저장합니다.
4. `dispose` 메소드를 추가하여 `disposable`에 저장된 리스너를 정리합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/core/workspace/WorkspaceRootManager.ts</path>
<diff>
------- SEARCH
import * as vscode from "vscode"

export class WorkspaceRootManager {
	private roots: WorkspaceRoot[] = []
	private primaryRoot?: WorkspaceRoot

	constructor() {
		this.updateRoots()
		vscode.workspace.onDidChangeWorkspaceFolders(() => this.updateRoots())
	}
=======
import * as vscode from "vscode"

export class WorkspaceRootManager implements vscode.Disposable {
	private roots: WorkspaceRoot[] = []
	private primaryRoot?: WorkspaceRoot
	private disposable: vscode.Disposable

	constructor() {
		this.updateRoots()
		this.disposable = vscode.workspace.onDidChangeWorkspaceFolders(() => this.updateRoots())
	}

	dispose() {
		this.disposable.dispose()
	}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `WorkspaceRootManager`가 `Disposable` 인터페이스를 올바르게 구현하게 됩니다.
- `src/extension.ts`의 `context.subscriptions.push(workspaceManager)`에서 발생하던 타입 에러가 해결됩니다.
- `Controller` 생성자 관련 에러는 여전히 남아있으며, 다음 단계에서 `common.ts`를 수정하여 해결할 것입니다.
