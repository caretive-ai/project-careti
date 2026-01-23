/**
 * ThinkingRow - Collapsible thinking/reasoning content display
 *
 * CARETI MODIFICATION: Ported from ref-cline with style adaptations
 * Source: ref-cline/webview-ui/src/components/chat/ThinkingRow.tsx
 * Removed shadcn dependencies (Button, cn) and using inline styles
 */

import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { memo, useEffect, useRef } from "react"

interface ThinkingRowProps {
	showTitle: boolean
	reasoningContent?: string
	isVisible: boolean
	isExpanded: boolean
	onToggle?: () => void
}

export const ThinkingRow = memo(
	({ showTitle = false, reasoningContent, isVisible, isExpanded, onToggle }: ThinkingRowProps) => {
		const scrollRef = useRef<HTMLDivElement>(null)

		// Only auto-scroll to bottom during streaming
		useEffect(() => {
			if (scrollRef.current && isVisible) {
				scrollRef.current.scrollTop = scrollRef.current.scrollHeight
			}
		}, [reasoningContent, isVisible])

		if (!isVisible) {
			return null
		}

		return (
			<div style={{ marginLeft: "0.25rem" }}>
				{showTitle ? (
					<button
						onClick={onToggle}
						style={{
							display: "inline-flex",
							alignItems: "baseline",
							gap: "0.125rem",
							textAlign: "left",
							userSelect: "none",
							cursor: "pointer",
							color: "var(--vscode-descriptionForeground)",
							padding: 0,
							width: "100%",
							background: "none",
							border: "none",
							font: "inherit",
						}}>
						{isExpanded ? (
							<ChevronDownIcon size={14} style={{ opacity: 0.7 }} />
						) : (
							<ChevronRightIcon size={14} style={{ opacity: 0.7 }} />
						)}
						<span style={{ fontWeight: 600 }}>Thinking:</span>
						<span
							style={{
								fontStyle: "italic",
								wordBreak: "break-word",
								overflow: "hidden",
								textOverflow: "ellipsis",
								whiteSpace: "nowrap",
								direction: "rtl",
								width: "100%",
							}}>
							{!isExpanded ? reasoningContent : ""}
						</span>
					</button>
				) : null}

				{isExpanded && (
					<div
						onClick={showTitle ? onToggle : undefined}
						style={{
							display: "flex",
							gap: 0,
							overflow: "hidden",
							width: "100%",
							minWidth: 0,
							maxHeight: isVisible ? "200px" : 0,
							opacity: isVisible ? 1 : 0,
							alignItems: "baseline",
							justifyContent: "baseline",
							textAlign: "left",
							padding: 0,
							cursor: showTitle ? "pointer" : "text",
							transition: isVisible
								? "max-height 250ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease-out"
								: undefined,
						}}>
						<div
							ref={scrollRef}
							style={{
								display: "flex",
								maxHeight: "150px",
								overflowY: "auto",
								color: "var(--vscode-descriptionForeground)",
								lineHeight: "normal",
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								flex: 1,
								direction: "ltr",
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								...(showTitle && {
									paddingLeft: "0.5rem",
									borderLeft: "1px solid var(--vscode-descriptionForeground)",
									borderLeftColor: "color-mix(in srgb, var(--vscode-descriptionForeground) 50%, transparent)",
								}),
							}}>
							<span>{reasoningContent}</span>
						</div>
					</div>
				)}
			</div>
		)
	},
)

ThinkingRow.displayName = "ThinkingRow"
