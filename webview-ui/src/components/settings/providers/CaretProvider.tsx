// CARET MODIFICATION: Renamed from ClineProvider and updated to use Caret-specific settings and i18n.
import { t } from "@/caret/utils/i18n"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { Mode } from "@shared/storage/types"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useDebouncedInput } from "../utils/useDebouncedInput"
import { useResponsive } from "@/hooks/useResponsive"
import { geminiModels } from "@shared/api"

interface CaretProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const CaretProvider = ({ showModelOptions, isPopup, currentMode }: CaretProviderProps) => {
	// Using Caret's i18n utility
	const { isSmallScreen } = useResponsive()
	const { apiConfiguration } = useExtensionState()
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const { handleModelChange, handleModeFieldChange } = useApiConfigurationHandlers()
	const [apiKey, setApiKey] = useDebouncedInput(
		apiConfiguration?.caretApiKey || "",
		(value) => handleModeFieldChange({ plan: "caretApiKey", act: "caretApiKey" }, value, currentMode),
		500,
	)
	return (
		<>
			<div
				style={{
					display: "flex",
					flexDirection: isSmallScreen ? "column" : "row",
					gap: 10,
					alignItems: "center",
				}}>
				<div style={{ flex: 1, width: "100%" }}>
					<label htmlFor="caret-api-key">{t("settings.apiOptions.caret.apiKeyLabel", "settings")}</label>
					<VSCodeTextField
						id="caret-api-key"
						type="password"
						style={{ width: "100%" }}
						value={apiKey}
						onInput={(e: any) => setApiKey(e.target.value)}
					/>
				</div>
			</div>
			{showModelOptions && (
				<>
					<ModelSelector
						models={geminiModels}
						selectedModelId={selectedModelId}
						onChange={(e: any) => {
							const modelId = e.target.value
							handleModelChange({ plan: "planModeApiModelId", act: "actModeApiModelId" }, modelId, currentMode)
						}}
					/>
					{selectedModelId && selectedModelInfo && (
						<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
					)}
				</>
			)}
		</>
	)
}
