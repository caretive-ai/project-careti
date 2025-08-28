import { PersonaProfile } from "@shared/proto/caret/persona"
import { writeFile } from "@utils/fs"
import * as fs from "fs/promises"
import * as path from "path"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ensureRulesDirectoryExists } from "@/core/storage/disk"
import { PersonaStorage } from "../persona-storage"

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
		it("should save avatar and thinking avatar to disk files", async () => {
			const mockImages = {
				avatar: "YXZhdGFyX2ltYWdlX2RhdGE=", // Base64 encoded "avatar_image_data"
				thinkingAvatar: "dGhpbmtpbmdfaW1hZ2VfZGF0YQ==", // Base64 encoded "thinking_image_data"
			}

			await personaStorage.savePersonaImages(mockContext, mockImages)

			const expectedAvatarPath = "/mock/global/storage/avatar.txt"
			const expectedThinkingAvatarPath = "/mock/global/storage/thinking_avatar.txt"

			expect(fs.writeFile).toHaveBeenCalledWith(expectedAvatarPath, mockImages.avatar, "utf-8")
			expect(fs.writeFile).toHaveBeenCalledWith(expectedThinkingAvatarPath, mockImages.thinkingAvatar, "utf-8")
		})
	})
})
