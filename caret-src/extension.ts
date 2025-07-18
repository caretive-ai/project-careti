import * as vscode from "vscode"
import { setTimeout as setTimeoutPromise } from "node:timers/promises"
import { Logger } from "../src/services/logging/Logger"
import { CaretProvider, CARET_SIDEBAR_ID, CARET_TAB_PANEL_ID } from "./core/webview/CaretProvider"
import { sendSettingsButtonClickedEvent } from "../src/core/controller/ui/subscribeToSettingsButtonClicked"
import { sendChatButtonClickedEvent } from "../src/core/controller/ui/subscribeToChatButtonClicked"
import { sendMcpButtonClickedEvent } from "../src/core/controller/ui/subscribeToMcpButtonClicked"
import { sendHistoryButtonClickedEvent } from "../src/core/controller/ui/subscribeToHistoryButtonClicked"
import { sendAccountButtonClickedEvent } from "../src/core/controller/ui/subscribeToAccountButtonClicked"
import { WebviewProviderType as WebviewProviderTypeEnum } from "../src/shared/proto/ui"
import { WebviewProviderType } from "../src/shared/webview/types"
import { caretLogger } from "./utils/caret-logger"
import { CaretSystemPrompt } from "./core/prompts/CaretSystemPrompt"
import { CaretResponses } from "./core/prompts/CaretResponses"
import { DIFF_VIEW_URI_SCHEME } from "../src/integrations/editor/DiffViewProvider"
import pWaitFor from "p-wait-for"

let outputChannel: vscode.OutputChannel

const handleUri = async (uri: vscode.Uri) => {
	caretLogger.info(`URI Handler called with: ${uri.toString()}`, "AUTH")
	// const query = new URLSearchParams(uri.query.replace(/\+/g, "%2B"))
	// CARET FIX: Decode the URI query component to handle double-encoding from the server.
	// The server incorrectly encodes '&' as '%26', which prevents URLSearchParams from parsing correctly.
	const decodedQuery = decodeURIComponent(uri.query.replace(/\+/g, "%2B"))
	const query = new URLSearchParams(decodedQuery)

	// DEBUG: Log all received query parameters to see what the server is sending.
	for (const [key, value] of query.entries()) {
		caretLogger.info(`[AUTH DEBUG] Received query param: ${key}=${value}`, "AUTH")
	}

	const visibleProvider = CaretProvider.getVisibleInstance()

	if (!visibleProvider) {
		caretLogger.warn("No visible Caret instance found to handle URI.", "AUTH")
		return
	}

	switch (uri.path) {
		case "/auth": {
			const token = query.get("code")
			const state = query.get("state")
			const apiKey = query.get("apiKey")

			caretLogger.info(
				`Auth callback received: state=${state}, token=${token ? "present" : "missing"}, apiKey=${apiKey ? "present" : "missing"}`,
				"AUTH",
			)

			if (!(await visibleProvider.controller.validateAuthState(state))) {
				vscode.window.showErrorMessage("Invalid authentication state. Please try logging in again.")
				caretLogger.error("Invalid auth state received.", "AUTH")
				return
			}

			if (token && apiKey) {
				await visibleProvider.controller.handleAuthCallback(token, apiKey)
				caretLogger.success("Authentication callback handled successfully.", "AUTH")
			} else {
				caretLogger.error("Token or API key missing in auth callback.", "AUTH")
				vscode.window.showErrorMessage("Authentication failed. Token or API key was not provided.")
			}
			break
		}
		default:
			caretLogger.warn(`Unsupported URI path: ${uri.path}`, "AUTH")
			break
	}
}

export async function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("Caret")
	context.subscriptions.push(outputChannel)

	Logger.initialize(outputChannel)
	caretLogger.setOutputChannel(outputChannel)
	caretLogger.info("Caret extension activating...")
	caretLogger.extensionActivated()

	// CARET MODIFICATION: Register TextDocumentContentProvider for diff editor support
	// This fixes "Failed to open diff editor" error by providing content for cline-diff:// URIs
	const diffContentProvider = new (class implements vscode.TextDocumentContentProvider {
		provideTextDocumentContent(uri: vscode.Uri): string {
			return Buffer.from(uri.query, "base64").toString("utf-8")
		}
	})()
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(DIFF_VIEW_URI_SCHEME, diffContentProvider))
	caretLogger.success("Diff editor TextDocumentContentProvider registered", "SYSTEM")

	// CARET MODIFICATION: Initialize CaretSystemPrompt singleton with extensionPath
	// This resolves the extensionPath dependency for JSON-based system prompt generation
	try {
		const extensionPath = context.extensionPath
		CaretSystemPrompt.getInstance(extensionPath)
		caretLogger.success("CaretSystemPrompt initialized with JSON-based prompt system", "SYSTEM")
	} catch (error) {
		caretLogger.error("Failed to initialize CaretSystemPrompt", "SYSTEM")
		caretLogger.error(error.toString(), "SYSTEM")
	}

	// CARET MODIFICATION: Initialize CaretResponses with extensionPath
	// This loads RESPONSES.json and enables cached response retrieval
	try {
		await CaretResponses.initialize(context.extensionPath)
		caretLogger.success("CaretResponses initialized with JSON-based response system", "SYSTEM")
	} catch (error) {
		caretLogger.error("Failed to initialize CaretResponses", "SYSTEM")
		caretLogger.error(error.toString(), "SYSTEM")
	}

	// CARET MODIFICATION: Copy default persona images to global storage on first activation
	// This ensures persona images are available in globalStorageUri for consistent loading
	const personaImagesCopiedKey = "caret.personaImagesCopied"
	const hasPersonaImagesBeenCopied = context.globalState.get<boolean>(personaImagesCopiedKey) || false

	if (!hasPersonaImagesBeenCopied) {
		try {
			const personaStoragePath = vscode.Uri.joinPath(context.globalStorageUri, "personas")
			await vscode.workspace.fs.createDirectory(personaStoragePath)

			const defaultProfilePath = vscode.Uri.joinPath(context.extensionUri, "caret-assets", "agent_profile.png")
			const defaultThinkingPath = vscode.Uri.joinPath(context.extensionUri, "caret-assets", "agent_thinking.png")
			const targetProfilePath = vscode.Uri.joinPath(personaStoragePath, "agent_profile.png")
			const targetThinkingPath = vscode.Uri.joinPath(personaStoragePath, "agent_thinking.png")

			await vscode.workspace.fs.copy(defaultProfilePath, targetProfilePath, { overwrite: false })
			await vscode.workspace.fs.copy(defaultThinkingPath, targetThinkingPath, { overwrite: false })

			await context.globalState.update(personaImagesCopiedKey, true)
			caretLogger.success("Default persona images copied to global storage.", "SYSTEM")
		} catch (error) {
			caretLogger.error("Failed to copy default persona images to global storage.", "SYSTEM")
			caretLogger.error(error.toString(), "SYSTEM")
		}
	}

	const sidebarWebviewProvider = new CaretProvider(context, outputChannel, WebviewProviderType.SIDEBAR)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CARET_SIDEBAR_ID, sidebarWebviewProvider, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	// --- COMMAND REGISTRATION ---

	const openCaretInNewTab = async () => {
		const tabWebview = new CaretProvider(context, outputChannel, WebviewProviderType.TAB)
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))
		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(CARET_TAB_PANEL_ID, "Caret", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
		})
		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "caret-assets", "icons", "icon.svg"),
			dark: vscode.Uri.joinPath(context.extensionUri, "caret-assets", "icons", "icon_w.svg"),
		}
		tabWebview.resolveWebviewView(panel)
		await setTimeoutPromise(100)
		await vscode.commands.executeCommand("workbench.action.lockEditorGroup")
	}

	// CARET MODIFICATION: Use Cline's original plusButtonClicked pattern with proper task management
	// Original backed up as extension-ts.cline - inherit clearTask + postState + sendEvent pattern
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.plusButtonClicked", async () => {
			caretLogger.info("Command 'caret.plusButtonClicked' triggered.")
			const instance = CaretProvider.getVisibleInstance()
			if (instance) {
				caretLogger.info(
					`Found visible instance with client ID: ${instance.getClientId()}. Controller exists: ${!!instance.controller}`,
				)
				try {
					// Follow Cline original pattern: clearTask + postState + sendChatEvent
					await instance.controller.clearTask()
					await instance.controller.postStateToWebview()
					await sendChatButtonClickedEvent(instance.controller.id)
					caretLogger.success("Plus button action completed successfully", "UI")
				} catch (error) {
					caretLogger.error("Failed to execute plus button action", "UI")
					caretLogger.error(error.toString(), "UI")
					throw error
				}
			} else {
				caretLogger.warn("No visible Caret instance found.")
			}
		}),
	)

	// CARET MODIFICATION: Use Cline's original mcpButtonClicked pattern with proper event streaming
	// Inherit sendMcpButtonClickedEvent instead of deprecated controller method
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.mcpButtonClicked", async () => {
			caretLogger.info("Command 'caret.mcpButtonClicked' triggered.")
			try {
				// Follow Cline original pattern: direct event streaming
				await sendMcpButtonClickedEvent(WebviewProviderTypeEnum.SIDEBAR)
				caretLogger.success("MCP button event sent successfully", "UI")
			} catch (error) {
				caretLogger.error("Failed to send MCP button event", "UI")
				caretLogger.error(error.toString(), "UI")
			}
		}),
	)

	// CARET MODIFICATION: Use Cline's original historyButtonClicked pattern with proper event streaming
	// Inherit sendHistoryButtonClickedEvent instead of deprecated controller method
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.historyButtonClicked", async () => {
			caretLogger.info("Command 'caret.historyButtonClicked' triggered.")
			try {
				// Follow Cline original pattern: direct event streaming with webview type
				await sendHistoryButtonClickedEvent(WebviewProviderTypeEnum.SIDEBAR)
				caretLogger.success("History button event sent successfully", "UI")
			} catch (error) {
				caretLogger.error("Failed to send history button event", "UI")
				caretLogger.error(error.toString(), "UI")
			}
		}),
	)

	context.subscriptions.push(vscode.commands.registerCommand("caret.popoutButtonClicked", openCaretInNewTab))
	context.subscriptions.push(vscode.commands.registerCommand("caret.openInNewTab", openCaretInNewTab))

	// 6. Register URI Handler
	context.subscriptions.push(vscode.window.registerUriHandler({ handleUri }))
	caretLogger.info("Caret URI handler for authentication registered.")

	// CARET MODIFICATION: Use Cline's original accountButtonClicked pattern with controller ID targeting
	// Inherit sendAccountButtonClickedEvent instead of deprecated controller method
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.accountButtonClicked", async () => {
			caretLogger.info("Command 'caret.accountButtonClicked' triggered.")
			const instance = CaretProvider.getVisibleInstance()
			if (instance) {
				caretLogger.info(
					`Found visible instance with client ID: ${instance.getClientId()}. Controller exists: ${!!instance.controller}`,
				)
				try {
					// Follow Cline original pattern: send event to specific controller
					await sendAccountButtonClickedEvent(instance.controller.id)
					caretLogger.success("Account button event sent successfully", "UI")
				} catch (error) {
					caretLogger.error("Failed to send account button event", "UI")
					caretLogger.error(error.toString(), "UI")
				}
			} else {
				caretLogger.warn("No visible Caret instance found.")
			}
		}),
	)

	// CARET MODIFICATION: Settings button already properly inherits Cline's sendSettingsButtonClickedEvent
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.settingsButtonClicked", async () => {
			caretLogger.info("Command 'caret.settingsButtonClicked' triggered. Sending event.")
			try {
				await sendSettingsButtonClickedEvent(WebviewProviderTypeEnum.SIDEBAR)
				caretLogger.success("Settings button event sent successfully", "UI")
			} catch (error) {
				caretLogger.error("Failed to send settings button event", "UI")
				caretLogger.error(error.toString(), "UI")
			}
		}),
	)
	caretLogger.info("Caret extension activated and all commands registered.")

	// CARET MODIFICATION: 페르소나 초기화 (custom_instructions.md가 없는 경우 기본값으로 설정)
	try {
		const { PersonaInitializer } = await import("./utils/persona-initializer")
		const personaInitializer = new PersonaInitializer(context)
		await personaInitializer.initialize()
	} catch (error) {
		caretLogger.error("Failed to initialize persona:", error)
	}

	// CARET MODIFICATION: Quick implementation of caret.focusChatInput to ensure webview visible
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.focusChatInput", async () => {
			// Try to reveal existing visible instance first
			let activeProvider = CaretProvider.getVisibleInstance() as any

			if (!activeProvider) {
				// Fallback to sidebar focus
				await vscode.commands.executeCommand("caret.SidebarProvider.focus")
				await pWaitFor(() => !!CaretProvider.getVisibleInstance(), { timeout: 2000 }).catch(() => {})
				activeProvider = CaretProvider.getVisibleInstance() as any
			}

			// If still not found, open a new tab
			if (!activeProvider) {
				await vscode.commands.executeCommand("caret.openInNewTab")
				await pWaitFor(() => !!CaretProvider.getVisibleInstance(), { timeout: 2000 }).catch(() => {})
			}
		}),
	)

	// CARET MODIFICATION: Quick implementation of caret.addToChat (editor context menu)
	context.subscriptions.push(
		vscode.commands.registerCommand("caret.addToChat", async (range?: vscode.Range) => {
			await vscode.commands.executeCommand("caret.focusChatInput")
			await pWaitFor(() => !!CaretProvider.getVisibleInstance(), { timeout: 2000 }).catch(() => {})

			const editor = vscode.window.activeTextEditor
			if (!editor) {
				return
			}

			const textRange = range instanceof vscode.Range ? range : editor.selection
			const selectedText = editor.document.getText(textRange)
			if (!selectedText.trim()) {
				return
			}

			const filePath = editor.document.uri.fsPath
			const languageId = editor.document.languageId

			const visibleProvider = CaretProvider.getVisibleInstance() as any
			await visibleProvider?.controller.addSelectedCodeToChat(selectedText, filePath, languageId, [])
		}),
	)
}

export function deactivate() {
	outputChannel?.appendLine("Caret extension deactivated.")
}
