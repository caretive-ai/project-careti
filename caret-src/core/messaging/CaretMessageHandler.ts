import { AskResponseRequest, NewTaskRequest } from "../../../src/shared/proto/cline/task"
import { MessageHandlerInterface } from "./interfaces/MessageHandlerInterface"

// Access vscode through globalThis for webview compatibility

/**
 * CARET MODIFICATION: Pure Caret message handler
 * Handles free conversation flow without clineAsk dependencies
 */
export class CaretMessageHandler implements MessageHandlerInterface {
	/**
	 * Handle Caret system message sending with optimistic UI updates
	 * Features:
	 * - Agent mode: Free conversation without approval workflows
	 * - Chatbot mode: Direct message responses
	 * - Optimistic UI updates: User messages appear immediately
	 * - No dependency on clineAsk states
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

		console.log("[CaretMessageHandler] Processing message:", trimmedText)

		// CARET MODIFICATION: Optimistic UI update - show user message immediately
		this.addOptimisticUserMessage(trimmedText)

		// CARET MODIFICATION: Phase 10.1 - Always use TaskServiceClient for tool integration
		// TaskServiceClient internally calls controller.task.handleWebviewAskResponse()
		// This ensures proper tool integration while maintaining webview-extension architecture
		console.log("[CaretMessageHandler] Using TaskServiceClient for complete tool integration")

		if (this.isNewConversation(messagesLength)) {
			console.log("[CaretMessageHandler] Starting new task with tool support via TaskServiceClient")
			await taskServiceClient.newTask({
				text: trimmedText,
				images: images,
				files: files,
			})
			return
		} else {
			console.log("[CaretMessageHandler] Sending message response with tool support via TaskServiceClient")
			await taskServiceClient.askResponse({
				responseType: "messageResponse",
				text: trimmedText,
				images: images,
				files: files,
			})
			return
		}
	}

	/**
	 * CARET MODIFICATION: Add optimistic user message to UI immediately
	 * This ensures user sees their message right away, matching expected UX
	 */
	private addOptimisticUserMessage(text: string): void {
		const optimisticMessage = {
			type: "say",
			say: "user_feedback",
			text: text,
			ts: Date.now(),
		}

		// Get current VSCode state and add optimistic message
		const vscode = (globalThis as any).vscode
		const currentState = vscode?.getState() as any
		if (currentState && vscode) {
			vscode.setState({
				...currentState,
				clineMessages: [...(currentState?.clineMessages || []), optimisticMessage],
			})
		}

		console.log("[CaretMessageHandler] Added optimistic user message to UI")
	}

	/**
	 * Check if this is a new conversation based on message count
	 * CARET MODIFICATION: Use actual message count instead of hardcoded false
	 */
	private isNewConversation(messagesLength?: number): boolean {
		// If messagesLength is provided, use it. Otherwise check VSCode state
		if (messagesLength !== undefined) {
			return messagesLength === 0
		}

		// Fallback: check current VSCode state
		const vscode = (globalThis as any).vscode
		const currentState = vscode?.getState() as any
		const existingMessages = currentState?.clineMessages || []
		return existingMessages.length === 0
	}
}
