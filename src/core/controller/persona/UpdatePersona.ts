// CARET MODIFICATION: Handler for updating the current persona

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

		// Save persona profile to global storage
		await controller.context.globalState.update("personaProfile", {
			name: request.profile.name,
			description: request.profile.description,
			custom_instruction: request.profile.customInstruction,
			avatar_uri: request.profile.avatarUri,
			thinking_avatar_uri: request.profile.thinkingAvatarUri,
		})

		console.log("[PersonaService] Updated persona profile:", request.profile.name)

		return Empty.create({})
	} catch (error) {
		console.error(`Failed to update persona: ${error}`)
		throw error
	}
}
