// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { DIFF_VIEW_URI_SCHEME } from "@hosts/vscode/VscodeDiffViewProvider"
import { WebviewProviderType as WebviewProviderTypeEnum } from "@shared/proto/cline/ui"
import assert from "node:assert"
import { setTimeout as setTimeoutPromise } from "node:timers/promises"
import pWaitFor from "p-wait-for"
import { v4 as uuidv4 } from "uuid"
import * as vscode from "vscode"
import { sendAccountButtonClickedEvent } from "./core/controller/ui/subscribeToAccountButtonClicked"
import { sendChatButtonClickedEvent } from "./core/controller/ui/subscribeToChatButtonClicked"
import { sendHistoryButtonClickedEvent } from "./core/controller/ui/subscribeToHistoryButtonClicked"
import { sendMcpButtonClickedEvent } from "./core/controller/ui/subscribeToMcpButtonClicked"
import { sendSettingsButtonClickedEvent } from "./core/controller/ui/subscribeToSettingsButtonClicked"
import {
	migrateCustomInstructionsToGlobalRules,
	migrateWelcomeViewCompleted,
	migrateWorkspaceToGlobalStorage,
} from "./core/storage/state-migrations"
import { WebviewProvider } from "./core/webview"
import { createClineAPI } from "./exports"
import { ErrorService } from "./services/error/ErrorService"
import { Logger } from "./services/logging/Logger"
import { posthogClientProvider } from "./services/posthog/PostHogClientProvider"
import { telemetryService } from "./services/posthog/telemetry/TelemetryService"
import { cleanupTestMode, initializeTestMode } from "./services/test/TestMode"
import { WebviewProviderType } from "./shared/webview/types"
import "./utils/path" // necessary to have access to String.prototype.toPosix

import { HostProvider } from "@/hosts/host-provider"
import { vscodeHostBridgeClient } from "@/hosts/vscode/hostbridge/client/host-grpc-client"
import { readTextFromClipboard, writeTextToClipboard } from "@/utils/env"
import { ExtensionContext } from "vscode"
import { FileContextTracker } from "./core/context/context-tracking/FileContextTracker"
import { sendFocusChatInputEvent } from "./core/controller/ui/subscribeToFocusChatInput"
import { VscodeDiffViewProvider } from "./hosts/vscode/VscodeDiffViewProvider"
import { VscodeWebviewProvider } from "./hosts/vscode/VscodeWebviewProvider"
import { GitCommitGenerator } from "./integrations/git/commit-message-generator"
import { AuthService } from "./services/auth/AuthService"
import { ShowMessageType } from "./shared/proto/host/window"
import { SharedUriHandler } from "./services/uri/SharedUriHandler"
import { getLatestAnnouncementId } from "./utils/announcements"

// CARET MODIFICATION: IS_DEV 변?��? ?�로 ?�동 (undefined ?�러 방�?)
const IS_DEV = process.env.IS_DEV
const DEV_WORKSPACE_FOLDER = process.env.DEV_WORKSPACE_FOLDER

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	maybeSetupHostProviders(context)

	ErrorService.initialize()
	Logger.log("Caret extension activated")

	// Migrate custom instructions to global Cline rules (one-time cleanup)
	await migrateCustomInstructionsToGlobalRules(context)

	// Migrate welcomeViewCompleted setting based on existing API keys (one-time cleanup)
	await migrateWelcomeViewCompleted(context)

	// Migrate workspace storage values back to global storage (reverting previous migration)
	await migrateWorkspaceToGlobalStorage(context)

	// Clean up orphaned file context warnings (startup cleanup)
	await FileContextTracker.cleanupOrphanedWarnings(context)

	// CARET MODIFICATION: Initialize persona storage system (globalStorage-based)
	try {
		const { initializeDefaultPersonaImages } = await import("../caret-src/utils/persona-storage")
		await initializeDefaultPersonaImages(context)
		Logger.log("Persona storage system initialized successfully")
	} catch (error) {
		Logger.log(`Failed to initialize persona storage system: ${error}`)
	}

	// CARET MODIFICATION: modeSystem ?�드?????�키마에 ?�음. 기존 마이그레?�션 로직 간소??
	try {
		const { getAllExtensionState, updateWorkspaceState } = await import("./core/storage/state")
		const currentState = await getAllExtensionState(context)
		if (currentState?.chatSettings?.mode !== "agent") {
			const updatedChatSettings = {
				...currentState.chatSettings,
				mode: "agent" as const,
			}
			await updateWorkspaceState(context, "chatSettings", updatedChatSettings)
			Logger.log("Chat mode normalized to 'agent' on activation")
		}
	} catch (error) {
		Logger.log(`Failed to normalize chat mode: ${error}`)
	}

	// Version checking for autoupdate notification
	const currentVersion = context.extension.packageJSON.version
	const previousVersion = context.globalState.get<string>("clineVersion")
	const sidebarWebview = HostProvider.get().createWebviewProvider(WebviewProviderType.SIDEBAR)

	const testModeWatchers = await initializeTestMode(sidebarWebview)
	// Initialize test mode and add disposables to context
	context.subscriptions.push(...testModeWatchers)

	vscode.commands.executeCommand("setContext", "caret.isDevMode", IS_DEV && IS_DEV === "true")

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebviewProvider.sideBarId, sidebarWebview, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	// Perform post-update actions if necessary
	try {
		if (!previousVersion || currentVersion !== previousVersion) {
			Logger.log(`Caret version changed: ${previousVersion} -> ${currentVersion}. First run or update detected.`)

			// Use the same condition as announcements: focus when there's a new announcement to show
			const lastShownAnnouncementId = context.globalState.get<string>("lastShownAnnouncementId")
			const latestAnnouncementId = getLatestAnnouncementId(context)

			if (lastShownAnnouncementId !== latestAnnouncementId) {
				// Focus Caret when there's a new announcement to show (major/minor updates or fresh installs)
				const message = previousVersion
					? `Caret has been updated to v${currentVersion}`
					: `Welcome to Caret v${currentVersion}`
				await vscode.commands.executeCommand("caret.SidebarProvider.focus")
				await new Promise((resolve) => setTimeout(resolve, 200))
				HostProvider.window.showMessage({ type: ShowMessageType.INFORMATION, message })
			}
			// Always update the main version tracker for the next launch.
			await context.globalState.update("clineVersion", currentVersion)
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error)
		console.error(`Error during post-update actions: ${errorMessage}, Stack trace: ${error.stack}`)
	}

	// backup id in case vscMachineID doesn't work
	let installId = context.globalState.get<string>("installId")

	if (!installId) {
		installId = uuidv4()
		await context.globalState.update("installId", installId)
	}

	telemetryService.captureExtensionActivated(installId)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.plusButtonClicked", async (webview: any) => {
			// Pass the webview type to the event sender
			const isSidebar = !webview

			const openChat = async (instance: WebviewProvider) => {
				await instance?.controller.clearTask()
				await instance?.controller.postStateToWebview()
				await sendChatButtonClickedEvent(instance.controller.id)
			}

			if (isSidebar) {
				const sidebarInstance = WebviewProvider.getSidebarInstance()
				if (sidebarInstance) {
					openChat(sidebarInstance)
					// Send event to the sidebar instance
				}
			} else {
				const tabInstances = WebviewProvider.getTabInstances()
				for (const instance of tabInstances) {
					openChat(instance)
				}
			}
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.mcpButtonClicked", (webview: any) => {
			const activeInstance = WebviewProvider.getActiveInstance()
			const isSidebar = !webview

			if (isSidebar) {
				const sidebarInstance = WebviewProvider.getSidebarInstance()
				const sidebarInstanceId = sidebarInstance?.getClientId()
				if (sidebarInstanceId) {
					sendMcpButtonClickedEvent(sidebarInstanceId)
				} else {
					console.error("[DEBUG] No sidebar instance found, cannot send MCP button event")
				}
			} else {
				const activeInstanceId = activeInstance?.getClientId()
				if (activeInstanceId) {
					sendMcpButtonClickedEvent(activeInstanceId)
				} else {
					console.error("[DEBUG] No active instance found, cannot send MCP button event")
				}
			}
		}),
	)

	const openCaretInNewTab = async () => {
		Logger.log("Opening Caret in new tab")
		const tabWebview = HostProvider.get().createWebviewProvider(WebviewProviderType.TAB)
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(WebviewProvider.tabPanelId, "Caret", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [context.extensionUri],
		})

		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_light.png"),
			dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "robot_panel_dark.png"),
		}
		tabWebview.resolveWebviewView(panel)

		await setTimeoutPromise(100)
		await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
	}

	context.subscriptions.push(vscode.commands.registerCommand("caret.popoutButtonClicked", openCaretInNewTab))
	context.subscriptions.push(vscode.commands.registerCommand("caret.openInNewTab", openCaretInNewTab))

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.settingsButtonClicked", (webview: any) => {
			const isSidebar = !webview
			const webviewType = isSidebar ? WebviewProviderTypeEnum.SIDEBAR : WebviewProviderTypeEnum.TAB

			sendSettingsButtonClickedEvent(webviewType)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.historyButtonClicked", async (webview: any) => {
			const isSidebar = !webview
			const webviewType = isSidebar ? WebviewProviderTypeEnum.SIDEBAR : WebviewProviderTypeEnum.TAB
			await sendHistoryButtonClickedEvent(webviewType)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.accountButtonClicked", (webview: any) => {
			const isSidebar = !webview
			if (isSidebar) {
				const sidebarInstance = WebviewProvider.getSidebarInstance()
				if (sidebarInstance) {
					sendAccountButtonClickedEvent(sidebarInstance.controller.id)
				}
			} else {
				const tabInstances = WebviewProvider.getTabInstances()
				for (const instance of tabInstances) {
					sendAccountButtonClickedEvent(instance.controller.id)
				}
			}
		}),
	)

	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider))

	const handleUri = async (uri: vscode.Uri) => {
		const success = await SharedUriHandler.handleUri(uri)
		if (!success) {
			console.warn("Extension URI handler: Failed to process URI:", uri.toString())
		}
	}
	// CARET MODIFICATION: URI Handler is now handled by caret-src/extension.ts to avoid conflicts
	// context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))

	// Register size testing commands in development mode
	if (IS_DEV && IS_DEV === "true") {
		import("./dev/commands/tasks")
			.then((module) => {
				const devTaskCommands = module.registerTaskCommands(context, sidebarWebview.controller)
				context.subscriptions.push(...devTaskCommands)
				Logger.log("Caret dev task commands registered")
			})
			.catch((error) => {
				Logger.log("Failed to register dev task commands: " + error)
			})
	}

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.addToChat", async (range?: vscode.Range, diagnostics?: vscode.Diagnostic[]) => {
			await vscode.commands.executeCommand("caret.focusChatInput")
			await pWaitFor(() => !!WebviewProvider.getVisibleInstance())
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}

			const textRange = range instanceof vscode.Range ? range : editor.selection
			const selectedText = editor.document.getText(textRange)

			if (!selectedText) {
				return
			}

			const filePath = editor.document.uri.fsPath
			const languageId = editor.document.languageId

			const visibleWebview = WebviewProvider.getVisibleInstance()
			await visibleWebview?.controller.addSelectedCodeToChat(
				selectedText,
				filePath,
				languageId,
				Array.isArray(diagnostics) ? diagnostics : undefined,
			)
			telemetryService.captureButtonClick("codeAction_addToChat", visibleWebview?.controller.task?.taskId)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.addTerminalOutputToChat", async () => {
			const terminal = vscode.window.activeTerminal
			if (!terminal) {
				return
			}

			const tempCopyBuffer = await readTextFromClipboard()

			try {
				await vscode.commands.executeCommand("workbench.action.terminal.copySelection")
				let terminalContents = (await readTextFromClipboard()).trim()
				await writeTextToClipboard(tempCopyBuffer)

				if (!terminalContents) {
					return
				}

				const visibleWebview = WebviewProvider.getVisibleInstance()
				await visibleWebview?.controller.addSelectedTerminalOutputToChat(terminalContents, terminal.name)
			} catch (error) {
				await writeTextToClipboard(tempCopyBuffer)
				console.error("Error getting terminal contents:", error)
				HostProvider.window.showMessage({
					type: ShowMessageType.ERROR,
					message: "Failed to get terminal contents",
				})
			}
		}),
	)

	const CONTEXT_LINES_TO_EXPAND = 3
	const START_OF_LINE_CHAR_INDEX = 0
	const LINE_COUNT_ADJUSTMENT_FOR_ZERO_INDEXING = 1

	context.subscriptions.push(
		vscode.languages.registerCodeActionsProvider(
			"*",
			new (class implements vscode.CodeActionProvider {
				public static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor]

				provideCodeActions(
					document: vscode.TextDocument,
					range: vscode.Range,
					context: vscode.CodeActionContext,
				): vscode.CodeAction[] {
					const actions: vscode.CodeAction[] = []
					const editor = vscode.window.activeTextEditor

					const selection = editor?.selection
					let expandedRange = range
					if (
						editor &&
						selection &&
						!selection.isEmpty &&
						selection.contains(range.start) &&
						selection.contains(range.end)
					) {
						expandedRange = selection
					} else {
						expandedRange = new vscode.Range(
							Math.max(0, range.start.line - CONTEXT_LINES_TO_EXPAND),
							START_OF_LINE_CHAR_INDEX,
							Math.min(
								document.lineCount - LINE_COUNT_ADJUSTMENT_FOR_ZERO_INDEXING,
								range.end.line + CONTEXT_LINES_TO_EXPAND,
							),
							document.lineAt(
								Math.min(
									document.lineCount - LINE_COUNT_ADJUSTMENT_FOR_ZERO_INDEXING,
									range.end.line + CONTEXT_LINES_TO_EXPAND,
								),
							).text.length,
						)
					}

					const addAction = new vscode.CodeAction("Add to Caret", vscode.CodeActionKind.QuickFix)
					addAction.command = {
						command: "caret.addToChat",
						title: "Add to Caret",
						arguments: [expandedRange, context.diagnostics],
					}
					actions.push(addAction)

					const explainAction = new vscode.CodeAction("Explain with Caret", vscode.CodeActionKind.RefactorExtract)
					explainAction.command = {
						command: "caret.explainCode",
						title: "Explain with Caret",
						arguments: [expandedRange],
					}
					actions.push(explainAction)

					const improveAction = new vscode.CodeAction("Improve with Caret", vscode.CodeActionKind.RefactorRewrite)
					improveAction.command = {
						command: "caret.improveCode",
						title: "Improve with Caret",
						arguments: [expandedRange],
					}
					actions.push(improveAction)

					if (context.diagnostics.length > 0) {
						const fixAction = new vscode.CodeAction("Fix with Caret", vscode.CodeActionKind.QuickFix)
						fixAction.isPreferred = true
						fixAction.command = {
							command: "caret.fixWithCline",
							title: "Fix with Caret",
							arguments: [expandedRange, context.diagnostics],
						}
						actions.push(fixAction)
					}
					return actions
				}
			})(),
			{
				providedCodeActionKinds: [
					vscode.CodeActionKind.QuickFix,
					vscode.CodeActionKind.RefactorExtract,
					vscode.CodeActionKind.RefactorRewrite,
				],
			},
		),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.fixWithCline", async (range: vscode.Range, diagnostics: vscode.Diagnostic[]) => {
			await vscode.commands.executeCommand("caret.focusChatInput")
			await pWaitFor(() => !!WebviewProvider.getVisibleInstance())
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}

			const selectedText = editor.document.getText(range)
			const filePath = editor.document.uri.fsPath
			const languageId = editor.document.languageId

			const visibleWebview = WebviewProvider.getVisibleInstance()
			await visibleWebview?.controller.fixWithCline(selectedText, filePath, languageId, diagnostics)
			telemetryService.captureButtonClick("codeAction_fixWithCline", visibleWebview?.controller.task?.taskId)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.explainCode", async (range: vscode.Range) => {
			await vscode.commands.executeCommand("caret.focusChatInput")
			await pWaitFor(() => !!WebviewProvider.getVisibleInstance())
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			const selectedText = editor.document.getText(range)
			if (!selectedText.trim()) {
				HostProvider.window.showMessage({
					type: ShowMessageType.INFORMATION,
					message: "Please select some code to explain.",
				})
				return
			}
			const filePath = editor.document.uri.fsPath
			const visibleWebview = WebviewProvider.getVisibleInstance()
			const fileMention = visibleWebview?.controller.getFileMentionFromPath(filePath) || filePath
			const prompt = `Explain the following code from ${fileMention}:\n\`\`\`${editor.document.languageId}\n${selectedText}\n\`\`\``
			await visibleWebview?.controller.initTask(prompt)
			telemetryService.captureButtonClick("codeAction_explainCode", visibleWebview?.controller.task?.taskId)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.improveCode", async (range: vscode.Range) => {
			await vscode.commands.executeCommand("caret.focusChatInput")
			await pWaitFor(() => !!WebviewProvider.getVisibleInstance())
			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}
			const selectedText = editor.document.getText(range)
			if (!selectedText.trim()) {
				HostProvider.window.showMessage({
					type: ShowMessageType.INFORMATION,
					message: "Please select some code to improve.",
				})
				return
			}
			const filePath = editor.document.uri.fsPath
			const visibleWebview = WebviewProvider.getVisibleInstance()
			const fileMention = visibleWebview?.controller.getFileMentionFromPath(filePath) || filePath
			const prompt = `Improve the following code from ${fileMention} (e.g., suggest refactorings, optimizations, or better practices):\n\`\`\`${editor.document.languageId}\n${selectedText}\n\`\`\``
			await visibleWebview?.controller.initTask(prompt)
			telemetryService.captureButtonClick("codeAction_improveCode", visibleWebview?.controller.task?.taskId)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.focusChatInput", async () => {
			let activeWebviewProvider: WebviewProvider | undefined = WebviewProvider.getVisibleInstance()

			const webview = activeWebviewProvider?.getWebview()
			if (webview && webview.hasOwnProperty("reveal")) {
				const panelView = webview as vscode.WebviewPanel
				panelView.reveal(panelView.viewColumn)
			} else if (!activeWebviewProvider) {
				await vscode.commands.executeCommand("caret.SidebarProvider.focus")
				await new Promise((resolve) => setTimeout(resolve, 200))
				activeWebviewProvider = WebviewProvider.getSidebarInstance()

				if (!activeWebviewProvider) {
					const tabInstances = WebviewProvider.getTabInstances()
					if (tabInstances.length > 0) {
						const potentialTabInstance = tabInstances[tabInstances.length - 1]
						const tabWebview = potentialTabInstance.getWebview()
						if (tabWebview && tabWebview.hasOwnProperty("reveal")) {
							const panelView = tabWebview as vscode.WebviewPanel
							panelView.reveal(panelView.viewColumn)
							activeWebviewProvider = potentialTabInstance
						}
					}
				}

				if (!activeWebviewProvider) {
					await vscode.commands.executeCommand("caret.openInNewTab")
					await pWaitFor(
						() => {
							const visibleInstance = WebviewProvider.getVisibleInstance()
							const webview = visibleInstance?.getWebview()
							return !!(webview && webview.hasOwnProperty("reveal"))
						},
						{ timeout: 2000 },
					)
					activeWebviewProvider = WebviewProvider.getVisibleInstance()
				}
			}
			if (activeWebviewProvider) {
				const clientId = activeWebviewProvider.getClientId()
				sendFocusChatInputEvent(clientId)
			} else {
				console.error("FocusChatInput: Could not find or activate a Careet webview to focus.")
				HostProvider.window.showMessage({
					type: ShowMessageType.ERROR,
					message: "Could not activate Caret view. Please try opening it manually from the Activity Bar.",
				})
			}
			telemetryService.captureButtonClick("command_focusChatInput", activeWebviewProvider?.controller.task?.taskId)
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.openWalkthrough", async () => {
			// Assuming the extension ID is 'aicoding.caret' from package.json
			await vscode.commands.executeCommand("workbench.action.openWalkthrough", "aicoding.caret#CaretWalkthrough")
			telemetryService.captureButtonClick("command_openWalkthrough")
		}),
	)

	context.subscriptions.push(
		vscode.commands.registerCommand("caret.generateGitCommitMessage", async (scm) => {
			await GitCommitGenerator?.generate?.(context, scm)
		}),
		vscode.commands.registerCommand("caret.abortGitCommitMessage", () => {
			GitCommitGenerator?.abort?.()
		}),
	)

	context.subscriptions.push(
		context.secrets.onDidChange(async (event) => {
			if (event.key === "clineAccountId") {
				const secretValue = await context.secrets.get("clineAccountId")
				const activeWebviewProvider = WebviewProvider.getVisibleInstance()
				const controller = activeWebviewProvider?.controller

				const authService = AuthService.getInstance(controller)
				if (secretValue) {
					authService?.restoreRefreshTokenAndRetrieveAuthInfo()
				} else {
					authService?.handleDeauth()
				}
			}
		}),
	)

	return createClineAPI(sidebarWebview.controller)
}

function maybeSetupHostProviders(context: ExtensionContext) {
	if (!HostProvider.isInitialized()) {
		console.log("Setting up vscode host providers...")

		const createWebview = function (type: WebviewProviderType): WebviewProvider {
			return new VscodeWebviewProvider(context, type)
		}
		const createDiffView = function () {
			return new VscodeDiffViewProvider()
		}
		const outputChannel = vscode.window.createOutputChannel("Caret")
		context.subscriptions.push(outputChannel)

		HostProvider.initialize(createWebview, createDiffView, vscodeHostBridgeClient, outputChannel.appendLine)
	}
}

export async function deactivate() {
	await WebviewProvider.disposeAllInstances()
	cleanupTestMode()
	await posthogClientProvider.shutdown()
	Logger.log("Caret extension deactivated")
}

if (IS_DEV && IS_DEV !== "false") {
	assert(DEV_WORKSPACE_FOLDER, "DEV_WORKSPACE_FOLDER must be set in development")
	const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(DEV_WORKSPACE_FOLDER, "src/**/*"))

	watcher.onDidChange(({ scheme, path }) => {
		console.info(`${scheme} ${path} changed. Reloading VSCode...`)
		vscode.commands.executeCommand("workbench.action.reloadWindow")
	})
}
