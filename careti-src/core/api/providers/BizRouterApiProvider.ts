import { Anthropic } from "@anthropic-ai/sdk"
import { bizRouterModelInfoSaneDefaults, BizRouterModelInfo } from "@shared/api"
import OpenAI from "openai"
import { ApiHandler, CommonApiHandlerOptions } from "@core/api"
import { withRetry } from "@core/api/retry"
import { convertToOpenAiMessages } from "@core/api/transform/openai-format"
import { ApiStream } from "@core/api/transform/stream"

interface BizRouterHandlerOptions extends CommonApiHandlerOptions {
	bizRouterApiKey?: string
	// CARETI MODIFICATION: BizRouter uses hardcoded URL (https://bizrouter.ai/api/v1)
	bizRouterModelId?: string
	bizRouterModelInfo?: BizRouterModelInfo
	thinkingBudgetTokens?: number
	bizRouterUsePromptCache?: boolean
	ulid?: string
}

export interface BizRouterModelInfoResponse {
	data: Array<{
		model_name: string
		litellm_params: {
			model: string
			[key: string]: any
		}
		model_info: {
			input_cost_per_token: number
			output_cost_per_token: number
			cache_creation_input_token_cost?: number
			cache_read_input_token_cost?: number
			supports_prompt_caching?: boolean
			[key: string]: any
		}
	}>
}

// Response type for /api/v1/models endpoint (filtered by API key)
export interface BizRouterAvailableModelsResponse {
	data: Array<{
		id: string
		object: string
		created: number
		owned_by: string
	}>
	object: string
}

export class BizRouterHandler implements ApiHandler {
	private options: BizRouterHandlerOptions
	private client: OpenAI | undefined
	private modelInfoCache: BizRouterModelInfoResponse | undefined
	private modelInfoCacheTimestamp: number = 0
	private readonly modelInfoCacheTTL = 5 * 60 * 1000 // 5 minutes

	constructor(options: BizRouterHandlerOptions) {
		this.options = options
	}

	private ensureClient(): OpenAI {
		if (!this.client) {
			if (!this.options.bizRouterApiKey) {
				throw new Error("BizRouter API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: "https://bizrouter.ai/api/v1",
					apiKey: this.options.bizRouterApiKey,
					defaultHeaders: {
						"X-API-Key": this.options.bizRouterApiKey,
					},
				})
			} catch (error) {
				throw new Error(`Error creating BizRouter client: ${(error as Error).message}`)
			}
		}
		return this.client
	}

	private async modelInfo(publicModelName: string): Promise<BizRouterModelInfoResponse["data"][number] | undefined> {
		const modelInfo = await this.fetchModelsInfo()

		if (!modelInfo?.data) {
			return undefined
		}

		return modelInfo.data.find((model) => model.model_name === publicModelName)
	}

	private async fetchModelsInfo(): Promise<BizRouterModelInfoResponse | undefined> {
		// Check if cache is still valid
		const now = Date.now()
		if (this.modelInfoCache && now - this.modelInfoCacheTimestamp < this.modelInfoCacheTTL) {
			return this.modelInfoCache
		}

		const client = this.ensureClient()
		// Handle base URLs that already include /v1 or /api/v1 to avoid duplication
		let baseUrl = client.baseURL
		if (baseUrl.endsWith("/v1")) {
			baseUrl = baseUrl.replace(/\/v1$/, "")
		}
		if (baseUrl.endsWith("/api")) {
			baseUrl = baseUrl.replace(/\/api$/, "")
		}
		const url = `${baseUrl}/api/v1/model/info`

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					accept: "application/json",
					"X-API-Key": this.options.bizRouterApiKey || "",
				},
			})

			if (response.ok) {
				const data: BizRouterModelInfoResponse = await response.json()
				this.modelInfoCache = data
				this.modelInfoCacheTimestamp = now
				return data
			} else {
				console.warn("Failed to fetch BizRouter model info:", response.statusText)
				return undefined
			}
		} catch (error) {
			console.warn("Error fetching BizRouter model info:", error)
			return undefined
		}
	}

	private async getModelCostInfo(publicModelName: string): Promise<{
		inputCostPerToken: number
		outputCostPerToken: number
		cacheCreationCostPerToken?: number
		cacheReadCostPerToken?: number
	}> {
		try {
			const matchingModel = await this.modelInfo(publicModelName)

			if (matchingModel) {
				return {
					inputCostPerToken: matchingModel.model_info.input_cost_per_token || 0,
					outputCostPerToken: matchingModel.model_info.output_cost_per_token || 0,
					cacheCreationCostPerToken: matchingModel.model_info.cache_creation_input_token_cost,
					cacheReadCostPerToken: matchingModel.model_info.cache_read_input_token_cost,
				}
			}
		} catch (error) {
			console.warn("Error getting BizRouter model cost info:", error)
		}

		// Fallback to zero costs if we can't get the information
		return {
			inputCostPerToken: 0,
			outputCostPerToken: 0,
		}
	}

	async calculateCost(
		prompt_tokens: number,
		completion_tokens: number,
		cache_creation_tokens?: number,
		cache_read_tokens?: number,
	): Promise<number | undefined> {
		const publicModelId = this.options.bizRouterModelId || ""

		try {
			const costInfo = await this.getModelCostInfo(publicModelId)

			// Calculate costs for different token types
			const inputCost = Math.max(0, prompt_tokens - (cache_read_tokens || 0)) * costInfo.inputCostPerToken
			const outputCost = completion_tokens * costInfo.outputCostPerToken
			const cacheCreationCost = (cache_creation_tokens || 0) * (costInfo.cacheCreationCostPerToken || 0)
			const cacheReadCost = (cache_read_tokens || 0) * (costInfo.cacheReadCostPerToken || 0)

			const totalCost = inputCost + outputCost + cacheCreationCost + cacheReadCost

			return totalCost
		} catch (error) {
			console.error("Error calculating spend:", error)
			return undefined
		}
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const client = this.ensureClient()
		const formattedMessages = convertToOpenAiMessages(messages)
		const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam | Anthropic.Messages.TextBlockParam = {
			role: "system",
			content: systemPrompt,
		}
		const modelId = this.options.bizRouterModelId || ""

		// Configuration for extended thinking (for models that support it)
		const budgetTokens = this.options.thinkingBudgetTokens || 0
		const reasoningOn = budgetTokens !== 0
		const thinkingConfig = reasoningOn ? { type: "enabled", budget_tokens: budgetTokens } : undefined

		// Temperature configuration (skip for reasoning models)
		let temperature: number | undefined = this.options.bizRouterModelInfo?.temperature
		if (reasoningOn) {
			temperature = undefined // Thinking mode doesn't support temperature
		}
		// Skip temperature if 0 (BizRouter doesn't accept 0)
		if (temperature === 0) {
			temperature = undefined
		}

		// Prompt cache configuration
		const modelInfo = await this.modelInfo(modelId)
		const cacheControl =
			this.options.bizRouterUsePromptCache && Boolean(modelInfo?.model_info.supports_prompt_caching)
				? { cache_control: { type: "ephemeral" } }
				: undefined

		if (cacheControl) {
			// Add cache_control to system message if enabled
			systemMessage.content = [
				{
					text: systemPrompt,
					type: "text",
					...cacheControl,
				},
			] as Anthropic.Messages.TextBlockParam[]
		}

		// Find the last two user messages to apply caching
		const userMsgIndices = formattedMessages.reduce(
			(acc, msg, index) => (msg.role === "user" ? [...acc, index] : acc),
			[] as number[],
		)
		const lastUserMsgIndex = userMsgIndices[userMsgIndices.length - 1] ?? -1
		const secondLastUserMsgIndex = userMsgIndices[userMsgIndices.length - 2] ?? -1

		// Apply cache_control to the last two user messages if enabled
		const enhancedMessages: OpenAI.Chat.ChatCompletionMessageParam[] = formattedMessages.map(
			(message, index): OpenAI.Chat.ChatCompletionMessageParam => {
				if ((index === lastUserMsgIndex || index === secondLastUserMsgIndex) && cacheControl) {
					// Handle both string and array content types
					if (typeof message.content === "string") {
						return {
							...message,
							content: [
								{
									type: "text",
									text: message.content,
									...cacheControl,
								},
							] as any,
						}
					} else if (Array.isArray(message.content)) {
						// Apply cache control to the last content item in the array
						return {
							...message,
							content: message.content.map((item, contentIndex) =>
								contentIndex === (message.content?.length || 0) - 1
									? {
											...item,
											...cacheControl,
										}
									: item,
							) as any,
						}
					}

					return {
						...message,
						...cacheControl,
					}
				}
				return message
			},
		)

		// CARETI MODIFICATION: Get max_tokens from model configuration
		const modelConfig = this.options.bizRouterModelInfo || bizRouterModelInfoSaneDefaults
		const maxTokens = modelConfig.maxTokens && modelConfig.maxTokens > 0 ? modelConfig.maxTokens : undefined

		// CARETI MODIFICATION: Build request parameters
		const requestParams: any = {
			model: this.options.bizRouterModelId || "",
			messages: [systemMessage, ...enhancedMessages],
			stream: true,
			stream_options: { include_usage: true },
		}

		// Add optional parameters
		if (temperature !== undefined && !isNaN(temperature)) requestParams.temperature = temperature
		if (maxTokens !== undefined && !isNaN(maxTokens)) requestParams.max_tokens = maxTokens
		if (thinkingConfig) requestParams.thinking = thinkingConfig
		// CARETI MODIFICATION: metadata requires 'store' parameter, skip for now to avoid errors

		// OpenAI-compatible parameters
		if (modelConfig.topP !== undefined && !isNaN(modelConfig.topP)) requestParams.top_p = modelConfig.topP
		if (modelConfig.frequencyPenalty !== undefined && !isNaN(modelConfig.frequencyPenalty)) requestParams.frequency_penalty = modelConfig.frequencyPenalty
		if (modelConfig.presencePenalty !== undefined && !isNaN(modelConfig.presencePenalty)) requestParams.presence_penalty = modelConfig.presencePenalty

		// BizRouter extended parameters (Anthropic, Google models)
		if (modelConfig.topK !== undefined && !isNaN(modelConfig.topK)) requestParams.top_k = modelConfig.topK
		if (modelConfig.repetitionPenalty !== undefined && !isNaN(modelConfig.repetitionPenalty)) requestParams.repetition_penalty = modelConfig.repetitionPenalty
		if (modelConfig.minP !== undefined && !isNaN(modelConfig.minP)) requestParams.min_p = modelConfig.minP

		// CARETI MODIFICATION: Log request for debugging
		console.log("[BizRouterHandler] 🔍 API Request params:", JSON.stringify(requestParams, null, 2))

		const stream = (await client.chat.completions.create(
			requestParams,
		)) as unknown as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>

		for await (const chunk of stream) {
			// Skip chunks without choices array (some models send metadata in first chunk)
			if (!chunk.choices || chunk.choices.length === 0) {
				// Check for usage in chunks without choices
				if (chunk.usage) {
					// Extract cache-related information if available
					const usage = chunk.usage as {
						prompt_tokens: number
						completion_tokens: number
						cache_creation_input_tokens?: number
						prompt_cache_miss_tokens?: number
						cache_read_input_tokens?: number
						prompt_cache_hit_tokens?: number
					}

					const cacheWriteTokens = usage.cache_creation_input_tokens || usage.prompt_cache_miss_tokens || 0
					const cacheReadTokens = usage.cache_read_input_tokens || usage.prompt_cache_hit_tokens || 0

					// Calculate cost using the actual token usage including cache tokens
					const totalCost =
						(await this.calculateCost(
							usage.prompt_tokens || 0,
							usage.completion_tokens || 0,
							cacheWriteTokens > 0 ? cacheWriteTokens : undefined,
							cacheReadTokens > 0 ? cacheReadTokens : undefined,
						)) || 0

					yield {
						type: "usage",
						inputTokens: usage.prompt_tokens || 0,
						outputTokens: usage.completion_tokens || 0,
						cacheWriteTokens: cacheWriteTokens > 0 ? cacheWriteTokens : undefined,
						cacheReadTokens: cacheReadTokens > 0 ? cacheReadTokens : undefined,
						totalCost,
					}
				}
				continue
			}

			const delta = chunk.choices[0]?.delta

			// Handle normal text content
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			// Handle reasoning events (for models that support it)
			interface ThinkingDelta {
				reasoning_content?: string
			}

			if ((delta as ThinkingDelta)?.reasoning_content) {
				yield {
					type: "reasoning",
					reasoning: (delta as ThinkingDelta).reasoning_content || "",
				}
			}

			// Handle token usage information
			if (chunk.usage) {
				// Extract cache-related information if available
				const usage = chunk.usage as {
					prompt_tokens: number
					completion_tokens: number
					cache_creation_input_tokens?: number
					prompt_cache_miss_tokens?: number
					cache_read_input_tokens?: number
					prompt_cache_hit_tokens?: number
				}

				const cacheWriteTokens = usage.cache_creation_input_tokens || usage.prompt_cache_miss_tokens || 0
				const cacheReadTokens = usage.cache_read_input_tokens || usage.prompt_cache_hit_tokens || 0

				// Calculate cost using the actual token usage including cache tokens
				const totalCost =
					(await this.calculateCost(
						usage.prompt_tokens || 0,
						usage.completion_tokens || 0,
						cacheWriteTokens > 0 ? cacheWriteTokens : undefined,
						cacheReadTokens > 0 ? cacheReadTokens : undefined,
					)) || 0

				yield {
					type: "usage",
					inputTokens: usage.prompt_tokens || 0,
					outputTokens: usage.completion_tokens || 0,
					cacheWriteTokens: cacheWriteTokens > 0 ? cacheWriteTokens : undefined,
					cacheReadTokens: cacheReadTokens > 0 ? cacheReadTokens : undefined,
					totalCost,
				}
			}
		}
	}

	getModel() {
		// Use model info if available, otherwise use safe defaults
		const modelId = this.options.bizRouterModelId || ""
		const modelInfo: BizRouterModelInfo = this.options.bizRouterModelInfo || {
			maxTokens: 4096,
			contextWindow: 8192,
			supportsPromptCache: false,
			inputPrice: 0,
			outputPrice: 0,
			temperature: 0,
		}

		return {
			id: modelId,
			info: modelInfo,
		}
	}
}
