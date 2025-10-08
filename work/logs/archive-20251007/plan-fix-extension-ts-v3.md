# 작업 계획: `extension.ts`의 `setupHostProvider` 수정

## 1. 목표
`HostProvider.initialize` 함수의 변경된 시그니처에 맞춰, `src/extension.ts`의 `setupHostProvider` 함수 내에서 `workspaceManager` 인스턴스를 전달하도록 수정하여 타입 에러를 해결한다.

## 2. 작업 단계
1. `setupHostProvider` 함수가 `workspaceManager`를 인자로 받도록 시그니처를 변경합니다.
2. `HostProvider.initialize`를 호출할 때, 전달받은 `workspaceManager`를 마지막 인자로 추가합니다.
3. `activate` 함수에서 `setupHostProvider`를 호출할 때, 이전에 생성한 `workspaceManager` 인스턴스를 전달합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/extension.ts</path>
<diff>
------- SEARCH
export async function activate(context: vscode.ExtensionContext) {
	setupHostProvider(context)

	const workspaceManager = new WorkspaceRootManager()
=======
export async function activate(context: vscode.ExtensionContext) {
	const workspaceManager = new WorkspaceRootManager()
	setupHostProvider(context, workspaceManager)
+++++++ REPLACE
------- SEARCH
function setupHostProvider(context: ExtensionContext) {
	console.log("Setting up vscode host providers...")

	const createWebview = () => new VscodeWebviewProvider(context, WebviewProviderType.TAB)
	const createDiffView = () => new VscodeDiffViewProvider()
	const outputChannel = vscode.window.createOutputChannel("Caret")
	context.subscriptions.push(outputChannel)

	const getCallbackUrl = async () => `${vscode.env.uriScheme || "vscode"}://${context.extension.id}`
	HostProvider.initialize(
		createWebview,
		createDiffView,
		vscodeHostBridgeClient,
		outputChannel.appendLine,
		getCallbackUrl,
		getBinaryLocation,
		context.extensionUri.fsPath,
		context.globalStorageUri.fsPath,
	)
}
=======
function setupHostProvider(context: ExtensionContext, workspaceManager: WorkspaceRootManager) {
	console.log("Setting up vscode host providers...")

	const createWebview = () => new VscodeWebviewProvider(context, WebviewProviderType.TAB)
	const createDiffView = () => new VscodeDiffViewProvider()
	const outputChannel = vscode.window.createOutputChannel("Caret")
	context.subscriptions.push(outputChannel)

	const getCallbackUrl = async () => `${vscode.env.uriScheme || "vscode"}://${context.extension.id}`
	HostProvider.initialize(
		createWebview,
		createDiffView,
		vscodeHostBridgeClient,
		outputChannel.appendLine,
		getCallbackUrl,
		getBinaryLocation,
		context.extensionUri.fsPath,
		context.globalStorageUri.fsPath,
		workspaceManager,
	)
}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `src/extension.ts`에서 `HostProvider.initialize` 호출과 관련된 타입 에러가 해결됩니다.
- `initialize` 함수와 `VscodeWebviewProvider` 생성자 관련 에러는 아직 남아있으며, 이는 다음 단계에서 순차적으로 해결할 것입니다.
