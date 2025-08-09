import { render, screen, act, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import App from "../App" // Assuming App.tsx is in src/
import { ExtensionStateContext } from "../context/ExtensionStateContext"
import { type ExtensionState, DEFAULT_PLATFORM } from "@shared/ExtensionMessage" // Corrected import path for ExtensionState
import * as i18nUtils from "../caret/utils/i18n" // To spy on setGlobalUILanguage
import { type SupportedLanguage } from "../caret/constants/urls"
import { DEFAULT_CHAT_SETTINGS } from "@shared/ChatSettings"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings"
import { DEFAULT_BROWSER_SETTINGS } from "@shared/BrowserSettings"

// Mock i18n module to track calls to setGlobalUILanguage
vi.mock("../caret/utils/i18n", () => ({
	setGlobalUILanguage: vi.fn(),
	t: (key: string) => {
		// Return different values based on global language
		if (key === "settings.title") return "Settings"
		return key
	},
}))

// Mock gRPC services
vi.mock("../services/grpc-client", () => ({
	UiServiceClient: {
		onDidShowAnnouncement: vi.fn().mockResolvedValue({ value: false }),
		subscribeToAddToInput: vi.fn(() => vi.fn()),
		subscribeToPartialMessage: vi.fn(() => vi.fn()),
		getWebviewProviderType: vi.fn().mockResolvedValue({ type: 0 }),
		subscribeToFocusChatInput: vi.fn(() => vi.fn()),
		subscribeToMcpButtonClicked: vi.fn(() => vi.fn()),
		subscribeToHistoryButtonClicked: vi.fn(() => vi.fn()),
		subscribeToChatButtonClicked: vi.fn(() => vi.fn()),
		subscribeToAccountButtonClicked: vi.fn(() => vi.fn()),
		subscribeToSettingsButtonClicked: vi.fn(() => vi.fn()),
	},
	StateServiceClient: {
		updateSettings: vi.fn().mockResolvedValue({}),
		getState: vi.fn().mockResolvedValue({
			toObject: () => ({
				version: "test-version",
				chatSettings: DEFAULT_CHAT_SETTINGS,
				autoApprovalSettings: DEFAULT_AUTO_APPROVAL_SETTINGS,
				browserSettings: DEFAULT_BROWSER_SETTINGS,
				platform: DEFAULT_PLATFORM,
				telemetrySetting: "unset",
				distinctId: "test-id",
				planActSeparateModelsSetting: true,
				enableCheckpointsSetting: true,
				mcpRichDisplayEnabled: true,
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
				mcpResponsesCollapsed: false,
				uiLanguage: "en",
				clineMessagesList: [],
				taskHistoryList: [],
				shouldShowAnnouncement: false,
				mcpMarketplaceEnabled: true,
			}),
		}),
		subscribeToState: vi.fn(() => vi.fn()),
	},
	ModelsServiceClient: {
		getModels: vi.fn().mockResolvedValue({ modelsList: [] }),
		getOpenRouterModels: vi.fn().mockResolvedValue({ modelsList: [] }),
	},
	FileServiceClient: {
		subscribeToPartialMessage: vi.fn(() => vi.fn()),
		subscribeToWorkspaceUpdates: vi.fn(() => vi.fn()),
	},
	McpServiceClient: {
		subscribeToMcpMarketplaceCatalog: vi.fn(() => vi.fn()),
		subscribeToMcpServers: vi.fn(() => vi.fn()),
	},
}))

// Mock the Providers component
vi.mock("../Providers", () => ({
	Providers: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// A simplified mock for ExtensionStateContext value
const getMockState = (uiLanguage: SupportedLanguage, showSettingsView: boolean = false): ExtensionState => ({
	version: "test-version",
	clineMessages: [],
	taskHistory: [],
	shouldShowAnnouncement: false,
	autoApprovalSettings: DEFAULT_AUTO_APPROVAL_SETTINGS,
	browserSettings: DEFAULT_BROWSER_SETTINGS,
	chatSettings: { ...DEFAULT_CHAT_SETTINGS, uiLanguage },
	platform: DEFAULT_PLATFORM,
	telemetrySetting: "unset",
	distinctId: "test-id",
	planActSeparateModelsSetting: true,
	enableCheckpointsSetting: true,
	mcpRichDisplayEnabled: true,
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
	mcpResponsesCollapsed: false,
	mcpMarketplaceEnabled: true,
	uiLanguage: uiLanguage,
})

describe("App Component - UI Language Switching", () => {
	let mockSetGlobalUILanguage: ReturnType<typeof vi.spyOn>

	beforeEach(() => {
		// Reset mocks before each test
		vi.clearAllMocks()
		// Spy on the actual (or mocked) setGlobalUILanguage
		// We are mocking the entire module, so we spy on the mock.
		mockSetGlobalUILanguage = vi.spyOn(i18nUtils, "setGlobalUILanguage")
	})

	const renderAppWithState = (language: SupportedLanguage, showSettingsView: boolean = false) => {
		const mockState = getMockState(language, showSettingsView)
		// Need to provide all functions, even if just vi.fn()
		const mockFunctions = {
			didHydrateState: true,
			showWelcome: false,
			theme: {},
			openRouterModels: {},
			openAiModels: [],
			requestyModels: {},
			mcpServers: [],
			mcpMarketplaceCatalog: { items: [] },
			filePaths: [],
			totalTasksSize: null,
			availableTerminalProfiles: [],
			caretBanner: "",
			personaProfile: "",
			personaThinking: "",
			showMcp: false,
			mcpTab: undefined,
			showSettings: showSettingsView,
			showHistory: false,
			showAccount: false,
			showAnnouncement: false,
			setApiConfiguration: vi.fn(),
			setTelemetrySetting: vi.fn(),
			setShowAnnouncement: vi.fn(),
			setShouldShowAnnouncement: vi.fn(),
			setPlanActSeparateModelsSetting: vi.fn(),
			setEnableCheckpointsSetting: vi.fn(),
			setMcpMarketplaceEnabled: vi.fn(),
			setMcpRichDisplayEnabled: vi.fn(),
			setMcpResponsesCollapsed: vi.fn(),
			setShellIntegrationTimeout: vi.fn(),
			setTerminalReuseEnabled: vi.fn(),
			setTerminalOutputLineLimit: vi.fn(),
			setDefaultTerminalProfile: vi.fn(),
			setChatSettings: vi.fn(),
			setUILanguage: vi.fn(),
			setModeSystem: vi.fn(), // CARET MODIFICATION: Add modeSystem mock
			setMcpServers: vi.fn(),
			setGlobalClineRulesToggles: vi.fn(),
			setLocalClineRulesToggles: vi.fn(),
			setLocalCaretRulesToggles: vi.fn(),
			setLocalCursorRulesToggles: vi.fn(),
			setLocalWindsurfRulesToggles: vi.fn(),
			setLocalWorkflowToggles: vi.fn(),
			setGlobalWorkflowToggles: vi.fn(),
			setMcpMarketplaceCatalog: vi.fn(),
			setTotalTasksSize: vi.fn(),
			setAvailableTerminalProfiles: vi.fn(),
			refreshOpenRouterModels: vi.fn(),
			setShowMcp: vi.fn(),
			setMcpTab: vi.fn(),
			navigateToMcp: vi.fn(),
			navigateToSettings: vi.fn(),
			navigateToHistory: vi.fn(),
			navigateToAccount: vi.fn(),
			navigateToChat: vi.fn(),
			hideSettings: vi.fn(),
			hideHistory: vi.fn(),
			hideAccount: vi.fn(),
			hideAnnouncement: vi.fn(),
			closeMcpView: vi.fn(),
			onRelinquishControl: vi.fn(),
		}

		return render(
			<ExtensionStateContext.Provider value={{ ...mockState, ...mockFunctions }}>
				<App />
			</ExtensionStateContext.Provider>,
		)
	}

	it("should call setGlobalUILanguage when App renders with a language", async () => {
		// Render with English language
		renderAppWithState("en", false)

		// Wait for useEffect to be called
		await waitFor(() => {
			expect(mockSetGlobalUILanguage).toHaveBeenCalledWith("en")
		})
	})

	it("should call setGlobalUILanguage when language changes", async () => {
		// Render with English first
		const { rerender } = renderAppWithState("en", false)

		await waitFor(() => {
			expect(mockSetGlobalUILanguage).toHaveBeenCalledWith("en")
		})

		// Clear previous calls
		mockSetGlobalUILanguage.mockClear()

		// Re-render with Korean
		const koreanState = getMockState("ko", false)
		const mockFunctions = {
			didHydrateState: true,
			showWelcome: false,
			theme: {},
			openRouterModels: {},
			openAiModels: [],
			requestyModels: {},
			mcpServers: [],
			mcpMarketplaceCatalog: { items: [] },
			filePaths: [],
			totalTasksSize: null,
			availableTerminalProfiles: [],
			caretBanner: "",
			personaProfile: "",
			personaThinking: "",
			showMcp: false,
			mcpTab: undefined,
			showSettings: false,
			showHistory: false,
			showAccount: false,
			showAnnouncement: false,
			setApiConfiguration: vi.fn(),
			setTelemetrySetting: vi.fn(),
			setShowAnnouncement: vi.fn(),
			setShouldShowAnnouncement: vi.fn(),
			setPlanActSeparateModelsSetting: vi.fn(),
			setEnableCheckpointsSetting: vi.fn(),
			setMcpMarketplaceEnabled: vi.fn(),
			setMcpRichDisplayEnabled: vi.fn(),
			setMcpResponsesCollapsed: vi.fn(),
			setShellIntegrationTimeout: vi.fn(),
			setTerminalReuseEnabled: vi.fn(),
			setTerminalOutputLineLimit: vi.fn(),
			setDefaultTerminalProfile: vi.fn(),
			setChatSettings: vi.fn(),
			setUILanguage: vi.fn(),
			setModeSystem: vi.fn(), // CARET MODIFICATION: Add modeSystem mock
			setMcpServers: vi.fn(),
			setGlobalClineRulesToggles: vi.fn(),
			setLocalClineRulesToggles: vi.fn(),
			setLocalCaretRulesToggles: vi.fn(),
			setLocalCursorRulesToggles: vi.fn(),
			setLocalWindsurfRulesToggles: vi.fn(),
			setLocalWorkflowToggles: vi.fn(),
			setGlobalWorkflowToggles: vi.fn(),
			setMcpMarketplaceCatalog: vi.fn(),
			setTotalTasksSize: vi.fn(),
			setAvailableTerminalProfiles: vi.fn(),
			refreshOpenRouterModels: vi.fn(),
			setShowMcp: vi.fn(),
			setMcpTab: vi.fn(),
			navigateToMcp: vi.fn(),
			navigateToSettings: vi.fn(),
			navigateToHistory: vi.fn(),
			navigateToAccount: vi.fn(),
			navigateToChat: vi.fn(),
			hideSettings: vi.fn(),
			hideHistory: vi.fn(),
			hideAccount: vi.fn(),
			hideAnnouncement: vi.fn(),
			closeMcpView: vi.fn(),
			onRelinquishControl: vi.fn(),
		}

		rerender(
			<ExtensionStateContext.Provider value={{ ...koreanState, ...mockFunctions }}>
				<App />
			</ExtensionStateContext.Provider>,
		)

		await waitFor(() => {
			expect(mockSetGlobalUILanguage).toHaveBeenCalledWith("ko")
		})
	})

	// Add more tests: e.g., switching to Japanese, unsupported language fallback to English, etc.
})
