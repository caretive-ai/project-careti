import { describe, it, expect } from "vitest"
import * as path from "path"
import * as fs from "fs"

/**
 * TDD Test for agent_mode_respond ask type implementation
 * Validates that agent_mode_respond is implemented like plan_mode_respond for conversations
 */
describe("Agent Mode Respond Implementation", () => {
	const toolExecutorPath = path.resolve(__dirname, "../../../src/core/task/ToolExecutor.ts")

	it("should have agent_mode_respond in tool name mapping", () => {
		const content = fs.readFileSync(toolExecutorPath, "utf8")

		// Verify agent_mode_respond is added to the tool name mapping
		expect(content).toContain('case "agent_mode_respond":')
		expect(content).toContain("return `[${block.name}]`")

		console.log("✅ agent_mode_respond tool name mapping validated")
	})

	it("should have agent_mode_respond case in tool execution", () => {
		const content = fs.readFileSync(toolExecutorPath, "utf8")

		// Verify the agent_mode_respond case exists in the main switch
		expect(content).toContain('case "agent_mode_respond": {')

		// Should follow plan_mode_respond pattern
		expect(content).toContain('await this.ask("agent_mode_respond"')
		expect(content).toContain("this.taskState.isAwaitingPlanResponse = true")

		console.log("✅ agent_mode_respond execution case validated")
	})

	it("should have agent_mode_respond in ExtensionMessage types", () => {
		const extensionMessagePath = path.resolve(__dirname, "../../../src/shared/ExtensionMessage.ts")
		const content = fs.readFileSync(extensionMessagePath, "utf8")

		// Verify agent_mode_respond is added to ClineAskType
		expect(content).toContain('"agent_mode_respond"')

		console.log("✅ agent_mode_respond type definition validated")
	})

	it("should have agent_mode_respond in proto conversions", () => {
		const protoPath = path.resolve(__dirname, "../../../src/shared/proto-conversions/cline-message.ts")
		const content = fs.readFileSync(protoPath, "utf8")

		// Verify agent_mode_respond is added to proto conversions
		expect(content).toContain("agent_mode_respond: ClineAsk.AGENT_MODE_RESPOND")
		expect(content).toContain('[ClineAsk.AGENT_MODE_RESPOND]: "agent_mode_respond"')

		console.log("✅ agent_mode_respond proto conversion validated")
	})

	it("should have agent_mode_respond in assistant message index", () => {
		const assistantMessagePath = path.resolve(__dirname, "../../../src/core/assistant-message/index.ts")
		const content = fs.readFileSync(assistantMessagePath, "utf8")

		// Verify agent_mode_respond is added to tool list
		expect(content).toContain('"agent_mode_respond"')

		console.log("✅ agent_mode_respond assistant message index validated")
	})

	it("should have agent_mode_respond in button configuration", () => {
		const buttonConfigPath = path.resolve(
			__dirname,
			"../../../webview-ui/src/components/chat/chat-view/shared/buttonConfig.ts",
		)
		const content = fs.readFileSync(buttonConfigPath, "utf8")

		// Verify agent_mode_respond button config exists
		expect(content).toContain("agent_mode_respond:")
		expect(content).toContain('case "agent_mode_respond":')

		console.log("✅ Button configuration for agent_mode_respond validated")
	})

	it("should implement agent_mode_respond following plan_mode_respond pattern", () => {
		const content = fs.readFileSync(toolExecutorPath, "utf8")

		// Verify agent_mode_respond follows the same pattern as plan_mode_respond
		if (content.includes('case "agent_mode_respond": {')) {
			// Should have response parameter handling
			expect(content).toContain("const response: string | undefined = block.params.response")

			// Should use ask() for conversation flow
			expect(content).toContain('await this.ask("agent_mode_respond"')

			// Should handle user feedback
			expect(content).toContain('await this.say("user_feedback"')

			console.log("✅ agent_mode_respond implementation pattern validated")
		}
	})
})
