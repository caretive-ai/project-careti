// CARET MODIFICATION: Chatbot Mode Response Handler
import { ClineAsk } from "@shared/ExtensionMessage"
import type { ToolResponse } from "@/core/task"

/**
 * Handler for chatbot_mode_respond ask type
 * Enables approval-based conversation flow in Chatbot mode
 */
export class ChatbotModeRespondHandler {
	readonly name = "chatbot_mode_respond"

	async handlePartialBlock(uiHelpers: any): Promise<void> {
		// Show chatbot mode response UI with approval buttons
		await uiHelpers.ask("chatbot_mode_respond", "Chatbot response ready for approval")
	}

	async execute(block: any): Promise<ToolResponse> {
		return {
			text: "Chatbot mode response approved and executed...",
			images: [],
		}
	}
}
