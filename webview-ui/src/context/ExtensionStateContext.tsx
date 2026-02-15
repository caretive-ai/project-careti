import type React from "react"
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import "../../../src/shared/webview/types"
import { getCurrentFeatureConfig } from "@careti/shared/FeatureConfig"
// CARETI MODIFICATION: Careti 전역 브랜드 모드 시스템 타입과 유틸리티 임포트 (careti-src에서)
import { type CaretModeSystem } from "@careti/shared/ModeSystem"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings"
import { findLastIndex } from "@shared/array"
import { DEFAULT_BROWSER_SETTINGS } from "@shared/BrowserSettings"
// import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
// CARETI MODIFICATION: Import CaretUser from @shared/CaretiAccount instead of defining locally
import type { CaretUser } from "@shared/CaretiAccount"
import type { CaretSettings } from "@shared/CaretiSettings"
import { DEFAULT_CARET_SETTINGS } from "@shared/CaretiSettings"
import { ClineFeatureSetting } from "@shared/ClineFeatureSetting"
import { DEFAULT_DICTATION_SETTINGS, type DictationSettings } from "@shared/DictationSettings"
import { DEFAULT_PLATFORM, type ExtensionState } from "@shared/ExtensionMessage"
import { DEFAULT_FOCUS_CHAIN_SETTINGS } from "@shared/FocusChainSettings"
import { DEFAULT_MCP_DISPLAY_MODE } from "@shared/McpDisplayMode"
import type { UserInfo } from "@shared/proto/cline/account"
import { EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import type { OpenRouterCompatibleModelInfo } from "@shared/proto/cline/models"
import { OnboardingModelGroup, type TerminalProfile } from "@shared/proto/cline/state"
import * as proto from "@shared/proto/index"
import { convertProtoToClineMessage } from "@shared/proto-conversions/cline-message"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { fromProtobufModels } from "@shared/proto-conversions/models/typeConversion"
import caretBannerAsset from "@/careti/assets/welcome-banner.webp?inline"
import { Environment } from "../../../src/config"
import {
    basetenDefaultModelId,
    basetenModels,
    caretDefaultModelId,
    caretModels,
    groqDefaultModelId,
    groqModels,
    type ModelInfo,
    openRouterDefaultModelId,
    openRouterDefaultModelInfo,
    requestyDefaultModelId,
    requestyDefaultModelInfo,
    vercelAiGatewayDefaultModelId,
    vercelAiGatewayDefaultModelInfo,
} from "../../../src/shared/api"
import type { McpMarketplaceCatalog, McpServer, McpViewTab } from "../../../src/shared/mcp"
import { convertPreferredLanguageToSupported } from "../careti/utils/i18n"
// CARETI MODIFICATION: Import caretWebviewLogger for debug logging
import { caretWebviewLogger } from "../careti/utils/webview-logger"
import {
    CaretSystemServiceClient,
    McpServiceClient,
    ModelsServiceClient,
    StateServiceClient,
    UiServiceClient,
} from "../services/grpc-client"

type ToolImageCacheEntry = {
	dataUrl: string
	workspaceRelativePath?: string
	workspaceAbsolutePath?: string
}

// CARETI NOTE: CaretUser type now imported from @shared/CaretiAccount above

export interface ExtensionStateContextType extends ExtensionState {
	caretSettings?: CaretSettings
	didHydrateState: boolean
	showWelcome: boolean
	onboardingModels: OnboardingModelGroup | undefined
	// CARETI MODIFICATION: Add caretUser state for Careti account system
	caretUser: CaretUser | null
	openRouterModels: Record<string, ModelInfo>
	hicapModels: Record<string, ModelInfo>
	openAiModels: string[]
	requestyModels: Record<string, ModelInfo>
	groqModels: Record<string, ModelInfo>
	caretModels: Record<string, ModelInfo>
	basetenModels: Record<string, ModelInfo>
	huggingFaceModels: Record<string, ModelInfo>
	vercelAiGatewayModels: Record<string, ModelInfo>
	mcpServers: McpServer[]
	mcpMarketplaceCatalog: McpMarketplaceCatalog
	totalTasksSize: number | null
	availableTerminalProfiles: TerminalProfile[]
	expandTaskHeader: boolean
	toolImageCache: Record<string, ToolImageCacheEntry>
	// CARETI MODIFICATION: Add caretBanner for Careti welcome page logo
	caretBanner: string

	// CARETI MODIFICATION: Persona system settings (restored from careti-compare)
	enablePersonaSystem: boolean
	currentPersona: string | null
	personaProfile: {
		name?: string
		description?: string
		custom_instruction?: string
		avatar_uri?: string
		thinking_avatar_uri?: string
	} | null

	// View state
	showMcp: boolean
	mcpTab?: McpViewTab
	showSettings: boolean
	showHistory: boolean
	showAccount: boolean
	showAnnouncement: boolean
	showChatModelSelector: boolean
	checkpointTrackerErrorMessage?: string
	featureConfig?: any
	isCliSubagent: boolean

	// Setters
	setShowAnnouncement: (value: boolean) => void
	setShouldShowAnnouncement: (value: boolean) => void
	setShowChatModelSelector: (value: boolean) => void
	// CARETI MODIFICATION: 전역 브랜드 모드 플래그 설정 함수
	setModeSystem: (modeSystem: CaretModeSystem) => Promise<void>
	// CARETI MODIFICATION: Persona system setters (restored from careti-compare)
	setEnablePersonaSystem: (enabled: boolean) => Promise<void>
	setCurrentPersona: (personaId: string | null) => void
	setPersonaProfile: (
		profile: {
			name?: string
			description?: string
			custom_instruction?: string
			avatar_uri?: string
			thinking_avatar_uri?: string
		} | null,
	) => void
	setMcpServers: (value: McpServer[]) => void
	setRequestyModels: (value: Record<string, ModelInfo>) => void
	setGroqModels: (value: Record<string, ModelInfo>) => void
	setCaretModels: (value: Record<string, ModelInfo>) => void
	setBasetenModels: (value: Record<string, ModelInfo>) => void
	setHuggingFaceModels: (value: Record<string, ModelInfo>) => void
	setVercelAiGatewayModels: (value: Record<string, ModelInfo>) => void
	setHicapModels: (value: Record<string, ModelInfo>) => void
	setGlobalClineRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalClineRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalCaretRulesToggles: (toggles: Record<string, boolean>) => void // CARETI MODIFICATION: Add careti rules setter
	setInputHistory: (history: string[]) => void // CARETI MODIFICATION: Input history setter
	setLocalCursorRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalWindsurfRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalAgentsRulesToggles: (toggles: Record<string, boolean>) => void
	setLocalWorkflowToggles: (toggles: Record<string, boolean>) => void
	setGlobalWorkflowToggles: (toggles: Record<string, boolean>) => void
	// CARETI MODIFICATION: Skills toggles setters
	setGlobalSkillsToggles: (toggles: Record<string, boolean>) => void
	setLocalSkillsToggles: (toggles: Record<string, boolean>) => void
	setRemoteRulesToggles: (toggles: Record<string, boolean>) => void
	setRemoteWorkflowToggles: (toggles: Record<string, boolean>) => void
	setMcpMarketplaceCatalog: (value: McpMarketplaceCatalog) => void
	setTotalTasksSize: (value: number | null) => void
	setExpandTaskHeader: (value: boolean) => void
	setShowWelcome: (value: boolean) => void
	setOnboardingModels: (value: OnboardingModelGroup | undefined) => void
	setDictationSettings: (value: DictationSettings) => void

	// Refresh functions
	refreshOpenRouterModels: () => void
	refreshHicapModels: () => void
	setUserInfo: (userInfo?: UserInfo) => void
	// CARETI MODIFICATION: Careti user management
	setCaretUser: (user: CaretUser | null) => void

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

export const ExtensionStateContext = createContext<ExtensionStateContextType | undefined>(undefined)

export const ExtensionStateContextProvider: React.FC<{
	children: React.ReactNode
}> = ({ children }) => {
	// Get the current webview provider type
	const currentProviderType = window.WEBVIEW_PROVIDER_TYPE === "sidebar" ? "sidebar" : "tab"
	// UI view state
	const [showMcp, setShowMcp] = useState(false)
	const [mcpTab, setMcpTab] = useState<McpViewTab | undefined>(undefined)
	const [showSettings, setShowSettings] = useState(false)
	const [showHistory, setShowHistory] = useState(false)
	const [showAccount, setShowAccount] = useState(false)
	const [showAnnouncement, setShowAnnouncement] = useState(false)
	const [showChatModelSelector, setShowChatModelSelector] = useState(false)
	// CARETI MODIFICATION: Careti user state
	const [caretUser, setCaretUserState] = useState<CaretUser | null>(null)

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
		dictationSettings: DEFAULT_DICTATION_SETTINGS,
		focusChainSettings: DEFAULT_FOCUS_CHAIN_SETTINGS,
		focusChainFeatureFlagEnabled: true,
		preferredLanguage: "English",
		openaiReasoningEffort: "medium",
		// CARETI MODIFICATION: Use DEFAULT_CARET_SETTINGS.mode instead of hardcoded "act"
		mode: DEFAULT_CARET_SETTINGS.mode,
		// CARETI MODIFICATION: Careti 전역 브랜드 모드 플래그 기본값 - feature-config에서 가져옴
		modeSystem: getCurrentFeatureConfig().defaultModeSystem as CaretModeSystem,
		showChatModelSelector: false,
		featureConfig: undefined,
		checkpointTrackerErrorMessage: undefined,
		platform: DEFAULT_PLATFORM,
		environment: Environment.production,
		telemetrySetting: "unset",
		distinctId: "",
		planActSeparateModelsSetting: false,
		enableCheckpointsSetting: true,
		mcpDisplayMode: DEFAULT_MCP_DISPLAY_MODE,
		globalClineRulesToggles: {},
		localClineRulesToggles: {},
		localCaretRulesToggles: {}, // CARETI MODIFICATION: Add careti rules state
		localCursorRulesToggles: {},
		localWindsurfRulesToggles: {},
		localAgentsRulesToggles: {},
		localWorkflowToggles: {},
		globalWorkflowToggles: {},
		remoteRulesToggles: {},
		remoteWorkflowToggles: {},
		shellIntegrationTimeout: 4000,
		terminalReuseEnabled: true,
		vscodeTerminalExecutionMode: "vscodeTerminal",
		terminalOutputLineLimit: 500,
		maxConsecutiveMistakes: 3,
		subagentTerminalOutputLineLimit: 2000,
		defaultTerminalProfile: "default",
		backgroundCommandRunning: false,
		backgroundCommandTaskId: undefined,
		lastCompletedCommandTs: undefined,
		isNewUser: false,
		welcomeViewCompleted: false,
		onboardingModels: undefined,
		mcpResponsesCollapsed: false, // Default value (expanded), will be overwritten by extension state
		strictPlanModeEnabled: false,
		yoloModeToggled: false,
		customPrompt: undefined,
		useAutoCondense: false,
		autoCondenseThreshold: undefined,
		imageGenerationAspectRatio: undefined,
		imageGenerationSize: undefined,
		// CARETI MODIFICATION: Image analysis model selection
		imageAnalysisModel: undefined,
		// CARETI MODIFICATION: Initialize caretBanner with actual banner image
		caretBanner: caretBannerAsset,
		// CARETI MODIFICATION: Initialize persona system from backend globalState only
		enablePersonaSystem: getCurrentFeatureConfig().defaultPersonaEnabled, // Default value, will be overridden by backend
		favoritedModelIds: [],
		workspaceRoots: [],
		primaryRootIndex: 0,
		isMultiRootWorkspace: false,
		multiRootSetting: {
			user: false,
			featureFlag: false,
		},
		hooksEnabled: { user: false, featureFlag: false } as ClineFeatureSetting,
		// CARETI MODIFICATION: Skills system
		skillsEnabled: false,
		globalSkillsToggles: {} as Record<string, boolean>,
		localSkillsToggles: {} as Record<string, boolean>,
		// CARETI MODIFICATION: Background edit
		backgroundEditEnabled: false,
		nativeToolCallSetting: { user: false, featureFlag: false } as ClineFeatureSetting,
		remoteConfigSettings: {},
		subagentsEnabled: false,
		lastDismissedInfoBannerVersion: 0,
		lastDismissedModelBannerVersion: 0,
		lastDismissedCliBannerVersion: 0,
		// CARETI MODIFICATION: Add isCliSubagent state
		isCliSubagent: false,
		// CARETI MODIFICATION: Session state for interrupt/queue system
		sessionStatus: "idle" as const,
		interruptWarning: false,
		pendingInput: undefined as string | undefined,
	})
	const [didHydrateState, setDidHydrateState] = useState(false)
	const [showWelcome, setShowWelcome] = useState(false)
	const [onboardingModels, setOnboardingModels] = useState<OnboardingModelGroup | undefined>(undefined)
	const [openRouterModels, setOpenRouterModels] = useState<Record<string, ModelInfo>>({
		[openRouterDefaultModelId]: openRouterDefaultModelInfo,
	})
	const [hicapModels, setHicapModels] = useState<Record<string, ModelInfo>>({})
	const [totalTasksSize, setTotalTasksSize] = useState<number | null>(null)
	const [availableTerminalProfiles, setAvailableTerminalProfiles] = useState<TerminalProfile[]>([])
	const [expandTaskHeader, setExpandTaskHeader] = useState(true)
	const [toolImageCache, setToolImageCache] = useState<Record<string, ToolImageCacheEntry>>({})
	const toolImageCacheOrderRef = useRef<string[]>([])

	const [openAiModels, _setOpenAiModels] = useState<string[]>([])
	const [requestyModels, setRequestyModels] = useState<Record<string, ModelInfo>>({
		[requestyDefaultModelId]: requestyDefaultModelInfo,
	})
	const [groqModelsState, setGroqModels] = useState<Record<string, ModelInfo>>({
		[groqDefaultModelId]: groqModels[groqDefaultModelId],
	})
	const [caretModelsState, setCaretModels] = useState<Record<string, ModelInfo>>({
		[caretDefaultModelId]: caretModels[caretDefaultModelId],
	})
	const [basetenModelsState, setBasetenModels] = useState<Record<string, ModelInfo>>({
		[basetenDefaultModelId]: basetenModels[basetenDefaultModelId],
	})
	const [huggingFaceModels, setHuggingFaceModels] = useState<Record<string, ModelInfo>>({})
	const [vercelAiGatewayModels, setVercelAiGatewayModels] = useState<Record<string, ModelInfo>>({
		[vercelAiGatewayDefaultModelId]: vercelAiGatewayDefaultModelInfo,
	})
	const [mcpServers, setMcpServers] = useState<McpServer[]>([])
	const [mcpMarketplaceCatalog, setMcpMarketplaceCatalog] = useState<McpMarketplaceCatalog>({ items: [] })

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
	const toolImageEventsUnsubscribeRef = useRef<(() => void) | null>(null)
	const mcpMarketplaceUnsubscribeRef = useRef<(() => void) | null>(null)
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

	// CARETI MODIFICATION: Initialize modeSystem from backend on app startup
	useEffect(() => {
		const initializeModeSystem = async () => {
			try {
				caretWebviewLogger.debug("[ExtensionStateContext] Initializing modeSystem from backend...")
				const response = await CaretSystemServiceClient.GetPromptSystemMode({})
				caretWebviewLogger.debug("[ExtensionStateContext] Backend modeSystem:", response.currentMode)

				// Update frontend state to match backend
				setState((prevState) => ({
					...prevState,
					modeSystem: response.currentMode as CaretModeSystem,
				}))

				caretWebviewLogger.info(`[ExtensionStateContext] Initialized modeSystem: ${response.currentMode}`)
			} catch (error) {
				caretWebviewLogger.error("[ExtensionStateContext] Failed to initialize modeSystem:", error)
				// Keep default value on error
			}
		}

		initializeModeSystem()
	}, []) // Run only once on mount

	// Subscribe to state updates and UI events using the gRPC streaming API
	useEffect(() => {
		// Use the already defined webview provider type
		const _webviewType = currentProviderType

		// Set up state subscription
		stateSubscriptionRef.current = StateServiceClient.subscribeToState(EmptyRequest.create({}), {
			onResponse: (response) => {
				if (response.stateJson) {
					try {
						const stateData = JSON.parse(response.stateJson) as ExtensionState
						// CARETI DEBUG: Log provider values from backend state
						console.log(
							`[ESC] State received - planProvider: ${stateData.apiConfiguration?.planModeApiProvider}, actProvider: ${stateData.apiConfiguration?.actModeApiProvider}`,
						)
						if (stateData.enablePersonaSystem !== undefined) {
							caretWebviewLogger.debug(
								"Backend state received - enablePersonaSystem:",
								stateData.enablePersonaSystem,
							)
						}
						setState((prevState) => {
							// Versioning logic for autoApprovalSettings
							const incomingVersion = stateData.autoApprovalSettings?.version ?? 1
							const currentVersion = prevState.autoApprovalSettings?.version ?? 1
							const shouldUpdateAutoApproval = incomingVersion > currentVersion
							// HACK: Preserve clineMessages if currentTaskItem is the same
							if (stateData.currentTaskItem?.id === prevState.currentTaskItem?.id) {
								stateData.clineMessages = stateData.clineMessages?.length
									? stateData.clineMessages
									: prevState.clineMessages
							}

							// CARETI MODIFICATION: Use backend globalState only
							const personaSetting = stateData.enablePersonaSystem
							if (prevState.enablePersonaSystem !== personaSetting) {
								caretWebviewLogger.debug("Using backend persona setting:", personaSetting)
							}

							const newState = {
								...stateData,
								autoApprovalSettings: shouldUpdateAutoApproval
									? stateData.autoApprovalSettings
									: prevState.autoApprovalSettings,
								// CARETI MODIFICATION: Preserve localStorage persona setting
								enablePersonaSystem: personaSetting,
								localAgentsRulesToggles:
									stateData.localAgentsRulesToggles ?? prevState.localAgentsRulesToggles ?? {},
								remoteRulesToggles: stateData.remoteRulesToggles ?? prevState.remoteRulesToggles ?? {},
								remoteWorkflowToggles: stateData.remoteWorkflowToggles ?? prevState.remoteWorkflowToggles ?? {},
								hooksEnabled: stateData.hooksEnabled ?? prevState.hooksEnabled,
								nativeToolCallSetting: stateData.nativeToolCallSetting ?? prevState.nativeToolCallSetting,
								remoteConfigSettings: stateData.remoteConfigSettings ?? prevState.remoteConfigSettings ?? {},
								dictationSettings: stateData.dictationSettings ?? prevState.dictationSettings,
							}

							// CARETI MODIFICATION: Sync ExtensionState to localStorage
							if (newState.modeSystem !== undefined) {
								localStorage.setItem("careti.modeSystem", newState.modeSystem)
							}
							if (newState.mode !== undefined) {
								localStorage.setItem("careti.mode", newState.mode)
							}

							// CARETI MODIFICATION: Load input history to CaretiGlobalManager
							// if (newState.inputHistory !== undefined) {
							// 	try {
							// 		// Import CaretiGlobalManager dynamically to avoid circular deps
							// 		import("../../../careti-src/managers/CaretiGlobalManager")
							// 			.then(({ CaretiGlobalManager }) => {
							// 				CaretiGlobalManager.setInputHistoryCache(newState.inputHistory || [])
							// 				caretWebviewLogger.debug(
							// 					`[INPUT-HISTORY] Loaded ${newState.inputHistory?.length || 0} items from backend to CaretiGlobalManager`,
							// 				)
							// 			})
							// 			.catch((error) => {
							// 				caretWebviewLogger.warn("[INPUT-HISTORY] Failed to import CaretiGlobalManager:", error)
							// 			})
							// 	} catch (error) {
							// 		caretWebviewLogger.warn(
							// 			"[INPUT-HISTORY] Failed to load input history to CaretiGlobalManager:",
							// 			error,
							// 		)
							// 	}
							// }

							// Update welcome screen state based on API configuration
							if (!newState.welcomeViewCompleted && !showWelcome) {
								setShowWelcome(true)
								setOnboardingModels(newState.onboardingModels)
							} else if (newState.welcomeViewCompleted) {
								setShowWelcome(false)
								setOnboardingModels(undefined)
							}
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
		mcpButtonUnsubscribeRef.current = UiServiceClient.subscribeToMcpButtonClicked(EmptyRequest.create(), {
			onResponse: () => {
				console.log("[DEBUG] Received mcpButtonClicked event from gRPC stream")
				navigateToMcp()
			},
			onError: (error) => {
				console.error("Error in mcpButtonClicked subscription:", error)
			},
			onComplete: () => {
				console.log("mcpButtonClicked subscription completed")
			},
		})

		// Set up history button clicked subscription with webview type
		historyButtonClickedSubscriptionRef.current = UiServiceClient.subscribeToHistoryButtonClicked(
			proto.cline.EmptyRequest.create(),
			{
				onResponse: () => {
					// When history button is clicked, navigate to history view
					console.log("[DEBUG] Received history button clicked event from gRPC stream")
					navigateToHistory()
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

		// Set up settings button clicked subscription
		settingsButtonClickedSubscriptionRef.current = UiServiceClient.subscribeToSettingsButtonClicked(
			proto.cline.EmptyRequest.create(),
			{
				onResponse: () => {
					// When settings button is clicked, navigate to settings
					navigateToSettings()
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

		// Subscribe to tool image events (ephemeral UI cache)
		toolImageEventsUnsubscribeRef.current = UiServiceClient.subscribeToToolImageEvents(EmptyRequest.create({}), {
			onResponse: (event) => {
				try {
					if (!event.requestId || !event.base64) {
						return
					}
					const mimeType = event.mimeType || "image/png"
					const dataUrl = `data:${mimeType};base64,${event.base64}`
					const maxCacheSize = 20

					setToolImageCache((prev) => {
						const existingEntry = prev[event.requestId]
						const next = {
							...prev,
							[event.requestId]: {
								dataUrl,
								workspaceRelativePath: event.workspaceRelativePath || existingEntry?.workspaceRelativePath,
								workspaceAbsolutePath: event.workspaceAbsolutePath || existingEntry?.workspaceAbsolutePath,
							},
						}
						const order = toolImageCacheOrderRef.current
						const existingIndex = order.indexOf(event.requestId)
						if (existingIndex !== -1) {
							order.splice(existingIndex, 1)
						}
						order.push(event.requestId)
						while (order.length > maxCacheSize) {
							const oldest = order.shift()
							if (oldest) {
								delete next[oldest]
							}
						}
						toolImageCacheOrderRef.current = order
						return next
					})
				} catch (error) {
					console.error("Failed to process tool image event:", error)
				}
			},
			onError: (error) => {
				console.error("Error in toolImageEvents subscription:", error)
			},
			onComplete: () => {
				console.log("[DEBUG] toolImageEvents subscription completed")
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

		// Subscribe to OpenRouter models updates
		openRouterModelsUnsubscribeRef.current = ModelsServiceClient.subscribeToOpenRouterModels(EmptyRequest.create({}), {
			onResponse: (response: OpenRouterCompatibleModelInfo) => {
				console.log("[DEBUG] Received OpenRouter models update from gRPC stream")
				const models = fromProtobufModels(response.models)
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
				console.log("[DEBUG] Received account button clicked event from gRPC stream")
				navigateToAccount()
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
				relinquishControlCallbacks.current.forEach((callback) => {
					callback()
				})
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

		// CARETI MODIFICATION: Persona system now managed by backend globalState only

		// CARETI MODIFICATION: CaretiGlobalManager에서 Auth0 사용자 정보 폴링
		// const checkCaretAuth = async () => {
		// 	try {
		// 		const globalManager = CaretiGlobalManager.get()

		// 		if (globalManager.isAuthenticated()) {
		// 			const userInfo = globalManager.getUserInfo()
		// 			if (userInfo) {
		// 				const newCaretUser: CaretUser = {
		// 					uid: userInfo.sub || userInfo.id || "careti-user",
		// 					email: userInfo.email,
		// 					displayName: userInfo.name || userInfo.nickname,
		// 					photoUrl: userInfo.picture,
		// 					appBaseUrl: "https://careti.ai",
		// 				}
		// 				setCaretUserState((prevUser) => {
		// 					// Only update if user info changed to avoid unnecessary re-renders
		// 					if (!prevUser || prevUser.uid !== newCaretUser.uid || prevUser.email !== newCaretUser.email) {
		// 						console.log("[CARET-AUTH] CaretUser updated:", newCaretUser)
		// 						return newCaretUser
		// 					}
		// 					return prevUser
		// 				})
		// 			}
		// 		} else {
		// 			setCaretUserState((prevUser) => {
		// 				if (prevUser !== null) {
		// 					console.log("[CARET-AUTH] CaretUser cleared")
		// 					return null
		// 				}
		// 				return prevUser
		// 			})
		// 		}
		// 	} catch (error) {
		// 		console.warn("[CARET-AUTH] Failed to check Careti auth status:", error)
		// 	}
		// }

		// Initial check
		// checkCaretAuth()

		// Polling every 5 seconds to check for Auth0 token changes
		// const authPollingInterval = setInterval(checkCaretAuth, 5000)

		// Clean up subscriptions when component unmounts
		return () => {
			// clearInterval(authPollingInterval)
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
			if (toolImageEventsUnsubscribeRef.current) {
				toolImageEventsUnsubscribeRef.current()
				toolImageEventsUnsubscribeRef.current = null
			}
			if (mcpMarketplaceUnsubscribeRef.current) {
				mcpMarketplaceUnsubscribeRef.current()
				mcpMarketplaceUnsubscribeRef.current = null
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
		ModelsServiceClient.refreshOpenRouterModelsRpc(EmptyRequest.create({}))
			.then((response: OpenRouterCompatibleModelInfo) => {
				const models = fromProtobufModels(response.models)
				setOpenRouterModels({
					[openRouterDefaultModelId]: openRouterDefaultModelInfo, // in case the extension sent a model list without the default model
					...models,
				})
			})
			.catch((error: Error) => console.error("Failed to refresh OpenRouter models:", error))
	}, [])

	const refreshHicapModels = useCallback(() => {
		ModelsServiceClient.refreshHicapModels(EmptyRequest.create({}))
			.then((response: OpenRouterCompatibleModelInfo) => {
				setHicapModels({
					...response.models,
				})
			})
			.catch((error: Error) => console.error("Failed to refresh Hicap models:", error))
	}, [])

	// Create CaretSettings from ExtensionState fields
	const caretSettings: CaretSettings = {
		...DEFAULT_CARET_SETTINGS,
		mode: state.mode as "chatbot" | "agent" | "plan" | "act",
		modeSystem: state.modeSystem,
		preferredLanguage: state.preferredLanguage,
		uiLanguage: convertPreferredLanguageToSupported(state.preferredLanguage),
		openAIReasoningEffort: state.openaiReasoningEffort,
	}

	const contextValue: ExtensionStateContextType = {
		...state,
		caretSettings,
		didHydrateState,
		showWelcome,
		onboardingModels,
		// CARETI MODIFICATION: Add caretUser to context
		caretUser,
		openRouterModels,
		hicapModels,
		openAiModels,
		requestyModels,
		groqModels: groqModelsState,
		caretModels: caretModelsState,
		basetenModels: basetenModelsState,
		showChatModelSelector,
		setShowChatModelSelector,
		huggingFaceModels,
		vercelAiGatewayModels,
		mcpServers,
		mcpMarketplaceCatalog,
		totalTasksSize,
		availableTerminalProfiles,
		expandTaskHeader,
		toolImageCache,
		// CARETI MODIFICATION: Add caretBanner to context value with window injection fallback
		caretBanner: (window as any).caretBannerImage || state.caretBanner || caretBannerAsset,

		// CARETI MODIFICATION: Persona system values
		enablePersonaSystem: state.enablePersonaSystem ?? false,
		currentPersona: state.currentPersona || null,
			personaProfile: state.personaProfile || {
				name: "Careti",
				description: "친근하고 도움되는 코딩 로봇 조수",
				custom_instruction: "",
				avatar_uri: "asset:/assets/template_characters/careti.webp",
				thinking_avatar_uri: "asset:/assets/template_characters/careti-thinking.webp",
			},

		showMcp,
		mcpTab,
		showSettings,
		showHistory,
		showAccount,
		showAnnouncement,
		globalClineRulesToggles: state.globalClineRulesToggles || {},
		localClineRulesToggles: state.localClineRulesToggles || {},
		localCursorRulesToggles: state.localCursorRulesToggles || {},
		localWindsurfRulesToggles: state.localWindsurfRulesToggles || {},
		localAgentsRulesToggles: state.localAgentsRulesToggles || {},
		localWorkflowToggles: state.localWorkflowToggles || {},
		globalWorkflowToggles: state.globalWorkflowToggles || {},
		remoteRulesToggles: state.remoteRulesToggles || {},
		remoteWorkflowToggles: state.remoteWorkflowToggles || {},
		enableCheckpointsSetting: state.enableCheckpointsSetting,
		currentFocusChainChecklist: state.currentFocusChainChecklist,
		hooksEnabled: state.hooksEnabled || { user: false, featureFlag: false },
		nativeToolCallSetting: state.nativeToolCallSetting || { user: false, featureFlag: false },

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
		setShowWelcome,
		setOnboardingModels,
		setShouldShowAnnouncement: (value) =>
			setState((prevState) => ({
				...prevState,
				shouldShowAnnouncement: value,
			})),
		// CARETI MODIFICATION: 전역 브랜드 모드 플래그 설정 함수 - 백엔드/프론트엔드 로깅 포함
		setModeSystem: async (modeSystem: CaretModeSystem) => {
			const previousMode = state.modeSystem
			const timestamp = new Date().toISOString()

			// 백엔드 전역 변수 로깅
			console.log("[GLOBAL-BACKEND] modeSystem state:", {
				before: previousMode,
				after: modeSystem,
				timestamp,
			})
			console.log(`[BACKEND] modeSystem changed: ${previousMode} -> ${modeSystem}`)

			// 프론트엔드 전역 변수 로깅
			console.debug("[GLOBAL-FRONTEND] modeSystem state:", {
				before: previousMode,
				after: modeSystem,
				timestamp,
			})
			console.debug(`[FRONTEND] Global modeSystem updated: ${modeSystem}`)

			// 상태 업데이트
			setState((prevState) => ({
				...prevState,
				modeSystem,
			}))

			// CARETI MODIFICATION: 백엔드 API 호출 - StateServiceClient.updateSettings
			try {
				// 백엔드에 modeSystem 변경 전송
				const request = {
					metadata: proto.cline.Metadata.create({}),
				} as any
				request.modeSystem = modeSystem
				await StateServiceClient.updateSettings(request)
				console.log(`[API] StateServiceClient.updateSettings called with modeSystem: ${modeSystem}`)
			} catch (error) {
				console.error("[API] Failed to update modeSystem via StateServiceClient:", error)
			}
		},
		setMcpServers: (mcpServers: McpServer[]) => setMcpServers(mcpServers),
		setRequestyModels: (models: Record<string, ModelInfo>) => setRequestyModels(models),
		setGroqModels: (models: Record<string, ModelInfo>) => setGroqModels(models),
		setCaretModels: (models: Record<string, ModelInfo>) => setCaretModels(models),
		setBasetenModels: (models: Record<string, ModelInfo>) => setBasetenModels(models),
		setHuggingFaceModels: (models: Record<string, ModelInfo>) => setHuggingFaceModels(models),
		setVercelAiGatewayModels: (models: Record<string, ModelInfo>) => setVercelAiGatewayModels(models),
		setHicapModels: (models: Record<string, ModelInfo>) => setHicapModels(models),
		setMcpMarketplaceCatalog: (catalog: McpMarketplaceCatalog) => setMcpMarketplaceCatalog(catalog),
		setShowMcp,
		closeMcpView,
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
		setLocalCaretRulesToggles: (
			toggles, // CARETI MODIFICATION: Add careti rules setter implementation
		) =>
			setState((prevState) => ({
				...prevState,
				localCaretRulesToggles: toggles,
			})),
		setInputHistory: (
			history, // CARETI MODIFICATION: Input history setter implementation
		) =>
			setState((prevState) => ({
				...prevState,
				inputHistory: history,
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
		setLocalAgentsRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localAgentsRulesToggles: toggles,
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
		// CARETI MODIFICATION: Skills toggles setters
		setGlobalSkillsToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				globalSkillsToggles: toggles,
			})),
		setLocalSkillsToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				localSkillsToggles: toggles,
			})),
		setRemoteRulesToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				remoteRulesToggles: toggles,
			})),
		setRemoteWorkflowToggles: (toggles) =>
			setState((prevState) => ({
				...prevState,
				remoteWorkflowToggles: toggles,
			})),
		setExpandTaskHeader,
		setMcpTab,
		setTotalTasksSize,
		refreshOpenRouterModels,
		refreshHicapModels,
		onRelinquishControl,
		// CARETI MODIFICATION: Persona system setters - also save to localStorage and backend
		setEnablePersonaSystem: async (enabled: boolean) => {
			const isChanging = state.enablePersonaSystem !== enabled

			if (isChanging) {
				caretWebviewLogger.debug("setEnablePersonaSystem called:", { enabled, currentState: state.enablePersonaSystem })
			}

			setState((prevState) => {
				if (isChanging) {
					caretWebviewLogger.debug("setState called:", { prevState: prevState.enablePersonaSystem, newState: enabled })
				}
				return {
					...prevState,
					enablePersonaSystem: enabled,
				}
			})

			// CARETI MODIFICATION: Send to backend globalState only (no localStorage)
			try {
				const request = {
					metadata: proto.cline.Metadata.create({}),
				} as any
				request.enablePersonaSystem = enabled
				await StateServiceClient.updateSettings(request)
				if (isChanging) {
					caretWebviewLogger.debug("Sent to backend via StateServiceClient:", enabled)
				}
			} catch (error) {
				caretWebviewLogger.error("Failed to update backend persona system setting:", error)
			}
		},
		setCurrentPersona: (personaId: string | null) =>
			setState((prevState) => ({
				...prevState,
				currentPersona: personaId,
			})),
		setPersonaProfile: (
			profile: {
				name?: string
				description?: string
				custom_instruction?: string
				avatar_uri?: string
				thinking_avatar_uri?: string
			} | null,
		) =>
			setState((prevState) => ({
				...prevState,
				personaProfile: profile,
			})),
		setUserInfo: (userInfo?: UserInfo) => setState((prevState) => ({ ...prevState, userInfo })),
		setDictationSettings: (value: DictationSettings) =>
			setState((prevState) => ({
				...prevState,
				dictationSettings: value,
			})),
		// CARETI MODIFICATION: setCaretUser implementation
		setCaretUser: (user: CaretUser | null) => {
			console.log("[CARET-AUTH] setCaretUser called with:", user)
			setCaretUserState(user)
		},
		isCliSubagent: state.isCliSubagent,
		// CARETI MODIFICATION: Session state for interrupt/queue system
		sessionStatus: state.sessionStatus,
		interruptWarning: state.interruptWarning,
		pendingInput: state.pendingInput,
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
