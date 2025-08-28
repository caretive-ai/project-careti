// CARET MODIFICATION: Agent/Chatbot Mode Toggle Component
import React, { useState, useEffect } from "react"
import { t } from "../utils/i18n"
import { STORAGE_KEYS, CARET_MODES } from "@caret-src/shared/constants/ModeSystemConstants"
import { Mode } from "@shared/storage/types"

interface CaretAgentChatbotSettingProps {
	hideLabel?: boolean
}

// Styled components for mode toggle
const modeSwitchContainerStyle: React.CSSProperties = {
	position: "relative",
	display: "flex",
	alignItems: "center",
	backgroundColor: "var(--vscode-editor-background)",
	border: "1px solid var(--vscode-input-border)",
	borderRadius: "2px",
	cursor: "pointer",
	transition: "all 0.2s ease",
	userSelect: "none",
	width: "160px",
	height: "28px",
}

const modeSliderStyle = (isAgent: boolean): React.CSSProperties => ({
	position: "absolute",
	height: "100%",
	width: "50%",
	backgroundColor: "var(--vscode-focusBorder)",
	transition: "transform 0.2s ease",
	transform: `translateX(${isAgent ? "100%" : "0%"})`,
})

const modeSwitchOptionStyle = (isActive: boolean): React.CSSProperties => ({
	padding: "4px 12px",
	color: isActive ? "white" : "var(--vscode-input-foreground)",
	zIndex: 1,
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	flex: 1,
	height: "100%",
	fontSize: "11px",
	fontWeight: isActive ? "600" : "400",
	transition: "all 0.2s ease",
})

const CaretAgentChatbotSetting: React.FC<CaretAgentChatbotSettingProps> = ({ hideLabel = false }) => {
	const [currentMode, setCurrentMode] = useState<Mode>(CARET_MODES.CHATBOT)

	// Load current mode from localStorage on mount
	useEffect(() => {
		const savedMode = localStorage.getItem(STORAGE_KEYS.CURRENT_MODE) as Mode
		if (savedMode && (savedMode === CARET_MODES.AGENT || savedMode === CARET_MODES.CHATBOT)) {
			setCurrentMode(savedMode)
		} else {
			// Set default and save to localStorage
			setCurrentMode(CARET_MODES.CHATBOT)
			localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, CARET_MODES.CHATBOT)
		}
	}, [])

	const handleModeChange = () => {
		const newMode: Mode = currentMode === CARET_MODES.CHATBOT ? CARET_MODES.AGENT : CARET_MODES.CHATBOT
		console.log("🔄 Caret mode change requested:", newMode)

		setCurrentMode(newMode)
		localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newMode)

		console.log("✅ Caret mode saved to localStorage:", newMode)

		// Optionally refresh the chat view to apply new mode
		// Note: This will reload the entire chat interface
		if (typeof window !== "undefined" && window.location) {
			window.location.reload()
		}
	}

	return (
		<div>
			{!hideLabel && (
				<div
					style={{
						marginBottom: "8px",
						fontSize: "13px",
						color: "var(--vscode-foreground)",
						fontWeight: "500",
					}}>
					{t("settings.caretMode.title", "Caret Mode")}
				</div>
			)}

			<div style={modeSwitchContainerStyle} onClick={handleModeChange}>
				{/* Slider background */}
				<div style={modeSliderStyle(currentMode === CARET_MODES.AGENT)} />

				{/* Chatbot option */}
				<div style={modeSwitchOptionStyle(currentMode === CARET_MODES.CHATBOT)}>
					{t("settings.caretMode.chatbot", "Chatbot")}
				</div>

				{/* Agent option */}
				<div style={modeSwitchOptionStyle(currentMode === CARET_MODES.AGENT)}>
					{t("settings.caretMode.agent", "Agent")}
				</div>
			</div>

			<div
				style={{
					marginTop: "6px",
					fontSize: "11px",
					color: "var(--vscode-descriptionForeground)",
					lineHeight: "1.4",
				}}>
				{currentMode === CARET_MODES.CHATBOT
					? t("settings.caretMode.chatbot.description", "Analysis and guidance with approval buttons")
					: t("settings.caretMode.agent.description", "Full development mode with continuous conversation")}
			</div>
		</div>
	)
}

export default CaretAgentChatbotSetting
