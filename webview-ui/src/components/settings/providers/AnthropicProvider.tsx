import { anthropicModels, CLAUDE_SONNET_4_1M_SUFFIX } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useMemo } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { BaseUrlField } from "../common/BaseUrlField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

// Anthropic models that support thinking/reasoning mode
export const SUPPORTED_ANTHROPIC_THINKING_MODELS = [
	"claude-3-7-sonnet-20250219",
	"claude-sonnet-4-20250514",
	`claude-sonnet-4-20250514${CLAUDE_SONNET_4_1M_SUFFIX}`,
	"claude-opus-4-20250514",
	"claude-opus-4-1-20250805",
]

/**
 * Props for the AnthropicProvider component
 */
interface AnthropicProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Anthropic provider configuration component
 */
export const AnthropicProvider = ({ showModelOptions, isPopup, currentMode }: AnthropicProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Check if the current model is Claude Sonnet 4 and determine the alternate variant
	const claudeSonnet4Variant = useMemo(() => {
		const SONNET_4_MODEL_ID = "claude-sonnet-4-20250514"
		if (selectedModelId === SONNET_4_MODEL_ID) {
			return {
				current: SONNET_4_MODEL_ID,
				alternate: `${SONNET_4_MODEL_ID}${CLAUDE_SONNET_4_1M_SUFFIX}`,
				linkText: t("providers.anthropic.switchTo1MContext", "settings"),
			}
		} else if (selectedModelId === `${SONNET_4_MODEL_ID}${CLAUDE_SONNET_4_1M_SUFFIX}`) {
			return {
				current: `${SONNET_4_MODEL_ID}${CLAUDE_SONNET_4_1M_SUFFIX}`,
				alternate: SONNET_4_MODEL_ID,
				linkText: t("providers.anthropic.switchTo200KContext", "settings"),
			}
		}
		return null
	}, [selectedModelId])

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.anthropic.description", "settings")}
			</p>
			<ApiKeyField
				initialValue={apiConfiguration?.apiKey || ""}
				onChange={(value) => handleFieldChange("apiKey", value)}
				providerName="Anthropic"
				signupUrl="https://console.anthropic.com/settings/keys"
			/>

			<BaseUrlField
				initialValue={apiConfiguration?.anthropicBaseUrl}
				label={t("baseUrlField.label", "settings")}
				onChange={(value) => handleFieldChange("anthropicBaseUrl", value)}
				placeholder={t("baseUrlField.placeholderAnthropic", "settings")}
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("modelSelector.label", "settings")}
						models={anthropicModels}
						onChange={(e) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					{claudeSonnet4Variant && (
						<div style={{ marginBottom: 2 }}>
							<VSCodeLink
								onClick={() =>
									handleModeFieldChange(
										{ plan: "planModeApiModelId", act: "actModeApiModelId" },
										claudeSonnet4Variant.alternate,
										currentMode,
									)
								}
								style={{
									display: "inline",
									fontSize: "10.5px",
									color: "var(--vscode-textLink-foreground)",
								}}>
								{claudeSonnet4Variant.linkText}
							</VSCodeLink>
						</div>
					)}

					{SUPPORTED_ANTHROPIC_THINKING_MODELS.includes(selectedModelId) && (
						<ThinkingBudgetSlider currentMode={currentMode} maxBudget={selectedModelInfo.thinkingConfig?.maxBudget} />
					)}

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
