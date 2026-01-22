// CARETI MODIFICATION: Upstage Solar provider implementation.
import type OpenAI from "openai"
import type { ChatCompletionTool as OpenAITool } from "openai/resources/chat/completions"
import {
	ModelInfo,
	upstageDefaultModelId,
	upstageModels,
	type UpstageModelId,
} from "@shared/api"
import { ClineStorageMessage } from "@/shared/messages/content"
import { fetch } from "@/shared/net"
import { ApiHandler, CommonApiHandlerOptions } from ".."
import { withRetry } from "../retry"
import { convertToOpenAiMessages } from "../transform/openai-format"
import { ApiStream } from "../transform/stream"
import { getOpenAIToolParams, ToolCallProcessor } from "../transform/tool-call-processor"

const UPSTAGE_BASE_URL = "https://api.upstage.ai/v1"

interface UpstageHandlerOptions extends CommonApiHandlerOptions {
	upstageApiKey?: string
	upstageModelId?: string
	upstageModelInfo?: ModelInfo
}

export class UpstageHandler implements ApiHandler {
	private options: UpstageHandlerOptions

	constructor(options: UpstageHandlerOptions) {
		this.options = options
	}

	getModel(): { id: UpstageModelId; info: ModelInfo } {
		const upstageModelId = this.options.upstageModelId
		const upstageModelInfo = this.options.upstageModelInfo
		if (upstageModelId && upstageModelInfo) {
			return { id: upstageModelId as UpstageModelId, info: upstageModelInfo }
		}

		if (upstageModelId && upstageModelId in upstageModels) {
			const id = upstageModelId as UpstageModelId
			return { id, info: upstageModels[id] }
		}

		return {
			id: upstageDefaultModelId,
			info: upstageModels[upstageDefaultModelId],
		}
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: ClineStorageMessage[], tools?: OpenAITool[]): ApiStream {
		if (!this.options.upstageApiKey) {
			throw new Error("Upstage API key is required")
		}

		const model = this.getModel()
		const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
			{ role: "system", content: systemPrompt },
			...convertToOpenAiMessages(messages),
		]

		const body: Record<string, any> = {
			model: model.id,
			messages: openAiMessages,
			max_tokens: model.info.maxTokens,
			stream: true,
			...getOpenAIToolParams(tools),
		}

		const response = await fetch(`${UPSTAGE_BASE_URL}/chat/completions`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.options.upstageApiKey}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		})

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Upstage API error: ${response.status} ${errorText}`)
		}

		if (!response.body) {
			throw new Error("Upstage API error: empty response body")
		}

		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ""
		const toolCallProcessor = new ToolCallProcessor()

		while (true) {
			const { done, value } = await reader.read()
			if (done) {
				break
			}

			buffer += decoder.decode(value, { stream: true })
			const lines = buffer.split("\n")
			buffer = lines.pop() || ""

			for (const line of lines) {
				const trimmed = line.trim()
				if (!trimmed || !trimmed.startsWith("data: ")) {
					continue
				}

				const data = trimmed.slice(6)
				if (data === "[DONE]") {
					continue
				}

				try {
					const json = JSON.parse(data)
					const delta = json.choices?.[0]?.delta

					if (delta?.content) {
						yield {
							type: "text",
							text: delta.content,
						}
					}

					if (delta?.tool_calls) {
						yield* toolCallProcessor.processToolCallDeltas(delta.tool_calls)
					}

					// Handle usage in the final chunk
					if (json.usage) {
						yield {
							type: "usage",
							inputTokens: json.usage.prompt_tokens || 0,
							outputTokens: json.usage.completion_tokens || 0,
						}
					}

					// Handle finish reason
					const finishReason = json.choices?.[0]?.finish_reason
					if (finishReason) {
						yield {
							type: "finish",
							reason: finishReason,
						}
					}
				} catch {
					// Ignore JSON parse errors for incomplete chunks
				}
			}
		}

		// Process any remaining buffer
		if (buffer.trim() && buffer.trim().startsWith("data: ")) {
			const data = buffer.trim().slice(6)
			if (data !== "[DONE]") {
				try {
					const json = JSON.parse(data)
					if (json.usage) {
						yield {
							type: "usage",
							inputTokens: json.usage.prompt_tokens || 0,
							outputTokens: json.usage.completion_tokens || 0,
						}
					}
				} catch {
					// Ignore
				}
			}
		}
	}
}
