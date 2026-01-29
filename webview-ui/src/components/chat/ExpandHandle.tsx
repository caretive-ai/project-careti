/**
 * ExpandHandle - Reusable expand/collapse handle component
 *
 * CARETI MODIFICATION: Ported from ref-cline with inline styles
 * Source: ref-cline/webview-ui/src/components/chat/ExpandHandle.tsx
 */

import { TriangleIcon } from "lucide-react"
import { memo } from "react"

interface ExpandHandleProps {
	isExpanded: boolean
	onToggle: () => void
	backgroundColor?: string
}

/**
 * Reusable expand/collapse handle component
 * Used by CompletionOutput, PlanCompletionOutput, CommandOutput, etc.
 */
const ExpandHandle = memo(
	({ isExpanded, onToggle, backgroundColor = "var(--vscode-descriptionForeground)" }: ExpandHandleProps) => {
		return (
			<div
				onClick={onToggle}
				style={{
					position: "absolute",
					bottom: "-8px",
					left: "50%",
					zIndex: 10,
					transform: "translateX(-50%)",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					padding: "2px 20px",
					cursor: "pointer",
					backgroundColor,
					transition: "opacity 0.2s",
					borderRadius: "0 0 4px 4px",
					flexShrink: 0,
					pointerEvents: "auto",
				}}>
				<TriangleIcon
					size={8}
					style={{
						color: "var(--vscode-editor-background)",
						fill: "var(--vscode-editor-background)",
						transform: isExpanded ? "rotate(0deg)" : "rotate(180deg)",
						transition: "transform 0.2s",
					}}
				/>
			</div>
		)
	},
)

ExpandHandle.displayName = "ExpandHandle"

export default ExpandHandle
