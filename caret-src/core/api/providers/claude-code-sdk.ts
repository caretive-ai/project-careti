import { type AgentDefinition, type Options, type Query, query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk"
import type { Anthropic } from "@anthropic-ai/sdk"
import type { ApiHandler, CommonApiHandlerOptions } from "../../../../src/core/api"
import type { ApiStream, ApiStreamChunk } from "../../../../src/core/api/transform/stream"
import { Logger } from "../../../../src/services/logging/Logger"

interface ClaudeCodeSDKHandlerOptions extends CommonApiHandlerOptions {
	apiKey?: string
	anthropicBaseUrl?: string
	apiModelId?: string
	maxTurns?: number
	maxThinkingTokens?: number
	timeoutMs?: number
	permissionMode?: "default" | "acceptEdits" | "bypassPermissions" | "plan"
	enableSubagents?: boolean
}

/**
 * ClaudeCodeSDKHandler - SDK-based implementation replacing CLI
 *
 * Benefits over CLI:
 * - No 10-minute timeout limit (configurable via AbortController)
 * - No 20MB buffer size limit
 * - No 32000 output token limit
 * - Built-in hook system for monitoring
 * - Native subagent support
 * - Better streaming performance
 *
 * Location: caret-src/ (Level 1 - Complete independence from Cline)
 */
export class ClaudeCodeSDKHandler implements ApiHandler {
	private options: ClaudeCodeSDKHandlerOptions
	private abortController?: AbortController

	constructor(options: ClaudeCodeSDKHandlerOptions) {
		this.options = options
		Logger.debug(`[ClaudeCodeSDKHandler] 🚀 Initialized with SDK v0.1.25`)
	}

	/**
	 * Build Options for SDK query() function
	 */
	private buildOptions(systemPrompt: string): Options {
		// Create AbortController for timeout control
		this.abortController = new AbortController()

		// Set timeout if specified (replaces hard-coded 10-minute CLI limit)
		if (this.options.timeoutMs) {
			setTimeout(() => {
				Logger.warn(`[ClaudeCodeSDKHandler] ⏱️ Timeout after ${this.options.timeoutMs}ms`)
				this.abortController?.abort()
			}, this.options.timeoutMs)
		}

		const options: Options = {
			// Model configuration
			model: this.options.apiModelId || "claude-sonnet-4-20250514",

			// System prompt
			systemPrompt,

			// Configurable limits (vs CLI hard-coded limits)
			maxTurns: this.options.maxTurns || 100,
			maxThinkingTokens: this.options.maxThinkingTokens || 10000,

			// Timeout control
			abortController: this.abortController,

			// Permission mode
			permissionMode: this.options.permissionMode || "default",

			// Hook system for monitoring
			hooks: {
				PreToolUse: [
					{
						hooks: [
							async (input) => {
								if (input.hook_event_name === "PreToolUse") {
									Logger.debug(`[ClaudeCodeSDKHandler] 🔧 Pre-tool: ${input.tool_name}`)
								}
								return {}
							},
						],
					},
				],
				PostToolUse: [
					{
						hooks: [
							async (input) => {
								if (input.hook_event_name === "PostToolUse") {
									Logger.debug(`[ClaudeCodeSDKHandler] ✅ Post-tool: ${input.tool_name}`)
								}
								return {}
							},
						],
					},
				],
				SessionStart: [
					{
						hooks: [
							async () => {
								Logger.info(`[ClaudeCodeSDKHandler] 🚀 Session started`)
								return {}
							},
						],
					},
				],
				SessionEnd: [
					{
						hooks: [
							async () => {
								Logger.info(`[ClaudeCodeSDKHandler] 🏁 Session ended`)
								return {}
							},
						],
					},
				],
			},
		}

		// Subagent support (if enabled)
		if (this.options.enableSubagents) {
			options.agents = this.buildSubagentDefinitions()
		}

		return options
	}

	/**
	 * Build subagent definitions for multi-agent workflow
	 */
	private buildSubagentDefinitions(): Record<string, AgentDefinition> {
		return {
			"code-reviewer": {
				description: "Reviews code for quality and best practices",
				prompt: "You are a code reviewer. Analyze code for quality, bugs, and improvements.",
			},
			debugger: {
				description: "Debugs code and finds issues",
				prompt: "You are a debugging expert. Find and fix issues in code.",
			},
		}
	}

	/**
	 * Convert Anthropic messages to SDK prompt format
	 */
	private buildPrompt(messages: Anthropic.Messages.MessageParam[]): string {
		// SDK expects simple string prompt
		const lastUserMessage = messages.filter((m) => m.role === "user").pop()

		if (!lastUserMessage) {
			throw new Error("No user message found")
		}

		if (typeof lastUserMessage.content === "string") {
			return lastUserMessage.content
		}

		return lastUserMessage.content
			.filter((c) => c.type === "text")
			.map((c) => (c as any).text)
			.join("\n")
	}

	/**
	 * Adapt SDK message to ApiStream format
	 * Note: SDK uses different message types than expected
	 */
	private *adaptMessage(sdkMessage: SDKMessage): Generator<ApiStreamChunk> {
		switch (sdkMessage.type) {
			case "assistant": {
				// SDKAssistantMessage has 'message' not 'content'
				const message = sdkMessage.message
				if (message.content) {
					for (const block of message.content) {
						if (block.type === "text") {
							yield {
								type: "text",
								text: block.text,
							}
						}
					}
				}
				break
			}

			case "stream_event": {
				// SDKPartialAssistantMessage - streaming events
				const event = sdkMessage.event
				switch (event.type) {
					case "content_block_delta":
						if (event.delta.type === "text_delta") {
							yield {
								type: "text",
								text: event.delta.text,
							}
						}
						break
				case "message_start":
					if (event.message.usage) {
						yield {
							type: "usage",
							inputTokens: event.message.usage.input_tokens || 0,
							outputTokens: event.message.usage.output_tokens || 0,
							cacheReadTokens: event.message.usage.cache_read_input_tokens ?? undefined,
							cacheWriteTokens: event.message.usage.cache_creation_input_tokens ?? undefined,
						}
					}
					break
					case "message_delta":
						if (event.usage) {
							yield {
								type: "usage",
								inputTokens: 0,
								outputTokens: event.usage.output_tokens || 0,
							}
						}
						break
				}
				break
			}

		case "result": {
			// Task completion
			if (sdkMessage.subtype === "success") {
				Logger.info(
					`[ClaudeCodeSDKHandler] ✅ Task completed in ${sdkMessage.duration_ms}ms - ${sdkMessage.num_turns} turns`,
				)
				if (sdkMessage.usage) {
					yield {
						type: "usage",
						inputTokens: sdkMessage.usage.input_tokens || 0,
						outputTokens: sdkMessage.usage.output_tokens || 0,
						cacheReadTokens: sdkMessage.usage.cache_read_input_tokens ?? undefined,
						cacheWriteTokens: sdkMessage.usage.cache_creation_input_tokens ?? undefined,
					}
				}
			}
			break
		}

			case "system": {
				// System messages (init, compact_boundary, hook_response)
				Logger.debug(`[ClaudeCodeSDKHandler] 📋 System: ${sdkMessage.subtype}`)
				break
			}
		}
	}

	/**
	 * Create message using SDK query() function
	 * Note: No retry decorator - handle errors at caller level
	 */
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		Logger.info(`[ClaudeCodeSDKHandler] 🚀 Starting SDK query`)

		const prompt = this.buildPrompt(messages)
		const options = this.buildOptions(systemPrompt)

		let queryInstance: Query
		try {
			queryInstance = query({
				prompt,
				options,
			})
		} catch (error) {
			Logger.error(`[ClaudeCodeSDKHandler] ❌ Failed to initialize query`, error)
			throw error
		}

		try {
			for await (const sdkMessage of queryInstance) {
				yield* this.adaptMessage(sdkMessage)
			}

			Logger.info(`[ClaudeCodeSDKHandler] ✅ Query completed`)
		} catch (error) {
			if (this.abortController?.signal.aborted) {
				Logger.error(`[ClaudeCodeSDKHandler] ⏱️ Query aborted due to timeout`)
				throw new Error("Query timed out")
			}

			Logger.error(`[ClaudeCodeSDKHandler] ❌ Query failed`, error)
			throw error
		}
	}

	/**
	 * Get model information
	 */
	getModel() {
		return {
			id: this.options.apiModelId || "claude-sonnet-4-20250514",
			info: {
				maxTokens: 8192,
				contextWindow: 200000,
				supportsImages: true,
				supportsPromptCache: true,
				inputPrice: 0.003,
				outputPrice: 0.015,
			},
		}
	}

	/**
	 * Cleanup resources
	 */
	dispose() {
		if (this.abortController) {
			this.abortController.abort()
			this.abortController = undefined
		}
		Logger.debug(`[ClaudeCodeSDKHandler] 🧹 Disposed`)
	}
}
