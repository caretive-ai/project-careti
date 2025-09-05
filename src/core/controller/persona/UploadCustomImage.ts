// CARET MODIFICATION: Handler for uploading custom persona images

import { UploadCustomImageRequest } from "@shared/proto/caret/persona"
import { Empty } from "@shared/proto/cline/common"
import type { Controller } from "../index"

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

		// Convert image data to base64 string
		const base64Image = `data:image/png;base64,${Buffer.from(request.imageData).toString("base64")}`

		// Get current persona profile
		const personaData = controller.context.globalState.get<any>("personaProfile") || {}

		// Update the appropriate image URI based on type
		if (request.imageType === "avatar") {
			personaData.avatar_uri = base64Image
		} else if (request.imageType === "thinking_avatar") {
			personaData.thinking_avatar_uri = base64Image
		} else {
			throw new Error(`Unknown image type: ${request.imageType}`)
		}

		// Save updated persona profile
		await controller.context.globalState.update("personaProfile", personaData)

		console.log(`[PersonaService] Uploaded custom ${request.imageType} image`)

		return Empty.create({})
	} catch (error) {
		console.error(`Failed to upload custom image: ${error}`)
		throw error
	}
}
