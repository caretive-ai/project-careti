// CARET MODIFICATION: Handler for uploading custom persona images

import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { UploadCustomImageRequest } from "@shared/proto/caret/persona"
import { Empty } from "@shared/proto/cline/common"
import type { Controller } from "@core/controller"

/**
 * Handles uploading custom persona images
 * @param controller The controller instance
 * @param request Upload image request
 * @returns Empty response
 */
export async function UploadCustomImage(controller: Controller, request: UploadCustomImageRequest): Promise<Empty> {
	try {
		if (!request.imageData || !request.imageType) {
			throw new Error("Image data and type are required")
		}

		// Convert image data to Buffer
		const imageBuffer = Buffer.from(request.imageData)

		// Convert to base64 for globalState storage
		const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`

		// Get current persona profile from globalState
		const personaData = controller.context.globalState.get<any>("personaProfile") || {}

		// Update the appropriate image URI based on type
		if (request.imageType === "avatar") {
			personaData.avatar_uri = base64Image
		} else if (request.imageType === "thinking_avatar") {
			personaData.thinking_avatar_uri = base64Image
		} else {
			throw new Error(`Unknown image type: ${request.imageType}`)
		}

		// Save to globalState for backward compatibility
		await controller.context.globalState.update("personaProfile", personaData)

		// CARET MODIFICATION: Also save to file system for persistence
		// Load existing images or use uploaded one
		const personaStorage = new PersonaStorage()
		const existingImages = await personaStorage.loadSimplePersonaImages(controller)

		let avatarBuffer = existingImages?.avatar || imageBuffer
		let thinkingAvatarBuffer = existingImages?.thinkingAvatar || imageBuffer

		if (request.imageType === "avatar") {
			avatarBuffer = imageBuffer
		} else if (request.imageType === "thinking_avatar") {
			thinkingAvatarBuffer = imageBuffer
		}

		// Save both images to file system
		await personaStorage.savePersonaImages(controller, {
			avatar: avatarBuffer,
			thinkingAvatar: thinkingAvatarBuffer,
		})

		console.log(`[PersonaService] Uploaded custom ${request.imageType} image and saved to file system`)

		return Empty.create({})
	} catch (error) {
		console.error(`Failed to upload custom image: ${error}`)
		throw error
	}
}
