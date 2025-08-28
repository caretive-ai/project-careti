// CARET MODIFICATION: Added Caret mode system imports and logic to display chatbot/agent tabs instead of plan/act tabs

import {
	CARET_MODES,
	MODE_MAPPINGS,
	MODE_SYSTEMS,
	type ModeSystem,
	SETTING_KEYS,
	STORAGE_KEYS,
} from "@caret-src/shared/constants/ModeSystemConstants"
import { UpdateSettingsRequest } from "@shared/proto/cline/state"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { TabButton } from "../../mcp/configuration/McpConfigurationView"
import ApiOptions from "../ApiOptions"
import Section from "../Section"
import { syncModeConfigurations } from "../utils/providerUtils"
import { updateSetting } from "../utils/settingsHandlers"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface ApiConfigurationSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const ApiConfigurationSection = ({ renderSectionHeader }: ApiConfigurationSectionProps) => {
	const { planActSeparateModelsSetting, mode, apiConfiguration } = useExtensionState()
	const [currentTab, setCurrentTab] = useState<Mode>(mode)
	// CARET MODIFICATION: Added mode system tracking for conditional tab rendering
	const [currentModeSystem, setCurrentModeSystem] = useState<ModeSystem>(MODE_SYSTEMS.CLINE)
	const { handleFieldsChange } = useApiConfigurationHandlers()

	// CARET MODIFICATION: Sync currentTab with mode from ExtensionState
	useEffect(() => {
		setCurrentTab(mode)
	}, [mode])

	// CARET MODIFICATION: Load current mode system from localStorage and listen for changes
	useEffect(() => {
		const savedMode = localStorage.getItem(STORAGE_KEYS.MODE_SYSTEM) as ModeSystem
		console.log("🔧 [ApiConfigurationSection] Loading mode system from localStorage:", {
			savedMode,
			storageKey: STORAGE_KEYS.MODE_SYSTEM,
			isValid: savedMode && (savedMode === MODE_SYSTEMS.CARET || savedMode === MODE_SYSTEMS.CLINE),
		})
		if (savedMode && (savedMode === MODE_SYSTEMS.CARET || savedMode === MODE_SYSTEMS.CLINE)) {
			setCurrentModeSystem(savedMode)
			console.log("🔧 [ApiConfigurationSection] Mode system updated to:", savedMode)
		}

		// Listen for mode system changes
		const handleModeSystemChange = (event: CustomEvent) => {
			setCurrentModeSystem(event.detail.newMode)
		}

		window.addEventListener("caretModeSystemChanged", handleModeSystemChange as EventListener)

		return () => {
			window.removeEventListener("caretModeSystemChanged", handleModeSystemChange as EventListener)
		}
	}, [])

	// CARET MODIFICATION: Handle tab clicks for both Caret and Cline modes
	const handleTabClick = (newTab: Mode) => {
		setCurrentTab(newTab)

		if (currentModeSystem === MODE_SYSTEMS.CARET) {
			// In Caret mode, update the actual backend mode
			updateSetting(SETTING_KEYS.MODE, newTab)
			console.log("🔄 Caret mode tab clicked, updating backend mode:", newTab)
		}
	}

	console.log(
		"🔧 [ApiConfigurationSection] Rendering with currentModeSystem:",
		currentModeSystem,
		"localStorage:",
		localStorage.getItem(STORAGE_KEYS.MODE_SYSTEM),
	)

	return (
		<div>
			{renderSectionHeader("api-config")}
			<Section>
				{/* Tabs container */}
				{/* CARET MODIFICATION: Always show tabs for Caret mode, respect setting for Cline mode */}
				{currentModeSystem === MODE_SYSTEMS.CARET || planActSeparateModelsSetting ? (
					<div className="rounded-md mb-5 bg-[var(--vscode-panel-background)]">
						<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
							{/* CARET MODIFICATION: Conditional tab rendering based on mode system (Caret vs Cline) */}
							{currentModeSystem === MODE_SYSTEMS.CARET ? (
								<>
									{/* Caret Mode: Show Chatbot/Agent tabs */}
									<TabButton
										disabled={currentTab === "plan"}
										isActive={currentTab === "plan"}
										onClick={() => handleTabClick("plan")}
										style={{
											opacity: 1,
											cursor: "pointer",
										}}>
										Chatbot Mode
									</TabButton>
									<TabButton
										disabled={currentTab === "act"}
										isActive={currentTab === "act"}
										onClick={() => handleTabClick("act")}
										style={{
											opacity: 1,
											cursor: "pointer",
										}}>
										Agent Mode
									</TabButton>
								</>
							) : (
								<>
									{/* Cline Mode: Show Plan/Act tabs */}
									<TabButton
										disabled={currentTab === "plan"}
										isActive={currentTab === "plan"}
										onClick={() => handleTabClick("plan")}
										style={{
											opacity: 1,
											cursor: "pointer",
										}}>
										Plan Mode
									</TabButton>
									<TabButton
										disabled={currentTab === "act"}
										isActive={currentTab === "act"}
										onClick={() => handleTabClick("act")}
										style={{
											opacity: 1,
											cursor: "pointer",
										}}>
										Act Mode
									</TabButton>
								</>
							)}
						</div>

						{/* Content container */}
						<div className="-mb-3">
							<ApiOptions currentMode={currentTab} showModelOptions={true} />
						</div>
					</div>
				) : (
					<ApiOptions currentMode={mode} showModelOptions={true} />
				)}

				<div className="mb-[5px]">
					<VSCodeCheckbox
						checked={planActSeparateModelsSetting}
						className="mb-[5px]"
						onChange={async (e: any) => {
							const checked = e.target.checked === true
							try {
								// If unchecking the toggle, wait a bit for state to update, then sync configurations
								if (!checked) {
									await syncModeConfigurations(apiConfiguration, currentTab, handleFieldsChange)
								}
								await StateServiceClient.updateSettings(
									UpdateSettingsRequest.create({
										planActSeparateModelsSetting: checked,
									}),
								)
							} catch (error) {
								console.error("Failed to update separate models setting:", error)
							}
						}}>
						Use different models for Plan and Act modes
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						Switching between Plan and Act mode will persist the API and model used in the previous mode. This may be
						helpful e.g. when using a strong reasoning model to architect a plan for a cheaper coding model to act on.
					</p>
				</div>
			</Section>
		</div>
	)
}

export default ApiConfigurationSection
