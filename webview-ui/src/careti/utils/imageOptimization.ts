// CARETI MODIFICATION: Webview image optimization delegates to backend for shared logic.
import CaretiWebviewLogger from "@/careti/utils/CaretiWebviewLogger"
import { CaretSystemServiceClient } from "@/services/grpc-client"

const logger = new CaretiWebviewLogger("ImageOptimization")

export const optimizeImageDataUrl = async (dataUrl: string): Promise<string> => {
	try {
		const response = await CaretSystemServiceClient.OptimizeImageDataUrls({ dataUrls: [dataUrl] })
		const optimized = response.dataUrls?.[0]
		if (!optimized) {
			throw new Error("No optimized image returned.")
		}
		return optimized
	} catch (error) {
		logger.warn("Backend image optimization failed", error)
		throw error
	}
}
