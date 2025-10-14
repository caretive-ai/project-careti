import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: gRPC handler for setting prompt system mode
 * Handles switching between caret and cline prompt systems
 */
export async function SetPromptSystemMode(
	controller: Controller,
	request: proto.caret.SetPromptSystemModeRequest,
): Promise<proto.caret.SetPromptSystemModeResponse> {
	try {
		const newMode = request.mode as "caret" | "cline"

		// Validate mode
		if (newMode !== "caret" && newMode !== "cline") {
			Logger.error(`[SetPromptSystemMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: CaretGlobalManager.currentMode,
				errorMessage: `Invalid mode: ${newMode}. Must be 'caret' or 'cline'`,
			}
		}

		Logger.debug(`[SetPromptSystemMode] Changing mode from ${CaretGlobalManager.currentMode} to ${newMode}`)

		// Update CaretGlobalManager (in-memory)
		CaretGlobalManager.get().setCurrentMode(newMode)
		Logger.debug(
			`[SetPromptSystemMode] After setCurrentMode: CaretGlobalManager.currentMode=${CaretGlobalManager.currentMode}`,
		)

		// CARET MODIFICATION: Persist to globalState (StateManager reads from here on restart)
		controller.stateManager.setGlobalStateBatch({
			caretModeSystem: newMode,
		})
		Logger.debug(`[SetPromptSystemMode] Saved to globalState: caretModeSystem=${newMode}`)

		// CARET MODIFICATION: Post updated state to webview
		Logger.debug(`[SetPromptSystemMode] Before postStateToWebview`)
		await controller.postStateToWebview()
		Logger.debug(`[SetPromptSystemMode] After postStateToWebview`)

		Logger.info(`[SetPromptSystemMode] Successfully changed to ${newMode} mode`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		Logger.error(`[SetPromptSystemMode] Failed to set mode: ${error}`)
		return {
			success: false,
			currentMode: CaretGlobalManager.currentMode,
			errorMessage: `Failed to set mode: ${error}`,
		}
	}
}
