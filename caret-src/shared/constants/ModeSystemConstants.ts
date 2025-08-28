// CARET MODIFICATION: Centralized constants for mode system strings
// Prevents typos and provides single source of truth for all mode-related strings
// IMPORTANT: These constants are used ONLY in Caret code - DO NOT modify Cline files

export const MODE_SYSTEMS = {
	CARET: "caret" as const,
	CLINE: "cline" as const,
} as const

export const CARET_MODES = {
	CHATBOT: "chatbot",
	AGENT: "agent",
} as const

export const CLINE_MODES = {
	PLAN: "plan",
	ACT: "act",
} as const

export const STORAGE_KEYS = {
	MODE_SYSTEM: "caret.modeSystem",
	CURRENT_MODE: "caret.currentMode",
	PERSONA_PROFILE: "caret.personaProfile",
} as const

export const SETTING_KEYS = {
	MODE_SYSTEM: "modeSystem",
	MODE: "mode",
} as const

// Type definitions from constants
export type ModeSystem = (typeof MODE_SYSTEMS)[keyof typeof MODE_SYSTEMS]
export type CaretMode = (typeof CARET_MODES)[keyof typeof CARET_MODES]
export type ClineMode = (typeof CLINE_MODES)[keyof typeof CLINE_MODES]
export type Mode = CaretMode | ClineMode

// Mode mappings for adapter pattern
export const MODE_MAPPINGS = {
	// Caret to Cline backend mapping
	CARET_TO_BACKEND: {
		[CARET_MODES.CHATBOT]: CLINE_MODES.PLAN,
		[CARET_MODES.AGENT]: CLINE_MODES.ACT,
	},
	// Backend to Caret UI mapping
	BACKEND_TO_CARET: {
		[CLINE_MODES.PLAN]: CARET_MODES.CHATBOT,
		[CLINE_MODES.ACT]: CARET_MODES.AGENT,
	},
} as const

// System prompt constants
export const SYSTEM_PROMPTS = {
	CARET: {
		[CARET_MODES.CHATBOT]: "CHATBOT MODE",
		[CARET_MODES.AGENT]: "AGENT MODE",
	},
	CLINE: {
		[CLINE_MODES.PLAN]: "PLANNING MODE",
		[CLINE_MODES.ACT]: "ACTION MODE",
	},
} as const

// UI display names
export const MODE_DISPLAY_NAMES = {
	[MODE_SYSTEMS.CARET]: "Caret",
	[MODE_SYSTEMS.CLINE]: "Cline",
	[CARET_MODES.CHATBOT]: "Chatbot",
	[CARET_MODES.AGENT]: "Agent",
	[CLINE_MODES.PLAN]: "Plan",
	[CLINE_MODES.ACT]: "Act",
} as const

// Validation helpers
export const isValidModeSystem = (value: string): value is ModeSystem => {
	return Object.values(MODE_SYSTEMS).includes(value as ModeSystem)
}

export const isValidCaretMode = (value: string): value is CaretMode => {
	return Object.values(CARET_MODES).includes(value as CaretMode)
}

export const isValidClineMode = (value: string): value is ClineMode => {
	return Object.values(CLINE_MODES).includes(value as ClineMode)
}

// Tool restriction constants
export const RESTRICTED_TOOLS = {
	CHATBOT_BLOCKED: ["write_to_file", "replace_in_file", "execute_command"] as const,
	AGENT_ALLOWED: "*" as const,
} as const

// Error messages
export const ERROR_MESSAGES = {
	CHATBOT_TOOL_RESTRICTED: "파일 수정과 명령 실행은 Agent 모드에서만 가능합니다. 현재는 안전한 Chatbot 모드입니다.",
	GENERIC_TOOL_RESTRICTED: (toolName: string, mode: string) =>
		`Tool '${toolName}' is not available in ${mode.toUpperCase()} MODE.`,
} as const

// Additional type definitions
export type RestrictedTool = (typeof RESTRICTED_TOOLS.CHATBOT_BLOCKED)[number]
