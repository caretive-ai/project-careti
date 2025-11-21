import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for getting Caret-specific mode (chatbot/agent)
 */
export async function GetCaretMode(
	_controller: Controller,
	_request: proto.caret.GetCaretModeRequest,
): Promise<proto.caret.GetCaretModeResponse> {
	try {
		const currentMode = CaretGlobalManager.currentCaretMode
		Logger.debug(`[GetCaretMode] Current caret mode: ${currentMode}`)

		return {
			currentMode,
		}
	} catch (error) {
		Logger.error(`[GetCaretMode] Failed to get caret mode: ${error}`)
		return {
			currentMode: CaretGlobalManager.currentCaretMode,
		}
	}
}
