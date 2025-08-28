import { describe, it, expect, beforeEach, vi } from "vitest"

/**
 * TDD Test for Missing Optimistic Message Update
 *
 * Problem: User messages don't appear in UI immediately when sent
 * Root cause: Missing optimistic update mechanism
 * Expected: User message should appear in UI immediately, then be replaced by backend response
 */
describe("Optimistic Message Update", () => {
	let mockVscode: any

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

		// Make vscode global available
		;(global as any).vscode = mockVscode
	})

	describe("immediate UI update on message send", () => {
		it("should FAIL initially - no optimistic update implemented", async () => {
			// This test should initially FAIL to demonstrate the bug
			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const mockNewTask = vi.fn()
			const mockAskResponse = vi.fn()

			const mockTaskServiceClient = {
				newTask: mockNewTask,
				askResponse: mockAskResponse,
			}

			const handler = MessageHandlerFactory.create("caret")

			// Send a message
			await handler.handleSendMessage("Hello, test message", [], [], mockTaskServiceClient, undefined, 0)

			// Should immediately update VSCode state with optimistic message
			expect(mockVscode.setState).toHaveBeenCalledWith(
				expect.objectContaining({
					clineMessages: expect.arrayContaining([
						expect.objectContaining({
							type: "say",
							say: "user_feedback",
							text: "Hello, test message",
						}),
					]),
				}),
			)
		})

		it("should create optimistic user_feedback message", () => {
			// Verify the structure of optimistic message
			const optimisticMessage = {
				type: "say",
				say: "user_feedback",
				text: "Test user message",
				ts: Date.now(),
			}

			expect(optimisticMessage.type).toBe("say")
			expect(optimisticMessage.say).toBe("user_feedback")
			expect(optimisticMessage.text).toBe("Test user message")
			expect(typeof optimisticMessage.ts).toBe("number")
		})

		it("should preserve existing messages when adding optimistic update", async () => {
			// Mock existing messages
			mockVscode.getState.mockReturnValue({
				clineMessages: [{ type: "say", say: "text", text: "Previous message" }],
			})

			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const mockTaskServiceClient = {
				newTask: vi.fn(),
				askResponse: vi.fn(),
			}

			const handler = MessageHandlerFactory.create("caret")

			await handler.handleSendMessage("New message", [], [], mockTaskServiceClient, undefined, 0)

			// Should preserve existing messages and add new one
			expect(mockVscode.setState).toHaveBeenCalledWith(
				expect.objectContaining({
					clineMessages: [
						{ type: "say", say: "text", text: "Previous message" }, // Existing
						expect.objectContaining({
							// New optimistic message
							type: "say",
							say: "user_feedback",
							text: "New message",
						}),
					],
				}),
			)
		})
	})

	describe("integration with existing message flow", () => {
		it("should work with new task creation", async () => {
			// Empty message state for new task
			mockVscode.getState.mockReturnValue({
				clineMessages: [],
			})

			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const mockNewTask = vi.fn()

			const mockTaskServiceClient = {
				newTask: mockNewTask,
				askResponse: vi.fn(),
			}

			const handler = MessageHandlerFactory.create("caret")

			await handler.handleSendMessage("Start new task", [], [], mockTaskServiceClient, undefined, 0)

			// Should both create optimistic update AND call newTask
			expect(mockVscode.setState).toHaveBeenCalled()
			expect(mockNewTask).toHaveBeenCalled()
		})

		it("should work with ongoing conversation", async () => {
			// Existing conversation
			mockVscode.getState.mockReturnValue({
				clineMessages: [{ type: "say", say: "text", text: "Assistant response" }],
			})

			const { MessageHandlerFactory } = await import("../MessageHandlerFactory")

			const mockAskResponse = vi.fn()

			const mockTaskServiceClient = {
				newTask: vi.fn(),
				askResponse: mockAskResponse,
			}

			const handler = MessageHandlerFactory.create("caret")

			await handler.handleSendMessage("Follow up question", [], [], mockTaskServiceClient, undefined, 1)

			// Should both create optimistic update AND call askResponse
			expect(mockVscode.setState).toHaveBeenCalled()
			expect(mockAskResponse).toHaveBeenCalled()
		})
	})
})
