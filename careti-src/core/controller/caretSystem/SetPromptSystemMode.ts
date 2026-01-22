import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARETI MODIFICATION: gRPC handler for setting prompt system mode
 * Handles switching between careti and cline prompt systems
 */
export async function SetPromptSystemMode(
	controller: Controller,
	request: proto.careti.SetPromptSystemModeRequest,
): Promise<proto.careti.SetPromptSystemModeResponse> {
	try {
		const newMode = request.mode as "careti" | "cline"

		// Validate mode
		if (newMode !== "careti" && newMode !== "cline") {
			Logger.error(`[SetPromptSystemMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: CaretiGlobalManager.currentMode,
				errorMessage: `Invalid mode: ${newMode}. Must be 'careti' or 'cline'`,
			}
		}

		Logger.debug(`[SetPromptSystemMode] Changing mode from ${CaretiGlobalManager.currentMode} to ${newMode}`)

		// Update CaretiGlobalManager (in-memory)
		CaretiGlobalManager.get().setCurrentMode(newMode)
		Logger.debug(
			`[SetPromptSystemMode] After setCurrentMode: CaretiGlobalManager.currentMode=${CaretiGlobalManager.currentMode}`,
		)

		// CARETI MODIFICATION: Persist to globalState (StateManager reads from here on restart)
		controller.stateManager.setGlobalStateBatch({
			caretModeSystem: newMode,
		})
		Logger.debug(`[SetPromptSystemMode] Saved to globalState: caretModeSystem=${newMode}`)

		// CARETI MODIFICATION: Post updated state to webview
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
			currentMode: CaretiGlobalManager.currentMode,
			errorMessage: `Failed to set mode: ${error}`,
		}
	}
}
