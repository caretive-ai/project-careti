/**
 * Common interface for message handling between Caret and Cline systems
 * CARET MODIFICATION: Phase 9.2 - Task instance integration for tool access
 */
export interface MessageHandlerInterface {
	/**
	 * Handle sending a message with optional images and files
	 * @param text The message text
	 * @param images Array of base64 encoded images
	 * @param files Array of file paths
	 * @param taskServiceClient Service client for backend communication
	 * @param clineAsk Optional Cline ask type for approval workflows
	 * @param messagesLength Optional message count for conversation state
	 * @returns Promise that resolves when message is processed
	 */
	handleSendMessage(
		text: string,
		images: string[],
		files: string[],
		taskServiceClient: any,
		clineAsk?: string,
		messagesLength?: number,
	): Promise<void>
}
