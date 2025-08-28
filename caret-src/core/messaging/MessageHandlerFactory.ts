import type { ClineMessage } from "../../../src/shared/ExtensionMessage"
import type { Mode } from "../../../src/shared/storage/types"
import { AskResponseRequest, NewTaskRequest } from "../../../src/shared/proto/cline/task"
import { CARET_MODES } from "../../shared/constants/ModeSystemConstants"

/**
 * CARET MODIFICATION: Adapter pattern for extending Cline message handling
 * Instead of replacing Cline infrastructure, we intercept and modify behavior
 * This maintains compatibility while adding Caret-specific features
 */
export class MessageHandlerAdapter {
	/**
	 * Adapt message handling based on Caret mode system
	 * Reuses Cline TaskServiceClient infrastructure with Caret-specific interpretation
	 *
	 * @param text Message text
	 * @param images Selected images
	 * @param files Selected files
	 * @param taskServiceClient Original Cline TaskServiceClient
	 * @param clineAsk Original Cline ask state
	 * @param messagesLength Message count for conversation state
	 * @param modeSystem Current mode system ('caret' or 'cline')
	 * @param caretMode Current Caret mode ('agent' or 'chatbot')
	 */
	static async handleSendMessage(
		text: string,
		images: string[],
		files: string[],
		taskServiceClient: any,
		clineAsk?: string,
		messagesLength?: number,
		modeSystem: "caret" | "cline" = "cline",
		caretMode: Mode = "act",
	): Promise<void> {
		const trimmedText = text.trim()
		const hasContent = trimmedText || images.length > 0 || files.length > 0

		if (!hasContent) {
			return
		}

		// DEBUG: 파라미터 확인
		console.log("[MessageHandlerAdapter] DEBUG Parameters", {
			modeSystem,
			caretMode,
			messagesLength,
			hasContent,
			textLength: trimmedText.length,
		})

		// CARET MODIFICATION: For Caret system, adapt behavior while reusing Cline infrastructure
		if (modeSystem === "caret") {
			console.log("[MessageHandlerAdapter] Adapting Caret message handling", { caretMode, clineAsk })

			// Add optimistic UI update for Caret system
			this.addOptimisticUserMessage(trimmedText)

			// Determine if this is a new conversation
			const isNewConversation = messagesLength === 0

			if (isNewConversation) {
				// New conversation: Use Cline's newTask but with Caret context
				console.log("[MessageHandlerAdapter] Starting new task with Caret context")
				await taskServiceClient.newTask(
					NewTaskRequest.create({
						text: this.adaptMessageForCaretMode(trimmedText, caretMode),
						images,
						files,
					}),
				)
				return
			}

			// Ongoing conversation: Adapt behavior based on Caret mode
			if (caretMode === CARET_MODES.AGENT) {
				// Agent mode: Handle different ask states appropriately
				console.log("[MessageHandlerAdapter] Agent mode - handling ask state", { clineAsk })

				if (clineAsk) {
					// There's an active ask - respond appropriately based on the ask type
					let responseType = "yesButtonClicked" // Default to yesButtonClicked to trigger response
					if (clineAsk === "followup") {
						responseType = "yesButtonClicked" // Continue conversation with response
					} else if (clineAsk === "completion_result") {
						responseType = "yesButtonClicked" // Accept completion
					}

					console.log("[MessageHandlerAdapter] Agent responding to ask with:", responseType)
					await taskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType,
							text: trimmedText,
							images,
							files,
						}),
					)
				} else {
					// No active ask - treat like Plan mode with yesButtonClicked to trigger response
					console.log("[MessageHandlerAdapter] Agent mode - triggering response like Plan mode")
					await taskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType: "yesButtonClicked",
							text: trimmedText,
							images,
							files,
						}),
					)
				}
				return
			} else if (caretMode === CARET_MODES.CHATBOT) {
				// Chatbot mode: More controlled flow with explicit approvals
				console.log("[MessageHandlerAdapter] Chatbot mode - controlled flow")
				if (clineAsk === "chatbot_mode_respond") {
					// User approved chatbot response
					await taskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType: "yesButtonClicked",
							text: trimmedText,
							images,
							files,
						}),
					)
				} else {
					// Regular chatbot conversation
					await taskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType: "messageResponse",
							text: trimmedText,
							images,
							files,
						}),
					)
				}
				return
			}
		}

		// CARET MODIFICATION: Fallback to original Cline logic for non-Caret systems
		console.log("[MessageHandlerAdapter] Using original Cline logic")

		// Determine if this is a new conversation
		const isNewConversation = messagesLength === 0

		if (isNewConversation) {
			console.log("[MessageHandlerAdapter] Starting new Cline task")
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
			console.log("[MessageHandlerAdapter] Processing Cline ask:", clineAsk)
			await taskServiceClient.askResponse(
				AskResponseRequest.create({
					responseType: "messageResponse",
					text: trimmedText,
					images,
					files,
				}),
			)
		} else {
			console.log("[MessageHandlerAdapter] No clineAsk, preserving original Cline behavior")
		}
	}

	/**
	 * CARET MODIFICATION: Add Caret-specific context to messages
	 * This allows Caret modes to have different AI behavior while using same infrastructure
	 */
	private static adaptMessageForCaretMode(text: string, caretMode: Mode): string {
		if (caretMode === CARET_MODES.AGENT) {
			// Agent mode: Autonomous execution context
			return `[Agent Mode - Autonomous Execution]\n${text}`
		} else if (caretMode === CARET_MODES.CHATBOT) {
			// Chatbot mode: Conversational assistance context
			return `[Chatbot Mode - Conversational Assistant]\n${text}`
		}

		// Fallback to original text
		return text
	}

	/**
	 * CARET MODIFICATION: Factory method for backward compatibility with tests
	 */
	static create(modeSystem: "caret" | "cline"): MessageHandlerAdapter {
		return new MessageHandlerAdapter()
	}

	/**
	 * CARET MODIFICATION: Instance method for backward compatibility with tests
	 */
	async handleSendMessage(
		text: string,
		images: string[],
		files: string[],
		taskServiceClient: any,
		clineAsk?: string,
		messagesLength?: number,
		modeSystem: "caret" | "cline" = "cline",
		caretMode: Mode = "act",
	): Promise<void> {
		return MessageHandlerAdapter.handleSendMessage(
			text,
			images,
			files,
			taskServiceClient,
			clineAsk,
			messagesLength,
			modeSystem,
			caretMode,
		)
	}

	/**
	 * CARET MODIFICATION: Add optimistic user message to UI immediately
	 * Reused from CaretMessageHandler for consistency
	 */
	private static addOptimisticUserMessage(text: string): void {
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

		console.log("[MessageHandlerAdapter] Added optimistic user message to UI")
	}
}

// Export alias for backward compatibility with tests
export const MessageHandlerFactory = MessageHandlerAdapter
