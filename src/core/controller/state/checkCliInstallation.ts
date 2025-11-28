import { Boolean } from "@shared/proto/cline/common"
import { isCaretCliInstalled, isClineCliInstalled } from "@/utils/cli-detector"
import { Controller } from ".."

/**
 * Check if the Cline CLI is installed
 * @param controller The controller instance
 * @returns Boolean indicating if CLI is installed
 */
export async function checkCliInstallation(_controller: Controller): Promise<Boolean> {
	try {
		const modeSystem = _controller.stateManager.getGlobalStateKey("caretModeSystem") || "cline"
		// CARET MODIFICATION: Detect CLI per modeSystem with fallback (caret ↔ cline)
		const primaryCheck = modeSystem === "caret" ? isCaretCliInstalled : isClineCliInstalled
		const fallbackCheck = modeSystem === "caret" ? isClineCliInstalled : isCaretCliInstalled

		let isInstalled = await primaryCheck()
		if (!isInstalled) {
			isInstalled = await fallbackCheck()
		}

		return Boolean.create({ value: isInstalled })
	} catch (error) {
		console.error("Failed to check CLI installation:", error)
		return Boolean.create({ value: false })
	}
}
