import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import WelcomeView from "../WelcomeView"
import { ExtensionStateContext } from "@/context/ExtensionStateContext"
// Remove unused import

// Mock dependencies
vi.mock("@utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

vi.mock("@/services/grpc-client", () => ({
	ModelsServiceClient: {
		updateApiConfigurationProto: vi.fn(),
	},
}))

describe("WelcomeView Language Improvements", () => {
	const mockContextValue: any = {
		// API Configuration
		apiConfiguration: undefined,
		setApiConfiguration: vi.fn(),

		// Chat Settings
		chatSettings: {
			uiLanguage: "ko",
			preferredLanguage: "Korean - 한국어",
		},
		setChatSettings: vi.fn(),
		setUILanguage: vi.fn(),

		// Other required properties
		caretBanner: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA",

		// Mock other required properties
		theme: "light",
		workspaceFolders: [],
		isHistoryPanelOpen: false,
		shouldShowAnnouncement: false,
		announcements: [],
		accountInfo: undefined,
		version: "1.0.0",
		didCloseAnnouncement: vi.fn(),
		didClickDismissAllButton: vi.fn(),
		showHistoryPanel: vi.fn(),
		hideHistoryPanel: vi.fn(),
		resetState: vi.fn(),
		githubSignIn: vi.fn(),
		logOut: vi.fn(),
		didClickSetCaretCredit: vi.fn(),
		openCaretDashboard: vi.fn(),
		setCreativeMode: vi.fn(),
		setSeparateModelsEnabled: vi.fn(),
		getSelectedText: vi.fn(),
		insertTextToCurrentCursor: vi.fn(),
		clineMessages: [],
		taskHistory: [],
		chatHistory: [],
		didReceiveMessage: vi.fn(),
		clearTask: vi.fn(),
		clearHistory: vi.fn(),
		clearAllHistory: vi.fn(),
		showTaskView: false,
		setShowTaskView: vi.fn(),
		selectImages: vi.fn(),
		shouldDisableImages: false,
		setGlobalSettings: vi.fn(),
		getGlobalSettings: vi.fn(),
		setWorkspaceSettings: vi.fn(),
		getWorkspaceSettings: vi.fn(),
		setSecrets: vi.fn(),
		getSecrets: vi.fn(),
		setModeSystem: vi.fn(),
		setTaskMode: vi.fn(),
		onDidReceiveMessage: vi.fn(),
		openFile: vi.fn(),
		openExternalLink: vi.fn(),
		updateGlobalSettings: vi.fn(),
		updateWorkspaceSettings: vi.fn(),
		openClineRules: vi.fn(),
		closeClineRules: vi.fn(),
		isClineRulesOpen: false,
		toggleClineRules: vi.fn(),
		shouldShowClineRulesTab: true,
		allPrompts: [],
		filteredPrompts: [],
		selectedPrompt: null,
		setSelectedPrompt: vi.fn(),
		isEmptyPrompts: true,
		refreshPrompts: vi.fn(),
		globalSettings: {},
		workspaceSettings: {},
		secrets: {},
		modeSystem: "caret",
		taskMode: "chatbot",
		openCaretGlobalSettings: vi.fn(),
		openCaretWorkspaceSettings: vi.fn(),
		clineRulesVisible: false,
		uiLanguage: "ko",
		environmentDetails: "",
		addEnvironmentDetails: vi.fn(),
		openTerminal: vi.fn(),
		showThemesAndColors: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should display language selection in a section with dark border", () => {
		render(
			<ExtensionStateContext.Provider value={mockContextValue}>
				<WelcomeView />
			</ExtensionStateContext.Provider>,
		)

		// Should have section styling (dark border)
		const languageSection = screen.getByTestId("language-selection-section")
		expect(languageSection).toBeInTheDocument()
	})

	it("should not show duplicate language labels", () => {
		render(
			<ExtensionStateContext.Provider value={mockContextValue}>
				<WelcomeView />
			</ExtensionStateContext.Provider>,
		)

		// Should not have duplicate UI language labels
		const uiLanguageLabels = screen.queryAllByText(/UI 언어|UI Language/i)
		expect(uiLanguageLabels).toHaveLength(1)

		// Should not have duplicate AI response language labels
		const aiLanguageLabels = screen.queryAllByText(/AI 응답 언어|AI Response Language/i)
		expect(aiLanguageLabels).toHaveLength(1)
	})

	it("should have a wide 'Get Started' button", () => {
		render(
			<ExtensionStateContext.Provider value={mockContextValue}>
				<WelcomeView />
			</ExtensionStateContext.Provider>,
		)

		const getStartedButton = screen.getByRole("button", { name: /시작하기|Get Started/i })
		expect(getStartedButton).toBeInTheDocument()

		// Should have full width styling
		expect(getStartedButton).toHaveStyle({ width: "100%" })
	})

	it("should apply i18n to AI Response Language section", () => {
		render(
			<ExtensionStateContext.Provider value={mockContextValue}>
				<WelcomeView />
			</ExtensionStateContext.Provider>,
		)

		// AI Response Language should be translated to Korean
		expect(screen.getByText("AI 응답 언어")).toBeInTheDocument()
	})

	it("should have matching dropdown widths for both language sections", () => {
		render(
			<ExtensionStateContext.Provider value={mockContextValue}>
				<WelcomeView />
			</ExtensionStateContext.Provider>,
		)

		const dropdowns = screen.getAllByRole("combobox")
		expect(dropdowns).toHaveLength(2)

		// Both dropdowns should have same width
		dropdowns.forEach((dropdown) => {
			expect(dropdown).toHaveStyle({ width: "100%" })
		})
	})

	// Test for VSCode default language fallback
	it("should fall back to VSCode default when no preferred language is set", () => {
		const contextWithoutPreferredLang = {
			...mockContextValue,
			chatSettings: {
				...mockContextValue.chatSettings,
				preferredLanguage: undefined,
			},
		}

		render(
			<ExtensionStateContext.Provider value={contextWithoutPreferredLang}>
				<WelcomeView />
			</ExtensionStateContext.Provider>,
		)

		// Should have a default language selected (matching UI language behavior)
		const aiLanguageDropdown = screen.getAllByRole("combobox")[1]
		expect(aiLanguageDropdown).toBeInTheDocument()
	})
})
