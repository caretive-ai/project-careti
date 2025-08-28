// CARET MODIFICATION: Test chatbot mode tool restrictions
// Ensures dangerous tools are properly restricted in chatbot mode

import { CaretToolHandler } from "../CaretToolHandler"

describe("Chatbot Mode Tool Restrictions", () => {
	let chatbotHandler: CaretToolHandler
	let agentHandler: CaretToolHandler

	beforeEach(async () => {
		// Create handlers for both modes
		chatbotHandler = new CaretToolHandler(process.cwd(), {
			system: "caret",
			mode: "chatbot",
			extensionPath: process.cwd(),
			currentWorkingDirectory: process.cwd(),
		})

		agentHandler = new CaretToolHandler(process.cwd(), {
			system: "caret",
			mode: "agent",
			extensionPath: process.cwd(),
			currentWorkingDirectory: process.cwd(),
		})

		// Load tools for both handlers
		await chatbotHandler.loadTools()
		await agentHandler.loadTools()
	})

	describe("Dangerous tools should be restricted in chatbot mode", () => {
		test("execute_command should be blocked in chatbot mode", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("execute_command")).toBe(false)
			expect(agentTools.has("execute_command")).toBe(true)
		})

		test("write_to_file should be blocked in chatbot mode", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("write_to_file")).toBe(false)
			expect(agentTools.has("write_to_file")).toBe(true)
		})

		test("replace_in_file should be blocked in chatbot mode", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("replace_in_file")).toBe(false)
			expect(agentTools.has("replace_in_file")).toBe(true)
		})
	})

	describe("Safe tools should be available in both modes", () => {
		test("read_file should be available in both modes", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("read_file")).toBe(true)
			expect(agentTools.has("read_file")).toBe(true)
		})

		test("search_files should be available in both modes", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("search_files")).toBe(true)
			expect(agentTools.has("search_files")).toBe(true)
		})

		test("list_files should be available in both modes", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("list_files")).toBe(true)
			expect(agentTools.has("list_files")).toBe(true)
		})

		test("browser_action should be available in both modes", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			// Browser action should be available for both modes (research/implementation)
			expect(chatbotTools.has("browser_action")).toBe(true)
			expect(agentTools.has("browser_action")).toBe(true)
		})
	})

	describe("Mode-specific response tools", () => {
		test("chatbot_mode_respond should be available in both modes", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			// chatbot_mode_respond is available in both modes for flexibility
			expect(chatbotTools.has("chatbot_mode_respond")).toBe(true)
			expect(agentTools.has("chatbot_mode_respond")).toBe(true)
		})

		test("caret_chatbot_respond should only be available in chatbot mode", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("caret_chatbot_respond")).toBe(true)
			expect(agentTools.has("caret_chatbot_respond")).toBe(false)
		})

		test("caret_agent_execute should only be available in agent mode", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			expect(chatbotTools.has("caret_agent_execute")).toBe(false)
			expect(agentTools.has("caret_agent_execute")).toBe(true)
		})
	})

	describe("Tool count verification", () => {
		test("agent mode should have more tools than chatbot mode", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			// Agent should have all tools that chatbot has, plus the dangerous ones
			expect(agentTools.size).toBeGreaterThan(chatbotTools.size)
		})

		test("should log the difference in available tools", () => {
			const chatbotTools = chatbotHandler.getAvailableTools()
			const agentTools = agentHandler.getAvailableTools()

			const chatbotToolNames = Array.from(chatbotTools.keys()).sort()
			const agentToolNames = Array.from(agentTools.keys()).sort()

			console.log(`Chatbot tools (${chatbotToolNames.length}):`, chatbotToolNames)
			console.log(`Agent tools (${agentToolNames.length}):`, agentToolNames)

			const restrictedTools = agentToolNames.filter((tool) => !chatbotTools.has(tool))
			console.log("Tools restricted from chatbot mode:", restrictedTools)

			// Verify our specific restrictions are working
			expect(restrictedTools).toContain("execute_command")
			expect(restrictedTools).toContain("write_to_file")
			expect(restrictedTools).toContain("replace_in_file")
		})
	})
})
