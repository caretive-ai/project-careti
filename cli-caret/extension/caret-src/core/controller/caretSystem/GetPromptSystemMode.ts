import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for getting current prompt system mode
 * Returns the current prompt system mode (caret or cline)
 */
export async function GetPromptSystemMode(
	_controller: Controller,
	_request: proto.caret.GetPromptSystemModeRequest,
): Promise<proto.caret.GetPromptSystemModeResponse> {
	try {
		const currentMode = CaretGlobalManager.currentMode
		Logger.debug(`[GetPromptSystemMode] Current mode: ${currentMode}`)

		return {
			currentMode: currentMode,
		}
	} catch (error) {
		Logger.error(`[GetPromptSystemMode] Failed to get mode: ${error}`)
		// Return default mode on error
		return {
			currentMode: "cline",
		}
	}
}
