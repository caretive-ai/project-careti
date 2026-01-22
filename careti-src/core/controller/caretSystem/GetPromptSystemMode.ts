import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for getting current prompt system mode
 * Returns the current prompt system mode (careti or cline)
 */
export async function GetPromptSystemMode(
	_controller: Controller,
	_request: proto.careti.GetPromptSystemModeRequest,
): Promise<proto.careti.GetPromptSystemModeResponse> {
	try {
		const currentMode = CaretiGlobalManager.currentMode
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
