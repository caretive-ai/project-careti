/**
 * RequestStartRow - Displays current state of an active API request
 *
 * CARETI MODIFICATION: Ported from ref-cline with style adaptations
 * Source: ref-cline/webview-ui/src/components/chat/RequestStartRow.tsx
 * - Removed Tailwind classes, using inline styles
 * - Added Careti-specific tool support (analyzeImage, readDocument)
 * - Added i18n support
 * - Added persona integration via ThinkingRow
 */

import { t } from "@/careti/utils/i18n"
import PersonaAvatar from "@/careti/components/PersonaAvatar"
import { FullPersonaProfile } from "@/careti/context/CaretiStateContext"
import { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import { Mode } from "@shared/storage/types"
import { LucideIcon } from "lucide-react"
import type React from "react"
import { useMemo } from "react"
import { cleanPathPrefix } from "../common/CodeAccordian"
import { getIconByToolName } from "./chat-view/utils/messageUtils"
import ErrorRow from "./ErrorRow"
import { ThinkingRow } from "./ThinkingRow"
import { TypewriterText } from "./TypewriterText"

interface RequestStartRowProps {
	message: ClineMessage
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
	cost?: number
	reasoningContent?: string
	responseStarted?: boolean
	clineMessages: ClineMessage[]
	mode?: Mode
	isExpanded: boolean
	handleToggle: () => void
	// CARETI MODIFICATION: Persona integration
	personaProfile?: FullPersonaProfile | null
	showPersonaAvatar?: boolean
}

// State type for api_req_started rendering
type ApiReqState = "pre" | "thinking" | "error" | "final"

// Helper to format search regex for display - show all terms separated by |
const formatSearchRegex = (regex: string, path: string, filePattern?: string): string => {
	const cleanedPath = cleanPathPrefix(path)
	const terms = regex
		.split("|")
		.map((t) => t.trim().replace(/\\b/g, "").replace(/\\s\?/g, " "))
		.filter(Boolean)
		.join(" | ")
	return filePattern && filePattern !== "*" ? `"${terms}" in ${cleanedPath}/ (${filePattern})` : `"${terms}" in ${cleanedPath}/`
}

/**
 * Format activity text based on tool type
 * CARETI MODIFICATION: Added Careti-specific tools
 */
const getActivityText = (tool: ClineSayTool): string | null => {
	const cleanedPath = cleanPathPrefix(tool.path || "")
	switch (tool.tool) {
		// Cline original tools
		case "readFile":
			return tool.path ? `Reading ${cleanedPath}...` : null
		case "listFilesTopLevel":
		case "listFilesRecursive":
			return tool.path ? `Exploring ${cleanedPath}/...` : null
		case "searchFiles":
			return tool.regex && tool.path ? `Searching ${formatSearchRegex(tool.regex, tool.path, tool.filePattern)}...` : null
		case "listCodeDefinitionNames":
			return tool.path ? `Analyzing ${cleanedPath}/...` : null
		// CARETI MODIFICATION: Careti-specific tools
		case "analyzeImage":
			return tool.path ? `Analyzing image ${cleanedPath}...` : null
		case "readDocument":
			return tool.path ? `Reading document ${cleanedPath}...` : null
		default:
			return null
	}
}

// Collect tools in a given range, with optional stop condition
const collectToolsInRange = (
	messages: ClineMessage[],
	startIdx: number,
	endIdx: number,
	stopCondition?: (msg: ClineMessage) => boolean,
): { icon: LucideIcon; text: string }[] => {
	const activities: { icon: LucideIcon; text: string }[] = []
	for (let i = startIdx; i < endIdx; i++) {
		const msg = messages[i]
		if (stopCondition?.(msg)) {
			break
		}
		if (msg.say !== "tool" && msg.ask !== "tool") {
			continue
		}

		try {
			const tool = JSON.parse(msg.text || "{}") as ClineSayTool
			const activityText = getActivityText(tool)
			if (activityText) {
				const toolIcon = getIconByToolName(tool.tool)
				activities.push({ icon: toolIcon, text: activityText })
			}
		} catch {
			// ignore parse errors
		}
	}
	return activities
}

// Find current api_req and determine if it has cost
const findCurrentApiReq = (messages: ClineMessage[]): { index: number; hasCost: boolean } | null => {
	for (let i = messages.length - 1; i >= 0; i--) {
		const msg = messages[i]
		if (msg.say === "api_req_started" && msg.text) {
			try {
				const info = JSON.parse(msg.text)
				return { index: i, hasCost: info.cost != null }
			} catch {
				return null
			}
		}
	}
	return null
}

// Find the most recent completed api_req before the given index
const findPrevCompletedApiReq = (messages: ClineMessage[], beforeIdx: number): number => {
	for (let i = beforeIdx - 1; i >= 0; i--) {
		const msg = messages[i]
		if (msg.say === "api_req_started" && msg.text) {
			try {
				const info = JSON.parse(msg.text)
				if (info.cost != null) {
					return i
				}
			} catch {
				// ignore parse errors
			}
		}
	}
	return -1
}

/**
 * Displays the current state of an active tool operation
 */
export const RequestStartRow: React.FC<RequestStartRowProps> = ({
	apiRequestFailedMessage,
	apiReqStreamingFailedMessage,
	cost,
	reasoningContent,
	responseStarted,
	clineMessages,
	mode,
	handleToggle,
	isExpanded,
	message,
	personaProfile,
	showPersonaAvatar = false,
}) => {
	// Derive explicit state
	const hasError = !!(apiRequestFailedMessage || apiReqStreamingFailedMessage)
	const hasCost = cost != null
	const hasReasoning = !!reasoningContent
	const hasResponseStarted = !!responseStarted

	const apiReqState: ApiReqState = hasError ? "error" : hasCost ? "final" : hasReasoning ? "thinking" : "pre"

	// CARETI MODIFICATION: Always show reasoning content when available (expanded by default)
	// This helps users see COT tokens in real-time during "thinking" state
	// Once response content starts, keep showing but allow collapse via toggle
	const showStreamingThinking = hasReasoning && !hasResponseStarted && !hasError && !hasCost
	const showCollapsedThinking = hasReasoning && !showStreamingThinking
	// Always start expanded to show COT tokens immediately
	const defaultExpanded = true

	// Find all exploratory tool activities that are currently in flight.
	// Only show tools between the previous completed API request and the current incomplete one.
	// Once an API request completes (has cost), tool messages that follow belong to the next cycle.
	const currentActivities = useMemo(() => {
		const currentApiReq = findCurrentApiReq(clineMessages)
		if (!currentApiReq) {
			return []
		}

		if (!currentApiReq.hasCost) {
			// CASE A: Current api_req is INCOMPLETE
			const prevIdx = findPrevCompletedApiReq(clineMessages, currentApiReq.index)
			if (prevIdx === -1) {
				return []
			}
			return collectToolsInRange(clineMessages, prevIdx + 1, currentApiReq.index)
		}
		// CASE B: Current api_req is COMPLETE - no activities to show
		return []
	}, [clineMessages])

	// Get display text for thinking state
	const getThinkingText = () => {
		if (message.partial === false) return ""
		return mode === "plan" ? t("requestStartRow.planning", "chat") : t("requestStartRow.thinking", "chat")
	}

	return (
		<div>
			{apiReqState === "pre" && (
				<div
					style={{
						display: "flex",
						alignItems: "flex-start",
						gap: "8px",
						color: "var(--vscode-descriptionForeground)",
						width: "100%",
						fontSize: "13px",
					}}>
					{/* CARETI MODIFICATION: Show persona avatar immediately in pre state */}
					{showPersonaAvatar && (
						<PersonaAvatar
							isThinking={true}
							personaProfile={personaProfile}
							size={64}
							style={{
								marginTop: "2px",
								flexShrink: 0,
							}}
						/>
					)}
					<div
						style={{
							marginLeft: showPersonaAvatar ? 0 : "4px",
							flex: 1,
							width: "100%",
							height: "100%",
						}}>
						{currentActivities.length > 0 ? (
							<div
								style={{
									display: "flex",
									flexDirection: "column",
									gap: "2px",
									width: "100%",
									minHeight: "4px",
								}}>
								{currentActivities.map((activity) => {
									const Icon = activity.icon
									return (
										<div
											key={activity.text}
											style={{
												display: "flex",
												alignItems: "center",
												gap: "8px",
												height: "auto",
												width: "100%",
												overflow: "hidden",
											}}>
											<Icon
												size={12}
												style={{
													color: "var(--vscode-foreground)",
													flexShrink: 0,
												}}
											/>
											<TypewriterText speed={15} text={activity.text} />
										</div>
									)
								})}
							</div>
						) : (
							<TypewriterText text={getThinkingText()} />
						)}
					</div>
				</div>
			)}
			{/* CARETI MODIFICATION: Always show reasoning content expanded by default */}
			{reasoningContent && (
				<ThinkingRow
					isExpanded={defaultExpanded || isExpanded || showStreamingThinking}
					isVisible={true}
					onToggle={handleToggle}
					reasoningContent={reasoningContent}
					showTitle={showCollapsedThinking}
					personaProfile={personaProfile}
					showPersonaAvatar={showPersonaAvatar}
				/>
			)}

			{apiReqState === "error" && (
				<ErrorRow
					apiReqStreamingFailedMessage={apiReqStreamingFailedMessage}
					apiRequestFailedMessage={apiRequestFailedMessage}
					errorType="error"
					message={message}
				/>
			)}
		</div>
	)
}

RequestStartRow.displayName = "RequestStartRow"
