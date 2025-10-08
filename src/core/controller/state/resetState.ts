import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { PersonaInitializer, resetPersonaData } from "@caret/services/persona/persona-initializer"
import { PersonaService } from "@caret/services/persona/persona-service"
import { PersonaStorage } from "@caret/services/persona/persona-storage"
import { Empty } from "@shared/proto/cline/common"
import { ResetStateRequest } from "@shared/proto/cline/state"
import { resetGlobalState, resetWorkspaceState } from "@/core/storage/utils/state-helpers"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"
import { ShowMessageType } from "@/shared/proto/host/window"
import { Controller } from ".."
import { sendChatButtonClickedEvent } from "../ui/subscribeToChatButtonClicked"

/**
 * Resets the extension state to its defaults
 * @param controller The controller instance
 * @param request The reset state request containing the global flag
 * @returns An empty response
 */
export async function resetState(controller: Controller, request: ResetStateRequest): Promise<Empty> {
	try {
		if (request.global) {
			HostProvider.window.showMessage({
				type: ShowMessageType.INFORMATION,
				message: "Resetting global state...",
			})
			await resetGlobalState(controller)
		} else {
			HostProvider.window.showMessage({
				type: ShowMessageType.INFORMATION,
				message: "Resetting workspace state...",
			})
			await resetWorkspaceState(controller)
		}

		if (controller.task) {
			controller.task.abortTask()
			controller.task = undefined
		}

		// CARET MODIFICATION: After Cline reset, apply Caret-specific initialization
		await applyCaretDefaultsAfterReset(controller, request.global ?? false)

		HostProvider.window.showMessage({
			type: ShowMessageType.INFORMATION,
			message: "State reset completed",
		})
		await sendChatButtonClickedEvent()

		return Empty.create()
	} catch (error) {
		await controller.postStateToWebview()

		// CARET MODIFICATION: Reload extension host to clear any cached persona images
		if (request.global) {
			try {
				const vscode = await import("vscode")
				// biome-ignore lint: Required to restart the extension host, not available in HostProvider
				await vscode.commands.executeCommand("workbench.action.restartExtensionHost")
			} catch (reloadError) {
				Logger.warn(`[CARET-RESET] Failed to restart extension host: ${reloadError}`)
			}
		}

		Logger.error("Error resetting state:", error)
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: `Failed to reset state: ${error instanceof Error ? error.message : String(error)}`,
		})
		throw error
	}
}

/**
 * CARET MODIFICATION: Apply Caret-specific defaults after Cline reset is complete
 * This ensures we don't interfere with Cline's reset logic but still get Caret defaults
 */
async function applyCaretDefaultsAfterReset(controller: Controller, isGlobalReset: boolean): Promise<void> {
	try {
		// Re-initialize CaretGlobalManager with Caret mode
		CaretGlobalManager.initialize("caret")

		// Apply Caret-specific default settings
		await applyCaretDefaultSettings(controller)

		// Reset and re-initialize persona system (only on global reset)
		if (isGlobalReset) {
			await resetAndInitializePersona(controller)
		}

		Logger.info("[CARET-RESET] Caret initialization completed after Cline reset")
	} catch (error) {
		Logger.error("[CARET-RESET] Failed to apply Caret defaults:", error)
		HostProvider.window.showMessage({
			type: ShowMessageType.WARNING,
			message: "Caret initialization partially failed - some defaults may not be applied",
		})
	}
}

/**
 * Apply Caret-specific default settings that differ from Cline
 */
async function applyCaretDefaultSettings(controller: Controller): Promise<void> {
	try {
		// Set Caret mode system if not already set
		const currentModeSystem = controller.stateManager.getGlobalStateKey("caretModeSystem")
		if (!currentModeSystem) {
			controller.stateManager.setGlobalState("caretModeSystem", "caret" as const)
		}

		Logger.info(`[CARET-RESET] Applied Caret defaults: caretModeSystem=caret, ensured persona system ready`)
	} catch (error) {
		Logger.error("[CARET-RESET] Failed to apply Caret default settings:", error)
	}
}

/**
 * Reset and re-initialize persona system
 */
async function resetAndInitializePersona(controller: Controller): Promise<void> {
	try {
		// Reset existing persona data
		await resetPersonaData(controller.context)

		// Initialize with fresh persona based on user's language preference
		const personaInitializer = new PersonaInitializer(controller.context)
		const initializedPersona = await personaInitializer.initialize()

		// If initialization was successful and returned a persona, notify the UI
		if (initializedPersona) {
			// After initialization, the default images are in global storage.
			// We need to read them and convert them to data URIs for the webview.
			const personaStorage = new PersonaStorage()
			const images = await personaStorage.loadSimplePersonaImages(controller)

			const avatarUri = images?.avatar
				? `data:image/png;base64,${images.avatar.toString("base64")}`
				: initializedPersona.avatarUri
			const thinkingAvatarUri = images?.thinkingAvatar
				? `data:image/png;base64,${images.thinkingAvatar.toString("base64")}`
				: initializedPersona.thinkingAvatarUri

			// Create a profile object with webview-compatible image URIs
			const profileForWebview = {
				...initializedPersona,
				avatarUri,
				thinkingAvatarUri,
			}

			PersonaService.getInstance().notifyPersonaChange(profileForWebview)
			Logger.info("[CARET-RESET] Persona UI updated with new persona (using data URIs)")
		}

		Logger.info("[CARET-RESET] Persona system reset and re-initialized successfully")
	} catch (error) {
		Logger.error("[CARET-RESET] Failed to reset persona system:", error)
	}
}
