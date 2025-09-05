import { doubaoModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the DoubaoProvider component
 */
interface DoubaoProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The ByteDance Doubao provider configuration component
 */
export const DoubaoProvider = ({ showModelOptions, isPopup, currentMode }: DoubaoProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.doubao.description", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.doubaoApiKey || ""}
				onChange={(value) => handleFieldChange("doubaoApiKey", value)}
				providerName={t("providers.doubao.name", "settings")}
				signupUrl="https://console.volcengine.com/home"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("doubaoProvider.modelLabel", "settings")}
						models={doubaoModels}
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
