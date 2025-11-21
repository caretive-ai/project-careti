import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for getting prompt system mode
 * Returns the current mode (caret or cline)
 */
export async function GetPromptSystemMode(
	_controller: Controller,
	_request: proto.caret.GetPromptSystemModeRequest,
): Promise<proto.caret.GetPromptSystemModeResponse> {
	try {
		const currentMode = CaretGlobalManager.currentMode
		Logger.debug(`[GetPromptSystemMode] Current mode: ${currentMode}`)

		return {
			currentMode,
		}
	} catch (error) {
		Logger.error(`[GetPromptSystemMode] Failed to get mode: ${error}`)
		return {
			currentMode: CaretGlobalManager.currentMode,
		}
	}
}
