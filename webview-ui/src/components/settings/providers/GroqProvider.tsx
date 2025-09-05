import { Mode } from "@shared/storage/types"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import GroqModelPicker from "../GroqModelPicker"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the GroqProvider component
 */
interface GroqProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Groq provider configuration component
 */
export const GroqProvider = ({ showModelOptions, isPopup, currentMode }: GroqProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.groq.description", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.groqApiKey || ""}
				onChange={(value) => handleFieldChange("groqApiKey", value)}
				providerName={t("providers.groq.name", "settings")}
				signupUrl="https://console.groq.com/keys"
			/>

			{showModelOptions && <GroqModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
