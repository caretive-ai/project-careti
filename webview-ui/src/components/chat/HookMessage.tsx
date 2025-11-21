import { HOOK_OUTPUT_STRING } from "@shared/combineHookSequences"
import { ClineMessage } from "@shared/ExtensionMessage"
import { memo, useMemo, useState } from "react"
import { CODE_BLOCK_BG_COLOR } from "../common/CodeBlock"

const normalColor = "var(--vscode-foreground)"
const errorColor = "var(--vscode-errorForeground)"
const successColor = "var(--vscode-charts-green)"
const completedColor = "var(--vscode-descriptionForeground)"

function shouldExpandHookByDefault(message: ClineMessage, status: string): boolean {
	// Collapse old messages to avoid scrolling noise
	const isHistorical = message.ts && Date.now() - message.ts > 5000
	if (isHistorical) {
		return false
	}
	return status === "failed" || status === "cancelled"
}

interface HookMessageProps {
	message: ClineMessage
}

type HookMetadata = {
	hookName: string
	toolName?: string
	status: string
	exitCode?: number
	hasJsonResponse?: boolean
	pendingToolInfo?: {
		tool: string
		path?: string
		command?: string
		content?: string
		diff?: string
		regex?: string
		url?: string
		mcpTool?: string
		mcpServer?: string
		resourceUri?: string
	}
	error?: {
		type: "timeout" | "validation" | "execution" | "cancellation"
		message: string
		details?: string
		scriptPath?: string
	}
}

const HookMessage = memo(({ message }: HookMessageProps) => {
	const { metadata, output } = useMemo(() => {
		const splitMessage = (text: string) => {
			const outputIndex = text.indexOf(HOOK_OUTPUT_STRING)
			if (outputIndex === -1) {
				return { metadata: text, output: "" }
			}
			return {
				metadata: text.slice(0, outputIndex).trim(),
				output: text.slice(outputIndex + HOOK_OUTPUT_STRING.length).trim(),
			}
		}

		const { metadata: metadataStr, output } = splitMessage(message.text || "")

		let hookMetadata: HookMetadata
		try {
			hookMetadata = JSON.parse(metadataStr)
		} catch {
			hookMetadata = { hookName: "Unknown", status: "unknown" }
		}

		return { metadata: hookMetadata, output }
	}, [message.text])

	const [isHookOutputExpanded, setIsHookOutputExpanded] = useState(() => shouldExpandHookByDefault(message, metadata.status))

	const isRunning = metadata.status === "running"
	const isFailed = metadata.status === "failed"
	const isCancelled = metadata.status === "cancelled"

	const badgeColor = isRunning ? successColor : isFailed || isCancelled ? errorColor : completedColor

	return (
		<div
			style={{
				borderRadius: 6,
				border: "1px solid var(--vscode-editorGroup-border)",
				overflow: "hidden",
				backgroundColor: CODE_BLOCK_BG_COLOR,
				transition: "all 0.2s ease-in-out",
			}}>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "8px 10px",
					backgroundColor: CODE_BLOCK_BG_COLOR,
					borderBottom:
						metadata.pendingToolInfo || output.length > 0 ? "1px solid var(--vscode-editorGroup-border)" : "none",
					gap: 8,
				}}>
				<div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
					<div
						style={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							backgroundColor: badgeColor,
							animation: isRunning ? "pulse 2s ease-in-out infinite" : "none",
							flexShrink: 0,
						}}
					/>
					<div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
						<div style={{ color: normalColor, fontWeight: 600, fontSize: "13px" }}>{metadata.hookName}</div>
						<div style={{ color: "var(--vscode-descriptionForeground)", fontSize: "12px" }}>
							Status: {metadata.status}
							{metadata.toolName ? ` · Tool: ${metadata.toolName}` : ""}
						</div>
					</div>
				</div>
			</div>

			{metadata.pendingToolInfo && (
				<div
					style={{
						padding: "8px 10px",
						borderBottom: output.length > 0 ? "1px solid var(--vscode-editorGroup-border)" : "none",
						display: "grid",
						gridTemplateColumns: "120px 1fr",
						gap: 6,
						lineHeight: 1.5,
					}}>
					<span style={{ color: "var(--vscode-descriptionForeground)" }}>Pending tool</span>
					<div style={{ color: normalColor }}>
						{metadata.pendingToolInfo.tool}
						{metadata.pendingToolInfo.path ? ` · ${metadata.pendingToolInfo.path}` : ""}
						{metadata.pendingToolInfo.command ? ` · ${metadata.pendingToolInfo.command}` : ""}
					</div>
				</div>
			)}

			{output.length > 0 && (
				<div style={{ padding: "6px 8px 10px" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: 6,
						}}>
						<span style={{ color: "var(--vscode-descriptionForeground)" }}>Output</span>
						<button
							className="vscode-button"
							onClick={() => setIsHookOutputExpanded((v) => !v)}
							style={{ padding: "2px 8px" }}>
							{isHookOutputExpanded ? "Collapse" : "Expand"}
						</button>
					</div>
					<pre
						style={{
							maxHeight: isHookOutputExpanded ? "none" : 160,
							overflow: "auto",
							backgroundColor: "var(--vscode-editor-background)",
							padding: "8px",
							borderRadius: 4,
							border: "1px solid var(--vscode-editorGroup-border)",
							whiteSpace: "pre-wrap",
							color: normalColor,
						}}>
						{output}
					</pre>
				</div>
			)}

			{metadata.error && (
				<div style={{ padding: "8px 10px", borderTop: "1px solid var(--vscode-editorGroup-border)" }}>
					<div style={{ color: errorColor, fontWeight: 600, marginBottom: 4 }}>Error</div>
					<div style={{ color: normalColor, whiteSpace: "pre-wrap" }}>{metadata.error.message}</div>
					{metadata.error.details && (
						<div style={{ color: "var(--vscode-descriptionForeground)", marginTop: 4 }}>{metadata.error.details}</div>
					)}
				</div>
			)}
		</div>
	)
})

export default HookMessage
