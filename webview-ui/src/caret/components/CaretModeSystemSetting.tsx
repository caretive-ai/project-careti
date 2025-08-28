// CARET MODIFICATION: Copy-and-Modify from caret-main - Mode System Setting Component
import React, { useState, useEffect } from "react"
import { t } from "../utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { TaskServiceClient } from "@/services/grpc-client"
import { MODE_SYSTEMS, STORAGE_KEYS, SETTING_KEYS, type ModeSystem } from "@caret-src/shared/constants/ModeSystemConstants"

interface CaretModeSystemSettingProps {
	hideLabel?: boolean
}

// CARET MODIFICATION: Styled components using CSS-in-JS for mode toggle
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
	width: "140px",
	height: "28px",
}

const modeSliderStyle = (isCline: boolean): React.CSSProperties => ({
	position: "absolute",
	height: "100%",
	width: "50%",
	backgroundColor: "var(--vscode-focusBorder)",
	transition: "transform 0.2s ease",
	transform: `translateX(${isCline ? "100%" : "0%"})`,
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

const CaretModeSystemSetting: React.FC<CaretModeSystemSettingProps> = ({ hideLabel = false }) => {
	// CARET MODIFICATION: Use ExtensionState for mode system with proper backend connection
	const { mode } = useExtensionState()
	const [currentMode, setCurrentMode] = useState<ModeSystem>(MODE_SYSTEMS.CLINE) // default to cline

	// CARET MODIFICATION: Sync with ExtensionState mode
	useEffect(() => {
		// Map ExtensionState mode to our ModeSystem
		const mappedMode: ModeSystem = mode === "plan" ? MODE_SYSTEMS.CARET : MODE_SYSTEMS.CLINE
		setCurrentMode(mappedMode)
	}, [mode])

	// TODO: Connect to backend storage when available
	useEffect(() => {
		try {
			// Load saved mode system from storage
			const savedMode = localStorage.getItem(STORAGE_KEYS.MODE_SYSTEM) as ModeSystem
			if (savedMode && (savedMode === MODE_SYSTEMS.CARET || savedMode === MODE_SYSTEMS.CLINE)) {
				setCurrentMode(savedMode)
			}
		} catch (error) {
			console.warn("Failed to load mode system from localStorage:", error)
			// Continue with default mode
		}
	}, [])

	const handleModeChange = () => {
		const newMode: ModeSystem = currentMode === MODE_SYSTEMS.CARET ? MODE_SYSTEMS.CLINE : MODE_SYSTEMS.CARET
		console.log("🔄 Mode system change requested:", newMode)

		try {
			setCurrentMode(newMode)

			// CARET MODIFICATION: Map between Cline (plan/act) and Caret (chatbot/agent) mode systems
			// When switching to caret: plan->plan(chatbot), act->act(agent)
			// When switching to cline: current mode is preserved as plan/act
			// This maintains the conceptual mapping while allowing independent toggles

			// CARET MODIFICATION: Update modeSystem in backend state
			updateSetting(SETTING_KEYS.MODE_SYSTEM, newMode)

			// CARET MODIFICATION: Also update mode - for Caret system, default to agent mode
			if (newMode === MODE_SYSTEMS.CARET) {
				updateSetting(SETTING_KEYS.MODE, "act") // act maps to agent in Caret system
			}

			// CARET MODIFICATION: Start new task when mode changes (from caret-main)
			TaskServiceClient.clearTask({})

			// Save to localStorage for UI consistency (backup)
			localStorage.setItem(STORAGE_KEYS.MODE_SYSTEM, newMode)

			// CARET MODIFICATION: Dispatch custom event for same-window synchronization
			window.dispatchEvent(
				new CustomEvent("caretModeSystemChanged", {
					detail: { newMode },
				}),
			)

			console.log("✅ Mode system changed successfully:", newMode)
			console.log("🆕 Starting new task due to mode change")
		} catch (error) {
			console.error("❌ Failed to change mode system:", error)
		}
	}

	return (
		<div className="mb-[15px]">
			<div className="flex items-center justify-between mb-2">
				{!hideLabel && <label className="text-sm font-medium">{t("settings.modeSystem.label", "settings")}</label>}
				<div style={modeSwitchContainerStyle} onClick={handleModeChange}>
					{/* Slider background */}
					<div style={modeSliderStyle(currentMode === MODE_SYSTEMS.CLINE)} />

					{/* Caret option */}
					<div style={modeSwitchOptionStyle(currentMode === MODE_SYSTEMS.CARET)}>
						{t("settings.modeSystem.options.caret", "settings")}
					</div>

					{/* Cline option */}
					<div style={modeSwitchOptionStyle(currentMode === MODE_SYSTEMS.CLINE)}>
						{t("settings.modeSystem.options.cline", "settings")}
					</div>
				</div>
			</div>
			<p className="text-xs text-[var(--vscode-descriptionForeground)]">
				{t("settings.modeSystem.description", "settings")}
			</p>
		</div>
	)
}

export default React.memo(CaretModeSystemSetting)
