import * as vscode from "vscode"
import { Logger } from "@/services/logging/Logger"

/**
 * CARETI MODIFICATION: Level 1 Independent Careti Mode Management
 *
 * This manager handles Careti-specific CHATBOT/AGENT modes completely independently
 * from Cline's plan/act system, ensuring zero interference with Cline core functionality.
 *
 * Architecture Level: L1 (Independent)
 * - No modifications to Cline core files
 * - Uses separate workspace configuration key
 * - Completely isolated from Cline StateManager
 */
export class CaretiModeManager {
	private static caretMode: "chatbot" | "agent" = "agent"
	private static initialized = false
	private static context: vscode.ExtensionContext | undefined = undefined

	/**
	 * Set the extension context for state management
	 */
	static setContext(context: vscode.ExtensionContext): void {
		CaretiModeManager.context = context
	}

	/**
	 * Initialize the Careti mode from workspace configuration
	 */
	static async initialize(): Promise<void> {
		if (CaretiModeManager.initialized) {
			console.log(`[CaretiModeManager] ⚠️ Already initialized with mode: ${CaretiModeManager.caretMode}`)
			return
		}

		try {
			console.log(`[CaretiModeManager] 🚀 Initializing Careti mode system...`)

			if (!CaretiModeManager.context) {
				throw new Error("Extension context not set. Call setContext() first.")
			}

			// CARETI MODIFICATION: Use globalState instead of VS Code configuration
			const savedMode = CaretiModeManager.context.globalState.get<"chatbot" | "agent">("careti.mode", "agent")

			console.log(`[CaretiModeManager] 📖 Loaded mode from globalState: ${savedMode}`)
			CaretiModeManager.caretMode = savedMode
			CaretiModeManager.initialized = true

			console.log(`[CaretiModeManager] ✅ Initialized with mode: ${CaretiModeManager.caretMode}`)
			Logger.debug(`[CaretiModeManager] Initialized with mode: ${CaretiModeManager.caretMode}`)
		} catch (error) {
			console.error(`[CaretiModeManager] ❌ Failed to initialize:`, error)
			Logger.error(`[CaretiModeManager] Failed to initialize: ${error}`)
			CaretiModeManager.caretMode = "agent" // Safe fallback
			CaretiModeManager.initialized = true
		}
	}

	/**
	 * Get current Careti mode (CHATBOT/AGENT)
	 */
	static getCurrentCaretMode(): "chatbot" | "agent" {
		if (!CaretiModeManager.initialized) {
			console.warn(`[CaretiModeManager] ⚠️ Not initialized, returning default 'agent' mode`)
			Logger.warn("[CaretiModeManager] Not initialized, returning default 'agent' mode")
			return "agent"
		}
		console.log(`[CaretiModeManager] 📍 Current mode: ${CaretiModeManager.caretMode}`)
		return CaretiModeManager.caretMode
	}

	/**
	 * Set Careti mode and persist to workspace
	 */
	static async setCaretMode(mode: "chatbot" | "agent"): Promise<void> {
		try {
			const previousMode = CaretiModeManager.caretMode
			console.log(`[CaretiModeManager] 🔄 Mode change request: ${previousMode} → ${mode}`)
			CaretiModeManager.caretMode = mode

			if (!CaretiModeManager.context) {
				throw new Error("Extension context not set. Call setContext() first.")
			}

			// CARETI MODIFICATION: Persist to globalState instead of VS Code configuration
			await CaretiModeManager.context.globalState.update("careti.mode", mode)

			console.log(`[CaretiModeManager] ✅ Mode change completed: ${previousMode} → ${mode}`)
			console.log(`[CaretiModeManager] 🔧 GlobalState updated successfully`)
			Logger.info(`[CaretiModeManager] Mode changed: ${previousMode} → ${mode}`)
		} catch (error) {
			console.error(`[CaretiModeManager] ❌ Failed to set mode to ${mode}:`, error)
			Logger.error(`[CaretiModeManager] Failed to set mode to ${mode}: ${error}`)
			throw error
		}
	}

	/**
	 * Map Careti mode to Cline-compatible plan/act for internal processing
	 * This is only for internal use and doesn't affect Cline's actual mode system
	 */
	static mapCaretToPlanAct(): "plan" | "act" {
		return CaretiModeManager.caretMode === "chatbot" ? "plan" : "act"
	}

	/**
	 * Get debug information for logging
	 */
	static getDebugInfo(): Record<string, unknown> {
		return {
			caretMode: CaretiModeManager.caretMode,
			mappedPlanAct: CaretiModeManager.mapCaretToPlanAct(),
			initialized: CaretiModeManager.initialized,
		}
	}

	/**
	 * Check if current mode allows tool usage
	 */
	static isToolAllowed(toolName: string): boolean {
		const allowed =
			CaretiModeManager.caretMode === "agent" ||
			(() => {
				if (CaretiModeManager.caretMode === "chatbot") {
					// CHATBOT mode: read-only tools only
					const allowedInChatbot = [
						"read_file",
						"list_files",
						"search_files",
						"list_code_definition_names",
						"ask_followup_question",
						"web_fetch",
						"attempt_completion",
					]
					return allowedInChatbot.includes(toolName)
				}
				return false
			})()

		console.log(
			`[CaretiModeManager] 🔧 Tool permission check: "${toolName}" → ${allowed ? "ALLOWED" : "BLOCKED"} (mode: ${CaretiModeManager.caretMode})`,
		)
		return allowed
	}
}
