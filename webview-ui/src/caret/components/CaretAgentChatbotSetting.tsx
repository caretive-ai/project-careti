// CARET MODIFICATION: Agent/Chatbot Mode Toggle Component

import { CARET_MODES, MODE_MAPPINGS, SETTING_KEYS, STORAGE_KEYS } from "@caret-src/shared/constants/ModeSystemConstants"
import { Mode } from "@shared/storage/types"
import React, { useEffect, useState } from "react"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { t } from "../utils/i18n"

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
	const { mode } = useExtensionState()
	const [currentMode, setCurrentMode] = useState<Mode>(CARET_MODES.CHATBOT)

	// Sync with ExtensionState mode
	useEffect(() => {
		// Map backend mode (plan/act) to Caret mode (chatbot/agent)
		if (mode === "plan") {
			setCurrentMode(CARET_MODES.CHATBOT)
		} else if (mode === "act") {
			setCurrentMode(CARET_MODES.AGENT)
		}
	}, [mode])

	const handleModeChange = () => {
		const newCaretMode: Mode = currentMode === CARET_MODES.CHATBOT ? CARET_MODES.AGENT : CARET_MODES.CHATBOT
		console.log("🔄 Caret mode change requested:", newCaretMode)

		setCurrentMode(newCaretMode)

		// Map Caret mode to backend mode
		const backendMode = MODE_MAPPINGS.CARET_TO_BACKEND[newCaretMode as keyof typeof MODE_MAPPINGS.CARET_TO_BACKEND]
		console.log("🔄 Mapping to backend mode:", backendMode)

		// Update backend mode using settings handler
		updateSetting(SETTING_KEYS.MODE, backendMode)

		// Save to localStorage for UI consistency (backup)
		localStorage.setItem(STORAGE_KEYS.CURRENT_MODE, newCaretMode)

		console.log("✅ Caret mode updated:", newCaretMode, "→", backendMode)
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

			<div onClick={handleModeChange} style={modeSwitchContainerStyle}>
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
