// CARET MODIFICATION: Handler for updating the current persona

import { PersonaService } from "@caret/services/persona/persona-service"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { UpdatePersonaRequest } from "@shared/proto/caret/persona"
import { Empty } from "@shared/proto/cline/common"
import type { Controller } from "../index"

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
		const personaService = new PersonaService()

		// Handle base64 image data if present
		let avatarBuffer: Buffer | undefined
		let thinkingAvatarBuffer: Buffer | undefined

		try {
			if (profile.avatarUri.startsWith("data:image/png;base64,")) {
				avatarBuffer = Buffer.from(profile.avatarUri.replace(/^data:image\/png;base64,/, ""), "base64")
			}
		} catch (error) {
			console.warn(`Failed to parse avatar image: ${error}`)
		}

		try {
			if (profile.thinkingAvatarUri.startsWith("data:image/png;base64,")) {
				thinkingAvatarBuffer = Buffer.from(profile.thinkingAvatarUri.replace(/^data:image\/png;base64,/, ""), "base64")
			}
		} catch (error) {
			console.warn(`Failed to parse thinking avatar image: ${error}`)
		}

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

		console.log("[PersonaService] Updated persona profile and saved to persona.md:", profile.name)

		return Empty.create({})
	} catch (error) {
		console.error(`Failed to update persona: ${error}`)
		throw error
	}
}
