// CARET MODIFICATION: Handler for getting the current persona profile

import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { PersonaProfile } from "@shared/proto/caret/persona"
import type { EmptyRequest } from "@shared/proto/cline/common"
import type { Controller } from "@core/controller"

/**
 * Handles getting the current persona profile
 * @param controller The controller instance
 * @param request Empty request
 * @returns Current persona profile
 */
export async function GetPersonaProfile(controller: Controller, _request: EmptyRequest): Promise<PersonaProfile> {
	try {
		const personaStorage = new PersonaStorage()

		// Try to load from persona.md file first, then fallback to global storage
		const [profileDetails, images] = await Promise.all([
			personaStorage.getPersona(controller),
			personaStorage.loadSimplePersonaImages(controller),
		])

		// Fallback to global storage if persona.md doesn't exist
		const legacyPersonaData = controller.context.globalState.get<any>("personaProfile") || {}

		// Default values
		const defaultPersona = {
			name: "Caret",
			description: "친근하고 도움되는 코딩 로봇 조수",
			customInstruction: "",
			avatarUri: "asset://template_characters/caret_profile.png",
			thinkingAvatarUri: "asset://template_characters/caret_thinking.png",
		}

		// Convert image buffers to base64 data URLs if available
		const avatarUri = images?.avatar
			? `data:image/png;base64,${images.avatar.toString("base64")}`
			: legacyPersonaData.avatar_uri || defaultPersona.avatarUri
		const thinkingAvatarUri = images?.thinkingAvatar
			? `data:image/png;base64,${images.thinkingAvatar.toString("base64")}`
			: legacyPersonaData.thinking_avatar_uri || defaultPersona.thinkingAvatarUri

		return PersonaProfile.create({
			name: profileDetails.name !== "Default" ? profileDetails.name : legacyPersonaData.name || defaultPersona.name,
			description:
				profileDetails.description !== "Default Persona"
					? profileDetails.description
					: legacyPersonaData.description || defaultPersona.description,
			customInstruction:
				profileDetails.customInstruction !== "{}"
					? profileDetails.customInstruction
					: legacyPersonaData.custom_instruction || defaultPersona.customInstruction,
			avatarUri,
			thinkingAvatarUri,
		})
	} catch (error) {
		console.error(`Failed to get persona profile: ${error}`)
		// Return default persona on error
		return PersonaProfile.create({
			name: "Caret",
			description: "친근하고 도움되는 코딩 로봇 조수",
			customInstruction: "",
			avatarUri: "asset://template_characters/caret_profile.png",
			thinkingAvatarUri: "asset://template_characters/caret_thinking.png",
		})
	}
}
