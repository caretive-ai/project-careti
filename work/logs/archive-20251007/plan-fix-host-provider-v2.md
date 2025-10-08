# 작업 계획: `HostProvider`에 `WorkspaceRootManager` 통합 (v2)

## 1. 목표
`HostProvider`의 싱글톤 구조를 유지하면서 `WorkspaceRootManager`를 중앙에서 관리하고 필요한 곳에 제공할 수 있도록 `src/hosts/host-provider.ts` 파일을 수정한다.

## 2. 작업 단계
1. `WorkspaceRootManager` 타입을 import 합니다.
2. `HostProvider` 클래스에 `public workspaceManager` 속성을 추가합니다.
3. `initialize` 정적 메소드와 `private constructor`의 인자 목록에 `workspaceManager: WorkspaceRootManager`를 추가합니다.
4. 생성자 내에서 전달받은 `workspaceManager`를 `this.workspaceManager`에 할당합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/hosts/host-provider.ts</path>
<diff>
------- SEARCH
import { WebviewProvider } from "@/core/webview"
import { DiffViewProvider } from "@/integrations/editor/DiffViewProvider"
import { HostBridgeClientProvider } from "./host-provider-types"
=======
import { WebviewProvider } from "@/core/webview"
import { WorkspaceRootManager } from "@/core/workspace/WorkspaceRootManager"
import { DiffViewProvider } from "@/integrations/editor/DiffViewProvider"
import { HostBridgeClientProvider } from "./host-provider-types"
+++++++ REPLACE
------- SEARCH
	createWebviewProvider: WebviewProviderCreator
	createDiffViewProvider: DiffViewProviderCreator
	hostBridge: HostBridgeClientProvider
=======
	createWebviewProvider: WebviewProviderCreator
	createDiffViewProvider: DiffViewProviderCreator
	hostBridge: HostBridgeClientProvider
	workspaceManager: WorkspaceRootManager
+++++++ REPLACE
------- SEARCH
	private constructor(
		createWebviewProvider: WebviewProviderCreator,
		createDiffViewProvider: DiffViewProviderCreator,
		hostBridge: HostBridgeClientProvider,
		logToChannel: LogToChannel,
		getCallbackUrl: () => Promise<string>,
		getBinaryLocation: (name: string) => Promise<string>,
		extensionFsPath: string,
		globalStorageFsPath: string,
	) {
		this.createWebviewProvider = createWebviewProvider
		this.createDiffViewProvider = createDiffViewProvider
		this.hostBridge = hostBridge
		this.logToChannel = logToChannel
		this.getCallbackUrl = getCallbackUrl
		this.getBinaryLocation = getBinaryLocation
		this.extensionFsPath = extensionFsPath
		this.globalStorageFsPath = globalStorageFsPath
	}
=======
	private constructor(
		createWebviewProvider: WebviewProviderCreator,
		createDiffViewProvider: DiffViewProviderCreator,
		hostBridge: HostBridgeClientProvider,
		logToChannel: LogToChannel,
		getCallbackUrl: () => Promise<string>,
		getBinaryLocation: (name: string) => Promise<string>,
		extensionFsPath: string,
		globalStorageFsPath: string,
		workspaceManager: WorkspaceRootManager,
	) {
		this.createWebviewProvider = createWebviewProvider
		this.createDiffViewProvider = createDiffViewProvider
		this.hostBridge = hostBridge
		this.logToChannel = logToChannel
		this.getCallbackUrl = getCallbackUrl
		this.getBinaryLocation = getBinaryLocation
		this.extensionFsPath = extensionFsPath
		this.globalStorageFsPath = globalStorageFsPath
		this.workspaceManager = workspaceManager
	}
+++++++ REPLACE
------- SEARCH
	public static initialize(
		webviewProviderCreator: WebviewProviderCreator,
		diffViewProviderCreator: DiffViewProviderCreator,
		hostBridgeProvider: HostBridgeClientProvider,
		logToChannel: LogToChannel,
		getCallbackUrl: () => Promise<string>,
		getBinaryLocation: (name: string) => Promise<string>,
		extensionFsPath: string,
		globalStorageFsPath: string,
	): HostProvider {
		if (HostProvider.instance) {
			throw new Error("Host provider has already been initialized.")
		}
		HostProvider.instance = new HostProvider(
			webviewProviderCreator,
			diffViewProviderCreator,
			hostBridgeProvider,
			logToChannel,
			getCallbackUrl,
			getBinaryLocation,
			extensionFsPath,
			globalStorageFsPath,
		)
		return HostProvider.instance
	}
=======
	public static initialize(
		webviewProviderCreator: WebviewProviderCreator,
		diffViewProviderCreator: DiffViewProviderCreator,
		hostBridgeProvider: HostBridgeClientProvider,
		logToChannel: LogToChannel,
		getCallbackUrl: () => Promise<string>,
		getBinaryLocation: (name: string) => Promise<string>,
		extensionFsPath: string,
		globalStorageFsPath: string,
		workspaceManager: WorkspaceRootManager,
	): HostProvider {
		if (HostProvider.instance) {
			throw new Error("Host provider has already been initialized.")
		}
		HostProvider.instance = new HostProvider(
			webviewProviderCreator,
			diffViewProviderCreator,
			hostBridgeProvider,
			logToChannel,
			getCallbackUrl,
			getBinaryLocation,
			extensionFsPath,
			globalStorageFsPath,
			workspaceManager,
		)
		return HostProvider.instance
	}
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `HostProvider`가 `workspaceManager`를 관리하게 됩니다.
- `src/extension.ts`의 `setupHostProvider`에서 `HostProvider.initialize` 호출 시 인자가 부족하다는 새로운 에러가 발생할 것이며, 이는 다음 단계에서 해결합니다.
