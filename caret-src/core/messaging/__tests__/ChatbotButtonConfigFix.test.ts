import { describe, it, expect, beforeEach, vi } from "vitest"

/**
 * TDD Test for Fixed Chatbot Mode Button Configuration
 *
 * Verifies that the fix for BUTTON_CONFIGS.chatbot_mode_respond works correctly
 * This test imports the actual buttonConfig.ts to verify the configuration
 */
describe("Fixed Chatbot Mode Button Configuration", () => {
	beforeEach(() => {
		// Mock localStorage for tests
		global.localStorage = {
			getItem: vi.fn().mockReturnValue("cline"), // Default to cline system
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			length: 0,
			key: vi.fn(),
		}
	})
	describe("BUTTON_CONFIGS.chatbot_mode_respond", () => {
		it("should have enableButtons: true for task continuation", async () => {
			// Import buttonConfig dynamically to test the actual configuration
			const { BUTTON_CONFIGS } = await import("../../../../webview-ui/src/components/chat/chat-view/shared/buttonConfig")

			const config = BUTTON_CONFIGS.chatbot_mode_respond

			// Should enable buttons for task continuation
			expect(config.enableButtons).toBe(true)
			expect(config.sendingDisabled).toBe(false)

			// Should provide appropriate task continuation actions
			expect(config.primaryText).toBe("Proceed")
			expect(config.secondaryText).toBe("Start New Task")
			expect(config.primaryAction).toBe("proceed")
			expect(config.secondaryAction).toBe("new_task")
		})

		it("should differ from plan_mode_respond configuration", async () => {
			const { BUTTON_CONFIGS } = await import("../../../../webview-ui/src/components/chat/chat-view/shared/buttonConfig")

			const chatbotConfig = BUTTON_CONFIGS.chatbot_mode_respond
			const planConfig = BUTTON_CONFIGS.plan_mode_respond

			// Chatbot mode should enable buttons, plan mode should not
			expect(chatbotConfig.enableButtons).toBe(true)
			expect(planConfig.enableButtons).toBe(false)

			// Should have different button texts for different contexts
			expect(chatbotConfig.primaryText).toBe("Proceed")
			expect(planConfig.primaryText).toBe("Approve")
		})

		it("should provide task continuation workflow", async () => {
			const { BUTTON_CONFIGS } = await import("../../../../webview-ui/src/components/chat/chat-view/shared/buttonConfig")

			const config = BUTTON_CONFIGS.chatbot_mode_respond

			// Primary action should allow proceeding with current task
			expect(config.primaryAction).toBe("proceed")

			// Secondary action should allow starting fresh
			expect(config.secondaryAction).toBe("new_task")

			// Should not be in sending disabled state
			expect(config.sendingDisabled).toBe(false)
		})
	})

	describe("getButtonConfig integration with fixed configuration", () => {
		it("should return fixed configuration for chatbot_mode_respond", async () => {
			const { getButtonConfig } = await import("../../../../webview-ui/src/components/chat/chat-view/shared/buttonConfig")

			const chatbotMessage = {
				type: "ask",
				ask: "chatbot_mode_respond",
				text: "Task completed. What would you like to do next?",
				partial: false,
			}

			const config = getButtonConfig(chatbotMessage as any, "act")

			// Should use the fixed configuration with enabled buttons
			expect(config.enableButtons).toBe(true)
			expect(config.primaryText).toBe("Proceed")
		})
	})
})
