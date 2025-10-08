# 작업 계획: `HostProvider`에 `WorkspaceRootManager` 통합

## 1. 목표
`WorkspaceRootManager`를 중앙에서 관리하고 필요한 곳에 제공하기 위해, `src/hosts/host-provider.ts`의 `HostProvider` 클래스를 수정하여 `workspaceManager`를 관리하도록 구조를 변경한다.

## 2. 작업 단계
1. `WorkspaceRootManager` 타입을 import 합니다.
2. `HostProvider` 클래스에 `workspaceManager` 속성을 추가합니다.
3. `initialize` 메소드의 인자 목록에 `workspaceManager: WorkspaceRootManager`를 추가하고, 이를 클래스 속성에 할당합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/hosts/host-provider.ts</path>
<diff>
------- SEARCH
import { VscodeWebviewProvider } from "./vscode/VscodeWebviewProvider"

let hostProvider: HostProvider | undefined

export class HostProvider {
	static get() {
		if (!hostProvider) {
			throw new Error("Host provider not initialized")
		}
		return hostProvider
	}
=======
import { WorkspaceRootManager } from "@core/workspace/WorkspaceRootManager"
import { VscodeWebviewProvider } from "./vscode/VscodeWebviewProvider"

let hostProvider: HostProvider | undefined

export class HostProvider {
	workspaceManager: WorkspaceRootManager

	static get() {
		if (!hostProvider) {
			throw new Error("Host provider not initialized")
		}
		return hostProvider
	}
+++++++ REPLACE
------- SEARCH
	static initialize(
		createWebview: (type: WebviewProviderType) => VscodeWebviewProvider,
		createDiffView: () => VscodeDiffViewProvider,
		hostBridge: HostBridge,
		logToChannel: (message: string) => void,
		getCallbackUrl: () => Promise<string>,
		getBinaryLocation: (name: string) => Promise<string>,
		extensionPath: string,
		globalStoragePath: string,
	) {
		hostProvider = new HostProvider(
			createWebview,
			createDiffView,
			hostBridge,
			logToChannel,
			getCallbackUrl,
			getBinaryLocation,
			extensionPath,
			globalStoragePath,
		)
	}
=======
	static initialize(
		createWebview: (type: WebviewProviderType) => VscodeWebviewProvider,
		createDiffView: () => VscodeDiffViewProvider,
		hostBridge: HostBridge,
		logToChannel: (message: string) => void,
		getCallbackUrl: () => Promise<string>,
		getBinaryLocation: (name: string) => Promise<string>,
		extensionPath: string,
		globalStoragePath: string,
		workspaceManager: WorkspaceRootManager,
	) {
		hostProvider = new HostProvider(
			createWebview,
			createDiffView,
			hostBridge,
			logToChannel,
			getCallbackUrl,
			getBinaryLocation,
			extensionPath,
			globalStoragePath,
			workspaceManager,
		)
	}
+++++++ REPLACE
------- SEARCH
	private constructor(
		readonly createWebviewProvider: (type: WebviewProviderType) => VscodeWebviewProvider,
		readonly createDiffViewProvider: () => VscodeDiffViewProvider,
		readonly hostBridge: HostBridge,
		readonly logToChannel: (message: string) => void,
		readonly getCallbackUrl: () => Promise<string>,
		readonly getBinaryLocation: (name: string) => Promise<string>,
		readonly extensionPath: string,
		readonly globalStoragePath: string,
	) {}
=======
	private constructor(
		readonly createWebviewProvider: (type: WebviewProviderType) => VscodeWebviewProvider,
		readonly createDiffViewProvider: () => VscodeDiffViewProvider,
		readonly hostBridge: HostBridge,
		readonly logToChannel: (message: string) => void,
		readonly getCallbackUrl: () => Promise<string>,
		readonly getBinaryLocation: (name: string) => Promise<string>,
		readonly extensionPath: string,
		readonly globalStoragePath: string,
		workspaceManager: WorkspaceRootManager,
	) {
		this.workspaceManager = workspaceManager
	}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `HostProvider`가 `workspaceManager`를 관리하게 됩니다.
- `src/extension.ts`의 `setupHostProvider`에서 `HostProvider.initialize` 호출 시 인자가 부족하다는 새로운 에러가 발생할 것이며, 이는 다음 단계에서 해결합니다.
