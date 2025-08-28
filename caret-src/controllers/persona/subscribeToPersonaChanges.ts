import { ServerWritableStream } from "@grpc/grpc-js"
import { PersonaImages } from "@shared/proto/caret/persona"
import { EmptyRequest } from "@shared/proto/cline/common"
import { Logger } from "@/services/logging/Logger"
import { PersonaService } from "@caret/services/persona/persona-service"
import { Controller } from "@core/controller"
import { StreamingResponseHandler, getRequestRegistry } from "@/core/controller/grpc-handler"

// CARET MODIFICATION: This file is a Caret addition for the PersonaService.
// It now exports two handlers: one for VSCode protobus and one for standalone gRPC server.

type SubscribeToPersonaChangesFunc = (
	controller: Controller,
	request: EmptyRequest,
	responseStream: StreamingResponseHandler<PersonaImages>,
	requestId?: string,
) => Promise<void>

export function subscribeToPersonaChangesHandler(personaService: PersonaService): SubscribeToPersonaChangesFunc {
	return async (controller, request, responseStream, requestId) => {
		Logger.info("[CARET-PERSONA] subscribeToPersonaChanges: Received request")
		const unsubscribe = personaService.subscribeToPersonaChanges((profile) => {
			try {
				if (profile) {
					responseStream(
						PersonaImages.create({
							avatarUri: profile.avatarUri,
							thinkingAvatarUri: profile.thinkingAvatarUri,
						}),
					)
				}
			} catch (error) {
				const errorMessage = `[CARET-PERSONA] subscribeToPersonaChanges: Failed to send profile update: ${error}`
				Logger.error(errorMessage)
				// Don't send error to stream here as it might be closed
			}
		})

		if (requestId) {
			getRequestRegistry().registerRequest(requestId, unsubscribe)
		}
	}
}

export function getStandaloneSubscribeToPersonaChangesHandler(
	personaService: PersonaService,
): (call: ServerWritableStream<EmptyRequest, PersonaImages>) => void {
	const vscodeHandler = subscribeToPersonaChangesHandler(personaService)
	return (call: ServerWritableStream<EmptyRequest, PersonaImages>): void => {
		const controller = Controller.instance
		if (!controller) {
			call.emit("error", new Error("Controller not initialized"))
			return
		}

		const responseStream: StreamingResponseHandler<any> = async (response, isLast) => {
			if (response.error) {
				call.emit("error", new Error(response.error))
			} else {
				call.write(response)
			}
			if (isLast) {
				call.end()
			}
		}

		vscodeHandler(controller, call.request, responseStream, call.metadata.get("x-request-id")?.[0]?.toString())

		call.on("cancelled", () => {
			if (call.metadata.get("x-request-id")?.[0]) {
				getRequestRegistry().cancelRequest(call.metadata.get("x-request-id")![0].toString())
			}
		})
	}
}

export const subscribeToPersonaChanges = subscribeToPersonaChangesHandler(new PersonaService())
export const getStandaloneSubscribeToPersonaChanges = getStandaloneSubscribeToPersonaChangesHandler(new PersonaService())
