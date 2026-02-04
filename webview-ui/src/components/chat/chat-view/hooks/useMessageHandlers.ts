import { findLast } from "@shared/array"
import type { ClineMessage } from "@shared/ExtensionMessage"
import { EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import { AskResponseRequest, NewTaskRequest } from "@shared/proto/cline/task"
import { useCallback } from "react"
// CARETI MODIFICATION: use CaretiWebviewLogger instead of console
import WebviewLogger from "@/careti/utils/CaretiWebviewLogger"
import { SlashServiceClient, TaskServiceClient } from "@/services/grpc-client"
import type { ButtonActionType } from "../shared/buttonConfig"
import type { ChatState, MessageHandlers } from "../types/chatTypes"

/**
 * Custom hook for managing message handlers
 * Handles sending messages, button clicks, and task management
 */
export function useMessageHandlers(messages: ClineMessage[], chatState: ChatState): MessageHandlers {
	const logger = new WebviewLogger("MessageHandlers")
	const {
		setInputValue,
		activeQuote,
		setActiveQuote,
		setSelectedImages,
		setSelectedFiles,
		setSendingDisabled,
		setEnableButtons,
		clineAsk,
		pendingAskTs,
		lastMessage,
		markAskResponded,
	} = chatState

	// Handle sending a message
	// CARETI MODIFICATION: Fire-and-forget pattern for non-blocking UI
	const handleSendMessage = useCallback(
		async (text: string, images: string[], files: string[]) => {
			let messageToSend = text.trim()
			const hasContent = messageToSend || images.length > 0 || files.length > 0
			const lastAskMessage = findLast(messages, (message) => message.type === "ask" && !message.askResolved)
			const effectiveAsk = clineAsk ?? lastAskMessage?.ask
			const effectiveAskTs = pendingAskTs ?? lastAskMessage?.ts

			// Prepend the active quote if it exists
			if (activeQuote && hasContent) {
				const prefix = "[context] \n> "
				const formattedQuote = activeQuote
				const suffix = "\n[/context] \n\n"
				messageToSend = `${prefix} ${formattedQuote} ${suffix} ${messageToSend}`
			}

			if (hasContent) {
				let willSend = false

				logger.debug("handleSendMessage - Sending message", { messageToSend })

				// CARETI MODIFICATION: Determine if we will send BEFORE the async call
				// Also allow sending during streaming (message will be queued by backend)
				const isStreaming = lastMessage?.partial === true || lastMessage?.say === "api_req_started"

				if (messages.length === 0) {
					willSend = true
				} else if (isStreaming) {
					// CARETI MODIFICATION: Allow sending during streaming - message will be queued
					willSend = true
				} else if (effectiveAsk) {
					switch (effectiveAsk) {
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
							willSend = true
							break
					}
				}

				// CARETI MODIFICATION: Clear input IMMEDIATELY (fire-and-forget pattern)
				// This makes the UI feel responsive even while the backend processes
				if (willSend) {
					setInputValue("")
					setActiveQuote(null)
					setSendingDisabled(true)
					setSelectedImages([])
					setSelectedFiles([])
					setEnableButtons(false)

					// Reset auto-scroll
					if ("disableAutoScrollRef" in chatState) {
						;(chatState as any).disableAutoScrollRef.current = false
					}
				}

				// CARETI MODIFICATION: Make the actual API call (async, non-blocking)
				// Errors are logged but don't block the UI
				if (messages.length === 0) {
					TaskServiceClient.newTask(NewTaskRequest.create({ text: messageToSend, images, files })).catch((error) => {
						logger.error("Failed to create new task", error)
					})
				} else if (willSend) {
					// CARETI MODIFICATION: Send message even during streaming (will be queued by backend)
					TaskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType: "messageResponse",
							text: messageToSend,
							images,
							files,
						}),
					)
						.then(() => {
							// Only mark as responded if there was an actual ask to respond to
							if (effectiveAskTs) {
								markAskResponded(effectiveAskTs)
							}
						})
						.catch((error) => {
							logger.error("Failed to send message response", error)
						})
				}

				if (!willSend) {
					logger.warn("handleSendMessage: No pending ask to receive message response.", {
						clineAsk,
						effectiveAsk,
						lastAskMessage,
					})
				}
			}
		},
		[
			messages,
			clineAsk,
			activeQuote,
			setInputValue,
			setActiveQuote,
			setSendingDisabled,
			setSelectedImages,
			setSelectedFiles,
			setEnableButtons,
			pendingAskTs,
			markAskResponded,
			chatState,
		],
	)

	// Start a new task
	const startNewTask = useCallback(async () => {
		setActiveQuote(null)
		await TaskServiceClient.clearTask(EmptyRequest.create({}))
	}, [setActiveQuote])

	// Clear input state helper
	const clearInputState = useCallback(() => {
		setInputValue("")
		setActiveQuote(null)
		setSelectedImages([])
		setSelectedFiles([])
	}, [setInputValue, setActiveQuote, setSelectedImages, setSelectedFiles])

	// Execute button action based on type
	const executeButtonAction = useCallback(
		async (actionType: ButtonActionType, text?: string, images?: string[], files?: string[]) => {
			const trimmedInput = text?.trim()
			const hasContent = trimmedInput || (images && images.length > 0) || (files && files.length > 0)

			switch (actionType) {
				case "approve":
					if (hasContent) {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
								text: trimmedInput,
								images: images,
								files: files,
							}),
						)
						markAskResponded(pendingAskTs)
					} else {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
							}),
						)
						markAskResponded(pendingAskTs)
						clearInputState()
					}
					break

				case "reject":
					if (hasContent) {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "noButtonClicked",
								text: trimmedInput,
								images: images,
								files: files,
							}),
						)
						markAskResponded(pendingAskTs)
					} else {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "noButtonClicked",
							}),
						)
						markAskResponded(pendingAskTs)
					}
					clearInputState()
					break

				case "proceed":
					if (hasContent) {
						await handleSendMessage(trimmedInput || "", images || [], files || [])
					} else {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
							}),
						)
						markAskResponded(pendingAskTs)
						clearInputState()
					}
					break

				case "new_task":
					if (clineAsk === "new_task") {
						logger.info("new task button clicked", {
							lastMessage,
							messages,
							clineAsk,
							text,
						})
						await TaskServiceClient.newTask(
							NewTaskRequest.create({
								text: lastMessage?.text,
								images: [],
								files: [],
							}),
						)
						markAskResponded(pendingAskTs)
					} else {
						await startNewTask()
					}
					break

				case "cancel":
					// CARETI MODIFICATION: Use double-press pattern for cancel
					// First press sets warning state, second press actually cancels
					await TaskServiceClient.tryInterruptTask(EmptyRequest.create({}))
					return // Don't disable buttons for cancel

				case "utility":
					switch (clineAsk) {
						case "condense":
							await SlashServiceClient.condense(StringRequest.create({ value: lastMessage?.text })).catch((err) =>
								logger.error("Failed to condense", err),
							)
							markAskResponded(pendingAskTs)
							break
						case "report_bug":
							await SlashServiceClient.reportBug(StringRequest.create({ value: lastMessage?.text })).catch((err) =>
								logger.error("Failed to report bug", err),
							)
							markAskResponded(pendingAskTs)
							break
					}
					break
			}

			if ("disableAutoScrollRef" in chatState) {
				;(chatState as any).disableAutoScrollRef.current = false
			}
		},
		[
			clineAsk,
			lastMessage,
			messages,
			clearInputState,
			handleSendMessage,
			startNewTask,
			chatState,
			pendingAskTs,
			markAskResponded,
		],
	)

	// Unified button click handler that takes action directly
	const handleButtonClick = useCallback(
		async (action: string, text?: string, images?: string[], files?: string[]) => {
			// Map action strings to ButtonActionType
			let actionType: ButtonActionType

			switch (action) {
				case "Approve":
				case "Save":
				case "Run Command":
				case "Retry":
				case "Switch to Act Mode":
					actionType = "approve"
					break
				case "Reject":
					actionType = "reject"
					break
				case "Proceed":
				case "Proceed Anyways":
				case "Proceed While Running":
				case "Resume Task":
					actionType = "proceed"
					break
				case "Start New Task":
				case "Start New Task with Context":
					actionType = "new_task"
					break
				case "Cancel":
					actionType = "cancel"
					break
				case "Condense Conversation":
				case "Report GitHub issue":
					actionType = "utility"
					break
				default:
					console.warn(`Unknown action: ${action}`)
					return
			}

			await executeButtonAction(actionType, text, images, files)
		},
		[executeButtonAction],
	)

	// Handle task close button click
	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask()
	}, [startNewTask])

	return {
		handleSendMessage,
		handleButtonClick,
		executeButtonAction,
		handleTaskCloseButtonClick,
		startNewTask,
	}
}
