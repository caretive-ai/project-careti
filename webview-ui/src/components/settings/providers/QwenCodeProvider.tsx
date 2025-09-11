import { qwenCodeModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the QwenCodeProvider component
 */
interface QwenCodeProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Qwen Code provider configuration component
 */
export const QwenCodeProvider = ({ showModelOptions, isPopup, currentMode }: QwenCodeProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ whiteSpace: "pre-wrap" }}>{t("providers.qwenCode.description", "settings")}</p>
			<h3 style={{ color: "var(--vscode-foreground)", margin: "8px 0" }}>
				{t("qwenCodeProvider.apiConfigurationTitle", "settings")}
			</h3>
			<VSCodeTextField
				onInput={(e: any) => handleFieldChange("qwenCodeOauthPath", e.target.value)}
				placeholder={t("qwenCodeProvider.oauthCredentialsPathPlaceholder", "settings")}
				style={{ width: "100%" }}
				value={apiConfiguration?.qwenCodeOauthPath || ""}>
				{t("qwenCodeProvider.oauthCredentialsPathLabel", "settings")}
			</VSCodeTextField>
			<div style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", marginTop: "4px" }}>
				{t("qwenCodeProvider.oauthCredentialsPathDescription", "settings")}
			</div>

			<div style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", marginTop: "12px" }}>
				{t("qwenCodeProvider.oauthAuthenticationDescription", "settings")}
			</div>

			<div style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", marginTop: "8px" }}>
				{t("qwenCodeProvider.getStartedTitle", "settings")}
				<br />
				1. {t("qwenCodeProvider.installClientStep", "settings")}
				<br />
				2. {t("qwenCodeProvider.authenticateStep", "settings")}
				<br />
				3. {t("qwenCodeProvider.credentialsStoredStep", "settings")}
			</div>

			<VSCodeLink
				href="https://github.com/QwenLM/qwen-code/blob/main/README.md"
				style={{
					color: "var(--vscode-textLink-foreground)",
					marginTop: "8px",
					display: "inline-block",
					fontSize: "12px",
				}}>
				{t("qwenCodeProvider.setupInstructionsLinkText", "settings")}
			</VSCodeLink>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={qwenCodeModels}
						onChange={(modelId) => {
							const fieldName = currentMode === "plan" ? "planModeApiModelId" : "actModeApiModelId"
							handleFieldChange(fieldName, modelId)
						}}
						selectedModelId={selectedModelId}
					/>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
