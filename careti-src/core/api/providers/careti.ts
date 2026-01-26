import { CaretEnv } from "@careti/config"
import { CaretiAuthService } from "@careti/services/auth/CaretiAuthService"
import { ApiHandler, CommonApiHandlerOptions } from "@core/api"
import { OpenRouterErrorResponse } from "@core/api/providers/types"
import { withRetry } from "@core/api/retry"
import { createOpenRouterStream } from "@core/api/transform/openrouter-stream"
import { ApiStream } from "@core/api/transform/stream"
import { ToolCallProcessor } from "@core/api/transform/tool-call-processor"
import { caretDefaultModelId, caretDefaultModelInfo, ModelInfo } from "@shared/api"
import { shouldSkipReasoningForModel } from "@utils/model-utils"
import OpenAI from "openai"
import type { ChatCompletionTool as OpenAITool } from "openai/resources/chat/completions"
import { buildClineExtraHeaders } from "@/services/EnvUtils"
import { Logger } from "@/services/logging/Logger"
import { CLINE_ACCOUNT_AUTH_ERROR_MESSAGE } from "@/shared/ClineAccount"
import { ClineStorageMessage } from "@/shared/messages/content"
import { fetch } from "@/shared/net"

interface CaretHandlerOptions extends CommonApiHandlerOptions {
	ulid?: string
	taskId?: string
	reasoningEffort?: string
	thinkingBudgetTokens?: number
	caretProviderSorting?: string
	caretModelId?: string
	caretModelInfo?: ModelInfo
	caretAccountId?: string
	geminiThinkingLevel?: string
}

export class CaretHandler implements ApiHandler {
	private options: CaretHandlerOptions
	private _authService: CaretiAuthService
	private client: OpenAI | undefined
	private readonly _baseUrl = CaretEnv.config().apiBaseUrl
	lastGenerationId?: string
	private lastRequestId?: string

	constructor(options: CaretHandlerOptions) {
		this.options = options
		this._authService = CaretiAuthService.getInstance()
	}

	private async ensureClient(): Promise<OpenAI> {
		const caretAccountAuthToken = await this._authService.getAuthToken()
		console.log("caretAccountAuthToken====>", caretAccountAuthToken)
		if (!caretAccountAuthToken) {
			throw new Error(CLINE_ACCOUNT_AUTH_ERROR_MESSAGE)
		}
		if (!this.client) {
			try {
				const defaultHeaders: Record<string, string> = {
					"HTTP-Referer": "https://careti.ai",
					"X-Title": "Careti",
					"X-AnyLLM-Key": "Bearer " + caretAccountAuthToken,
					"X-Task-ID": this.options.ulid || "",
				}
				Object.assign(defaultHeaders, await buildClineExtraHeaders())

				this.client = new OpenAI({
					baseURL: `${this._baseUrl}/v1`,
					apiKey: caretAccountAuthToken,
					defaultHeaders,
					// Capture real HTTP request ID from initial streaming response headers
					fetch: async (...args: Parameters<typeof fetch>): Promise<Awaited<ReturnType<typeof fetch>>> => {
						const [input, init] = args
						const resp = await fetch(input, init)
						try {
							let urlStr = ""
							if (typeof input === "string") {
								urlStr = input
							} else if (input instanceof URL) {
								urlStr = input.toString()
							} else if (typeof (input as { url?: unknown }).url === "string") {
								urlStr = (input as { url: string }).url
							}
							// Only record for chat completions (the primary streaming request)
							if (urlStr.includes("/chat/completions")) {
								const rid = resp.headers.get("x-request-id") || resp.headers.get("request-id")
								if (rid) {
									this.lastRequestId = rid
								}
							}
						} catch {
							// ignore header capture errors
						}
						return resp
					},
				})
			} catch (error: any) {
				throw new Error(`Error creating Careti client: ${error.message}`)
			}
		}
		// Ensure the client is always using the latest auth token
		this.client.apiKey = caretAccountAuthToken
		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: ClineStorageMessage[], tools?: OpenAITool[]): ApiStream {
		try {
			const client = await this.ensureClient()

			this.lastGenerationId = undefined
			this.lastRequestId = undefined

			const stream = await createOpenRouterStream(
				client,
				systemPrompt,
				messages,
				this.getModel(),
				this.options.reasoningEffort,
				this.options.thinkingBudgetTokens,
				this.options.caretProviderSorting,
				tools,
			)

			const toolCallProcessor = new ToolCallProcessor()

			for await (const chunk of stream) {
				Logger.debug("ClineHandler chunk:" + JSON.stringify(chunk))
				// openrouter returns an error object instead of the openai sdk throwing an error
				if ("error" in chunk) {
					const error = chunk.error as OpenRouterErrorResponse["error"]
					console.error(`Careti API Error: ${error?.code} - ${error?.message}`)
					// Include metadata in the error message if available
					const metadataStr = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata, null, 2)}` : ""
					throw new Error(`Careti API Error ${error.code}: ${error.message}${metadataStr}`)
				}

				if (!this.lastGenerationId && chunk.id) {
					this.lastGenerationId = chunk.id
				}

				// Check for mid-stream error via finish_reason
				const choice = chunk.choices?.[0]
				// OpenRouter may return finish_reason = "error" with error details
				if ((choice?.finish_reason as string) === "error") {
					const choiceWithError = choice as any
					if (choiceWithError.error) {
						const error = choiceWithError.error
						console.error(`Careti Mid-Stream Error: ${error.code || error.type || "Unknown"} - ${error.message}`)
						throw new Error(`Careti Mid-Stream Error: ${error.code || error.type || "Unknown"} - ${error.message}`)
					} else {
						throw new Error(
							"Careti Mid-Stream Error: Stream terminated with error status but no error details provided",
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

				if (delta?.tool_calls) {
					yield* toolCallProcessor.processToolCallDeltas(delta.tool_calls)
				}

				// Reasoning tokens are returned separately from the content
				// Skip reasoning content for Grok 4 models since it only displays "thinking" without providing useful information
				if ("reasoning" in delta && delta.reasoning && !shouldSkipReasoningForModel(this.options.caretModelId)) {
					yield {
						type: "reasoning",
						reasoning: typeof delta.reasoning === "string" ? delta.reasoning : JSON.stringify(delta.reasoning),
					}
				}

				/* 
				OpenRouter passes reasoning details that we can pass back unmodified in api requests to preserve reasoning traces for model
				  - The reasoning_details array in each chunk may contain one or more reasoning objects
				  - For encrypted reasoning, the content may appear as [REDACTED] in streaming responses
				  - The complete reasoning sequence is built by concatenating all chunks in order
				See: https://openrouter.ai/docs/use-cases/reasoning-tokens#preserving-reasoning-blocks
				*/
				if (
					"reasoning_details" in delta &&
					delta.reasoning_details &&
					// @ts-expect-error-next-line
					delta.reasoning_details.length && // exists and non-0
					!shouldSkipReasoningForModel(this.options.caretModelId)
				) {
					yield {
						type: "reasoning",
						reasoning: "",
						details: delta.reasoning_details,
					}
				}

				if (chunk.usage) {
					// @ts-expect-error-next-line
					const totalCost = (chunk.usage.cost || 0) + (chunk.usage.cost_details?.upstream_inference_cost || 0)

					yield {
						type: "usage",
						cacheWriteTokens: 0,
						cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
						inputTokens: (chunk.usage.prompt_tokens || 0) - (chunk.usage.prompt_tokens_details?.cached_tokens || 0),
						outputTokens: chunk.usage.completion_tokens || 0,
						totalCost,
					}
				}
			}
		} catch (error) {
			console.error("Careti API Error:", error)
			throw error
		}
	}

	// Expose the last HTTP request ID captured from response headers (X-Request-ID)
	getLastRequestId(): string | undefined {
		return this.lastRequestId
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.caretModelId
		const modelInfo = this.options.caretModelInfo
		if (modelId && modelInfo) {
			return { id: modelId, info: modelInfo }
		}
		return { id: caretDefaultModelId, info: caretDefaultModelInfo }
	}
}
