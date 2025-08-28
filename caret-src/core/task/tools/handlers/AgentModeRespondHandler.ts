// CARET MODIFICATION: Agent Mode Response Handler
import { ClineAsk } from "@shared/ExtensionMessage"
import type { ToolResponse } from "@/core/task"

/**
 * Handler for agent_mode_respond ask type
 * Enables continuous conversation flow in Agent mode
 */
export class AgentModeRespondHandler {
	readonly name = "agent_mode_respond"

	async handlePartialBlock(uiHelpers: any): Promise<void> {
		// Show agent mode response UI
		await uiHelpers.ask("agent_mode_respond", "Agent is thinking...")
	}

	async execute(block: any): Promise<ToolResponse> {
		return [
			{
				type: "text",
				text: "Agent mode conversation continues...",
			},
		]
	}
}
