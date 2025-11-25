import { Controller } from "@core/controller"
import { Logger } from "@services/logging/Logger"
import * as proto from "@shared/proto"
import axios from "axios"

/**
 * Fetches available models from BizRouter /api/v1/models endpoint
 * This endpoint returns only models assigned to the provided API key
 * CARET MODIFICATION: Uses hardcoded URL https://bizrouter.ai/api/v1
 * @param controller The controller instance
 * @param request The request containing API key
 * @returns Response with model names or error
 */
export async function fetchBizRouterModels(
	_controller: Controller,
	request: proto.caret.FetchBizRouterModelsRequest,
): Promise<proto.caret.FetchBizRouterModelsResponse> {
	const BIZROUTER_BASE_URL = "https://bizrouter.ai/api/v1"

	try {
		Logger.debug(`[CaretSystemService] 🎯 Fetching BizRouter models from ${BIZROUTER_BASE_URL}`)

		// Validate API key
		if (!request.apiKey || request.apiKey.trim() === "") {
			Logger.warn("[CaretSystemService] ⚠️ API key is required for BizRouter")
			return proto.caret.FetchBizRouterModelsResponse.create({
				success: false,
				models: [],
				errorMessage: "API key is required",
			})
		}

		// Prepare headers
		const headers: Record<string, string> = {
			accept: "application/json",
			"X-API-Key": request.apiKey,
		}

		// Call BizRouter /api/v1/models endpoint
		const modelsUrl = `${BIZROUTER_BASE_URL}/models`
		Logger.debug(`[CaretSystemService] 🔍 Calling /api/v1/models endpoint: ${modelsUrl}`)

		const response = await axios.get(modelsUrl, {
			headers,
			timeout: 10000, // 10 second timeout
		})

		// CARET MODIFICATION: BizRouter returns { models: [...], exchange_rate: number }
		const modelsData = response.data?.models || []
		Logger.debug(`[CaretSystemService] 📋 Models response received with ${modelsData.length} models`)

		// Extract model IDs (these are already filtered by API key)
		const modelNames = modelsData
			.map((model: any) => model.id)
			.filter((id: string) => id && typeof id === "string")
			.sort()

		Logger.info(
			`[CaretSystemService] ✅ Successfully fetched ${modelNames.length} BizRouter models: ${modelNames.join(", ")}`,
		)

		return proto.caret.FetchBizRouterModelsResponse.create({
			success: true,
			models: modelNames,
		})
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
		Logger.error(`[CaretSystemService] ❌ Failed to fetch BizRouter models: ${errorMessage}`)

		return proto.caret.FetchBizRouterModelsResponse.create({
			success: false,
			models: [],
			errorMessage: `Failed to fetch models: ${errorMessage}`,
		})
	}
}

// Export with PascalCase name for generated code compatibility
export const FetchBizRouterModels = fetchBizRouterModels
