// CARET MODIFICATION: Major overhaul to merge Cline's new service architecture (CacheService, AuthService)
// with Caret's features (Persona management, CaretAccountService, detailed logging, etc.).
import { clineEnvConfig } from "@/config"
import { HostProvider } from "@/hosts/host-provider"
import { AuthService } from "@/services/auth/AuthService"
import { telemetryService } from "@/services/posthog/telemetry/TelemetryService"
import { ShowMessageType } from "@shared/proto/host/window" // CARET MODIFICATION: Corrected import path
import { getCwd, getDesktopDir } from "@/utils/path"
import { Anthropic } from "@anthropic-ai/sdk"
import { buildApiHandler } from "@api/index"
import { cleanupLegacyCheckpoints } from "@integrations/checkpoints/CheckpointMigration"
import { downloadTask } from "@integrations/misc/export-markdown"
import WorkspaceTracker from "@integrations/workspace/WorkspaceTracker"
import { CaretAccountService } from "../../../caret-src/services/account/CaretAccountService" // CARET MODIFICATION
import { McpHub } from "@services/mcp/McpHub"
import { ApiProvider, ModelInfo, ApiConfiguration } from "@shared/api"
import { ChatContent } from "@shared/ChatContent"
import { ChatSettings, DEFAULT_CHAT_SETTINGS } from "@shared/ChatSettings" // CARET MODIFICATION
import { ClineRulesToggles } from "@shared/cline-rules"
import { ExtensionMessage, ExtensionState, Platform } from "@shared/ExtensionMessage"
import { HistoryItem } from "@shared/HistoryItem"
import { McpMarketplaceCatalog } from "@shared/mcp"
import { TelemetrySetting } from "@shared/TelemetrySetting"
import { UserInfo } from "@shared/UserInfo"
import { WebviewMessage } from "@shared/WebviewMessage"
import { fileExistsAtPath } from "@utils/fs"
import axios from "axios"
import fs from "fs/promises"
import { setTimeout as setTimeoutPromise } from "node:timers/promises"
import pWaitFor from "p-wait-for"
import * as path from "path"
import * as vscode from "vscode"
import { ensureMcpServersDirectoryExists, ensureSettingsDirectoryExists, GlobalFileNames } from "../storage/disk"
import {
	getAllExtensionState,
	getGlobalState,
	getSecret,
	getWorkspaceState,
	storeSecret,
	updateApiConfiguration,
	updateGlobalState,
	updateWorkspaceState,
} from "../storage/state"
import { CacheService, PersistenceErrorEvent } from "../storage/CacheService"
import { Task } from "../task"
import { handleGrpcRequest, handleGrpcRequestCancel } from "./grpc-handler"
import { sendMcpMarketplaceCatalogEvent } from "./mcp/subscribeToMcpMarketplaceCatalog"
import { sendStateUpdate } from "./state/subscribeToState"
import { sendAddToInputEvent } from "./ui/subscribeToAddToInput"
import { sendRelinquishControlEvent } from "./ui/subscribeToRelinquishControl"
import { getLatestAnnouncementId } from "@/utils/announcements"
import { updateRuleFileContent } from "../../../caret-src/core/updateRuleFileContent"
import { caretLogger } from "../../../caret-src/utils/caret-logger"

export class Controller {
	readonly id: string
	private postMessage: (message: ExtensionMessage) => Thenable<boolean> | undefined

	private disposables: vscode.Disposable[] = []
	task?: Task

	workspaceTracker: WorkspaceTracker
	mcpHub: McpHub
	accountService: CaretAccountService // CARET MODIFICATION
	readonly cacheService: CacheService

	constructor(
		readonly context: vscode.ExtensionContext,
		postMessage: (message: ExtensionMessage) => Thenable<boolean> | undefined,
		id: string,
	) {
		this.id = id
		caretLogger.info(`Controller constructor called. ID: ${this.id}`)
		HostProvider.get().logToChannel("CaretProvider instantiated")

		this.postMessage = postMessage
		this.cacheService = new CacheService(context)
		// CARET MODIFICATION: Instantiate CaretAccountService with dependencies
		this.accountService = new CaretAccountService(
			this.postMessageToWebview.bind(this),
			// Provide a function that retrieves the API key from the cache service.
			async () => this.cacheService.getSecretKey("caretApiKey"),
		)
		const authService = AuthService.getInstance(this)

		this.cacheService
			.initialize()
			.then(() => {
				authService.restoreRefreshTokenAndRetrieveAuthInfo()
			})
			.catch((error) => {
				console.error("CRITICAL: Failed to initialize CacheService - extension may not function properly:", error)
			})

		this.cacheService.onPersistenceError = async ({ error }: PersistenceErrorEvent) => {
			console.error("Cache persistence failed, recovering:", error)
			try {
				await this.cacheService.reInitialize()
				await this.postStateToWebview()
				HostProvider.window.showMessage({
					type: ShowMessageType.WINDOW_MESSAGE_WARNING,
					message: "Saving settings to storage failed.",
				})
			} catch (recoveryError) {
				console.error("Cache recovery failed:", recoveryError)
				HostProvider.window.showMessage({
					type: ShowMessageType.WINDOW_MESSAGE_ERROR,
					message: "Failed to save settings. Please restart the extension.",
				})
			}
		}

		this.workspaceTracker = new WorkspaceTracker()
		this.mcpHub = new McpHub(
			() => ensureMcpServersDirectoryExists(),
			() => ensureSettingsDirectoryExists(this.context),
			this.context.extension?.packageJSON?.version ?? "1.0.0",
		)

		cleanupLegacyCheckpoints(this.context.globalStorageUri.fsPath).catch((error) => {
			console.error("Failed to cleanup legacy checkpoints:", error)
		})
	}

	async getCurrentMode(): Promise<ChatSettings["mode"]> {
		const chatSettings = this.cacheService.getWorkspaceStateKey<ChatSettings>("chatSettings")
		return chatSettings?.mode || "agent"
	}

	async dispose() {
		await this.clearTask()
		while (this.disposables.length) {
			const x = this.disposables.pop()
			if (x) {
				x.dispose()
			}
		}
		this.workspaceTracker.dispose()
		this.mcpHub.dispose()
		console.error("Controller disposed")
	}

	async handleSignOut() {
		try {
			this.cacheService.setSecret("caretApiKey", undefined) // CARET MODIFICATION
			this.cacheService.setSecret("clineAccountId", undefined)
			await updateGlobalState(this.context, "userInfo", undefined)

			const apiConfiguration = this.cacheService.getApiConfiguration()
			const updatedConfig = {
				...apiConfiguration,
				apiProvider: "openrouter" as ApiProvider,
				caretApiKey: undefined,
			}
			this.cacheService.setApiConfiguration(updatedConfig)

			await this.postStateToWebview()
			HostProvider.window.showMessage({
				type: ShowMessageType.WINDOW_MESSAGE_INFORMATION,
				message: "Successfully logged out of Caret",
			})
		} catch (error) {
			HostProvider.window.showMessage({
				type: ShowMessageType.WINDOW_MESSAGE_INFORMATION,
				message: "Logout failed",
			})
		}
	}

	async setUserInfo(info?: UserInfo) {
		await updateGlobalState(this.context, "userInfo", info)
	}

	async initTask(task?: string, images?: string[], files?: string[], historyItem?: HistoryItem) {
		await this.clearTask()

		const apiConfiguration = this.cacheService.getApiConfiguration()
		const {
			autoApprovalSettings,
			browserSettings,
			chatSettings: rawChatSettings, // CARET MODIFICATION
			enableCheckpointsSetting,
			isNewUser,
			taskHistory,
			terminalOutputLineLimit,
			defaultTerminalProfile,
		} = await getAllExtensionState(this.context)

		// CARET MODIFICATION: Provide a default for chatSettings if it's not present, resolving a potential type error during merge.
		const chatSettings: ChatSettings = rawChatSettings ?? {
			mode: "agent",
			model: apiConfiguration.actModeApiModelId, // Use model from apiConfig as a sensible default
			temperature: 0.5,
			webSearch: false,
			modeSystem: "caret",
			preferredLanguage: "English",
			openAIReasoningEffort: "medium",
		}

		const NEW_USER_TASK_COUNT_THRESHOLD = 10
		if (isNewUser && !historyItem && taskHistory && taskHistory.length >= NEW_USER_TASK_COUNT_THRESHOLD) {
			await updateGlobalState(this.context, "isNewUser", false)
			await this.postStateToWebview()
		}

		if (autoApprovalSettings) {
			const updatedAutoApprovalSettings = {
				...autoApprovalSettings,
				version: (autoApprovalSettings.version ?? 1) + 1,
			}
			await updateGlobalState(this.context, "autoApprovalSettings", updatedAutoApprovalSettings)
		}

		this.task = new Task(
			this.context,
			this.mcpHub,
			this.workspaceTracker,
			(historyItem) => this.updateTaskHistory(historyItem),
			() => this.postStateToWebview(),
			(taskId) => this.reinitExistingTaskFromId(taskId),
			() => this.cancelTask(),
			apiConfiguration,
			autoApprovalSettings,
			browserSettings,
			chatSettings.preferredLanguage ?? "English",
			chatSettings.openAIReasoningEffort ?? "medium",
			chatSettings.mode,
			chatSettings, // CARET MODIFICATION
			false, // strictPlanModeEnabled - Caret에서는 사용하지 않으므로 기본값 false로 설정
			5000, // shellIntegrationTimeout - Caret에서는 사용하지 않으므로 기본값 설정
			true, // terminalReuseEnabled - Caret에서는 사용하지 않으므로 기본값 설정
			terminalOutputLineLimit ?? 500,
			defaultTerminalProfile ?? "default",
			enableCheckpointsSetting ?? true,
			await getCwd(getDesktopDir()),
			this.cacheService,
			task,
			images,
			files,
			historyItem,
		)
	}

	async reinitExistingTaskFromId(taskId: string) {
		const history = await this.getTaskWithId(taskId)
		if (history) {
			await this.initTask(undefined, undefined, undefined, history.historyItem)
		}
	}

	async postMessageToWebview(message: ExtensionMessage) {
		await this.postMessage(message)
	}

	async handleWebviewMessage(message: WebviewMessage) {
		switch (message.type) {
			case "setWelcomeContext":
				if (message.showWelcome !== undefined) {
					await vscode.commands.executeCommand("setContext", "caret.showWelcome", message.showWelcome)
				}
				break
			case "clearAllTaskHistory": {
				const answer = await vscode.window.showWarningMessage(
					"What would you like to delete?",
					{ modal: true },
					"Delete All Except Favorites",
					"Delete Everything",
					"Cancel",
				)
				if (answer === "Delete All Except Favorites") {
					// Implement logic
				} else if (answer === "Delete Everything") {
					// Implement logic
				}
				sendRelinquishControlEvent()
				break
			}
			case "grpc_request": {
				if (message.grpc_request) {
					await handleGrpcRequest(this, message.grpc_request)
				}
				break
			}
			case "grpc_request_cancel": {
				if (message.grpc_request_cancel) {
					await handleGrpcRequestCancel(this, message.grpc_request_cancel)
				}
				break
			}
			case "UPDATE_PERSONA_CUSTOM_INSTRUCTION": {
				if (message.payload?.personaInstruction) {
					const cwd = this.task ? this.task.getCwd() : await getCwd()
					await updateRuleFileContent({
						rulePath: "custom_instructions.md",
						isGlobal: true,
						content: JSON.stringify(message.payload.personaInstruction, null, 2),
						cwd,
					})
					if (message.payload?.avatarUri && message.payload?.thinkingAvatarUri) {
						const { saveCustomPersonaImage } = await import("../../../caret-src/utils/persona-storage")
						await saveCustomPersonaImage(this.context, "normal", message.payload.avatarUri)
						await saveCustomPersonaImage(this.context, "thinking", message.payload.thinkingAvatarUri)
						const { CaretProvider } = await import("../../../caret-src/core/webview/CaretProvider")
						CaretProvider.getInstance()?.notifyPersonaImagesChanged()
					}
					this.postMessageToWebview({ type: "PERSONA_UPDATED", payload: { success: true } })
					await this.postStateToWebview()
				}
				break
			}
			case "UPLOAD_CUSTOM_PERSONA_IMAGE": {
				if (message.payload?.imageType && message.payload?.imageData && message.payload?.personaCharacter) {
					try {
						const { saveCustomPersonaImage } = await import("../../../caret-src/utils/persona-storage")
						const savedImageUri = await saveCustomPersonaImage(
							this.context,
							message.payload.imageType,
							message.payload.imageData,
						)
						this.postMessageToWebview({
							type: "UPLOAD_CUSTOM_PERSONA_IMAGE_RESPONSE",
							payload: {
								success: true,
								savedPath: savedImageUri,
								imageType: message.payload.imageType,
								personaCharacter: message.payload.personaCharacter,
							},
						})
						const { CaretProvider } = await import("../../../caret-src/core/webview/CaretProvider")
						CaretProvider.getInstance()?.notifyPersonaImagesChanged()
						this.postMessageToWebview({ type: "PERSONA_UPDATED", payload: { success: true } })
					} catch (error) {
						this.postMessageToWebview({
							type: "UPLOAD_CUSTOM_PERSONA_IMAGE_RESPONSE",
							payload: {
								success: false,
								error: error instanceof Error ? error.message : "Unknown error",
								imageType: message.payload.imageType,
								personaCharacter: message.payload.personaCharacter,
							},
						})
					}
				}
				break
			}
			case "initializeDefaultPersona": {
				if (message.language) {
					const { PersonaInitializer } = await import("../../../caret-src/utils/persona-initializer")
					await new PersonaInitializer(this.context).initializeOnLanguageSet(message.language)
				}
				break
			}
			case "REQUEST_PERSONA_IMAGES": {
				const { loadPersonaImagesFromStorage } = await import("../../../caret-src/utils/persona-storage")
				const currentPersonaImages = await loadPersonaImagesFromStorage(this.context)
				this.postMessageToWebview({ type: "RESPONSE_PERSONA_IMAGES", payload: currentPersonaImages })
				break
			}
			case "REQUEST_TEMPLATE_CHARACTERS": {
				const templatePath = path.join(
					this.context.extensionPath,
					"caret-assets",
					"template_characters",
					"template_characters.json",
				)
				const templatesRaw = await fs.readFile(templatePath, "utf-8")
				const templates = JSON.parse(templatesRaw)
				const templatesWithBase64Images = await Promise.all(
					templates.map(async (template: any) => {
						const convertImageUri = async (uri: string): Promise<string> => {
							if (!uri || !uri.startsWith("asset:/assets/")) {
								return uri
							}
							const imagePath = path.join(
								this.context.extensionPath,
								"caret-assets",
								uri.replace("asset:/assets/", ""),
							)
							if (await fileExistsAtPath(imagePath)) {
								const imageBuffer = await fs.readFile(imagePath)
								const ext = path.extname(imagePath).toLowerCase()
								const mimeType =
									ext === ".png"
										? "image/png"
										: ext === ".jpg" || ext === ".jpeg"
											? "image/jpeg"
											: ext === ".webp"
												? "image/webp"
												: "image/png"
								return `data:${mimeType};base64,${imageBuffer.toString("base64")}`
							}
							return uri
						}
						return {
							...template,
							avatarUri: await convertImageUri(template.avatarUri),
							thinkingAvatarUri: await convertImageUri(template.thinkingAvatarUri),
							introIllustrationUri: await convertImageUri(template.introIllustrationUri),
						}
					}),
				)
				this.postMessageToWebview({ type: "RESPONSE_TEMPLATE_CHARACTERS", payload: templatesWithBase64Images })
				break
			}
			case "REQUEST_RULE_FILE_CONTENT": {
				const ruleName = message.payload?.ruleName
				if (!ruleName) {
					break
				}
				try {
					let ruleDir
					if (message.payload.isGlobal) {
						const { ensureRulesDirectoryExists } = await import("../storage/disk")
						ruleDir = await ensureRulesDirectoryExists()
					} else {
						const cwd = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
						if (!cwd) {
							break
						}
						ruleDir = path.join(cwd, ".clinerules")
						if (!(await fileExistsAtPath(ruleDir))) {
							await fs.mkdir(ruleDir, { recursive: true })
						}
					}
					const rulePath = path.join(ruleDir, ruleName)
					const content = await fs.readFile(rulePath, "utf-8")
					this.postMessageToWebview({ type: "RESPONSE_RULE_FILE_CONTENT", payload: { ruleName, content } })
				} catch (error) {
					if ((error as NodeJS.ErrnoException).code === "ENOENT") {
						this.postMessageToWebview({ type: "RESPONSE_RULE_FILE_CONTENT", payload: { ruleName, content: "" } })
					}
				}
				break
			}
			default: {
				console.error("Received unhandled WebviewMessage type:", JSON.stringify(message))
			}
		}
	}

	async updateTelemetrySetting(telemetrySetting: TelemetrySetting) {
		await updateGlobalState(this.context, "telemetrySetting", telemetrySetting)
		const isOptedIn = telemetrySetting !== "disabled"
		telemetryService.updateTelemetryState(isOptedIn)
		await this.postStateToWebview()
	}

	async toggleChatbotAgentModeWithChatSettings(chatSettings: ChatSettings, chatContent?: ChatContent) {
		const didSwitchToAgentMode = chatSettings.mode === "agent"
		telemetryService.captureModeSwitch(this.task?.taskId ?? "0", chatSettings.mode === "chatbot" ? "plan" : "act")

		this.cacheService.setWorkspaceState("chatSettings", chatSettings)
		if (this.task) {
			this.task.api = buildApiHandler(this.cacheService.getApiConfiguration(), chatSettings.mode)
		}

		await this.postStateToWebview()

		if (this.task) {
			this.task.chatSettings = chatSettings
			// CARET MODIFICATION: The original logic for plan/act mode switching was here.
			// It has been temporarily disabled because the required properties (`isAwaitingPlanResponse`,
			// `didRespondToPlanAskBySwitchingMode`) are not present in the merged Task class.
			// This functionality will be revisited.
			/*
			if (this.task.isAwaitingPlanResponse && didSwitchToAgentMode) {
				this.task.didRespondToPlanAskBySwitchingMode = true;
				await this.task.handleWebviewAskResponse(
					"messageResponse",
					chatContent?.message || "PLAN_MODE_TOGGLE_RESPONSE",
					chatContent?.images || [],
					chatContent?.files || []
				);
				return true;
			} else {
				this.cancelTask();
				return false;
			}
			*/
		}
		return false
	}

	async cancelTask() {
		if (this.task) {
			let historyItem: HistoryItem | undefined
			try {
				const taskData = await this.getTaskWithId(this.task.taskId)
				historyItem = taskData.historyItem
			} catch (error) {
				this.task = undefined
				await this.postStateToWebview()
				return
			}
			try {
				await this.task.abortTask()
			} catch (error) {
				console.error("Failed to abort task", error)
			}
			await pWaitFor(
				() =>
					this.task === undefined ||
					this.task.taskState.isStreaming === false ||
					this.task.taskState.didFinishAbortingStream ||
					this.task.taskState.isWaitingForFirstChunk,
				{ timeout: 3_000 },
			).catch(() => console.error("Failed to abort task"))
			if (this.task) {
				this.task.taskState.abandoned = true
			}
			if (historyItem) {
				await this.initTask(undefined, undefined, undefined, historyItem)
			} else {
				this.task = undefined
				await this.postStateToWebview()
			}
		}
	}

	async handleAuthCallback(customToken: string, provider: string | null = null) {
		try {
			await AuthService.getInstance(this).handleAuthCallback(customToken, provider ? provider : "google")
			const caretProvider: ApiProvider = "caret"
			const currentMode = await this.getCurrentMode()
			const currentApiConfiguration = this.cacheService.getApiConfiguration()
			const updatedConfig = { ...currentApiConfiguration, apiProvider: caretProvider }
			this.cacheService.setApiConfiguration(updatedConfig)
			// CARET MODIFICATION: Use CacheService to update global state
			this.cacheService.setGlobalState("welcomeViewCompleted", true)
			if (this.task) {
				this.task.api = buildApiHandler({ ...updatedConfig, taskId: this.task.taskId }, currentMode)
			}
			await this.postStateToWebview()
			// sendAccountButtonClickedEvent(this.id) // CARET MODIFICATION: Temporarily commented out.
		} catch (error) {
			console.error("Failed to handle auth callback:", error)
			HostProvider.window.showMessage({ type: ShowMessageType.WINDOW_MESSAGE_ERROR, message: "Failed to log in to Caret" })
		}
	}

	private async fetchMcpMarketplaceFromApi(silent: boolean = false): Promise<McpMarketplaceCatalog | undefined> {
		try {
			const response = await axios.get(`${process.env.AUTH0_AUDIENCE}/api/auth/mcp/marketplace`, {
				headers: { "Content-Type": "application/json" },
			})
			if (!response.data) {
				throw new Error("Invalid response from MCP marketplace API")
			}
			const catalog: McpMarketplaceCatalog = {
				items: (response.data || []).map((item: any) => ({
					...item,
					githubStars: item.githubStars ?? 0,
					downloadCount: item.downloadCount ?? 0,
					tags: item.tags ?? [],
				})),
			}
			await updateGlobalState(this.context, "mcpMarketplaceCatalog", catalog)
			return catalog
		} catch (error) {
			if (!silent) {
				const errorMessage = error instanceof Error ? error.message : "Failed to fetch MCP marketplace"
				HostProvider.window.showMessage({ type: ShowMessageType.WINDOW_MESSAGE_ERROR, message: errorMessage })
			}
			return undefined
		}
	}

	async silentlyRefreshMcpMarketplace() {
		try {
			const catalog = await this.fetchMcpMarketplaceFromApi(true)
			if (catalog) {
				await sendMcpMarketplaceCatalogEvent(catalog)
			}
		} catch (error) {
			console.error("Failed to silently refresh MCP marketplace:", error)
		}
	}

	async handleOpenRouterCallback(code: string) {
		let apiKey: string
		try {
			const response = await axios.post("https://openrouter.ai/api/v1/auth/keys", { code })
			if (response.data && response.data.key) {
				apiKey = response.data.key
			} else {
				throw new Error("Invalid response from OpenRouter API")
			}
		} catch (error) {
			console.error("Error exchanging code for API key:", error)
			throw error
		}
		const openrouter: ApiProvider = "openrouter"
		const currentMode = await this.getCurrentMode()
		const currentApiConfiguration = this.cacheService.getApiConfiguration()
		const updatedConfig = { ...currentApiConfiguration, apiProvider: openrouter, openRouterApiKey: apiKey }
		this.cacheService.setApiConfiguration(updatedConfig)
		await this.postStateToWebview()
		if (this.task) {
			this.task.api = buildApiHandler({ ...updatedConfig, taskId: this.task.taskId }, currentMode)
		}
	}

	async getFileMentionFromPath(filePath: string) {
		const cwd = await getCwd()
		if (!cwd) {
			return "@/" + filePath
		}
		const relativePath = path.relative(cwd, filePath)
		return "@/" + relativePath
	}

	async addSelectedCodeToChat(code: string, filePath: string, languageId: string, diagnostics?: vscode.Diagnostic[]) {
		await vscode.commands.executeCommand("caret.SidebarProvider.focus")
		await setTimeoutPromise(100)
		const fileMention = await this.getFileMentionFromPath(filePath)
		let input = `${fileMention}\n\`\`\`\n${code}\n\`\`\``
		if (diagnostics) {
			input += `\nProblems:\n${this.convertDiagnosticsToProblemsString(diagnostics)}`
		}
		await sendAddToInputEvent(input)
	}

	async addSelectedTerminalOutputToChat(output: string, terminalName: string) {
		await vscode.commands.executeCommand("caret.SidebarProvider.focus")
		await setTimeoutPromise(100)
		await sendAddToInputEvent(`Terminal output:\n\`\`\`\n${output}\n\`\`\``)
	}

	async fixWithCline(code: string, filePath: string, languageId: string, diagnostics: vscode.Diagnostic[]) {
		await vscode.commands.executeCommand("caret.SidebarProvider.focus")
		await setTimeoutPromise(100)
		const fileMention = await this.getFileMentionFromPath(filePath)
		const problemsString = this.convertDiagnosticsToProblemsString(diagnostics)
		await this.initTask(`Fix the following code in ${fileMention}\n\`\`\`\n${code}\n\`\`\`\n\nProblems:\n${problemsString}`)
	}

	convertDiagnosticsToProblemsString(diagnostics: vscode.Diagnostic[]) {
		let problemsString = ""
		for (const diagnostic of diagnostics) {
			let label: string
			switch (diagnostic.severity) {
				case vscode.DiagnosticSeverity.Error:
					label = "Error"
					break
				case vscode.DiagnosticSeverity.Warning:
					label = "Warning"
					break
				case vscode.DiagnosticSeverity.Information:
					label = "Information"
					break
				case vscode.DiagnosticSeverity.Hint:
					label = "Hint"
					break
				default:
					label = "Diagnostic"
			}
			const line = diagnostic.range.start.line + 1
			const source = diagnostic.source ? `${diagnostic.source} ` : ""
			problemsString += `\n- [${source}${label}] Line ${line}: ${diagnostic.message}`
		}
		return problemsString.trim()
	}

	async getTaskWithId(id: string): Promise<{
		historyItem: HistoryItem
		taskDirPath: string
		apiConversationHistoryFilePath: string
		uiMessagesFilePath: string
		contextHistoryFilePath: string
		taskMetadataFilePath: string
		apiConversationHistory: Anthropic.MessageParam[]
	}> {
		const history = ((await getGlobalState(this.context, "taskHistory")) as HistoryItem[] | undefined) || []
		const historyItem = history.find((item) => item.id === id)
		if (historyItem) {
			const taskDirPath = path.join(this.context.globalStorageUri.fsPath, "tasks", id)
			const apiConversationHistoryFilePath = path.join(taskDirPath, GlobalFileNames.apiConversationHistory)
			const uiMessagesFilePath = path.join(taskDirPath, GlobalFileNames.uiMessages)
			const contextHistoryFilePath = path.join(taskDirPath, GlobalFileNames.contextHistory)
			const taskMetadataFilePath = path.join(taskDirPath, GlobalFileNames.taskMetadata)
			if (await fileExistsAtPath(apiConversationHistoryFilePath)) {
				const apiConversationHistory = JSON.parse(await fs.readFile(apiConversationHistoryFilePath, "utf-8"))
				return {
					historyItem,
					taskDirPath,
					apiConversationHistoryFilePath,
					uiMessagesFilePath,
					contextHistoryFilePath,
					taskMetadataFilePath,
					apiConversationHistory,
				}
			}
		}
		await this.deleteTaskFromState(id)
		throw new Error("Task not found")
	}

	async exportTaskWithId(id: string) {
		const { historyItem, apiConversationHistory } = await this.getTaskWithId(id)
		await downloadTask(historyItem.ts, apiConversationHistory)
	}

	async deleteTaskFromState(id: string) {
		const taskHistory = ((await getGlobalState(this.context, "taskHistory")) as HistoryItem[]) || []
		const updatedTaskHistory = taskHistory.filter((task) => task.id !== id)
		await updateGlobalState(this.context, "taskHistory", updatedTaskHistory)
		await this.postStateToWebview()
		return updatedTaskHistory
	}

	async postStateToWebview() {
		const state = await this.getStateToPostToWebview()
		const chatSettings = this.cacheService.getWorkspaceStateKey<ChatSettings>("chatSettings")
		caretLogger.info(`📡 [WEBVIEW-SEND] Sending state to webview - chatSettings.mode=${chatSettings?.mode}`, "STATE")
		await sendStateUpdate(this.id, state)
	}

	async getStateToPostToWebview(): Promise<ExtensionState> {
		const apiConfiguration = this.cacheService.getApiConfiguration()
		const chatSettings = this.cacheService.getWorkspaceStateKey<ChatSettings>("chatSettings")
		const {
			lastShownAnnouncementId,
			taskHistory,
			autoApprovalSettings,
			browserSettings,
			userInfo,
			mcpMarketplaceEnabled,
			mcpDisplayMode,
			telemetrySetting,
			enableCheckpointsSetting,
			globalClineRulesToggles,
			globalWorkflowToggles,
			isNewUser,
			welcomeViewCompleted,
			mcpResponsesCollapsed,
			terminalOutputLineLimit,
			plan,
			isPayAsYouGo,
			localClineRulesToggles,
			localCaretRulesToggles, // CARET MODIFICATION
			localWindsurfRulesToggles,
			localCursorRulesToggles,
			localWorkflowToggles,
			mode,
			planActSeparateModelsSetting,
			shellIntegrationTimeout,
			strictPlanModeEnabled,
		} = await getAllExtensionState(this.context)

		const currentTaskItem = this.task?.taskId
			? (taskHistory || []).find((item: HistoryItem) => item.id === this.task?.taskId)
			: undefined
		const checkpointTrackerErrorMessage = this.task?.taskState.checkpointTrackerErrorMessage
		const clineMessages = this.task?.messageStateHandler.getClineMessages() || []
		const processedTaskHistory = (taskHistory || [])
			.filter((item: HistoryItem) => item.ts && item.task)
			.sort((a: HistoryItem, b: HistoryItem) => b.ts - a.ts)
			.slice(0, 100)
		const latestAnnouncementId = getLatestAnnouncementId(this.context)
		const shouldShowAnnouncement = lastShownAnnouncementId !== latestAnnouncementId
		const platform = process.platform as Platform
		const distinctId = telemetryService.distinctId
		const version = this.context.extension?.packageJSON?.version ?? ""
		const uriScheme = vscode.env.uriScheme

		return {
			version,
			apiConfiguration,
			chatSettings: chatSettings ?? undefined,
			uriScheme,
			currentTaskItem,
			checkpointTrackerErrorMessage,
			clineMessages,
			taskHistory: processedTaskHistory,
			shouldShowAnnouncement,
			platform,
			autoApprovalSettings,
			browserSettings,
			userInfo,
			mcpMarketplaceEnabled,
			mcpDisplayMode,
			telemetrySetting,
			enableCheckpointsSetting: enableCheckpointsSetting ?? true,
			distinctId,
			globalClineRulesToggles: globalClineRulesToggles || {},
			localClineRulesToggles: localClineRulesToggles || {},
			localCaretRulesToggles: localCaretRulesToggles || {}, // CARET MODIFICATION
			localWindsurfRulesToggles: localWindsurfRulesToggles || {},
			localCursorRulesToggles: localCursorRulesToggles || {},
			localWorkflowToggles: localWorkflowToggles || {},
			globalWorkflowToggles: globalWorkflowToggles || {},
			isNewUser,
			welcomeViewCompleted: welcomeViewCompleted as boolean,
			mcpResponsesCollapsed,
			terminalOutputLineLimit,
			plan,
			isPayAsYouGo,
			mode,
			planActSeparateModelsSetting,
			shellIntegrationTimeout,
			uiLanguage: chatSettings?.uiLanguage ?? DEFAULT_CHAT_SETTINGS.uiLanguage!,
			preferredLanguage: chatSettings?.preferredLanguage ?? DEFAULT_CHAT_SETTINGS.preferredLanguage!,
			openaiReasoningEffort: chatSettings?.openAIReasoningEffort ?? DEFAULT_CHAT_SETTINGS.openAIReasoningEffort!,
			strictPlanModeEnabled,
		}
	}

	async clearTask() {
		if (this.task) {
		}
		await this.task?.abortTask()
		this.task = undefined
	}

	async updateTaskHistory(item: HistoryItem): Promise<HistoryItem[]> {
		const history = ((await getGlobalState(this.context, "taskHistory")) as HistoryItem[]) || []
		const existingItemIndex = history.findIndex((h) => h.id === item.id)
		if (existingItemIndex !== -1) {
			history[existingItemIndex] = item
		} else {
			history.push(item)
		}
		await updateGlobalState(this.context, "taskHistory", history)
		return history
	}
}
