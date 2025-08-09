import React from "react"
import { render, screen } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach } from "vitest"
import PersonaAvatar from "../PersonaAvatar"
import { ExtensionStateContextProvider } from "@/context/ExtensionStateContext"
import type { TemplateCharacter } from "../../../../../src/shared/persona"

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

// Mock extension state
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
}

// Mock ExtensionStateContext
vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => mockExtensionState,
	ExtensionStateContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const testPersona: TemplateCharacter = {
	character: "test",
	avatarUri: "test://avatar.png",
	thinkingAvatarUri: "test://thinking.png",
	introIllustrationUri: "",
	en: { name: "Test", description: "Test persona", customInstruction: {} as any },
	ko: { name: "테스트", description: "테스트 페르소나", customInstruction: {} as any },
	isDefault: false,
}

describe("PersonaAvatar Simple Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset mock state
		mockExtensionState.personaProfile = ""
		mockExtensionState.personaThinking = ""
	})

	it("should render with testPersona", () => {
		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={testPersona} />
			</ExtensionStateContextProvider>,
		)

		// Assert
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("data-persona", "Test") // 테스트 모드에서는 localeDetails.name 사용
		expect(avatar).toHaveAttribute("src", "test://avatar.png")
		expect(avatar).toHaveAttribute("alt", "Test normal")
	})

	it("should render loading state", () => {
		// Act - No testPersona and no direct injection
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={null} />
			</ExtensionStateContextProvider>,
		)

		// Assert
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("data-persona", "Loading...")
		expect(avatar).toHaveAttribute("alt", "Loading... normal")
	})

	it("should render with thinking state", () => {
		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={testPersona} isThinking={true} />
			</ExtensionStateContextProvider>,
		)

		// Assert
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toBeInTheDocument()
		expect(avatar).toHaveAttribute("data-persona", "Test")
		expect(avatar).toHaveAttribute("src", "test://thinking.png")
		expect(avatar).toHaveAttribute("alt", "Test thinking")
		expect(avatar).toHaveAttribute("data-thinking", "true")
	})

	it("should render with custom size", () => {
		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={testPersona} size={64} />
			</ExtensionStateContextProvider>,
		)

		// Assert
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toHaveStyle({ width: "64px", height: "64px" })
	})

	it("should render with custom className", () => {
		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={testPersona} className="custom-class" />
			</ExtensionStateContextProvider>,
		)

		// Assert
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toHaveClass("persona-avatar", "custom-class")
	})

	it("should handle Korean locale", () => {
		// Arrange
		mockExtensionState.chatSettings = { uiLanguage: "ko" }

		// Act
		render(
			<ExtensionStateContextProvider>
				<PersonaAvatar testPersona={testPersona} />
			</ExtensionStateContextProvider>,
		)

		// Assert
		const avatar = screen.getByTestId("persona-avatar")
		expect(avatar).toHaveAttribute("data-persona", "테스트") // Korean name
		expect(avatar).toHaveAttribute("alt", "테스트 normal")
	})
}) 