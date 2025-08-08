import type { ToggleCaretRuleRequest } from "@shared/proto/cline/file"
import { ClineRulesToggles } from "@shared/proto/cline/file"
import type { Controller } from "../index"
import { getWorkspaceState, updateWorkspaceState } from "../../../core/storage/state"
import { ClineRulesToggles as AppClineRulesToggles } from "@shared/cline-rules"

/**
 * Toggles a Caret rule (enable or disable)
 * @param controller The controller instance
 * @param request The toggle request
 * @returns The updated Caret rule toggles
 */
export async function toggleCaretRule(controller: Controller, request: ToggleCaretRuleRequest): Promise<ClineRulesToggles> {
	const { rulePath, enabled } = request

	if (!rulePath || typeof enabled !== "boolean") {
		console.error("toggleCaretRule: Missing or invalid parameters", {
			rulePath,
			enabled: typeof enabled === "boolean" ? enabled : `Invalid: ${typeof enabled}`,
		})
		throw new Error("Missing or invalid parameters for toggleCaretRule")
	}

	// Update the toggles in workspace state
	const toggles = ((await getWorkspaceState(controller.context, "localCaretRulesToggles")) as AppClineRulesToggles) || {}
	toggles[rulePath] = enabled
	await updateWorkspaceState(controller.context, "localCaretRulesToggles", toggles)

	// Get the current state to return in the response
	const caretToggles = ((await getWorkspaceState(controller.context, "localCaretRulesToggles")) as AppClineRulesToggles) || {}

	return ClineRulesToggles.create({
		toggles: caretToggles,
	})
}
