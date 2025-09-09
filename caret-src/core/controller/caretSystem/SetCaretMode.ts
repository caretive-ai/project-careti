import { CaretModeManager } from "@caret/core/modes/CaretModeManager"
import type { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger"
import type * as proto from "@/shared/proto"

/**
 * CARET MODIFICATION: Level 1 Independent gRPC handler for Caret-specific mode
 * Uses CaretModeManager for complete independence from Cline core systems
 * 
 * Architecture Level: L1 (Independent)
 * - No interaction with Cline StateManager
 * - Uses Caret-specific workspace configuration
 * - Zero impact on Cline plan/act mode system
 */
export async function SetCaretMode(
	controller: Controller,
	request: proto.caret.SetCaretModeRequest,
): Promise<proto.caret.SetCaretModeResponse> {
	console.log(`[SetCaretMode] 🔄 gRPC handler called with request:`, request)
	
	try {
		const newMode = request.mode as "chatbot" | "agent"
		console.log(`[SetCaretMode] 📥 Request mode: ${newMode}`)

		// Validate mode
		if (newMode !== "chatbot" && newMode !== "agent") {
			console.error(`[SetCaretMode] ❌ Invalid mode: ${newMode}`)
			Logger.error(`[SetCaretMode] Invalid mode: ${newMode}`)
			return {
				success: false,
				currentMode: "chatbot", // default fallback
				errorMessage: `Invalid mode: ${newMode}. Must be 'chatbot' or 'agent'`,
			}
		}

		// Get current mode from Caret independent manager
		const currentCaretMode = CaretModeManager.getCurrentCaretMode()
		console.log(`[SetCaretMode] 📍 Current mode: ${currentCaretMode}`)

		Logger.debug(`[SetCaretMode] Changing Caret mode from ${currentCaretMode} to ${newMode}`)

		// Update Caret mode using independent manager (no Cline interference)
		console.log(`[SetCaretMode] 🎯 Calling CaretModeManager.setCaretMode(${newMode})`)
		await CaretModeManager.setCaretMode(newMode)

		console.log(`[SetCaretMode] ✅ Mode change successful: ${currentCaretMode} → ${newMode}`)
		Logger.info(`[SetCaretMode] Successfully changed to ${newMode} mode via CaretModeManager`)
		
		const debugInfo = CaretModeManager.getDebugInfo()
		console.log(`[SetCaretMode] 🔍 Debug info:`, debugInfo)
		Logger.debug(`[SetCaretMode] Debug info: ${JSON.stringify(debugInfo)}`)

		return {
			success: true,
			currentMode: newMode,
			errorMessage: "",
		}
	} catch (error) {
		console.error(`[SetCaretMode] ❌ Failed to set Caret mode:`, error)
		Logger.error(`[SetCaretMode] Failed to set Caret mode: ${error}`)
		return {
			success: false,
			currentMode: "chatbot", // default fallback
			errorMessage: `Failed to set Caret mode: ${error}`,
		}
	}
}
