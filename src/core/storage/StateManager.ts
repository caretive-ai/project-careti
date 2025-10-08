import { readTaskHistory, writeTaskHistory } from "@core/storage/disk"
import { CHAT_SETTINGS_KEY, GLOBAL_SETTINGS_KEY } from "@core/storage/state-keys"
import { stateMigrations } from "@core/storage/state-migrations"
import { ActiveTaskState, ChatSettings } from "@core/storage/state-types"
import { getTaskState, getTaskStateOrThrow, isAgentModel, isChatModel, isPlanModeModel } from "@core/storage/utils/state-helpers"
import { IHostProvider } from "@hosts/host-provider"
import { DEFAULT_AGENT_MODEL_ID, DEFAULT_PLAN_MODE_MODEL_ID } from "@services/completion"
import { ILogService } from "@services/log/log-service"
import { Logger } from "@services/logging/Logger"
import { ApiConfiguration, TaskHistory } from "@services/task"
import * as chokidar from "chokidar"
import { randomUUID } from "crypto"
import * as E from "fp-ts/lib/Either"

export class StateManager {
	private taskHistory: TaskHistory = {
		version: 2,
		tasks: {},
	}
	private taskHistoryWatcher: chokidar.FSWatcher | undefined

	constructor(
		private readonly hostProvider: IHostProvider,
		private readonly logService: ILogService,
	) {}

	public async initialize() {
		await this.loadTaskHistory()
		this.setupTaskHistoryWatcher()

		// CARET MODIFICATION: Ensure default provider is set on first run
		const chatSettings = await this.getChatSettings()
		if (!chatSettings.selectedProvider) {
			chatSettings.selectedProvider = "caret"
			await this.hostProvider.setWorkspaceState(CHAT_SETTINGS_KEY, chatSettings)
			Logger.info("[StateManager]  inaugural run, set selectedProvider to caret")
		}
	}

	public dispose() {
		this.taskHistoryWatcher?.close()
	}

	private async loadTaskHistory() {
		const result = await readTaskHistory(this.hostProvider)
		if (E.isLeft(result)) {
			this.logService.error(`Failed to read task history: ${result.left.message}`)
			return
		}

		if (result.right) {
			this.taskHistory = await stateMigrations(result.right, this.hostProvider)
		}
	}

	private setupTaskHistoryWatcher() {
		const storagePath = this.hostProvider.getStoragePath()
		if (!storagePath) {
			return
		}

		const taskHistoryPath = `${storagePath}/taskHistory.json`
		this.taskHistoryWatcher = chokidar
			.watch(taskHistoryPath, {
				ignoreInitial: true,
			})
			.on("change", async () => {
				this.logService.info("Task history file changed, reloading.")
				await this.loadTaskHistory()
			})
	}

	private async writeTaskHistory() {
		await writeTaskHistory(this.hostProvider, this.taskHistory)
	}

	public getTask(taskId: string) {
		return this.taskHistory.tasks[taskId]
	}

	public getTasks() {
		return this.taskHistory.tasks
	}

	public async upsertTask(task: ActiveTaskState) {
		this.taskHistory.tasks[task.id] = task
		await this.writeTaskHistory()
	}

	public async deleteTask(taskId: string) {
		delete this.taskHistory.tasks[taskId]
		await this.writeTaskHistory()
	}

	public async getChatSettings(): Promise<ChatSettings> {
		const chatSettings = (await this.hostProvider.getWorkspaceState(CHAT_SETTINGS_KEY)) ?? {}
		return chatSettings
	}

	public async getApiConfiguration(taskId?: string): Promise<ApiConfiguration> {
		const taskState = taskId ? getTaskState(this, taskId) : undefined
		const chatSettings = await this.getChatSettings()

		const agentModelId = taskState?.agentModelId ?? chatSettings.agentModelId ?? DEFAULT_AGENT_MODEL_ID
		const chatModelId = taskState?.chatModelId ?? chatSettings.chatModelId ?? DEFAULT_AGENT_MODEL_ID
		const planModeModelId = taskState?.planModeModelId ?? chatSettings.planModeModelId ?? DEFAULT_PLAN_MODE_MODEL_ID

		// CARET MODIFICATION: Add caretApiKey and planModeCaretModelId
		return {
			provider: chatSettings.selectedProvider,
			chatModelId,
			agentModelId,
			planModeModelId,
			planModeCaretModelId: chatSettings.planModeCaretModelId,
			apiKey: chatSettings.apiKey,
			apiHost: chatSettings.apiHost,
			caretApiKey: chatSettings.caretApiKey,
			maxTokens: chatSettings.maxTokens,
			temperature: chatSettings.temperature,
			topP: chatSettings.topP,
			topK: chatSettings.topK,
			stopSequences: chatSettings.stopSequences,
		}
	}

	public async setApiConfiguration(apiConfiguration: Partial<ApiConfiguration>, taskId?: string): Promise<void> {
		const chatSettings = await this.getChatSettings()
		const taskState = taskId ? getTaskStateOrThrow(this, taskId) : undefined

		const {
			provider,
			apiKey,
			apiHost,
			caretApiKey, // CARET MODIFICATION: Add caretApiKey
			maxTokens,
			temperature,
			topP,
			topK,
			stopSequences,
			...modelConfiguration
		} = apiConfiguration

		const newChatSettings: ChatSettings = {
			...chatSettings,
			selectedProvider: provider ?? chatSettings.selectedProvider,
			apiKey: apiKey ?? chatSettings.apiKey,
			apiHost: apiHost ?? chatSettings.apiHost,
			caretApiKey: caretApiKey ?? chatSettings.caretApiKey, // CARET MODIFICATION: Add caretApiKey
			maxTokens: maxTokens ?? chatSettings.maxTokens,
			temperature: temperature ?? chatSettings.temperature,
			topP: topP ?? chatSettings.topP,
			topK: topK ?? chatSettings.topK,
			stopSequences: stopSequences ?? chatSettings.stopSequences,
		}

		if (taskState) {
			if (isAgentModel(modelConfiguration)) {
				taskState.agentModelId = modelConfiguration.agentModelId
			}
			if (isChatModel(modelConfiguration)) {
				taskState.chatModelId = modelConfiguration.chatModelId
			}
			if (isPlanModeModel(modelConfiguration)) {
				taskState.planModeModelId = modelConfiguration.planModeModelId
			}
			// CARET MODIFICATION: Add planModeCaretModelId
			if (modelConfiguration.planModeCaretModelId) {
				newChatSettings.planModeCaretModelId = modelConfiguration.planModeCaretModelId
			}
		} else {
			if (isAgentModel(modelConfiguration)) {
				newChatSettings.agentModelId = modelConfiguration.agentModelId
			}
			if (isChatModel(modelConfiguration)) {
				newChatSettings.chatModelId = modelConfiguration.chatModelId
			}
			if (isPlanModeModel(modelConfiguration)) {
				newChatSettings.planModeModelId = modelConfiguration.planModeModelId
			}
			// CARET MODIFICATION: Add planModeCaretModelId
			if (modelConfiguration.planModeCaretModelId) {
				newChatSettings.planModeCaretModelId = modelConfiguration.planModeCaretModelId
			}
		}

		await this.hostProvider.setWorkspaceState(CHAT_SETTINGS_KEY, newChatSettings)
	}

	public async getGlobalSettings() {
		const globalSettings = (await this.hostProvider.getGlobalState(GLOBAL_SETTINGS_KEY)) ?? {}
		return globalSettings
	}

	public async setGlobalSettings(settings: Record<string, unknown>): Promise<void> {
		const globalSettings = await this.getGlobalSettings()
		await this.hostProvider.setGlobalState(GLOBAL_SETTINGS_KEY, {
			...globalSettings,
			...settings,
		})
	}

	public createNewTask(): ActiveTaskState {
		const taskId = randomUUID()
		return {
			id: taskId,
			status: "active",
			history: [],
			context: {
				selection: [],
				diagnostics: [],
				tabs: [],
				relativeFilePaths: [],
				depGraph: {
					root: "",
					files: {},
				},
			},
			input: "",
		}
	}
}
