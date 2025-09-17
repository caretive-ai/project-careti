import { internationalZAiModels, mainlandZAiModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useMemo } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer, ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the ZAiProvider component
 */
interface ZAiProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Z AI provider configuration component
 */
export const ZAiProvider = ({ showModelOptions, isPopup, currentMode }: ZAiProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Determine which models to use based on API line selection
	const zaiModels = useMemo(
		() => (apiConfiguration?.zaiApiLine === "china" ? mainlandZAiModels : internationalZAiModels),
		[apiConfiguration?.zaiApiLine],
	)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ whiteSpace: "pre-wrap" }}>{t("providers.zai.description", "settings")}</p>
			<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
				<label htmlFor="zai-entrypoint">
					<span style={{ fontWeight: 500, marginTop: 5 }}>{t("zaiProvider.entrypointLabel", "settings")}</span>
				</label>
				<VSCodeDropdown
					id="zai-entrypoint"
					onChange={(e) => handleFieldChange("zaiApiLine", (e.target as any).value)}
					style={{
						minWidth: 130,
						position: "relative",
					}}
					value={apiConfiguration?.zaiApiLine || "international"}>
					<VSCodeOption value="international">api.z.ai</VSCodeOption>
					<VSCodeOption value="china">open.bigmodel.cn</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("zaiProvider.entrypointDescription", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.zaiApiKey || ""}
				onChange={(value) => handleFieldChange("zaiApiKey", value)}
				providerName={t("zaiProvider.providerName", "settings")}
				signupUrl={
					apiConfiguration?.zaiApiLine === "china"
						? "https://open.bigmodel.cn/console/overview"
						: "https://z.ai/manage-apikey/apikey-list"
				}
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={zaiModels}
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
