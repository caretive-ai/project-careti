import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { I18nextProvider } from "react-i18next"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { PersonaProfile } from "@shared/proto/index.caret.persona"
import PersonaManagement from "../PersonaManagement"
import * as CaretStateContext from "@/caret/context/CaretStateContext"

// CARET MODIFICATION: This test has been completely rewritten to test the component
// with the new `useCaretState` hook. Instead of mocking the gRPC client, we now
// mock the context hook itself to provide a controlled environment for the component.

// Initialize i18n for testing
i18n.use(initReactI18next).init({
	lng: "en",
	fallbackLng: "en",
	debug: false,
	resources: {
		en: {
			common: {
				"rules.section.personaManagement": "Persona Management",
				"rules.button.changePersonaTemplate": "Change Persona Template",
			},
			persona: {
				normalState: "Normal Image",
				thinkingState: "Thinking Image",
			},
		},
	},
})

// Mock the useCaretState hook
const mockUpdatePersona = vi.fn().mockResolvedValue(undefined)
const useCaretStateMock = vi.spyOn(CaretStateContext, "useCaretState")

// Mock the PersonaTemplateSelector component
vi.mock("../PersonaTemplateSelector", () => ({
	PersonaTemplateSelector: ({ isOpen, onClose, onSelectPersona }: any) => {
		if (!isOpen) return null
		const testProfile = PersonaProfile.create({
			name: "Test Persona",
			description: "A test persona.",
			customInstruction: `{"persona":{"name":"Test"}}`,
		})
		return (
			<div data-testid="persona-selector">
				<button aria-label="Close" onClick={onClose}>
					Close
				</button>
				<button onClick={() => onSelectPersona(testProfile)}>Select Test Persona</button>
			</div>
		)
	},
}))

const mockFullProfile: CaretStateContext.FullPersonaProfile = {
	name: "Default",
	description: "Default description",
	customInstruction: "",
	avatarUri: "avatar.png",
	thinkingAvatarUri: "thinking.png",
}

const renderComponent = () => {
	return render(
		<I18nextProvider i18n={i18n}>
			<PersonaManagement />
		</I18nextProvider>,
	)
}

describe("PersonaManagement", () => {
	beforeEach(() => {
		vi.clearAllMocks()
		// Provide a default mock implementation for the hook
		useCaretStateMock.mockReturnValue({
			personaProfile: mockFullProfile,
			updatePersona: mockUpdatePersona,
		})
	})

	it("should render the component with persona data from context", () => {
		renderComponent()
		expect(screen.getByText("Persona Management")).toBeInTheDocument()
		// Check if the avatar component receives the data
		const avatars = screen.getAllByTestId("persona-avatar")
		expect(avatars[0]).toHaveAttribute("data-persona", "Default")
	})

	it("should open the persona selector modal on button click", async () => {
		renderComponent()
		const changeButton = screen.getByText("Change Persona Template")
		fireEvent.click(changeButton)
		await waitFor(() => {
			expect(screen.getByTestId("persona-selector")).toBeInTheDocument()
		})
	})

	it("should call updatePersona from context when a persona is selected", async () => {
		renderComponent()
		const changeButton = screen.getByText("Change Persona Template")
		fireEvent.click(changeButton)

		await waitFor(() => screen.getByTestId("persona-selector"))

		const selectButton = screen.getByText("Select Test Persona")
		fireEvent.click(selectButton)

		await waitFor(() => {
			expect(mockUpdatePersona).toHaveBeenCalledTimes(1)
		})

		const expectedProfile = PersonaProfile.create({
			name: "Test Persona",
			description: "A test persona.",
			customInstruction: `{"persona":{"name":"Test"}}`,
		})

		expect(mockUpdatePersona).toHaveBeenCalledWith(expectedProfile)
	})
})
