import { handleUnaryCall, sendUnaryData, status } from "@grpc/grpc-js"
import { PersonaProfile } from "@shared/proto/caret/persona"
import { EmptyRequest } from "@shared/proto/cline/common"
import { ServerErrorResponse } from "@grpc/grpc-js/build/src/server-call"
import { Logger } from "@/services/logging/Logger"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { Controller } from "@core/controller"

// CARET MODIFICATION: This file is a Caret addition for the PersonaService.
// It now exports two handlers: one for VSCode protobus and one for standalone gRPC server.

type GetPersonaProfileFunc = (controller: Controller, request: EmptyRequest) => Promise<PersonaProfile>

export function getPersonaProfileHandler(personaStorage: PersonaStorage): GetPersonaProfileFunc {
	return async (controller, request) => {
		try {
			Logger.info("[CARET-PERSONA] getPersonaProfile: Received request")

			const [profileDetails, images] = await Promise.all([
				personaStorage.getPersona(controller),
				personaStorage.loadSimplePersonaImages(controller),
			])

			const avatarUri = images?.avatar ? `data:image/png;base64,${images.avatar.toString("base64")}` : ""
			const thinkingAvatarUri = images?.thinkingAvatar
				? `data:image/png;base64,${images.thinkingAvatar.toString("base64")}`
				: ""

			const profile = PersonaProfile.create({
				name: profileDetails.name,
				description: profileDetails.description,
				customInstruction: profileDetails.customInstruction,
				avatarUri,
				thinkingAvatarUri,
			})

			return profile
		} catch (error) {
			const errorMessage = `[CARET-PERSONA] getPersonaProfile: Failed to get persona profile: ${error}`
			Logger.error(errorMessage)
			throw new Error(errorMessage)
		}
	}
}

export function getStandalonePersonaProfileHandler(
	personaStorage: PersonaStorage,
): handleUnaryCall<EmptyRequest, PersonaProfile> {
	const vscodeHandler = getPersonaProfileHandler(personaStorage)
	return async (call, callback: sendUnaryData<PersonaProfile>): Promise<void> => {
		try {
			const controller = Controller.instance
			if (!controller) {
				throw new Error("Controller not initialized")
			}
			const profile = await vscodeHandler(controller, call.request)
			callback(null, profile)
		} catch (error) {
			const errorMessage = `[CARET-PERSONA] getPersonaProfile: Failed to get persona profile: ${error}`
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

export const getPersonaProfile = getPersonaProfileHandler(new PersonaStorage())
export const getStandalonePersonaProfile = getStandalonePersonaProfileHandler(new PersonaStorage())
