import React from "react"
import { render, screen } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { PersonaAvatar } from "../PersonaAvatar"
import { ExtensionStateContextProvider } from "@/context/ExtensionStateContext"
import type { TemplateCharacter } from "../../../../../src/shared/persona"

// CARET MODIFICATION: PersonaAvatar 디버그 테스트 - 직접 주입 방식으로 변경
// 기존 메시지 기반 시스템에서 직접 주입 방식으로 변경된 동작을 테스트

// Mock vscode API
const mockPostMessage = vi.fn()
vi.mock("../../utils/vscode", () => ({
	vscode: {
		postMessage: mockPostMessage,
	},
}))

// Mock logger
vi.mock("../utils/webview-logger", () => ({
	caretWebviewLogger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

// Mock window globals for direct injection
const mockExtensionState = {
	personaProfile: "",
	personaThinking: "",
	chatSettings: { uiLanguage: "en" },
	didHydrateState: true,
	showWelcome: false,
	theme: undefined,
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
	showSettings: false,
	showHistory: false,
	showAccount: false,
	showAnnouncement: false,
	// ... other properties
}

// Mock ExtensionStateContext
vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => mockExtensionState,
	ExtensionStateContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("PersonaAvatar Debug Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset direct injection state
		mockExtensionState.personaProfile = ""
		mockExtensionState.personaThinking = ""
	})

	it("should render with loading state", () => {
		// Arrange - No persona images in direct injection
		mockExtensionState.personaProfile = ""
		mockExtensionState.personaThinking = ""

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={null} />
			</ExtensionStateContextProvider>,
		)

		// Assert - Should show loading state
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("data-persona", "Loading...")
		expect(avatar).toHaveAttribute("alt", "Loading... normal")
	})

	it("should NOT call vscode.postMessage when using direct injection", () => {
		// Arrange - Direct injection mode (no testPersona)
		mockExtensionState.personaProfile = ""
		mockExtensionState.personaThinking = ""

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={null} />
			</ExtensionStateContextProvider>,
		)

		// Assert - Should not call postMessage in direct injection mode
		expect(mockPostMessage).not.toHaveBeenCalled()
	})

	it("should NOT call vscode.postMessage when testPersona is provided", () => {
		// Arrange - Test persona provided
		const testPersona: TemplateCharacter = {
			character: "test",
			avatarUri: "test://avatar.png",
			thinkingAvatarUri: "test://thinking.png",
			introIllustrationUri: "",
			en: { name: "Test", description: "Test persona", customInstruction: {} as any },
			ko: { name: "테스트", description: "테스트 페르소나", customInstruction: {} as any },
			isDefault: false,
		}

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={testPersona} />
			</ExtensionStateContextProvider>,
		)

		// Assert - Should not call postMessage when testPersona is provided
		expect(mockPostMessage).not.toHaveBeenCalled()
	})

	it("should render without testPersona prop (undefined case)", () => {
		// Arrange - No testPersona, direct injection
		mockExtensionState.personaProfile = ""
		mockExtensionState.personaThinking = ""

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar />
			</ExtensionStateContextProvider>,
		)

		// Assert - Should render loading state
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("data-persona", "Loading...")

		// Should not call postMessage in direct injection mode
		expect(mockPostMessage).not.toHaveBeenCalled()
	})

	it("should render with direct injection persona images", () => {
		// Arrange - Direct injection with persona images
		mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
		mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={null} />
			</ExtensionStateContextProvider>,
		)

		// Assert - Should use injected images
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("src", "data:image/png;base64,ProfileImage")
		expect(avatar).toHaveAttribute("data-persona", "오사랑")
		expect(avatar).toHaveAttribute("alt", "오사랑 normal")
	})

	it("should switch to thinking image when isThinking is true", () => {
		// Arrange - Direct injection with persona images
		mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
		mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={null} isThinking={true} />
			</ExtensionStateContextProvider>,
		)

		// Assert - Should use thinking image
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("src", "data:image/png;base64,ThinkingImage")
		expect(avatar).toHaveAttribute("data-persona", "오사랑")
		expect(avatar).toHaveAttribute("alt", "오사랑 thinking")
		expect(avatar).toHaveAttribute("data-thinking", "true")
	})
}) 