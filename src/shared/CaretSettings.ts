// CARET MODIFICATION: Import from storage/types for consistency
import { OpenaiReasoningEffort } from "./storage/types"
export type OpenAIReasoningEffort = OpenaiReasoningEffort

export interface CaretSettings {
	mode: "chatbot" | "agent" | "plan" | "act" // Caret: chatbot/agent, Cline: plan/act
	preferredLanguage?: string // AI와의 대화 언어
	uiLanguage?: string // UI 표시 언어 (Caret 전용)
	modeSystem?: string // Interface mode system (Caret/Cline)
	openAIReasoningEffort?: OpenAIReasoningEffort
}

export type PartialCaretSettings = Partial<CaretSettings>

export const DEFAULT_CARET_SETTINGS: CaretSettings = {
	mode: "agent",
	preferredLanguage: "English",
	uiLanguage: "en", // 기본 UI 언어는 영어 (VSCode 설정 따라감)
	modeSystem: "caret", // Default interface mode system
	openAIReasoningEffort: "medium",
}
