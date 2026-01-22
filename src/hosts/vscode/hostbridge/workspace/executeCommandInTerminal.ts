import { ExecuteCommandInTerminalRequest, ExecuteCommandInTerminalResponse } from "@shared/proto/host/workspace"
import * as vscode from "vscode"
import { TerminalRegistry } from "@/integrations/terminal/TerminalRegistry"

/**
 * Executes a command in a new terminal
 * @param request The request containing the command to execute
 * @returns Response indicating success
 */
export async function executeCommandInTerminal(
	request: ExecuteCommandInTerminalRequest,
): Promise<ExecuteCommandInTerminalResponse> {
	try {
		// CARETI MODIFICATION: Align terminal branding with current Careti skin
		const branding = TerminalRegistry.getTerminalBranding()
		// Create terminal with fixed options
		const terminalOptions: vscode.TerminalOptions = {
			name: branding.name,
			iconPath: branding.iconPath,
			env: {
				CLINE_ACTIVE: "true",
			},
		}

		// Create a new terminal
		const terminal = vscode.window.createTerminal(terminalOptions)

		// Show the terminal to the user
		terminal.show()

		// Send the command to the terminal
		terminal.sendText(request.command, true)

		return ExecuteCommandInTerminalResponse.create({
			success: true,
		})
	} catch (error) {
		console.error("Error executing command in terminal:", error)
		return ExecuteCommandInTerminalResponse.create({
			success: false,
		})
	}
}
