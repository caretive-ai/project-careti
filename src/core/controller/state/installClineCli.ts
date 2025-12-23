import { Empty, EmptyRequest } from "@shared/proto/cline/common"
import { ShowMessageType } from "@shared/proto/host/window"
import { ExecuteCommandInTerminalRequest } from "@shared/proto/host/workspace"
import { getModeSystemCliInstallCommand, getModeSystemCliLabel } from "@caret/utils/brand-utils"
import { HostProvider } from "@/hosts/host-provider"
import { Controller } from ".."

/**
 * Handles the installation of the Cline CLI tool
 * @param controller The controller instance
 * @param _request The empty request
 * @returns Empty response
 */
export async function installClineCli(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	const modeSystem = controller.stateManager.getGlobalStateKey("caretModeSystem") || "cline"
	// CARET MODIFICATION: install Caret CLI when caret mode is active
	const isCaretMode = modeSystem === "caret"
	const installCommand = getModeSystemCliInstallCommand(isCaretMode ? "caret" : "cline")
	// CARET MODIFICATION: brand-aware CLI label (white-label safe)
	const cliLabel = getModeSystemCliLabel(isCaretMode ? "caret" : "cline")

	try {
		// Use the HostProvider to execute the command in a terminal
		// This works across different platforms (VSCode, JetBrains, etc.)
		const response = await HostProvider.workspace.executeCommandInTerminal(
			ExecuteCommandInTerminalRequest.create({
				command: installCommand,
			}),
		)

		if (!response.success) {
			throw new Error("Failed to execute command in terminal")
		}
	} catch (error) {
		console.error("Error executing CLI installation:", error)
		await HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: `Failed to start ${cliLabel} installation: ${error instanceof Error ? error.message : "Unknown error"}`,
			options: { items: [] },
		})
	}

	return Empty.create()
}
