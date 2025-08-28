import { describe, it, expect, vi, beforeEach } from "vitest"
import { PersonaStorage } from "../persona-storage"
import * as fs from "fs/promises"
import * as path from "path"
import { writeFile } from "@utils/fs"
import { ensureRulesDirectoryExists } from "@/core/storage/disk"
import { PersonaProfile } from "@shared/proto/caret/persona"

// Mock dependencies
vi.mock("fs/promises")
vi.mock("path")
vi.mock("@utils/fs")
vi.mock("@/core/storage/disk")
vi.mock("@/services/logging/Logger", () => ({
	Logger: {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
	},
}))

describe("PersonaStorage", () => {
	let personaStorage: PersonaStorage
	const mockContext = {
		globalStorageUri: { fsPath: "/mock/global/storage" },
		globalState: {
			update: vi.fn(),
		},
		context: {
			globalState: {
				update: vi.fn(),
			},
		},
	} as any

	beforeEach(() => {
		vi.clearAllMocks()
		personaStorage = new PersonaStorage()
		vi.mocked(path.join).mockImplementation((...args: string[]) => args.join("/"))
		vi.mocked(ensureRulesDirectoryExists).mockResolvedValue("/mock/rules")
	})

	describe("savePersonaProfile", () => {
		it("should write the persona's custom instruction to persona.md", async () => {
			const mockProfile = PersonaProfile.create({
				name: "Test",
				description: "Test desc",
				customInstruction: `{"persona":{"name":"Test"}}`,
			})

			await personaStorage.savePersonaProfile(mockContext, mockProfile)

			const expectedPath = "/mock/rules/persona.md"
			const expectedContent = mockProfile.customInstruction

			expect(writeFile).toHaveBeenCalledWith(expectedPath, expectedContent)
		})
	})

	describe("savePersonaImages", () => {
		it("should save avatar and thinking avatar to global storage", async () => {
			const mockImages = {
				avatar: Buffer.from("avatar_image_data"),
				thinkingAvatar: Buffer.from("thinking_image_data"),
			}

			await personaStorage.savePersonaImages(mockContext, mockImages)

			expect(mockContext.context.globalState.update).toHaveBeenCalledWith("caret_persona_avatar", mockImages.avatar)
			expect(mockContext.context.globalState.update).toHaveBeenCalledWith(
				"caret_persona_thinking_avatar",
				mockImages.thinkingAvatar,
			)
		})
	})
})
