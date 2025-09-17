import { moonshotModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer, ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the MoonshotProvider component
 */
interface MoonshotProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Moonshot AI Studio provider configuration component
 */
export const MoonshotProvider = ({ showModelOptions, isPopup, currentMode }: MoonshotProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.moonshot.description", "settings")}
			</p>
			<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
				<label htmlFor="moonshot-entrypoint">
					<span style={{ fontWeight: 500, marginTop: 5 }}>{t("moonshotProvider.entrypoint", "settings")}</span>
				</label>
				<VSCodeDropdown
					id="moonshot-entrypoint"
					onChange={(e) => handleFieldChange("moonshotApiLine", (e.target as any).value)}
					style={{
						minWidth: 130,
						position: "relative",
					}}
					value={apiConfiguration?.moonshotApiLine || "international"}>
					<VSCodeOption value="international">api.moonshot.ai</VSCodeOption>
					<VSCodeOption value="china">api.moonshot.cn</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>
			<ApiKeyField
				helpText={t("apiKeyField.defaultHelpText", "settings")}
				initialValue={apiConfiguration?.moonshotApiKey || ""}
				onChange={(value) => handleFieldChange("moonshotApiKey", value)}
				providerName={t("providers.moonshot.name", "settings")}
				signupUrl={
					apiConfiguration?.moonshotApiLine === "china"
						? "https://platform.moonshot.cn/console/api-keys"
						: "https://platform.moonshot.ai/console/api-keys"
				}
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={moonshotModels}
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
