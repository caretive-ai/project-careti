import { PersonaService } from "@caret/services/persona/persona-service"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { Controller } from "@core/controller"
import { handleUnaryCall, sendUnaryData, status } from "@grpc/grpc-js"
import { ServerErrorResponse } from "@grpc/grpc-js/build/src/server-call"
import { UpdatePersonaRequest } from "@shared/proto/caret/persona"
import { Empty } from "@shared/proto/cline/common"
import { Logger } from "@/services/logging/Logger"

// CARET MODIFICATION: This file is a Caret addition for the PersonaService.
// It now exports two handlers: one for VSCode protobus and one for standalone gRPC server.

type UpdatePersonaFunc = (controller: Controller, request: UpdatePersonaRequest) => Promise<Empty>

export function updatePersonaHandler(personaStorage: PersonaStorage, personaService: PersonaService): UpdatePersonaFunc {
	return async (controller, request) => {
		try {
			Logger.info("[CARET-PERSONA] updatePersona: Received request")
			const profile = request.profile
			if (!profile) {
				throw new Error("Profile is missing in the request")
			}

			const avatarData = profile.avatarUri.replace(/^data:image\/png;base64,/, "")
			const thinkingAvatarData = profile.thinkingAvatarUri.replace(/^data:image\/png;base64,/, "")

			await Promise.all([
				personaStorage.savePersonaProfile(controller, profile),
				personaStorage.savePersonaImages(controller, {
					avatar: avatarData,
					thinkingAvatar: thinkingAvatarData,
				}),
			])

			personaService.notifyPersonaChange(profile)

			return Empty.create()
		} catch (error) {
			const errorMessage = `[CARET-PERSONA] updatePersona: Failed to update persona profile: ${error}`
			Logger.error(errorMessage)
			throw new Error(errorMessage)
		}
	}
}

export function getStandaloneUpdatePersonaHandler(
	personaStorage: PersonaStorage,
	personaService: PersonaService,
): handleUnaryCall<UpdatePersonaRequest, Empty> {
	const vscodeHandler = updatePersonaHandler(personaStorage, personaService)
	return async (call, callback: sendUnaryData<Empty>): Promise<void> => {
		try {
			const controller = Controller.instance
			if (!controller) {
				throw new Error("Controller not initialized")
			}
			const result = await vscodeHandler(controller, call.request)
			callback(null, result)
		} catch (error) {
			const errorMessage = `[CARET-PERSONA] updatePersona: Failed to update persona profile: ${error}`
			Logger.error(errorMessage)
			const serverError: ServerErrorResponse = {
				code: status.INTERNAL,
				name: "ServerError",
				message: errorMessage,
			}
			callback(serverError, null)
		}
	}
}

export const updatePersona = updatePersonaHandler(new PersonaStorage(), new PersonaService())
export const getStandaloneUpdatePersona = getStandaloneUpdatePersonaHandler(new PersonaStorage(), new PersonaService())
