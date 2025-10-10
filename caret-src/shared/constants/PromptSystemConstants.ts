export const PROMPT_SYSTEMS = {
	CARET: "caret",
	CLINE: "cline",
} as const

export const CARET_MODES = {
	CHATBOT: "chatbot",
	AGENT: "agent",
} as const

export type PromptSystemType = (typeof PROMPT_SYSTEMS)[keyof typeof PROMPT_SYSTEMS]
export type CaretModeType = (typeof CARET_MODES)[keyof typeof CARET_MODES]
