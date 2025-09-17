import { openAiNativeModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the OpenAINativeProvider component
 */
interface OpenAINativeProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The OpenAI (native) provider configuration component
 */
export const OpenAINativeProvider = ({ showModelOptions, isPopup, currentMode }: OpenAINativeProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.openai-native.description", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.openAiNativeApiKey || ""}
				onChange={(value) => handleFieldChange("openAiNativeApiKey", value)}
				providerName={t("providers.openai-native.name", "settings")}
				signupUrl="https://platform.openai.com/api-keys"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={openAiNativeModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
