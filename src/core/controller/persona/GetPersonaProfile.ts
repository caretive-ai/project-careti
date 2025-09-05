// CARET MODIFICATION: Handler for getting the current persona profile

import { PersonaProfile } from "@shared/proto/caret/persona"
import type { EmptyRequest } from "@shared/proto/cline/common"
import type { Controller } from "../index"

/**
 * Handles getting the current persona profile
 * @param controller The controller instance
 * @param request Empty request
 * @returns Current persona profile
 */
export async function GetPersonaProfile(controller: Controller, _request: EmptyRequest): Promise<PersonaProfile> {
	try {
		// Get current persona from global storage
		const _currentPersona = controller.context.globalState.get<string>("currentPersona")
		const personaData = controller.context.globalState.get<any>("personaProfile") || {}

		// Default to "caret" persona if none set
		const defaultPersona = {
			name: "Caret",
			description: "친근하고 도움되는 코딩 로봇 조수",
			custom_instruction: "",
			avatar_uri: "asset://template_characters/caret_profile.png",
			thinking_avatar_uri: "asset://template_characters/caret_thinking.png",
		}

		return PersonaProfile.create({
			name: personaData.name || defaultPersona.name,
			description: personaData.description || defaultPersona.description,
			customInstruction: personaData.custom_instruction || defaultPersona.custom_instruction,
			avatarUri: personaData.avatar_uri || defaultPersona.avatar_uri,
			thinkingAvatarUri: personaData.thinking_avatar_uri || defaultPersona.thinking_avatar_uri,
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
