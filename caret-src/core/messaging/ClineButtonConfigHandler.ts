import type { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import type { Mode } from "@shared/storage/types"
import type { ButtonConfig } from "./ButtonConfigFactory"

/**
 * Pure Cline button configuration handler - preserves original logic completely
 * This ensures existing Cline users experience no changes
 */
export class ClineButtonConfigHandler {
	private static readonly BUTTON_CONFIGS = {
		// Error recovery states - user must take action
		api_req_failed: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Retry",
			secondaryText: "Start New Task",
			primaryAction: "approve",
			secondaryAction: "new_task",
		},
		mistake_limit_reached: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Proceed Anyways",
			secondaryText: "Start New Task",
			primaryAction: "proceed",
			secondaryAction: "new_task",
		},
		auto_approval_max_req_reached: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Proceed",
			secondaryText: "Start New Task",
			primaryAction: "proceed",
			secondaryAction: "new_task",
		},

		// Tool approval states - most common during task execution
		tool_approve: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Approve",
			secondaryText: "Reject",
			primaryAction: "approve",
			secondaryAction: "reject",
		},
		tool_save: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Save",
			secondaryText: "Reject",
			primaryAction: "approve",
			secondaryAction: "reject",
		},

		// Command execution states
		command: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Run Command",
			secondaryText: "Reject",
			primaryAction: "approve",
			secondaryAction: "reject",
		},
		command_output: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Proceed While Running",
			secondaryText: undefined,
			primaryAction: "proceed",
			secondaryAction: undefined,
		},

		// Plan mode response
		plan_mode_respond: {
			sendingDisabled: false,
			enableButtons: true,
			primaryText: "Proceed",
			secondaryText: "Start New Task",
			primaryAction: "proceed",
			secondaryAction: "new_task",
		},

		// Default states
		default: {
			sendingDisabled: false,
			enableButtons: false,
			primaryText: undefined,
			secondaryText: undefined,
			primaryAction: undefined,
			secondaryAction: undefined,
		},
		partial: {
			sendingDisabled: true,
			enableButtons: true,
			primaryText: undefined,
			secondaryText: "Cancel",
			primaryAction: undefined,
			secondaryAction: "cancel",
		},
		api_req_active: {
			sendingDisabled: true,
			enableButtons: true,
			primaryText: undefined,
			secondaryText: "Cancel",
			primaryAction: undefined,
			secondaryAction: "cancel",
		},
	}

	private static readonly errorTypes = ["api_req_failed", "mistake_limit_reached", "auto_approval_max_req_reached"]

	/**
	 * Get button configuration for Cline system - preserves all original logic
	 */
	static getConfig(message: ClineMessage | undefined, mode: Mode): ButtonConfig {
		if (!message) {
			return this.BUTTON_CONFIGS.default
		}

		const isStreaming = message.partial === true
		const isError = message?.ask ? this.errorTypes.includes(message.ask) : false

		// Handle partial/streaming messages first
		if (isStreaming && !isError) {
			return this.BUTTON_CONFIGS.partial
		}

		// Handle ask messages (user interaction required)
		if (message.type === "ask") {
			switch (message.ask) {
				// Error recovery states
				case "api_req_failed":
					return this.BUTTON_CONFIGS.api_req_failed
				case "mistake_limit_reached":
					return this.BUTTON_CONFIGS.mistake_limit_reached
				case "auto_approval_max_req_reached":
					return this.BUTTON_CONFIGS.auto_approval_max_req_reached

				// Tool approval (most common)
				case "tool": {
					try {
						const tool = JSON.parse(message.text || "{}") as ClineSayTool
						if (tool.tool === "editedExistingFile" || tool.tool === "newFileCreated") {
							return this.BUTTON_CONFIGS.tool_save
						}
					} catch {
						// Fall through to default tool approval
					}
					return this.BUTTON_CONFIGS.tool_approve
				}

				// Command execution
				case "command":
					return this.BUTTON_CONFIGS.command
				case "command_output":
					return this.BUTTON_CONFIGS.command_output

				// Plan mode
				case "plan_mode_respond":
					return this.BUTTON_CONFIGS.plan_mode_respond

				default:
					return this.BUTTON_CONFIGS.tool_approve
			}
		}

		// Handle say messages
		if (message.type === "say" && message.say === "api_req_started") {
			return this.BUTTON_CONFIGS.api_req_active
		}

		return this.BUTTON_CONFIGS.partial
	}
}
