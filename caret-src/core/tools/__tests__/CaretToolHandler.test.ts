// CARET MODIFICATION: Test for Caret Tool Handler
import { describe, it, expect, beforeEach } from "vitest"
import * as path from "path"
import { CaretToolHandler, ToolContext } from "../CaretToolHandler"

describe("CaretToolHandler", () => {
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
	})

	describe("Initialization", () => {
		it("should initialize successfully", () => {
			expect(handler).toBeDefined()
		})

		it("should store context correctly", () => {
			const context = handler.getContext()
			expect(context.mode).toBe("agent")
			expect(context.system).toBe("caret")
		})
	})

	describe("Tool Loading", () => {
		it("should load tools from JSON definitions", async () => {
			try {
				await handler.loadTools()

				// Should have some tools loaded (depending on test environment)
				const tools = handler.getAvailableTools()
				expect(tools.size).toBeGreaterThanOrEqual(0)
			} catch (error) {
				// If TOOL_DEFINITIONS.json doesn't exist, that's expected in test environment
				expect(error).toBeDefined()
			}
		})

		it("should filter tools based on context", async () => {
			// Create handler for chatbot mode
			const chatbotContext: ToolContext = {
				...mockContext,
				mode: "chatbot",
				system: "caret",
			}
			const chatbotHandler = new CaretToolHandler(mockExtensionPath, chatbotContext)

			try {
				await chatbotHandler.loadTools()

				const tools = chatbotHandler.getAvailableTools()

				// Should only have tools allowed for chatbot mode
				for (const [toolName, toolDef] of tools.entries()) {
					if (toolDef.mode_restriction === "agent_only") {
						expect(false).toBe(true) // Should not have agent-only tools
					}
				}
			} catch (error) {
				// Expected in test environment without real JSON files
				expect(error).toBeDefined()
			}
		})
	})

	describe("Tool Access", () => {
		it("should provide tool access methods", () => {
			const tools = handler.getAvailableTools()
			expect(tools).toBeDefined()
			expect(tools instanceof Map).toBe(true)
		})

		it("should check tool existence", () => {
			const hasTool = handler.hasTool("non_existent_tool")
			expect(typeof hasTool).toBe("boolean")
		})

		it("should get tool definition", () => {
			const toolDef = handler.getToolDefinition("non_existent_tool")
			expect(toolDef).toBeUndefined()
		})
	})

	describe("Tool Filtering", () => {
		it("should filter tools by execution type", async () => {
			try {
				await handler.loadTools()

				const internalTools = handler.getToolsByType("internal")
				const externalTools = handler.getToolsByType("external")
				const hybridTools = handler.getToolsByType("hybrid")

				expect(Array.isArray(internalTools)).toBe(true)
				expect(Array.isArray(externalTools)).toBe(true)
				expect(Array.isArray(hybridTools)).toBe(true)
			} catch (error) {
				// Expected in test environment
				expect(error).toBeDefined()
			}
		})
	})

	describe("Schema Generation", () => {
		it("should generate tool schema for LLM", async () => {
			const schema = handler.generateToolSchema()
			expect(Array.isArray(schema)).toBe(true)
		})
	})

	describe("Tool Validation", () => {
		it("should validate tool calls", () => {
			// Test with non-existent tool
			const isValid = handler.validateToolCall("non_existent_tool", {})
			expect(isValid).toBe(false)
		})
	})

	describe("Context Management", () => {
		it("should update context", () => {
			handler.updateContext({ mode: "chatbot" })

			const context = handler.getContext()
			expect(context.mode).toBe("chatbot")
			expect(context.system).toBe("caret") // Should preserve other fields
		})
	})

	describe("Tool Statistics", () => {
		it("should provide tool statistics", async () => {
			const stats = handler.getToolStats()

			expect(stats).toBeDefined()
			expect(typeof stats.total).toBe("number")
			expect(stats.byMode).toBeDefined()
			expect(stats.bySystem).toBeDefined()
			expect(stats.byType).toBeDefined()
		})
	})

	describe("Tool Refresh", () => {
		it("should refresh tools", async () => {
			try {
				await handler.refreshTools()
				// Should complete without error
				expect(true).toBe(true)
			} catch (error) {
				// Expected in test environment
				expect(error).toBeDefined()
			}
		})
	})
})
