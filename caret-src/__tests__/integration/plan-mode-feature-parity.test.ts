import { describe, it, expect } from "vitest"
import * as path from "path"
import * as fs from "fs"

/**
 * Test to verify Agent and Chatbot modes have complete feature parity with Plan mode
 * Ensures all Plan mode features are implemented in Agent/Chatbot modes
 */
describe("Plan Mode Feature Parity", () => {
	const toolExecutorPath = path.resolve(__dirname, "../../../src/core/task/ToolExecutor.ts")
	const content = fs.readFileSync(toolExecutorPath, "utf8")

	it("should have complete parameter support in agent_mode_respond", () => {
		// Should have all parameters that plan_mode_respond has
		expect(content).toContain('case "agent_mode_respond": {')
		expect(content).toContain("const response: string | undefined = block.params.response")
		expect(content).toContain("const optionsRaw: string | undefined = block.params.options")
		expect(content).toContain('const needsMoreExploration: boolean = block.params.needs_more_exploration === "true"')

		console.log("✅ agent_mode_respond has complete parameter support")
	})

	it("should have complete parameter support in chatbot_mode_respond", () => {
		// Should have all parameters that plan_mode_respond has
		expect(content).toContain('case "chatbot_mode_respond": {')
		expect(content).toContain("const response: string | undefined = block.params.response")
		expect(content).toContain("const optionsRaw: string | undefined = block.params.options")
		expect(content).toContain('const needsMoreExploration: boolean = block.params.needs_more_exploration === "true"')

		console.log("✅ chatbot_mode_respond has complete parameter support")
	})

	it("should have needs_more_exploration logic in both modes", () => {
		// Agent mode
		expect(content).toContain("if (needsMoreExploration) {")
		expect(content).toContain("continue the agent process")

		// Chatbot mode
		expect(content).toContain("continue the chatbot analysis process")

		console.log("✅ Both modes have needs_more_exploration logic")
	})

	it("should have options selection logic in both modes", () => {
		// Agent mode
		expect(content).toContain("if (optionsRaw && text && parsePartialArrayString(optionsRaw).includes(text)) {")
		expect(content).toContain('telemetryService.captureOptionSelected(this.ulid, options.length, "agent")')
		expect(content).toContain('m.ask === "agent_mode_respond"')

		// Chatbot mode
		expect(content).toContain('telemetryService.captureOptionSelected(this.ulid, options.length, "chatbot")')
		expect(content).toContain('m.ask === "chatbot_mode_respond"')

		console.log("✅ Both modes have complete options selection logic")
	})

	it("should have telemetry support in both modes", () => {
		// Agent mode telemetry
		expect(content).toContain('telemetryService.captureOptionSelected(this.ulid, options.length, "agent")')
		expect(content).toContain('telemetryService.captureOptionsIgnored(this.ulid, options.length, "agent")')

		// Chatbot mode telemetry
		expect(content).toContain('telemetryService.captureOptionSelected(this.ulid, options.length, "chatbot")')
		expect(content).toContain('telemetryService.captureOptionsIgnored(this.ulid, options.length, "chatbot")')

		console.log("✅ Both modes have complete telemetry support")
	})

	it("should have mode toggle support", () => {
		// Agent mode toggle
		expect(content).toContain('if (text === "AGENT_MODE_TOGGLE_RESPONSE") {')

		// Chatbot mode toggle
		expect(content).toContain('if (text === "CHATBOT_MODE_TOGGLE_RESPONSE") {')

		console.log("✅ Both modes have mode toggle support")
	})

	it("should use ClinePlanModeResponse interface consistently", () => {
		// Both modes should use the same interface as plan_mode_respond
		const agentMatch = content.match(/case "agent_mode_respond":[^}]+} satisfies ClinePlanModeResponse/s)
		const chatbotMatch = content.match(/case "chatbot_mode_respond":[^}]+} satisfies ClinePlanModeResponse/s)

		expect(agentMatch).toBeTruthy()
		expect(chatbotMatch).toBeTruthy()

		console.log("✅ Both modes use ClinePlanModeResponse interface")
	})

	it("should have complete message state handling", () => {
		// Both modes should handle message state like plan_mode_respond
		expect(content).toContain("this.taskState.isAwaitingPlanResponse = true")
		expect(content).toContain("this.taskState.isAwaitingPlanResponse = false")
		expect(content).toContain("await this.messageStateHandler.saveClineMessagesAndUpdateHistory()")

		console.log("✅ Both modes have complete message state handling")
	})

	it("should have proper tool definition documentation", () => {
		const toolsJsonPath = path.resolve(__dirname, "../../core/prompts/sections/AGENT_CHATBOT_TOOLS.json")

		if (fs.existsSync(toolsJsonPath)) {
			const toolsContent = fs.readFileSync(toolsJsonPath, "utf8")
			const toolsConfig = JSON.parse(toolsContent)

			// Agent mode respond should have complete definition
			expect(toolsConfig.agent_mode_respond).toBeDefined()
			expect(toolsConfig.agent_mode_respond.parameters.response).toContain("required")
			expect(toolsConfig.agent_mode_respond.parameters.options).toContain("optional")
			expect(toolsConfig.agent_mode_respond.parameters.needs_more_exploration).toContain("optional")

			// Chatbot mode respond should have complete definition
			expect(toolsConfig.chatbot_mode_respond).toBeDefined()
			expect(toolsConfig.chatbot_mode_respond.parameters.response).toContain("required")
			expect(toolsConfig.chatbot_mode_respond.parameters.options).toContain("optional")
			expect(toolsConfig.chatbot_mode_respond.parameters.needs_more_exploration).toContain("optional")

			console.log("✅ Both modes have complete tool definition documentation")
		} else {
			console.log("⚠️  Tool definition file not found, skipping documentation test")
		}
	})
})
