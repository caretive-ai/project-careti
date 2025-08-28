import type { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import type { Mode } from "@shared/storage/types"
import { MODE_SYSTEMS, STORAGE_KEYS, CARET_MODES } from "@caret-src/shared/constants/ModeSystemConstants"

/**
 * Button action types that determine the behavior
 */
export type ButtonActionType =
	| "approve" // Send yesButtonClicked
	| "reject" // Send noButtonClicked
	| "proceed" // Send messageResponse or yesButtonClicked
	| "new_task" // Start a new task
	| "cancel" // Cancel streaming
	| "utility" // Execute utility function (condense, report_bug)

/**
 * Button configuration for different message states
 */
export interface ButtonConfig {
	sendingDisabled: boolean
	enableButtons: boolean
	primaryText?: string
	secondaryText?: string
	primaryAction?: ButtonActionType
	secondaryAction?: ButtonActionType
}

/**
 * Centralized button state configurations based on task lifecycle
 * This is the single source of truth for both button display and actions
 */
export const BUTTON_CONFIGS: Record<string, ButtonConfig> = {
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

	// Browser and external tool states
	browser_action_launch: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Approve",
		secondaryText: "Reject",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	use_mcp_server: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Approve",
		secondaryText: "Reject",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	followup: {
		sendingDisabled: false,
		enableButtons: false,
		primaryText: "Approve",
		secondaryText: "Reject",
		primaryAction: "new_task",
		secondaryAction: undefined,
	},
	plan_mode_respond: {
		sendingDisabled: false,
		enableButtons: false,
		primaryText: "Approve",
		secondaryText: "Reject",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	chatbot_mode_respond: {
		// CARET MODIFICATION: Add chatbot_mode_respond config
		sendingDisabled: false,
		enableButtons: true, // CARET MODIFICATION: Enable buttons for task continuation
		primaryText: "Proceed",
		secondaryText: "Start New Task",
		primaryAction: "proceed",
		secondaryAction: "new_task",
	},

	// Task lifecycle states
	completion_result: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Start New Task",
		secondaryText: undefined,
		primaryAction: "new_task",
		secondaryAction: undefined,
	},
	resume_task: {
		// CARET MODIFICATION: Enable message sending in resume_task state for agent mode
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Resume Task",
		secondaryText: undefined,
		primaryAction: "proceed",
		secondaryAction: undefined,
	},
	resume_completed_task: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Start New Task",
		secondaryText: undefined,
		primaryAction: "proceed",
		secondaryAction: undefined,
	},
	new_task: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Start New Task with Context",
		secondaryText: undefined,
		primaryAction: "utility",
		secondaryAction: undefined,
	},

	// Utility states
	condense: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Condense Conversation",
		secondaryText: undefined,
		primaryAction: "utility",
		secondaryAction: undefined,
	},
	report_bug: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "Report GitHub issue",
		secondaryText: undefined,
		primaryAction: "utility",
		secondaryAction: undefined,
	},

	// Streaming/partial states - disable interaction during streaming
	partial: {
		sendingDisabled: true,
		enableButtons: true,
		primaryText: undefined,
		secondaryText: "Cancel",
		primaryAction: undefined,
		secondaryAction: "cancel",
	},

	// Agent mode conversation state - allow free messaging after assistant response
	agent_conversation: {
		// CARET MODIFICATION: Allow messaging after assistant response in agent mode
		sendingDisabled: false,
		enableButtons: true, // CARET MODIFICATION: Enable "New Task" button for developer control
		primaryText: undefined,
		secondaryText: "New Task",
		primaryAction: undefined,
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
	api_req_active: {
		sendingDisabled: true,
		enableButtons: true,
		primaryText: undefined,
		secondaryText: "Cancel",
		primaryAction: undefined,
		secondaryAction: "cancel",
	},
}

const errorTypes = ["api_req_failed", "mistake_limit_reached", "auto_approval_max_req_reached"]

/**
 * Determines button configuration based on message type and state
 * This is the single source of truth used by both ActionButtons and useMessageHandlers
 */
export function getButtonConfig(message: ClineMessage | undefined, _mode: Mode = "act"): ButtonConfig {
	// CARET MODIFICATION: Use ButtonConfigFactory for system separation
	const modeSystem = (localStorage.getItem(STORAGE_KEYS.MODE_SYSTEM) as "caret" | "cline") || MODE_SYSTEMS.CLINE

	// CARET MODIFICATION: For Caret system, get the actual agent/chatbot mode from localStorage
	let actualMode = _mode
	if (modeSystem === MODE_SYSTEMS.CARET) {
		const caretMode = (localStorage.getItem(STORAGE_KEYS.CURRENT_MODE) as Mode) || CARET_MODES.AGENT
		actualMode = caretMode
	}

	console.log("[ButtonConfig] Using factory with modeSystem:", modeSystem, "received mode:", _mode, "actual mode:", actualMode)

	if (modeSystem === MODE_SYSTEMS.CARET) {
		// Caret system: Agent mode conversation + chatbot mode approvals
		if (!message) {
			return BUTTON_CONFIGS.default
		}

		const isStreaming = message.partial === true

		// Handle streaming first
		if (isStreaming) {
			return BUTTON_CONFIGS.partial
		}

		// Handle ask messages (user interaction required) - same as Cline
		if (message.type === "ask") {
			switch (message.ask) {
				// Tool approval (most common) - CRITICAL for file write approval
				case "tool": {
					try {
						const tool = JSON.parse(message.text || "{}") as ClineSayTool
						if (tool.tool === "editedExistingFile" || tool.tool === "newFileCreated") {
							console.log("[ButtonConfig] File tool detected - showing Save/Reject buttons")
							return BUTTON_CONFIGS.tool_save
						}
					} catch {
						// Fall through to default tool approval
					}
					console.log("[ButtonConfig] General tool detected - showing Approve/Reject buttons")
					return BUTTON_CONFIGS.tool_approve
				}

				// Command execution
				case "command":
					return BUTTON_CONFIGS.command
				case "command_output":
					return BUTTON_CONFIGS.command_output

				// Browser actions
				case "browser_action_launch":
					return BUTTON_CONFIGS.browser_action_launch

				// Chatbot mode responses - waiting for user approval
				case "chatbot_mode_respond":
					console.log("[ButtonConfig] Chatbot mode respond detected")
					return BUTTON_CONFIGS.chatbot_mode_respond

				// Error states
				case "api_req_failed":
					return BUTTON_CONFIGS.api_req_failed
				case "mistake_limit_reached":
					return BUTTON_CONFIGS.mistake_limit_reached
				case "auto_approval_max_req_reached":
					return BUTTON_CONFIGS.auto_approval_max_req_reached

				// CARET MODIFICATION: Add new_task case for Caret system
				case "new_task":
					return BUTTON_CONFIGS.new_task

				default:
					return BUTTON_CONFIGS.tool_approve
			}
		}

		// CARET MODIFICATION: Handle API request started state (same as Cline)
		if (message.type === "say" && message.say === "api_req_started") {
			return BUTTON_CONFIGS.api_req_active
		}

		// CARET MODIFICATION: Agent mode should behave like Cline Act - no buttons after normal say messages
		// Allow free conversation flow without Cancel buttons after AI responses
		if (actualMode === CARET_MODES.AGENT && message.type === "say" && !isStreaming) {
			console.log("[ButtonConfig] Agent mode say message - enabling free conversation")
			return BUTTON_CONFIGS.default // Free messaging without buttons
		}

		// CARET MODIFICATION: Chatbot mode conversation - allow free messaging
		if (actualMode === CARET_MODES.CHATBOT && message.type === "say" && !isStreaming) {
			console.log("[ButtonConfig] Chatbot mode conversation", { say: message.say })
			return BUTTON_CONFIGS.agent_conversation
		}

		// Default for Caret
		return BUTTON_CONFIGS.default
	} else {
		// Cline system: Original logic preserved
		if (!message) {
			console.log("[ButtonConfig] No message, returning default config")
			return BUTTON_CONFIGS.default
		}

		const isStreaming = message.partial === true
		const isError = message?.ask ? errorTypes.includes(message.ask) : false

		// Handle partial/streaming messages first
		if (isStreaming && !isError) {
			return BUTTON_CONFIGS.partial
		}

		// Handle ask messages (user interaction required)
		if (message.type === "ask") {
			switch (message.ask) {
				// Error recovery states
				case "api_req_failed":
					return BUTTON_CONFIGS.api_req_failed
				case "mistake_limit_reached":
					return BUTTON_CONFIGS.mistake_limit_reached
				case "auto_approval_max_req_reached":
					return BUTTON_CONFIGS.auto_approval_max_req_reached

				// Tool approval (most common)
				case "tool": {
					try {
						const tool = JSON.parse(message.text || "{}") as ClineSayTool
						if (tool.tool === "editedExistingFile" || tool.tool === "newFileCreated") {
							return BUTTON_CONFIGS.tool_save
						}
					} catch {
						// Fall through to default tool approval
					}
					return BUTTON_CONFIGS.tool_approve
				}

				// Command execution
				case "command":
					return BUTTON_CONFIGS.command
				case "command_output":
					return BUTTON_CONFIGS.command_output

				// Standard approvals
				case "followup":
					return BUTTON_CONFIGS.followup
				case "browser_action_launch":
					return BUTTON_CONFIGS.browser_action_launch
				case "use_mcp_server":
					return BUTTON_CONFIGS.use_mcp_server
				case "plan_mode_respond":
					return BUTTON_CONFIGS.plan_mode_respond
				case "chatbot_mode_respond": // CARET MODIFICATION: Keep for compatibility
					console.log("[ButtonConfig] Chatbot mode respond detected (Cline mode)")
					return BUTTON_CONFIGS.chatbot_mode_respond

				// Task lifecycle
				case "completion_result":
					return BUTTON_CONFIGS.completion_result
				case "resume_task":
					return BUTTON_CONFIGS.resume_task
				case "resume_completed_task":
					return BUTTON_CONFIGS.resume_completed_task
				case "new_task":
					return BUTTON_CONFIGS.new_task

				// Utility
				case "condense":
					return BUTTON_CONFIGS.condense
				case "report_bug":
					return BUTTON_CONFIGS.report_bug

				default:
					return BUTTON_CONFIGS.tool_approve
			}
		}

		// Handle say messages
		if (message.type === "say" && message.say === "api_req_started") {
			return BUTTON_CONFIGS.api_req_active
		}

		console.log("[ButtonConfig] No matching case found, returning partial config (Cline mode)")
		return BUTTON_CONFIGS.partial
	}
}
