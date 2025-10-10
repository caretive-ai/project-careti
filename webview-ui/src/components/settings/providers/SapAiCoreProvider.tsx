import { SapAiCoreModelsRequest } from "@shared/proto/index.cline"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useState } from "react"
import { t } from "@/caret/utils/i18n"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import SapAiCoreModelPicker from "../SapAiCoreModelPicker"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the SapAiCoreProvider component
 */
interface SapAiCoreProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The SAP AI Core provider configuration component
 */
export const SapAiCoreProvider = ({ showModelOptions, isPopup, currentMode }: SapAiCoreProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Handle orchestration checkbox change
	const handleOrchestrationChange = async (checked: boolean) => {
		await handleFieldChange("sapAiCoreUseOrchestrationMode", checked)
	}

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// State for dynamic model fetching
	const [deployedModelsArray, setDeployedModelsArray] = useState<string[]>([])
	const [orchestrationAvailable, setOrchestrationAvailable] = useState<boolean>(false)
	const [hasCheckedOrchestration, setHasCheckedOrchestration] = useState<boolean>(false)
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const [modelError, setModelError] = useState<string | null>(null)

	// Check if all required credentials are available
	const hasRequiredCredentials =
		apiConfiguration?.sapAiCoreClientId &&
		apiConfiguration?.sapAiCoreClientSecret &&
		apiConfiguration?.sapAiCoreBaseUrl &&
		apiConfiguration?.sapAiCoreTokenUrl

	// Function to fetch SAP AI Core models
	const fetchSapAiCoreModels = useCallback(async () => {
		if (!hasRequiredCredentials) {
			setDeployedModelsArray([])
			setOrchestrationAvailable(false)
			setHasCheckedOrchestration(false)
			return
		}

		setIsLoadingModels(true)
		setModelError(null)

		try {
			const response = await ModelsServiceClient.getSapAiCoreModels(
				SapAiCoreModelsRequest.create({
					clientId: apiConfiguration.sapAiCoreClientId,
					clientSecret: apiConfiguration.sapAiCoreClientSecret,
					baseUrl: apiConfiguration.sapAiCoreBaseUrl,
					tokenUrl: apiConfiguration.sapAiCoreTokenUrl,
					resourceGroup: apiConfiguration.sapAiResourceGroup,
				}),
			)

			if (response) {
				const modelNames = response.deployments?.map((d) => d.modelName) || []
				setDeployedModelsArray(modelNames)
				setOrchestrationAvailable(response.orchestrationAvailable || false)
				setHasCheckedOrchestration(true)
			} else {
				setDeployedModelsArray([])
				setOrchestrationAvailable(false)
				setHasCheckedOrchestration(true)
			}
		} catch (error) {
			console.error(t("providers.sap-ai-core.fetchModelsErrorLog", "settings"), error)
			setModelError(t("providers.sap-ai-core.modelFetchError", "settings"))
			setDeployedModelsArray([])
			setOrchestrationAvailable(false)
			setHasCheckedOrchestration(true)
		} finally {
			setIsLoadingModels(false)
		}
	}, [
		apiConfiguration?.sapAiCoreClientId,
		apiConfiguration?.sapAiCoreClientSecret,
		apiConfiguration?.sapAiCoreBaseUrl,
		apiConfiguration?.sapAiCoreTokenUrl,
		apiConfiguration?.sapAiResourceGroup,
	])

	// Fetch models when configuration changes
	useEffect(() => {
		if (showModelOptions && hasRequiredCredentials) {
			fetchSapAiCoreModels()
		}
	}, [showModelOptions, hasRequiredCredentials, fetchSapAiCoreModels])

	// Handle automatic disabling of orchestration mode when not available
	useEffect(() => {
		if (hasCheckedOrchestration && !orchestrationAvailable && apiConfiguration?.sapAiCoreUseOrchestrationMode) {
			handleFieldChange("sapAiCoreUseOrchestrationMode", false)
		}
	}, [hasCheckedOrchestration, orchestrationAvailable, apiConfiguration?.sapAiCoreUseOrchestrationMode, handleFieldChange])

	// Handle model selection
	const handleModelChange = useCallback(
		(modelId: string) => {
			handleModeFieldChange({ plan: "planModeApiModelId", act: "actModeApiModelId" }, modelId, currentMode)
		},
		[handleModeFieldChange, currentMode],
	)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ whiteSpace: "pre-wrap" }}>{t("providers.sap-ai-core.description", "settings")}</p>
			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreClientId || ""}
				onChange={(value) => handleFieldChange("sapAiCoreClientId", value)}
				placeholder={t("providers.sap-ai-core.clientIdPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="password">
				<span className="font-medium">{t("providers.sap-ai-core.clientIdLabel", "settings")}</span>
			</DebouncedTextField>
			{apiConfiguration?.sapAiCoreClientId && (
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("providers.sap-ai-core.clientIdSetMessage", "settings")}
				</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreClientSecret || ""}
				onChange={(value) => handleFieldChange("sapAiCoreClientSecret", value)}
				placeholder={t("providers.sap-ai-core.clientSecretPlaceholder", "settings")}
				style={{ width: "100%" }}
				type="password">
				<span className="font-medium">{t("providers.sap-ai-core.clientSecretLabel", "settings")}</span>
			</DebouncedTextField>
			{apiConfiguration?.sapAiCoreClientSecret && (
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					{t("providers.sap-ai-core.clientSecretSetMessage", "settings")}
				</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreBaseUrl || ""}
				onChange={(value) => handleFieldChange("sapAiCoreBaseUrl", value)}
				placeholder={t("providers.sap-ai-core.baseUrlPlaceholder", "settings")}
				style={{ width: "100%" }}>
				<span className="font-medium">{t("providers.sap-ai-core.baseUrlLabel", "settings")}</span>
			</DebouncedTextField>

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreTokenUrl || ""}
				onChange={(value) => handleFieldChange("sapAiCoreTokenUrl", value)}
				placeholder={t("providers.sap-ai-core.tokenUrlPlaceholder", "settings")}
				style={{ width: "100%" }}>
				<span className="font-medium">{t("providers.sap-ai-core.tokenUrlLabel", "settings")}</span>
			</DebouncedTextField>

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiResourceGroup || ""}
				onChange={(value) => handleFieldChange("sapAiResourceGroup", value)}
				placeholder={t("providers.sap-ai-core.resourceGroupPlaceholder", "settings")}
				style={{ width: "100%" }}>
				<span className="font-medium">{t("providers.sap-ai-core.resourceGroupLabel", "settings")}</span>
			</DebouncedTextField>

			<p className="text-xs mt-1.5 text-[var(--vscode-descriptionForeground)]">
				{t("providers.sap-ai-core.credentialsHelpText", "settings")}
				<VSCodeLink
					className="inline"
					href="https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/access-sap-ai-core-via-api">
					{t("providers.sap-ai-core.apiAccessInfoLinkText", "settings")}
				</VSCodeLink>
			</p>

			{orchestrationAvailable && (
				<div className="flex flex-col gap-2.5 mt-[15px]">
					<div className="flex items-center gap-2">
						<VSCodeCheckbox
							aria-label={t("providers.sap-ai-core.orchestrationModeLabel", "settings")}
							checked={apiConfiguration?.sapAiCoreUseOrchestrationMode ?? true}
							onChange={(e) => handleOrchestrationChange((e.target as HTMLInputElement).checked)}
						/>
						<span className="font-medium">{t("providers.sap-ai-core.orchestrationModeLabel", "settings")}</span>
					</div>

					<p className="text-xs text-[var(--vscode-descriptionForeground)]">
						{t("providers.sap-ai-core.orchestrationModeDescriptionEnabled", "settings")}
						<br />
						<br />
						{t("providers.sap-ai-core.orchestrationModeDescriptionDisabled", "settings")}
					</p>
				</div>
			)}

			{showModelOptions && (
				<>
					<div className="flex flex-col gap-1.5">
						{isLoadingModels ? (
							<div className="text-xs text-[var(--vscode-descriptionForeground)]">
								{t("providers.sap-ai-core.loadingModels", "settings")}
							</div>
						) : modelError ? (
							<div className="text-xs text-[var(--vscode-errorForeground)]">
								{modelError}
								<button
									className="ml-2 text-[11px] px-1.5 py-0.5 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] border-none rounded-sm cursor-pointer"
									onClick={fetchSapAiCoreModels}>
									{t("providers.sap-ai-core.retryButton", "settings")}
								</button>
							</div>
						) : hasRequiredCredentials ? (
							<>
								{deployedModelsArray.length === 0 && (
									<div className="text-xs text-[var(--vscode-errorForeground)] mb-2">
										{t("providers.sap-ai-core.noModelsFound", "settings")}
									</div>
								)}
								<SapAiCoreModelPicker
									onModelChange={handleModelChange}
									placeholder={t("providers.sap-ai-core.selectModelPlaceholder", "settings")}
									sapAiCoreModelDeployments={deployedModelsArray.map((name) => ({
										modelName: name,
										deploymentId: "",
									}))}
									selectedModelId={selectedModelId || ""}
									useOrchestrationMode={apiConfiguration?.sapAiCoreUseOrchestrationMode ?? true}
								/>
							</>
						) : (
							<div className="text-xs text-[var(--vscode-errorForeground)]">
								{t("providers.sap-ai-core.configureCredentialsPrompt", "settings")}
							</div>
						)}
					</div>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
