# 작업 계획: `extension.ts` 컴파일 에러 수정

## 1. 목표

`src/extension.ts` 파일에서 발생하는 두 가지 주요 컴파일 에러를 해결한다.
1. `Controller`에서 제거된 `clearTask` 및 `postStateToWebview` 메소드 호출로 인한 에러.
2. (준비 작업) `Controller` 생성자에 `WorkspaceRootManager`를 전달하기 위해 인스턴스를 미리 생성.

## 2. 작업 단계

### Step 1: `WorkspaceRootManager` import 및 생성
- `activate` 함수 상단에서 `WorkspaceRootManager`를 import하고 인스턴스를 생성합니다.
- 생성된 인스턴스는 VSCode의 `context.subscriptions`에 추가하여 확장 기능 비활성화 시 메모리 누수를 방지합니다.

### Step 2: 불필요한 메소드 호출 제거
- `caret.plusButtonClicked` 커맨드 핸들러 내의 `openChat` 함수에서 `instance?.controller.clearTask()`와 `instance?.controller.postStateToWebview()` 라인을 제거합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/extension.ts</path>
<diff>
------- SEARCH
import { WebviewProvider } from "./core/webview"
import { createClineAPI } from "./exports"
import { Logger } from "./services/logging/Logger"
=======
import { WorkspaceRootManager } from "@core/workspace/WorkspaceRootManager"
import { WebviewProvider } from "./core/webview"
import { createClineAPI } from "./exports"
import { Logger } from "./services/logging/Logger"
+++++++ REPLACE
------- SEARCH
export async function activate(context: vscode.ExtensionContext) {
	setupHostProvider(context)

	// CARET MODIFICATION: Wrap with CaretProviderWrapper for image injection
	const clineWebview = (await initialize(context)) as VscodeWebviewProvider
	const sidebarWebview = new CaretProviderWrapper(context, clineWebview)
=======
export async function activate(context: vscode.ExtensionContext) {
	setupHostProvider(context)

	const workspaceManager = new WorkspaceRootManager()
	context.subscriptions.push(workspaceManager)

	// CARET MODIFICATION: Wrap with CaretProviderWrapper for image injection
	const clineWebview = (await initialize(context)) as VscodeWebviewProvider
	const sidebarWebview = new CaretProviderWrapper(context, clineWebview)
+++++++ REPLACE
------- SEARCH
			const openChat = async (instance: WebviewProvider) => {
				await instance?.controller.clearTask()
				await instance?.controller.postStateToWebview()
				await sendChatButtonClickedEvent(instance.controller.id)
			}
=======
			const openChat = async (instance: WebviewProvider) => {
				await sendChatButtonClickedEvent(instance.controller.id)
			}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `clearTask` 및 `postStateToWebview` 관련 에러가 해결됩니다.
- `Controller` 생성자 호출과 관련된 에러는 아직 남아있으며, 이는 다음 단계에서 `common.ts`와 `VscodeWebviewProvider.ts` 파일을 수정하여 해결할 예정입니다.
