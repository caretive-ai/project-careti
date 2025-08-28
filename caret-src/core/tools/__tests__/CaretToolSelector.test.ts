// CARET MODIFICATION: Test for Caret Tool Selector
import { describe, it, expect, beforeEach } from "vitest"
import * as path from "path"
import { CaretToolHandler, ToolContext } from "../CaretToolHandler"
import { CaretToolSelector } from "../CaretToolSelector"

describe("CaretToolSelector", () => {
	let selector: CaretToolSelector
	let handler: CaretToolHandler
	let mockContext: ToolContext
	let mockExtensionPath: string

	beforeEach(() => {
		mockExtensionPath = path.resolve(__dirname, "../../../..")
		mockContext = {
			mode: "agent" as const,
			system: "caret" as const,
			extensionPath: mockExtensionPath,
			currentWorkingDirectory: "/mock/cwd",
		}

		handler = new CaretToolHandler(mockExtensionPath, mockContext)
		selector = new CaretToolSelector(handler)
	})

	describe("Initialization", () => {
		it("should initialize successfully", () => {
			expect(selector).toBeDefined()
		})
	})

	describe("Tool Selection", () => {
		it("should select tools with default criteria", () => {
			const result = selector.selectTools()

			expect(result).toBeDefined()
			expect(result.selectedTools instanceof Map).toBe(true)
			expect(Array.isArray(result.rejectedTools)).toBe(true)
			expect(result.selectionCriteria).toBeDefined()
			expect(typeof result.totalAvailable).toBe("number")
			expect(typeof result.totalSelected).toBe("number")
		})

		it("should select tools with custom criteria", () => {
			const result = selector.selectTools({
				mode: "chatbot",
				executionType: "internal",
				priority: "high",
			})

			expect(result.selectionCriteria.mode).toBe("chatbot")
			expect(result.selectionCriteria.executionType).toBe("internal")
			expect(result.selectionCriteria.priority).toBe("high")
		})

		it("should cache selection results", () => {
			// First call
			const result1 = selector.selectTools({ mode: "chatbot" })

			// Second call with same criteria should be cached
			const result2 = selector.selectTools({ mode: "chatbot" })

			// Should be the same object reference (cached)
			expect(result1).toBe(result2)
		})
	})

	describe("Mode-specific Selection", () => {
		it("should get chatbot tools", () => {
			const result = selector.getChatbotTools()

			expect(result.selectionCriteria.mode).toBe("chatbot")
		})

		it("should get agent tools", () => {
			const result = selector.getAgentTools()

			expect(result.selectionCriteria.mode).toBe("agent")
		})

		it("should get essential tools", () => {
			const result = selector.getEssentialTools()

			expect(result.selectionCriteria.priority).toBe("high")
			expect(result.selectionCriteria.executionType).toBe("internal")
		})

		it("should get recommended tools", () => {
			const result = selector.getRecommendedTools()

			// Should be based on current context (agent mode)
			expect(result.selectionCriteria.mode).toBe("agent")
		})
	})

	describe("Execution Type Selection", () => {
		it("should get tools by execution type", () => {
			const internalTools = selector.getToolsByExecutionType("internal")
			const externalTools = selector.getToolsByExecutionType("external")
			const hybridTools = selector.getToolsByExecutionType("hybrid")

			expect(internalTools.selectionCriteria.executionType).toBe("internal")
			expect(externalTools.selectionCriteria.executionType).toBe("external")
			expect(hybridTools.selectionCriteria.executionType).toBe("hybrid")
		})
	})

	describe("Cache Management", () => {
		it("should clear selection cache", () => {
			// Create some cached selections
			selector.selectTools({ mode: "chatbot" })
			selector.selectTools({ mode: "agent" })

			const clearedCount = selector.clearCache()
			expect(typeof clearedCount).toBe("number")
			expect(clearedCount).toBeGreaterThanOrEqual(0)
		})

		it("should provide selection statistics", () => {
			const stats = selector.getSelectionStats()

			expect(stats).toBeDefined()
			expect(typeof stats.cacheSize).toBe("number")
			expect(typeof stats.availableTools).toBe("number")
			expect(Array.isArray(stats.commonSelections)).toBe(true)
		})
	})

	describe("Selection Validation", () => {
		it("should validate tool selection", () => {
			const selection = selector.selectTools()
			const validation = selector.validateSelection(selection)

			expect(validation).toBeDefined()
			expect(typeof validation.isValid).toBe("boolean")
			expect(Array.isArray(validation.warnings)).toBe(true)
			expect(Array.isArray(validation.errors)).toBe(true)
		})
	})

	describe("Selection Comparison", () => {
		it("should compare tool selections", () => {
			const selection1 = selector.getChatbotTools()
			const selection2 = selector.getAgentTools()

			const comparison = selector.compareSelections(selection1, selection2)

			expect(comparison).toBeDefined()
			expect(Array.isArray(comparison.common)).toBe(true)
			expect(Array.isArray(comparison.unique1)).toBe(true)
			expect(Array.isArray(comparison.unique2)).toBe(true)
			expect(typeof comparison.differences).toBe("number")
		})
	})

	describe("Context Management", () => {
		it("should get current context", () => {
			const context = selector.getContext()

			expect(context.mode).toBe("agent")
			expect(context.system).toBe("caret")
		})

		it("should update default criteria", () => {
			selector.updateDefaultCriteria({
				priority: "high",
				executionType: "external",
			})

			// Verify update by checking a new selection
			const result = selector.selectTools()
			expect(result.selectionCriteria.priority).toBe("high")
			expect(result.selectionCriteria.executionType).toBe("external")
		})
	})

	describe("Edge Cases", () => {
		it("should handle empty tool set", () => {
			// Handler with no tools loaded will return empty results
			const result = selector.selectTools()

			expect(result.totalAvailable).toBe(0)
			expect(result.totalSelected).toBe(0)
			expect(result.selectedTools.size).toBe(0)
		})

		it("should handle invalid criteria", () => {
			// Should not throw error with unusual criteria
			const result = selector.selectTools({
				// @ts-ignore - testing runtime behavior
				invalidField: "invalid",
			})

			expect(result).toBeDefined()
		})
	})

	describe("Performance", () => {
		it("should handle repeated selections efficiently", () => {
			const startTime = Date.now()

			// Perform multiple selections
			for (let i = 0; i < 10; i++) {
				selector.selectTools({ mode: "chatbot" })
				selector.selectTools({ mode: "agent" })
			}

			const endTime = Date.now()
			const duration = endTime - startTime

			// Should complete quickly due to caching
			expect(duration).toBeLessThan(1000) // Less than 1 second
		})
	})
})
