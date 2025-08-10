import { useEffect } from "react"
import { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import { ChatState } from "../types/chatTypes"
import { useDeepCompareEffect } from "react-use"
// CARET MODIFICATION: 다국어 지원 추가
import { t } from "@/caret/utils/i18n"

/**
 * Custom hook for managing button state based on messages
 * Handles button text and enable/disable states based on the current ask type
 */
export function useButtonState(messages: ClineMessage[], chatState: ChatState) {
	// CARET MODIFICATION: WebviewLogger 추가로 상세 디버깅 지원
	const logger = new (require("@/caret/utils/webview-logger").default)("useButtonState")
	const {
		setSendingDisabled,
		setEnableButtons,
		setPrimaryButtonText,
		setSecondaryButtonText,
		setDidClickCancel,
		lastMessage,
		secondLastMessage,
	} = chatState

	// Update button state based on last message
	useDeepCompareEffect(() => {
		if (lastMessage) {
			// CARET MODIFICATION: 상세 로깅으로 디버깅 지원
			logger.info("useDeepCompareEffect triggered", { lastMessage })
			switch (lastMessage.type) {
				case "ask":
					const isPartial = lastMessage.partial === true
					logger.info(`Processing 'ask' message. Type: ${lastMessage.ask}, Partial: ${isPartial}`)
					switch (lastMessage.ask) {
						case "api_req_failed":
							logger.info("State: api_req_failed. Disabling input.")
							setSendingDisabled(true)
							setEnableButtons(true)
							// CARET MODIFICATION: 다국어 지원 텍스트 적용
							setPrimaryButtonText(t("chat.retry", "common"))
							setSecondaryButtonText(t("chat.startNewTask", "common"))
							break
						case "mistake_limit_reached":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText(t("chat.proceedAnyways", "common"))
							setSecondaryButtonText(t("chat.startNewTask", "common"))
							break
						case "auto_approval_max_req_reached":
							setSendingDisabled(true)
							setEnableButtons(true)
							setPrimaryButtonText(t("chat.proceed", "common"))
							setSecondaryButtonText(t("chat.startNewTask", "common"))
							break
						case "followup":
							setSendingDisabled(isPartial)
							setEnableButtons(false)
							break
						case "plan_mode_respond":
							setSendingDisabled(isPartial)
							setEnableButtons(false)
							break
						case "tool":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							const tool = JSON.parse(lastMessage.text || "{}") as ClineSayTool
							switch (tool.tool) {
								case "editedExistingFile":
								case "newFileCreated":
									setPrimaryButtonText(t("chat.save", "common"))
									setSecondaryButtonText(t("chat.reject", "common"))
									break
								default:
									setPrimaryButtonText(t("chat.approve", "common"))
									setSecondaryButtonText(t("chat.reject", "common"))
									break
							}
							break
						case "browser_action_launch":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText(t("chat.approve", "common"))
							setSecondaryButtonText(t("chat.reject", "common"))
							break
						case "command":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText(t("chat.runCommand", "common"))
							setSecondaryButtonText(t("chat.reject", "common"))
							break
						case "command_output":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText(t("chat.proceedWhileRunning", "common"))
							setSecondaryButtonText(undefined)
							break
						case "use_mcp_server":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText(t("chat.approve", "common"))
							setSecondaryButtonText(t("chat.reject", "common"))
							break
						case "completion_result":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText(t("chat.resumeTask", "common"))
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "resume_completed_task":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText("Start New Task")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "new_task":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText(t("chat.startNewTaskWithContext", "common"))
							setSecondaryButtonText(undefined)
							break
						case "condense":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText(t("chat.condenseConversation", "common"))
							setSecondaryButtonText(undefined)
							break
						case "report_bug":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText(t("chat.reportGithubIssue", "common"))
							setSecondaryButtonText(undefined)
							break
					}
					break
				case "say":
					switch (lastMessage.say) {
						case "api_req_started":
							if (secondLastMessage?.ask === "command_output") {
								chatState.setInputValue("")
								setSendingDisabled(true)
								chatState.setSelectedImages([])
								chatState.setSelectedFiles([])
								setEnableButtons(false)
							}
							break
					}
					break
			}
		}
	}, [lastMessage, secondLastMessage])

	// Reset button state when no messages
	useEffect(() => {
		if (messages.length === 0) {
			setSendingDisabled(false)
			setEnableButtons(false)
			setPrimaryButtonText(t("chat.approve", "common"))
			setSecondaryButtonText(t("chat.reject", "common"))
		}
	}, [messages.length, setSendingDisabled, setEnableButtons, setPrimaryButtonText, setSecondaryButtonText])
}
