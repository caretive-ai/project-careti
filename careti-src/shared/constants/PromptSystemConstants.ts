export const PROMPT_SYSTEMS = {
	CARET: "careti",
	CLINE: "cline",
} as const

export const CARETI_MODES = {
	CHATBOT: "chatbot",
	AGENT: "agent",
} as const

// CARETI MODIFICATION: F12 - API provider constants for Task tool gating
export const API_PROVIDERS = {
	CLAUDE_CODE: "claude-code",
} as const

export type PromptSystemType = (typeof PROMPT_SYSTEMS)[keyof typeof PROMPT_SYSTEMS]
export type CaretiModeType = (typeof CARETI_MODES)[keyof typeof CARETI_MODES]
export type ApiProviderType = (typeof API_PROVIDERS)[keyof typeof API_PROVIDERS]
