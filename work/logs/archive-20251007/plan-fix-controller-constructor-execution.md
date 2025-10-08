# 작업 계획: `Controller`의 `Task` 생성자 호출 방식 수정 실행

## 1. 목표

`src/core/controller/index.ts` 파일의 `initTask` 메소드 내에서 `new Task(...)` 생성자 호출을 Cline의 새로운 `TaskParams` 객체 형식으로 수정합니다.

## 2. 실행할 명령어

```xml
<replace_in_file>
<path>src/core/controller/index.ts</path>
<diff>
------- SEARCH
		this.task = new Task(
			this,
			this.mcpHub,
			(historyItem) => this.updateTaskHistory(historyItem),
			() => this.postStateToWebview(),
			(taskId) => this.reinitExistingTaskFromId(taskId),
			() => this.cancelTask(),
			shellIntegrationTimeout,
			terminalReuseEnabled ?? true,
			terminalOutputLineLimit ?? 500,
			defaultTerminalProfile ?? "default",
			await getCwd(getDesktopDir()),
			this.stateManager,
			task,
			images,
			files,
			historyItem,
			historyItem?.id ?? Date.now().toString(),
			apiConfiguration,
			autoApprovalSettings,
			browserSettings,
			effectiveFocusChainSettings,
			preferredLanguage,
			openaiReasoningEffort,
			mode,
			strictPlanModeEnabled,
			useAutoCondense,
			enableCheckpointsSetting ?? true,
		)
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

## 3. 예상 결과

- `src/core/controller/index.ts` 파일의 `new Task(...)` 호출이 `TaskParams` 객체를 사용하는 방식으로 변경됩니다.
- `npm run compile` 실행 시, `Expected 1 arguments, but got 26.` 에러가 해결됩니다.
