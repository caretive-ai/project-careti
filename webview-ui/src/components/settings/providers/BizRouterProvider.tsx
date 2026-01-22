import { bizRouterModelInfoSaneDefaults } from "@shared/api"
import * as proto from "@shared/proto"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { CARET_URLS } from "@/careti/constants/urls"
import { t } from "@/careti/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretSystemServiceClient } from "@/services/grpc-client"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the BizRouterProvider component
 */
interface BizRouterProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The BizRouter provider configuration component
 */
export const BizRouterProvider = ({ showModelOptions, isPopup, currentMode }: BizRouterProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Get mode-specific fields
	const { bizRouterModelId, bizRouterModelInfo } = getModeSpecificFields(apiConfiguration, currentMode)

	// Local state for collapsible model configuration section
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)

	// Local state for model fetching
	const [bizRouterModels, setBizRouterModels] = useState<string[]>([])
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const [modelsError, setModelsError] = useState<string | null>(null)

	// Function to fetch models from BizRouter
	const handleFetchModels = async () => {
		if (!apiConfiguration?.bizRouterApiKey) {
			setModelsError(t("providers.bizrouter.apiKeyRequired", "settings"))
			return
		}

		setIsLoadingModels(true)
		setModelsError(null)

		try {
			const request = proto.careti.FetchBizRouterModelsRequest.create({
				apiKey: apiConfiguration.bizRouterApiKey,
			})

			const response = await CaretSystemServiceClient.FetchBizRouterModels(request)

			if (response.success) {
				setBizRouterModels(response.models || [])
				if (response.models.length === 0) {
					setModelsError(t("providers.bizrouter.noModelsFound", "settings"))
				}
			} else {
				setModelsError(response.errorMessage || t("providers.bizrouter.fetchError", "settings"))
				setBizRouterModels([])
			}
		} catch (error) {
			setModelsError(error instanceof Error ? error.message : t("providers.bizrouter.fetchError", "settings"))
			setBizRouterModels([])
		} finally {
			setIsLoadingModels(false)
		}
	}

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.bizRouterApiKey || ""}
				onChange={(value) => handleFieldChange("bizRouterApiKey", value)}
				placeholder={t("providers.bizrouter.apiKeyPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="password">
				<span style={{ fontWeight: 500 }}>{t("providers.bizrouter.apiKeyLabel", "settings")}</span>
			</DebouncedTextField>
			{/* Replace text field with dropdown and fetch button */}
			<div>
				<div style={{ display: "flex", gap: "10px", alignItems: "flex-end", flexWrap: "wrap" }}>
					<div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
						<span style={{ fontWeight: 500, display: "block", marginBottom: "5px" }}>
							{t("providers.bizrouter.modelIdLabel", "settings")}
						</span>
						{bizRouterModels.length > 0 ? (
							<div className="dropdown-container">
								<VSCodeDropdown
									onChange={(e: any) => {
										const value = e.target.value
										handleModeFieldChange(
											{ plan: "planModeBizRouterModelId", act: "actModeBizRouterModelId" },
											value,
											currentMode,
										)
									}}
									style={{ width: "100%" }}
									value={bizRouterModelId || ""}>
									<VSCodeOption value="">
										{t("providers.bizrouter.selectModelPlaceholder", "settings")}
									</VSCodeOption>
									{bizRouterModels.map((model) => (
										<VSCodeOption key={model} value={model}>
											{model}
										</VSCodeOption>
									))}
								</VSCodeDropdown>
								<style>{`
									.dropdown-container vscode-dropdown::part(listbox) {
										max-height: 130px !important;
										overflow-y: auto !important;
										position: absolute !important;
										z-index: 9999 !important;
										left: 0 !important;
										right: 0 !important;
									}
								`}</style>
							</div>
						) : (
							<DebouncedTextField
								initialValue={bizRouterModelId || ""}
								onChange={(value) =>
									handleModeFieldChange(
										{ plan: "planModeBizRouterModelId", act: "actModeBizRouterModelId" },
										value,
										currentMode,
									)
								}
								placeholder={t("providers.bizrouter.modelIdPlaceholder", "settings")}
								style={{ width: "100%" }}
							/>
						)}
					</div>
					<VSCodeButton
						disabled={isLoadingModels || !apiConfiguration?.bizRouterApiKey}
						onClick={handleFetchModels}
						style={{ minWidth: "120px", flexShrink: 0 }}>
						{isLoadingModels
							? t("providers.bizrouter.fetchingModels", "settings")
							: t("providers.bizrouter.fetchModels", "settings")}
					</VSCodeButton>
				</div>
				{modelsError && (
					<p style={{ color: "var(--vscode-errorForeground)", fontSize: "12px", marginTop: "5px" }}>{modelsError}</p>
				)}
			</div>

			<ThinkingBudgetSlider currentMode={currentMode} />
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("providers.bizrouter.extendedThinkingDescription1", "settings")}{" "}
				<VSCodeLink href={CARET_URLS.BIZROUTER_MODELS} style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.bizrouter.extendedThinkingLink", "settings")}
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
					{t("providers.bizrouter.modelConfigurationLabel", "settings")}
				</span>
			</div>
			{modelConfigurationSelected && (
				<>
					<VSCodeCheckbox
						checked={!!bizRouterModelInfo?.supportsImages}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
							modelInfo.supportsImages = isChecked

							handleModeFieldChange(
								{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
								modelInfo,
								currentMode,
							)
						}}>
						{t("providers.bizrouter.supportsImagesLabel", "settings")}
					</VSCodeCheckbox>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								bizRouterModelInfo?.contextWindow
									? bizRouterModelInfo.contextWindow.toString()
									: (bizRouterModelInfoSaneDefaults.contextWindow?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								modelInfo.contextWindow = Number(value)

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("providers.bizrouter.contextWindowSizeLabel", "settings")}</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={
								bizRouterModelInfo?.maxTokens
									? bizRouterModelInfo.maxTokens.toString()
									: (bizRouterModelInfoSaneDefaults.maxTokens?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								modelInfo.maxTokens = Number(value)

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("providers.bizrouter.maxOutputTokensLabel", "settings")}</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								bizRouterModelInfo?.temperature !== undefined ? bizRouterModelInfo.temperature.toString() : ""
							}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseFloat(value)
								modelInfo.temperature = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="0-2"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("providers.bizrouter.temperatureLabel", "settings")}</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={bizRouterModelInfo?.topP !== undefined ? bizRouterModelInfo.topP.toString() : ""}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseFloat(value)
								modelInfo.topP = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="0-1"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Top P</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={bizRouterModelInfo?.topK !== undefined ? bizRouterModelInfo.topK.toString() : ""}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseInt(value)
								modelInfo.topK = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="1-100"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Top K</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={bizRouterModelInfo?.minP !== undefined ? bizRouterModelInfo.minP.toString() : ""}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseFloat(value)
								modelInfo.minP = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="0-1"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Min P</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								bizRouterModelInfo?.frequencyPenalty !== undefined
									? bizRouterModelInfo.frequencyPenalty.toString()
									: ""
							}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseFloat(value)
								modelInfo.frequencyPenalty = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="-2 to 2"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Frequency Penalty</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={
								bizRouterModelInfo?.presencePenalty !== undefined
									? bizRouterModelInfo.presencePenalty.toString()
									: ""
							}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseFloat(value)
								modelInfo.presencePenalty = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="-2 to 2"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Presence Penalty</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								bizRouterModelInfo?.repetitionPenalty !== undefined
									? bizRouterModelInfo.repetitionPenalty.toString()
									: ""
							}
							onChange={(value) => {
								const modelInfo = bizRouterModelInfo ? bizRouterModelInfo : { ...bizRouterModelInfoSaneDefaults }
								const parsed = value === "" ? undefined : parseFloat(value)
								modelInfo.repetitionPenalty = parsed !== undefined && !isNaN(parsed) ? parsed : undefined

								handleModeFieldChange(
									{ plan: "planModeBizRouterModelInfo", act: "actModeBizRouterModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							placeholder="0.1-2.0"
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>Repetition Penalty</span>
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
				{t("providers.bizrouter.description1", "settings")}{" "}
				<VSCodeLink href={CARET_URLS.BIZROUTER_DOCS} style={{ display: "inline", fontSize: "inherit" }}>
					{t("providers.bizrouter.quickstartGuideLink", "settings")}
				</VSCodeLink>{" "}
				{t("providers.bizrouter.description2", "settings")}
			</p>

			{showModelOptions && (
				<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
			)}
		</div>
	)
}
