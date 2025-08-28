import { describe, it, expect, beforeEach, vi } from "vitest"
import { ButtonConfigFactory } from "../ButtonConfigFactory"

/**
 * TDD Test for Chatbot Mode Button Configuration Issue
 *
 * Problem: Chatbot mode shows task UI but no buttons appear
 * Root cause: chatbot_mode_respond has enableButtons: false
 * Expected: Should show "Proceed" button for task continuation
 */
describe("Chatbot Mode Button Configuration", () => {
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
	})

	describe("chatbot_mode_respond message handling", () => {
		it("should FAIL initially - chatbot mode buttons not enabled", () => {
			// This test should initially FAIL to demonstrate the bug
			const chatbotMessage = {
				type: "ask",
				ask: "chatbot_mode_respond",
				text: "Task completed. Would you like to proceed?",
				partial: false,
			}

			const config = ButtonConfigFactory.getConfig(chatbotMessage as any, "act", "caret")

			// This assertion should FAIL initially due to enableButtons: false
			expect(config.enableButtons).toBe(true) // Should be true for buttons to appear
			expect(config.primaryText).toBe("Proceed") // Should show Proceed button
			expect(config.primaryAction).toBe("proceed")
		})

		it("should show task continuation buttons in chatbot mode", () => {
			const chatbotMessage = {
				type: "ask",
				ask: "chatbot_mode_respond",
				text: "I have completed the analysis. Ready to proceed with the next step?",
				partial: false,
			}

			const config = ButtonConfigFactory.getConfig(chatbotMessage as any, "act", "caret")

			// Chatbot mode should enable buttons for task continuation
			expect(config.enableButtons).toBe(true)
			expect(config.sendingDisabled).toBe(false)

			// Should provide clear task continuation actions
			expect(config.primaryText).toBeDefined()
			expect(config.primaryAction).toBeDefined()
		})

		it("should differentiate from agent mode free conversation", () => {
			// Agent mode text response - should allow free conversation
			const agentMessage = {
				type: "say",
				say: "text",
				text: "Here is the analysis result...",
				partial: false,
			}

			const agentConfig = ButtonConfigFactory.getConfig(agentMessage as any, "act", "caret")

			// Agent mode should disable buttons for free conversation
			expect(agentConfig.enableButtons).toBe(false)
			expect(agentConfig.sendingDisabled).toBe(false)

			// Chatbot mode should enable buttons for structured interaction
			const chatbotMessage = {
				type: "ask",
				ask: "chatbot_mode_respond",
				partial: false,
			}

			const chatbotConfig = ButtonConfigFactory.getConfig(chatbotMessage as any, "act", "caret")
			expect(chatbotConfig.enableButtons).toBe(true) // Should be different from agent
		})

		it("should preserve cline system behavior", () => {
			// Ensure Cline system chatbot behavior is not affected
			const chatbotMessage = {
				type: "ask",
				ask: "chatbot_mode_respond",
				partial: false,
			}

			const clineConfig = ButtonConfigFactory.getConfig(chatbotMessage as any, "act", "cline")

			// Cline system should maintain its original behavior
			expect(clineConfig).toBeDefined()
			expect(clineConfig.enableButtons).toBeDefined()
		})
	})
})
