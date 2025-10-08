# 작업 계획: `Controller`에 `WorkspaceRootManager` 통합

## 1. 목표
`Task` 생성자에 필수적인 `workspaceManager` 속성을 전달하기 위해, `src/core/controller/index.ts` 파일을 수정하여 `Controller` 클래스가 `WorkspaceRootManager`를 관리하고 전달하도록 구조를 변경한다.

## 2. 작업 단계

### Step 1: `WorkspaceRootManager` import 추가
- `Controller` 클래스가 `WorkspaceRootManager` 타입을 인식할 수 있도록 import 구문을 추가합니다.

### Step 2: `Controller` 클래스 속성 및 생성자 수정
- `workspaceManager` 속성을 클래스에 추가합니다.
- 생성자(constructor)가 `WorkspaceRootManager` 인스턴스를 인자로 받아서 클래스 속성에 할당하도록 수정합니다.

### Step 3: `new Task` 호출 수정
- `initTask` 메소드 내에서 `new Task`를 호출할 때, 새로 추가된 `this.workspaceManager`를 `TaskParams` 객체에 포함하여 전달합니다.

## 3. 실행할 명령어

```xml
<replace_in_file>
<path>src/core/controller/index.ts</path>
<diff>
------- SEARCH
import { PersistenceErrorEvent, StateManager } from "../storage/StateManager"
import { Task } from "../task"
import { sendMcpMarketplaceCatalogEvent } from "./mcp/subscribeToMcpMarketplaceCatalog"
=======
import { WorkspaceRootManager } from "@core/workspace/WorkspaceRootManager"
import { PersistenceErrorEvent, StateManager } from "../storage/StateManager"
import { Task } from "../task"
import { sendMcpMarketplaceCatalogEvent } from "./mcp/subscribeToMcpMarketplaceCatalog"
+++++++ REPLACE
------- SEARCH
	mcpHub: McpHub
	accountService: ClineAccountService
	authService: AuthService
	readonly stateManager: StateManager

	constructor(
		readonly context: vscode.ExtensionContext,
		id: string,
	) {
		this.id = id
=======
	mcpHub: McpHub
	accountService: ClineAccountService
	authService: AuthService
	readonly stateManager: StateManager
	workspaceManager: WorkspaceRootManager

	constructor(
		readonly context: vscode.ExtensionContext,
		id: string,
		workspaceManager: WorkspaceRootManager,
	) {
		this.id = id
		this.workspaceManager = workspaceManager
+++++++ REPLACE
------- SEARCH
		this.task = new Task({
			controller: this,
			mcpHub: this.mcpHub,
			updateTaskHistory: (historyItem) => this.updateTaskHistory(historyItem),
			postStateToWebview: () => this.postStateToWebview(),
			reinitExistingTaskFromId: (taskId) => this.reinitExistingTaskFromId(taskId),
			cancelTask: () => this.cancelTask(),
			shellIntegrationTimeout,
			terminalReuseEnabled: terminalReuseEnabled ?? true,
			terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
			defaultTerminalProfile: defaultTerminalProfile ?? "default",
			cwd: await getCwd(getDesktopDir()),
			stateManager: this.stateManager,
			task,
			images,
			files,
			historyItem,
			taskId: historyItem?.id ?? Date.now().toString(),
		})
=======
		this.task = new Task({
			controller: this,
			mcpHub: this.mcpHub,
			updateTaskHistory: (historyItem) => this.updateTaskHistory(historyItem),
			postStateToWebview: () => this.postStateToWebview(),
			reinitExistingTaskFromId: (taskId) => this.reinitExistingTaskFromId(taskId),
			cancelTask: () => this.cancelTask(),
			shellIntegrationTimeout,
			terminalReuseEnabled: terminalReuseEnabled ?? true,
			terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
			defaultTerminalProfile: defaultTerminalProfile ?? "default",
			cwd: await getCwd(getDesktopDir()),
			stateManager: this.stateManager,
			workspaceManager: this.workspaceManager,
			task,
			images,
			files,
			historyItem,
			taskId: historyItem?.id ?? Date.now().toString(),
		})
+++++++ REPLACE
</diff>
</replace_in_file>
```

## 4. 예상 결과
- `src/core/controller/index.ts` 파일의 `Task` 생성자 관련 타입 에러가 해결됩니다.
- `src/extension.ts`에서 `Controller` 생성자 호출 시 인자가 부족하다는 새로운 컴파일 에러가 발생할 것이며, 이는 다음 단계에서 해결합니다.
