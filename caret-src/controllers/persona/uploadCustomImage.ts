import { handleUnaryCall, sendUnaryData, status } from "@grpc/grpc-js"
import { UploadCustomImageRequest, PersonaProfile } from "@shared/proto/caret/persona"
import { Empty } from "@shared/proto/cline/common"
import { ServerErrorResponse } from "@grpc/grpc-js/build/src/server-call"
import { Logger } from "@/services/logging/Logger"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { PersonaService } from "@caret/services/persona/persona-service"
import { Controller } from "@core/controller"

// CARET MODIFICATION: This file is a Caret addition for the PersonaService.
// It now exports two handlers: one for VSCode protobus and one for standalone gRPC server.

type UploadCustomImageFunc = (controller: Controller, request: UploadCustomImageRequest) => Promise<Empty>

export function uploadCustomImageHandler(personaStorage: PersonaStorage, personaService: PersonaService): UploadCustomImageFunc {
	return async (controller, request) => {
		try {
			Logger.info("[CARET-PERSONA] uploadCustomImage: Received request")
			const { imageType, imageData } = request
			if (!imageType || !imageData) {
				throw new Error("Image type or data is missing in the request")
			}

			const currentImages = await personaStorage.loadSimplePersonaImages(controller)
			const newImages = {
				avatar: currentImages?.avatar || Buffer.from(""),
				thinkingAvatar: currentImages?.thinkingAvatar || Buffer.from(""),
			}

			if (imageType === "avatar") {
				newImages.avatar = imageData
			} else if (imageType === "thinkingAvatar") {
				newImages.thinkingAvatar = imageData
			}

			await personaStorage.savePersonaImages(controller, newImages)

			const [profileDetails, savedImages] = await Promise.all([
				personaStorage.getPersona(controller),
				personaStorage.loadSimplePersonaImages(controller),
			])

			const avatarUri = savedImages?.avatar ? `data:image/png;base64,${savedImages.avatar.toString("base64")}` : ""
			const thinkingAvatarUri = savedImages?.thinkingAvatar
				? `data:image/png;base64,${savedImages.thinkingAvatar.toString("base64")}`
				: ""

			const profile = PersonaProfile.create({
				name: profileDetails.name,
				description: profileDetails.description,
				customInstruction: profileDetails.customInstruction,
				avatarUri,
				thinkingAvatarUri,
			})

			personaService.notifyPersonaChange(profile)

			return Empty.create()
		} catch (error) {
			const errorMessage = `[CARET-PERSONA] uploadCustomImage: Failed to upload custom image: ${error}`
			Logger.error(errorMessage)
			throw new Error(errorMessage)
		}
	}
}

export function getStandaloneUploadCustomImageHandler(
	personaStorage: PersonaStorage,
	personaService: PersonaService,
): handleUnaryCall<UploadCustomImageRequest, Empty> {
	const vscodeHandler = uploadCustomImageHandler(personaStorage, personaService)
	return async (call, callback: sendUnaryData<Empty>): Promise<void> => {
		try {
			const controller = Controller.instance
			if (!controller) {
				throw new Error("Controller not initialized")
			}
			const result = await vscodeHandler(controller, call.request)
			callback(null, result)
		} catch (error) {
			const errorMessage = `[CARET-PERSONA] uploadCustomImage: Failed to upload custom image: ${error}`
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

export const uploadCustomImage = uploadCustomImageHandler(new PersonaStorage(), new PersonaService())
export const getStandaloneUploadCustomImage = getStandaloneUploadCustomImageHandler(new PersonaStorage(), new PersonaService())
