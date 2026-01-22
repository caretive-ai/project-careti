import { ensureCacheDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { ModelInfo } from "@shared/api"
import { fileExistsAtPath } from "@utils/fs"
import { parsePrice } from "@utils/model-utils"
import axios from "axios"
import fs from "fs/promises"
import path from "path"
import { getAxiosSettings } from "@/shared/net"
import { basetenModels } from "../../../shared/api"
import { Controller } from ".."

/**
 * Core function: Refreshes the Baseten models and returns application types
 * @param controller The controller instance
 * @returns Record of model ID to ModelInfo (application types)
 */
export async function refreshBasetenModels(controller: Controller): Promise<Record<string, ModelInfo>> {
	const basetenModelsFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.basetenModels)

	// Get the Baseten API key from the controller's state
	const basetenApiKey = controller.stateManager.getSecretKey("basetenApiKey")

	const models: Record<string, Partial<ModelInfo> & { supportedFeatures?: string[] }> = {}
	try {
		if (!basetenApiKey) {
			// Don't throw an error, just use static models, although this might be slightly out of date
			for (const [modelId, modelInfo] of Object.entries(basetenModels as Record<string, any>)) {
				models[modelId] = {
					maxTokens: modelInfo.maxTokens,
					contextWindow: modelInfo.contextWindow,
					supportsImages: modelInfo.supportsImages,
					supportsPromptCache: modelInfo.supportsPromptCache,
					inputPrice: modelInfo.inputPrice,
					outputPrice: modelInfo.outputPrice,
					cacheWritesPrice: (modelInfo as any).cacheWritesPrice || 0,
					cacheReadsPrice: (modelInfo as any).cacheReadsPrice || 0,
					description: (modelInfo as any).description || `${modelId} model`,
				}
			}
		} else {
			// Ensure the API key is properly formatted
			const cleanApiKey = basetenApiKey.trim()
			if (!cleanApiKey) {
				throw new Error("Invalid Baseten API key format")
			}

			const response = await axios.get("https://inference.baseten.co/v1/models", {
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
					const staticModelInfo = basetenModels[rawModel.id as keyof typeof basetenModels]

					const modelInfo: Partial<ModelInfo> & { supportedFeatures?: string[] } = {
						maxTokens: rawModel.max_completion_tokens || staticModelInfo?.maxTokens,
						contextWindow: rawModel.context_length || staticModelInfo?.contextWindow,
						supportsImages: false, // Baseten model APIs do not support image input
						supportsPromptCache: staticModelInfo?.supportsPromptCache || false,
						inputPrice: parsePrice(rawModel.pricing?.prompt) || staticModelInfo?.inputPrice || 0,
						outputPrice: parsePrice(rawModel.pricing?.completion) || staticModelInfo?.outputPrice || 0,
						cacheWritesPrice: staticModelInfo?.cacheWritesPrice || 0,
						cacheReadsPrice: staticModelInfo?.cacheReadsPrice || 0,
						description: generateModelDescription(rawModel, staticModelInfo),
						supportedFeatures: rawModel.supported_features || [],
					}

					models[rawModel.id] = modelInfo
				}
			} else {
				console.error("Invalid response from Baseten API")
			}
			await fs.writeFile(basetenModelsFilePath, JSON.stringify(models))
		}
	} catch (error) {
		console.error("Error fetching Baseten models:", error)

		// Provide more specific error messages
		let errorMessage = "Unknown error occurred"
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
				errorMessage = "Invalid Baseten API key. Please check your API key in settings."
			} else if (error.response?.status === 403) {
				errorMessage = "Access forbidden. Please verify your Baseten API key has the correct permissions."
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

		console.error("Baseten API Error:", errorMessage)

		// If we failed to fetch models, try to read cached models first
		const cachedModels = await readBasetenModels()
		if (cachedModels && Object.keys(cachedModels).length > 0) {
			// Use all cached models (no filtering)
			for (const [modelId, modelInfo] of Object.entries(cachedModels)) {
				models[modelId] = modelInfo
			}
		} else {
			// Fall back to static models from shared/api.ts
			for (const [modelId, modelInfo] of Object.entries(basetenModels as Record<string, any>)) {
				models[modelId] = {
					maxTokens: modelInfo.maxTokens,
					contextWindow: modelInfo.contextWindow,
					supportsImages: modelInfo.supportsImages,
					supportsPromptCache: modelInfo.supportsPromptCache,
					inputPrice: modelInfo.inputPrice,
					outputPrice: modelInfo.outputPrice,
					cacheWritesPrice: (modelInfo as any).cacheWritesPrice || 0,
					cacheReadsPrice: (modelInfo as any).cacheReadsPrice || 0,
					description: (modelInfo as any).description || `${modelId} model`,
				}
			}
		}
	}

	// Convert the Record<string, Partial<ModelInfo>> to Record<string, ModelInfo>
	// by filling in any missing required fields with defaults
	const typedModels: Record<string, ModelInfo> = {}
	for (const [key, model] of Object.entries(models)) {
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
			// Note: supportedFeatures is preserved as custom property but not part of ModelInfo proto
		}
	}

	return typedModels
}

/**
 * Reads cached Baseten models from disk
 */
async function readBasetenModels(): Promise<Record<string, Partial<ModelInfo>> | undefined> {
	const basetenModelsFilePath = path.join(await ensureCacheDirectoryExists(), GlobalFileNames.basetenModels)
	const fileExists = await fileExistsAtPath(basetenModelsFilePath)
	if (fileExists) {
		try {
			const fileContents = await fs.readFile(basetenModelsFilePath, "utf8")
			return JSON.parse(fileContents)
		} catch (error) {
			console.error("Error reading cached Baseten models:", error)
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

	// Ensure chat capability and valid pricing
	const hasCompletion =
		rawModel.supported_features?.includes("chat.completions") || rawModel.supported_features?.includes("completions")
	if (!hasCompletion) return false

	// Must have pricing info
	if (!rawModel.pricing?.prompt && !rawModel.pricing?.completion) {
		return false
	}

	return true
}

/**
 * Generates a readable description for a model
 */
function generateModelDescription(rawModel: any, staticModelInfo?: any): string {
	const provider = rawModel.provider || staticModelInfo?.provider || "Baseten"
	const version = rawModel.version || rawModel.revision || staticModelInfo?.version || ""
	const family = rawModel.family || rawModel.capabilities?.family || staticModelInfo?.family || ""
	const maxContext = rawModel.context_length || staticModelInfo?.contextWindow || ""

	const parts = [
		rawModel.name || staticModelInfo?.name || rawModel.id,
		provider ? `by ${provider}` : "",
		version ? `(v${version})` : "",
		maxContext ? `context ${maxContext}` : "",
		family ? `family ${family}` : "",
	]

	return parts
		.map((p) => p.trim())
		.filter(Boolean)
		.join(" - ")
}
