import { SystemPromptContext as ClineSystemPromptContext } from "@/core/prompts/system-prompt/types"
import { CARETI_MODES } from "@careti/shared/constants/PromptSystemConstants"

/**
 * Tool enablement settings for Careti
 */
export interface CaretToolSettings {
	generateImages?: boolean // Enable image generation tool
	analyzeImages?: boolean // Enable image analysis tool (for models that don't support images)
}

/**
 * Extends the base SystemPromptContext with Careti-specific properties.
 */
export interface CaretSystemPromptContext extends ClineSystemPromptContext {
	modeSystem: "careti" // Always "careti" for Careti system
	mode: typeof CARETI_MODES.CHATBOT | typeof CARETI_MODES.AGENT
	auto_todo?: boolean
	task_progress?: string
	toolSettings?: CaretToolSettings // Tool enablement settings
}
