/**
 * Utility functions for message filtering, grouping, and manipulation
 */

import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"
import { ClineMessage, ClineSayBrowserAction, ClineSayTool } from "@shared/ExtensionMessage"
// CARETI MODIFICATION: Import icons for tool group display
import { FileIcon, FolderOpenDotIcon, FolderOpenIcon, SearchIcon, ShapesIcon, WrenchIcon } from "lucide-react"

/**
 * CARETI MODIFICATION: Low-stakes tool types that should be grouped together
 * Ported from ref-cline for ToolGroupRenderer support
 */
const LOW_STAKES_TOOLS = new Set([
	"readFile",
	"listFilesTopLevel",
	"listFilesRecursive",
	"listCodeDefinitionNames",
	"searchFiles",
])

/**
 * CARETI MODIFICATION: Check if a tool message is a low-stakes tool
 */
export function isLowStakesTool(message: ClineMessage): boolean {
	if (message.say !== "tool" && message.ask !== "tool") {
		return false
	}
	try {
		const tool = JSON.parse(message.text || "{}") as ClineSayTool
		return LOW_STAKES_TOOLS.has(tool.tool)
	} catch {
		return false
	}
}

/**
 * CARETI MODIFICATION: Check if a message group is a tool group
 */
export function isToolGroup(item: ClineMessage | ClineMessage[]): item is ClineMessage[] & { _isToolGroup: true } {
	return Array.isArray(item) && (item as any)._isToolGroup === true
}

/**
 * CARETI MODIFICATION: Get icon component by tool name
 */
export function getIconByToolName(toolName: string) {
	switch (toolName) {
		case "readFile":
			return FileIcon
		case "listFilesTopLevel":
			return FolderOpenIcon
		case "listFilesRecursive":
			return FolderOpenDotIcon
		case "searchFiles":
			return SearchIcon
		case "listCodeDefinitionNames":
			return ShapesIcon
		default:
			return WrenchIcon
	}
}

/**
 * CARETI MODIFICATION: Filter a tool group to exclude tools in "current activities" range
 */
export function getToolsNotInCurrentActivities(toolGroupMessages: ClineMessage[], allMessages: ClineMessage[]): ClineMessage[] {
	const tsToIndex = new Map<number, number>()
	for (let i = 0; i < allMessages.length; i++) {
		tsToIndex.set(allMessages[i].ts, i)
	}

	let mostRecentApiReqIndex = -1
	let mostRecentApiReq: ClineMessage | null = null
	for (let i = allMessages.length - 1; i >= 0; i--) {
		if (allMessages[i].say === "api_req_started") {
			mostRecentApiReqIndex = i
			mostRecentApiReq = allMessages[i]
			break
		}
	}

	if (mostRecentApiReqIndex === -1 || !mostRecentApiReq?.text) {
		return toolGroupMessages
	}

	let mostRecentHasCost = false
	try {
		const info = JSON.parse(mostRecentApiReq.text)
		mostRecentHasCost = info.cost != null
	} catch {
		return toolGroupMessages
	}

	if (!mostRecentHasCost) {
		let prevCompletedApiReqIndex = -1
		for (let i = mostRecentApiReqIndex - 1; i >= 0; i--) {
			const msg = allMessages[i]
			if (msg.say === "api_req_started" && msg.text) {
				try {
					const prevInfo = JSON.parse(msg.text)
					if (prevInfo.cost != null) {
						prevCompletedApiReqIndex = i
						break
					}
				} catch {
					/* continue searching */
				}
			}
		}

		if (prevCompletedApiReqIndex === -1) {
			return toolGroupMessages
		}

		return toolGroupMessages.filter((msg) => {
			if (!isLowStakesTool(msg)) return true
			if (msg.ask === "tool") {
				const toolIndex = tsToIndex.get(msg.ts)
				if (toolIndex === undefined) return true
				const isInCurrentActivitiesRange = toolIndex > prevCompletedApiReqIndex && toolIndex < mostRecentApiReqIndex
				return !isInCurrentActivitiesRange
			}
			return true
		})
	} else {
		return toolGroupMessages.filter((msg) => {
			if (!isLowStakesTool(msg)) return true
			if (msg.ask === "tool") {
				const toolIndex = tsToIndex.get(msg.ts)
				if (toolIndex === undefined) return true
				const isInCurrentActivitiesRange = toolIndex > mostRecentApiReqIndex
				return !isInCurrentActivitiesRange
			}
			return true
		})
	}
}

/**
 * Combine API requests and command sequences in messages
 */
export function processMessages(messages: ClineMessage[]): ClineMessage[] {
	return combineApiRequests(combineCommandSequences(messages))
}

/**
 * Filter messages that should be visible in the chat
 */
export function filterVisibleMessages(messages: ClineMessage[]): ClineMessage[] {
	return messages.filter((message) => {
		switch (message.ask) {
			case "completion_result":
				// don't show a chat row for a completion_result ask without text. This specific type of message only occurs if cline wants to execute a command as part of its completion result, in which case we interject the completion_result tool with the execute_command tool.
				if (message.text === "") {
					return false
				}
				break
			case "api_req_failed": // this message is used to update the latest api_req_started that the request failed
			case "resume_task":
			case "resume_completed_task":
				return false
		}
		switch (message.say) {
			case "api_req_finished": // combineApiRequests removes this from modifiedMessages anyways
			case "api_req_retried": // this message is used to update the latest api_req_started that the request was retried
			case "deleted_api_reqs": // aggregated api_req metrics from deleted messages
			case "task_progress": // task progress messages are displayed in TaskHeader, not in main chat
				return false
			case "text":
				// Sometimes cline returns an empty text message, we don't want to render these. (We also use a say text for user messages, so in case they just sent images we still render that)
				if ((message.text ?? "") === "" && (message.images?.length ?? 0) === 0) {
					return false
				}
				break
			case "mcp_server_request_started":
				return false
		}
		return true
	})
}

/**
 * Check if a message is part of a browser session
 */
export function isBrowserSessionMessage(message: ClineMessage): boolean {
	if (message.type === "ask") {
		return ["browser_action_launch"].includes(message.ask!)
	}
	if (message.type === "say") {
		return [
			"browser_action_launch",
			"api_req_started",
			"text",
			"browser_action",
			"browser_action_result",
			"checkpoint_created",
			"reasoning",
		].includes(message.say!)
	}
	return false
}

/**
 * Group messages, combining browser session messages into arrays
 */
export function groupMessages(visibleMessages: ClineMessage[]): (ClineMessage | ClineMessage[])[] {
	const result: (ClineMessage | ClineMessage[])[] = []
	let currentGroup: ClineMessage[] = []
	let isInBrowserSession = false

	const endBrowserSession = () => {
		if (currentGroup.length > 0) {
			result.push([...currentGroup])
			currentGroup = []
			isInBrowserSession = false
		}
	}

	visibleMessages.forEach((message) => {
		if (message.ask === "browser_action_launch" || message.say === "browser_action_launch") {
			// complete existing browser session if any
			endBrowserSession()
			// start new
			isInBrowserSession = true
			currentGroup.push(message)
		} else if (isInBrowserSession) {
			// end session if api_req_started is cancelled
			if (message.say === "api_req_started") {
				// get last api_req_started in currentGroup to check if it's cancelled
				const lastApiReqStarted = [...currentGroup].reverse().find((m) => m.say === "api_req_started")
				if (lastApiReqStarted?.text != null) {
					const info = JSON.parse(lastApiReqStarted.text)
					const isCancelled = info.cancelReason != null
					if (isCancelled) {
						endBrowserSession()
						result.push(message)
						return
					}
				}
			}

			if (isBrowserSessionMessage(message)) {
				currentGroup.push(message)

				// Check if this is a close action
				if (message.say === "browser_action") {
					const browserAction = JSON.parse(message.text || "{}") as ClineSayBrowserAction
					if (browserAction.action === "close") {
						endBrowserSession()
					}
				}
			} else {
				// complete existing browser session if any
				endBrowserSession()
				result.push(message)
			}
		} else {
			result.push(message)
		}
	})

	// Handle case where browser session is the last group
	if (currentGroup.length > 0) {
		result.push([...currentGroup])
	}

	return result
}

/**
 * Get the task message from the messages array
 */
export function getTaskMessage(messages: ClineMessage[]): ClineMessage | undefined {
	return messages.at(0)
}

/**
 * Check if we should show the scroll to bottom button
 */
export function shouldShowScrollButton(disableAutoScroll: boolean, isAtBottom: boolean): boolean {
	return disableAutoScroll && !isAtBottom
}
