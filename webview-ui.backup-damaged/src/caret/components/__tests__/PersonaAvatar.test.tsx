import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest"
import PersonaAvatar from "../PersonaAvatar"
import { ExtensionStateContextProvider } from "@/context/ExtensionStateContext"
import type { TemplateCharacter } from "../../../../../src/shared/persona"

// Mock dependencies
const mockPostMessage = vi.fn()
vi.mock("../../utils/vscode", () => ({
	vscode: {
		postMessage: mockPostMessage,
	},
}))

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

describe("PersonaAvatar Component - New Simple 2-File System", () => {
	// Mock template character for testing
	const mockTemplateCharacter: TemplateCharacter = {
		character: "current",
		avatarUri: "data:image/png;base64,MockAvatarImage",
		thinkingAvatarUri: "data:image/png;base64,MockThinkingImage",
		introIllustrationUri: "",
		en: { name: "Current Persona", description: "Test persona", customInstruction: {} as any },
		ko: { name: "현재 페르소나", description: "테스트 페르소나", customInstruction: {} as any },
		isDefault: false,
	}

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

	describe("Basic Rendering with 2-File System", () => {
		it("should render normal avatar using avatarUri", () => {
			renderWithProviders(<PersonaAvatar testPersona={mockTemplateCharacter} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toBeInTheDocument()
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.avatarUri)
			expect(avatar).toHaveAttribute("alt", "Current Persona normal")
			expect(avatar).toHaveAttribute("data-persona", "Current Persona") // localeDetails.name 사용
			expect(avatar).toHaveAttribute("data-thinking", "false")
		})

		it("should render thinking avatar using thinkingAvatarUri when isThinking=true", () => {
			renderWithProviders(
				<PersonaAvatar testPersona={mockTemplateCharacter} isThinking={true} />
			)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.thinkingAvatarUri)
			expect(avatar).toHaveAttribute("alt", "Current Persona thinking")
			expect(avatar).toHaveAttribute("data-thinking", "true")
		})

		it("should show loading state when no persona provided", () => {
			renderWithProviders(<PersonaAvatar />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toBeInTheDocument()
			expect(avatar).toHaveAttribute("data-persona", "Loading...")
			expect(avatar).toHaveAttribute("alt", "Loading... normal")
		})
	})

	describe("Thinking State Transitions", () => {
		it("should transition from normal to thinking state smoothly", () => {
			const { rerender } = renderWithProviders(
				<PersonaAvatar testPersona={mockTemplateCharacter} isThinking={false} />
			)
			
			let avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.avatarUri)
			expect(avatar).toHaveAttribute("data-thinking", "false")
			
			rerender(
				<ExtensionStateContextProvider>
					<PersonaAvatar testPersona={mockTemplateCharacter} isThinking={true} />
				</ExtensionStateContextProvider>
			)
			
			avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.thinkingAvatarUri)
			expect(avatar).toHaveAttribute("data-thinking", "true")
		})

		it("should handle rapid thinking state changes", () => {
			const { rerender } = renderWithProviders(
				<PersonaAvatar testPersona={mockTemplateCharacter} isThinking={false} />
			)
			
			// Normal → Thinking → Normal → Thinking
			let avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.avatarUri)
			
			rerender(<ExtensionStateContextProvider><PersonaAvatar testPersona={mockTemplateCharacter} isThinking={true} /></ExtensionStateContextProvider>)
			avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.thinkingAvatarUri)
			
			rerender(<ExtensionStateContextProvider><PersonaAvatar testPersona={mockTemplateCharacter} isThinking={false} /></ExtensionStateContextProvider>)
			avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", mockTemplateCharacter.avatarUri)
		})
	})

	describe("Component Props and Styling", () => {
		it("should apply custom size", () => {
			renderWithProviders(
				<PersonaAvatar testPersona={mockTemplateCharacter} size={48} />
			)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveStyle({
				width: "48px",
				height: "48px",
			})
		})

		it("should apply custom className and styles", () => {
			const customStyle = { border: "2px solid red" }
			renderWithProviders(
				<PersonaAvatar 
					testPersona={mockTemplateCharacter} 
					className="custom-class"
					style={customStyle}
				/>
			)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveClass("persona-avatar", "custom-class")
			expect(avatar).toHaveStyle({ border: "2px solid red" })
		})

		it("should apply default styles", () => {
			renderWithProviders(<PersonaAvatar testPersona={mockTemplateCharacter} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveStyle({
				borderRadius: "50%",
				objectFit: "cover",
				border: "1px solid var(--vscode-settings-headerBorder)",
				flexShrink: "0",
			})
		})
	})

	describe("Error Handling", () => {
		it("should handle image loading errors gracefully", async () => {
			renderWithProviders(<PersonaAvatar testPersona={mockTemplateCharacter} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			
			// Simulate image load error
			fireEvent.error(avatar)
			
			// Should still show the avatar with fallback image (component doesn't crash)
			await waitFor(() => {
				const fallbackAvatar = screen.getByTestId("persona-avatar")
				expect(fallbackAvatar).toBeInTheDocument()
				// Should use fallback loading persona image
				expect(fallbackAvatar.getAttribute("src")).toContain("data:image/svg+xml;base64,")
			})
		})

		it("should handle null persona gracefully", () => {
			renderWithProviders(<PersonaAvatar testPersona={null} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toBeInTheDocument()
			expect(avatar).toHaveAttribute("data-persona", "Loading...")
		})
	})

	describe("Accessibility", () => {
		it("should have proper alt text for normal state", () => {
			renderWithProviders(<PersonaAvatar testPersona={mockTemplateCharacter} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "Current Persona normal")
		})

		it("should have proper alt text for thinking state", () => {
			renderWithProviders(
				<PersonaAvatar testPersona={mockTemplateCharacter} isThinking={true} />
			)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "Current Persona thinking")
		})

		it("should have proper alt text for loading state", () => {
			renderWithProviders(<PersonaAvatar />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "Loading... normal")
		})
	})

	describe("Locale Support", () => {
		it("should use Korean locale when set", () => {
			mockExtensionState.chatSettings = { uiLanguage: "ko" }

			renderWithProviders(<PersonaAvatar testPersona={mockTemplateCharacter} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "현재 페르소나 normal")
		})

		it("should fallback to English when invalid locale", () => {
			mockExtensionState.chatSettings = { uiLanguage: "invalid" }

			renderWithProviders(<PersonaAvatar testPersona={mockTemplateCharacter} />)
			
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("alt", "Current Persona normal")
		})
	})

	describe("Direct Injection Mode", () => {
		it("should render with injected persona images", () => {
			// Arrange - Direct injection
			mockExtensionState.personaProfile = "data:image/png;base64,InjectedProfile"
			mockExtensionState.personaThinking = "data:image/png;base64,InjectedThinking"
			
			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} />)
			
			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "data:image/png;base64,InjectedProfile")
			expect(avatar).toHaveAttribute("data-persona", "오사랑")
			expect(avatar).toHaveAttribute("alt", "오사랑 normal")
		})

		it("should switch to thinking image in direct injection mode", () => {
			// Arrange - Direct injection
			mockExtensionState.personaProfile = "data:image/png;base64,InjectedProfile"
			mockExtensionState.personaThinking = "data:image/png;base64,InjectedThinking"
			
			// Act
			renderWithProviders(<PersonaAvatar testPersona={null} isThinking={true} />)
			
			// Assert
			const avatar = screen.getByTestId("persona-avatar")
			expect(avatar).toHaveAttribute("src", "data:image/png;base64,InjectedThinking")
			expect(avatar).toHaveAttribute("data-persona", "오사랑")
			expect(avatar).toHaveAttribute("alt", "오사랑 thinking")
			expect(avatar).toHaveAttribute("data-thinking", "true")
		})
	})
}) 