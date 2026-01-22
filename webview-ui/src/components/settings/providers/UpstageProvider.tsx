// CARETI MODIFICATION: Upstage Solar provider settings UI.
import { upstageModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CARET_URLS } from "@/careti/constants/urls"
import { t } from "@/careti/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the UpstageProvider component
 */
interface UpstageProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Upstage provider configuration component
 */
export const UpstageProvider = ({ showModelOptions, isPopup, currentMode }: UpstageProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldsChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.upstage.descriptionPart1", "settings")}
				<VSCodeLink href={CARET_URLS.UPSTAGE_CORP} style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.upstage.upstageLinkText", "settings")}
				</VSCodeLink>
				{t("providers.upstage.descriptionPart2", "settings")}
				<VSCodeLink href={CARET_URLS.UPSTAGE_API_DOCS} style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.upstage.solarLinkText", "settings")}
				</VSCodeLink>
				{t("providers.upstage.descriptionPart3", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.upstageApiKey || ""}
				onChange={(value) => handleFieldChange("upstageApiKey", value)}
				providerName={t("providers.upstage.name", "settings")}
				signupUrl="https://console.upstage.ai/"
			/>
			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={upstageModels}
						onChange={(e: any) => {
							const modelId = e.target.value
							const modelInfo = upstageModels[modelId as keyof typeof upstageModels]
							handleModeFieldsChange(
								{
									upstageModelId: { plan: "planModeUpstageModelId", act: "actModeUpstageModelId" },
									upstageModelInfo: { plan: "planModeUpstageModelInfo", act: "actModeUpstageModelInfo" },
								},
								{ upstageModelId: modelId, upstageModelInfo: modelInfo },
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
