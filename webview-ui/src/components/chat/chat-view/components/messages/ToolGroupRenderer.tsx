/**
 * ToolGroupRenderer - Collapsible group of low-stakes tool calls
 *
 * CARETI MODIFICATION: Ported from ref-cline with style adaptations
 * Source: ref-cline/webview-ui/src/components/chat/chat-view/components/messages/ToolGroupRenderer.tsx
 * Removed shadcn dependencies (Button, Tooltip, cn) and using inline styles
 */

import { t } from "@/careti/utils/i18n"
import { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import { StringRequest } from "@shared/proto/cline/common"
import { memo, useCallback, useMemo, useState } from "react"
import { cleanPathPrefix } from "@/components/common/CodeAccordian"
import { FileServiceClient } from "@/services/grpc-client"
import { getIconByToolName, getToolsNotInCurrentActivities, isLowStakesTool } from "../../utils/messageUtils"

interface ToolGroupRendererProps {
	messages: ClineMessage[]
	allMessages: ClineMessage[]
}

interface ToolWithReasoning {
	tool: ClineMessage
	parsedTool: ClineSayTool
	reasoning?: string
}

const EXPANDABLE_TOOLS = new Set(["listFilesTopLevel", "listFilesRecursive", "listCodeDefinitionNames", "searchFiles"])

/**
 * Renders a collapsible group of low-stakes tool calls.
 * Only shows tools that are NOT in the "current activities" range (PAST tools only).
 */
export const ToolGroupRenderer = memo(({ messages, allMessages }: ToolGroupRendererProps) => {
	const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({})
	const [hoveredTs, setHoveredTs] = useState<number | null>(null)

	// Filter out tools in the "current activities" range (being shown in loading state)
	const filteredMessages = useMemo(() => getToolsNotInCurrentActivities(messages, allMessages), [messages, allMessages])

	// Build tool items with associated reasoning (reasoning that comes BEFORE a tool)
	const toolsWithReasoning = useMemo(() => buildToolsWithReasoning(filteredMessages), [filteredMessages])

	const summary = getToolGroupSummary(filteredMessages)

	const handleOpenFile = useCallback((filePath: string) => {
		FileServiceClient.openFileRelativePath(StringRequest.create({ value: filePath })).catch((err) =>
			console.error("Failed to open file:", err),
		)
	}, [])

	const handleItemToggle = useCallback((ts: number) => {
		setExpandedItems((prev) => ({ ...prev, [ts]: !prev[ts] }))
	}, [])

	// Don't render if no PAST tools to show
	if (toolsWithReasoning.length === 0) {
		return null
	}

	return (
		<div
			style={{
				padding: "8px 16px",
				color: "var(--vscode-descriptionForeground)",
			}}>
			{/* Header */}
			<div
				style={{
					fontSize: "13px",
					opacity: 0.9,
					marginBottom: "4px",
				}}>
				{summary}:
			</div>

			{/* Content - files/folders with reasoning in tooltip */}
			<div style={{ minWidth: 0 }}>
				{toolsWithReasoning.map(({ tool, parsedTool, reasoning }) => {
					const info = getToolDisplayInfo(parsedTool)
					if (!info) {
						return null
					}

					const isExpandable = EXPANDABLE_TOOLS.has(parsedTool.tool)
					const isItemExpanded = expandedItems[tool.ts] ?? false
					const content = parsedTool.content || null
					const hasReasoning = !!reasoning?.length
					const isHovered = hoveredTs === tool.ts
					const Icon = info.icon

					return (
						<div style={{ minWidth: 0 }} key={tool.ts}>
							{/* Wrapper for tooltip positioning */}
							<div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
								<button
									onClick={() => (isExpandable ? handleItemToggle(tool.ts) : handleOpenFile(info.path))}
									onMouseEnter={() => setHoveredTs(tool.ts)}
									onMouseLeave={() => setHoveredTs(null)}
									style={{
										display: "flex",
										alignItems: "center",
										gap: "6px",
										cursor: "pointer",
										fontSize: "13px",
										color: isHovered
											? "var(--vscode-textLink-foreground)"
											: "var(--vscode-descriptionForeground)",
										padding: "2px 0",
										minWidth: 0,
										maxWidth: "100%",
										background: "none",
										border: "none",
										font: "inherit",
										textAlign: "left",
									}}>
									<Icon
										size={13}
										style={{
											opacity: 0.7,
											flexShrink: 0,
										}}
									/>
									<span
										style={{
											flex: 1,
											minWidth: 0,
											whiteSpace: "nowrap",
											overflow: "hidden",
											textOverflow: "ellipsis",
											textAlign: "left",
											direction: info.displayText ? "ltr" : "rtl",
											fontSize: "13px",
										}}>
										{(info.displayText || cleanPathPrefix(info.path)) + "\u200E"}
									</span>
								</button>

								{/* Simple tooltip for reasoning */}
								{hasReasoning && isHovered && (
									<div
										style={{
											position: "absolute",
											bottom: "100%",
											left: 0,
											marginBottom: "4px",
											padding: "6px 10px",
											backgroundColor: "var(--vscode-editorWidget-background)",
											border: "1px solid var(--vscode-editorWidget-border)",
											borderRadius: "4px",
											fontSize: "12px",
											color: "var(--vscode-foreground)",
											maxWidth: "300px",
											whiteSpace: "pre-wrap",
											wordBreak: "break-word",
											zIndex: 1000,
											boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
										}}>
										{reasoning}
									</div>
								)}
							</div>

							{/* Expanded content for folders/search/definitions - raw text */}
							{isExpandable && isItemExpanded && content && (
								<pre
									style={{
										margin: "4px 4px 4px 16px",
										fontSize: "12px",
										opacity: 0.8,
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
										padding: "8px",
										maxHeight: "160px",
										overflow: "auto",
										borderRadius: "2px",
										backgroundColor: "var(--vscode-textBlockQuote-background)",
									}}>
									{content}
								</pre>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
})

ToolGroupRenderer.displayName = "ToolGroupRenderer"

/**
 * Build tool items with associated reasoning (reasoning that comes BEFORE a tool).
 * Only processes low-stakes tools, accumulating reasoning messages along the way.
 */
function buildToolsWithReasoning(messages: ClineMessage[]): ToolWithReasoning[] {
	const result: ToolWithReasoning[] = []
	const reasoningBuffer: string[] = []

	for (const msg of messages) {
		if (msg.say === "reasoning" && msg.text) {
			reasoningBuffer.push(msg.text)
		} else if (isLowStakesTool(msg)) {
			const parsedTool = parseToolSafe(msg.text)
			result.push({
				tool: msg,
				parsedTool,
				reasoning: reasoningBuffer.length > 0 ? reasoningBuffer.join("\n\n") : undefined,
			})
			reasoningBuffer.length = 0
		}
	}

	return result
}

/**
 * Safely parse tool JSON, returning empty tool on failure.
 */
function parseToolSafe(text: string | undefined): ClineSayTool {
	try {
		return JSON.parse(text || "{}") as ClineSayTool
	} catch {
		return {} as ClineSayTool
	}
}

/**
 * Get display info for a tool.
 */
function getToolDisplayInfo(tool: ClineSayTool) {
	const icon = getIconByToolName(tool.tool)
	const filePath = tool.path || ""
	const folderPath = filePath + "/"

	switch (tool.tool) {
		case "readFile":
			return { icon, path: filePath, label: "read" }
		case "listFilesTopLevel":
			return { icon, path: folderPath, label: "listed" }
		case "listFilesRecursive":
			return { icon, path: folderPath, label: "listed recursively" }
		case "listCodeDefinitionNames":
			return { icon, path: folderPath, label: "definitions" }
		case "searchFiles":
			return {
				icon,
				path: folderPath,
				label: `search: ${tool.regex}`,
				displayText: formatSearchDisplay(tool.regex || "", filePath, tool.filePattern),
			}
		default:
			return null
	}
}

/**
 * Format search regex for display - simplify complex patterns
 */
function formatSearchDisplay(regex: string, path: string, filePattern?: string): string {
	// Split by | and clean up regex syntax
	const terms = regex
		.split("|")
		.map((t) => t.trim().replace(/\\b/g, "").replace(/\\s\?/g, " "))
		.filter(Boolean)

	const termDisplay = terms.length > 3 ? `${terms.length} patterns` : `"${terms.join(" | ")}"`
	let result = `${termDisplay} in ${cleanPathPrefix(path)}/`

	if (filePattern && filePattern !== "*") {
		result += ` (${filePattern})`
	}

	return result
}

/**
 * Get summary label for a tool group - shows what's been added to context.
 */
function getToolGroupSummary(messages: ClineMessage[]): string {
	const counts = { read: 0, list: 0, search: 0, def: 0 }

	for (const msg of messages) {
		if (!isLowStakesTool(msg)) {
			continue
		}

		const tool = parseToolSafe(msg.text)
		switch (tool.tool) {
			case "readFile":
				counts.read++
				break
			case "listFilesTopLevel":
			case "listFilesRecursive":
				counts.list++
				break
			case "searchFiles":
				counts.search++
				break
			case "listCodeDefinitionNames":
				counts.def++
				break
		}
	}

	const parts: string[] = []
	const action = counts.read > 0 || counts.list > 0 ? ` ${t("toolGroup.read", "chat")} ` : " "

	if (counts.read > 0) {
		parts.push(`${counts.read} ${counts.read > 1 ? t("toolGroup.files", "chat") : t("toolGroup.file", "chat")}`)
	}
	if (counts.list > 0) {
		parts.push(`${counts.list} ${counts.list > 1 ? t("toolGroup.folders", "chat") : t("toolGroup.folder", "chat")}`)
	}
	if (counts.def > 0) {
		parts.push(`${counts.def} ${counts.def > 1 ? t("toolGroup.definitions", "chat") : t("toolGroup.definition", "chat")}`)
	}
	if (counts.search > 0) {
		parts.push(`${t("toolGroup.performed", "chat")} ${counts.search} ${counts.search > 1 ? t("toolGroup.searches", "chat") : t("toolGroup.search", "chat")}`)
	}

	return parts.length === 0 ? t("toolGroup.context", "chat") : t("toolGroup.brandName", "chat") + action + parts.join(", ")
}
