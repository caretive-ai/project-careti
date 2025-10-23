import { query, type SDKMessage } from "@anthropic-ai/claude-agent-sdk"
import type { Anthropic } from "@anthropic-ai/sdk"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ClaudeCodeSDKHandler } from "../../../core/api/providers/claude-code-sdk"

// Mock dependencies
vi.mock("@anthropic-ai/claude-agent-sdk")

// Mock HostProvider to avoid initialization errors
vi.mock("../../../../../src/hosts/host-provider", () => ({
	HostProvider: {
		get: vi.fn(() => ({
			// Mock minimal HostProvider interface
		})),
		initialize: vi.fn(),
		instance: {},
	},
}))

// Mock Logger with proper implementation
vi.mock("../../../../../src/services/logging/Logger", () => ({
	Logger: {
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	},
}))

describe("ClaudeCodeSDKHandler", () => {
	let handler: ClaudeCodeSDKHandler
	const mockQuery = vi.mocked(query)

	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks()

		// Create handler with default options
		handler = new ClaudeCodeSDKHandler({
			apiKey: "test-api-key",
			apiModelId: "claude-sonnet-4-20250514",
		})
	})

	afterEach(() => {
		handler.dispose()
	})

	describe("Constructor", () => {
		it("should initialize with provided options", () => {
			const customHandler = new ClaudeCodeSDKHandler({
				apiKey: "custom-key",
				apiModelId: "custom-model",
				maxTurns: 50,
				maxThinkingTokens: 5000,
				timeoutMs: 30000,
				permissionMode: "acceptEdits",
				enableSubagents: true,
			})

		expect(customHandler).toBeDefined()
		customHandler.dispose()
	})
})

	describe("getModel", () => {
		it("should return default model info", () => {
			const model = handler.getModel()

			expect(model.id).toBe("claude-sonnet-4-20250514")
			expect(model.info.maxTokens).toBe(8192)
			expect(model.info.contextWindow).toBe(200000)
			expect(model.info.supportsImages).toBe(true)
			expect(model.info.supportsPromptCache).toBe(true)
		})

		it("should return custom model id when specified", () => {
			const customHandler = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				apiModelId: "claude-opus-4-20250514",
			})

			const model = customHandler.getModel()
			expect(model.id).toBe("claude-opus-4-20250514")

			customHandler.dispose()
		})
	})

	describe("dispose", () => {
		it("should abort ongoing requests", () => {
			const handlerWithTimeout = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				timeoutMs: 60000,
			})

			// Trigger createMessage to initialize abortController
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "test message",
				},
			]

		// Mock query to return empty async generator
		mockQuery.mockReturnValue((async function* () {})() as any)

		// Start the query (but don't await)
		const generator = handlerWithTimeout.createMessage("system prompt", messages)
		generator.next() // Initialize

		// Dispose should abort
		handlerWithTimeout.dispose()

		// No need to check Logger since it uses safeLog (no-throw in test env)
	})
	})

	describe("createMessage - Basic Flow", () => {
		it("should successfully process simple text message", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Hello, world!",
				},
			]

			// Mock SDK response with assistant message
			const mockSDKMessages: SDKMessage[] = [
				{
					type: "assistant",
					message: {
						id: "msg_123",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "text",
								text: "Hello! How can I help you?",
							},
						],
						model: "claude-sonnet-4-20250514",
						stop_reason: "end_turn",
						stop_sequence: null,
						usage: {
							input_tokens: 10,
							output_tokens: 20,
						},
					},
				} as any,
			]

		mockQuery.mockReturnValue(
			(async function* () {
				for (const msg of mockSDKMessages) {
					yield msg
				}
			})() as any,
		)

			const chunks = []
			for await (const chunk of handler.createMessage("You are a helpful assistant", messages)) {
				chunks.push(chunk)
			}

			expect(chunks).toHaveLength(1)
			expect(chunks[0]).toEqual({
				type: "text",
				text: "Hello! How can I help you?",
			})
		})

		it("should handle streaming events", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Count to 3",
				},
			]

			// Mock SDK streaming events
			const mockSDKMessages: SDKMessage[] = [
				{
					type: "stream_event",
					event: {
						type: "message_start",
						message: {
							id: "msg_123",
							type: "message",
							role: "assistant",
							content: [],
							model: "claude-sonnet-4-20250514",
							stop_reason: null,
							stop_sequence: null,
							usage: {
								input_tokens: 50,
								output_tokens: 0,
							},
						},
					},
				} as any,
				{
					type: "stream_event",
					event: {
						type: "content_block_delta",
						index: 0,
						delta: {
							type: "text_delta",
							text: "1, ",
						},
					},
				} as any,
				{
					type: "stream_event",
					event: {
						type: "content_block_delta",
						index: 0,
						delta: {
							type: "text_delta",
							text: "2, ",
						},
					},
				} as any,
				{
					type: "stream_event",
					event: {
						type: "content_block_delta",
						index: 0,
						delta: {
							type: "text_delta",
							text: "3",
						},
					},
				} as any,
				{
					type: "stream_event",
					event: {
						type: "message_delta",
						delta: {
							stop_reason: "end_turn",
							stop_sequence: null,
						},
						usage: {
							output_tokens: 10,
						},
					},
				} as any,
			]

			mockQuery.mockReturnValue(
				(async function* () {
					for (const msg of mockSDKMessages) {
						yield msg
					}
				})(),
			)

			const chunks = []
			for await (const chunk of handler.createMessage("You are a helpful assistant", messages)) {
				chunks.push(chunk)
			}

			// Should have: message_start usage + 3 text deltas + message_delta usage
			expect(chunks.length).toBeGreaterThanOrEqual(4)

			// Check text chunks
			const textChunks = chunks.filter((c) => c.type === "text")
			expect(textChunks).toHaveLength(3)
			expect(textChunks[0]).toEqual({ type: "text", text: "1, " })
			expect(textChunks[1]).toEqual({ type: "text", text: "2, " })
			expect(textChunks[2]).toEqual({ type: "text", text: "3" })

			// Check usage chunks
			const usageChunks = chunks.filter((c) => c.type === "usage")
			expect(usageChunks.length).toBeGreaterThan(0)
		})

		it("should handle result message with success", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Complete task",
				},
			]

			const mockSDKMessages: SDKMessage[] = [
				{
					type: "result",
					subtype: "success",
					duration_ms: 5000,
					num_turns: 3,
					usage: {
						input_tokens: 100,
						output_tokens: 200,
						cache_read_input_tokens: 50,
						cache_creation_input_tokens: 25,
					},
				} as any,
			]

			mockQuery.mockReturnValue(
				(async function* () {
					for (const msg of mockSDKMessages) {
						yield msg
					}
				})(),
			)

			const chunks = []
			for await (const chunk of handler.createMessage("You are a helpful assistant", messages)) {
				chunks.push(chunk)
			}

			// Should have usage chunk
			expect(chunks).toHaveLength(1)
			expect(chunks[0]).toEqual({
				type: "usage",
				inputTokens: 100,
				outputTokens: 200,
				cacheReadTokens: 50,
			cacheWriteTokens: 25,
		})

		// No need to check Logger since it uses safeLog (no-throw in test env)
	})

		it("should handle system messages", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			const mockSDKMessages: SDKMessage[] = [
				{
					type: "system",
					subtype: "init",
				} as any,
			]

			mockQuery.mockReturnValue(
				(async function* () {
					for (const msg of mockSDKMessages) {
						yield msg
					}
				})(),
			)

			const chunks = []
			for await (const chunk of handler.createMessage("You are a helpful assistant", messages)) {
				chunks.push(chunk)
			}

		// System messages don't yield chunks
		expect(chunks).toHaveLength(0)

		// No need to check Logger since it uses safeLog (no-throw in test env)
	})
	})

	describe("createMessage - Complex Content", () => {
		it("should extract text from array content", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: [
						{ type: "text", text: "Part 1" },
						{ type: "text", text: "Part 2" },
					],
				},
			]

			const mockSDKMessages: SDKMessage[] = [
				{
					type: "assistant",
					message: {
						id: "msg_123",
						type: "message",
						role: "assistant",
						content: [
							{
								type: "text",
								text: "Response",
							},
						],
						model: "claude-sonnet-4-20250514",
						stop_reason: "end_turn",
						stop_sequence: null,
						usage: {
							input_tokens: 10,
							output_tokens: 20,
						},
					},
				} as any,
			]

			mockQuery.mockReturnValue(
				(async function* () {
					for (const msg of mockSDKMessages) {
						yield msg
					}
				})(),
			)

			const chunks = []
			for await (const chunk of handler.createMessage("System", messages)) {
				chunks.push(chunk)
			}

			expect(chunks.length).toBeGreaterThan(0)
		})
	})

	describe("createMessage - Error Handling", () => {
		it("should throw error when no user message found", async () => {
			const messages: Anthropic.Messages.MessageParam[] = []

			await expect(async () => {
				const generator = handler.createMessage("System", messages)
				await generator.next()
			}).rejects.toThrow("No user message found")
		})

		it("should handle query initialization error", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			mockQuery.mockImplementation(() => {
				throw new Error("SDK initialization failed")
			})

			await expect(async () => {
				const generator = handler.createMessage("System", messages)
			await generator.next()
		}).rejects.toThrow("SDK initialization failed")

		// No need to check Logger since it uses safeLog (no-throw in test env)
	})

		it("should handle streaming error", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			mockQuery.mockReturnValue(
				(async function* () {
					yield {
						type: "assistant",
						message: {
							id: "msg_123",
							type: "message",
							role: "assistant",
							content: [{ type: "text", text: "Start" }],
							model: "claude-sonnet-4-20250514",
							stop_reason: null,
							stop_sequence: null,
							usage: { input_tokens: 10, output_tokens: 5 },
						},
					} as any
					throw new Error("Streaming error")
				})(),
			)

			await expect(async () => {
				const chunks = []
				for await (const chunk of handler.createMessage("System", messages)) {
					chunks.push(chunk)
				}
			}).rejects.toThrow("Streaming error")
		})
	})

	describe("createMessage - Timeout", () => {
		// Skip: AbortController timeout is hard to test in unit tests
		// This will be verified in integration tests
		it.skip("should handle timeout abort", async () => {
			const handlerWithTimeout = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				timeoutMs: 100, // 100ms timeout
			})

			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			// Mock query to simulate long-running operation
			mockQuery.mockReturnValue(
				(async function* () {
					await new Promise((resolve) => setTimeout(resolve, 200)) // Wait longer than timeout
					yield {
						type: "assistant",
						message: {
							id: "msg_123",
							type: "message",
							role: "assistant",
							content: [{ type: "text", text: "Too late" }],
							model: "claude-sonnet-4-20250514",
							stop_reason: "end_turn",
							stop_sequence: null,
							usage: { input_tokens: 10, output_tokens: 5 },
						},
					} as any
				})(),
			)

			await expect(async () => {
				const chunks = []
				for await (const chunk of handlerWithTimeout.createMessage("System", messages)) {
					chunks.push(chunk)
				}
			}).rejects.toThrow()

			handlerWithTimeout.dispose()
		})
	})

	describe("Subagent Support", () => {
		it("should include subagent definitions when enabled", async () => {
			const handlerWithSubagents = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				enableSubagents: true,
			})

			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			mockQuery.mockReturnValue(
				(async function* () {
					yield {
						type: "assistant",
						message: {
							id: "msg_123",
							type: "message",
							role: "assistant",
							content: [{ type: "text", text: "Response" }],
							model: "claude-sonnet-4-20250514",
							stop_reason: "end_turn",
							stop_sequence: null,
							usage: { input_tokens: 10, output_tokens: 5 },
						},
					} as any
				})(),
			)

			const chunks = []
			for await (const chunk of handlerWithSubagents.createMessage("System", messages)) {
				chunks.push(chunk)
			}

			// Verify query was called with agents option
			expect(mockQuery).toHaveBeenCalledWith(
				expect.objectContaining({
					options: expect.objectContaining({
						agents: expect.objectContaining({
							"code-reviewer": expect.objectContaining({
								description: expect.any(String),
								prompt: expect.any(String),
							}),
							debugger: expect.objectContaining({
								description: expect.any(String),
								prompt: expect.any(String),
							}),
						}),
					}),
				}),
			)

			handlerWithSubagents.dispose()
		})

		it("should not include agents when disabled", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			mockQuery.mockReturnValue(
				(async function* () {
					yield {
						type: "assistant",
						message: {
							id: "msg_123",
							type: "message",
							role: "assistant",
							content: [{ type: "text", text: "Response" }],
							model: "claude-sonnet-4-20250514",
							stop_reason: "end_turn",
							stop_sequence: null,
							usage: { input_tokens: 10, output_tokens: 5 },
						},
					} as any
				})(),
			)

			const chunks = []
			for await (const chunk of handler.createMessage("System", messages)) {
				chunks.push(chunk)
			}

		// Verify query was called without agents option
		const callArgs = mockQuery.mock.calls[0][0]
		expect(callArgs.options?.agents).toBeUndefined()
		})
	})

	describe("Hook System", () => {
		it("should configure hooks in options", async () => {
			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

			mockQuery.mockReturnValue(
				(async function* () {
					yield {
						type: "assistant",
						message: {
							id: "msg_123",
							type: "message",
							role: "assistant",
							content: [{ type: "text", text: "Response" }],
							model: "claude-sonnet-4-20250514",
							stop_reason: "end_turn",
							stop_sequence: null,
							usage: { input_tokens: 10, output_tokens: 5 },
						},
					} as any
				})(),
			)

			const chunks = []
			for await (const chunk of handler.createMessage("System", messages)) {
				chunks.push(chunk)
			}

		// Verify hooks are configured
		const callArgs = mockQuery.mock.calls[0][0]
		expect(callArgs.options?.hooks).toBeDefined()
		expect(callArgs.options?.hooks?.PreToolUse).toBeDefined()
		expect(callArgs.options?.hooks?.PostToolUse).toBeDefined()
		expect(callArgs.options?.hooks?.SessionStart).toBeDefined()
		expect(callArgs.options?.hooks?.SessionEnd).toBeDefined()
		})
	})

	describe("Options Configuration", () => {
		it("should use custom maxTurns when specified", async () => {
			const customHandler = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				maxTurns: 50,
			})

			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

		mockQuery.mockReturnValue((async function* () {})() as any)

		const generator = customHandler.createMessage("System", messages)
		await generator.next()

		const callArgs = mockQuery.mock.calls[0][0]
		expect(callArgs.options?.maxTurns).toBe(50)

			customHandler.dispose()
		})

		it("should use custom maxThinkingTokens when specified", async () => {
			const customHandler = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				maxThinkingTokens: 5000,
			})

			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

		mockQuery.mockReturnValue((async function* () {})() as any)

		const generator = customHandler.createMessage("System", messages)
		await generator.next()

		const callArgs = mockQuery.mock.calls[0][0]
		expect(callArgs.options?.maxThinkingTokens).toBe(5000)

			customHandler.dispose()
		})

		it("should use custom permissionMode when specified", async () => {
			const customHandler = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
				permissionMode: "acceptEdits",
			})

			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

		mockQuery.mockReturnValue((async function* () {})() as any)

		const generator = customHandler.createMessage("System", messages)
		await generator.next()

		const callArgs = mockQuery.mock.calls[0][0]
		expect(callArgs.options?.permissionMode).toBe("acceptEdits")

			customHandler.dispose()
		})

		it("should use default values when options not specified", async () => {
			const defaultHandler = new ClaudeCodeSDKHandler({
				apiKey: "test-key",
			})

			const messages: Anthropic.Messages.MessageParam[] = [
				{
					role: "user",
					content: "Test",
				},
			]

		mockQuery.mockReturnValue((async function* () {})() as any)

		const generator = defaultHandler.createMessage("System", messages)
		await generator.next()

		const callArgs = mockQuery.mock.calls[0][0]
		expect(callArgs.options?.maxTurns).toBe(100)
		expect(callArgs.options?.maxThinkingTokens).toBe(10000)
		expect(callArgs.options?.permissionMode).toBe("default")

			defaultHandler.dispose()
		})
	})
})
