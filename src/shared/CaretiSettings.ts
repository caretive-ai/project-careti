// CARETI MODIFICATION: Import from storage/types for consistency
import { OpenaiReasoningEffort } from "./storage/types"
export type OpenAIReasoningEffort = OpenaiReasoningEffort

export interface CaretSettings {
	mode: "chatbot" | "agent" | "plan" | "act" // Careti: chatbot/agent, Cline: plan/act
	preferredLanguage?: string // AI와의 대화 언어
	uiLanguage?: string // UI 표시 언어 (Careti 전용)
	modeSystem?: string // Interface mode system (Careti/Cline)
	openAIReasoningEffort?: OpenAIReasoningEffort
}

export type PartialCaretSettings = Partial<CaretSettings>

export const DEFAULT_CARET_SETTINGS: CaretSettings = {
	mode: "agent",
	preferredLanguage: "English",
	uiLanguage: "en", // 기본 UI 언어는 영어 (VSCode 설정 따라감)
	modeSystem: "careti", // Default interface mode system
	openAIReasoningEffort: "medium",
}
