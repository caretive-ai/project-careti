import { Mode } from "@shared/storage/types"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { HuggingFaceModelPicker } from "../HuggingFaceModelPicker"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the HuggingFaceProvider component
 */
interface HuggingFaceProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Hugging Face provider configuration component
 */
export const HuggingFaceProvider = ({ showModelOptions, isPopup, currentMode }: HuggingFaceProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.huggingface.description", "settings")}
			</p>
			<div>
				<DebouncedTextField
					initialValue={apiConfiguration?.huggingFaceApiKey || ""}
					onChange={(value) => handleFieldChange("huggingFaceApiKey", value)}
					placeholder={t("huggingFaceProvider.apiKeyPlaceholder", "settings")}
					style={{ width: "100%" }}
					type="password">
					<span style={{ fontWeight: 500 }}>{t("huggingFaceProvider.apiKeyLabel", "settings")}</span>
				</DebouncedTextField>
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					{t("huggingFaceProvider.apiKeyHelpText", "settings")}{" "}
					<VSCodeLink href="https://huggingface.co/settings/tokens">
						{t("huggingFaceProvider.getApiKeyLinkText", "settings")}
					</VSCodeLink>
				</p>
			</div>

			{showModelOptions && <HuggingFaceModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
