// CARET MODIFICATION: Added uiLanguage field for UI internationalization
export type OpenAIReasoningEffort = "low" | "medium" | "high"

// CARET MODIFICATION: Chatbot/Agent mode terminology alignment - Ask to Chatbot mode change
// CARET MODIFICATION: Mission 2 - Cline/Caret mode terminology integration support
export interface ChatSettings {
	mode: "chatbot" | "agent" | "plan" | "act" // Caret: chatbot/agent, Cline: plan/act
	preferredLanguage?: string // AI response language
	uiLanguage?: string // CARET MODIFICATION: UI display language (Caret specific)
	modeSystem?: string // CARET MODIFICATION: Interface mode system (Caret/Cline)
	openAIReasoningEffort?: OpenAIReasoningEffort
}

export type PartialChatSettings = Partial<ChatSettings>

// CARET MODIFICATION: Chatbot/Agent mode terminology alignment - default mode set to agent
export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
	mode: "agent",
	preferredLanguage: "English",
	uiLanguage: "en", // CARET MODIFICATION: Default UI language is English (follows VSCode settings)
	modeSystem: "caret", // CARET MODIFICATION: Default interface mode system
	openAIReasoningEffort: "medium",
}
