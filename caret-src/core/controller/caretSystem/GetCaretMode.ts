import { CaretModeManager } from "@caret/core/modes/CaretModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for getting current Caret-specific mode
 * Returns the current Caret mode (chatbot or agent)
 */
export async function GetCaretMode(
	_controller: Controller,
	_request: proto.caret.GetCaretModeRequest,
): Promise<proto.caret.GetCaretModeResponse> {
	try {
		const currentMode = CaretModeManager.getCurrentCaretMode()
		Logger.debug(`[GetCaretMode] Current Caret mode: ${currentMode}`)

		return {
			currentMode: currentMode,
		}
	} catch (error) {
		Logger.error(`[GetCaretMode] Failed to get Caret mode: ${error}`)
		// Return default mode on error
		return {
			currentMode: "chatbot",
		}
	}
}
