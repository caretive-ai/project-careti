import type React from "react"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import "../../../src/shared/webview/types"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings"
import { findLastIndex } from "@shared/array"
import { DEFAULT_BROWSER_SETTINGS } from "@shared/BrowserSettings"
import { DEFAULT_PLATFORM, type ExtensionState } from "@shared/ExtensionMessage"
import { DEFAULT_MCP_DISPLAY_MODE } from "@shared/McpDisplayMode"
import type { UserInfo } from "@shared/proto/cline/account"
import { EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import type { OpenRouterCompatibleModelInfo } from "@shared/proto/cline/models"
import { type TerminalProfile, UpdateSettingsRequest } from "@shared/proto/cline/state"
import { WebviewProviderType as WebviewProviderTypeEnum, WebviewProviderTypeRequest } from "@shared/proto/cline/ui"
import { convertProtoToClineMessage } from "@shared/proto-conversions/cline-message"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import {
	groqDefaultModelId,
	groqModels,
	basetenDefaultModelId,
	basetenModels,
	type ModelInfo,
	openRouterDefaultModelId,
	openRouterDefaultModelInfo,
	requestyDefaultModelId,
	requestyDefaultModelInfo,
} from "../../../src/shared/api"
import type { McpMarketplaceCatalog, McpServer, McpViewTab } from "../../../src/shared/mcp"
import {
	FileServiceClient,
	McpServiceClient,
	ModelsServiceClient,
	StateServiceClient,
	UiServiceClient,
} from "../services/grpc-client"
import { convertTextMateToHljs } from "../utils/textMateToHljs"

// CARET MODIFICATION: Added caretBanner property for Caret welcome page
// Original backed up to: ExtensionStateContext-tsx.cline
export interface ExtensionStateContextType extends ExtensionState { // CARET MODIFICATION: ExtensionStateContextType export
	didHydrateState: boolean
	showWelcome: boolean
	theme: Record<string, string> | undefined
	openRouterModels: Record<string, ModelInfo>
	openAiModels: string[]
	requestyModels: Record<string, ModelInfo>
	groqModels: Record<string, ModelInfo>
	basetenModels: Record<string, ModelInfo>
	huggingFaceModels: Record<string, ModelInfo>
	mcpServers: McpServer[]
	mcpMarketplaceCatalog: McpMarketplaceCatalog
	filePaths: string[]
	totalTasksSize: number | null
	availableTerminalProfiles: TerminalProfile[]
	caretBanner: string
	// CARET MODIFICATION: 페르소나 이미지 직접 주입 방식으로 변경
	personaProfile: string
	personaThinking: string

	// View state
	showMcp: boolean
	mcpTab?: McpViewTab
	showSettings: boolean
	showHistory: boolean
	showAccount: boolean
	showAnnouncement: boolean

	// Setters
	setShowAnnouncement: (value: boolean) => void
	setShouldShowAnnouncement: (value: boolean) => void
<<<<<<< HEAD
	setPlanActSeparateModelsSetting: (value: boolean) => void
	setEnableCheckpointsSetting: (value: boolean) => void
	setMcpMarketplaceEnabled: (value: boolean) => void
	setMcpRichDisplayEnabled: (value: boolean) => void
	setMcpResponsesCollapsed: (value: boolean) => void
	setShellIntegrationTimeout: (value: number) => void
	setTerminalReuseEnabled: (value: boolean) => void
	setTerminalOutputLineLimit: (value: number) => void
	setDefaultTerminalProfile: (value: string) => void
	setChatSettings: (value: ChatSettings) => void
	// CARET MODIFICATION: UI 언어만 업데이트하는 별도 함수
	setUILanguage: (language: string) => void
	// CARET MODIFICATION: Mode system (Caret/Cline interface) setter
	setModeSystem: (modeSystem: string) => void

=======
>>>>>>> upstream/main
	setMcpServers: (value: McpServer[]) => void
	setRequestyModels: (value: Record<string, ModelInfo>) => void
	setGroqModels: (value: Record<string, ModelInfo>) => void
	setBasetenModels: (value: Record<string, ModelInfo>) => void
	setHuggingFaceModels: (value: Record<string, ModelInfo>) => void
	setGlobalClineRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalClineRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalCaretRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalCursorRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalWindsurfRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalWorkflowToggles: (toggles: Record<string, boolean>) => void
	setGlobalWorkflowToggles: (toggles: Record<string, boolean>) => void
	setMcpMarketplaceCatalog: (value: McpMarketplaceCatalog) => void
	setTotalTasksSize: (value: number | null) => void

	// Refresh functions
	refreshOpenRouterModels: () => void
	setUserInfo: (userInfo?: UserInfo) => void

	// Navigation state setters
	setShowMcp: (value: boolean) => void
	setMcpTab: (tab?: McpViewTab) => void

	// Navigation functions
	navigateToMcp: (tab?: McpViewTab) => void
	navigateToSettings: () => void
	navigateToHistory: () => void
	navigateToAccount: () => void
	navigateToChat: () => void

	// Hide functions
	hideSettings: () => void
	hideHistory: () => void
	hideAccount: () => void
	hideAnnouncement: () => void
	closeMcpView: () => void

	// Event callbacks
	onRelinquishControl: (callback: () => void) => () => void
}

// CARET MODIFICATION: Export ExtensionStateContext for testing purposes
export const ExtensionStateContext = createContext<ExtensionStateContextType | undefined>(undefined)

export const ExtensionStateContextProvider: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	// Get the current webview provider type
	const currentProviderType =
		window.WEBVIEW_PROVIDER_TYPE === "sidebar" ? WebviewProviderTypeEnum.SIDEBAR : WebviewProviderTypeEnum.TAB
	// UI view state
	const [showMcp, setShowMcp] = useState(false)
	const [mcpTab, setMcpTab] = useState<McpViewTab | undefined>(undefined)
	const [showSettings, setShowSettings] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showAccount, setShowAccount] = useState(false)
	const [showAnnouncement, setShowAnnouncement] = useState(false)

	// Helper for MCP view
	const closeMcpView = useCallback(() => {
		setShowMcp(false)
		setMcpTab(undefined)
	}, [setShowMcp, setMcpTab])

	// Hide functions
	const hideSettings = useCallback(() => setShowSettings(false), [setShowSettings])
	const hideHistory = useCallback(() => setShowHistory(false), [setShowHistory])
	const hideAccount = useCallback(() => setShowAccount(false), [setShowAccount])
	const hideAnnouncement = useCallback(() => setShowAnnouncement(false), [setShowAnnouncement])

	// Navigation functions
	const navigateToMcp = useCallback(
		(tab?: McpViewTab) => {
			setShowSettings(false)
			setShowHistory(false)
			setShowAccount(false)
			if (tab) {
				setMcpTab(tab)
			}
			setShowMcp(true)
		},
		[setShowMcp, setMcpTab, setShowSettings, setShowHistory, setShowAccount],
	)

	const navigateToSettings = useCallback(() => {
		setShowHistory(false)
		closeMcpView()
		setShowAccount(false)
		setShowSettings(true)
	}, [setShowSettings, setShowHistory, closeMcpView, setShowAccount])

	const navigateToHistory = useCallback(() => {
		setShowSettings(false)
		closeMcpView()
		setShowAccount(false)
		setShowHistory(true)
	}, [setShowSettings, closeMcpView, setShowAccount, setShowHistory])

	const navigateToAccount = useCallback(() => {
		setShowSettings(false)
		closeMcpView()
		setShowHistory(false)
		setShowAccount(true)
	}, [setShowSettings, closeMcpView, setShowHistory, setShowAccount])

	const navigateToChat = useCallback(() => {
		setShowSettings(false)
		closeMcpView()
		setShowHistory(false)
		setShowAccount(false)
	}, [setShowSettings, closeMcpView, setShowHistory, setShowAccount])

	const [state, setState] = useState<ExtensionState>({
		version: "",
		clineMessages: [],
		taskHistory: [],
		shouldShowAnnouncement: false,
		autoApprovalSettings: DEFAULT_AUTO_APPROVAL_SETTINGS,
		browserSettings: DEFAULT_BROWSER_SETTINGS,
		preferredLanguage: "English",
		openaiReasoningEffort: "medium",
		mode: "act",
		platform: DEFAULT_PLATFORM,
		telemetrySetting: "unset",
		distinctId: "",
		planActSeparateModelsSetting: true,
		enableCheckpointsSetting: true,
		mcpDisplayMode: DEFAULT_MCP_DISPLAY_MODE,
		globalClineRulesToggles: {},
		localClineRulesToggles: {},
		localCaretRulesToggles: {},
		localCursorRulesToggles: {},
		localWindsurfRulesToggles: {},
		localWorkflowToggles: {},
		globalWorkflowToggles: {},
		shellIntegrationTimeout: 4000,
		terminalReuseEnabled: true,
		terminalOutputLineLimit: 500,
		defaultTerminalProfile: "default",
		isNewUser: false,
		welcomeViewCompleted: false,
		mcpResponsesCollapsed: false, // Default value (expanded), will be overwritten by extension state
<<<<<<< HEAD
		// CARET MODIFICATION: Add uiLanguage for i18n support - follows VSCode settings or defaults to 'en'
		uiLanguage: "en", // Will be overwritten by backend state with VSCode settings
=======
		strictPlanModeEnabled: false,
>>>>>>> upstream/main
	})
	const [didHydrateState, setDidHydrateState] = useState(false)
	const [showWelcome, setShowWelcome] = useState(false)
	const [theme, setTheme] = useState<Record<string, string>>()
	const [filePaths, setFilePaths] = useState<string[]>([])
	const [openRouterModels, setOpenRouterModels] = useState<Record<string, ModelInfo>>({
		[openRouterDefaultModelId]: openRouterDefaultModelInfo,
	})
	const [totalTasksSize, setTotalTasksSize] = useState<number | null>(null)
	const [availableTerminalProfiles, setAvailableTerminalProfiles] = useState<TerminalProfile[]>([])
	const [caretBanner] = useState<string>((window as any).caretBanner || "")
	// CARET MODIFICATION: 페르소나 이미지 직접 주입 방식으로 변경
	const [personaProfile, setPersonaProfile] = useState<string>((window as any).personaProfile || "")
	const [personaThinking, setPersonaThinking] = useState<string>((window as any).personaThinking || "")

	const [openAiModels, setOpenAiModels] = useState<string[]>([])
	const [requestyModels, setRequestyModels] = useState<Record<string, ModelInfo>>({
		[requestyDefaultModelId]: requestyDefaultModelInfo,
	})
	const [groqModelsState, setGroqModels] = useState<Record<string, ModelInfo>>({
		[groqDefaultModelId]: groqModels[groqDefaultModelId],
	})
	const [basetenModelsState, setBasetenModels] = useState<Record<string, ModelInfo>>({
		[basetenDefaultModelId]: basetenModels[basetenDefaultModelId],
	})
	const [huggingFaceModels, setHuggingFaceModels] = useState<Record<string, ModelInfo>>({})
	const [mcpServers, setMcpServers] = useState<McpServer[]>([])
	const [mcpMarketplaceCatalog, setMcpMarketplaceCatalog] = useState<McpMarketplaceCatalog>({ items: [] })
<<<<<<< HEAD
	const handleMessage = useCallback((event: MessageEvent) => {
		const message: ExtensionMessage = event.data
		switch (message.type) {
			case "openAiModels": {
				const updatedModels = message.openAiModels ?? []
				setOpenAiModels(updatedModels)
				break
			}
			case "requestyModels": {
				const updatedModels = message.requestyModels ?? {}
				setRequestyModels({
					[requestyDefaultModelId]: requestyDefaultModelInfo,
					...updatedModels,
				})
				break
			}
			// CARET MODIFICATION: Persona 이미지 업데이트 메시지 수신
			case "PERSONA_UPDATED": {
				if (message.payload?.avatarUri) {
					setPersonaProfile(message.payload.avatarUri)
				}
				if (message.payload?.thinkingAvatarUri) {
					setPersonaThinking(message.payload.thinkingAvatarUri)
				}
				break
			}
		}
	}, [])

	useEvent("message", handleMessage)
=======
>>>>>>> upstream/main

	// References to store subscription cancellation functions
	const stateSubscriptionRef = useRef<(() => void) | null>(null)

	// Reference for focusChatInput subscription
	const focusChatInputUnsubscribeRef = useRef<(() => void) | null>(null)
	const mcpButtonUnsubscribeRef = useRef<(() => void) | null>(null)
	const historyButtonClickedSubscriptionRef = useRef<(() => void) | null>(null)
	const chatButtonUnsubscribeRef = useRef<(() => void) | null>(null)
	const accountButtonClickedSubscriptionRef = useRef<(() => void) | null>(null)
	const settingsButtonClickedSubscriptionRef = useRef<(() => void) | null>(null)
	const partialMessageUnsubscribeRef = useRef<(() => void) | null>(null)
	const mcpMarketplaceUnsubscribeRef = useRef<(() => void) | null>(null)
	const themeSubscriptionRef = useRef<(() => void) | null>(null)
	const openRouterModelsUnsubscribeRef = useRef<(() => void) | null>(null)
	const workspaceUpdatesUnsubscribeRef = useRef<(() => void) | null>(null)
	const relinquishControlUnsubscribeRef = useRef<(() => void) | null>(null)

	// Add ref for callbacks
	const relinquishControlCallbacks = useRef<Set<() => void>>(new Set())

	// Create hook function
	const onRelinquishControl = useCallback((callback: () => void) => {
		relinquishControlCallbacks.current.add(callback)
		return () => {
			relinquishControlCallbacks.current.delete(callback)
		}
	}, [])
	const mcpServersSubscriptionRef = useRef<(() => void) | null>(null)
	const didBecomeVisibleUnsubscribeRef = useRef<(() => void) | null>(null)

	// CARET MODIFICATION: 웰컴 상태 변경을 백엔드에 알려서 VSCode 컨텍스트 업데이트
	useEffect(() => {
		// showWelcome 상태가 변경될 때마다 백엔드에 알려서 VSCode 컨텍스트를 업데이트
		if (didHydrateState) {
			// 간단한 메시지로 백엔드에 웰컴 상태 전달
			window.postMessage(
				{
					type: "setWelcomeContext",
					showWelcome: showWelcome,
				},
				"*",
			)
			console.log(`[DEBUG] Sent welcome context to backend: showWelcome=${showWelcome}`)
		}
	}, [showWelcome, didHydrateState])

	// Subscribe to state updates and UI events using the gRPC streaming API
	useEffect(() => {
		// Use the already defined webview provider type
		const webviewType = currentProviderType

		// Set up state subscription
		stateSubscriptionRef.current = StateServiceClient.subscribeToState(EmptyRequest.create({}), {
			onResponse: (response) => {
				if (response.stateJson) {
					try {
						const stateData = JSON.parse(response.stateJson) as ExtensionState
<<<<<<< HEAD
						console.log("[DEBUG] parsed state JSON, updating state")

						// CARET MODIFICATION: Mission 2 - 상태 업데이트 수신 로깅
						import("../caret/utils/webview-logger").then(({ caretWebviewLogger }) => {
							caretWebviewLogger.info("📥 [RECEIVE] State update received from backend", {
								hasChatSettings: !!stateData.chatSettings,
								newMode: stateData.chatSettings?.mode,
								timestamp: new Date().toISOString(),
							})
						})

=======
>>>>>>> upstream/main
						setState((prevState) => {
							// CARET MODIFICATION: Mission 2 - 모드 변경 감지 로깅
							const modeChanged = prevState.chatSettings?.mode !== stateData.chatSettings?.mode
							if (modeChanged) {
								import("../caret/utils/webview-logger").then(({ caretWebviewLogger }) => {
									caretWebviewLogger.info("🔄 [MODE-CHANGE] Chat mode changed", {
										from: prevState.chatSettings?.mode,
										to: stateData.chatSettings?.mode,
									})
								})
							}
							// Versioning logic for autoApprovalSettings
							const incomingVersion = stateData.autoApprovalSettings?.version ?? 1
							const currentVersion = prevState.autoApprovalSettings?.version ?? 1
							const shouldUpdateAutoApproval = incomingVersion > currentVersion

							const newState = {
								...stateData,
								autoApprovalSettings: shouldUpdateAutoApproval
									? stateData.autoApprovalSettings
									: prevState.autoApprovalSettings,
							}

							// Update welcome screen state based on API configuration
<<<<<<< HEAD
							const config = stateData.apiConfiguration
							const hasKey = config
								? [
										config.apiKey,
										config.openRouterApiKey,
										config.awsRegion,
										config.vertexProjectId,
										config.openAiApiKey,
										config.ollamaModelId,
										config.lmStudioModelId,
										config.liteLlmApiKey,
										config.geminiApiKey,
										config.openAiNativeApiKey,
										config.deepSeekApiKey,
										config.requestyApiKey,
										config.togetherApiKey,
										config.qwenApiKey,
										config.doubaoApiKey,
										config.mistralApiKey,
										config.vsCodeLmModelSelector,
										config.caretApiKey,
										config.asksageApiKey,
										config.xaiApiKey,
										config.sambanovaApiKey,
										config.sapAiCoreClientId,
									].some((key) => key !== undefined)
								: false

							setShowWelcome(!hasKey)
=======
							setShowWelcome(!newState.welcomeViewCompleted)
>>>>>>> upstream/main
							setDidHydrateState(true)

							console.log("[DEBUG] returning new state in ESC")

							return newState
						})
					} catch (error) {
						console.error("Error parsing state JSON:", error)
						console.log("[DEBUG] ERR getting state", error)
					}
				}
				console.log('[DEBUG] ended "got subscribed state"')
			},
			onError: (error) => {
				console.error("Error in state subscription:", error)
			},
			onComplete: () => {
				console.log("State subscription completed")
			},
		})

		// Subscribe to MCP button clicked events with webview type
		mcpButtonUnsubscribeRef.current = UiServiceClient.subscribeToMcpButtonClicked(
			WebviewProviderTypeRequest.create({
				providerType: webviewType,
			}),
			{
				onResponse: () => {
					console.log("[DEBUG] Received mcpButtonClicked event from gRPC stream")
					// CARET MODIFICATION: 웰컴 페이지에서는 상단 메뉴 비활성화
					if (!showWelcome) {
						navigateToMcp()
					}
				},
				onError: (error) => {
					console.error("Error in mcpButtonClicked subscription:", error)
				},
				onComplete: () => {
					console.log("mcpButtonClicked subscription completed")
				},
			},
		)

		// Set up history button clicked subscription with webview type
		historyButtonClickedSubscriptionRef.current = UiServiceClient.subscribeToHistoryButtonClicked(
			WebviewProviderTypeRequest.create({
				providerType: webviewType,
			}),
			{
				onResponse: () => {
					// When history button is clicked, navigate to history view
					console.log("[DEBUG] Received history button clicked event from gRPC stream")
					// CARET MODIFICATION: 웰컴 페이지에서는 상단 메뉴 비활성화
					if (!showWelcome) {
						navigateToHistory()
					}
				},
				onError: (error) => {
					console.error("Error in history button clicked subscription:", error)
				},
				onComplete: () => {
					console.log("History button clicked subscription completed")
				},
			},
		)

		// Subscribe to chat button clicked events with webview type
		chatButtonUnsubscribeRef.current = UiServiceClient.subscribeToChatButtonClicked(EmptyRequest.create({}), {
			onResponse: () => {
				// When chat button is clicked, navigate to chat
				console.log("[DEBUG] Received chat button clicked event from gRPC stream")
				navigateToChat()
			},
			onError: (error) => {
				console.error("Error in chat button subscription:", error)
			},
			onComplete: () => {},
		})

		// Subscribe to didBecomeVisible events
		didBecomeVisibleUnsubscribeRef.current = UiServiceClient.subscribeToDidBecomeVisible(EmptyRequest.create({}), {
			onResponse: () => {
				console.log("[DEBUG] Received didBecomeVisible event from gRPC stream")
				window.dispatchEvent(new CustomEvent("focusChatInput"))
			},
			onError: (error) => {
				console.error("Error in didBecomeVisible subscription:", error)
			},
			onComplete: () => {},
		})

		// Subscribe to MCP servers updates
		mcpServersSubscriptionRef.current = McpServiceClient.subscribeToMcpServers(EmptyRequest.create(), {
			onResponse: (response) => {
				console.log("[DEBUG] Received MCP servers update from gRPC stream")
				if (response.mcpServers) {
					setMcpServers(convertProtoMcpServersToMcpServers(response.mcpServers))
				}
			},
			onError: (error) => {
				console.error("Error in MCP servers subscription:", error)
			},
			onComplete: () => {
				console.log("MCP servers subscription completed")
			},
		})

		// Subscribe to workspace file updates
		workspaceUpdatesUnsubscribeRef.current = FileServiceClient.subscribeToWorkspaceUpdates(EmptyRequest.create({}), {
			onResponse: (response) => {
				console.log("[DEBUG] Received workspace update event from gRPC stream")
				setFilePaths(response.values || [])
			},
			onError: (error) => {
				console.error("Error in workspace updates subscription:", error)
			},
			onComplete: () => {},
		})

		// Set up settings button clicked subscription
		settingsButtonClickedSubscriptionRef.current = UiServiceClient.subscribeToSettingsButtonClicked(
			WebviewProviderTypeRequest.create({
				providerType: currentProviderType,
			}),
			{
				onResponse: () => {
					// When settings button is clicked, navigate to settings
					// CARET MODIFICATION: 웰컴 페이지에서는 상단 메뉴 비활성화
					if (!showWelcome) {
						navigateToSettings()
					}
				},
				onError: (error) => {
					console.error("Error in settings button clicked subscription:", error)
				},
				onComplete: () => {
					console.log("Settings button clicked subscription completed")
				},
			},
		)

		// Subscribe to partial message events
		partialMessageUnsubscribeRef.current = UiServiceClient.subscribeToPartialMessage(EmptyRequest.create({}), {
			onResponse: (protoMessage) => {
				try {
					// Validate critical fields
					if (!protoMessage.ts || protoMessage.ts <= 0) {
						console.error("Invalid timestamp in partial message:", protoMessage)
						return
					}

					const partialMessage = convertProtoToClineMessage(protoMessage)
					setState((prevState) => {
						// worth noting it will never be possible for a more up-to-date message to be sent here or in normal messages post since the presentAssistantContent function uses lock
						const lastIndex = findLastIndex(prevState.clineMessages, (msg) => msg.ts === partialMessage.ts)
						if (lastIndex !== -1) {
							const newClineMessages = [...prevState.clineMessages]
							newClineMessages[lastIndex] = partialMessage
							return { ...prevState, clineMessages: newClineMessages }
						}
						return prevState
					})
				} catch (error) {
					console.error("Failed to process partial message:", error, protoMessage)
				}
			},
			onError: (error) => {
				console.error("Error in partialMessage subscription:", error)
			},
			onComplete: () => {
				console.log("[DEBUG] partialMessage subscription completed")
			},
		})

		// Subscribe to MCP marketplace catalog updates
		mcpMarketplaceUnsubscribeRef.current = McpServiceClient.subscribeToMcpMarketplaceCatalog(EmptyRequest.create({}), {
			onResponse: (catalog) => {
				console.log("[DEBUG] Received MCP marketplace catalog update from gRPC stream")
				setMcpMarketplaceCatalog(catalog)
			},
			onError: (error) => {
				console.error("Error in MCP marketplace catalog subscription:", error)
			},
			onComplete: () => {
				console.log("MCP marketplace catalog subscription completed")
			},
		})

		// Subscribe to theme changes
		themeSubscriptionRef.current = UiServiceClient.subscribeToTheme(EmptyRequest.create({}), {
			onResponse: (response) => {
				if (response.value) {
					try {
						const themeData = JSON.parse(response.value)
						setTheme(convertTextMateToHljs(themeData))
						console.log("[DEBUG] Received theme update from gRPC stream")
					} catch (error) {
						console.error("Error parsing theme data:", error)
					}
				}
			},
			onError: (error) => {
				console.error("Error in theme subscription:", error)
			},
			onComplete: () => {
				console.log("Theme subscription completed")
			},
		})

		// Subscribe to OpenRouter models updates
		openRouterModelsUnsubscribeRef.current = ModelsServiceClient.subscribeToOpenRouterModels(EmptyRequest.create({}), {
			onResponse: (response: OpenRouterCompatibleModelInfo) => {
				console.log("[DEBUG] Received OpenRouter models update from gRPC stream")
				const models = response.models
				setOpenRouterModels({
					[openRouterDefaultModelId]: openRouterDefaultModelInfo, // in case the extension sent a model list without the default model
					...models,
				})
			},
			onError: (error) => {
				console.error("Error in OpenRouter models subscription:", error)
			},
			onComplete: () => {
				console.log("OpenRouter models subscription completed")
			},
		})

		// Initialize webview using gRPC
		UiServiceClient.initializeWebview(EmptyRequest.create({}))
			.then(() => {
				console.log("[DEBUG] Webview initialization completed via gRPC")
			})
			.catch((error) => {
				console.error("Failed to initialize webview via gRPC:", error)
			})

		// Set up account button clicked subscription
		accountButtonClickedSubscriptionRef.current = UiServiceClient.subscribeToAccountButtonClicked(EmptyRequest.create(), {
			onResponse: () => {
				// When account button is clicked, navigate to account view
				console.log("[AUTH] Received account button clicked event from gRPC stream. Navigating to account view.")
				// CARET MODIFICATION: 웰컴 페이지에서는 상단 메뉴 비활성화
				if (!showWelcome) {
					navigateToAccount()
				}
			},
			onError: (error) => {
				console.error("Error in account button clicked subscription:", error)
			},
			onComplete: () => {
				console.log("Account button clicked subscription completed")
			},
		})

		// Fetch available terminal profiles on launch
		StateServiceClient.getAvailableTerminalProfiles(EmptyRequest.create({}))
			.then((response) => {
				setAvailableTerminalProfiles(response.profiles)
			})
			.catch((error) => {
				console.error("Failed to fetch available terminal profiles:", error)
			})

		// Subscribe to relinquish control events
		relinquishControlUnsubscribeRef.current = UiServiceClient.subscribeToRelinquishControl(EmptyRequest.create({}), {
			onResponse: () => {
				// Call all registered callbacks
				relinquishControlCallbacks.current.forEach((callback) => callback())
			},
			onError: (error) => {
				console.error("Error in relinquishControl subscription:", error)
			},
			onComplete: () => {},
		})

		// Subscribe to focus chat input events
		const clientId = (window as any).clineClientId
		if (clientId) {
			const request = StringRequest.create({ value: clientId })
			focusChatInputUnsubscribeRef.current = UiServiceClient.subscribeToFocusChatInput(request, {
				onResponse: () => {
					// Dispatch a local DOM event within this webview only
					window.dispatchEvent(new CustomEvent("focusChatInput"))
				},
				onError: (error: Error) => {
					console.error("Error in focusChatInput subscription:", error)
				},
				onComplete: () => {},
			})
		} else {
			console.error("Client ID not found in window object")
		}

		// Clean up subscriptions when component unmounts
		return () => {
			if (stateSubscriptionRef.current) {
				stateSubscriptionRef.current()
				stateSubscriptionRef.current = null
			}
			if (mcpButtonUnsubscribeRef.current) {
				mcpButtonUnsubscribeRef.current()
				mcpButtonUnsubscribeRef.current = null
			}
			if (historyButtonClickedSubscriptionRef.current) {
				historyButtonClickedSubscriptionRef.current()
				historyButtonClickedSubscriptionRef.current = null
			}
			if (chatButtonUnsubscribeRef.current) {
				chatButtonUnsubscribeRef.current()
				chatButtonUnsubscribeRef.current = null
			}
			if (accountButtonClickedSubscriptionRef.current) {
				accountButtonClickedSubscriptionRef.current()
				accountButtonClickedSubscriptionRef.current = null
			}
			if (settingsButtonClickedSubscriptionRef.current) {
				settingsButtonClickedSubscriptionRef.current()
				settingsButtonClickedSubscriptionRef.current = null
			}
			if (partialMessageUnsubscribeRef.current) {
				partialMessageUnsubscribeRef.current()
				partialMessageUnsubscribeRef.current = null
			}
			if (mcpMarketplaceUnsubscribeRef.current) {
				mcpMarketplaceUnsubscribeRef.current()
				mcpMarketplaceUnsubscribeRef.current = null
			}
			if (themeSubscriptionRef.current) {
				themeSubscriptionRef.current()
				themeSubscriptionRef.current = null
			}
			if (openRouterModelsUnsubscribeRef.current) {
				openRouterModelsUnsubscribeRef.current()
				openRouterModelsUnsubscribeRef.current = null
			}
			if (workspaceUpdatesUnsubscribeRef.current) {
				workspaceUpdatesUnsubscribeRef.current()
				workspaceUpdatesUnsubscribeRef.current = null
			}
			if (relinquishControlUnsubscribeRef.current) {
				relinquishControlUnsubscribeRef.current()
				relinquishControlUnsubscribeRef.current = null
			}
			if (focusChatInputUnsubscribeRef.current) {
				focusChatInputUnsubscribeRef.current()
				focusChatInputUnsubscribeRef.current = null
			}
			if (mcpServersSubscriptionRef.current) {
				mcpServersSubscriptionRef.current()
				mcpServersSubscriptionRef.current = null
			}
			if (didBecomeVisibleUnsubscribeRef.current) {
				didBecomeVisibleUnsubscribeRef.current()
				didBecomeVisibleUnsubscribeRef.current = null
			}
		}
	}, [])

	const refreshOpenRouterModels = useCallback(() => {
		ModelsServiceClient.refreshOpenRouterModels(EmptyRequest.create({}))
			.then((response: OpenRouterCompatibleModelInfo) => {
				const models = response.models
				setOpenRouterModels({
					[openRouterDefaultModelId]: openRouterDefaultModelInfo, // in case the extension sent a model list without the default model
					...models,
				})
			})
			.catch((error: Error) => console.error("Failed to refresh OpenRouter models:", error))
	}, [])

	const contextValue: ExtensionStateContextType = {
		...state,
		didHydrateState,
		showWelcome,
		theme,
		openRouterModels,
		openAiModels,
		requestyModels,
		groqModels: groqModelsState,
		basetenModels: basetenModelsState,
		huggingFaceModels,
		mcpServers,
		mcpMarketplaceCatalog,
		filePaths,
		totalTasksSize,
		availableTerminalProfiles,
		caretBanner,
		// CARET MODIFICATION: 페르소나 이미지 직접 주입 방식으로 변경
		personaProfile,
		personaThinking,
		showMcp,
		mcpTab,
		showSettings,
		showHistory,
		showAccount,
		showAnnouncement,
		globalClineRulesToggles: state.globalClineRulesToggles || {},
		localClineRulesToggles: state.localClineRulesToggles || {},
		localCaretRulesToggles: state.localCaretRulesToggles || {},
		localCursorRulesToggles: state.localCursorRulesToggles || {},
		localWindsurfRulesToggles: state.localWindsurfRulesToggles || {},
		localWorkflowToggles: state.localWorkflowToggles || {},
		globalWorkflowToggles: state.globalWorkflowToggles || {},
		enableCheckpointsSetting: state.enableCheckpointsSetting,

		// Navigation functions
		navigateToMcp,
		navigateToSettings,
		navigateToHistory,
		navigateToAccount,
		navigateToChat,

		// Hide functions
		hideSettings,
		hideHistory,
		hideAccount,
		hideAnnouncement,
		setShowAnnouncement,
		setShouldShowAnnouncement: (value) =>
			setState((prevState) => ({
				...prevState,
				shouldShowAnnouncement: value,
			})),
		setMcpServers: (mcpServers: McpServer[]) => setMcpServers(mcpServers),
		setRequestyModels: (models: Record<string, ModelInfo>) => setRequestyModels(models),
		setGroqModels: (models: Record<string, ModelInfo>) => setGroqModels(models),
		setBasetenModels: (models: Record<string, ModelInfo>) => setBasetenModels(models),
		setHuggingFaceModels: (models: Record<string, ModelInfo>) => setHuggingFaceModels(models),
		setMcpMarketplaceCatalog: (catalog: McpMarketplaceCatalog) => setMcpMarketplaceCatalog(catalog),
		setShowMcp,
		closeMcpView,
<<<<<<< HEAD
		setChatSettings: async (value) => {
			try {
				// CARET MODIFICATION: Mission 2 - 간단한 로깅으로 모드 동기화 문제 추적
				const { caretWebviewLogger } = await import("../caret/utils/webview-logger")
				caretWebviewLogger.info("📤 [SEND] setChatSettings called", {
					currentMode: state.chatSettings.mode,
					newMode: value.mode,
					modeChanged: state.chatSettings.mode !== value.mode,
				})

				// Import the conversion functions
				const { convertApiConfigurationToProtoApiConfiguration } = await import(
					"@shared/proto-conversions/state/settings-conversion"
				)
				const { convertChatSettingsToProtoChatSettings } = await import(
					"@shared/proto-conversions/state/chat-settings-conversion"
				)

				caretWebviewLogger.info("🚀 [BACKEND] Sending updateSettings to backend")
				await StateServiceClient.updateSettings(
					UpdateSettingsRequest.create({
						chatSettings: convertChatSettingsToProtoChatSettings(value),
						apiConfiguration: state.apiConfiguration
							? convertApiConfigurationToProtoApiConfiguration(state.apiConfiguration)
							: undefined,
						telemetrySetting: state.telemetrySetting,
						chatbotAgentSeparateModelsSetting: state.planActSeparateModelsSetting,
						enableCheckpointsSetting: state.enableCheckpointsSetting,
						mcpMarketplaceEnabled: state.mcpMarketplaceEnabled,
						mcpRichDisplayEnabled: state.mcpRichDisplayEnabled,
						mcpResponsesCollapsed: state.mcpResponsesCollapsed,
					}),
				)
				caretWebviewLogger.info("✅ [BACKEND] updateSettings completed")

				// Frontend 상태 업데이트
				caretWebviewLogger.info("💾 [SAVE] Updating frontend state")
				setState((prevState) => ({
					...prevState,
					chatSettings: value,
				}))

				caretWebviewLogger.info("🔄 [SYNC] setChatSettings completed")
			} catch (error) {
				console.error("Failed to update chat settings:", error)
			}
		},
=======
>>>>>>> upstream/main
		setGlobalClineRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				globalClineRulesToggles: toggles,
			})),
		setLocalClineRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localClineRulesToggles: toggles,
			})),
		setLocalCaretRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localCaretRulesToggles: toggles,
			})),
		setLocalCursorRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localCursorRulesToggles: toggles,
			})),
		setLocalWindsurfRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localWindsurfRulesToggles: toggles,
			})),
		setLocalWorkflowToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localWorkflowToggles: toggles,
			})),
		setGlobalWorkflowToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				globalWorkflowToggles: toggles,
			})),
		setMcpTab,
		setTotalTasksSize,
		refreshOpenRouterModels,
		onRelinquishControl,
<<<<<<< HEAD
		// CARET MODIFICATION: UI 언어만 업데이트하는 별도 함수 - chatSettings 충돌 방지
		setUILanguage: async (language: string) => {
			try {
				// UI 언어만 업데이트 (다른 설정 포함하지 않음)
				await StateServiceClient.updateSettings(
					UpdateSettingsRequest.create({
						uiLanguage: language, // 오직 이것만 업데이트
					}),
				)

				// Frontend 상태 업데이트
				setState((prevState) => ({
					...prevState,
					uiLanguage: language,
					chatSettings: {
						...prevState.chatSettings,
						uiLanguage: language,
					},
				}))

				console.log("[DEBUG] 🌐 setUILanguage completed:", language)
			} catch (error) {
				console.error("Failed to update UI language:", error)
			}
		},
		// CARET MODIFICATION: Mode system setter for Caret/Cline interface switching
		setModeSystem: async (modeSystem: string) => {
			try {
				// CARET MODIFICATION: Mission 2 - 모드 변경 감지 및 자동 New Task
				const currentModeSystem = state.chatSettings.modeSystem
				const isModeChanged = currentModeSystem !== modeSystem

				// CARET MODIFICATION: 기본값 설정 로직 - Caret=Agent, Cline=Plan
				let defaultMode: "chatbot" | "agent" | "plan" | "act"

				// 모드 시스템 변경 시 해당 시스템의 기본값으로 설정
				if (modeSystem === "caret") {
					// Caret 모드: 기본값은 항상 agent
					defaultMode = "agent"
				} else if (modeSystem === "cline") {
					// Cline 모드: 기본값은 항상 plan
					defaultMode = "plan"
				} else {
					// 알 수 없는 모드 시스템인 경우 현재 모드 유지
					defaultMode = state.chatSettings.mode
				}

				// Import the conversion functions for proper chat settings update
				const { convertChatSettingsToProtoChatSettings } = await import(
					"@shared/proto-conversions/state/chat-settings-conversion"
				)

				const updatedChatSettings = {
					...state.chatSettings,
					mode: defaultMode,
					modeSystem,
				}

				// Update both modeSystem and mode if needed
				await StateServiceClient.updateSettings(
					UpdateSettingsRequest.create({
						modeSystem,
						chatSettings: convertChatSettingsToProtoChatSettings(updatedChatSettings),
					}),
				)

				// Update frontend state with both modeSystem and default mode
				setState((prevState) => ({
					...prevState,
					chatSettings: updatedChatSettings,
				}))

				// CARET MODIFICATION: Mission 2 - 모드 변경 시 자동 New Task 트리거
				if (isModeChanged) {
					try {
						const { TaskServiceClient } = await import("../services/grpc-client")
						const { EmptyRequest } = await import("@shared/proto/common")

						// 기존 태스크 정리
						await TaskServiceClient.clearTask(EmptyRequest.create({}))

						console.log(
							`[DEBUG] 🔄 Mode changed from ${currentModeSystem} to ${modeSystem} - Auto New Task triggered`,
						)
					} catch (taskError) {
						console.error("Failed to trigger auto new task after mode change:", taskError)
						// 모드 변경은 성공했으므로 에러를 던지지 않음
					}
				}

				console.log("[DEBUG] 🔧 setModeSystem completed:", modeSystem, "with default mode:", defaultMode)
			} catch (error) {
				console.error("Failed to update mode system:", error)
			}
		},
=======
		setUserInfo: (userInfo?: UserInfo) => setState((prevState) => ({ ...prevState, userInfo })),
>>>>>>> upstream/main
	}

	return <ExtensionStateContext.Provider value={contextValue}>{children}</ExtensionStateContext.Provider>
}

export const useExtensionState = () => {
	const context = useContext(ExtensionStateContext)
	if (context === undefined) {
		throw new Error("useExtensionState must be used within an ExtensionStateContextProvider")
	}
	return context
}
