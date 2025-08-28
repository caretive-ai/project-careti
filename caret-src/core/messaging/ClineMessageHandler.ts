import { MessageHandlerInterface } from "./interfaces/MessageHandlerInterface"
import { AskResponseRequest, NewTaskRequest } from "../../../src/shared/proto/cline/task"

/**
 * Pure Cline message handler - preserves original Cline logic completely
 * This ensures existing Cline users experience no changes
 */
export class ClineMessageHandler implements MessageHandlerInterface {
	/**
	 * Handle Cline system message sending with original approval workflows
	 * Preserves all existing clineAsk states and behaviors
	 */
	async handleSendMessage(
		text: string,
		images: string[],
		files: string[],
		taskServiceClient: any,
		clineAsk?: string,
		messagesLength?: number,
	): Promise<void> {
		const trimmedText = text.trim()
		const hasContent = trimmedText || images.length > 0 || files.length > 0

		if (!hasContent) {
			return
		}

		console.log("[ClineMessageHandler] Processing Cline message with clineAsk:", clineAsk)

		// For new conversations, create new task
		if (this.isNewConversation(messagesLength)) {
			console.log("[ClineMessageHandler] Starting new task")
			await taskServiceClient.newTask(
				NewTaskRequest.create({
					text: trimmedText,
					images,
					files,
				}),
			)
			return
		}

		// Handle clineAsk approval workflows (original Cline logic)
		if (clineAsk) {
			console.log("[ClineMessageHandler] Processing clineAsk:", clineAsk)
			switch (clineAsk) {
				case "followup":
				case "plan_mode_respond":
				case "tool":
				case "browser_action_launch":
				case "command":
				case "command_output":
				case "use_mcp_server":
				case "completion_result":
				case "resume_task":
				case "resume_completed_task":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
				case "api_req_failed":
				case "new_task":
				case "condense":
				case "report_bug":
					console.log("[ClineMessageHandler] Sending askResponse with messageResponse")
					await taskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType: "messageResponse",
							text: trimmedText,
							images,
							files,
						}),
					)
					break
				default:
					console.warn("[ClineMessageHandler] Unhandled clineAsk type:", clineAsk)
					break
			}
		} else {
			console.log("[ClineMessageHandler] No clineAsk, no action taken (preserving original Cline behavior)")
		}
	}

	/**
	 * Check if this is a new conversation (no existing messages)
	 */
	private isNewConversation(messagesLength?: number): boolean {
		return messagesLength === 0
	}
}
