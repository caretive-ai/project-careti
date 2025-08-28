import { EmptyRequest } from "@shared/proto/cline/common"
import { RefreshedRules } from "@shared/proto/cline/file"
import type { Controller } from "../index"
import { refreshClineRulesToggles } from "@core/context/instructions/user-instructions/cline-rules"
import { refreshExternalRulesToggles } from "@core/context/instructions/user-instructions/external-rules"
import { refreshWorkflowToggles } from "@core/context/instructions/user-instructions/workflows"
import { getCwd, getDesktopDir } from "@/utils/path"

/**
 * Refreshes all rule toggles (Cline, External, and Workflows)
 * @param controller The controller instance
 * @param _request The empty request
 * @returns RefreshedRules containing updated toggles for all rule types
 */
export async function refreshRules(controller: Controller, _request: EmptyRequest): Promise<RefreshedRules> {
	try {
		const cwd = await getCwd(getDesktopDir())
		const { globalToggles, localToggles } = await refreshClineRulesToggles(controller, cwd)
		const { caretLocalToggles, cursorLocalToggles, windsurfLocalToggles } = await refreshExternalRulesToggles(controller, cwd)
		const { localWorkflowToggles, globalWorkflowToggles } = await refreshWorkflowToggles(controller, cwd)

		// CARET MODIFICATION: Apply rule priority system - only disable when files exist AND user hasn't manually toggled
		let prioritizedLocalToggles = localToggles
		// Priority system is handled in external-rules.ts during file discovery, not here
		// This preserves user's manual toggle states

		return RefreshedRules.create({
			globalClineRulesToggles: { toggles: globalToggles },
			localClineRulesToggles: { toggles: prioritizedLocalToggles }, // CARET MODIFICATION: Use prioritized toggles
			localCaretRulesToggles: { toggles: caretLocalToggles }, // CARET MODIFICATION: Add missing caretLocalToggles for UI
			localCursorRulesToggles: { toggles: cursorLocalToggles },
			localWindsurfRulesToggles: { toggles: windsurfLocalToggles },
			localWorkflowToggles: { toggles: localWorkflowToggles },
			globalWorkflowToggles: { toggles: globalWorkflowToggles },
		})
	} catch (error) {
		console.error("Failed to refresh rules:", error)
		throw error
	}
}
