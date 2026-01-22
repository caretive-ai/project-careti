import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import {
    getAsVar,
    VSC_DESCRIPTION_FOREGROUND,
    VSC_INPUT_BORDER,
    VSC_INPUT_PLACEHOLDER_FOREGROUND,
    VSC_SIDEBAR_BACKGROUND,
} from "@/utils/vscStyles"

interface TooltipProps {
	visible?: boolean
	hintText?: string
	tipText: string
	children: React.ReactNode
	style?: React.CSSProperties
}

// CARETI MODIFICATION: Improve tooltip positioning to prevent screen overflow
// add styled component for tooltip
const TooltipBody = styled.div<Pick<TooltipProps, "style"> & { $autoPosition?: boolean }>`
	position: absolute;
	background-color: ${getAsVar(VSC_SIDEBAR_BACKGROUND)};
	color: ${getAsVar(VSC_DESCRIPTION_FOREGROUND)};
	padding: 5px;
	border-radius: 5px;
	bottom: 100%;
	left: ${(props) => (props.$autoPosition ? "auto" : props.style?.left !== undefined ? `${props.style.left}%` : "-100%")};
	right: ${(props) => (props.$autoPosition ? "0" : "auto")};
	transform: ${(props) => (props.$autoPosition ? "none" : "translateX(-50%)")};
	z-index: ${(props) => props.style?.zIndex ?? 1000};
	white-space: wrap;
	max-width: 200px;
	border: 1px solid ${getAsVar(VSC_INPUT_BORDER)};
	pointer-events: none;
	font-size: 0.9em;
`

const Hint = styled.div`
	font-size: 0.8em;
	color: ${getAsVar(VSC_INPUT_PLACEHOLDER_FOREGROUND)};
	opacity: 0.8;
	margin-top: 2px;
`

const Tooltip: React.FC<TooltipProps> = ({ visible, tipText, hintText, children, style }) => {
	const [isHovered, setIsHovered] = useState(false)
	const [autoPosition, setAutoPosition] = useState(false)
	const tooltipRef = useRef<HTMLDivElement>(null)
	const containerRef = useRef<HTMLDivElement>(null)

	// Determine final visibility based on prop or internal state
	const shouldShow = visible !== undefined ? visible : isHovered

	// CARETI MODIFICATION: Check if tooltip overflows screen and adjust position
	useEffect(() => {
		if (shouldShow && tooltipRef.current && containerRef.current) {
			const tooltipRect = tooltipRef.current.getBoundingClientRect()
			const containerRect = containerRef.current.getBoundingClientRect()

			// Check if tooltip is cut off on the left side
			if (tooltipRect.left < 0 || containerRect.right > window.innerWidth - 220) {
				setAutoPosition(true)
			} else {
				setAutoPosition(false)
			}
		}
	}, [shouldShow])

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			ref={containerRef}
			style={{ position: "relative", display: "inline-block" }}>
			{children}
			{shouldShow && (
				<TooltipBody $autoPosition={autoPosition} ref={tooltipRef} style={style}>
					{tipText}
					{hintText && <Hint>{hintText}</Hint>}
				</TooltipBody>
			)}
		</div>
	)
}

export default Tooltip
