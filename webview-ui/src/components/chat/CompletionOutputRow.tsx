/**
 * CompletionOutputRow - Task Completed UI with green theme
 *
 * CARETI MODIFICATION: Ported from ref-cline with inline styles
 * Source: ref-cline/webview-ui/src/components/chat/CompletionOutputRow.tsx
 */

import { t } from "@/careti/utils/i18n"
import { Int64Request } from "@shared/proto/cline/common"
import { CheckIcon } from "lucide-react"
import { memo } from "react"
import { TaskServiceClient } from "@/services/grpc-client"
import { CopyButton } from "../common/CopyButton"
import SuccessButton from "../common/SuccessButton"
import { QuoteButtonState } from "./ChatRow"
import QuoteButton from "./QuoteButton"
import MarkdownBlock from "../common/MarkdownBlock"

interface CompletionOutputRowProps {
	text: string
	quoteButtonState: QuoteButtonState
	handleQuoteClick: () => void
	showActionRow?: boolean
	seeNewChangesDisabled: boolean
	setSeeNewChangesDisabled: (value: boolean) => void
	explainChangesDisabled: boolean
	setExplainChangesDisabled: (value: boolean) => void
	messageTs: number
}

export const CompletionOutputRow = memo(
	({
		text,
		quoteButtonState,
		showActionRow,
		seeNewChangesDisabled,
		setSeeNewChangesDisabled,
		explainChangesDisabled,
		setExplainChangesDisabled,
		messageTs,
		handleQuoteClick,
	}: CompletionOutputRowProps) => {
		const successColor = "var(--vscode-terminal-ansiGreen)"

		return (
			<div>
				{/* Main Container with green theme */}
				<div
					style={{
						borderRadius: "4px",
						border: `1px solid color-mix(in srgb, ${successColor} 20%, transparent)`,
						overflow: "visible",
						backgroundColor: `color-mix(in srgb, ${successColor} 10%, transparent)`,
						padding: "8px",
						paddingTop: "12px",
					}}>
					{/* Title */}
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
							<CheckIcon size={14} style={{ color: successColor }} />
							<span style={{ color: successColor, fontWeight: "bold" }}>{t("taskCompleted", "chat")}</span>
						</div>
						<CopyButton style={{ color: successColor }} textToCopy={text} />
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
							}}>
							<MarkdownBlock markdown={text} />
							{quoteButtonState.visible && (
								<QuoteButton left={quoteButtonState.left} onClick={handleQuoteClick} top={quoteButtonState.top} />
							)}
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				{showActionRow && (
					<CompletionOutputActionRow
						explainChangesDisabled={explainChangesDisabled}
						messageTs={messageTs}
						seeNewChangesDisabled={seeNewChangesDisabled}
						setExplainChangesDisabled={setExplainChangesDisabled}
						setSeeNewChangesDisabled={setSeeNewChangesDisabled}
					/>
				)}
			</div>
		)
	},
)

CompletionOutputRow.displayName = "CompletionOutputRow"

const CompletionOutputActionRow = memo(
	({
		seeNewChangesDisabled,
		setSeeNewChangesDisabled,
		explainChangesDisabled,
		setExplainChangesDisabled,
		messageTs,
	}: {
		seeNewChangesDisabled: boolean
		setSeeNewChangesDisabled: (value: boolean) => void
		explainChangesDisabled: boolean
		setExplainChangesDisabled: (value: boolean) => void
		messageTs: number
	}) => {
		return (
			<div style={{ paddingTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
				<SuccessButton
					disabled={seeNewChangesDisabled}
					onClick={() => {
						setSeeNewChangesDisabled(true)
						TaskServiceClient.taskCompletionViewChanges(
							Int64Request.create({
								value: messageTs,
							}),
						).catch((err) => console.error("Failed to show task completion view changes:", err))
					}}
					style={{
						cursor: seeNewChangesDisabled ? "wait" : "pointer",
						width: "100%",
					}}>
					<i className="codicon codicon-new-file" style={{ marginRight: 6 }} />
					{t("seeNewChanges", "chat")}
				</SuccessButton>

				<SuccessButton
					disabled={explainChangesDisabled}
					onClick={() => {
						setExplainChangesDisabled(true)
						TaskServiceClient.explainChanges({
							metadata: {},
							messageTs,
						}).catch((err) => {
							console.error("Failed to explain changes:", err)
							setExplainChangesDisabled(false)
						})
					}}
					style={{
						cursor: explainChangesDisabled ? "wait" : "pointer",
						width: "100%",
					}}>
					<i className="codicon codicon-comment-discussion" style={{ marginRight: 6 }} />
					{explainChangesDisabled ? t("explaining", "chat") : t("explainChanges", "chat")}
				</SuccessButton>
			</div>
		)
	},
)

CompletionOutputActionRow.displayName = "CompletionOutputActionRow"
