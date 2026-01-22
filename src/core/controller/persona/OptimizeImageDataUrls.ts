// CARETI MODIFICATION: gRPC handler for shared image optimization (resize + webp).
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import * as proto from "@/shared/proto"
import { optimizeImageDataUrl } from "@careti/utils/image-optimization"

export async function OptimizeImageDataUrls(
	_controller: Controller,
	request: proto.careti.OptimizeImageDataUrlsRequest,
): Promise<proto.careti.OptimizeImageDataUrlsResponse> {
	const dataUrls = request.dataUrls ?? []
	const optimized: string[] = []

	for (let index = 0; index < dataUrls.length; index += 1) {
		const dataUrl = dataUrls[index]
		if (!dataUrl) {
			optimized.push("")
			continue
		}
		try {
			optimized.push(await optimizeImageDataUrl(dataUrl))
		} catch (error) {
			const message = error instanceof Error ? ` ${error.message}` : ""
			Logger.warn(`[OptimizeImageDataUrls] Failed to optimize image at index ${index}.${showSafeMessage(message)}`)
			optimized.push(dataUrl)
		}
	}

	return proto.careti.OptimizeImageDataUrlsResponse.create({
		dataUrls: optimized,
	})
}

const showSafeMessage = (message: string): string => {
	const trimmed = message.trim()
	return trimmed ? ` (${trimmed})` : ""
}
