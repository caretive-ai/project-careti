import { vi, describe, it, expect, beforeEach, afterEach, type Mocked } from "vitest"
import { updatePersonaHandler } from "../updatePersona"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { PersonaService } from "@caret/services/persona/persona-service"
import { UpdatePersonaRequest } from "@shared/proto/caret/persona"
import { Controller } from "@core/controller"

// Mock PersonaStorage and PersonaService
vi.mock("@caret/services/persona/persona-storage")
vi.mock("@caret/services/persona/persona-service")

describe("updatePersonaHandler", () => {
	let handler: ReturnType<typeof updatePersonaHandler>
	let mockPersonaStorage: Mocked<PersonaStorage>
	let mockPersonaService: Mocked<PersonaService>
	let mockController: Mocked<Controller>

	beforeEach(() => {
		mockPersonaStorage = new PersonaStorage() as Mocked<PersonaStorage>
		mockPersonaService = new PersonaService() as Mocked<PersonaService>
		handler = updatePersonaHandler(mockPersonaStorage, mockPersonaService)
		mockController = {} as Mocked<Controller>
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it("should save persona profile, images, and notify change", async () => {
		// Arrange
		const mockRequest = UpdatePersonaRequest.create({
			profile: {
				name: "Test Persona",
				description: "A test persona",
				customInstruction: "Test instruction",
				avatarUri: "data:image/png;base64,avatar_image_data",
				thinkingAvatarUri: "data:image/png;base64,thinking_image_data",
			},
		})

		// Act
		await handler(mockController, mockRequest)

		// Assert
		expect(mockPersonaStorage.savePersonaProfile).toHaveBeenCalled()
		expect(mockPersonaStorage.savePersonaImages).toHaveBeenCalled()
		expect(mockPersonaService.notifyPersonaChange).toHaveBeenCalled()
	})
})
