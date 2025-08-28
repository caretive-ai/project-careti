import { Controller } from "@core/controller"
import { PersonaProfile } from "@shared/proto/caret/persona"
import { writeFile } from "@utils/fs"
import * as fs from "fs/promises"
import * as path from "path"
import * as vscode from "vscode"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@/core/storage/disk"
import { Logger } from "@/services/logging/Logger"
import { SimplePersona, SimplePersonaImages } from "./simple-persona"

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
			const globalStoragePath = controller.context.globalStorageUri.fsPath
			const avatarPath = path.join(globalStoragePath, "caret_persona_avatar.txt")
			const thinkingAvatarPath = path.join(globalStoragePath, "caret_persona_thinking_avatar.txt")

			let avatar: string | null = null
			let thinkingAvatar: string | null = null

			try {
				avatar = await fs.readFile(avatarPath, "utf-8")
			} catch {
				// File doesn't exist, that's ok
			}

			try {
				thinkingAvatar = await fs.readFile(thinkingAvatarPath, "utf-8")
			} catch {
				// File doesn't exist, that's ok
			}

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
			const globalStoragePath = controller.context.globalStorageUri.fsPath
			await fs.mkdir(globalStoragePath, { recursive: true })

			const avatarPath = path.join(globalStoragePath, "caret_persona_avatar.txt")
			const thinkingAvatarPath = path.join(globalStoragePath, "caret_persona_thinking_avatar.txt")

			await fs.writeFile(avatarPath, images.avatar, "utf-8")
			await fs.writeFile(thinkingAvatarPath, images.thinkingAvatar, "utf-8")
		} catch (error) {
			Logger.error(`Failed to save persona images: ${error}`)
			throw error
		}
	}
}
