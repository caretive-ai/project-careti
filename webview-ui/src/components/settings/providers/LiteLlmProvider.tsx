import { liteLlmModelInfoSaneDefaults } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the LiteLlmProvider component
 */
interface LiteLlmProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The LiteLLM provider configuration component
 */
export const LiteLlmProvider = ({ showModelOptions, isPopup, currentMode }: LiteLlmProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Get mode-specific fields
	const { liteLlmModelId, liteLlmModelInfo } = getModeSpecificFields(apiConfiguration, currentMode)

	// Local state for collapsible model configuration section
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmBaseUrl || ""}
				onChange={(value) => handleFieldChange("liteLlmBaseUrl", value)}
				placeholder={t("liteLlmProvider.baseUrlPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="url">
				<span style={{ fontWeight: 500 }}>{t("baseUrlField.label", "settings")}</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmApiKey || ""}
				onChange={(value) => handleFieldChange("liteLlmApiKey", value)}
				placeholder={t("liteLlmProvider.apiKeyPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="password">
				<span style={{ fontWeight: 500 }}>{t("settings.apiKeyField.label", "settings")}</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={liteLlmModelId || ""}
				onChange={(value) =>
					handleModeFieldChange({ plan: "planModeLiteLlmModelId", act: "actModeLiteLlmModelId" }, value, currentMode)
				}
				placeholder={t("liteLlmProvider.modelIdPlaceholder", "settings")}
				style={{ width: "100%" }}>
				<span style={{ fontWeight: 500 }}>{t("settings.modelIdField.label", "settings")}</span>
			</DebouncedTextField>

			<div style={{ display: "flex", flexDirection: "column", marginTop: 10, marginBottom: 10 }}>
				{selectedModelInfo.supportsPromptCache && (
					<>
						<VSCodeCheckbox
							checked={apiConfiguration?.liteLlmUsePromptCache || false}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true

								handleFieldChange("liteLlmUsePromptCache", isChecked)
							}}
							style={{ fontWeight: 500, color: "var(--vscode-charts-green)" }}>
							{t("liteLlmProvider.usePromptCachingLabel", "settings")}
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-charts-green)" }}>
							{t("liteLlmProvider.usePromptCachingDescription", "settings")}
						</p>
					</>
				)}
			</div>

			<ThinkingBudgetSlider currentMode={currentMode} />
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("liteLlmProvider.extendedThinkingDescription1", "settings")}{" "}
				<VSCodeLink
					href="https://docs.litellm.ai/docs/reasoning_content"
					style={{ display: "inline", fontSize: "inherit" }}>
					{t("liteLlmProvider.extendedThinkingLink", "settings")}
				</VSCodeLink>
			</p>

			<div
				onClick={() => setModelConfigurationSelected((val) => !val)}
				style={{
					color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
					display: "flex",
					margin: "10px 0",
					cursor: "pointer",
					alignItems: "center",
				}}>
				<span
					className={`codicon ${modelConfigurationSelected ? "codicon-chevron-down" : "codicon-chevron-right"}`}
					style={{
						marginRight: "4px",
					}}></span>
				<span
					style={{
						fontWeight: 700,
						textTransform: "uppercase",
					}}>
					{t("liteLlmProvider.modelConfigurationLabel", "settings")}
				</span>
			</div>
			{modelConfigurationSelected && (
				<>
					<VSCodeCheckbox
						checked={!!liteLlmModelInfo?.supportsImages}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }
							modelInfo.supportsImages = isChecked

							handleModeFieldChange(
								{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
								modelInfo,
								currentMode,
							)
						}}>
						{t("settings.modelInfoView.supportsImagesLabel", "settings")}
					</VSCodeCheckbox>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								liteLlmModelInfo?.contextWindow
									? liteLlmModelInfo.contextWindow.toString()
									: (liteLlmModelInfoSaneDefaults.contextWindow?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }
								modelInfo.contextWindow = Number(value)

								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("settings.modelInfoView.contextWindowLabel", "settings")}</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={
								liteLlmModelInfo?.maxTokens
									? liteLlmModelInfo.maxTokens.toString()
									: (liteLlmModelInfoSaneDefaults.maxTokens?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }
								modelInfo.maxTokens = Number(value)

								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>
								{t("settings.modelInfoView.maxOutputTokensLabel", "settings")}
							</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								liteLlmModelInfo?.temperature !== undefined
									? liteLlmModelInfo.temperature.toString()
									: (liteLlmModelInfoSaneDefaults.temperature?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }

								// Check if the input ends with a decimal point or has trailing zeros after decimal
								const _shouldPreserveFormat = value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

								modelInfo.temperature =
									value === "" ? liteLlmModelInfoSaneDefaults.temperature : parseFloat(value)

								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
									modelInfo,
									currentMode,
								)
							}}>
							<span style={{ fontWeight: 500 }}>{t("settings.modelInfoView.temperatureLabel", "settings")}</span>
						</DebouncedTextField>
					</div>
				</>
			)}
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("liteLlmProvider.description1", "settings")}{" "}
				<VSCodeLink href="https://docs.litellm.ai/docs/" style={{ display: "inline", fontSize: "inherit" }}>
					{t("liteLlmProvider.quickstartGuideLink", "settings")}
				</VSCodeLink>{" "}
				{t("liteLlmProvider.description2", "settings")}
			</p>

			{showModelOptions && (
				<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
			)}
		</div>
	)
}
