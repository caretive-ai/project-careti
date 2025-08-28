import { describe, it, expect } from "vitest"
import * as path from "path"
import * as fs from "fs"

/**
 * Integration test to verify Agent and Chatbot modes work like Plan mode
 * Tests that both modes use ask-based tools for conversations
 */
describe("Agent and Chatbot Mode Integration", () => {
	it("should have both modes configured to use ask-based conversation tools", () => {
		const chatbotAgentModesPath = path.resolve(__dirname, "../../core/prompts/sections/CHATBOT_AGENT_MODES.json")
		const content = fs.readFileSync(chatbotAgentModesPath, "utf8")
		const config = JSON.parse(content)

		// Agent mode should mention agent_mode_respond tool
		expect(config.agent_mode.conversation_style).toContain("agent_mode_respond")
		expect(config.agent_mode.available_tools).toContain("agent_mode_respond")

		// Chatbot mode should mention chatbot_mode_respond tool
		expect(config.chatbot_mode.conversation_style).toContain("chatbot_mode_respond")
		expect(config.chatbot_mode.available_tools).toContain("chatbot_mode_respond")

		console.log("✅ Both Agent and Chatbot modes configured to use ask-based conversation tools")
	})

	it("should have consistent button configurations for all conversation modes", () => {
		const buttonConfigPath = path.resolve(
			__dirname,
			"../../../webview-ui/src/components/chat/chat-view/shared/buttonConfig.ts",
		)
		const content = fs.readFileSync(buttonConfigPath, "utf8")

		// All three modes should have similar button configurations
		expect(content).toContain("plan_mode_respond:")
		expect(content).toContain("agent_mode_respond:")
		expect(content).toContain("chatbot_mode_respond:")

		// All should have enableButtons: false for conversation flow
		const planConfig = content.match(/plan_mode_respond:\s*{[^}]*enableButtons:\s*false[^}]*}/s)
		const agentConfig = content.match(/agent_mode_respond:\s*{[^}]*enableButtons:\s*false[^}]*}/s)
		const chatbotConfig = content.match(/chatbot_mode_respond:\s*{[^}]*enableButtons:\s*false[^}]*}/s)

		expect(planConfig).toBeTruthy()
		expect(agentConfig).toBeTruthy()
		expect(chatbotConfig).toBeTruthy()

		console.log("✅ All conversation modes have consistent button configurations")
	})

	it("should have system prompts that instruct modes to use conversation tools", () => {
		const caretSystemPromptPath = path.resolve(__dirname, "../../core/prompts/CaretSystemPrompt.ts")
		const content = fs.readFileSync(caretSystemPromptPath, "utf8")

		// Both modes should mention their respective conversation tools
		expect(content).toContain("chatbot_mode_respond tool for conversational responses")
		expect(content).toContain("agent_mode_respond tool for conversational responses")

		console.log("✅ System prompts instruct modes to use conversation tools")
	})

	it("should have complete tool implementation chain", () => {
		// 1. Check ToolExecutor has both ask cases
		const toolExecutorPath = path.resolve(__dirname, "../../../src/core/task/ToolExecutor.ts")
		const toolContent = fs.readFileSync(toolExecutorPath, "utf8")

		expect(toolContent).toContain('case "agent_mode_respond": {')
		expect(toolContent).toContain('case "chatbot_mode_respond": {')

		// 2. Check ExtensionMessage types include both
		const extensionMessagePath = path.resolve(__dirname, "../../../src/shared/ExtensionMessage.ts")
		const typeContent = fs.readFileSync(extensionMessagePath, "utf8")

		expect(typeContent).toContain('"agent_mode_respond"')
		expect(typeContent).toContain('"chatbot_mode_respond"')

		// 3. Check assistant message index includes both
		const assistantMessagePath = path.resolve(__dirname, "../../../src/core/assistant-message/index.ts")
		const assistantContent = fs.readFileSync(assistantMessagePath, "utf8")

		expect(assistantContent).toContain('"agent_mode_respond"')
		expect(assistantContent).toContain('"chatbot_mode_respond"')

		console.log("✅ Complete tool implementation chain verified")
	})
})
