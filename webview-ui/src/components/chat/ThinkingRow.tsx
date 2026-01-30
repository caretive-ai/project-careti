/**
 * ThinkingRow - Collapsible thinking/reasoning content display
 *
 * CARETI MODIFICATION: Ported from ref-cline with style adaptations
 * Source: ref-cline/webview-ui/src/components/chat/ThinkingRow.tsx
 * Removed shadcn dependencies (Button, cn) and using inline styles
 * Added PersonaAvatar integration for thinking state display
 */

import { t } from "@/careti/utils/i18n"
import PersonaAvatar from "@/careti/components/PersonaAvatar"
import { FullPersonaProfile } from "@/careti/context/CaretiStateContext"
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import { memo, useEffect, useRef } from "react"

interface ThinkingRowProps {
	showTitle: boolean
	reasoningContent?: string
	isVisible: boolean
	isExpanded: boolean
	onToggle?: () => void
	// CARETI MODIFICATION: Persona integration
	personaProfile?: FullPersonaProfile | null
	showPersonaAvatar?: boolean
}

export const ThinkingRow = memo(
	({
		showTitle = false,
		reasoningContent,
		isVisible,
		isExpanded,
		onToggle,
		personaProfile,
		showPersonaAvatar = false,
	}: ThinkingRowProps) => {
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
			<div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
				{/* CARETI MODIFICATION: Show persona avatar in thinking state */}
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
				<div style={{ flex: 1, minWidth: 0, marginLeft: showPersonaAvatar ? 0 : "0.25rem" }}>
					{showTitle && (
						<button
							onClick={onToggle}
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.25rem",
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
								<ChevronDownIcon size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
							) : (
								<ChevronRightIcon size={14} style={{ opacity: 0.7, flexShrink: 0 }} />
							)}
							<span style={{ fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
								{t("thinkingRow.thinking", "chat")}:
							</span>
							{!isExpanded && reasoningContent && (
								<span
									style={{
										fontStyle: "italic",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										flex: 1,
										minWidth: 0,
									}}>
									{reasoningContent}
								</span>
							)}
						</button>
					)}

					{isExpanded && (
						<div
							onClick={onToggle}
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
								cursor: "pointer",
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
			</div>
		)
	},
)

ThinkingRow.displayName = "ThinkingRow"
