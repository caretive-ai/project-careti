import { sambanovaModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the SambanovaProvider component
 */
interface SambanovaProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The SambaNova provider configuration component
 */
export const SambanovaProvider = ({ showModelOptions, isPopup, currentMode }: SambanovaProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ whiteSpace: "pre-wrap" }}>{t("providers.sambanova.description", "settings")}</p>
			<ApiKeyField
				initialValue={apiConfiguration?.sambanovaApiKey || ""}
				onChange={(value) => handleFieldChange("sambanovaApiKey", value)}
				providerName={t("providers.sambanova.name", "settings")}
				signupUrl="https://docs.sambanova.ai/cloud/docs/get-started/overview"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={sambanovaModels}
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
