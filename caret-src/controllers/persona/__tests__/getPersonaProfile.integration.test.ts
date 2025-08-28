import { vi, describe, it, expect, beforeEach, afterEach, type Mocked } from "vitest"
import { getPersonaProfileHandler } from "../getPersonaProfile"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { SimplePersona } from "@caret/services/persona/simple-persona"
import { PersonaProfile } from "@shared/proto/caret/persona"
import { Controller } from "@core/controller"
import { EmptyRequest } from "@shared/proto/cline/common"

// Mock PersonaStorage
vi.mock("@caret/services/persona/persona-storage")

describe("getPersonaProfileHandler", () => {
	let handler: ReturnType<typeof getPersonaProfileHandler>
	let mockPersonaStorage: Mocked<PersonaStorage>
	let mockController: Mocked<Controller>

	beforeEach(() => {
		mockPersonaStorage = new PersonaStorage() as Mocked<PersonaStorage>
		handler = getPersonaProfileHandler(mockPersonaStorage)
		mockController = {} as Mocked<Controller>
	})

	afterEach(() => {
		vi.clearAllMocks()
	})

	it("should return persona profile with base64 image URIs", async () => {
		// Arrange
		const mockProfile: SimplePersona = {
			name: "Test Persona",
			description: "A test persona",
			customInstruction: "Test instruction",
		}
		const mockImages = {
			avatar: Buffer.from("avatar_image_data"),
			thinkingAvatar: Buffer.from("thinking_image_data"),
		}
		mockPersonaStorage.getPersona.mockResolvedValue(mockProfile)
		mockPersonaStorage.loadSimplePersonaImages.mockResolvedValue(mockImages)

		// Act
		const result = await handler(mockController, EmptyRequest.create())

		// Assert
		expect(result.name).toBe(mockProfile.name)
		expect(result.description).toBe(mockProfile.description)
		expect(result.customInstruction).toBe(mockProfile.customInstruction)
		expect(result.avatarUri).toMatch(/^data:image\/png;base64,/)
		expect(result.thinkingAvatarUri).toMatch(/^data:image\/png;base64,/)
	})
})
