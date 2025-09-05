import { StringRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { useCallback, useEffect, useState } from "react"
import { useInterval } from "react-use"
import { t } from "@/caret/utils/i18n"
import UseCustomPromptCheckbox from "@/components/settings/UseCustomPromptCheckbox"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { ApiKeyField } from "../common/ApiKeyField"
import { BaseUrlField } from "../common/BaseUrlField"
import { DebouncedTextField } from "../common/DebouncedTextField"
import OllamaModelPicker from "../OllamaModelPicker"
import { getModeSpecificFields } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the OllamaProvider component
 */
interface OllamaProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Ollama provider configuration component
 */
export const OllamaProvider = ({ showModelOptions, isPopup, currentMode }: OllamaProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { ollamaModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	const [ollamaModels, setOllamaModels] = useState<string[]>([])

	// Poll ollama models
	const requestOllamaModels = useCallback(async () => {
		try {
			const response = await ModelsServiceClient.getOllamaModels(
				StringRequest.create({
					value: apiConfiguration?.ollamaBaseUrl || "",
				}),
			)
			if (response && response.values) {
				setOllamaModels(response.values)
			}
		} catch (error) {
			console.error(t("ollamaProvider.fetchModelsErrorLog", "settings"), error)
			setOllamaModels([])
		}
	}, [apiConfiguration?.ollamaBaseUrl])

	useEffect(() => {
		requestOllamaModels()
	}, [requestOllamaModels])

	useInterval(requestOllamaModels, 2000)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.ollama.description", "settings")}
			</p>
			<BaseUrlField
				initialValue={apiConfiguration?.ollamaBaseUrl}
				label={t("ollamaProvider.baseUrlLabel", "settings")}
				onChange={(value) => handleFieldChange("ollamaBaseUrl", value)}
				placeholder={t("ollamaProvider.baseUrlPlaceholder", "settings")}
			/>

			{apiConfiguration?.ollamaBaseUrl && (
				<ApiKeyField
					helpText={t("ollamaProvider.apiKeyHelpText", "settings")}
					initialValue={apiConfiguration?.ollamaApiKey || ""}
					onChange={(value) => handleFieldChange("ollamaApiKey", value)}
					placeholder={t("ollamaProvider.apiKeyPlaceholder", "settings")}
					providerName={t("ollamaProvider.providerName", "settings")}
				/>
			)}

			{/* Model selection - use filterable picker */}
			<label htmlFor="ollama-model-selection">
				<span className="font-semibold">{t("ollamaProvider.modelLabel", "settings")}</span>
			</label>
			<OllamaModelPicker
				ollamaModels={ollamaModels}
				onModelChange={(modelId) => {
					handleModeFieldChange({ plan: "planModeOllamaModelId", act: "actModeOllamaModelId" }, modelId, currentMode)
				}}
				placeholder={
					ollamaModels.length > 0
						? t("ollamaProvider.modelPickerPlaceholder.search", "settings")
						: t("ollamaProvider.modelPickerPlaceholder.example", "settings")
				}
				selectedModelId={ollamaModelId || ""}
			/>

			{/* Show status message based on model availability */}
			{ollamaModels.length === 0 && (
				<p className="text-sm mt-1 text-description italic">{t("ollamaProvider.fetchModelsError", "settings")}</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.ollamaApiOptionsCtxNum || "32768"}
				onChange={(v) => handleFieldChange("ollamaApiOptionsCtxNum", v || undefined)}
				placeholder={t("ollamaProvider.contextWindowPlaceholder", "settings")}
				style={{ width: "100%" }}>
				<span className="font-semibold">{t("ollamaProvider.modelContextWindowLabel", "settings")}</span>
			</DebouncedTextField>

			{showModelOptions && (
				<>
					<DebouncedTextField
						initialValue={apiConfiguration?.requestTimeoutMs ? apiConfiguration.requestTimeoutMs.toString() : "30000"}
						onChange={(value) => {
							// Convert to number, with validation
							const numValue = parseInt(value, 10)
							if (!Number.isNaN(numValue) && numValue > 0) {
								handleFieldChange("requestTimeoutMs", numValue)
							}
						}}
						placeholder={t("ollamaProvider.requestTimeoutPlaceholder", "settings")}
						style={{ width: "100%" }}>
						<span className="font-semibold">{t("ollamaProvider.requestTimeoutLabel", "settings")}</span>
					</DebouncedTextField>
					<p className="text-xs mt-0 text-description">{t("ollamaProvider.requestTimeoutDescription", "settings")}</p>
				</>
			)}

			<UseCustomPromptCheckbox providerId="ollama" />
		</div>
	)
}
