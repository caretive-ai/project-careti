import { CaretModeManager } from "@caret/core/modes/CaretModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: Level 1 Independent gRPC handler for Caret-specific mode
 * Uses CaretModeManager for complete independence from Cline core systems
 * 
 * Architecture Level: L1 (Independent)
 * - No interaction with Cline StateManager
 * - Uses Caret-specific workspace configuration
 * - Zero impact on Cline plan/act mode system
 */
export async function SetCaretMode(
	controller: Controller,
	request: proto.caret.SetCaretModeRequest,
): Promise<proto.caret.SetCaretModeResponse> {
	try {
		const newMode = request.mode as "chatbot" | "agent"

		// Validate mode
		if (newMode !== "chatbot" && newMode !== "agent") {
			Logger.error(`[SetCaretMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: "chatbot", // default fallback
				errorMessage: `Invalid mode: ${newMode}. Must be 'chatbot' or 'agent'`,
			}
		}

		// Get current mode from Caret independent manager
		const currentCaretMode = CaretModeManager.getCurrentCaretMode()

		Logger.debug(`[SetCaretMode] Changing Caret mode from ${currentCaretMode} to ${newMode}`)

		// Update Caret mode using independent manager (no Cline interference)
		await CaretModeManager.setCaretMode(newMode)

		Logger.info(`[SetCaretMode] Successfully changed to ${newMode} mode via CaretModeManager`)
		Logger.debug(`[SetCaretMode] Debug info: ${JSON.stringify(CaretModeManager.getDebugInfo())}`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		Logger.error(`[SetCaretMode] Failed to set Caret mode: ${error}`)
		return {
			success: false,
			currentMode: "chatbot", // default fallback
			errorMessage: `Failed to set Caret mode: ${error}`,
		}
	}
}
