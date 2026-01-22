import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for getting prompt system mode
 * Returns the current mode (careti or cline)
 */
export async function GetPromptSystemMode(
	_controller: Controller,
	_request: proto.careti.GetPromptSystemModeRequest,
): Promise<proto.careti.GetPromptSystemModeResponse> {
	try {
		const currentMode = CaretiGlobalManager.currentMode
		Logger.debug(`[GetPromptSystemMode] Current mode: ${currentMode}`)

		return {
			currentMode,
		}
	} catch (error) {
		Logger.error(`[GetPromptSystemMode] Failed to get mode: ${error}`)
		return {
			currentMode: CaretiGlobalManager.currentMode,
		}
	}
}
