import type { ToolUse } from "@core/assistant-message"
import { PlanModeRespondHandler } from "@core/task/tools/handlers/PlanModeRespondHandler"
import type { ToolResponse } from "@core/task"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"

/**
 * Handler for Chatbot mode responses - extends PlanModeRespondHandler with safety restrictions
 * Based on v3.26.6 Handler architecture
 */
export class ChatbotModeRespondHandler extends PlanModeRespondHandler {
	readonly name = "chatbot_mode_respond"

	constructor() {
		super()
	}

	getDescription(block: ToolUse): string {
		return `[${block.name}] Chatbot mode response`
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		// Chatbot mode specific logic:
		// - Limited tools (safe consultation only)
		// - Structured conversation flow
		// - May require approval for certain actions
		
		// Use parent PlanModeRespondHandler execution
		const result = await super.execute(config, block)
		
		// Chatbot mode customizations:
		// - Could restrict certain tool usage
		// - Could add approval workflows
		// For now, we use the same behavior as Plan mode
		
		return result
	}
}