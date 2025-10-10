// CARET MODIFICATION: Handler for updating the current persona

import { PersonaService } from "@caret/services/persona/persona-service"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { UpdatePersonaRequest } from "@shared/proto/caret/persona"
import { Empty } from "@shared/proto/cline/common"
import * as fs from "fs/promises"
import * as path from "path"
import { Logger } from "@/services/logging/Logger"
import type { Controller } from "@core/controller"

/**
 * Handles updating the current persona
 * @param controller The controller instance
 * @param request Update persona request
 * @returns Empty response
 */
export async function UpdatePersona(controller: Controller, request: UpdatePersonaRequest): Promise<Empty> {
	try {
		if (!request.profile) {
			throw new Error("Profile is required")
		}

		const profile = request.profile
		const personaStorage = new PersonaStorage()
		const personaService = PersonaService.getInstance()

		// Handle both base64 and asset:// URI image data
		let avatarBuffer: Buffer | undefined
		let thinkingAvatarBuffer: Buffer | undefined

		const loadImageToBuffer = async (uri: string): Promise<Buffer | undefined> => {
			try {
				if (uri.startsWith("data:image/png;base64,")) {
					return Buffer.from(uri.replace(/^data:image\/png;base64,/, ""), "base64")
				} else if (uri.startsWith("asset:/")) {
					const cleanPath = uri.replace("asset:/", "")
					const imagePath = path.join(controller.context.extensionPath, cleanPath)
					return await fs.readFile(imagePath)
				}
			} catch (error) {
				Logger.warn(`Failed to load or parse image URI ${uri}: ${error}`)
			}
			return undefined
		}

		avatarBuffer = await loadImageToBuffer(profile.avatarUri)
		thinkingAvatarBuffer = await loadImageToBuffer(profile.thinkingAvatarUri)

		// Save both to persona.md file AND global storage for backward compatibility
		const savePromises = [
			// Save to persona.md file (new persistent storage)
			personaStorage.savePersonaProfile(controller, profile),
			// Save to legacy global storage for backward compatibility
			controller.context.globalState.update("personaProfile", {
				name: profile.name,
				description: profile.description,
				custom_instruction: profile.customInstruction,
				avatar_uri: profile.avatarUri,
				thinking_avatar_uri: profile.thinkingAvatarUri,
			}),
		]

		// Save images to global storage only if we have valid buffers
		if (avatarBuffer && thinkingAvatarBuffer) {
			savePromises.push(
				personaStorage.savePersonaImages(controller, {
					avatar: avatarBuffer,
					thinkingAvatar: thinkingAvatarBuffer,
				}),
			)
		}

		await Promise.all(savePromises)

		// Notify subscribers of persona change
		personaService.notifyPersonaChange(profile)

		Logger.info(`[PersonaService] Updated persona profile and saved to persona.md: ${profile.name}`)

		return Empty.create({})
	} catch (error) {
		Logger.error(`Failed to update persona: ${error}`)
		throw error
	}
}
