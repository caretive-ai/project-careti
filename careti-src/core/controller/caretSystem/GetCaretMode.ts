import { CaretModeManager } from "@careti/core/modes/CaretModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for getting current Careti-specific mode
 * Returns the current Careti mode (chatbot or agent)
 */
export async function GetCaretMode(
	_controller: Controller,
	_request: proto.careti.GetCaretModeRequest,
): Promise<proto.careti.GetCaretModeResponse> {
	try {
		const currentMode = CaretModeManager.getCurrentCaretMode()
		Logger.debug(`[GetCaretMode] Current Careti mode: ${currentMode}`)

		return {
			currentMode: currentMode,
		}
	} catch (error) {
		Logger.error(`[GetCaretMode] Failed to get Careti mode: ${error}`)
		// Return default mode on error
		return {
			currentMode: "chatbot",
		}
	}
}
