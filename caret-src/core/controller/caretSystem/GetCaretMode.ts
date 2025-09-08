import { CaretModeManager } from "@caret/core/modes/CaretModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: Level 1 Independent gRPC handler for getting Caret-specific mode
 * Uses CaretModeManager for complete independence from Cline core systems
 * 
 * Architecture Level: L1 (Independent)
 * - No interaction with Cline StateManager
 * - Uses Caret-specific workspace configuration
 * - Zero impact on Cline plan/act mode system
 */
export async function GetCaretMode(
	controller: Controller,
	request: proto.caret.GetCaretModeRequest,
): Promise<proto.caret.GetCaretModeResponse> {
	try {
		// Get current mode from Caret independent manager
		const caretMode = CaretModeManager.getCurrentCaretMode()

		Logger.debug(`[GetCaretMode] Returning Caret mode: ${caretMode} (independent from Cline)`)
		Logger.debug(`[GetCaretMode] Debug info: ${JSON.stringify(CaretModeManager.getDebugInfo())}`)

		return {
			currentMode: caretMode,
		}
	} catch (error) {
		Logger.error(`[GetCaretMode] Failed to get Caret mode: ${error}`)
		return {
			currentMode: "chatbot", // default fallback
		}
	}
}
