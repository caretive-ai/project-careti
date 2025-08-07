import { ApiConfiguration } from "./api"
import { BrowserSettings } from "./BrowserSettings"
import { ChatSettings } from "./ChatSettings"
import { UserInfo } from "./UserInfo"
import { ChatContent } from "./ChatContent"
import { TelemetrySetting } from "./TelemetrySetting"
import { McpViewTab } from "./mcp"
import type { PersonaInstruction } from "./persona"

// CARET MODIFICATION: This file has been modified by Caret. Original backed up as WebviewMessage.ts.cline
// Purpose: Added 'log' message type for Caret webview logging system and UPDATE_PERSONA_CUSTOM_INSTRUCTION for persona management.

export interface WebviewMessage {
	type:
		| "requestVsCodeLmModels"
		| "authStateChanged"
		| "fetchMcpMarketplace"
		| "searchCommits"
		| "telemetrySetting"
		| "clearAllTaskHistory"
		| "fetchUserCreditsData"
		| "grpc_request"
		| "grpc_request_cancel"
		| "log"
		| "openExternalLink"
		| "notifyCaretAccount"
		| "UPDATE_PERSONA_CUSTOM_INSTRUCTION"
		| "REQUEST_TEMPLATE_CHARACTERS"
		| "REQUEST_PERSONA_IMAGES"
		| "RESPONSE_TEMPLATE_CHARACTERS"
		| "REQUEST_RULE_FILE_CONTENT"
		| "RESPONSE_RULE_FILE_CONTENT"
		| "UPLOAD_CUSTOM_PERSONA_IMAGE"
		| "UPLOAD_CUSTOM_PERSONA_IMAGE_RESPONSE"
		| "initializeDefaultPersona"
		| "reinitiate_task"
		| "delete_task"
		| "export_task"
		| "toggle_favorite_task"
		| "set_chat_settings"
		| "set_ui_language"
		| "new_task"
		| "execute_task"
		| "cancel_task"
		| "clear_task"
		| "approve_task"
		| "ask_response"
		| "open_file"
		| "open_link"
		| "show_diff"
		| "apply_diff"
		| "add_to_input"
		| "relinquish_control"
		| "start"
		| "setWelcomeContext"

	// For auth
	user?: UserInfo | null
	customToken?: string
	planActSeparateModelsSetting?: boolean
	enableCheckpointsSetting?: boolean
	mcpMarketplaceEnabled?: boolean
	mcpResponsesCollapsed?: boolean
	telemetrySetting?: TelemetrySetting
	mcpRichDisplayEnabled?: boolean
	mentionsRequestId?: string
	query?: string
	// For toggleFavoriteModel
	modelId?: string

	// Cline refactored types
	grpc_request?: GrpcRequest
	grpc_request_cancel?: GrpcCancel

	// For cline rules and workflows
	isGlobal?: boolean
	rulePath?: string
	workflowPath?: string
	enabled?: boolean
	filename?: string

	offset?: number
	shellIntegrationTimeout?: number
	terminalReuseEnabled?: boolean
	defaultTerminalProfile?: string

	// For Caret webview logging
	entry?: any

	// For Caret welcome page actions
	link?: string

	// CARET MODIFICATION: For welcome page context setting
	showWelcome?: boolean

	// CARET MODIFICATION: For persona initialization on language set
	language?: string

	personaInstruction?: PersonaInstruction
	payload?: any // Used for RESPONSE_TEMPLATE_CHARACTERS and potentially others
}

export type GrpcRequest = {
	service: string
	method: string
	message: any // JSON serialized protobuf message
	request_id: string // For correlating requests and responses
	is_streaming: boolean // Whether this is a streaming request
}

export type GrpcCancel = {
	request_id: string // ID of the request to cancel
}

export type ClineAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse"

export type ClineCheckpointRestore = "task" | "workspace" | "taskAndWorkspace"

export type TaskFeedbackType = "thumbs_up" | "thumbs_down"
