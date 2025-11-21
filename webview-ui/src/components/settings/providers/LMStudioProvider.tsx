import type { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useInterval } from "react-use"
import { t } from "@/caret/utils/i18n"
import UseCustomPromptCheckbox from "@/components/settings/UseCustomPromptCheckbox"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { BaseUrlField } from "../common/BaseUrlField"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { DropdownContainer } from "../common/ModelSelector"
import { getModeSpecificFields } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the LMStudioProvider component
 */
interface LMStudioProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

interface LMStudioApiModel {
	id: string
	object?: "model"
	type?: string
	publisher?: string
	arch?: string
	compatibility_type?: string
	quantization?: string
	state?: string
	max_context_length?: number
	loaded_context_length?: number
}

/**
 * The LM Studio provider configuration component
 */
export const LMStudioProvider = ({ currentMode }: LMStudioProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { lmStudioModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	const [lmStudioModels, setLmStudioModels] = useState<LMStudioApiModel[]>([])

	const currentLMStudioModel = useMemo(
		() => lmStudioModels.find((model) => model.id === lmStudioModelId),
		[lmStudioModels, lmStudioModelId],
	)
	const endpoint = useMemo(
		() => apiConfiguration?.lmStudioBaseUrl || "http://localhost:1234",
		[apiConfiguration?.lmStudioBaseUrl],
	)

	// Poll LM Studio models
	const requestLmStudioModels = useCallback(async () => {
		await ModelsServiceClient.getLmStudioModels({
			value: endpoint,
		})
			.then((response) => {
				if (response?.values) {
					const models = response.values.map((v) => JSON.parse(v) as LMStudioApiModel)
					setLmStudioModels(models)
				}
			})
			.catch((error) => {
				console.error(t("providers.lmstudio.parseModelsError", "settings"), error)
			})
	}, [endpoint])

	useEffect(() => {
		requestLmStudioModels()
	}, [])

	const lmStudioMaxTokens = currentLMStudioModel?.max_context_length?.toString()
	const currentLoadedContext = currentLMStudioModel?.loaded_context_length?.toString()

	useEffect(() => {
		const curr = currentLMStudioModel?.loaded_context_length?.toString()
		const max = currentLMStudioModel?.max_context_length?.toString()
		const choice = apiConfiguration?.lmStudioMaxTokens ?? max
		if (curr && curr !== choice) {
			handleFieldChange("lmStudioMaxTokens", curr)
		}
	}, [
		currentLMStudioModel?.loaded_context_length,
		currentLMStudioModel?.max_context_length,
		apiConfiguration?.lmStudioMaxTokens,
		handleFieldChange,
	])

	useInterval(requestLmStudioModels, 6000)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.lmstudio.description", "settings")}
			</p>
			<BaseUrlField
				initialValue={apiConfiguration?.lmStudioBaseUrl}
				label={t("baseUrlField.label", "settings")}
				onChange={(value) => handleFieldChange("lmStudioBaseUrl", value)}
				placeholder={t("providers.lmstudio.baseUrlPlaceholder", "settings")}
			/>

			<div className="font-semibold">{t("modelSelector.label", "settings")}</div>
			{lmStudioModels.length > 0 ? (
				<DropdownContainer className="dropdown-container" zIndex={10}>
					<VSCodeDropdown
						className="w-full mb-3"
						onChange={(e: any) => {
							const value = e?.target?.value
							handleModeFieldChange(
								{
									plan: "planModeLmStudioModelId",
									act: "actModeLmStudioModelId",
								},
								value,
								currentMode,
							)
						}}
						value={lmStudioModelId}>
						{lmStudioModels.map((model) => (
							<VSCodeOption className="w-full" key={model.id} value={model.id}>
								{model.id}
							</VSCodeOption>
						))}
					</VSCodeDropdown>
				</DropdownContainer>
			) : (
				<DebouncedTextField
					initialValue={lmStudioModelId || ""}
					onChange={(value) =>
						handleModeFieldChange(
							{
								plan: "planModeLmStudioModelId",
								act: "actModeLmStudioModelId",
							},
							value,
							currentMode,
						)
					}
					placeholder={t("providers.lmstudio.modelPlaceholder", "settings")}
					style={{ width: "100%" }}
				/>
			)}

			<div className="font-semibold">{t("modelInfoView.contextWindowLabel", "settings")}</div>
			<VSCodeTextField
				className="w-full pointer-events-none"
				disabled={true}
				title={t("providers.lmstudio.contextWindowTooltip", "settings")}
				value={String(currentLoadedContext ?? lmStudioMaxTokens ?? "0")}
			/>

			<UseCustomPromptCheckbox providerId="lmstudio" />
		</div>
	)
}
