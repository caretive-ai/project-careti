// CARET MODIFICATION: Fix import path for persona proto
import { PersonaProfile } from "@shared/proto/caret/persona"
import { render, screen, waitFor } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest"
import { PersonaServiceClient } from "../../services/CaretGrpcClient"
import { CaretStateContextProvider, useCaretState } from "../CaretStateContext"

// CARET MODIFICATION: This entire file is a Caret addition for TDD.

// Mock the gRPC client
vi.mock("../../services/CaretGrpcClient", () => ({
	PersonaServiceClient: {
		getPersonaProfile: vi.fn(),
		updatePersona: vi.fn(),
		subscribeToPersonaChanges: vi.fn(() => () => {}), // Return an unsubscribe function
	},
}))

const mockGetPersonaProfile = PersonaServiceClient.getPersonaProfile as Mock
const mockUpdatePersona = PersonaServiceClient.updatePersona as Mock

const mockProfile: PersonaProfile = {
	name: "Oh Sarang",
	description: "K-pop idol",
	customInstruction: "Be energetic",
	avatarUri: "",
	thinkingAvatarUri: "",
}

// A simple component to consume and display the context state
const TestConsumer = () => {
	const { personaProfile, updatePersona } = useCaretState()

	return (
		<div>
			<div data-testid="profile-name">{personaProfile?.name ?? "Loading..."}</div>
			<button onClick={() => updatePersona(mockProfile)}>Update</button>
		</div>
	)
}

describe("CaretStateContext", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it("should fetch and display the initial persona profile", async () => {
		mockGetPersonaProfile.mockResolvedValue(mockProfile)

		render(
			<CaretStateContextProvider>
				<TestConsumer />
			</CaretStateContextProvider>,
		)

		expect(screen.getByTestId("profile-name")).toHaveTextContent("Loading...")

		await waitFor(() => {
			expect(screen.getByTestId("profile-name")).toHaveTextContent("Oh Sarang")
		})

		expect(mockGetPersonaProfile).toHaveBeenCalledTimes(1)
	})

	it("should call updatePersona on the gRPC client when update is triggered", async () => {
		mockGetPersonaProfile.mockResolvedValue(mockProfile)
		mockUpdatePersona.mockResolvedValue({})

		render(
			<CaretStateContextProvider>
				<TestConsumer />
			</CaretStateContextProvider>,
		)

		await waitFor(() => {
			expect(screen.getByTestId("profile-name")).toHaveTextContent("Oh Sarang")
		})

		const updateButton = screen.getByText("Update")
		updateButton.click()

		await waitFor(() => {
			expect(mockUpdatePersona).toHaveBeenCalledTimes(1)
			expect(mockUpdatePersona).toHaveBeenCalledWith({
				profile: mockProfile,
			})
		})
	})
})
