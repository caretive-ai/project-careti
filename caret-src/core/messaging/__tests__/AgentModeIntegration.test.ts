import { describe, it, expect, beforeEach, vi } from "vitest"

/**
 * Integration Test for Complete Agent Mode Message Flow
 *
 * Tests the full integration:
 * 1. useMessageHandlers.ts uses MessageHandlerFactory
 * 2. CaretMessageHandler provides optimistic updates
 * 3. User messages appear in UI immediately
 * 4. Backend receives correct messages
 */
describe("Agent Mode Integration Test", () => {
	let mockVscode: any
	let mockTaskServiceClient: any

	beforeEach(() => {
		// Mock localStorage for Caret system
		global.localStorage = {
			getItem: vi.fn().mockReturnValue("caret"),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		}

		// Mock VSCode API
		mockVscode = {
			getState: vi.fn().mockReturnValue({
				clineMessages: [],
			}),
			setState: vi.fn(),
		}

		// Mock TaskServiceClient
		mockTaskServiceClient = {
			newTask: vi.fn().mockResolvedValue({}),
			askResponse: vi.fn().mockResolvedValue({}),
		}

		// Make globals available
		;(global as any).vscode = mockVscode
		;(global as any).TaskServiceClient = mockTaskServiceClient
	})

	describe("complete agent mode message flow", () => {
		it("should handle new conversation with optimistic update", async () => {
			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const handler = MessageHandlerFactory.create("caret")

			// Send first message (new conversation)
			await handler.handleSendMessage("Start new agent task", [], [], mockTaskServiceClient, undefined, 0)

			// Should add optimistic message to UI
			expect(mockVscode.setState).toHaveBeenCalledWith(
				expect.objectContaining({
					clineMessages: expect.arrayContaining([
						expect.objectContaining({
							type: "say",
							say: "user_feedback",
							text: "Start new agent task",
						}),
					]),
				}),
			)

			// Should create new task
			expect(mockTaskServiceClient.newTask).toHaveBeenCalledWith(
				expect.objectContaining({
					text: "Start new agent task",
					images: [],
					files: [],
				}),
			)
		})

		it("should handle ongoing conversation with free messaging", async () => {
			// Mock existing conversation
			mockVscode.getState.mockReturnValue({
				clineMessages: [{ type: "say", say: "text", text: "Assistant: I can help with that." }],
			})

			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const handler = MessageHandlerFactory.create("caret")

			// Send follow-up message
			await handler.handleSendMessage("Continue with analysis", [], [], mockTaskServiceClient, undefined, 1)

			// Should add optimistic message to UI
			expect(mockVscode.setState).toHaveBeenCalledWith(
				expect.objectContaining({
					clineMessages: expect.arrayContaining([
						{ type: "say", say: "text", text: "Assistant: I can help with that." }, // Existing
						expect.objectContaining({
							type: "say",
							say: "user_feedback",
							text: "Continue with analysis",
						}),
					]),
				}),
			)

			// Should send message response for ongoing conversation
			expect(mockTaskServiceClient.askResponse).toHaveBeenCalledWith(
				expect.objectContaining({
					responseType: "messageResponse",
					text: "Continue with analysis",
					images: [],
					files: [],
				}),
			)
		})

		it("should differentiate from cline system behavior", async () => {
			// Test Cline system doesn't use optimistic updates
			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const clineHandler = MessageHandlerFactory.create("cline")

			// Reset mock calls
			mockVscode.setState.mockClear()
			mockTaskServiceClient.newTask.mockClear()

			await clineHandler.handleSendMessage("Cline message", [], [], mockTaskServiceClient, undefined, 0)

			// Cline handler should NOT call vscode.setState (no optimistic updates)
			expect(mockVscode.setState).not.toHaveBeenCalled()

			// Should still handle backend communication (based on clineAsk)
			// Note: Cline handler requires clineAsk for most operations
		})
	})

	describe("error handling and edge cases", () => {
		it("should handle empty messages gracefully", async () => {
			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const handler = MessageHandlerFactory.create("caret")

			// Send empty message
			await handler.handleSendMessage("", [], [], mockTaskServiceClient, undefined, 0)

			// Should not make any calls
			expect(mockVscode.setState).not.toHaveBeenCalled()
			expect(mockTaskServiceClient.newTask).not.toHaveBeenCalled()
			expect(mockTaskServiceClient.askResponse).not.toHaveBeenCalled()
		})

		it("should handle whitespace-only messages", async () => {
			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const handler = MessageHandlerFactory.create("caret")

			await handler.handleSendMessage("   \n\t   ", [], [], mockTaskServiceClient, undefined, 0)

			// Should not process whitespace-only messages
			expect(mockVscode.setState).not.toHaveBeenCalled()
		})

		it("should handle missing VSCode state gracefully", async () => {
			// Mock missing state
			mockVscode.getState.mockReturnValue(null)

			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const handler = MessageHandlerFactory.create("caret")

			await handler.handleSendMessage("Test message", [], [], mockTaskServiceClient, undefined, 0)

			// Should handle missing state gracefully (no crash, no setState call)
			expect(mockVscode.setState).not.toHaveBeenCalled()

			// Should still process the message and call backend services
			expect(mockTaskServiceClient.newTask).toHaveBeenCalledWith(
				expect.objectContaining({
					text: "Test message",
					images: [],
					files: [],
				}),
			)
		})
	})
})
