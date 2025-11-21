import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for setting Caret-specific mode (chatbot/agent)
 */
export async function SetCaretMode(
	controller: Controller,
	request: proto.caret.SetCaretModeRequest,
): Promise<proto.caret.SetCaretModeResponse> {
	try {
		const newMode = request.mode as "chatbot" | "agent"

		// Validate mode
		if (newMode !== "chatbot" && newMode !== "agent") {
			Logger.error(`[SetCaretMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: CaretGlobalManager.currentCaretMode,
				errorMessage: `Invalid mode: ${newMode}. Must be 'chatbot' or 'agent'`,
			}
		}

		Logger.debug(`[SetCaretMode] Changing caret mode from ${CaretGlobalManager.currentCaretMode} to ${newMode}`)

		// Update CaretGlobalManager (in-memory)
		CaretGlobalManager.setCurrentCaretMode(newMode)

		// CARET MODIFICATION: Post updated state to webview
		await controller.postStateToWebview()

		Logger.info(`[SetCaretMode] Successfully changed to ${newMode} mode`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		Logger.error(`[SetCaretMode] Failed to set caret mode: ${error}`)
		return {
			success: false,
			currentMode: CaretGlobalManager.currentCaretMode,
			errorMessage: `Failed to set caret mode: ${error}`,
		}
	}
}
