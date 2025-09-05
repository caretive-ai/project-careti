// CARET MODIFICATION: Handler for subscribing to persona changes

import { PersonaImages } from "@shared/proto/caret/persona"
import type { EmptyRequest } from "@shared/proto/cline/common"
import type { StreamingResponseHandler } from "../grpc-handler"
import type { Controller } from "../index"

/**
 * Handles subscribing to persona changes
 * @param controller The controller instance
 * @param request Empty request
 * @param responseStream The streaming response handler
 * @param requestId Request ID for cleanup
 */
export async function SubscribeToPersonaChanges(
	controller: Controller,
	_request: EmptyRequest,
	responseStream: StreamingResponseHandler<PersonaImages>,
	requestId?: string,
): Promise<void> {
	try {
		console.log("[PersonaService] Starting persona changes subscription:", requestId)

		// Send initial persona images
		const personaData = controller.context.globalState.get<any>("personaProfile") || {}

		const initialImages = PersonaImages.create({
			avatarUri: personaData.avatar_uri || "asset://template_characters/caret_profile.png",
			thinkingAvatarUri: personaData.thinking_avatar_uri || "asset://template_characters/caret_thinking.png",
		})

		await responseStream(initialImages)

		// Note: In a complete implementation, this would listen for persona changes
		// and send updates through the stream. For now, we just send the initial state.

		console.log("[PersonaService] Sent initial persona images for subscription:", requestId)
	} catch (error) {
		console.error(`Failed to subscribe to persona changes: ${error}`)
		throw error
	}
}
