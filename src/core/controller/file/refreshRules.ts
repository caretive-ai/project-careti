import { refreshClineRulesToggles } from "@core/context/instructions/user-instructions/cline-rules"
import { refreshExternalRulesToggles } from "@core/context/instructions/user-instructions/external-rules"
import { refreshWorkflowToggles } from "@core/context/instructions/user-instructions/workflows"
import { EmptyRequest } from "@shared/proto/cline/common"
import { RefreshedRules } from "@shared/proto/cline/file"
import { getCwd, getDesktopDir } from "@/utils/path"
import type { Controller } from "../index"

/**
 * Refreshes all rule toggles (.agents/context + AGENTS.md + Workflows).
 * @param controller The controller instance
 * @param _request The empty request
 * @returns RefreshedRules containing updated toggles for all rule types
 */
export async function refreshRules(controller: Controller, _request: EmptyRequest): Promise<RefreshedRules> {
	try {
		const cwd = await getCwd(getDesktopDir())
		const { globalToggles, localToggles } = await refreshClineRulesToggles(controller, cwd)
		const { caretLocalToggles, agentsLocalToggles } = await refreshExternalRulesToggles(controller, cwd, {
			caretLocalToggles: localToggles,
		})
		const { localWorkflowToggles, globalWorkflowToggles } = await refreshWorkflowToggles(controller, cwd)

		return RefreshedRules.create({
			globalClineRulesToggles: { toggles: globalToggles },
			localClineRulesToggles: { toggles: {} },
			localCaretRulesToggles: { toggles: caretLocalToggles },
			localCursorRulesToggles: { toggles: {} },
			localWindsurfRulesToggles: { toggles: {} },
			localAgentsRulesToggles: { toggles: agentsLocalToggles },
			localWorkflowToggles: { toggles: localWorkflowToggles },
			globalWorkflowToggles: { toggles: globalWorkflowToggles },
		} as any)
	} catch (error) {
		console.error("Failed to refresh rules:", error)
		throw error
	}
}
