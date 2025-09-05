// CARET MODIFICATION: This file is a Caret addition for the PersonaService.

/**
 * Represents the basic profile of a persona, without image data.
 */
export interface SimplePersona {
	name: string
	description: string
	customInstruction: string
}

/**
 * Represents the avatar images for a persona.
 */
export interface SimplePersonaImages {
	avatar: Buffer
	thinkingAvatar: Buffer
}