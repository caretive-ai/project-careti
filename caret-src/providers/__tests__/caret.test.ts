import { describe, it, expect, vi, beforeEach } from "vitest"
import { CaretHandler } from "../../../src/api/providers/caret"
import { ApiHandlerOptions } from "../../../src/shared/api"

// Mock dependencies
vi.mock("../../../src/services/logging/Logger", () => ({
	Logger: {
		info: vi.fn(),
		debug: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
	},
}))

// Mock OpenAI properly
vi.mock("openai", () => ({
	default: vi.fn().mockImplementation(() => ({
		chat: {
			completions: {
				create: vi.fn().mockImplementation(() => ({
					async *[Symbol.asyncIterator]() {
						yield { choices: [{ delta: { content: "test response" } }] }
					},
				})),
			},
		},
	})),
}))

vi.mock("axios")

describe("CaretHandler", () => {
	let handler: CaretHandler
	let mockOptions: ApiHandlerOptions

	beforeEach(() => {
		// Reset all mocks
		vi.clearAllMocks()

		// Mock API options
		mockOptions = {
			caretApiKey: "test-api-key",
			taskId: "test-task-id",
			openRouterModelId: "test-model",
			openRouterModelInfo: {
				maxTokens: 4096,
				contextWindow: 8192,
				supportsImages: true,
				supportsPromptCache: false,
				inputPrice: 0.001,
				outputPrice: 0.002,
			},
		}
	})

	describe("constructor", () => {
		it("should create CaretHandler instance with correct configuration", async () => {
			handler = new CaretHandler(mockOptions)

			expect(handler).toBeInstanceOf(CaretHandler)

			// Wait a bit for async logInit to complete
			await new Promise((resolve) => setTimeout(resolve, 10))

			const { Logger } = await import("../../../src/services/logging/Logger")
			expect(Logger.info).toHaveBeenCalledWith("[CARET-PROVIDER] CaretHandler initialized")
		})

		it("should set correct Caret service URL", () => {
			handler = new CaretHandler(mockOptions)

			expect(handler.getBaseUrl()).toBe("https://api.caret.team/v1")
		})

		it("should set correct headers for Caret service", () => {
			handler = new CaretHandler(mockOptions)

			const headers = handler.getHeaders()
			expect(headers["HTTP-Referer"]).toBe("https://caret.team")
			expect(headers["X-Title"]).toBe("Caret")
			expect(headers["X-Task-ID"]).toBe("test-task-id")
		})
	})

	describe("createMessage", () => {
		beforeEach(() => {
			handler = new CaretHandler(mockOptions)
		})

		it("should create message stream with proper logging", async () => {
			const systemPrompt = "Test system prompt"
			const messages: any[] = []

			// Clear previous mocks
			vi.clearAllMocks()

			// Create and start iteration to trigger logging
			const generator = handler.createMessage(systemPrompt, messages)

			// Start the generator (this will trigger the logging)
			const firstResult = await generator.next()

			// Wait a bit for async logging to complete
			await new Promise((resolve) => setTimeout(resolve, 10))

			const { Logger } = await import("../../../src/services/logging/Logger")
			expect(Logger.info).toHaveBeenCalledWith("[CARET-PROVIDER] Creating message stream")
		})
	})

	describe("getModel", () => {
		beforeEach(() => {
			handler = new CaretHandler(mockOptions)
		})

		it("should return configured model info", () => {
			const model = handler.getModel()

			expect(model.id).toBe("test-model")
			expect(model.info.maxTokens).toBe(4096)
			expect(model.info.contextWindow).toBe(8192)
		})

		it("should handle x-ai/grok-3 model replacement", () => {
			const grokOptions = {
				...mockOptions,
				openRouterModelId: "x-ai/grok-3",
			}

			handler = new CaretHandler(grokOptions)
			const model = handler.getModel()

			expect(model.id).toBe("x-ai/grok-3-beta")
		})
	})
})
