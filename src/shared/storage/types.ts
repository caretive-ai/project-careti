export type OpenaiReasoningEffort = "low" | "medium" | "high"

// CARET MODIFICATION: Add chatbot and agent modes
export type ChatMode = "chatbot" | "agent"
export type Mode = "plan" | "act" | ChatMode

// CARET MODIFICATION: Merged from upstream and added uiLanguage and mode
export interface ChatSettings {
	preferredLanguage: string
	openaiReasoningEffort: OpenaiReasoningEffort
	uiLanguage: string
	mode: ChatMode
}

// CARET MODIFICATION: Merged from upstream
export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
	preferredLanguage: "English",
	openaiReasoningEffort: "medium",
	uiLanguage: "en",
	mode: "agent",
}
