// CARET MODIFICATION: Naver Cloud provider settings UI.
import { naverCloudModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the NaverCloudProvider component
 */
interface NaverCloudProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Naver Cloud provider configuration component
 */
export const NaverCloudProvider = ({ showModelOptions, isPopup, currentMode }: NaverCloudProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldsChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.naver-cloud.description", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.naverCloudApiKey || ""}
				onChange={(value) => handleFieldChange("naverCloudApiKey", value)}
				providerName={t("providers.naver-cloud.name", "settings")}
				signupUrl="https://guide.ncloud-docs.com/docs/clovastudio-model"
			/>
			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={naverCloudModels}
						onChange={(e: any) => {
							const modelId = e.target.value
							const modelInfo = naverCloudModels[modelId as keyof typeof naverCloudModels]
							handleModeFieldsChange(
								{
									naverCloudModelId: { plan: "planModeNaverCloudModelId", act: "actModeNaverCloudModelId" },
									naverCloudModelInfo: { plan: "planModeNaverCloudModelInfo", act: "actModeNaverCloudModelInfo" },
								},
								{ naverCloudModelId: modelId, naverCloudModelInfo: modelInfo },
								currentMode,
							)
						}}
						selectedModelId={selectedModelId}
					/>
					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
