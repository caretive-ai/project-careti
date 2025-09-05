import { Anthropic } from "@anthropic-ai/sdk"
import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { ApiHandler, CommonApiHandlerOptions } from "@core/api"
import { OpenRouterErrorResponse } from "@core/api/providers/types"
import { withRetry } from "@core/api/retry"
import { createOpenRouterStream } from "@core/api/transform/openrouter-stream"
import { ApiStream, ApiStreamUsageChunk } from "@core/api/transform/stream"
import { ModelInfo, openRouterDefaultModelId, openRouterDefaultModelInfo } from "@shared/api"
import { shouldSkipReasoningForModel } from "@utils/model-utils"
import axios from "axios"
import OpenAI from "openai"
import { version as extensionVersion } from "../../../package.json"

interface CaretApiHandlerOptions extends CommonApiHandlerOptions {
	ulid?: string
	taskId?: string
	reasoningEffort?: string
	thinkingBudgetTokens?: number
	openRouterProviderSorting?: string
	openRouterModelId?: string
	openRouterModelInfo?: ModelInfo
	caretApiKey?: string
	onRetryAttempt?: any // Add this to match CommonApiHandlerOptions pattern
}

export class CaretApiProvider implements ApiHandler {
	private options: CaretApiHandlerOptions
	private globalManager = CaretGlobalManager.get()
	private client: OpenAI | undefined
	private readonly _baseUrl = "https://api.caret.team"
	lastGenerationId?: string

	constructor(options: CaretApiHandlerOptions) {
		this.options = options
	}

	private async ensureClient(): Promise<OpenAI> {
		// Auth0 토큰 또는 API 키 사용
		const authToken = this.globalManager.getAuthToken?.() || this.options.caretApiKey

		if (!authToken) {
			throw new Error("Caret API authentication required. Please login or provide API key.")
		}

		if (!this.client) {
			try {
				this.client = new OpenAI({
					baseURL: `${this._baseUrl}/api/v1`,
					apiKey: authToken,
					defaultHeaders: {
						"HTTP-Referer": "https://caret.team",
						"X-Title": "Caret",
						"X-Task-ID": this.options.ulid || "",
						"X-Caret-Version": extensionVersion,
					},
				})
			} catch (error: any) {
				throw new Error(`Error creating Caret API client: ${error.message}`)
			}
		}

		// 토큰 갱신 확인
		const currentToken = this.globalManager.getAuthToken?.() || this.options.caretApiKey
		if (currentToken && currentToken !== this.client.apiKey) {
			this.client.apiKey = currentToken
		}

		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		try {
			const client = await this.ensureClient()
			this.lastGenerationId = undefined

			let didOutputUsage: boolean = false

			const stream = await createOpenRouterStream(
				client,
				systemPrompt,
				messages,
				this.getModel(),
				this.options.reasoningEffort,
				this.options.thinkingBudgetTokens,
				this.options.openRouterProviderSorting,
			)

			for await (const chunk of stream) {
				// OpenRouter 에러 처리
				if ("error" in chunk) {
					const error = chunk.error as OpenRouterErrorResponse["error"]
					console.error(`Caret API Error: ${error?.code} - ${error?.message}`)
					const metadataStr = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata, null, 2)}` : ""
					throw new Error(`Caret API Error ${error.code}: ${error.message}${metadataStr}`)
				}

				if (!this.lastGenerationId && chunk.id) {
					this.lastGenerationId = chunk.id
				}

				// Mid-stream 에러 체크
				const choice = chunk.choices?.[0]
				if ((choice?.finish_reason as string) === "error") {
					const choiceWithError = choice as any
					if (choiceWithError.error) {
						const error = choiceWithError.error
						console.error(`Caret Mid-Stream Error: ${error.code || error.type || "Unknown"} - ${error.message}`)
						throw new Error(`Caret Mid-Stream Error: ${error.code || error.type || "Unknown"} - ${error.message}`)
					} else {
						throw new Error(
							"Caret Mid-Stream Error: Stream terminated with error status but no error details provided",
						)
					}
				}

				const delta = choice?.delta
				if (delta?.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}

				// Reasoning tokens 처리
				if ("reasoning" in delta && delta.reasoning && !shouldSkipReasoningForModel(this.options.openRouterModelId)) {
					yield {
						type: "reasoning",
						// @ts-expect-error-next-line
						reasoning: delta.reasoning,
					}
				}

				// Usage 정보 처리
				if (!didOutputUsage && chunk.usage) {
					// @ts-expect-error-next-line
					const totalCost = (chunk.usage.cost || 0) + (chunk.usage.cost_details?.upstream_inference_cost || 0)

					// Caret API 서버를 통한 호출만 처리
					// 비용은 Caret 서버에서 계산된 값을 그대로 사용

					yield {
						type: "usage",
						cacheWriteTokens: 0,
						cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
						inputTokens: (chunk.usage.prompt_tokens || 0) - (chunk.usage.prompt_tokens_details?.cached_tokens || 0),
						outputTokens: chunk.usage.completion_tokens || 0,
						totalCost: totalCost,
					}
					didOutputUsage = true
				}
			}

			// Usage fallback
			if (!didOutputUsage) {
				console.warn("Caret API did not return usage chunk, fetching from generation endpoint")
				const apiStreamUsage = await this.getApiStreamUsage()
				if (apiStreamUsage) {
					yield apiStreamUsage
				}
			}
		} catch (error) {
			console.error("Caret API Error:", error)
			throw error
		}
	}

	async getApiStreamUsage(): Promise<ApiStreamUsageChunk | undefined> {
		if (this.lastGenerationId) {
			try {
				const authToken = this.globalManager.getAuthToken?.() || this.options.caretApiKey
				if (!authToken) {
					throw new Error("Caret API authentication required for usage data")
				}

				const response = await axios.get(`${this._baseUrl}/generation?id=${this.lastGenerationId}`, {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
					timeout: 15_000,
				})

				const generation = response.data
				return {
					type: "usage",
					cacheWriteTokens: 0,
					cacheReadTokens: generation?.native_tokens_cached || 0,
					inputTokens: (generation?.native_tokens_prompt || 0) - (generation?.native_tokens_cached || 0),
					outputTokens: generation?.native_tokens_completion || 0,
					totalCost: generation?.total_cost || 0,
				}
			} catch (error) {
				console.error("Error fetching Caret generation details:", error)
			}
		}
		return undefined
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.openRouterModelId
		const modelInfo = this.options.openRouterModelInfo
		if (modelId && modelInfo) {
			return { id: modelId, info: modelInfo }
		}
		return { id: openRouterDefaultModelId, info: openRouterDefaultModelInfo }
	}

	// Cline Provider 100% 호환을 위한 추가 메소드들
	getModelId(): string {
		return this.getModel().id
	}

	getModelInfo(): ModelInfo {
		return this.getModel().info
	}

	getDefaultModelId(): string {
		return openRouterDefaultModelId
	}
}
