import { ensureCacheDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { ModelInfo } from "@shared/api"
import { fileExistsAtPath } from "@utils/fs"
import axios from "axios"
import fs from "fs/promises"
import path from "path"
import { telemetryService } from "@/services/telemetry"
import { getAxiosSettings } from "@/shared/net"
import { groqModels } from "../../../shared/api"
import { Controller } from ".."

/**
 * Refreshes the Groq models and returns the updated model list
 * @param controller The controller instance
 * @returns Record containing the Groq models
 */
export async function refreshGroqModels(controller: Controller): Promise<Record<string, ModelInfo>> {
	const groqModelsFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.groqModels)

	const groqApiKey = controller.stateManager.getSecretKey("groqApiKey")

	let models: Record<string, Partial<ModelInfo>> = {}
	try {
		if (!groqApiKey) {
			console.log("No Groq API key found, using static models as fallback")
			// Don't throw an error, just use static models
			for (const [modelId, modelInfo] of Object.entries(groqModels)) {
				models[modelId] = {
					maxTokens: modelInfo.maxTokens,
					contextWindow: modelInfo.contextWindow,
					supportsImages: modelInfo.supportsImages,
					supportsPromptCache: modelInfo.supportsPromptCache,
					inputPrice: modelInfo.inputPrice,
					outputPrice: modelInfo.outputPrice,
					cacheWritesPrice: (modelInfo as any).cacheWritesPrice || 0,
					cacheReadsPrice: (modelInfo as any).cacheReadsPrice || 0,
					description: modelInfo.description || `${modelId} model`,
				}
			}
		} else {
			// Ensure the API key is properly formatted
			const cleanApiKey = groqApiKey.trim()
			if (!cleanApiKey.startsWith("gsk_")) {
				throw new Error("Invalid Groq API key format. Groq API keys should start with 'gsk_'")
			}

			const response = await axios.get("https://api.groq.com/openai/v1/models", {
				headers: {
					Authorization: `Bearer ${cleanApiKey}`,
					"Content-Type": "application/json",
					"User-Agent": "Careti-VSCode-Extension",
				},
				timeout: 10000, // 10 second timeout
				...getAxiosSettings(),
			})

			if (response.data?.data) {
				const rawModels = response.data.data

				for (const rawModel of rawModels) {
					// Filter out non-chat models and validate model capabilities
					if (!isValidChatModel(rawModel)) {
						continue
					}

					// Check if we have static pricing information for this model
					const staticModelInfo = groqModels[rawModel.id as keyof typeof groqModels]

					const modelInfo: Partial<ModelInfo> = {
						maxTokens: rawModel.max_completion_tokens || staticModelInfo?.maxTokens || 8192,
						contextWindow: rawModel.context_window || staticModelInfo?.contextWindow || 8192,
						supportsImages: detectImageSupport(rawModel, staticModelInfo),
						supportsPromptCache: staticModelInfo?.supportsPromptCache || false,
						inputPrice: staticModelInfo?.inputPrice || 0,
						outputPrice: staticModelInfo?.outputPrice || 0,
						cacheWritesPrice: (staticModelInfo as any)?.cacheWritesPrice || 0,
						cacheReadsPrice: (staticModelInfo as any)?.cacheReadsPrice || 0,
						description: generateModelDescription(rawModel, staticModelInfo),
					}

					models[rawModel.id] = modelInfo
				}
			} else {
				console.error("Invalid response from Groq API")
			}
			await fs.writeFile(groqModelsFilePath, JSON.stringify(models))
		}
	} catch (error) {
		console.error("Error fetching Groq models:", error)

		// Provide more specific error messages
		let errorMessage = "Unknown error occurred"
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
				errorMessage = "Invalid Groq API key. Please check your API key in settings."
			} else if (error.response?.status === 403) {
				errorMessage = "Access forbidden. Please verify your Groq API key has the correct permissions."
			} else if (error.response?.status === 429) {
				errorMessage = "Rate limit exceeded. Please try again later."
			} else if (error.code === "ECONNABORTED") {
				errorMessage = "Request timeout. Please check your internet connection."
			} else {
				errorMessage = `API request failed: ${error.response?.status || error.code || "Unknown error"}`
			}
		} else if (error instanceof Error) {
			errorMessage = error.message
		}

		telemetryService.captureProviderApiError({
			provider: "Groq",
			errorMessage,
			statusCode: axios.isAxiosError(error) ? error.response?.status : undefined,
		} as any)

		// If we failed to fetch models, try to read cached models first
		const cachedModels = await readGroqModels()
		if (cachedModels && Object.keys(cachedModels).length > 0) {
			// Use all cached models (no filtering)
			models = cachedModels
		} else {
			// Fall back to static models
			models = groqModels
		}
	}

	// Convert the Record<string, Partial<ModelInfo>> to Record<string, ModelInfo>
	// by filling in any missing required fields with defaults
	const typedModels: Record<string, ModelInfo> = {}
	for (const [key, model] of Object.entries(models as Record<string, Partial<ModelInfo>>)) {
		typedModels[key] = {
			maxTokens: model.maxTokens ?? 8192,
			contextWindow: model.contextWindow ?? 8192,
			supportsImages: model.supportsImages ?? false,
			supportsPromptCache: model.supportsPromptCache ?? false,
			inputPrice: model.inputPrice ?? 0,
			outputPrice: model.outputPrice ?? 0,
			cacheWritesPrice: model.cacheWritesPrice ?? 0,
			cacheReadsPrice: model.cacheReadsPrice ?? 0,
			description: model.description ?? "",
			tiers: model.tiers ?? [],
		}
	}

	return typedModels
}

/**
 * Reads cached Groq models from disk
 */
async function readGroqModels(): Promise<Record<string, ModelInfo> | undefined> {
	const groqModelsFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.groqModels)
	const fileExists = await fileExistsAtPath(groqModelsFilePath)
	if (fileExists) {
		try {
			const fileContents = await fs.readFile(groqModelsFilePath, "utf8")
			return JSON.parse(fileContents)
		} catch (error) {
			console.error("Error reading cached Groq models:", error)
			return undefined
		}
	}
	return undefined
}

/**
 * Validates if a model is suitable for chat completions
 */
function isValidChatModel(rawModel: any): boolean {
	// Filter out non-chat models (whisper, TTS, guard models, etc.)
	if (rawModel.id.includes("whisper") || rawModel.id.includes("tts") || rawModel.id.includes("embedding")) {
		return false
	}

	// Ensure chat capability
	const capabilities = rawModel.capabilities || {}
	if (!capabilities.completion_chat || capabilities.completion_chat === "N") {
		return false
	}

	return true
}

/**
 * Detects if the model supports image input
 */
function detectImageSupport(rawModel: any, staticModelInfo?: any): boolean {
	if (rawModel.capabilities?.image === "Y") {
		return true
	}
	return staticModelInfo?.supportsImages ?? false
}

/**
 * Generates a readable description for a model
 */
function generateModelDescription(rawModel: any, staticModelInfo?: any): string {
	const provider = rawModel.provider || staticModelInfo?.provider || "Groq"
	const family = rawModel.family || rawModel.capabilities?.family || staticModelInfo?.family || ""
	const context = rawModel.context_window || staticModelInfo?.contextWindow || ""

	const parts = [
		rawModel.id,
		provider ? `by ${provider}` : "",
		family ? `family ${family}` : "",
		context ? `context ${context}` : "",
	]

	return parts
		.map((p) => p.trim())
		.filter(Boolean)
		.join(" - ")
}
