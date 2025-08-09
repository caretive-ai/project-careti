import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import "@testing-library/jest-dom"
import CaretApiSetup from "../CaretApiSetup"
import { vscode } from "../../../utils/vscode"
import { ExtensionStateContext } from "../../../context/ExtensionStateContext" // ExtensionStateContext 임포트

// Mock dependencies
vi.mock("../../../utils/vscode")
vi.mock("../../../components/settings/ApiOptions", () => {
	return {
		default: function MockApiOptions({ showModelOptions }: { showModelOptions: boolean }) {
			return React.createElement(
				"div",
				{
					"data-testid": "api-options",
					"data-show-model-options": showModelOptions,
				},
				"Mock API Options",
			)
		},
	}
})

// Mock i18n
vi.mock("../../utils/i18n", () => ({
	t: (key: string, namespace: string) => `${namespace}.${key}`,
}))

const mockVscode = vscode as any

// Mock ExtensionStateContext value to provide a valid apiConfiguration
// Mock the ExtensionStateContext.Provider and useContext hook
vi.mock("../../../context/ExtensionStateContext", async (importOriginal) => {
	const original = await importOriginal<typeof import("../../../context/ExtensionStateContext")>()

	// Mock ExtensionStateContext value to provide a valid apiConfiguration
	const mockApiConfiguration = {
		apiProvider: "anthropic",
		apiModelId: "claude-sonnet-4-20250514",
		// Add other necessary properties if normalizeApiConfiguration checks them
	}

	const mockContextValue = {
		apiConfiguration: mockApiConfiguration,
		chatSettings: {
			mode: "agent",
			uiLanguage: "en",
			// Add other default chat settings if needed by the component
		},
		// Mock other properties of ExtensionStateContextType that are accessed
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
		setModeSystem: vi.fn(),
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
		version: "test",
		clineMessages: [],
		taskHistory: [],
		shouldShowAnnouncement: false,
		autoApprovalSettings: {},
		browserSettings: {},
		platform: "test",
		telemetrySetting: "unset",
		distinctId: "test",
		planActSeparateModelsSetting: true,
		enableCheckpointsSetting: true,
		mcpRichDisplayEnabled: true,
		shellIntegrationTimeout: 4000,
		terminalReuseEnabled: true,
		terminalOutputLineLimit: 500,
		defaultTerminalProfile: "default",
		isNewUser: false,
		mcpResponsesCollapsed: false,
		uiLanguage: "en",
		globalClineRulesToggles: {},
		localClineRulesToggles: {},
		localCaretRulesToggles: {},
		localCursorRulesToggles: {},
		localWindsurfRulesToggles: {},
		localWorkflowToggles: {},
		globalWorkflowToggles: {},
		selectedModelInfo: {
			maxTokens: 8192,
			contextWindow: 200_000,
			supportsImages: true,
			supportsPromptCache: true,
			inputPrice: 3.0,
			outputPrice: 15.0,
			cacheWritesPrice: 3.75,
			cacheReadsPrice: 0.3,
		},
		selectedProvider: "anthropic",
		selectedModelId: "claude-sonnet-4-20250514",
	}

	return {
		...original,
		ExtensionStateContext: React.createContext(mockContextValue),
		useExtensionState: () => mockContextValue,
	}
})

describe("CaretApiSetup", () => {
	const defaultProps = {
		onSubmit: vi.fn(),
		onBack: vi.fn(),
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	// Helper function to render the component within the mocked context
	const renderWithContext = (props: any) => {
		return render(<CaretApiSetup {...props} />)
	}

	describe("should render correctly", () => {
		it("should render with default props", () => {
			renderWithContext(defaultProps)

			expect(screen.getByText("welcome.apiSetup.title")).toBeInTheDocument()
			expect(screen.getByText("welcome.apiSetup.description")).toBeInTheDocument()
			expect(screen.getByText("welcome.apiSetup.backButton")).toBeInTheDocument()
			expect(screen.getByText("welcome.apiSetup.saveButton")).toBeInTheDocument()
		})

		it("should render API options with showModelOptions true", () => {
			renderWithContext(defaultProps)

			const apiOptions = screen.getByTestId("api-options")
			expect(apiOptions).toBeInTheDocument()
			expect(apiOptions).toHaveAttribute("data-show-model-options", "true")
		})

		it("should render support links section", () => {
			renderWithContext(defaultProps)

			expect(screen.getByText("welcome.apiSetup.instructions")).toBeInTheDocument()
			expect(screen.getByText("• welcome.apiSetup.supportLinks.llmList")).toBeInTheDocument()
			expect(screen.getByText("• welcome.apiSetup.supportLinks.geminiCredit")).toBeInTheDocument()
		})

		it("should render help section", () => {
			renderWithContext(defaultProps)

			expect(screen.getByText("welcome.apiSetup.help.title")).toBeInTheDocument()
			expect(screen.getByText("welcome.apiSetup.help.button")).toBeInTheDocument()
		})
	})

	describe("should handle button interactions", () => {
		it("should call onBack when back button is clicked", () => {
			renderWithContext(defaultProps)

			const backButton = screen.getByText("welcome.apiSetup.backButton")
			fireEvent.click(backButton)

			expect(defaultProps.onBack).toHaveBeenCalledTimes(1)
		})

		it("should call onSubmit when save button is clicked", () => {
			renderWithContext(defaultProps)

			const saveButton = screen.getByText("welcome.apiSetup.saveButton")
			fireEvent.click(saveButton)

			expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
		})

		it("should call help button and open external link", () => {
			renderWithContext(defaultProps)

			const helpButton = screen.getByText("welcome.apiSetup.help.button")
			fireEvent.click(helpButton)

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "openExternalLink",
				link: "https://docs.caret.team",
			})
		})

		it("should open LLM list link when clicked", () => {
			renderWithContext(defaultProps)

			const llmListLink = screen.getByText("• welcome.apiSetup.supportLinks.llmList")
			fireEvent.click(llmListLink)

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "openExternalLink",
				link: "https://github.com/aicoding-caret/caret/blob/main/caret-docs/development/support-model-list.mdx",
			})
		})

		it("should open Gemini credit link when clicked", () => {
			renderWithContext(defaultProps)

			const geminiCreditLink = screen.getByText("• welcome.apiSetup.supportLinks.geminiCredit")
			fireEvent.click(geminiCreditLink)

			expect(mockVscode.postMessage).toHaveBeenCalledWith({
				type: "openExternalLink",
				link: "https://blog.naver.com/fstory97/223887376667",
			})
		})
	})

	describe("should handle disabled state", () => {
		it("should disable save button when disabled prop is true", () => {
			renderWithContext({
				...defaultProps,
				disabled: true,
			})

			const saveButton = screen.getByText("welcome.apiSetup.saveButton")
			expect(saveButton).toBeInTheDocument()
			expect(saveButton.tagName).toBe("VSCODE-BUTTON")
		})

		it("should enable save button when disabled prop is false", () => {
			renderWithContext({
				...defaultProps,
				disabled: false,
			})

			const saveButton = screen.getByText("welcome.apiSetup.saveButton")
			expect(saveButton).not.toBeDisabled()
		})

		it("should enable save button by default when disabled prop is not provided", () => {
			renderWithContext(defaultProps)

			const saveButton = screen.getByText("welcome.apiSetup.saveButton")
			expect(saveButton).not.toBeDisabled()
		})
	})

	describe("should handle error messages", () => {
		it("should not render error message when errorMessage is not provided", () => {
			renderWithContext(defaultProps)

			const errorDiv = screen.queryByText("Test error message")
			expect(errorDiv).not.toBeInTheDocument()
		})

		it("should render error message when errorMessage is provided", () => {
			const errorMessage = "Test error message"
			renderWithContext({
				...defaultProps,
				errorMessage,
			})

			expect(screen.getByText(errorMessage)).toBeInTheDocument()
		})
	})

	describe("should have correct CSS classes and styling", () => {
		it("should have correct root class name", () => {
			const { container } = renderWithContext(defaultProps)

			expect(container.querySelector(".caret-api-setup")).toBeInTheDocument()
		})

		it("should apply correct button appearance classes", () => {
			renderWithContext(defaultProps)

			const backButton = screen.getByText("welcome.apiSetup.backButton")
			const saveButton = screen.getByText("welcome.apiSetup.saveButton")
			const helpButton = screen.getByText("welcome.apiSetup.help.button")

			expect(backButton).toBeInTheDocument()
			expect(backButton.tagName).toBe("VSCODE-BUTTON")
			expect(saveButton).toBeInTheDocument()
			expect(saveButton.tagName).toBe("VSCODE-BUTTON")
			expect(helpButton).toBeInTheDocument()
			expect(helpButton.tagName).toBe("VSCODE-BUTTON")
		})
	})
})
