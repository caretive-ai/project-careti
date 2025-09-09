import * as vscode from "vscode"
import { Logger } from "@/services/logging/Logger"

/**
 * CARET MODIFICATION: Level 1 Independent Caret Mode Management
 * 
 * This manager handles Caret-specific CHATBOT/AGENT modes completely independently
 * from Cline's plan/act system, ensuring zero interference with Cline core functionality.
 * 
 * Architecture Level: L1 (Independent)
 * - No modifications to Cline core files
 * - Uses separate workspace configuration key
 * - Completely isolated from Cline StateManager
 */
export class CaretModeManager {
	private static caretMode: "chatbot" | "agent" = "chatbot"
	private static initialized = false

	/**
	 * Initialize the Caret mode from workspace configuration
	 */
	static async initialize(): Promise<void> {
		if (this.initialized) {
			console.log(`[CaretModeManager] ⚠️ Already initialized with mode: ${this.caretMode}`)
			return
		}

		try {
			console.log(`[CaretModeManager] 🚀 Initializing Caret mode system...`)
			// Load from Caret-specific workspace key (not Cline's "mode")
			const config = vscode.workspace.getConfiguration("caret")
			const savedMode = config.get<"chatbot" | "agent">("mode", "chatbot")
			
			console.log(`[CaretModeManager] 📖 Loaded mode from config: ${savedMode}`)
			this.caretMode = savedMode
			this.initialized = true
			
			console.log(`[CaretModeManager] ✅ Initialized with mode: ${this.caretMode}`)
			Logger.debug(`[CaretModeManager] Initialized with mode: ${this.caretMode}`)
		} catch (error) {
			console.error(`[CaretModeManager] ❌ Failed to initialize:`, error)
			Logger.error(`[CaretModeManager] Failed to initialize: ${error}`)
			this.caretMode = "chatbot" // Safe fallback
			this.initialized = true
		}
	}

	/**
	 * Get current Caret mode (CHATBOT/AGENT)
	 */
	static getCurrentCaretMode(): "chatbot" | "agent" {
		if (!this.initialized) {
			console.warn(`[CaretModeManager] ⚠️ Not initialized, returning default 'chatbot' mode`)
			Logger.warn("[CaretModeManager] Not initialized, returning default 'chatbot' mode")
			return "chatbot"
		}
		console.log(`[CaretModeManager] 📍 Current mode: ${this.caretMode}`)
		return this.caretMode
	}

	/**
	 * Set Caret mode and persist to workspace
	 */
	static async setCaretMode(mode: "chatbot" | "agent"): Promise<void> {
		try {
			const previousMode = this.caretMode
			console.log(`[CaretModeManager] 🔄 Mode change request: ${previousMode} → ${mode}`)
			this.caretMode = mode

			// Persist to Caret-specific workspace key (completely separate from Cline)
			const config = vscode.workspace.getConfiguration("caret")
			await config.update("mode", mode, vscode.ConfigurationTarget.Workspace)

			console.log(`[CaretModeManager] ✅ Mode change completed: ${previousMode} → ${mode}`)
			console.log(`[CaretModeManager] 🔧 Workspace config updated successfully`)
			Logger.info(`[CaretModeManager] Mode changed: ${previousMode} → ${mode}`)
		} catch (error) {
			console.error(`[CaretModeManager] ❌ Failed to set mode to ${mode}:`, error)
			Logger.error(`[CaretModeManager] Failed to set mode to ${mode}: ${error}`)
			throw error
		}
	}

	/**
	 * Map Caret mode to Cline-compatible plan/act for internal processing
	 * This is only for internal use and doesn't affect Cline's actual mode system
	 */
	static mapCaretToPlanAct(): "plan" | "act" {
		return this.caretMode === "chatbot" ? "plan" : "act"
	}

	/**
	 * Get debug information for logging
	 */
	static getDebugInfo(): Record<string, unknown> {
		return {
			caretMode: this.caretMode,
			mappedPlanAct: this.mapCaretToPlanAct(),
			initialized: this.initialized,
		}
	}

	/**
	 * Check if current mode allows tool usage
	 */
	static isToolAllowed(toolName: string): boolean {
		const allowed = this.caretMode === "agent" || (() => {
			if (this.caretMode === "chatbot") {
				// CHATBOT mode: read-only tools only
				const allowedInChatbot = [
					"read_file",
					"list_files", 
					"search_files",
					"list_code_definition_names",
					"ask_followup_question",
					"web_fetch",
					"attempt_completion"
				]
				return allowedInChatbot.includes(toolName)
			}
			return false
		})()
		
		console.log(`[CaretModeManager] 🔧 Tool permission check: "${toolName}" → ${allowed ? "ALLOWED" : "BLOCKED"} (mode: ${this.caretMode})`)
		return allowed
	}
}