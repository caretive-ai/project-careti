import type { ToolUse } from "@core/assistant-message"
import { PlanModeRespondHandler } from "@core/task/tools/handlers/PlanModeRespondHandler"
import type { ToolResponse } from "@core/task"
import type { TaskConfig } from "@core/task/tools/types/TaskConfig"

/**
 * Handler for Agent mode responses - extends PlanModeRespondHandler for natural conversation flow
 * Based on v3.26.6 Handler architecture
 */
export class AgentModeRespondHandler extends PlanModeRespondHandler {
	readonly name = "agent_mode_respond"

	constructor() {
		super()
	}

	getDescription(block: ToolUse): string {
		return `[${block.name}] Agent mode response`
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		// Agent mode specific logic:
		// - All tools available (no restrictions)
		// - Natural conversation flow like Plan mode
		// - No buttons by default (continuous conversation)
		
		// Use parent PlanModeRespondHandler execution
		const result = await super.execute(config, block)
		
		// Agent mode customizations could be added here
		// For now, we use the same behavior as Plan mode
		
		return result
	}
}