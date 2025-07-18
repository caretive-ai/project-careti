// CARET MODIFICATION: Caret 전용 API Provider
// Cline Provider를 기반으로 Caret 서비스 연동을 위한 Provider 구현

import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import { ApiHandler } from "../../src/api"
import { ApiHandlerOptions, ModelInfo, openRouterDefaultModelId, openRouterDefaultModelInfo } from "../../src/shared/api"
import { createOpenRouterStream } from "../../src/api/transform/openrouter-stream"
import { ApiStream, ApiStreamUsageChunk } from "../../src/api/transform/stream"
import axios from "axios"
import { OpenRouterErrorResponse } from "../../src/api/providers/types"
import { withRetry } from "../../src/api/retry"
import { caretLogger } from "../utils/caret-logger"

export class CaretHandler implements ApiHandler {
	private options: ApiHandlerOptions
	private client: OpenAI
	lastGenerationId?: string

	constructor(options: ApiHandlerOptions) {
		this.options = options

		// CARET MODIFICATION: Caret 서비스 URL 사용
		this.client = new OpenAI({
			baseURL: "https://api.caret.team/v1",
			apiKey: this.options.caretApiKey || "",
			defaultHeaders: {
				"HTTP-Referer": "https://caret.team", // Caret 랭킹 및 통계
				"X-Title": "Caret", // Caret 서비스명
				"X-Task-ID": this.options.taskId || "",
			},
		})

		// CARET MODIFICATION: 초기화 로깅
		caretLogger.info("CaretHandler initialized", "PROVIDER")
		caretLogger.debug(`Task ID: ${this.options.taskId}`, "PROVIDER")
		caretLogger.debug(`API Key: ${this.options.caretApiKey ? "SET" : "NOT SET"}`, "PROVIDER")
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

		// CARET MODIFICATION: 메시지 생성 로깅
		caretLogger.info("Creating message stream", "PROVIDER")
		caretLogger.debug(`System prompt length: ${systemPrompt.length}`, "PROVIDER")
		caretLogger.debug(`Message count: ${messages.length}`, "PROVIDER")

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

				// CARET MODIFICATION: 에러 로깅
				caretLogger.error(`Caret API Error: ${error?.code} - ${error?.message}`, "PROVIDER")

				// Include metadata in the error message if available
				const metadataStr = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata, null, 2)}` : ""
				throw new Error(`Caret API Error ${error.code}: ${error.message}${metadataStr}`)
			}

			if (!this.lastGenerationId && chunk.id) {
				this.lastGenerationId = chunk.id
				caretLogger.debug(`Generation ID: ${chunk.id}`, "PROVIDER")
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

				// CARET MODIFICATION: 사용량 로깅
				caretLogger.debug(
					`Token usage - Input: ${chunk.usage.prompt_tokens}, Output: ${chunk.usage.completion_tokens}, Cost: ${totalCost}`,
					"PROVIDER",
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

		caretLogger.success("Message stream completed", "PROVIDER")
	}

	async getApiStreamUsage(): Promise<ApiStreamUsageChunk | undefined> {
		if (this.lastGenerationId) {
			try {
				// CARET MODIFICATION: Caret API 엔드포인트 사용
				caretLogger.debug(`Fetching usage data for generation: ${this.lastGenerationId}`, "PROVIDER")

				const response = await axios.get(`https://api.caret.team/v1/generation?id=${this.lastGenerationId}`, {
					headers: {
						Authorization: `Bearer ${this.options.caretApiKey}`,
					},
					timeout: 15_000, // this request hangs sometimes
				})

				const generation = response.data

				caretLogger.debug(
					`Usage data retrieved - Cached: ${generation?.native_tokens_cached}, Input: ${generation?.native_tokens_prompt}, Output: ${generation?.native_tokens_completion}`,
					"PROVIDER",
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
				// CARET MODIFICATION: 에러 로깅 개선
				caretLogger.error(`Error fetching Caret generation details: ${error}`, "PROVIDER")
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
