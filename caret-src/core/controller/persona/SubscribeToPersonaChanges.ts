// CARET MODIFICATION: Handler for subscribing to persona changes

import { PersonaService } from "@caret/services/persona/persona-service"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import type { Controller } from "@core/controller"
import { getRequestRegistry, type StreamingResponseHandler } from "@core/controller/grpc-handler"
import { PersonaImages, PersonaProfile } from "@shared/proto/caret/persona"
import type { EmptyRequest } from "@shared/proto/cline/common"
import { Logger } from "@/services/logging/Logger"

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
		Logger.debug(`[PersonaService] Starting persona changes subscription: ${requestId}`)

		// Function to send the current persona state
		const sendCurrentPersona = async () => {
			const personaStorage = new PersonaStorage()
			const images = await personaStorage.loadSimplePersonaImages(controller)
			const avatarUri = images?.avatar ? `data:image/png;base64,${images.avatar.toString("base64")}` : ""
			const thinkingAvatarUri = images?.thinkingAvatar
				? `data:image/png;base64,${images.thinkingAvatar.toString("base64")}`
				: ""

			const personaImages = PersonaImages.create({ avatarUri, thinkingAvatarUri })
			await responseStream(personaImages)
			Logger.debug(`[PersonaService] Sent persona images for subscription: ${requestId}`)
		}

		// Send the initial state immediately
		await sendCurrentPersona()

		// Subscribe to subsequent changes from the PersonaService
		const unsubscribe = PersonaService.getInstance().subscribeToPersonaChanges(async (persona: PersonaProfile | any) => {
			Logger.debug(`[PersonaService] Received persona change notification for subscription: ${requestId}`)
			// When notified, create a PersonaImages message and send it through the stream
			const images = PersonaImages.create({
				avatarUri: persona.avatarUri,
				thinkingAvatarUri: persona.thinkingAvatarUri,
			})
			await responseStream(images)
			Logger.debug(`[PersonaService] Sent updated persona images for subscription: ${requestId}`)
		})

		// When the stream is cancelled by the client, the GrpcRequestRegistry will call this cleanup function.
		if (requestId) {
			getRequestRegistry().registerRequest(requestId, () => {
				unsubscribe()
				Logger.debug(`[PersonaService] Persona changes subscription cleaned up: ${requestId}`)
			})
		}
	} catch (error) {
		Logger.error(`Failed to subscribe to persona changes: ${error}`)
		throw error
	}
}
