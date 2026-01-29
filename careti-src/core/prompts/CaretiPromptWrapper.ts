import { CaretiModeManager } from "@careti/core/modes/CaretiModeManager"
import { PromptSystemManager } from "@careti/core/prompts/system/PromptSystemManager"
import { CaretSystemPromptContext } from "@careti/core/prompts/system/types"
import { CARETI_MODES } from "@careti/shared/constants/PromptSystemConstants"
import { SystemPromptContext } from "@/core/prompts/system-prompt/types"
import { Logger } from "@/services/logging/Logger"

/**
 * CARETI MODIFICATION: Level 1 Independent Prompt Wrapper
 *
 * This wrapper handles Careti-specific prompt generation completely independently
 * from Cline's prompt system, ensuring zero interference with Cline functionality.
 *
 * Architecture Level: L1 (Independent)
 * - No modifications to Cline getSystemPrompt function
 * - Uses CaretiModeManager for independent mode management
 * - Completely isolated prompt generation pipeline
 * - Only called when modeSystem === "careti"
 */
export class CaretiPromptWrapper {
	private static promptManager = new PromptSystemManager()
	private static initialized = false

	/**
	 * Initialize the Careti prompt wrapper
	 */
	static async initialize(): Promise<void> {
		if (CaretiPromptWrapper.initialized) {
			return
		}

		try {
			// CARETI MODIFICATION: JsonTemplateLoader is initialized in common.ts
			// No need to initialize again here
			await CaretiModeManager.initialize()
			CaretiPromptWrapper.initialized = true
			Logger.debug("[CaretiPromptWrapper] Initialized successfully")
		} catch (error) {
			Logger.error(`[CaretiPromptWrapper] Failed to initialize: ${error}`)
			throw error
		}
	}

	/**
	 * Generate Careti system prompt independently from Cline
	 * This function is called instead of Cline's getSystemPrompt when in Careti mode
	 */
	static async getCaretSystemPrompt(context: SystemPromptContext): Promise<string> {
		try {
			// Ensure initialization
			await CaretiPromptWrapper.initialize()

			// Get current Careti mode from independent manager
			const caretMode = CaretiModeManager.getCurrentCaretMode()

			Logger.debug(`[CaretiPromptWrapper] Generating prompt for mode: ${caretMode}`)
			Logger.debug(`[CaretiPromptWrapper] Mode debug info: ${JSON.stringify(CaretiModeManager.getDebugInfo())}`)

			// Convert Careti mode to CARETI_MODES constants
			const caretModeConstant = caretMode === "chatbot" ? CARETI_MODES.CHATBOT : CARETI_MODES.AGENT

			// Create Careti-specific context by extending base SystemPromptContext
			const caretContext: CaretSystemPromptContext = {
				...context,
				modeSystem: "careti", // Always "careti" for this wrapper
				mode: caretModeConstant,
				auto_todo: true, // Enable auto-todo for Careti
				task_progress: undefined, // Can be extended later
				toolSettings: context.toolSettings, // CARETI MODIFICATION: Pass tool settings for image tools
			}

			Logger.debug(
				`[CaretiPromptWrapper] Careti context created: ${JSON.stringify({
					modeSystem: caretContext.modeSystem,
					mode: caretContext.mode,
					providerInfo: caretContext.providerInfo?.providerId || "unknown",
					mcpServers: caretContext.mcpHub?.getServers()?.length || 0,
				})}`,
			)

		// Generate prompt using Careti's independent system
		const startTime = Date.now()
		const prompt = await CaretiPromptWrapper.promptManager.getPrompt(caretContext)
		const endTime = Date.now()

		Logger.info(`[CaretiPromptWrapper] ✅ Prompt generated: ${prompt.length} chars in ${endTime - startTime}ms`)

		return prompt
		} catch (error) {
			Logger.error(`[CaretiPromptWrapper] ❌ Failed to generate Careti prompt: ${error}`)
			throw error
		}
	}

	/**
	 * Check if a tool is allowed in current Careti mode
	 * This provides additional validation layer for tool usage
	 */
	static isToolAllowed(toolName: string): boolean {
		return CaretiModeManager.isToolAllowed(toolName)
	}

	/**
	 * Get current Careti mode for external access
	 */
	static getCurrentMode(): "chatbot" | "agent" {
		return CaretiModeManager.getCurrentCaretMode()
	}

	/**
	 * Get debug information for troubleshooting
	 */
	static getDebugInfo(): Record<string, unknown> {
		return {
			initialized: CaretiPromptWrapper.initialized,
			currentMode: CaretiPromptWrapper.getCurrentMode(),
			modeManagerInfo: CaretiModeManager.getDebugInfo(),
		}
	}

}
