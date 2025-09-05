import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs/promises"
import { writeFile } from "@utils/fs"
import { GlobalFileNames, ensureRulesDirectoryExists } from "@/core/storage/disk"
import { PersonaProfile } from "@shared/proto/caret/persona"
import { Logger } from "@/services/logging/Logger"
import { SimplePersona, SimplePersonaImages } from "./simple-persona"
import { Controller } from "@core/controller"

export class PersonaStorage {
	public async getPersona(controller: Controller): Promise<SimplePersona> {
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
			const avatar = controller.stateManager.getGlobalStateKey("caret_persona_avatar")
			const thinkingAvatar = controller.stateManager.getGlobalStateKey("caret_persona_thinking_avatar")

			if (!avatar || !thinkingAvatar) {
				return null
			}

			return { avatar, thinkingAvatar }
		} catch (error) {
			Logger.error(`Failed to load persona images: ${error}`)
			return null
		}
	}

	public async savePersonaProfile(controller: Controller, profile: PersonaProfile): Promise<void> {
		Logger.info(`Saving persona profile for: ${profile.name}`)
		try {
			const rulesDir = await ensureRulesDirectoryExists()
			const personaMdPath = path.join(rulesDir, "persona.md")

			await writeFile(personaMdPath, profile.customInstruction)
			Logger.debug(`Persona profile saved to ${personaMdPath}`)
		} catch (error) {
			Logger.error(`Failed to save persona profile: ${error}`)
			throw error
		}
	}

	public async savePersonaImages(controller: Controller, images: SimplePersonaImages): Promise<void> {
		try {
			controller.stateManager.setGlobalState("caret_persona_avatar", images.avatar)
			controller.stateManager.setGlobalState("caret_persona_thinking_avatar", images.thinkingAvatar)
		} catch (error) {
			Logger.error(`Failed to save persona images: ${error}`)
			throw error
		}
	}
}