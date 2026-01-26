import { CaretiModeManager } from "@careti/core/modes/CaretiModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for setting Careti-specific mode (chatbot/agent)
 * Handles switching between chatbot and agent modes within Careti system
 */
export async function SetCaretMode(
	_controller: Controller,
	request: proto.careti.SetCaretModeRequest,
): Promise<proto.careti.SetCaretModeResponse> {
	try {
		const newMode = request.mode as "chatbot" | "agent"

		// Validate mode
		if (newMode !== "chatbot" && newMode !== "agent") {
			Logger.error(`[SetCaretMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: CaretiModeManager.getCurrentCaretMode(),
				errorMessage: `Invalid mode: ${newMode}. Must be 'chatbot' or 'agent'`,
			}
		}

		const previousMode = CaretiModeManager.getCurrentCaretMode()
		Logger.debug(`[SetCaretMode] Changing Careti mode from ${previousMode} to ${newMode}`)

		// Update CaretiModeManager
		await CaretiModeManager.setCaretMode(newMode)

		Logger.info(`[SetCaretMode] Successfully changed Careti mode: ${previousMode} → ${newMode}`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		Logger.error(`[SetCaretMode] Failed to set Careti mode: ${error}`)
		return {
			success: false,
			currentMode: CaretiModeManager.getCurrentCaretMode(),
			errorMessage: `Failed to set Careti mode: ${error}`,
		}
	}
}
