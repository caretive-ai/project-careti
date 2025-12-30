// CARET MODIFICATION: Naver Cloud HyperCLOVA X provider implementation.
import type OpenAI from "openai"
import type { ChatCompletionTool as OpenAITool } from "openai/resources/chat/completions"
import {
	ModelInfo,
	naverCloudDefaultModelId,
	naverCloudModels,
	type NaverCloudModelId,
} from "@shared/api"
import { Logger } from "@/services/logging/Logger"
import { ClineStorageMessage } from "@/shared/messages/content"
import { fetch } from "@/shared/net"
import { ApiHandler, CommonApiHandlerOptions } from ".."
import { withRetry } from "../retry"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream, ApiStreamChunk } from "../transform/stream"
import { getOpenAIToolParams, ToolCallProcessor } from "../transform/tool-call-processor"

const NAVER_CLOUD_BASE_URL = "https://clovastudio.stream.ntruss.com"
const RATE_LIMIT_MESSAGE_PATTERN = /too many requests|rate exceeded|rate limit/i

interface NaverCloudHandlerOptions extends CommonApiHandlerOptions {
	naverCloudApiKey?: string
	naverCloudModelId?: string
	naverCloudModelInfo?: ModelInfo
	thinkingBudgetTokens?: number
	ulid?: string
}

type NaverCloudUsage = {
	promptTokens?: number
	completionTokens?: number
	totalTokens?: number
	completionTokensDetails?: {
		thinkingTokens?: number
	}
}

type NaverCloudStatus = {
	code?: string
	message?: string
}

type NaverCloudStreamEvent = {
	status?: NaverCloudStatus
	message?: {
		role?: string
		content?: string
		thinkingContent?: string
		tool_calls?: OpenAI.Chat.ChatCompletionChunk.Choice.Delta.ToolCall[]
	}
	usage?: NaverCloudUsage
}

const buildNaverCloudError = (message: string, options?: { status?: number; headers?: Headers; statusCode?: string }) => {
	const error = new Error(`Naver Cloud API error: ${message}`)
	const statusCode = options?.statusCode
	const status = options?.status ?? (statusCode?.startsWith("429") ? 429 : undefined)
	if (status) {
		;(error as { status?: number }).status = status
	}
	if (!status && RATE_LIMIT_MESSAGE_PATTERN.test(message)) {
		;(error as { status?: number }).status = 429
	}
	if (options?.headers) {
		const headerMap: Record<string, string> = {}
		options.headers.forEach((value, key) => {
			headerMap[key.toLowerCase()] = value
		})
		;(error as { headers?: Record<string, string> }).headers = headerMap
	}
	return error
}

export class NaverCloudHandler implements ApiHandler {
	private options: NaverCloudHandlerOptions

	constructor(options: NaverCloudHandlerOptions) {
		this.options = options
	}

	getModel(): { id: NaverCloudModelId; info: ModelInfo } {
		const naverCloudModelId = this.options.naverCloudModelId
		const naverCloudModelInfo = this.options.naverCloudModelInfo
		if (naverCloudModelId && naverCloudModelInfo) {
			return { id: naverCloudModelId as NaverCloudModelId, info: naverCloudModelInfo }
		}

		if (naverCloudModelId && naverCloudModelId in naverCloudModels) {
			const id = naverCloudModelId as NaverCloudModelId
			return { id, info: naverCloudModels[id] }
		}

		return {
			id: naverCloudDefaultModelId,
			info: naverCloudModels[naverCloudDefaultModelId],
		}
	}

	private mapThinkingEffort(budgetTokens?: number): "none" | "low" | "medium" | "high" {
		const budget = budgetTokens ?? 0
		if (budget <= 0) {
			return "none"
		}
		if (budget <= 5_120) {
			return "low"
		}
		if (budget <= 10_240) {
			return "medium"
		}
		return "high"
	}

	private async parseNonStreamingResponse(response: Response, didYieldContent: { value: boolean }): Promise<ApiStream> {
		const data = (await response.json()) as {
			status?: NaverCloudStatus
			result?: {
				message?: { content?: string; thinkingContent?: string }
				usage?: NaverCloudUsage
			}
		}
		if (data.status?.code && data.status.code !== "20000") {
			throw buildNaverCloudError(data.status.message || data.status.code, { statusCode: data.status.code })
		}
		const usage = data.result?.usage
		const message = data.result?.message
		const stream = (async function* (): AsyncGenerator<ApiStreamChunk> {
			if (message?.thinkingContent) {
				yield { type: "reasoning", reasoning: message.thinkingContent }
			}
			if (message?.content) {
				yield { type: "text", text: message.content }
				didYieldContent.value = true
			}
			if (usage) {
				yield {
					type: "usage",
					inputTokens: usage.promptTokens || 0,
					outputTokens: usage.completionTokens || 0,
					thoughtsTokenCount: usage.completionTokensDetails?.thinkingTokens,
				}
			}
		})()
		return stream as ApiStream
	}

	@withRetry({ maxRetries: 6, baseDelay: 5_000, maxDelay: 60_000 })
	async *createMessage(systemPrompt: string, messages: ClineStorageMessage[], tools?: OpenAITool[]): ApiStream {
		if (!this.options.naverCloudApiKey) {
			throw new Error("Naver Cloud API key is required")
		}

		const model = this.getModel()
		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToOpenAiMessages(messages),
		]

		const isThinkingModel = model.id === "HCX-007"
		const body: Record<string, any> = {
			messages: openAiMessages,
			temperature: 0,
			...getOpenAIToolParams(tools),
		}

		if (isThinkingModel) {
			body.maxCompletionTokens = model.info.maxTokens
			body.thinking = { effort: this.mapThinkingEffort(this.options.thinkingBudgetTokens) }
		} else {
			body.maxTokens = model.info.maxTokens
		}

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.options.naverCloudApiKey}`,
			"Content-Type": "application/json",
			Accept: "text/event-stream",
		}

		if (this.options.ulid) {
			headers["X-NCP-CLOVASTUDIO-REQUEST-ID"] = this.options.ulid
		}

		const response = await fetch(`${NAVER_CLOUD_BASE_URL}/v3/chat-completions/${model.id}`, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		})

		if (!response.ok) {
			const errorText = await response.text()
			let errorMessage = errorText || response.statusText
			let statusCode: string | undefined
			try {
				const parsedError = JSON.parse(errorText) as { status?: NaverCloudStatus }
				statusCode = parsedError.status?.code
				errorMessage = parsedError.status?.message || errorMessage
			} catch {
				// ignore json parse failures
			}
			throw buildNaverCloudError(errorMessage, {
				status: response.status,
				headers: response.headers,
				statusCode,
			})
		}

		if (!response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
			const didYieldContent = { value: false }
			const nonStreaming = await this.parseNonStreamingResponse(response, didYieldContent)
			for await (const chunk of nonStreaming) {
				if (!chunk) {
					continue
				}
				yield chunk
			}
			if (!didYieldContent.value) {
				throw new Error("Naver Cloud API error: empty response")
			}
			return
		}

		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ""
		let didYieldText = false
		let didYieldReasoning = false
		let didYieldToolCalls = false
		const toolCallProcessor = new ToolCallProcessor()

		const flushEvent = async function* (rawEvent: string): AsyncGenerator<ApiStreamChunk> {
			const lines = rawEvent.split("\n")
			let eventType = ""
			const dataLines: string[] = []
			for (const line of lines) {
				const trimmed = line.replace(/\r$/, "")
				if (trimmed.startsWith("event:")) {
					eventType = trimmed.slice("event:".length).trim()
				} else if (trimmed.startsWith("data:")) {
					dataLines.push(trimmed.slice("data:".length).trim())
				}
			}

			const dataString = dataLines.join("\n")
			if (!dataString || dataString === "[DONE]") {
				return
			}

			let parsed: NaverCloudStreamEvent
			try {
				parsed = JSON.parse(dataString)
			} catch {
				Logger.debug(
					`[NaverCloud] Failed to parse SSE data (event: ${eventType || "unknown"}, length: ${dataString.length})`,
				)
				return
			}

			if (parsed.status?.code && parsed.status.code !== "20000") {
				throw buildNaverCloudError(parsed.status.message || parsed.status.code, {
					statusCode: parsed.status.code,
				})
			}

			if (eventType === "token") {
				if (parsed.message?.thinkingContent) {
					didYieldReasoning = true
					yield { type: "reasoning", reasoning: parsed.message.thinkingContent }
				}
				if (parsed.message?.content) {
					didYieldText = true
					yield { type: "text", text: parsed.message.content }
				}
				const toolCalls = Array.isArray(parsed.message?.tool_calls) ? parsed.message?.tool_calls : undefined
				if (toolCalls) {
					didYieldToolCalls = true
					yield* toolCallProcessor.processToolCallDeltas(toolCalls)
				} else if (parsed.message?.tool_calls) {
					Logger.debug(
						`[NaverCloud] tool_calls payload was not an array (event: token, keys: ${Object.keys(parsed.message)})`,
					)
				}
				return
			}

			if (eventType === "result") {
				if (!didYieldReasoning && parsed.message?.thinkingContent) {
					yield { type: "reasoning", reasoning: parsed.message.thinkingContent }
				}
				if (!didYieldText && parsed.message?.content) {
					yield { type: "text", text: parsed.message.content }
				}
				if (parsed.usage) {
					yield {
						type: "usage",
						inputTokens: parsed.usage.promptTokens || 0,
						outputTokens: parsed.usage.completionTokens || 0,
						thoughtsTokenCount: parsed.usage.completionTokensDetails?.thinkingTokens,
					}
				}
				return
			}

			if (eventType) {
				Logger.debug(`[NaverCloud] Unhandled SSE event type: ${eventType}`)
			}
		}

		while (true) {
			const { done, value } = await reader.read()
			if (done) {
				break
			}
			buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n")

			let separatorIndex = buffer.indexOf("\n\n")
			while (separatorIndex !== -1) {
				const rawEvent = buffer.slice(0, separatorIndex)
				buffer = buffer.slice(separatorIndex + 2)
				if (rawEvent.trim().length > 0) {
					for await (const chunk of flushEvent(rawEvent)) {
						if (!chunk) {
							continue
						}
						yield chunk
					}
				}
				separatorIndex = buffer.indexOf("\n\n")
			}
		}

		if (buffer.trim().length > 0) {
			for await (const chunk of flushEvent(buffer)) {
				if (!chunk) {
					continue
				}
				yield chunk
			}
		}

		if (!didYieldText && !didYieldToolCalls) {
			throw new Error("Naver Cloud API error: empty response")
		}
	}
}
