// CARET MODIFICATION: Test for Agent mode button configuration fix
// Addresses user feedback about Cancel button appearing after AI responses
// Tests that Agent mode allows free conversation without unwanted Cancel buttons

import { describe, test, expect, beforeEach, vi } from "vitest"
import { getButtonConfig, BUTTON_CONFIGS } from "../buttonConfig"
import type { ClineMessage } from "@shared/ExtensionMessage"
import { MODE_SYSTEMS, STORAGE_KEYS, CARET_MODES } from "@caret-src/shared/constants/ModeSystemConstants"

// Mock localStorage
const mockLocalStorage = {
	store: {} as Record<string, string>,
	getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
	setItem: vi.fn((key: string, value: string) => {
		mockLocalStorage.store[key] = value
	}),
	clear: vi.fn(() => {
		mockLocalStorage.store = {}
	}),
}

// Replace localStorage with mock
Object.defineProperty(window, "localStorage", {
	value: mockLocalStorage,
	writable: true,
})

describe("Agent Mode Button Flow Fix", () => {
	beforeEach(() => {
		mockLocalStorage.clear()
		vi.clearAllMocks()
	})

	describe("Caret Agent mode conversation flow", () => {
		test("should allow free messaging after AI text response (no Cancel button)", () => {
			// Set up Caret Agent mode
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CARET)
			mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.AGENT)

			// Create a typical AI text response message
			const aiTextMessage: ClineMessage = {
				id: "test-1",
				type: "say",
				say: "text",
				text: "Here's my analysis of your code...",
				partial: false,
			}

			const config = getButtonConfig(aiTextMessage, "act")

			// Should enable free messaging without any buttons
			expect(config).toEqual(BUTTON_CONFIGS.default)
			expect(config.sendingDisabled).toBe(false)
			expect(config.enableButtons).toBe(false)
			expect(config.primaryText).toBeUndefined()
			expect(config.secondaryText).toBeUndefined()
		})

		test("should allow free messaging after AI reasoning response (no Cancel button)", () => {
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CARET)
			mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.AGENT)

			const aiReasoningMessage: ClineMessage = {
				id: "test-2",
				type: "say",
				say: "reasoning",
				text: "I think the best approach would be...",
				partial: false,
			}

			const config = getButtonConfig(aiReasoningMessage, "act")

			// Should enable free messaging without any buttons
			expect(config).toEqual(BUTTON_CONFIGS.default)
			expect(config.sendingDisabled).toBe(false)
			expect(config.enableButtons).toBe(false)
		})

		test("should show Cancel button only during streaming", () => {
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CARET)
			mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.AGENT)

			const streamingMessage: ClineMessage = {
				id: "test-3",
				type: "say",
				say: "text",
				text: "I'm still thinking...",
				partial: true, // This is the key difference
			}

			const config = getButtonConfig(streamingMessage, "act")

			// Should show Cancel button during streaming
			expect(config).toEqual(BUTTON_CONFIGS.partial)
			expect(config.sendingDisabled).toBe(true)
			expect(config.enableButtons).toBe(true)
			expect(config.secondaryText).toBe("Cancel")
		})

		test("should still show proper buttons for tool approval", () => {
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CARET)
			mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.AGENT)

			const toolMessage: ClineMessage = {
				id: "test-4",
				type: "ask",
				ask: "tool",
				text: JSON.stringify({ tool: "write_to_file", path: "test.txt" }),
			}

			const config = getButtonConfig(toolMessage, "act")

			// Should show Approve/Reject for tools
			expect(config).toEqual(BUTTON_CONFIGS.tool_approve)
			expect(config.primaryText).toBe("Approve")
			expect(config.secondaryText).toBe("Reject")
		})

		test("should show api_req_started correctly", () => {
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CARET)
			mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.AGENT)

			const apiStartMessage: ClineMessage = {
				id: "test-5",
				type: "say",
				say: "api_req_started",
				text: "Making API request...",
			}

			const config = getButtonConfig(apiStartMessage, "act")

			// Should show Cancel button for API requests
			expect(config).toEqual(BUTTON_CONFIGS.api_req_active)
			expect(config.sendingDisabled).toBe(true)
			expect(config.secondaryText).toBe("Cancel")
		})
	})

	describe("Comparison with Cline mode", () => {
		test("Cline mode should behave differently (baseline)", () => {
			// Set up Cline mode
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CLINE)

			const aiTextMessage: ClineMessage = {
				id: "test-6",
				type: "say",
				say: "text",
				text: "Here's my analysis...",
				partial: false,
			}

			const config = getButtonConfig(aiTextMessage, "act")

			// Cline mode returns partial config which shows Cancel button
			expect(config).toEqual(BUTTON_CONFIGS.partial)
			expect(config.secondaryText).toBe("Cancel")
		})
	})

	describe("Chatbot mode conversation", () => {
		test("should allow free messaging in Chatbot mode", () => {
			mockLocalStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, MODE_SYSTEMS.CARET)
			mockLocalStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.CHATBOT)

			const aiTextMessage: ClineMessage = {
				id: "test-7",
				type: "say",
				say: "text",
				text: "Here's my analysis...",
				partial: false,
			}

			const config = getButtonConfig(aiTextMessage, "plan")

			// Chatbot mode shows agent_conversation config (New Task button)
			expect(config).toEqual(BUTTON_CONFIGS.agent_conversation)
			expect(config.sendingDisabled).toBe(false)
			expect(config.secondaryText).toBe("New Task")
		})
	})
})
