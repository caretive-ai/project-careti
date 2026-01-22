import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for setting Careti-specific mode (chatbot/agent)
 */
export async function SetCaretMode(
	controller: Controller,
	request: proto.careti.SetCaretModeRequest,
): Promise<proto.careti.SetCaretModeResponse> {
	try {
		const newMode = request.mode as "chatbot" | "agent"

		// Validate mode
		if (newMode !== "chatbot" && newMode !== "agent") {
			Logger.error(`[SetCaretMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: CaretiGlobalManager.currentCaretMode,
				errorMessage: `Invalid mode: ${newMode}. Must be 'chatbot' or 'agent'`,
			}
		}

		Logger.debug(`[SetCaretMode] Changing careti mode from ${CaretiGlobalManager.currentCaretMode} to ${newMode}`)

		// Update CaretiGlobalManager (in-memory)
		CaretiGlobalManager.setCurrentCaretMode(newMode)

		// CARETI MODIFICATION: Post updated state to webview
		await controller.postStateToWebview()

		Logger.info(`[SetCaretMode] Successfully changed to ${newMode} mode`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		Logger.error(`[SetCaretMode] Failed to set careti mode: ${error}`)
		return {
			success: false,
			currentMode: CaretiGlobalManager.currentCaretMode,
			errorMessage: `Failed to set careti mode: ${error}`,
		}
	}
}
