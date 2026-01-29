/**
 * PlanCompletionOutputRow - Plan Created UI with grayscale theme
 *
 * CARETI MODIFICATION: Ported from ref-cline with inline styles
 * Source: ref-cline/webview-ui/src/components/chat/PlanCompletionOutputRow.tsx
 */

import { t } from "@/careti/utils/i18n"
import { NotepadTextIcon } from "lucide-react"
import { memo } from "react"
import { CopyButton } from "../common/CopyButton"
import MarkdownBlock from "../common/MarkdownBlock"

interface PlanCompletionOutputProps {
	text: string
}

/**
 * Styled completion output for Plan Mode responses
 * Uses grayscale colors to distinguish from Act Mode's green success theme
 */
const PlanCompletionOutputRow = memo(({ text }: PlanCompletionOutputProps) => {
	return (
		<div
			style={{
				borderRadius: "4px",
				border: "1px solid color-mix(in srgb, var(--vscode-descriptionForeground) 50%, transparent)",
				overflow: "visible",
				backgroundColor: "var(--vscode-editor-background)",
				padding: "8px",
				paddingTop: "12px",
			}}>
			{/* Header */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: "8px",
					marginBottom: "8px",
					padding: "0 4px",
				}}>
				<div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
					<NotepadTextIcon size={14} style={{ color: "var(--vscode-foreground)" }} />
					<span style={{ color: "var(--vscode-foreground)", fontWeight: "bold" }}>{t("planCreated", "chat")}</span>
				</div>
				<CopyButton textToCopy={text || ""} />
			</div>

			{/* Content */}
			<div
				style={{
					width: "100%",
					position: "relative",
					borderTop: "1px solid color-mix(in srgb, var(--vscode-descriptionForeground) 20%, transparent)",
					borderRadius: "0 0 4px 4px",
				}}>
				<div
					style={{
						padding: "12px 8px 8px 8px",
						width: "100%",
						wordBreak: "break-word",
					}}>
					<MarkdownBlock markdown={text} />
				</div>
			</div>
		</div>
	)
})

PlanCompletionOutputRow.displayName = "PlanCompletionOutputRow"

export default PlanCompletionOutputRow
