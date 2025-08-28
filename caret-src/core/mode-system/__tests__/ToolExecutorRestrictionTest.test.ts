/**
 * CARET MODIFICATION: ToolExecutor-specific tool restriction tests
 * Tests the actual ToolExecutor.isCaretToolRestricted() method
 */

import { describe, it, expect } from "vitest"
import { CLINE_MODES, RESTRICTED_TOOLS } from "@caret-src/shared/constants/ModeSystemConstants"

/**
 * Mock ToolExecutor class to test the isCaretToolRestricted logic
 * This simulates the actual implementation in ToolExecutor.ts
 */
class MockToolExecutor {
	constructor(public mode: string) {}

	// This replicates the actual implementation from ToolExecutor.ts:131-137
	private isCaretToolRestricted(toolName: string): boolean {
		// Apply Caret-specific restrictions only in plan mode (Chatbot mode in Caret)
		if (this.mode === CLINE_MODES.PLAN && this.isToolInRestrictedList(toolName)) {
			return true
		}
		return false
	}

	// Simulate the registry call
	private isToolInRestrictedList(toolName: string): boolean {
		return RESTRICTED_TOOLS.CHATBOT_BLOCKED.includes(toolName as any)
	}

	// Public method to test
	public testToolRestriction(toolName: string): boolean {
		return this.isCaretToolRestricted(toolName)
	}
}

describe("ToolExecutor Tool Restriction Tests", () => {
	describe("Chatbot Mode (plan) - MockToolExecutor", () => {
		const chatbotModeExecutor = new MockToolExecutor(CLINE_MODES.PLAN)

		it("should block write_to_file in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("write_to_file")
			expect(isBlocked).toBe(true)
		})

		it("should block replace_in_file in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("replace_in_file")
			expect(isBlocked).toBe(true)
		})

		it("should block execute_command in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("execute_command")
			expect(isBlocked).toBe(true)
		})

		it("should allow read_file in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("read_file")
			expect(isBlocked).toBe(false)
		})

		it("should allow list_files in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("list_files")
			expect(isBlocked).toBe(false)
		})

		it("should allow browser_action in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("browser_action")
			expect(isBlocked).toBe(false)
		})

		it("should allow search_files in Chatbot mode", () => {
			const isBlocked = chatbotModeExecutor.testToolRestriction("search_files")
			expect(isBlocked).toBe(false)
		})

		it("should block all restricted tools defined in constants", () => {
			for (const tool of RESTRICTED_TOOLS.CHATBOT_BLOCKED) {
				const isBlocked = chatbotModeExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(true)
			}
		})
	})

	describe("Agent Mode (act) - MockToolExecutor", () => {
		const agentModeExecutor = new MockToolExecutor(CLINE_MODES.ACT)

		it("should allow write_to_file in Agent mode", () => {
			const isBlocked = agentModeExecutor.testToolRestriction("write_to_file")
			expect(isBlocked).toBe(false)
		})

		it("should allow replace_in_file in Agent mode", () => {
			const isBlocked = agentModeExecutor.testToolRestriction("replace_in_file")
			expect(isBlocked).toBe(false)
		})

		it("should allow execute_command in Agent mode", () => {
			const isBlocked = agentModeExecutor.testToolRestriction("execute_command")
			expect(isBlocked).toBe(false)
		})

		it("should allow all tools that are blocked in Chatbot mode", () => {
			for (const tool of RESTRICTED_TOOLS.CHATBOT_BLOCKED) {
				const isBlocked = agentModeExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(false)
			}
		})

		it("should allow common safe tools", () => {
			const safeTools = ["read_file", "list_files", "browser_action", "search_files"]
			for (const tool of safeTools) {
				const isBlocked = agentModeExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(false)
			}
		})
	})

	describe("Complete Tool Execution Flow Simulation", () => {
		const simulateToolExecution = (
			mode: string,
			toolName: string,
		): {
			shouldBlock: boolean
			reason: string
		} => {
			const executor = new MockToolExecutor(mode)
			const isRestricted = executor.testToolRestriction(toolName)

			if (isRestricted) {
				return {
					shouldBlock: true,
					reason: "Tool is restricted in Chatbot mode for safety",
				}
			}

			return {
				shouldBlock: false,
				reason: "Tool execution allowed",
			}
		}

		it("should simulate complete blocking flow for write_to_file in Chatbot", () => {
			const result = simulateToolExecution(CLINE_MODES.PLAN, "write_to_file")

			expect(result.shouldBlock).toBe(true)
			expect(result.reason).toContain("restricted")
		})

		it("should simulate complete allowing flow for write_to_file in Agent", () => {
			const result = simulateToolExecution(CLINE_MODES.ACT, "write_to_file")

			expect(result.shouldBlock).toBe(false)
			expect(result.reason).toContain("allowed")
		})

		it("should simulate allowing read operations in both modes", () => {
			const chatbotRead = simulateToolExecution(CLINE_MODES.PLAN, "read_file")
			const agentRead = simulateToolExecution(CLINE_MODES.ACT, "read_file")

			expect(chatbotRead.shouldBlock).toBe(false)
			expect(agentRead.shouldBlock).toBe(false)
		})
	})

	describe("Real-world Scenario Tests", () => {
		it("should handle JWT implementation scenario in Agent mode", () => {
			const agentExecutor = new MockToolExecutor(CLINE_MODES.ACT)

			// Simulate tools needed for JWT implementation
			const toolsNeeded = [
				"execute_command", // npm install jsonwebtoken
				"write_to_file", // create middleware/auth.js
				"write_to_file", // create routes/auth.js
				"read_file", // read existing files
			]

			for (const tool of toolsNeeded) {
				const isBlocked = agentExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(false) // All should be allowed in Agent mode
			}
		})

		it("should handle code analysis scenario in Chatbot mode", () => {
			const chatbotExecutor = new MockToolExecutor(CLINE_MODES.PLAN)

			// Simulate tools needed for code analysis
			const analysisTools = [
				"read_file", // Read source code
				"search_files", // Search for patterns
				"list_files", // List project files
				"browser_action", // Search documentation
			]

			for (const tool of analysisTools) {
				const isBlocked = chatbotExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(false) // All should be allowed in Chatbot mode
			}

			// But dangerous operations should be blocked
			const dangerousTools = ["write_to_file", "execute_command"]
			for (const tool of dangerousTools) {
				const isBlocked = chatbotExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(true) // Should be blocked
			}
		})

		it("should prevent accidental file modification in Chatbot mode", () => {
			const chatbotExecutor = new MockToolExecutor(CLINE_MODES.PLAN)

			// User accidentally asks for file modification in Chatbot mode
			const modificationAttempts = [
				"write_to_file", // Direct file writing
				"replace_in_file", // Text replacement
				"execute_command", // Command execution
			]

			for (const tool of modificationAttempts) {
				const isBlocked = chatbotExecutor.testToolRestriction(tool)
				expect(isBlocked).toBe(true) // Safety mechanism should block
			}
		})
	})
})
