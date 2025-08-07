import { findLast } from "@shared/array"
import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"
import type { ClineApiReqInfo, ClineMessage } from "@shared/ExtensionMessage"
import { getApiMetrics } from "@shared/getApiMetrics"
import { BooleanRequest, EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import { useCallback, useEffect, useMemo } from "react"
import { useMount } from "react-use"
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { FileServiceClient, UiServiceClient } from "@/services/grpc-client"
import { Navbar } from "../menu/Navbar"
// Import utilities and hooks from the new structure
import {
	ActionButtons,
	CHAT_CONSTANTS,
	ChatLayout,
	convertHtmlToMarkdown,
	filterVisibleMessages,
	groupMessages,
	InputSection,
	MessagesArea,
	TaskSection,
	useButtonState,
	useChatState,
	useIsStreaming,
	useMessageHandlers,
	useScrollBehavior,
	WelcomeSection,
} from "./chat-view"
import AutoApproveBar from "./auto-approve-menu/AutoApproveBar"
<<<<<<< HEAD
import { SuggestedTasks } from "../welcome/SuggestedTasks"
import { BooleanRequest, EmptyRequest, StringRequest } from "@shared/proto/common"
import { AskResponseRequest, NewTaskRequest } from "@shared/proto/task"
import { t } from "@/caret/utils/i18n"
import WebviewLogger from "@/caret/utils/webview-logger" // CARET MODIFICATION: Import logger

const logger = new WebviewLogger("ChatView") // CARET MODIFICATION: Instantiate logger outside component
=======
>>>>>>> upstream/main

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
}

// Use constants from the imported module
const MAX_IMAGES_AND_FILES_PER_MESSAGE = CHAT_CONSTANTS.MAX_IMAGES_AND_FILES_PER_MESSAGE

const IS_STANDALONE = window?.__is_standalone__ ?? false

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView }: ChatViewProps) => {
	const {
		version,
		clineMessages: messages,
		taskHistory,
		apiConfiguration,
		telemetrySetting,
		navigateToChat,
		mode,
	} = useExtensionState()
	const shouldShowQuickWins = false // !taskHistory || taskHistory.length < QUICK_WINS_HISTORY_THRESHOLD
	//const task = messages.length > 0 ? (messages[0].say === "task" ? messages[0] : undefined) : undefined) : undefined
	const task = useMemo(() => messages.at(0), [messages]) // leaving this less safe version here since if the first message is not a task, then the extension is in a bad state and needs to be debugged (see Cline.abort)
	const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(messages.slice(1))), [messages])
	// has to be after api_req_finished are all reduced into api_req_started messages
	const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

	const lastApiReqTotalTokens = useMemo(() => {
		const getTotalTokensFromApiReqMessage = (msg: ClineMessage) => {
			if (!msg.text) return 0
			const { tokensIn, tokensOut, cacheWrites, cacheReads }: ClineApiReqInfo = JSON.parse(msg.text)
			return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
		}
		const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
			if (msg.say !== "api_req_started") return false
			return getTotalTokensFromApiReqMessage(msg) > 0
		})
		if (!lastApiReqMessage) return undefined
		return getTotalTokensFromApiReqMessage(lastApiReqMessage)
	}, [modifiedMessages])

	// Use custom hooks for state management
	const chatState = useChatState(messages)
	const {
		inputValue,
		setInputValue,
		activeQuote,
		setActiveQuote,
		isTextAreaFocused,
		selectedImages,
		setSelectedImages,
		selectedFiles,
		setSelectedFiles,
		sendingDisabled,
		enableButtons,
		primaryButtonText,
		secondaryButtonText,
		didClickCancel,
		expandedRows,
		setExpandedRows,
		textAreaRef,
		handleFocusChange,
		clineAsk,
	} = chatState

	useEffect(() => {
		const handleCopy = async (e: ClipboardEvent) => {
			const targetElement = e.target as HTMLElement | null
			// If the copy event originated from an input or textarea,
			// let the default browser behavior handle it.
			if (
				targetElement &&
				(targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA" || targetElement.isContentEditable)
			) {
				return
			}

			if (window.getSelection) {
				const selection = window.getSelection()
				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0)
					const commonAncestor = range.commonAncestorContainer
					let textToCopy: string | null = null

					// Check if the selection is inside an element where plain text copy is preferred
					let currentElement =
						commonAncestor.nodeType === Node.ELEMENT_NODE
							? (commonAncestor as HTMLElement)
							: commonAncestor.parentElement
					let preferPlainTextCopy = false
					while (currentElement) {
						if (currentElement.tagName === "PRE" && currentElement.querySelector("code")) {
							preferPlainTextCopy = true
							break
						}
						// Check computed white-space style
						const computedStyle = window.getComputedStyle(currentElement)
						if (
							computedStyle.whiteSpace === "pre" ||
							computedStyle.whiteSpace === "pre-wrap" ||
							computedStyle.whiteSpace === "pre-line"
						) {
							// If the element itself or an ancestor has pre-like white-space,
							// and the selection is likely contained within it, prefer plain text.
							// This helps with elements like the TaskHeader's text display.
							preferPlainTextCopy = true
							break
						}

						// Stop searching if we reach a known chat message boundary or body
						if (
							currentElement.classList.contains("chat-row-assistant-message-container") ||
							currentElement.classList.contains("chat-row-user-message-container") ||
							currentElement.tagName === "BODY"
						) {
							break
						}
						currentElement = currentElement.parentElement
					}

					if (preferPlainTextCopy) {
						// For code blocks or elements with pre-formatted white-space, get plain text.
						textToCopy = selection.toString()
					} else {
						// For other content, use the existing HTML-to-Markdown conversion
						const clonedSelection = range.cloneContents()
						const div = document.createElement("div")
						div.appendChild(clonedSelection)
						const selectedHtml = div.innerHTML
						textToCopy = await convertHtmlToMarkdown(selectedHtml)
					}

					if (textToCopy !== null) {
						try {
							FileServiceClient.copyToClipboard(StringRequest.create({ value: textToCopy })).catch((err) => {
								console.error("Error copying to clipboard:", err)
							})
							e.preventDefault()
						} catch (error) {
							console.error("Error copying to clipboard:", error)
						}
					}
				}
			}
		}
		document.addEventListener("copy", handleCopy)

		return () => {
			document.removeEventListener("copy", handleCopy)
		}
	}, [])
<<<<<<< HEAD

	// UI layout depends on the last 2 messages
	// (since it relies on the content of these messages, we are deep comparing. i.e. the button state after hitting button sets enableButtons to false, and this effect otherwise would have to true again even if messages didn't change
	const lastMessage = useMemo(() => messages.at(-1), [messages])
	const secondLastMessage = useMemo(() => messages.at(-2), [messages])
	useDeepCompareEffect(() => {
		if (lastMessage) {
			logger.info("useDeepCompareEffect triggered", { lastMessage })
			switch (lastMessage.type) {
				case "ask":
					const isPartial = lastMessage.partial === true
					logger.info(`Processing 'ask' message. Type: ${lastMessage.ask}, Partial: ${isPartial}`)
					switch (lastMessage.ask) {
						case "api_req_failed":
							logger.info("State: api_req_failed. Disabling input.")
							setSendingDisabled(true)
							setClineAsk("api_req_failed")
							setEnableButtons(true)
							setPrimaryButtonText("Retry")
							setSecondaryButtonText("Start New Task")
							break
						case "mistake_limit_reached":
							logger.info("State: mistake_limit_reached. Enabling input.")
							setSendingDisabled(false)
							setClineAsk("mistake_limit_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed Anyways")
							setSecondaryButtonText("Start New Task")
							break
						case "auto_approval_max_req_reached":
							logger.info("State: auto_approval_max_req_reached. Disabling input.")
							setSendingDisabled(true)
							setClineAsk("auto_approval_max_req_reached")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed")
							setSecondaryButtonText("Start New Task")
							break
						case "followup":
							logger.info(`State: followup. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("followup")
							setEnableButtons(false)
							break
						case "plan_mode_respond":
							logger.info(`State: plan_mode_respond. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("plan_mode_respond")
							setEnableButtons(false)
							break
						case "chatbot_mode_respond":
							logger.info(`State: chatbot_mode_respond. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("chatbot_mode_respond")
							setEnableButtons(false)
							break
						case "tool":
							logger.info(`State: tool. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("tool")
							setEnableButtons(!isPartial)
							const tool = JSON.parse(lastMessage.text || "{}") as ClineSayTool
							switch (tool.tool) {
								case "editedExistingFile":
								case "newFileCreated":
									setPrimaryButtonText("Save")
									setSecondaryButtonText("Reject")
									break
								default:
									setPrimaryButtonText("Approve")
									setSecondaryButtonText("Reject")
									break
							}
							break
						case "browser_action_launch":
							logger.info(`State: browser_action_launch. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("browser_action_launch")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Approve")
							setSecondaryButtonText("Reject")
							break
						case "command":
							logger.info(`State: command. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("command")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Run Command")
							setSecondaryButtonText("Reject")
							break
						case "command_output":
							logger.info("State: command_output. Enabling input.")
							setSendingDisabled(false)
							setClineAsk("command_output")
							setEnableButtons(true)
							setPrimaryButtonText("Proceed While Running")
							setSecondaryButtonText(undefined)
							break
						case "use_mcp_server":
							logger.info(`State: use_mcp_server. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("use_mcp_server")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Approve")
							setSecondaryButtonText("Reject")
							break
						case "completion_result":
							logger.info(`State: completion_result. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("completion_result")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							logger.info("State: resume_task. Enabling input.")
							setSendingDisabled(false)
							setClineAsk("resume_task")
							setEnableButtons(true)
							setPrimaryButtonText("Resume Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "resume_completed_task":
							logger.info("State: resume_completed_task. Enabling input.")
							setSendingDisabled(false)
							setClineAsk("resume_completed_task")
							setEnableButtons(true)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "new_task":
							logger.info(`State: new_task. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("new_task")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Start New Task with Context")
							setSecondaryButtonText(undefined)
							break
						case "condense":
							logger.info(`State: condense. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("condense")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Condense Conversation")
							setSecondaryButtonText(undefined)
							break
						case "report_bug":
							logger.info(`State: report_bug. Input disabled: ${isPartial}`)
							setSendingDisabled(isPartial)
							setClineAsk("report_bug")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Report GitHub issue")
							setSecondaryButtonText(undefined)
							break
					}
					break
				case "say":
					logger.info(`Processing 'say' message. Type: ${lastMessage.say}`)
					switch (lastMessage.say) {
						case "api_req_started":
							if (secondLastMessage?.ask === "command_output") {
								logger.info("State: api_req_started after command_output. Keeping input enabled.")
								setInputValue("")
								setSendingDisabled(false)
								setSelectedImages([])
								setSelectedFiles([])
								setClineAsk("command_output")
								setEnableButtons(false)
							} else {
								logger.info("State: api_req_started. Disabling input.")
								setInputValue("")
								setSendingDisabled(true)
								setSelectedImages([])
								setSelectedFiles([])
								setClineAsk(undefined)
								setEnableButtons(false)
							}
							break
						case "command":
						case "browser_action":
						case "browser_action_launch":
						case "browser_action_result":
						case "command_output":
							logger.info(`State: Interactive 'say' (${lastMessage.say}). Enabling input.`)
							setSendingDisabled(false)
							if (lastMessage.say === "browser_action" || lastMessage.say === "browser_action_launch") {
								setClineAsk("browser_action")
							} else if (lastMessage.say === "command" || lastMessage.say === "command_output") {
								setClineAsk("command_output")
							}
							break
						case "task":
						case "error":
						case "api_req_finished":
						case "text":
						case "use_mcp_server":
						case "mcp_server_request_started":
						case "mcp_server_response":
						case "completion_result":
						case "tool":
						case "load_mcp_documentation":
							if (!clineAsk) {
								logger.info(
									`State: Non-interactive 'say' (${lastMessage.say}). Disabling input as no 'ask' is active.`,
								)
								setSendingDisabled(true)
							} else {
								logger.info(
									`State: Non-interactive 'say' (${lastMessage.say}). Input remains in state determined by active 'ask': ${clineAsk}`,
								)
							}
							break
					}
					break
			}
		} else {
			logger.info("No last message, ensuring input is enabled.")
			// this would get called after sending the first message, so we have to watch messages.length instead
			// No messages, so user has to submit a task
			// setTextAreaDisabled(false)
			// setClineAsk(undefined)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
		}
	}, [lastMessage, secondLastMessage, logger])

	useEffect(() => {
		if (messages.length === 0) {
			setSendingDisabled(false)
			setClineAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText("Approve")
			setSecondaryButtonText("Reject")
		}
	}, [messages.length])
=======
	// Button state is now managed by useButtonState hook
>>>>>>> upstream/main

	useEffect(() => {
		setExpandedRows({})
	}, [task?.ts])

	// Use streaming hook
	const isStreaming = useIsStreaming(modifiedMessages, clineAsk, enableButtons, primaryButtonText)

	// handleFocusChange is already provided by chatState

	// Use button state hook
	useButtonState(messages, chatState)

<<<<<<< HEAD
	const handleSendMessage = useCallback(
		async (text: string, images: string[], files: string[]) => {
			let messageToSend = text.trim()
			const hasContent = messageToSend || images.length > 0 || files.length > 0

			// Prepend the active quote if it exists
			if (activeQuote && hasContent) {
				const prefix = "[context] \n> "
				const formattedQuote = activeQuote
				const suffix = "\n[/context] \n\n"
				messageToSend = `${prefix} ${formattedQuote} ${suffix} ${messageToSend}`
			}

			if (hasContent) {
				logger.info(`[ChatView] handleSendMessage - Sending message: "${messageToSend}" with ask type: ${clineAsk}`)
				// Optimistically update the UI with the user's message
				// This will be replaced by the actual state update from the backend
				const optimisticMessage: ClineMessage = {
					type: "say",
					say: "user_feedback",
					text: messageToSend,
					ts: Date.now(),
				}
				// This is a trick to update the messages array in the UI
				// without waiting for the backend response.
				const currentState = vscode.getState() as any
				vscode.setState({
					...currentState,
					clineMessages: [...(currentState?.clineMessages || []), optimisticMessage],
				})

				if (messages.length === 0) {
					await TaskServiceClient.newTask(NewTaskRequest.create({ text: messageToSend, images, files }))
				} else if (clineAsk) {
					await TaskServiceClient.askResponse(
						AskResponseRequest.create({
							responseType: "messageResponse",
							text: messageToSend,
							images,
							files,
						}),
					)
				}

				setInputValue("")
				setActiveQuote(null)
				setSelectedImages([])
				setSelectedFiles([])

				// Do not disable input if we are in an interactive tool mode
				if (clineAsk !== "browser_action" && clineAsk !== "command_output") {
					logger.info("handleSendMessage: Not an interactive tool, disabling input.")
					setSendingDisabled(true)
					setClineAsk(undefined)
					setEnableButtons(false)
				} else {
					logger.info("handleSendMessage: Interactive tool, keeping input enabled.")
				}

				disableAutoScrollRef.current = false
			}
		},
		[messages.length, clineAsk, activeQuote],
	)

	const startNewTask = useCallback(async () => {
		setActiveQuote(null) // Clear the active quote state
		await TaskServiceClient.clearTask(EmptyRequest.create({}))
	}, [])

	/*
	This logic depends on the useEffect[messages] above to set clineAsk, after which buttons are shown and we then send an askResponse to the extension.
	*/
	const handlePrimaryButtonClick = useCallback(
		async (text?: string, images?: string[], files?: string[]) => {
			const trimmedInput = text?.trim()
			switch (clineAsk) {
				case "api_req_failed":
				case "command":
				case "command_output":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
				case "resume_task":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					if (trimmedInput || (images && images.length > 0) || (files && files.length > 0)) {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
								text: trimmedInput,
								images: images,
								files: files,
							}),
						)
					} else {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
							}),
						)
					}
					// Clear input state after sending
					setInputValue("")
					setActiveQuote(null) // Clear quote when using primary button
					setSelectedImages([])
					setSelectedFiles([])
					break
				case "completion_result":
				case "resume_completed_task":
					// extension waiting for feedback. but we can just present a new task button
					startNewTask()
					break
				case "new_task":
					console.info("new task button clicked!", { lastMessage, messages, clineAsk, text })
					await TaskServiceClient.newTask(
						NewTaskRequest.create({
							text: lastMessage?.text,
							images: [],
							files: [],
						}),
					)
					break
				case "condense":
					await SlashServiceClient.condense(StringRequest.create({ value: lastMessage?.text })).catch((err) =>
						console.error(err),
					)
					break
				case "report_bug":
					await SlashServiceClient.reportBug(StringRequest.create({ value: lastMessage?.text })).catch((err) =>
						console.error(err),
					)
					break
			}
			setSendingDisabled(true)
			setClineAsk(undefined)
			setEnableButtons(false)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
			disableAutoScrollRef.current = false
		},
		[clineAsk, startNewTask, lastMessage],
	)

	const handleSecondaryButtonClick = useCallback(
		async (text?: string, images?: string[], files?: string[]) => {
			const trimmedInput = text?.trim()
			if (isStreaming) {
				await TaskServiceClient.cancelTask(EmptyRequest.create({}))
				setDidClickCancel(true)
				return
			}

			switch (clineAsk) {
				case "api_req_failed":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					startNewTask()
					break
				case "command":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
					if (trimmedInput || (images && images.length > 0) || (files && files.length > 0)) {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "noButtonClicked",
								text: trimmedInput,
								images: images,
								files: files,
							}),
						)
					} else {
						// responds to the API with a "This operation failed" and lets it try again
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "noButtonClicked",
							}),
						)
					}
					// Clear input state after sending
					setInputValue("")
					setActiveQuote(null) // Clear quote when using secondary button
					setSelectedImages([])
					setSelectedFiles([])
					break
			}
			setSendingDisabled(true)
			setClineAsk(undefined)
			setEnableButtons(false)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
			disableAutoScrollRef.current = false
		},
		[clineAsk, startNewTask, isStreaming],
	)

	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask()
	}, [startNewTask])

	const handleFocusChange = useCallback((isFocused: boolean) => {
		setIsTextAreaFocused(isFocused)
	}, [])
=======
	// Use message handlers hook
	const messageHandlers = useMessageHandlers(messages, chatState, isStreaming)
>>>>>>> upstream/main

	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration, mode)
	}, [apiConfiguration, mode])

	const selectFilesAndImages = useCallback(async () => {
		try {
			const response = await FileServiceClient.selectFiles(
				BooleanRequest.create({
					value: selectedModelInfo.supportsImages,
				}),
			)
			if (
				response &&
				response.values1 &&
				response.values2 &&
				(response.values1.length > 0 || response.values2.length > 0)
			) {
				const currentTotal = selectedImages.length + selectedFiles.length
				const availableSlots = MAX_IMAGES_AND_FILES_PER_MESSAGE - currentTotal

				if (availableSlots > 0) {
					// Prioritize images first
					const imagesToAdd = Math.min(response.values1.length, availableSlots)
					if (imagesToAdd > 0) {
						setSelectedImages((prevImages) => [...prevImages, ...response.values1.slice(0, imagesToAdd)])
					}

					// Use remaining slots for files
					const remainingSlots = availableSlots - imagesToAdd
					if (remainingSlots > 0) {
						setSelectedFiles((prevFiles) => [...prevFiles, ...response.values2.slice(0, remainingSlots)])
					}
				}
			}
		} catch (error) {
			console.error("Error selecting images & files:", error)
		}
	}, [selectedModelInfo.supportsImages])

	const shouldDisableFilesAndImages = selectedImages.length + selectedFiles.length >= MAX_IMAGES_AND_FILES_PER_MESSAGE

	// Listen for local focusChatInput event
	useEffect(() => {
		const handleFocusChatInput = () => {
			if (isHidden) {
				navigateToChat()
			}
			textAreaRef.current?.focus()
		}

		window.addEventListener("focusChatInput", handleFocusChatInput)

		return () => {
			window.removeEventListener("focusChatInput", handleFocusChatInput)
		}
	}, [isHidden])

	// Set up addToInput subscription
	useEffect(() => {
		const cleanup = UiServiceClient.subscribeToAddToInput(EmptyRequest.create({}), {
			onResponse: (event) => {
				if (event.value) {
					setInputValue((prevValue) => {
						const newText = event.value
						const newTextWithNewline = newText + "\n"
						return prevValue ? `${prevValue}\n${newTextWithNewline}` : newTextWithNewline
					})
					// Add scroll to bottom after state update
					// Auto focus the input and start the cursor on a new line for easy typing
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
							textAreaRef.current.focus()
						}
					}, 0)
				}
			},
			onError: (error) => {
				console.error("Error in addToInput subscription:", error)
			},
			onComplete: () => {
				console.log("addToInput subscription completed")
			},
		})

		return cleanup
	}, [])

	useMount(() => {
		// NOTE: the vscode window needs to be focused for this to work
		textAreaRef.current?.focus()
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isHidden && !sendingDisabled && !enableButtons) {
				textAreaRef.current?.focus()
			}
		}, 50)
		return () => {
			clearTimeout(timer)
		}
	}, [isHidden, sendingDisabled, enableButtons])

	const visibleMessages = useMemo(() => {
		return filterVisibleMessages(modifiedMessages)
	}, [modifiedMessages])

	const groupedMessages = useMemo(() => {
		return groupMessages(visibleMessages)
	}, [visibleMessages])

	// Use scroll behavior hook
	const scrollBehavior = useScrollBehavior(messages, visibleMessages, groupedMessages, expandedRows, setExpandedRows)

	const placeholderText = useMemo(() => {
		const text = task ? t("chat.typeMessage", "common") : t("chat.typeTaskHere", "common")
		return text
	}, [task])

	return (
		<ChatLayout isHidden={isHidden}>
			<div className="flex flex-col flex-1 overflow-hidden">
				{IS_STANDALONE && <Navbar />}
				{task ? (
					<TaskSection
						task={task}
						apiMetrics={apiMetrics}
						selectedModelInfo={{
							supportsPromptCache: selectedModelInfo.supportsPromptCache,
							supportsImages: selectedModelInfo.supportsImages || false,
						}}
						lastApiReqTotalTokens={lastApiReqTotalTokens}
						messageHandlers={messageHandlers}
						scrollBehavior={scrollBehavior}
					/>
				) : (
					<WelcomeSection
						telemetrySetting={telemetrySetting}
						showAnnouncement={showAnnouncement}
						version={version}
						hideAnnouncement={hideAnnouncement}
						shouldShowQuickWins={shouldShowQuickWins}
						taskHistory={taskHistory}
						showHistoryView={showHistoryView}
					/>
				)}
				{task && (
					<MessagesArea
						task={task}
						groupedMessages={groupedMessages}
						modifiedMessages={modifiedMessages}
						scrollBehavior={scrollBehavior}
						chatState={chatState}
						messageHandlers={messageHandlers}
					/>
				)}
			</div>
			<footer className="bg-[var(--vscode-sidebar-background)]" style={{ gridRow: "2" }}>
				<AutoApproveBar />
				{task && (
					<ActionButtons
						chatState={chatState}
						messageHandlers={messageHandlers}
						isStreaming={isStreaming}
						scrollBehavior={{
							scrollToBottomSmooth: scrollBehavior.scrollToBottomSmooth,
							disableAutoScrollRef: scrollBehavior.disableAutoScrollRef,
							showScrollToBottom: scrollBehavior.showScrollToBottom,
						}}
					/>
				)}
				<InputSection
					chatState={chatState}
					messageHandlers={messageHandlers}
					scrollBehavior={scrollBehavior}
					placeholderText={placeholderText}
					shouldDisableFilesAndImages={shouldDisableFilesAndImages}
					selectFilesAndImages={selectFilesAndImages}
				/>
<<<<<<< HEAD
			) : (
				<div
					style={{
						flex: "1 1 0", // flex-grow: 1, flex-shrink: 1, flex-basis: 0
						minHeight: 0,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						paddingBottom: "10px",
					}}>
					{telemetrySetting === "unset" && <TelemetryBanner />}

					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}

					<HomeHeader />
					{!shouldShowQuickWins && taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
				</div>
			)}

			{!task && (
				<>
					<SuggestedTasks shouldShowQuickWins={shouldShowQuickWins} />
					<AutoApproveBar />
				</>
			)}

			{task && (
				<>
					<div style={{ flexGrow: 1, display: "flex" }} ref={scrollContainerRef}>
						<Virtuoso
							ref={virtuosoRef}
							key={task.ts} // trick to make sure virtuoso re-renders when task changes, and we use initialTopMostItemIndex to start at the bottom
							className="scrollable"
							style={{
								flexGrow: 1,
								overflowY: "scroll", // always show scrollbar
							}}
							components={{
								Footer: () => <div style={{ height: 5 }} />, // Add empty padding at the bottom
							}}
							// increasing top by 3_000 to prevent jumping around when user collapses a row
							increaseViewportBy={{
								top: 3_000,
								bottom: Number.MAX_SAFE_INTEGER,
							}} // hack to make sure the last message is always rendered to get truly perfect scroll to bottom animation when new messages are added (Number.MAX_SAFE_INTEGER is safe for arithmetic operations, which is all virtuoso uses this value for in src/sizeRangeSystem.ts)
							data={groupedMessages} // messages is the raw format returned by extension, modifiedMessages is the manipulated structure that combines certain messages of related type, and visibleMessages is the filtered structure that removes messages that should not be rendered
							itemContent={itemContent}
							atBottomStateChange={(isAtBottom) => {
								setIsAtBottom(isAtBottom)
								if (isAtBottom) {
									disableAutoScrollRef.current = false
								}
								setShowScrollToBottom(disableAutoScrollRef.current && !isAtBottom)
							}}
							atBottomThreshold={10} // anything lower causes issues with followOutput
							initialTopMostItemIndex={groupedMessages.length - 1}
						/>
					</div>
					<AutoApproveBar />
					{showScrollToBottom ? (
						<div
							style={{
								display: "flex",
								padding: "10px 15px 0px 15px",
							}}>
							<ScrollToBottomButton
								onClick={() => {
									scrollToBottomSmooth()
									disableAutoScrollRef.current = false
								}}>
								<span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>
							</ScrollToBottomButton>
						</div>
					) : (
						<div
							style={{
								opacity:
									primaryButtonText || secondaryButtonText || isStreaming
										? enableButtons || (isStreaming && !didClickCancel)
											? 1
											: 0.5
										: 0,
								display: "flex",
								padding: `${primaryButtonText || secondaryButtonText || isStreaming ? "10" : "0"}px 15px 0px 15px`,
							}}>
							{primaryButtonText && !isStreaming && (
								<VSCodeButton
									appearance="primary"
									disabled={!enableButtons}
									style={{
										flex: secondaryButtonText ? 1 : 2,
										marginRight: secondaryButtonText ? "6px" : "0",
									}}
									onClick={() => handlePrimaryButtonClick(inputValue, selectedImages, selectedFiles)}>
									{primaryButtonText}
								</VSCodeButton>
							)}
							{(secondaryButtonText || isStreaming) && (
								<VSCodeButton
									appearance="secondary"
									disabled={!enableButtons && !(isStreaming && !didClickCancel)}
									style={{
										flex: isStreaming ? 2 : 1,
										marginLeft: isStreaming ? 0 : "6px",
									}}
									onClick={() => handleSecondaryButtonClick(inputValue, selectedImages, selectedFiles)}>
									{isStreaming ? t("chat.cancel", "common") : secondaryButtonText}
								</VSCodeButton>
							)}
						</div>
					)}
				</>
			)}
			{(() => {
				return activeQuote ? (
					<div style={{ marginBottom: "-12px", marginTop: "10px" }}>
						<QuotedMessagePreview
							text={activeQuote}
							onDismiss={() => setActiveQuote(null)}
							isFocused={isTextAreaFocused}
						/>
					</div>
				) : null
			})()}

			<ChatTextArea
				ref={textAreaRef}
				onFocusChange={handleFocusChange}
				activeQuote={activeQuote}
				inputValue={inputValue}
				setInputValue={setInputValue}
				sendingDisabled={sendingDisabled}
				placeholderText={placeholderText}
				selectedImages={selectedImages}
				setSelectedImages={setSelectedImages}
				setSelectedFiles={setSelectedFiles}
				selectedFiles={selectedFiles}
				onSend={() => handleSendMessage(inputValue, selectedImages, selectedFiles)}
				onSelectFilesAndImages={selectFilesAndImages}
				shouldDisableFilesAndImages={shouldDisableFilesAndImages}
				onHeightChange={() => {
					if (isAtBottom) {
						scrollToBottomAuto()
					}
				}}
			/>
		</div>
=======
			</footer>
		</ChatLayout>
>>>>>>> upstream/main
	)
}

export default ChatView
