import type { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import type { Mode } from "@shared/storage/types"
import type { ButtonConfig } from "./ButtonConfigFactory"

/**
 * CARET MODIFICATION: Pure Caret button configuration handler
 * Handles agent mode conversation flow and chatbot mode approvals
 */
export class CaretButtonConfigHandler {
	private static readonly BUTTON_CONFIGS = {
		// Agent mode conversation - allow free messaging after assistant response
		agent_conversation: {
			sendingDisabled: false,
			enableButtons: false,
			primaryText: undefined,
			secondaryText: undefined,
			primaryAction: undefined,
			secondaryAction: undefined,
		},

		// Chatbot mode response - free conversation like agent mode
		chatbot_mode_respond: {
			sendingDisabled: false,
			enableButtons: false,
			primaryText: undefined,
			secondaryText: undefined,
			primaryAction: undefined,
			secondaryAction: undefined,
		},

		// Default state for Caret system
		default: {
			sendingDisabled: false,
			enableButtons: false,
			primaryText: undefined,
			secondaryText: undefined,
			primaryAction: undefined,
			secondaryAction: undefined,
		},

		// Streaming state
		partial: {
			sendingDisabled: true,
			enableButtons: true,
			primaryText: undefined,
			secondaryText: "Cancel",
			primaryAction: undefined,
			secondaryAction: "cancel",
		},

		// New task state
		new_task: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Start New Task with Context",
			secondaryText: undefined,
			primaryAction: "utility",
			secondaryAction: undefined,
		},
	}

	/**
	 * Get button configuration for Caret system
	 * Features:
	 * - Agent mode: Free conversation after assistant response
	 * - Chatbot mode: Approval workflow similar to plan mode
	 */
	static getConfig(message: ClineMessage | undefined, mode: Mode): ButtonConfig {
		console.log("[CaretButtonConfig] Getting config for message:", message?.type, "mode:", mode)

		if (!message) {
			return this.BUTTON_CONFIGS.default
		}

		const isStreaming = message.partial === true

		// Handle streaming first
		if (isStreaming) {
			return this.BUTTON_CONFIGS.partial
		}

		// Handle ask messages
		if (message.type === "ask") {
			switch (message.ask) {
				case "chatbot_mode_respond":
					console.log("[CaretButtonConfig] Chatbot mode respond detected")
					return this.BUTTON_CONFIGS.chatbot_mode_respond
				case "new_task":
					console.log("[CaretButtonConfig] New task detected")
					return this.BUTTON_CONFIGS.new_task
				case "completion_result":
					// Agent mode: Auto-accept completion, no buttons needed
					if (mode === "act") {
						console.log("[CaretButtonConfig] Agent mode completion - no buttons needed")
						return this.BUTTON_CONFIGS.agent_conversation
					}
					// Chatbot mode: Show completion with buttons (fallback to default)
					console.log("[CaretButtonConfig] Chatbot mode completion - showing buttons")
					return this.BUTTON_CONFIGS.default
			}
		}

		// Handle agent mode conversation (say messages)
		if (message.type === "say" && message.say === "text" && mode === "act") {
			console.log("[CaretButtonConfig] Agent mode text response detected, enabling conversation")
			return this.BUTTON_CONFIGS.agent_conversation
		}

		// Default to allowing conversation
		return this.BUTTON_CONFIGS.default
	}
}
