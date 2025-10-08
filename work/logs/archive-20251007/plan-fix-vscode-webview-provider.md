# 작업 계획: `VscodeWebviewProvider.ts` 생성자 수정

## 1. 목표
`VscodeWebviewProvider`가 `WorkspaceRootManager`를 생성자에서 받아 `Controller`를 생성할 때 전달하도록 수정하여, `Controller` 생성자 관련 타입 에러를 최종적으로 해결한다.

## 2. 작업 단계
1. `WorkspaceRootManager` 타입을 import 합니다.
2. `VscodeWebviewProvider`의 생성자(constructor) 인자 목록에 `workspaceManager: WorkspaceRootManager`를 추가합니다.
3. `new Controller(...)`를 호출하는 부분에 `workspaceManager`를 세 번째 인자로 전달합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/hosts/vscode/VscodeWebviewProvider.ts</path>
<diff>
------- SEARCH
import { Controller } from "@core/controller"
import { WebviewProvider } from "@core/webview"
import { getNonce } from "@services/nonce"
=======
import { Controller } from "@core/controller"
import { WorkspaceRootManager } from "@core/workspace/WorkspaceRootManager"
import { WebviewProvider } from "@core/webview"
import { getNonce } from "@services/nonce"
+++++++ REPLACE
------- SEARCH
	constructor(
		readonly context: vscode.ExtensionContext,
		type: WebviewProviderType,
	) {
		super()
		this.type = type
		this.controller = new Controller(context, this.id)
		WebviewProvider.registerInstance(this)
	}
=======
	constructor(
		readonly context: vscode.ExtensionContext,
		type: WebviewProviderType,
		workspaceManager: WorkspaceRootManager,
	) {
		super()
		this.type = type
		this.controller = new Controller(context, this.id, workspaceManager)
		WebviewProvider.registerInstance(this)
	}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `VscodeWebviewProvider` 생성자 호출과 관련된 타입 에러가 해결됩니다.
- `src/common.ts`와 `src/extension.ts`에서 `VscodeWebviewProvider` 생성자 호출 시 인자가 부족하다는 새로운 에러가 발생하지만, 이는 이전에 수정한 내용과 맞물려 해결될 것입니다.
- 이 수정이 완료되면 `Controller` 생성과 관련된 모든 연쇄적인 타입 에러가 해결될 것으로 예상됩니다.
