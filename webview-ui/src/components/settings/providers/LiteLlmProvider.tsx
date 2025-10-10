import { liteLlmModelInfoSaneDefaults } from "@shared/api"
import * as proto from "@shared/proto"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretSystemServiceClient } from "@/services/grpc-client"
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

	// CARET MODIFICATION: Local state for model fetching
	const [liteLlmModels, setLiteLlmModels] = useState<string[]>([])
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const [modelsError, setModelsError] = useState<string | null>(null)

	// CARET MODIFICATION: Function to fetch models from LiteLLM
	const handleFetchModels = async () => {
		if (!apiConfiguration?.liteLlmBaseUrl) {
			setModelsError(t("providers.litellm.baseUrlRequired", "settings"))
			return
		}

		setIsLoadingModels(true)
		setModelsError(null)

		try {
			const request = proto.caret.FetchLiteLlmModelsRequest.create({
				baseUrl: apiConfiguration.liteLlmBaseUrl,
				apiKey: apiConfiguration.liteLlmApiKey || "",
			})

			const response = await CaretSystemServiceClient.FetchLiteLlmModels(request)

			if (response.success) {
				setLiteLlmModels(response.models || [])
				if (response.models.length === 0) {
					setModelsError(t("providers.litellm.noModelsFound", "settings"))
				}
			} else {
				setModelsError(response.errorMessage || t("providers.litellm.fetchError", "settings"))
				setLiteLlmModels([])
			}
		} catch (error) {
			setModelsError(error instanceof Error ? error.message : t("providers.litellm.fetchError", "settings"))
			setLiteLlmModels([])
		} finally {
			setIsLoadingModels(false)
		}
	}

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmBaseUrl || ""}
				onChange={(value) => handleFieldChange("liteLlmBaseUrl", value)}
				placeholder={t("providers.litellm.baseUrlPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="url">
				<span style={{ fontWeight: 500 }}>{t("baseUrlField.label", "settings")}</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmApiKey || ""}
				onChange={(value) => handleFieldChange("liteLlmApiKey", value)}
				placeholder={t("providers.litellm.apiKeyPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="password">
				<span style={{ fontWeight: 500 }}>{t("providers.litellm.apiKeyLabel", "settings")}</span>
			</DebouncedTextField>
			{/* CARET MODIFICATION: Replace text field with dropdown and fetch button */}
			<div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
				<div style={{ flex: 1 }}>
					<span style={{ fontWeight: 500, display: "block", marginBottom: "5px" }}>
						{t("providers.litellm.modelIdLabel", "settings")}
					</span>
					{liteLlmModels.length > 0 ? (
						<VSCodeDropdown
							onChange={(e: any) => {
								const value = e.target.value
								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelId", act: "actModeLiteLlmModelId" },
									value,
									currentMode,
								)
							}}
							style={{ width: "100%" }}
							value={liteLlmModelId || ""}>
							<VSCodeOption value="">{t("providers.litellm.selectModelPlaceholder", "settings")}</VSCodeOption>
							{liteLlmModels.map((model) => (
								<VSCodeOption key={model} value={model}>
									{model}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					) : (
						<DebouncedTextField
							initialValue={liteLlmModelId || ""}
							onChange={(value) =>
								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelId", act: "actModeLiteLlmModelId" },
									value,
									currentMode,
								)
							}
							placeholder={t("providers.litellm.modelIdPlaceholder", "settings")}
							style={{ width: "100%" }}
						/>
					)}
				</div>
				<VSCodeButton
					disabled={isLoadingModels || !apiConfiguration?.liteLlmBaseUrl}
					onClick={handleFetchModels}
					style={{ minWidth: "120px" }}>
					{isLoadingModels
						? t("providers.litellm.fetchingModels", "settings")
						: t("providers.litellm.fetchModels", "settings")}
				</VSCodeButton>
			</div>
			{modelsError && (
				<p style={{ color: "var(--vscode-errorForeground)", fontSize: "12px", marginTop: "5px" }}>{modelsError}</p>
			)}

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
							{t("providers.litellm.usePromptCachingLabel", "settings")}
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-charts-green)" }}>
							{t("providers.litellm.usePromptCachingDescription", "settings")}
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
				{t("providers.litellm.extendedThinkingDescription1", "settings")}{" "}
				<VSCodeLink
					href="https://docs.litellm.ai/docs/reasoning_content"
					style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.litellm.extendedThinkingLink", "settings")}
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
					{t("providers.litellm.modelConfigurationLabel", "settings")}
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
						{t("providers.litellm.supportsImagesLabel", "settings")}
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
							<span style={{ fontWeight: 500 }}>{t("providers.litellm.contextWindowSizeLabel", "settings")}</span>
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
							<span style={{ fontWeight: 500 }}>{t("providers.litellm.maxOutputTokensLabel", "settings")}</span>
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
							<span style={{ fontWeight: 500 }}>{t("providers.litellm.temperatureLabel", "settings")}</span>
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
				{t("providers.litellm.description1", "settings")}{" "}
				<VSCodeLink href="https://docs.litellm.ai/docs/" style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.litellm.quickstartGuideLink", "settings")}
				</VSCodeLink>{" "}
				{t("providers.litellm.description2", "settings")}
			</p>

			{showModelOptions && (
				<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
			)}
		</div>
	)
}
