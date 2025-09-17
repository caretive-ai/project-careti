import { CaretModeManager } from "@caret/core/modes/CaretModeManager"
import { PromptSystemManager } from "@caret/core/prompts/system/PromptSystemManager"
import { CaretSystemPromptContext } from "@caret/core/prompts/system/types"
import { CARET_MODES } from "@caret/shared/constants/PromptSystemConstants"
import { SystemPromptContext } from "@/core/prompts/system-prompt/types"
import { Logger } from "@/services/logging/Logger"

/**
 * CARET MODIFICATION: Level 1 Independent Prompt Wrapper
 * 
 * This wrapper handles Caret-specific prompt generation completely independently
 * from Cline's prompt system, ensuring zero interference with Cline functionality.
 * 
 * Architecture Level: L1 (Independent)
 * - No modifications to Cline getSystemPrompt function
 * - Uses CaretModeManager for independent mode management
 * - Completely isolated prompt generation pipeline
 * - Only called when modeSystem === "caret"
 */
export class CaretPromptWrapper {
	private static promptManager = new PromptSystemManager()
	private static initialized = false

	/**
	 * Initialize the Caret prompt wrapper
	 */
	static async initialize(): Promise<void> {
		if (this.initialized) return

		try {
			await CaretModeManager.initialize()
			this.initialized = true
			Logger.debug("[CaretPromptWrapper] Initialized successfully")
		} catch (error) {
			Logger.error(`[CaretPromptWrapper] Failed to initialize: ${error}`)
			throw error
		}
	}

	/**
	 * Generate Caret system prompt independently from Cline
	 * This function is called instead of Cline's getSystemPrompt when in Caret mode
	 */
	static async getCaretSystemPrompt(context: SystemPromptContext): Promise<string> {
		try {
			// Ensure initialization
			await this.initialize()

			// Get current Caret mode from independent manager
			const caretMode = CaretModeManager.getCurrentCaretMode()
			
			Logger.debug(`[CaretPromptWrapper] Generating prompt for mode: ${caretMode}`)
			Logger.debug(`[CaretPromptWrapper] Mode debug info: ${JSON.stringify(CaretModeManager.getDebugInfo())}`)

			// Convert Caret mode to CARET_MODES constants
			const caretModeConstant = caretMode === "chatbot" ? CARET_MODES.CHATBOT : CARET_MODES.AGENT

			// Create Caret-specific context by extending base SystemPromptContext
			const caretContext: CaretSystemPromptContext = {
				...context,
				modeSystem: "caret", // Always "caret" for this wrapper
				mode: caretModeConstant,
				auto_todo: true, // Enable auto-todo for Caret
				task_progress: undefined, // Can be extended later
			}

			Logger.debug(`[CaretPromptWrapper] Caret context created: ${JSON.stringify({
				modeSystem: caretContext.modeSystem,
				mode: caretContext.mode,
				providerInfo: caretContext.providerInfo?.providerId || "unknown",
				mcpServers: caretContext.mcpHub?.getServers()?.length || 0,
			})}`)

			// Generate prompt using Caret's independent system
			const startTime = Date.now()
			const prompt = await this.promptManager.getPrompt(caretContext)
			const endTime = Date.now()

			Logger.info(
				`[CaretPromptWrapper] ✅ Prompt generated: ${prompt.length} chars in ${endTime - startTime}ms`
			)

			return prompt
		} catch (error) {
			Logger.error(`[CaretPromptWrapper] ❌ Failed to generate Caret prompt: ${error}`)
			throw error
		}
	}

	/**
	 * Check if a tool is allowed in current Caret mode
	 * This provides additional validation layer for tool usage
	 */
	static isToolAllowed(toolName: string): boolean {
		return CaretModeManager.isToolAllowed(toolName)
	}

	/**
	 * Get current Caret mode for external access
	 */
	static getCurrentMode(): "chatbot" | "agent" {
		return CaretModeManager.getCurrentCaretMode()
	}

	/**
	 * Get debug information for troubleshooting
	 */
	static getDebugInfo(): Record<string, unknown> {
		return {
			initialized: this.initialized,
			currentMode: this.getCurrentMode(),
			modeManagerInfo: CaretModeManager.getDebugInfo(),
		}
	}
}