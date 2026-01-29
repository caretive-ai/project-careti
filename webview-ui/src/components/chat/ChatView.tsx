import { findLast } from "@shared/array"
import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"
import type { ClineApiReqInfo, ClineMessage } from "@shared/ExtensionMessage"
import { getApiMetrics } from "@shared/getApiMetrics"
import { BooleanRequest, EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import { useCallback, useEffect, useMemo } from "react"
import { useMount } from "react-use"
import { usePersistentInputHistory } from "@/careti/hooks/usePersistentInputHistory"; // CARETI MODIFICATION: Persistent input history
// CARETI MODIFICATION: use CaretiWebviewLogger for webview logs
import WebviewLogger from "@/careti/utils/CaretiWebviewLogger"
import { t } from "@/careti/utils/i18n"
// CARETI MODIFICATION: use careti image optimization utilities
import { optimizeImageDataUrl } from "@/careti/utils/imageOptimization"
// CARETI MODIFICATION: Attach mention images before sending
import { prepareMentionImagePayload } from "@/careti/utils/mention-image"
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { FileServiceClient, UiServiceClient } from "@/services/grpc-client"
import { Navbar } from "../menu/Navbar"
import AutoApproveBar from "./auto-approve-menu/AutoApproveBar"
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
    useChatState,
    useMessageHandlers,
    useScrollBehavior,
    WelcomeSection,
} from "./chat-view"

interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
}

// Use constants from the imported module
const MAX_IMAGES_AND_FILES_PER_MESSAGE = CHAT_CONSTANTS.MAX_IMAGES_AND_FILES_PER_MESSAGE
const QUICK_WINS_HISTORY_THRESHOLD = 3

const IS_STANDALONE = window?.__is_standalone__ ?? false
const logger = new WebviewLogger("ChatView")

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView }: ChatViewProps) => {
	const {
		version,
		clineMessages: messages,
		taskHistory,
		apiConfiguration,
		telemetrySetting,
		navigateToChat,
		mode,
		userInfo,
		currentFocusChainChecklist,
	} = useExtensionState()
	const isProdHostedApp = userInfo?.apiBaseUrl === "https://app.cline.bot"
	const shouldShowQuickWins = isProdHostedApp && (!taskHistory || taskHistory.length < QUICK_WINS_HISTORY_THRESHOLD)

	//const task = messages.length > 0 ? (messages[0].say === "task" ? messages[0] : undefined) : undefined) : undefined
	const task = useMemo(() => messages.at(0), [messages]) // leaving this less safe version here since if the first message is not a task, then the extension is in a bad state and needs to be debugged (see Cline.abort)
	const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(messages.slice(1))), [messages])
	// has to be after api_req_finished are all reduced into api_req_started messages
	const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

	const lastApiReqTotalTokens = useMemo(() => {
		const getTotalTokensFromApiReqMessage = (msg: ClineMessage) => {
			if (!msg.text) {
				return 0
			}
			const { tokensIn, tokensOut, cacheWrites, cacheReads }: ClineApiReqInfo = JSON.parse(msg.text)
			return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
		}
		const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
			if (msg.say !== "api_req_started") {
				return false
			}
			return getTotalTokensFromApiReqMessage(msg) > 0
		})
		if (!lastApiReqMessage) {
			return undefined
		}
		return getTotalTokensFromApiReqMessage(lastApiReqMessage)
	}, [modifiedMessages])

	// Use custom hooks for state management
	const chatState = useChatState(messages)
	const {
		setInputValue,
		selectedImages,
		setSelectedImages,
		selectedFiles,
		setSelectedFiles,
		sendingDisabled,
		enableButtons,
		expandedRows,
		setExpandedRows,
		textAreaRef,
		handleFocusChange,
		activeQuote,
		setActiveQuote,
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
								logger.error("Error copying to clipboard", err)
							})
							e.preventDefault()
						} catch (error) {
							logger.error("Error copying to clipboard", error)
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
	// Button state is now managed by useButtonState hook

	useEffect(() => {
		setExpandedRows({})
	}, [task?.ts])

	// handleFocusChange is already provided by chatState

	// Use message handlers hook
	const messageHandlers = useMessageHandlers(messages, chatState)

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
				const optimizedImages = await Promise.all(
					response.values1.map(async (dataUrl) => {
						try {
							return await optimizeImageDataUrl(dataUrl)
						} catch (error) {
							logger.warn((error as Error).message)
							return null
						}
					}),
				)
				const filteredImages = optimizedImages.filter((dataUrl): dataUrl is string => dataUrl !== null)
				const currentTotal = selectedImages.length + selectedFiles.length
				const availableSlots = MAX_IMAGES_AND_FILES_PER_MESSAGE - currentTotal

				if (availableSlots > 0) {
					// Prioritize images first
					const imagesToAdd = Math.min(filteredImages.length, availableSlots)
					if (imagesToAdd > 0) {
						setSelectedImages((prevImages) => [...prevImages, ...filteredImages.slice(0, imagesToAdd)])
					}

					// Use remaining slots for files
					const remainingSlots = availableSlots - imagesToAdd
					if (remainingSlots > 0) {
						setSelectedFiles((prevFiles) => [...prevFiles, ...response.values2.slice(0, remainingSlots)])
					}
				}
			}
		} catch (error) {
			logger.error(t("errorSelectingFilesImages", "chat"), error)
		}
	}, [selectedModelInfo.supportsImages, selectedImages, selectedFiles])

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
	}, [isHidden, navigateToChat, textAreaRef])

	// Set up addToInput subscription
	useEffect(() => {
		// CARETI MODIFICATION: match Cline behavior and subscribe unconditionally so Careti (not Cline) always receives queued Add-to events
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
				logger.error(t("errorInAddToInputSubscription", "chat"), error)
			},
			onComplete: () => {
				logger.info(t("addToInputSubscriptionCompleted", "chat"))
			},
		})

		return cleanup
	}, [setInputValue, textAreaRef])

	useMount(() => {
		// NOTE: the vscode window needs to be focused for this to work
		textAreaRef.current?.focus()
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isHidden && !sendingDisabled && enableButtons) {
				// Corrected enableButtons condition
				textAreaRef.current?.focus()
			}
		}, 50)
		return () => {
			clearTimeout(timer)
		}
	}, [isHidden, sendingDisabled, enableButtons, textAreaRef])

	const visibleMessages = useMemo(() => {
		return filterVisibleMessages(modifiedMessages)
	}, [modifiedMessages])

	const lastProgressMessageText = useMemo(() => {
		// First check if we have a current focus chain list from the extension state
		if (currentFocusChainChecklist) {
			return currentFocusChainChecklist
		}

		// Fall back to the last task_progress message if no state focus chain list
		const lastProgressMessage = [...modifiedMessages].reverse().find((message) => message.say === "task_progress")
		return lastProgressMessage?.text
	}, [modifiedMessages, currentFocusChainChecklist])

	const groupedMessages = useMemo(() => {
		return groupMessages(visibleMessages)
	}, [visibleMessages])

	// CARETI MODIFICATION: Persistent input history functionality
	const { inputHistory, addToHistory } = usePersistentInputHistory()

	// CARETI MODIFICATION: Enhanced message handler with history tracking
	const enhancedMessageHandlers = useMemo(
		() => ({
			...messageHandlers,
			handleSendMessage: async (text: string, images: string[], files: string[]) => {
				addToHistory(text) // 히스토리에 추가
				const prepared = await prepareMentionImagePayload({
					text,
					images,
					files,
					supportsImages: selectedModelInfo.supportsImages || false,
					maxAttachments: MAX_IMAGES_AND_FILES_PER_MESSAGE,
				})
				return await messageHandlers.handleSendMessage(text, prepared.images, files)
			},
		}),
		[messageHandlers, addToHistory, selectedModelInfo.supportsImages],
	)

	// Use scroll behavior hook
	const scrollBehavior = useScrollBehavior(messages, visibleMessages, groupedMessages, expandedRows, setExpandedRows)

	const placeholderText = useMemo(() => {
		return task ? t("typeMessage", "chat") : t("startNewTask", "chat")
	}, [task])

	return (
		<ChatLayout isHidden={isHidden}>
			<div className="flex flex-col flex-1 overflow-hidden">
				{IS_STANDALONE && <Navbar />}
				{task ? (
					<TaskSection
						apiMetrics={apiMetrics}
						lastApiReqTotalTokens={lastApiReqTotalTokens}
						lastProgressMessageText={lastProgressMessageText}
						messageHandlers={enhancedMessageHandlers}
						scrollBehavior={scrollBehavior}
						selectedModelInfo={{
							supportsPromptCache: selectedModelInfo.supportsPromptCache,
							supportsImages: selectedModelInfo.supportsImages || false,
						}}
						task={task}
					/>
				) : (
					<WelcomeSection
						hideAnnouncement={hideAnnouncement}
						shouldShowQuickWins={shouldShowQuickWins}
						showAnnouncement={showAnnouncement}
						showHistoryView={showHistoryView}
						taskHistory={taskHistory}
						telemetrySetting={telemetrySetting}
						version={version}
					/>
				)}
				{task && (
					<MessagesArea
						chatState={chatState}
						groupedMessages={groupedMessages}
						messageHandlers={enhancedMessageHandlers}
						modifiedMessages={modifiedMessages}
						scrollBehavior={scrollBehavior}
						task={task}
					/>
				)}
			</div>
			<footer className="bg-[var(--vscode-sidebar-background)]" style={{ gridRow: "2" }}>
				<AutoApproveBar />
				<ActionButtons
					chatState={chatState}
					messageHandlers={enhancedMessageHandlers}
					messages={messages}
					mode={mode}
					scrollBehavior={{
						scrollToBottomSmooth: scrollBehavior.scrollToBottomSmooth,
						disableAutoScrollRef: scrollBehavior.disableAutoScrollRef,
						showScrollToBottom: scrollBehavior.showScrollToBottom,
					}}
					task={task}
				/>
				<InputSection
					chatState={chatState}
					inputHistory={inputHistory} // CARETI MODIFICATION: Use enhanced handlers with history tracking
					messageHandlers={enhancedMessageHandlers}
					placeholderText={placeholderText}
					scrollBehavior={scrollBehavior}
					selectFilesAndImages={selectFilesAndImages}
					shouldDisableFilesAndImages={shouldDisableFilesAndImages} // CARETI MODIFICATION: Pass persistent input history
				/>
			</footer>
		</ChatLayout>
	)
}

export default ChatView
