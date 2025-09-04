import type { ToggleCaretRuleRequest } from "@shared/proto/cline/file"
import { ClineRulesToggles } from "@shared/proto/cline/file"
import type { Controller } from "@core/controller/index"
import { ClineRulesToggles as AppClineRulesToggles } from "@shared/cline-rules"
import { Logger } from "@/services/logging/Logger" // CARET MODIFICATION: Add Logger for debugging

/**
 * CARET MODIFICATION: Toggles a Caret rule (enable or disable)
 * This is a separate implementation from toggleClineRule to avoid conflicts during merging
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Caret rule toggles
 */
export async function toggleCaretRule(controller: Controller, request: ToggleCaretRuleRequest): Promise<ClineRulesToggles> {
	const { rulePath, enabled } = request

	if (!rulePath || typeof enabled !== "boolean") {
		const errorMessage = `toggleCaretRule: Missing or invalid parameters. rulePath: ${rulePath}, enabled: ${
			typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`
		}`
		Logger.error(errorMessage, new Error(errorMessage))
		throw new Error("Missing or invalid parameters for toggleCaretRule")
	}

	// CARET MODIFICATION: Add logging for toggle requests
	Logger.debug(`[CARET] Toggle request - rulePath: ${rulePath}, enabled: ${enabled}`)

	// CARET MODIFICATION: Update the toggles in workspace state for caret rules
	const toggles = controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles")
	Logger.debug(`[CARET] Before toggle - current state: ${JSON.stringify(toggles)}`)
	toggles[rulePath] = enabled
	controller.stateManager.setWorkspaceState("localCaretRulesToggles", toggles)
	Logger.debug(`[CARET] After toggle - new state: ${JSON.stringify(toggles)}`)

	// Get the current state to return in the response
	const caretToggles = controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles")
	Logger.debug(`[CARET] Returning to UI: ${JSON.stringify(caretToggles)}`)

	return ClineRulesToggles.create({
		toggles: caretToggles,
	})
}