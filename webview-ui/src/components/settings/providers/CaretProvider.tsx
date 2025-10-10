import { caretModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import { handleLogin, handleLogout } from "../CaretAuthHandler"
import CaretModelPicker from "../CaretModelPicker"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the CaretProvider component
 */
interface CaretProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Caret provider configuration component
 */
export const CaretProvider = ({ showModelOptions, isPopup, currentMode }: CaretProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const caretUser = apiConfiguration?.caretUserProfile

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Local state for collapsible model configuration section
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)

	// Show profile page if authenticated
	if (caretUser) {
		const name = caretUser.displayName
		return (
			<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
				<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
					{t("providers.caret.profile", "settings")}
				</p>

				{/* User Profile Section */}
				{/* <div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 8,
						padding: 12,
						backgroundColor: "var(--vscode-editor-background)",
						borderRadius: 4,
						border: "1px solid var(--vscode-widget-border)",
					}}>
					{name && (
						<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
							<strong style={{ fontSize: 14, color: "var(--vscode-foreground)" }}>{name}</strong>
						</div>
					)}
					<div style={{ fontSize: 12, color: "var(--vscode-descriptionForeground)" }}>{caretUser.email}</div>
				</div> */}

				{showModelOptions && <CaretModelPicker currentMode={currentMode} isPopup={isPopup} />}

				{/* Actions */}
				{/* <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
					<VSCodeButton appearance="secondary" className="w-full" onClick={handleLogout} style={{ minWidth: "120px" }}>
						{t("providers.caret.logout", "settings")}
					</VSCodeButton>
				</div> */}
			</div>
		)
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.caret.description", "settings")}
			</p>

			<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
				<VSCodeButton appearance="primary" className="w-full" onClick={handleLogin} style={{ minWidth: "120px" }}>
					{t("providers.caret.login", "settings")}
				</VSCodeButton>
			</div>
			<div
				onClick={() => setModelConfigurationSelected((val) => !val)}
				style={{
					color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
					display: "flex",
					margin: "10px 0",
					cursor: "pointer",
					alignItems: "center",
				}}>
				<span
					className={`codicon ${modelConfigurationSelected ? "codicon-chevron-down" : "codicon-chevron-right"}`}
					style={{
						marginRight: "4px",
					}}></span>
				<span
					style={{
						fontWeight: 700,
						textTransform: "uppercase",
					}}>
					{t("providers.caret.modelConfigurationLabel", "settings")}
				</span>
			</div>
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("providers.caret.description1", "settings")}{" "}
				<VSCodeLink href="https://docs.caret.ai/docs/" style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.caret.quickstartGuideLink", "settings")}
				</VSCodeLink>{" "}
				{t("providers.caret.description2", "settings")}
			</p>

			{showModelOptions && (
				<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
			)}
		</div>
	)
}
