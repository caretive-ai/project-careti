import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import React, { memo, useCallback, useMemo, useState } from "react"
import { t } from "@/careti/utils/i18n"
import { formatLargeNumber as formatTokenNumber } from "@/utils/format"

interface TokenUsageInfoProps {
	tokensIn?: number
	tokensOut?: number
	cacheWrites?: number
	cacheReads?: number
}

interface TaskContextWindowButtonsProps extends TokenUsageInfoProps {
	percentage: number
	tokenUsed: number
	contextWindow: number
	autoCompactThreshold?: number
	isThresholdChanged?: boolean
	isThresholdFadingOut?: boolean
}

const AccordionItem = memo<{
	title: string
	value: React.ReactNode
	isExpanded: boolean
	onToggle: (event?: React.MouseEvent) => void
	children?: React.ReactNode
}>(({ title, value, isExpanded, onToggle, children }) => {
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault()
			event.stopPropagation()
			onToggle(event)
		},
		[onToggle],
	)

	return (
		<div className="flex flex-col">
			<div
				className="flex justify-between items-center gap-3 cursor-pointer hover:bg-foreground/5 rounded px-1 py-0.5 transition-colors"
				onClick={handleClick}>
				<div className="flex items-center gap-1">
					{isExpanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
					<div className="font-semibold text-sm">{title}</div>
				</div>
				<div className="text-muted-foreground text-sm">{value}</div>
			</div>
			{isExpanded && children && <div className="ml-4 mt-2 mb-1 text-xs text-muted-foreground">{children}</div>}
		</div>
	)
})
AccordionItem.displayName = "AccordionItem"

const TokenUsageDetails = memo<TokenUsageInfoProps>(({ tokensIn, tokensOut, cacheWrites, cacheReads }) => {
	const contextTokenDetails = useMemo(() => {
		const config = [
			{ title: t("contextWindowSummary.promptTokens", "chat"), icon: "codicon-arrow-up", value: tokensIn },
			{ title: t("contextWindowSummary.completionTokens", "chat"), icon: "codicon-arrow-down", value: tokensOut },
			{ title: t("contextWindowSummary.cacheWrites", "chat"), icon: "codicon-arrow-left", value: cacheWrites || 0 },
			{ title: t("contextWindowSummary.cacheReads", "chat"), icon: "codicon-arrow-right", value: cacheReads || 0 },
		]
		return config.filter((item) => item.value)
	}, [cacheReads, cacheWrites, tokensIn, tokensOut])

	if (!tokensIn) {
		return <div>{t("contextWindowSummary.noTokenData", "chat")}</div>
	}

	return (
		<div className="space-y-2">
			{contextTokenDetails.map((item) => (
				<div className="flex items-center justify-between" key={item.icon}>
					<div className="flex items-center gap-1">
						<i className={`codicon ${item.icon} text-xs`} />
						<span>{item.title}</span>
					</div>
					<span className="font-mono">{formatTokenNumber(item.value || 0)}</span>
				</div>
			))}
		</div>
	)
})
TokenUsageDetails.displayName = "TokenUsageDetails"

export const ContextWindowSummary: React.FC<TaskContextWindowButtonsProps> = ({
	contextWindow,
	tokenUsed,
	tokensIn,
	tokensOut,
	cacheWrites,
	cacheReads,
	percentage,
	autoCompactThreshold = 0,
}) => {
	// Accordion state
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

	const toggleSection = useCallback((section: string, event?: React.MouseEvent) => {
		if (event) {
			event.preventDefault()
			event.stopPropagation()
		}
		setExpandedSections((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(section)) {
				newSet.delete(section)
			} else {
				newSet.add(section)
			}
			return newSet
		})
	}, [])

	const totalTokens = (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)

	return (
		<div className="context-window-tooltip-content flex flex-col gap-2 bg-menu rounded shadow-sm border border-menu-border z-100 w-60 p-4">
			{autoCompactThreshold > 0 && (
				<AccordionItem
					isExpanded={expandedSections.has("threshold")}
					onToggle={(event) => toggleSection("threshold", event)}
					title={t("contextWindowSummary.autoCondenseThreshold", "chat")}
					value={<span className="text-muted-foreground">{`${(autoCompactThreshold * 100).toFixed(0)}%`}</span>}>
					<div className="space-y-1">
						<p className="text-xs leading-relaxed text-white">
							{t("contextWindowSummary.autoCondenseHint1", "chat")}
						</p>
						<p className="text-xs leading-relaxed mt-0 mb-0">{t("contextWindowSummary.autoCondenseHint2", "chat")}</p>
					</div>
				</AccordionItem>
			)}

			<AccordionItem
				isExpanded={expandedSections.has("context")}
				onToggle={(event) => toggleSection("context", event)}
				title={t("contextWindowSummary.contextWindow", "chat")}
				value={
					percentage
						? t("contextWindowSummary.contextWindowPercentUsed", "chat", { value: percentage.toFixed(1) })
						: formatTokenNumber(contextWindow)
				}>
				<div className="space-y-1">
					<div className="flex justify-between">
						<span>{t("contextWindowSummary.used", "chat")}</span>
						<span className="font-mono">{formatTokenNumber(tokenUsed)}</span>
					</div>
					<div className="flex justify-between">
						<span>{t("contextWindowSummary.total", "chat")}</span>
						<span className="font-mono">{formatTokenNumber(contextWindow)}</span>
					</div>
					<div className="flex justify-between">
						<span>{t("contextWindowSummary.remaining", "chat")}</span>
						<span className="font-mono">{formatTokenNumber(contextWindow - tokenUsed)}</span>
					</div>
				</div>
			</AccordionItem>

			{totalTokens > 0 && (
				<AccordionItem
					isExpanded={expandedSections.has("tokens")}
					onToggle={(event) => toggleSection("tokens", event)}
					title={t("contextWindowSummary.tokenUsage", "chat")}
					value={t("contextWindowSummary.tokenUsageTotal", "chat", { value: formatTokenNumber(totalTokens) })}>
					<TokenUsageDetails
						cacheReads={cacheReads}
						cacheWrites={cacheWrites}
						tokensIn={tokensIn}
						tokensOut={tokensOut}
					/>
				</AccordionItem>
			)}
		</div>
	)
}
