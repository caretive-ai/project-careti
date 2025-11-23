// CARET MODIFICATION: Terminal Tool Handler for interactive terminal sessions

import type { ToolUse } from "@core/assistant-message"
import { formatResponse } from "@core/prompts/responses"
import { ClineAsk } from "@shared/ExtensionMessage"
import { ClineDefaultTool } from "@shared/tools"
import { getTerminalService } from "@caret/integrations/terminal/interactive/adapters/vscode"
import type { TerminalToolInput, TerminalToolOutput } from "@caret/integrations/terminal/interactive/core/types"
import type { ToolResponse } from "../../index"
import type { IFullyManagedTool } from "../ToolExecutorCoordinator"
import type { ToolValidator } from "../ToolValidator"
import type { TaskConfig } from "../types/TaskConfig"
import type { StronglyTypedUIHelpers } from "../types/UIHelpers"

/**
 * Terminal Tool Handler
 *
 * Interactive 터미널 세션을 관리하는 Tool Handler
 * - Python REPL, Node REPL, Claude Code 등 제어 가능
 */
export class TerminalToolHandler implements IFullyManagedTool {
	readonly name = ClineDefaultTool.TERMINAL

	constructor(_validator: ToolValidator) {}

	getDescription(block: ToolUse): string {
		const action = block.params.action
		const command = block.params.command
		const sessionId = block.params.session_id

		if (action === "open" && command) {
			return `[${block.name} - opening ${command}]`
		}
		if (action === "send" && sessionId) {
			return `[${block.name} - sending to ${sessionId.substring(0, 8)}...]`
		}
		return `[${block.name} for '${action}']`
	}

	async handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void> {
		const action = block.params.action
		const command = block.params.command || "terminal"

		// Check if this should be auto-approved
		const shouldAutoApprove = uiHelpers.shouldAutoApproveTool(this.name)

		if (shouldAutoApprove) {
			// For auto-approved tools, wait for complete block
			return
		}

		// Ask user for approval
		await uiHelpers.ask("command" as ClineAsk, uiHelpers.removeClosingTag(block, "command", command), block.partial).catch(() => {})
	}

	async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
		const input: TerminalToolInput = {
			action: block.params.action as any,
			sessionId: block.params.session_id,
			command: block.params.command,
			args: block.params.args ? JSON.parse(block.params.args) : undefined,
			cwd: block.params.cwd,
			input: block.params.input,
		}

		// Validate required parameters
		if (!input.action) {
			config.taskState.consecutiveMistakeCount++
			return await config.callbacks.sayAndCreateMissingParamError(this.name, "action")
		}

		config.taskState.consecutiveMistakeCount = 0

		try {
			const service = getTerminalService()
			let result: TerminalToolOutput

			switch (input.action) {
				case "open":
					result = await this.handleOpen(service, input, config)
					break
				case "send":
					result = await this.handleSend(service, input, config)
					break
				case "read":
					result = await this.handleRead(service, input, config)
					break
				case "stop":
					result = await this.handleStop(service, input, config)
					break
				case "close":
					result = await this.handleClose(service, input, config)
					break
				case "list":
					result = await this.handleList(service)
					break
				default:
					throw new Error(`Unknown terminal action: ${input.action}`)
			}

			if (!result.success) {
				return formatResponse.toolError(result.error || "Terminal operation failed")
			}

			return formatResponse.toolResult(JSON.stringify(result, null, 2))
		} catch (error) {
			return formatResponse.toolError(error instanceof Error ? error.message : String(error))
		}
	}

	private async handleOpen(manager: any, input: TerminalToolInput, config: TaskConfig): Promise<TerminalToolOutput> {
		if (!input.command) {
			throw new Error("command is required for open action")
		}

		const sessionId = await manager.createSession({
			command: input.command,
			args: input.args || [],
			cwd: input.cwd || config.cwd,
		})

		return {
			success: true,
			sessionId,
			output: `Terminal session opened: ${input.command} (${sessionId})`,
		}
	}

	private async handleSend(manager: any, input: TerminalToolInput, _config: TaskConfig): Promise<TerminalToolOutput> {
		if (!input.sessionId) {
			throw new Error("sessionId is required for send action")
		}
		if (!input.input) {
			throw new Error("input is required for send action")
		}

		await manager.sendInput(input.sessionId, input.input)

		// Wait for new output asynchronously (up to 2 seconds)
		const result = await manager.readOutput(input.sessionId, 2000)
		const output = result.output ?? ""

		return {
			success: true,
			sessionId: input.sessionId,
			output,
		}
	}

	private async handleRead(manager: any, input: TerminalToolInput, _config: TaskConfig): Promise<TerminalToolOutput> {
		if (!input.sessionId) {
			throw new Error("sessionId is required for read action")
		}

		// Wait for new output asynchronously (up to 1 second)
		const result = await manager.readOutput(input.sessionId, 1000)
		const output = result.output ?? ""

		return {
			success: true,
			sessionId: input.sessionId,
			output,
		}
	}

	private async handleStop(manager: any, input: TerminalToolInput, _config: TaskConfig): Promise<TerminalToolOutput> {
		if (!input.sessionId) {
			throw new Error("sessionId is required for stop action")
		}

		// Send Ctrl+C
		await manager.sendInput(input.sessionId, "\x03")

		return {
			success: true,
			sessionId: input.sessionId,
			output: "Sent Ctrl+C to terminal",
		}
	}

	private async handleClose(manager: any, input: TerminalToolInput, _config: TaskConfig): Promise<TerminalToolOutput> {
		if (!input.sessionId) {
			throw new Error("sessionId is required for close action")
		}

		return manager.closeSession(input.sessionId)
	}

	private async handleList(manager: any): Promise<TerminalToolOutput> {
		const sessions = manager.listSessions()

		return {
			success: true,
			sessions,
			output: `Active sessions: ${sessions.length}`,
		}
	}
}
