import { CaretModeManager } from "@caret/core/modes/CaretModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for setting Caret-specific mode (chatbot/agent)
 * Handles switching between chatbot and agent modes within Caret system
 */
export async function SetCaretMode(
	_controller: Controller,
	request: proto.caret.SetCaretModeRequest,
): Promise<proto.caret.SetCaretModeResponse> {
	try {
		const newMode = request.mode as "chatbot" | "agent"

		// Validate mode
		if (newMode !== "chatbot" && newMode !== "agent") {
			Logger.error(`[SetCaretMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: CaretModeManager.getCurrentCaretMode(),
				errorMessage: `Invalid mode: ${newMode}. Must be 'chatbot' or 'agent'`,
			}
		}

		const previousMode = CaretModeManager.getCurrentCaretMode()
		Logger.debug(`[SetCaretMode] Changing Caret mode from ${previousMode} to ${newMode}`)

		// Update CaretModeManager
		await CaretModeManager.setCaretMode(newMode)

		Logger.info(`[SetCaretMode] Successfully changed Caret mode: ${previousMode} → ${newMode}`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		Logger.error(`[SetCaretMode] Failed to set Caret mode: ${error}`)
		return {
			success: false,
			currentMode: CaretModeManager.getCurrentCaretMode(),
			errorMessage: `Failed to set Caret mode: ${error}`,
		}
	}
}
