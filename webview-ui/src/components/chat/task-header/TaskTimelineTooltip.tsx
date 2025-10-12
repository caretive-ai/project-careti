import { Tooltip } from "@heroui/react"
import { ClineMessage } from "@shared/ExtensionMessage"
import React from "react"
import { t } from "@/caret/utils/i18n"
import { getColor } from "./util"

interface TaskTimelineTooltipProps {
	message: ClineMessage
	children: React.ReactNode
}

const TaskTimelineTooltip = ({ message, children }: TaskTimelineTooltipProps) => {
	const getMessageDescription = (message: ClineMessage): string => {
		if (message.type === "say") {
			switch (message.say) {
				// TODO: Need to confirm these classifcations with design
				case "task":
					return t("taskTimelineTooltip.taskMessage", "chat")
				case "user_feedback":
					return t("taskTimelineTooltip.userMessage", "chat")
				case "text":
					return t("taskTimelineTooltip.assistantResponse", "chat")
				case "tool":
					if (message.text) {
						try {
							const toolData = JSON.parse(message.text)
							if (
								toolData.tool === "readFile" ||
								toolData.tool === "listFilesTopLevel" ||
								toolData.tool === "listFilesRecursive" ||
								toolData.tool === "listCodeDefinitionNames" ||
								toolData.tool === "searchFiles"
							) {
								return t("taskTimelineTooltip.fileRead", "chat", { tool: toolData.tool })
							} else if (toolData.tool === "editedExistingFile") {
								return t("taskTimelineTooltip.fileEdit", "chat", {
									path: toolData.path || t("taskTimelineTooltip.unknownFile", "chat"),
								})
							} else if (toolData.tool === "newFileCreated") {
								return t("taskTimelineTooltip.newFile", "chat", {
									path: toolData.path || t("taskTimelineTooltip.unknownFile", "chat"),
								})
							} else if (toolData.tool === "webFetch") {
								return t("taskTimelineTooltip.webFetch", "chat", {
									path: toolData.path || t("taskTimelineTooltip.unknownUrl", "chat"),
								})
							}
							return t("taskTimelineTooltip.tool", "chat", { tool: toolData.tool })
						} catch (_e) {
							return t("taskTimelineTooltip.toolUse", "chat")
						}
					}
					return t("taskTimelineTooltip.toolUse", "chat")
				case "command":
					return t("taskTimelineTooltip.terminalCommand", "chat")
				case "command_output":
					return t("taskTimelineTooltip.terminalOutput", "chat")
				case "browser_action":
					return t("taskTimelineTooltip.browserAction", "chat")
				case "browser_action_result":
					return t("taskTimelineTooltip.browserResult", "chat")
				case "completion_result":
					return t("taskTimelineTooltip.taskCompleted", "chat")
				case "checkpoint_created":
					return t("taskTimelineTooltip.checkpointCreated", "chat")
				default:
					return message.say || t("taskTimelineTooltip.unknown", "chat")
			}
		} else if (message.type === "ask") {
			switch (message.ask) {
				case "followup":
					return t("taskTimelineTooltip.assistantMessage", "chat")
				case "plan_mode_respond":
					return t("taskTimelineTooltip.planningResponse", "chat")
				case "tool":
					if (message.text) {
						try {
							const toolData = JSON.parse(message.text)
							if (
								toolData.tool === "readFile" ||
								toolData.tool === "listFilesTopLevel" ||
								toolData.tool === "listFilesRecursive" ||
								toolData.tool === "listCodeDefinitionNames" ||
								toolData.tool === "searchFiles"
							) {
								return t("taskTimelineTooltip.fileReadApproval", "chat", { tool: toolData.tool })
							} else if (toolData.tool === "editedExistingFile") {
								return t("taskTimelineTooltip.fileEditApproval", "chat", {
									path: toolData.path || t("taskTimelineTooltip.unknownFile", "chat"),
								})
							} else if (toolData.tool === "newFileCreated") {
								return t("taskTimelineTooltip.newFileApproval", "chat", {
									path: toolData.path || t("taskTimelineTooltip.unknownFile", "chat"),
								})
							} else if (toolData.tool === "webFetch") {
								return t("taskTimelineTooltip.webFetch", "chat", {
									path: toolData.path || t("taskTimelineTooltip.unknownUrl", "chat"),
								})
							}
							return t("taskTimelineTooltip.toolApproval", "chat", { tool: toolData.tool })
						} catch (_e) {
							return t("taskTimelineTooltip.toolApproval", "chat", {
								tool: t("taskTimelineTooltip.unknown", "chat"),
							})
						}
					}
					return t("taskTimelineTooltip.toolApproval", "chat", { tool: t("taskTimelineTooltip.unknown", "chat") })
				case "command":
					return t("taskTimelineTooltip.terminalCommandApproval", "chat")
				case "browser_action_launch":
					return t("taskTimelineTooltip.browserActionApproval", "chat")
				default:
					return message.ask || t("taskTimelineTooltip.unknown", "chat")
			}
		}
		return t("taskTimelineTooltip.unknownMessageType", "chat")
	}

	const getMessageContent = (message: ClineMessage): string => {
		if (message.text) {
			if (message.type === "ask" && message.ask === "plan_mode_respond" && message.text) {
				try {
					const planData = JSON.parse(message.text)
					return planData.response || message.text
				} catch (_e) {
					return message.text
				}
			} else if (message.type === "say" && message.say === "tool" && message.text) {
				try {
					const toolData = JSON.parse(message.text)
					return JSON.stringify(toolData, null, 2)
				} catch (_e) {
					return message.text
				}
			}

			if (message.text.length > 200) {
				return message.text.substring(0, 200) + "..."
			}
			return message.text
		}
		return ""
	}

	const getTimestamp = (message: ClineMessage): string => {
		if (message.ts) {
			const messageDate = new Date(message.ts)
			const today = new Date()

			const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
			const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

			const time = messageDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })

			const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
			const monthName = monthNames[messageDate.getMonth()]

			if (messageDateOnly.getTime() === todayDate.getTime()) {
				return `${time}`
			} else if (messageDate.getFullYear() === today.getFullYear()) {
				return `${monthName} ${messageDate.getDate()} ${time}`
			} else {
				return `${monthName} ${messageDate.getDate()}, ${messageDate.getFullYear()} ${time}`
			}
		}
		return ""
	}

	return (
		<Tooltip
			classNames={{
				base: "bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-[var(--vscode-widget-border)] py-1 rounded-[3px] max-w-[calc(100dvw-2rem)] text-xs",
			}}
			closeDelay={100}
			content={
				<div className="flex flex-col">
					<div className="flex flex-wrap items-center font-bold mb-1">
						<div className="mr-4 mb-0.5">
							<div
								style={{
									width: "10px",
									height: "10px",
									minWidth: "10px", // Ensure fixed width
									minHeight: "10px", // Ensure fixed height
									borderRadius: "50%",
									backgroundColor: getColor(message),
									marginRight: "8px",
									display: "inline-block",
									flexShrink: 0, // Prevent shrinking when space is limited
								}}
							/>
							{getMessageDescription(message)}
						</div>
						{getTimestamp(message) && (
							<span className="font-normal text-tiny" style={{ fontWeight: "normal", fontSize: "10px" }}>
								{getTimestamp(message)}
							</span>
						)}
					</div>
					{getMessageContent(message) && (
						<div
							style={{
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								maxHeight: "150px",
								overflowY: "auto",
								fontSize: "11px",
								fontFamily: "var(--vscode-editor-font-family)",
								backgroundColor: "var(--vscode-textBlockQuote-background)",
								padding: "4px",
								borderRadius: "2px",
								scrollbarWidth: "none",
							}}>
							{getMessageContent(message)}
						</div>
					)}
				</div>
			}
			disableAnimation
			isKeyboardDismissDisabled={true}
			placement="bottom"
			shadow="sm">
			{children}
		</Tooltip>
	)
}

export default TaskTimelineTooltip
