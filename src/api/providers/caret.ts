// CARET MODIFICATION: Caret ?�용 API Provider
// Cline Provider�?기반?�로 Caret ?�비???�동???�한 Provider 구현

import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { ApiHandler } from "../"
import { ModelInfo, openRouterDefaultModelId, openRouterDefaultModelInfo } from "../../shared/api"
import { createOpenRouterStream } from "../transform/openrouter-stream"
import { ApiStream, ApiStreamUsageChunk } from "../transform/stream"
import axios from "axios"
import { OpenRouterErrorResponse } from "./types"
import { withRetry } from "../retry"
import { Logger } from "../../services/logging/Logger"
// CARET MODIFICATION: Use dynamic import for caretLogger to avoid rootDir issues

export interface CaretHandlerOptions {
	caretApiKey?: string
	taskId?: string
	reasoningEffort?: string
	thinkingBudgetTokens?: number
	openRouterProviderSorting?: string
	openRouterModelId?: string
	openRouterModelInfo?: ModelInfo
}

export class CaretHandler implements ApiHandler {
	private options: CaretHandlerOptions
	private client: OpenAI
	lastGenerationId?: string

	constructor(options: CaretHandlerOptions) {
		this.options = options

		// CARET MODIFICATION: Caret ?�비??URL ?�용
		this.client = new OpenAI({
			baseURL: "https://api.caret.team/v1",
			apiKey: this.options.caretApiKey || "",
			defaultHeaders: {
				"HTTP-Referer": "https://caret.team", // Caret ??�� �??�계
				"X-Title": "Caret", // Caret ?�비?�명
				"X-Task-ID": this.options.taskId || "",
			},
		})

		// CARET MODIFICATION: 초기??로깅 (?�적 import)
		this.logInit()
	}

	private async logInit() {
		// CARET MODIFICATION: ?�시?�으�?Logger ?�용 (rootDir 문제 ?�결??
		Logger.info("[CARET-PROVIDER] CaretHandler initialized")
		Logger.debug(`[CARET-PROVIDER] Task ID: ${this.options.taskId}`)
		Logger.debug(`[CARET-PROVIDER] API Key: ${this.options.caretApiKey ? "SET" : "NOT SET"}`)
	}

	// Testing helper methods (for testability)
	getBaseUrl(): string {
		return "https://api.caret.team/v1"
	}

	getHeaders(): Record<string, string> {
		return {
			"HTTP-Referer": "https://caret.team",
			"X-Title": "Caret",
			"X-Task-ID": this.options.taskId || "",
		}
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		this.lastGenerationId = undefined

		// CARET MODIFICATION: 메시지 ?�성 로깅
		Logger.info("[CARET-PROVIDER] Creating message stream")
		Logger.debug(`[CARET-PROVIDER] System prompt length: ${systemPrompt.length}`)
		Logger.debug(`[CARET-PROVIDER] Message count: ${messages.length}`)

		const stream = await createOpenRouterStream(
			this.client,
			systemPrompt,
			messages,
			this.getModel(),
			this.options.reasoningEffort,
			this.options.thinkingBudgetTokens,
			this.options.openRouterProviderSorting,
		)

		let didOutputUsage: boolean = false

		for await (const chunk of stream) {
			// openrouter returns an error object instead of the openai sdk throwing an error
			if ("error" in chunk) {
				const error = chunk.error as OpenRouterErrorResponse["error"]

				// CARET MODIFICATION: ?�러 로깅
				Logger.error(`[CARET] Caret API Error: ${error?.code} - ${error?.message}`)

				// Include metadata in the error message if available
				const metadataStr = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata, null, 2)}` : ""
				throw new Error(`Caret API Error ${error.code}: ${error.message}${metadataStr}`)
			}

			if (!this.lastGenerationId && chunk.id) {
				this.lastGenerationId = chunk.id
				Logger.debug(`[CARET-PROVIDER] Generation ID: ${chunk.id}`)
			}

			const delta = chunk.choices[0]?.delta
			if (delta?.content) {
				yield {
					type: "text",
					text: delta.content,
				}
			}

			// Reasoning tokens are returned separately from the content
			if ("reasoning" in delta && delta.reasoning) {
				yield {
					type: "reasoning",
					// @ts-ignore-next-line
					reasoning: delta.reasoning,
				}
			}

			if (!didOutputUsage && chunk.usage) {
				// @ts-ignore-next-line
				let totalCost = chunk.usage.cost || 0
				const modelId = this.getModel().id
				const provider = modelId.split("/")[0]

				// If provider is x-ai, set totalCost to 0 (we're doing a promo)
				if (provider === "x-ai") {
					totalCost = 0
				}

				// CARET MODIFICATION: ?�용??로깅
				Logger.debug(
					`[CARET-PROVIDER] Token usage - Input: ${chunk.usage.prompt_tokens}, Output: ${chunk.usage.completion_tokens}, Cost: ${totalCost}`,
				)

				yield {
					type: "usage",
					cacheWriteTokens: 0,
					cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
					inputTokens: chunk.usage.prompt_tokens || 0,
					outputTokens: chunk.usage.completion_tokens || 0,
					// @ts-ignore-next-line
					totalCost,
				}
				didOutputUsage = true
			}
		}

		// Fallback to generation endpoint if usage chunk not returned
		if (!didOutputUsage) {
			const apiStreamUsage = await this.getApiStreamUsage()
			if (apiStreamUsage) {
				yield apiStreamUsage
			}
		}

		Logger.info("[CARET-PROVIDER] ??Message stream completed")
	}

	async getApiStreamUsage(): Promise<ApiStreamUsageChunk | undefined> {
		if (this.lastGenerationId) {
			try {
				// CARET MODIFICATION: Caret API ?�드?�인???�용
				Logger.debug(`[CARET-PROVIDER] Fetching usage data for generation: ${this.lastGenerationId}`)

				const response = await axios.get(`https://api.caret.team/v1/generation?id=${this.lastGenerationId}`, {
					headers: {
						Authorization: `Bearer ${this.options.caretApiKey}`,
					},
					timeout: 15_000, // this request hangs sometimes
				})

				const generation = response.data

				Logger.debug(
					`[CARET-PROVIDER] Usage data retrieved - Cached: ${generation?.native_tokens_cached}, Input: ${generation?.native_tokens_prompt}, Output: ${generation?.native_tokens_completion}`,
				)

				return {
					type: "usage",
					cacheWriteTokens: 0,
					cacheReadTokens: generation?.native_tokens_cached || 0,
					inputTokens: generation?.native_tokens_prompt || 0,
					outputTokens: generation?.native_tokens_completion || 0,
					totalCost: generation?.total_cost || 0,
				}
			} catch (error) {
				// CARET MODIFICATION: ?�러 로깅 개선
				Logger.error(`[CARET-PROVIDER] ??Error fetching Caret generation details: ${error}`)
			}
		}
		return undefined
	}

	getModel(): { id: string; info: ModelInfo } {
		let modelId = this.options.openRouterModelId
		if (modelId === "x-ai/grok-3") {
			modelId = "x-ai/grok-3-beta"
		}
		const modelInfo = this.options.openRouterModelInfo
		if (modelId && modelInfo) {
			return { id: modelId, info: modelInfo }
		}
		return { id: openRouterDefaultModelId, info: openRouterDefaultModelInfo }
	}
}

// CARET MODIFICATION: Export as ClineHandler for compatibility
export { CaretHandler as ClineHandler }
