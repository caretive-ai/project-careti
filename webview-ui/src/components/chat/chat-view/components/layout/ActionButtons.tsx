import type { ClineMessage } from "@shared/ExtensionMessage"
import type { Mode } from "@shared/storage/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { useCaretiI18n } from "@/careti/hooks/useCaretiI18n"
import { shortcutManager } from "@/careti/shortcuts/ShortcutManager"
import { useShortcut } from "@/utils/hooks"
import { type ButtonActionType, getButtonConfig } from "../../shared/buttonConfig"
import type { ChatState, MessageHandlers } from "../../types/chatTypes"

const IGNORED_SAY_TYPES_FOR_BUTTONS: ClineMessage["say"][] = [
	"api_req_finished",
	"api_req_retried",
	"deleted_api_reqs",
	"task_progress",
	"mcp_server_request_started",
]

const shouldIgnoreMessageForButtons = (message: ClineMessage) => {
	if (message.type !== "say") {
		return false
	}
	if (message.say && IGNORED_SAY_TYPES_FOR_BUTTONS.includes(message.say)) {
		return true
	}
	if (message.say === "text" && (message.text ?? "") === "" && (message.images?.length ?? 0) === 0) {
		return true
	}
	return false
}

const getLastMessageForButtons = (messages: ClineMessage[]) => {
	for (let index = messages.length - 1; index >= 0; index -= 1) {
		const message = messages[index]
		if (!message) {
			continue
		}
		if (shouldIgnoreMessageForButtons(message)) {
			continue
		}
		return message
	}
	return messages.at(-1)
}

interface ActionButtonsProps {
	task?: ClineMessage
	messages: ClineMessage[]
	chatState: ChatState
	messageHandlers: MessageHandlers
	mode: Mode
	scrollBehavior: {
		scrollToBottomSmooth: () => void
		disableAutoScrollRef: React.MutableRefObject<boolean>
		showScrollToBottom: boolean
	}
}

/**
 * Action buttons area including scroll-to-bottom and approve/reject buttons
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
	task,
	messages,
	chatState,
	mode,
	messageHandlers,
	scrollBehavior,
}) => {
	const { t } = useCaretiI18n()
	const { inputValue, selectedImages, selectedFiles, setSendingDisabled } = chatState
	const resumeText = t("button.resumeTask", "common")
	const cancelShortcut = shortcutManager.getKeys("cancel_stream")[0] ?? "Escape"
	const resumeShortcut = shortcutManager.getKeys("resume_task")[0] ?? "Control+Shift+R"
	const cancelShortcutLabel = shortcutManager.getLabel("cancel_stream")
	const resumeShortcutLabel = shortcutManager.getLabel("resume_task")

	const isStreaming = useMemo(() => task?.partial === true, [task])

	const [primaryButtonText, setPrimaryButtonText] = useState<string | undefined>(undefined)
	const [secondaryButtonText, setSecondaryButtonText] = useState<string | undefined>(undefined)
	const [primaryAction, setPrimaryAction] = useState<ButtonActionType | undefined>(undefined)
	const [secondaryAction, setSecondaryAction] = useState<ButtonActionType | undefined>(undefined)

	const [enableButtons, setEnableButtons] = useState<boolean>(false)

	const [lastMessage, secondLastMessage] = useMemo(() => {
		return [messages.at(-1), messages.at(-2)]
	}, [messages])

	const lastMessageForButtons = useMemo(() => getLastMessageForButtons(messages), [messages])

	// Clear input when transitioning from command_output to api_req
	// This happens when user provides feedback during command execution
	useEffect(() => {
		if (lastMessage?.type === "say" && lastMessage.say === "api_req_started" && secondLastMessage?.ask === "command_output") {
			chatState.setInputValue("")
			chatState.setSelectedImages([])
			chatState.setSelectedFiles([])
		}
	}, [chatState, lastMessage, secondLastMessage])

	// Apply button configuration with a single batched update
	useEffect(() => {
		const buttonConfig = getButtonConfig(lastMessageForButtons, mode, t)
		setEnableButtons(buttonConfig.enableButtons)
		setSendingDisabled(buttonConfig.sendingDisabled)
		setPrimaryButtonText(buttonConfig.primaryText)
		setSecondaryButtonText(buttonConfig.secondaryText)
		setPrimaryAction(buttonConfig.primaryAction)
		setSecondaryAction(buttonConfig.secondaryAction)
	}, [lastMessageForButtons, mode, setSendingDisabled, t])

	useEffect(() => {
		if (!messages?.length) {
			const buttonConfig = getButtonConfig(undefined, mode, t)
			setEnableButtons(buttonConfig.enableButtons)
			setSendingDisabled(buttonConfig.sendingDisabled)
			setPrimaryButtonText(buttonConfig.primaryText)
			setSecondaryButtonText(buttonConfig.secondaryText)
			setPrimaryAction(buttonConfig.primaryAction)
			setSecondaryAction(buttonConfig.secondaryAction)
		}
	}, [messages, setSendingDisabled, mode, t])

	useShortcut(
		cancelShortcut,
		() => {
			if (secondaryAction !== "cancel" || !enableButtons) {
				return
			}
			void messageHandlers.executeButtonAction("cancel", inputValue, selectedImages, selectedFiles)
		},
		{ disableTextInputs: false },
	)

	useShortcut(
		resumeShortcut,
		() => {
			if (!enableButtons) {
				return
			}
			if (primaryAction === "proceed" && primaryButtonText === resumeText) {
				void messageHandlers.executeButtonAction("proceed", inputValue, selectedImages, selectedFiles)
			}
		},
		{ disableTextInputs: false },
	)

	if (!task) {
		return null
	}

	const { showScrollToBottom, scrollToBottomSmooth, disableAutoScrollRef } = scrollBehavior

	if (showScrollToBottom) {
		const handleScrollToBottom = () => {
			scrollToBottomSmooth()
			disableAutoScrollRef.current = false
		}

		return (
			<div className="flex px-[15px]">
				<VSCodeButton
					appearance="icon"
					aria-label={t("scrollToBottom", "common")}
					className="text-lg text-[var(--vscode-primaryButton-foreground)] bg-[color-mix(in_srgb,var(--vscode-toolbar-hoverBackground)_55%,transparent)] rounded-[3px] overflow-hidden cursor-pointer flex justify-center items-center flex-1 h-[25px] hover:bg-[color-mix(in_srgb,var(--vscode-toolbar-hoverBackground)_90%,transparent)] active:bg-[color-mix(in_srgb,var(--vscode-toolbar-hoverBackground)_70%,transparent)] border-0"
					onClick={handleScrollToBottom}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault()
							handleScrollToBottom()
						}
					}}>
					<span className="codicon codicon-chevron-down" />
				</VSCodeButton>
			</div>
		)
	}

	const shouldShowButtons = primaryButtonText || secondaryButtonText
	const opacity = shouldShowButtons ? (enableButtons || isStreaming ? 1 : 0.5) : 0

	return (
		<div className="flex px-[15px]" style={{ opacity }}>
			{primaryButtonText && (
				<VSCodeButton
					appearance="primary"
					className={`${secondaryButtonText ? "flex-1 mr-[6px]" : "flex-[2]"}`}
					disabled={!enableButtons}
					onClick={() => {
						// CARETI MODIFICATION: Always use executeButtonAction for consistent handling including new_task
						if (primaryAction) {
							messageHandlers.executeButtonAction(primaryAction, inputValue, selectedImages, selectedFiles)
						}
					}}>
					{primaryButtonText}
					{primaryAction === "proceed" && primaryButtonText === resumeText && resumeShortcutLabel
						? ` (${resumeShortcutLabel})`
						: null}
				</VSCodeButton>
			)}
			{secondaryButtonText && (
				<VSCodeButton
					appearance="secondary"
					className={`${primaryButtonText ? "flex-1" : "flex-[2]"}`}
					disabled={!enableButtons}
					onClick={() => {
						if (secondaryAction) {
							messageHandlers.executeButtonAction(secondaryAction, inputValue, selectedImages, selectedFiles)
						}
					}}>
					{secondaryButtonText}
					{secondaryAction === "cancel" && cancelShortcutLabel ? ` (${cancelShortcutLabel})` : null}
				</VSCodeButton>
			)}
		</div>
	)
}
