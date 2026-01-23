/**
 * TypewriterText - Character-by-character typing animation with shimmer effect
 *
 * CARETI MODIFICATION: Ported from ref-cline with style adaptations
 * Source: ref-cline/webview-ui/src/components/chat/TypewriterText.tsx
 */

import { memo, useEffect, useState } from "react"

// TypewriterText with shimmer effect after typing completes
export const TypewriterText = memo(({ text, speed = 30 }: { text: string; speed?: number }) => {
	const [displayedLength, setDisplayedLength] = useState(0)
	const [isComplete, setIsComplete] = useState(false)

	useEffect(() => {
		setDisplayedLength(0)
		setIsComplete(false)
		const interval = setInterval(() => {
			setDisplayedLength((prev) => {
				if (prev >= text.length) {
					clearInterval(interval)
					setIsComplete(true)
					return prev
				}
				return prev + 1
			})
		}, speed)

		return () => clearInterval(interval)
	}, [text, speed])

	// After typing completes, show shimmer effect instead of blinking cursor
	if (isComplete) {
		return (
			<span
				className="animate-shimmer truncate"
				style={{
					background: "linear-gradient(90deg, var(--vscode-foreground), var(--vscode-descriptionForeground))",
					backgroundSize: "200% 100%",
					WebkitBackgroundClip: "text",
					backgroundClip: "text",
					color: "transparent",
				}}>
				{text}
			</span>
		)
	}

	return <span className="truncate">{text.slice(0, displayedLength)}</span>
})

TypewriterText.displayName = "TypewriterText"
