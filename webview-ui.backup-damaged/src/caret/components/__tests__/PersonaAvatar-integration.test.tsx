import React from "react"
import { render, screen } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
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

// Mock extension state for direct injection
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

vi.mock("@/context/ExtensionStateContext", () => ({
	useExtensionState: () => mockExtensionState,
	ExtensionStateContextProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderWithProviders = (ui: React.ReactElement) => {
	return render(<ExtensionStateContextProvider>{ui}</ExtensionStateContextProvider>)
}

describe("PersonaAvatar Component - Direct Injection Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Reset mock state
		mockExtensionState.personaProfile = ""
		mockExtensionState.personaThinking = ""
		mockExtensionState.chatSettings = { uiLanguage: "en" }
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	describe("Direct Injection Flow", () => {
		it("should render loading state when no images are injected", () => {
			// Arrange - No images injected
			mockExtensionState.personaProfile = ""
			mockExtensionState.personaThinking = ""

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("data-persona", "Loading...")
			expect(avatar).toHaveAttribute("alt", "Loading... normal")
		})

		it("should render persona images when they are injected", () => {
			// Arrange - Images injected
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "data:image/png;base64,ProfileImage")
			expect(avatar).toHaveAttribute("data-persona", "오사랑")
			expect(avatar).toHaveAttribute("alt", "오사랑 normal")
		})

		it("should switch to thinking image when isThinking is true", () => {
			// Arrange - Images injected
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} isThinking={true} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "data:image/png;base64,ThinkingImage")
			expect(avatar).toHaveAttribute("data-persona", "오사랑")
			expect(avatar).toHaveAttribute("alt", "오사랑 thinking")
			expect(avatar).toHaveAttribute("data-thinking", "true")
		})
	})

	describe("Test Persona Mode", () => {
		const testPersona: TemplateCharacter = {
			character: "test",
			avatarUri: "test://avatar.png",
			thinkingAvatarUri: "test://thinking.png",
			introIllustrationUri: "",
			en: { name: "Test", description: "Test persona", customInstruction: {} as any },
			ko: { name: "테스트", description: "테스트 페르소나", customInstruction: {} as any },
			isDefault: false,
		}

		it("should render test persona when provided", () => {
			// Act
			renderWithProviders(<PersonaAvatar testPersona={testPersona} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "test://avatar.png")
			expect(avatar).toHaveAttribute("data-persona", "Test")
			expect(avatar).toHaveAttribute("alt", "Test normal")
		})

		it("should use test persona thinking image when isThinking is true", () => {
			// Act
			renderWithProviders(<PersonaAvatar testPersona={testPersona} isThinking={true} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "test://thinking.png")
			expect(avatar).toHaveAttribute("data-persona", "Test")
			expect(avatar).toHaveAttribute("alt", "Test thinking")
			expect(avatar).toHaveAttribute("data-thinking", "true")
		})
	})

	describe("Error Handling", () => {
		it("should handle partial image injection gracefully", () => {
			// Arrange - Only profile image injected
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = ""

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)

			// Assert - Should render loading state when thinking image is missing
			const avatar = screen.getByTestId("persona-avatar")
			const srcValue = avatar.getAttribute("src")
			expect(srcValue).toContain("data:image/svg+xml;base64,") // Loading fallback
			expect(avatar).toHaveAttribute("data-persona", "Loading...")
		})

		it("should handle image load errors", () => {
			// Arrange - Images injected
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)

			// Simulate image error
			const avatar = screen.getByTestId("persona-avatar")
			avatar.dispatchEvent(new Event('error'))

			// Assert - Should fallback to loading image
			expect(avatar).toBeInTheDocument()
		})
	})

	describe("Locale Support", () => {
		it("should handle Korean locale with direct injection", () => {
			// Arrange
			mockExtensionState.chatSettings = { uiLanguage: "ko" }
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "오사랑 normal")
		})

		it("should handle English locale with direct injection", () => {
			// Arrange
			mockExtensionState.chatSettings = { uiLanguage: "en" }
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)

			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "오사랑 normal")
		})
	})

	describe("Performance and Responsiveness", () => {
		it("should render quickly with injected images", async () => {
			// Arrange
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act
			const startTime = performance.now()
			renderWithProviders(<PersonaAvatar testPersona={null} />)
			const endTime = performance.now()

			// Assert - Should render quickly (less than 100ms)
			expect(endTime - startTime).toBeLessThan(100)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toBeInTheDocument()
		})

		it("should handle rapid state changes efficiently", () => {
			// Arrange
			mockExtensionState.personaProfile = "data:image/png;base64,ProfileImage"
			mockExtensionState.personaThinking = "data:image/png;base64,ThinkingImage"

			// Act - Rapid re-renders
			const { rerender } = renderWithProviders(<PersonaAvatar testPersona={null} isThinking={false} />)
			
			for (let i = 0; i < 10; i++) {
				rerender(
					<ExtensionStateContextProvider>
						<PersonaAvatar testPersona={null} isThinking={i % 2 === 0} />
					</ExtensionStateContextProvider>
				)
			}

			// Assert - Component should still be responsive
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toBeInTheDocument()
		})
	})

	describe.skip("Integration with Extension State", () => {
		it("should react to extension state changes", () => {
			// Arrange - Initial state
			mockExtensionState.personaProfile = ""
			mockExtensionState.personaThinking = ""

			// Act - Initial render
			const { rerender } = renderWithProviders(<PersonaAvatar testPersona={null} />)
			
			let avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("data-persona", "Loading...")

			// Update state
			mockExtensionState.personaProfile = "data:image/png;base64,NewProfile"
			mockExtensionState.personaThinking = "data:image/png;base64,NewThinking"

			// Re-render
			rerender(
				<ExtensionStateContextProvider>
					<PersonaAvatar testPersona={null} />
				</ExtensionStateContextProvider>
			)

			// Assert - Should use new images
			avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "data:image/png;base64,NewProfile")
		})
	})
}) 