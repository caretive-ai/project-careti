import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { PersonaInitializer, resetPersonaData } from "@caret/services/persona/persona-initializer"
import { Empty } from "@shared/proto/cline/common"
import { ResetStateRequest } from "@shared/proto/cline/state"
import { resetGlobalState, resetWorkspaceState } from "@/core/storage/utils/state-helpers"
import { HostProvider } from "@/hosts/host-provider"
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
		await controller.postStateToWebview()

		await sendChatButtonClickedEvent(controller.id)

		return Empty.create()
	} catch (error) {
		console.error("Error resetting state:", error)
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

		console.log("[CARET-RESET] Caret initialization completed after Cline reset")
	} catch (error) {
		console.error("[CARET-RESET] Failed to apply Caret defaults:", error)
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
		// Import here to avoid circular dependencies
		const { DEFAULT_CARET_SETTINGS } = await import("@/shared/CaretSettings")

		// Set Caret default mode (agent instead of act) - only if in Caret mode
		const currentCaretMode = controller.stateManager.getGlobalStateKey("caretModeSystem")
		if (currentCaretMode === "caret") {
			// For Caret mode, we use "act" as the base but switch to agent mode via caretModeSystem
			controller.stateManager.setGlobalState("mode", "act" as const)
		}

		// Set Caret mode system if not already set
		const currentModeSystem = controller.stateManager.getGlobalStateKey("caretModeSystem")
		if (!currentModeSystem) {
			controller.stateManager.setGlobalState("caretModeSystem", "caret" as const)
		}

		console.log(`[CARET-RESET] Applied Caret defaults: caretModeSystem=caret, ensured persona system ready`)
	} catch (error) {
		console.error("[CARET-RESET] Failed to apply Caret default settings:", error)
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
		await personaInitializer.initialize()

		console.log("[CARET-RESET] Persona system reset and re-initialized successfully")
	} catch (error) {
		console.error("[CARET-RESET] Failed to reset persona system:", error)
	}
}
