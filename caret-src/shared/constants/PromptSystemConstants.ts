export const PROMPT_SYSTEMS = {
	CARET: "caret",
	CLINE: "cline",
} as const

export const CARET_MODES = {
	CHATBOT: "chatbot",
	AGENT: "agent",
} as const

// CARET MODIFICATION: F12 - API provider constants for Task tool gating
export const API_PROVIDERS = {
	CLAUDE_CODE: "claude-code",
} as const

export type PromptSystemType = (typeof PROMPT_SYSTEMS)[keyof typeof PROMPT_SYSTEMS]
export type CaretModeType = (typeof CARET_MODES)[keyof typeof CARET_MODES]
export type ApiProviderType = (typeof API_PROVIDERS)[keyof typeof API_PROVIDERS]
