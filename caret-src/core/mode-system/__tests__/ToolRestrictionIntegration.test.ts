/**
 * CARET MODIFICATION: Integration tests for tool restriction system
 * Tests the complete flow from ModeSystemRegistry to actual tool blocking
 */

import { describe, it, expect, beforeEach } from "vitest"
import { modeRegistry } from "../ModeSystemRegistry"
import { CLINE_MODES, RESTRICTED_TOOLS, ERROR_MESSAGES } from "@caret-src/shared/constants/ModeSystemConstants"

describe("Tool Restriction Integration Tests", () => {
	describe("Chatbot Mode Tool Restrictions", () => {
		it("should block write_to_file in Chatbot mode (plan)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "write_to_file")
			expect(isRestricted).toBe(true)
		})

		it("should block replace_in_file in Chatbot mode (plan)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "replace_in_file")
			expect(isRestricted).toBe(true)
		})

		it("should block execute_command in Chatbot mode (plan)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "execute_command")
			expect(isRestricted).toBe(true)
		})

		it("should allow read_file in Chatbot mode (plan)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "read_file")
			expect(isRestricted).toBe(false)
		})

		it("should allow browser_action in Chatbot mode (plan)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "browser_action")
			expect(isRestricted).toBe(false)
		})

		it("should return correct error message for restricted tools", () => {
			const message = modeRegistry.getToolRestrictionMessage("caret", CLINE_MODES.PLAN, "write_to_file")
			expect(message).toBe(ERROR_MESSAGES.CHATBOT_TOOL_RESTRICTED)
			expect(message).toContain("Agent 모드에서만")
		})

		it("should block all tools defined in RESTRICTED_TOOLS.CHATBOT_BLOCKED", () => {
			for (const tool of RESTRICTED_TOOLS.CHATBOT_BLOCKED) {
				const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, tool)
				expect(isRestricted).toBe(true)
			}
		})
	})

	describe("Agent Mode Tool Access", () => {
		it("should allow write_to_file in Agent mode (act)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.ACT, "write_to_file")
			expect(isRestricted).toBe(false)
		})

		it("should allow execute_command in Agent mode (act)", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.ACT, "execute_command")
			expect(isRestricted).toBe(false)
		})

		it("should allow all tools that are blocked in Chatbot mode", () => {
			for (const tool of RESTRICTED_TOOLS.CHATBOT_BLOCKED) {
				const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.ACT, tool)
				expect(isRestricted).toBe(false)
			}
		})

		it("should allow common tools like read_file, browser_action", () => {
			const commonTools = ["read_file", "list_files", "browser_action", "search_files"]
			for (const tool of commonTools) {
				const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.ACT, tool)
				expect(isRestricted).toBe(false)
			}
		})
	})

	describe("Cline System Compatibility", () => {
		it("should not restrict any tools in Cline system", () => {
			const toolsToTest = ["write_to_file", "execute_command", "read_file", "browser_action"]

			for (const tool of toolsToTest) {
				// Cline plan mode
				const planRestricted = modeRegistry.isToolRestricted("cline", CLINE_MODES.PLAN, tool)
				expect(planRestricted).toBe(false)

				// Cline act mode
				const actRestricted = modeRegistry.isToolRestricted("cline", CLINE_MODES.ACT, tool)
				expect(actRestricted).toBe(false)
			}
		})

		it("should use Cline adapter for Cline system", () => {
			const adapter = modeRegistry.getAdapter("cline")
			expect(adapter.constructor.name).toBe("ClineModeAdapter")
		})

		it("should use Caret adapter for Caret system", () => {
			const adapter = modeRegistry.getAdapter("caret")
			expect(adapter.constructor.name).toBe("CaretModeAdapter")
		})
	})

	describe("Error Message System", () => {
		it("should provide Korean error message for Caret Chatbot mode", () => {
			const message = modeRegistry.getToolRestrictionMessage("caret", CLINE_MODES.PLAN, "write_to_file")
			expect(message).toContain("Agent 모드")
			expect(message).toContain("Chatbot 모드")
		})

		it("should provide generic error message for other systems", () => {
			const message = modeRegistry.getToolRestrictionMessage("caret", CLINE_MODES.ACT, "fake_tool")
			expect(message).toContain("fake_tool")
			expect(message).toContain("ACT MODE")
		})
	})

	describe("Edge Cases and Safety", () => {
		it("should handle unknown tools safely", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "unknown_tool")
			expect(isRestricted).toBe(false) // Unknown tools are not restricted by default
		})

		it("should handle unknown mode systems safely", () => {
			const isRestricted = modeRegistry.isToolRestricted("unknown_system", CLINE_MODES.PLAN, "write_to_file")
			expect(isRestricted).toBe(false) // Falls back to Cline behavior (no restrictions)
		})

		it("should handle empty tool names safely", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "")
			expect(isRestricted).toBe(false)
		})

		it("should handle case sensitivity correctly", () => {
			const isRestricted = modeRegistry.isToolRestricted("caret", CLINE_MODES.PLAN, "WRITE_TO_FILE")
			expect(isRestricted).toBe(false) // Case sensitive - should not match
		})
	})
})

/**
 * Mock ToolExecutor Integration Test
 * Tests the complete integration from ToolExecutor to ModeSystemRegistry
 */
describe("ToolExecutor Integration Simulation", () => {
	// Simulate the logic that would be in ToolExecutor
	const simulateToolExecution = (modeSystem: string, mode: string, toolName: string) => {
		// This simulates the logic in ToolExecutor.isCaretToolRestricted()
		if (modeSystem === "caret" && mode === CLINE_MODES.PLAN && modeRegistry.isToolRestricted(modeSystem, mode, toolName)) {
			return {
				blocked: true,
				message: modeRegistry.getToolRestrictionMessage(modeSystem, mode, toolName),
			}
		}
		return {
			blocked: false,
			message: null,
		}
	}

	it("should simulate blocking write_to_file in Caret Chatbot mode", () => {
		const result = simulateToolExecution("caret", CLINE_MODES.PLAN, "write_to_file")

		expect(result.blocked).toBe(true)
		expect(result.message).toBe(ERROR_MESSAGES.CHATBOT_TOOL_RESTRICTED)
	})

	it("should simulate allowing write_to_file in Caret Agent mode", () => {
		const result = simulateToolExecution("caret", CLINE_MODES.ACT, "write_to_file")

		expect(result.blocked).toBe(false)
		expect(result.message).toBe(null)
	})

	it("should simulate allowing all tools in Cline system", () => {
		const clineResult1 = simulateToolExecution("cline", CLINE_MODES.PLAN, "write_to_file")
		const clineResult2 = simulateToolExecution("cline", CLINE_MODES.ACT, "execute_command")

		expect(clineResult1.blocked).toBe(false)
		expect(clineResult2.blocked).toBe(false)
	})
})
