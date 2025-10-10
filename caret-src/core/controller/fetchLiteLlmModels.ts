import { Logger } from "@services/logging/Logger"
import axios from "axios"
import { Controller } from "@/core/controller"
import * as proto from "@shared/proto"

/**
 * CARET MODIFICATION: Fetches available models from LiteLLM health endpoint
 * @param controller The controller instance
 * @param request The request containing base URL and API key
 * @returns Response with model names or error
 */
export async function fetchLiteLlmModels(
	_controller: Controller,
	request: proto.caret.FetchLiteLlmModelsRequest,
): Promise<proto.caret.FetchLiteLlmModelsResponse> {
	try {
		Logger.debug(`[CaretSystemService] 🎯 Fetching LiteLLM models from ${request.baseUrl}`)

		// Validate base URL
		if (!request.baseUrl) {
			Logger.warn("[CaretSystemService] ⚠️ Base URL is required")
			return proto.caret.FetchLiteLlmModelsResponse.create({
				success: false,
				models: [],
				errorMessage: "Base URL is required",
			})
		}

		if (!URL.canParse(request.baseUrl)) {
			Logger.warn(`[CaretSystemService] ⚠️ Invalid base URL format: ${request.baseUrl}`)
			return proto.caret.FetchLiteLlmModelsResponse.create({
				success: false,
				models: [],
				errorMessage: "Invalid base URL format",
			})
		}

		// Prepare headers
		const headers: Record<string, string> = {}
		if (request.apiKey) {
			// LiteLLM supports both x-litellm-api-key and Authorization Bearer patterns
			headers["x-litellm-api-key"] = request.apiKey
		}

		// Call LiteLLM health endpoint
		const healthUrl = `${request.baseUrl.replace(/\/$/, "")}/health`
		Logger.debug(`[CaretSystemService] 🔍 Calling health endpoint: ${healthUrl}`)

		const response = await axios.get(healthUrl, {
			headers,
			timeout: 10000, // 10 second timeout
		})

		// Extract healthy models from health response
		const healthyEndpoints = response.data?.healthy_endpoints || []
		Logger.debug(`[CaretSystemService] 📋 Health response received with ${healthyEndpoints.length} endpoints`)

		// Extract unique model names from healthy endpoints
		const modelNames = healthyEndpoints
			.map((endpoint: any) => endpoint.model)
			.filter((model: string) => model && typeof model === "string")
			.filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) // Remove duplicates
			.sort()

		Logger.info(`[CaretSystemService] ✅ Successfully fetched ${modelNames.length} LiteLLM models: ${modelNames.join(", ")}`)

		return proto.caret.FetchLiteLlmModelsResponse.create({
			success: true,
			models: modelNames,
		})
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
		Logger.error(`[CaretSystemService] ❌ Failed to fetch LiteLLM models from ${request.baseUrl}: ${errorMessage}`)

		return proto.caret.FetchLiteLlmModelsResponse.create({
			success: false,
			models: [],
			errorMessage: `Failed to fetch models: ${errorMessage}`,
		})
	}
}

// CARET MODIFICATION: Export with PascalCase name for generated code compatibility
export const FetchLiteLlmModels = fetchLiteLlmModels
