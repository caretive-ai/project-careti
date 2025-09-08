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

		// Update CaretGlobalManager
		CaretGlobalManager.get().setCurrentMode(newMode)

		// Persist to workspace state
		await controller.context.workspaceState.update("caret.promptSystem.mode", newMode)

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
