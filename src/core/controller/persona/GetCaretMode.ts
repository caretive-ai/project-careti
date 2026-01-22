import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for getting Careti-specific mode (chatbot/agent)
 */
export async function GetCaretMode(
	_controller: Controller,
	_request: proto.careti.GetCaretModeRequest,
): Promise<proto.careti.GetCaretModeResponse> {
	try {
		const currentMode = CaretiGlobalManager.currentCaretMode
		Logger.debug(`[GetCaretMode] Current careti mode: ${currentMode}`)

		return {
			currentMode,
		}
	} catch (error) {
		Logger.error(`[GetCaretMode] Failed to get careti mode: ${error}`)
		return {
			currentMode: CaretiGlobalManager.currentCaretMode,
		}
	}
}
