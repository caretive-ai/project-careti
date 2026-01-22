import { Logger } from "@services/logging/Logger"
import * as proto from "@shared/proto"
import axios from "axios"
import { Controller } from "@/core/controller"

/**
 * CARETI MODIFICATION: Fetches available AND healthy models from LiteLLM
 * Uses /health endpoint to get healthy models and /v1/models to get accessible models
 * Returns intersection of both (models that are healthy AND accessible with provided API key)
 * @param controller The controller instance
 * @param request The request containing base URL and API key
 * @returns Response with filtered model names or error
 */
export async function fetchLiteLlmModels(
	_controller: Controller,
	request: proto.careti.FetchLiteLlmModelsRequest,
): Promise<proto.careti.FetchLiteLlmModelsResponse> {
	/**
	 * Normalize model name for comparison between /health and /v1/models
	 * - Removes "ollama_chat/" prefix
	 * - Replaces ":" with "-"
	 */
	const normalizeModelName = (name: string): string => {
		let normalized = name
		// Remove ollama_chat/ prefix
		if (normalized.startsWith("ollama_chat/")) {
			normalized = normalized.replace("ollama_chat/", "")
		}
		// Replace : with - (ollama naming convention)
		normalized = normalized.replace(":", "-")
		return normalized
	}

	try {
		Logger.debug(`[CaretSystemService] 🎯 Fetching LiteLLM models from ${request.baseUrl}`)

		// Validate base URL
		if (!request.baseUrl) {
			Logger.warn("[CaretSystemService] ⚠️ Base URL is required")
			return proto.careti.FetchLiteLlmModelsResponse.create({
				success: false,
				models: [],
				errorMessage: "Base URL is required",
			})
		}

		if (!URL.canParse(request.baseUrl)) {
			Logger.warn(`[CaretSystemService] ⚠️ Invalid base URL format: ${request.baseUrl}`)
			return proto.careti.FetchLiteLlmModelsResponse.create({
				success: false,
				models: [],
				errorMessage: "Invalid base URL format",
			})
		}

		const baseUrl = request.baseUrl.replace(/\/$/, "")

		// Prepare headers for /health endpoint (uses Authorization: Bearer)
		const healthHeaders: Record<string, string> = {
			accept: "application/json",
		}
		if (request.apiKey && request.apiKey.trim() !== "") {
			healthHeaders["Authorization"] = `Bearer ${request.apiKey}`
		}

		// Prepare headers for /v1/models endpoint (uses x-litellm-api-key)
		const modelsHeaders: Record<string, string> = {
			accept: "application/json",
		}
		if (request.apiKey && request.apiKey.trim() !== "") {
			modelsHeaders["x-litellm-api-key"] = request.apiKey
			// CARETI MODIFICATION: some LiteLLM deployments expect Authorization header as well
			modelsHeaders["Authorization"] = `Bearer ${request.apiKey}`
		}

		// Step 1: Fetch healthy models from /health endpoint
		Logger.debug(`[CaretSystemService] 🏥 Calling /health endpoint: ${baseUrl}/health`)
		const healthUrl = `${baseUrl}/health`
		let healthyModels: string[] = []
		let healthCheckAvailable = false

		try {
			const healthResponse = await axios.get(healthUrl, {
				headers: healthHeaders,
				timeout: 60000, // 60 second timeout (health check can be slow)
			})

			const healthyEndpoints = healthResponse.data?.healthy_endpoints || []
			healthyModels = healthyEndpoints
				.map((endpoint: any) => endpoint.model)
				.filter((model: string) => model && typeof model === "string")

			healthCheckAvailable = true
			Logger.debug(`[CaretSystemService] 🏥 Health check returned ${healthyModels.length} healthy models`)
		} catch (healthError) {
			Logger.warn(
				`[CaretSystemService] ⚠️ Failed to fetch health status: ${
					healthError instanceof Error ? healthError.message : "Unknown error"
				}`,
			)
			// Continue with /v1/models only if /health fails
		}

		// Step 2: Fetch available models from /v1/models endpoint
		const modelsUrl = `${baseUrl}/v1/models?return_wildcard_routes=false&include_model_access_groups=false&only_model_access_groups=false&include_metadata=false`
		Logger.debug(`[CaretSystemService] 🔍 Calling /v1/models endpoint: ${modelsUrl}`)

		const modelsResponse = await axios.get(modelsUrl, {
			headers: modelsHeaders,
			timeout: 10000, // 10 second timeout
		})

		const modelsData = modelsResponse.data?.data || []
		const availableModels = modelsData.map((model: any) => model.id).filter((id: string) => id && typeof id === "string")

		Logger.debug(`[CaretSystemService] 📋 /v1/models returned ${availableModels.length} available models`)

		// Step 3: Filter healthy models by availability
		// Start with healthy models (full names) and check if normalized name exists in available models
		let filteredModels: string[]

		if (!healthCheckAvailable) {
			// If health check failed, return all available models to avoid blocking usage
			Logger.info(`[CaretSystemService] ℹ️ Using all available models (health check unavailable)`)
			filteredModels = availableModels
		} else if (healthyModels.length === 0 && availableModels.length === 0) {
			Logger.warn("[CaretSystemService] ⚠️ No models available in LiteLLM response")
			return proto.careti.FetchLiteLlmModelsResponse.create({
				success: false,
				models: [],
				errorMessage: "No models available",
			})
		} else {
			filteredModels = healthyModels
				.map((model) => normalizeModelName(model))
				.filter((model) => availableModels.some((availableModel: string) => normalizeModelName(availableModel) === model))
				// Sort models for consistent ordering in UI
				.sort((a: string, b: string) => a.localeCompare(b))

			Logger.info(`[CaretSystemService] 🧠 Filtered ${filteredModels.length} healthy and available models`)
		}

		return proto.careti.FetchLiteLlmModelsResponse.create({
			success: true,
			models: filteredModels,
		})
	} catch (error) {
		Logger.error(`[CaretSystemService] ❌ Failed to fetch LiteLLM models: ${error}`)
		return proto.careti.FetchLiteLlmModelsResponse.create({
			success: false,
			models: [],
			errorMessage: `${(error as Error).message}`,
		})
	}
}

// Export with PascalCase name for generated code compatibility
export const FetchLiteLlmModels = fetchLiteLlmModels
