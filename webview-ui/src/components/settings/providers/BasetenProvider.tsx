import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import BasetenModelPicker from "../BasetenModelPicker"
import { ApiKeyField } from "../common/ApiKeyField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the BasetenProvider component
 */
interface BasetenProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Baseten provider configuration component
 */
export const BasetenProvider = ({ showModelOptions, isPopup, currentMode }: BasetenProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.baseten.description", "settings")}
			</p>
			<ApiKeyField
				helpText={t("providers.baseten.apiKeyHelp", "settings", { providerName: "Baseten" })}
				initialValue={apiConfiguration?.basetenApiKey || ""}
				onChange={(value) => handleFieldChange("basetenApiKey", value)}
				providerName={t("providers.baseten.name", "settings")}
				signupUrl="https://app.baseten.co/settings/api_keys"
			/>

			{showModelOptions && <BasetenModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
