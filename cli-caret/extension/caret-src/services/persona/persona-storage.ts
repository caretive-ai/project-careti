import { Controller } from "@core/controller"
import { PersonaProfile } from "@shared/proto/caret/persona"
import { writeFile } from "@utils/fs"
import * as fs from "fs/promises"
import * as path from "path"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@/core/storage/disk"
import { Logger } from "@/services/logging/Logger"
import { SimplePersona, SimplePersonaImages } from "./simple-persona"

// CARET MODIFICATION: Constants for persona image filenames and directory
const PERSONA_CONSTANTS = {
	IMAGES_DIR: "personas",
	PROFILE_IMAGE: "agent_profile.png",
	THINKING_IMAGE: "agent_thinking.png",
} as const

export class PersonaStorage {
	public async getPersona(_controller: Controller): Promise<SimplePersona> {
		const rulesDir = await ensureRulesDirectoryExists()
		const personaMdPath = path.join(rulesDir, GlobalFileNames.persona)
		let name = "Default"
		let description = "Default Persona"
		let customInstruction = "{}"

		try {
			const content = await fs.readFile(personaMdPath, "utf-8")
			const parsedContent = JSON.parse(content)
			name = parsedContent?.persona?.name || name
			description = parsedContent?.persona?.description || description
			customInstruction = content
		} catch (error) {
			Logger.warn(`[CARET-PERSONA] getPersona: Could not read or parse persona.md, using defaults. Error: ${error}`)
		}

		return { name, description, customInstruction }
	}

	public async loadSimplePersonaImages(controller: Controller): Promise<SimplePersonaImages | null> {
		try {
			// Load persona images from globalStorage file system
			const personaDir = path.join(controller.context.globalStorageUri.fsPath, PERSONA_CONSTANTS.IMAGES_DIR)
			const profilePath = path.join(personaDir, PERSONA_CONSTANTS.PROFILE_IMAGE)
			const thinkingPath = path.join(personaDir, PERSONA_CONSTANTS.THINKING_IMAGE)

			const { fileExistsAtPath } = await import("@utils/fs")

			if (!(await fileExistsAtPath(profilePath)) || !(await fileExistsAtPath(thinkingPath))) {
				return null
			}

			const avatar = await fs.readFile(profilePath)
			const thinkingAvatar = await fs.readFile(thinkingPath)

			return { avatar, thinkingAvatar }
		} catch (error) {
			Logger.error(`Failed to load persona images: ${error}`)
			return null
		}
	}

	public async savePersonaProfile(_controller: Controller, profile: PersonaProfile): Promise<void> {
		Logger.info(`Saving persona profile for: ${profile.name}`)
		try {
			const rulesDir = await ensureRulesDirectoryExists()
			const personaMdPath = path.join(rulesDir, GlobalFileNames.persona)

			await writeFile(personaMdPath, profile.customInstruction)
			Logger.debug(`Persona profile saved to ${personaMdPath}`)
		} catch (error) {
			Logger.error(`Failed to save persona profile: ${error}`)
			throw error
		}
	}

	public async savePersonaImages(controller: Controller, images: SimplePersonaImages): Promise<void> {
		try {
			// Save persona images to globalStorage file system
			const personaDir = path.join(controller.context.globalStorageUri.fsPath, PERSONA_CONSTANTS.IMAGES_DIR)

			await fs.mkdir(personaDir, { recursive: true })

			const profilePath = path.join(personaDir, PERSONA_CONSTANTS.PROFILE_IMAGE)
			const thinkingPath = path.join(personaDir, PERSONA_CONSTANTS.THINKING_IMAGE)

			await fs.writeFile(profilePath, images.avatar)
			await fs.writeFile(thinkingPath, images.thinkingAvatar)
		} catch (error) {
			Logger.error(`Failed to save persona images: ${error}`)
			throw error
		}
	}
}
