// CARET MODIFICATION: Provider 순서 변경 및 Cline을 Caret으로 표시
// 백업 위치: webview-ui/src/components/settings/ApiOptions-tsx.cline
// 목적: 사용자 피드백 반영 - Provider 순서를 Caret > Google Gemini > OpenAI > Anthropic 순으로 변경

import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { vscode } from "@/utils/vscode"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import {
	anthropicDefaultModelId,
	anthropicModels,
	ApiConfiguration,
	ApiProvider,
	askSageDefaultModelId,
	askSageDefaultURL,
	askSageModels,
	azureOpenAiDefaultApiVersion,
	bedrockDefaultModelId,
	bedrockModels,
	cerebrasDefaultModelId,
	cerebrasModels,
	deepSeekDefaultModelId,
	deepSeekModels,
	doubaoDefaultModelId,
	doubaoModels,
	geminiDefaultModelId,
	geminiModels,
	internationalQwenDefaultModelId,
	internationalQwenModels,
	liteLlmModelInfoSaneDefaults,
	mainlandQwenDefaultModelId,
	mainlandQwenModels,
	mistralDefaultModelId,
	mistralModels,
	ModelInfo,
	nebiusDefaultModelId,
	nebiusModels,
	openAiModelInfoSaneDefaults,
	openAiNativeDefaultModelId,
	openAiNativeModels,
	openRouterDefaultModelId,
	openRouterDefaultModelInfo,
	requestyDefaultModelId,
	requestyDefaultModelInfo,
	sambanovaDefaultModelId,
	sambanovaModels,
	vertexDefaultModelId,
	vertexGlobalModels,
	vertexModels,
	xaiDefaultModelId,
	xaiModels,
	sapAiCoreDefaultModelId,
	sapAiCoreModels,
} from "@shared/api"
import { EmptyRequest, StringRequest } from "@shared/proto/common"
import { OpenAiModelsRequest, UpdateApiConfigurationRequest } from "@shared/proto/models"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"
import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeRadio,
	VSCodeRadioGroup,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInterval, useWindowSize } from "react-use"
import styled from "styled-components"
import * as vscodemodels from "vscode"
import { useOpenRouterKeyInfo } from "../ui/hooks/useOpenRouterKeyInfo"
import { ClineAccountInfoCard } from "./ClineAccountInfoCard"
// CARET MODIFICATION: Add i18n import for text internationalization
import { t } from "@/caret/utils/i18n"
import OllamaModelPicker from "./OllamaModelPicker"
import OpenRouterModelPicker, { ModelDescriptionMarkdown, OPENROUTER_MODEL_PICKER_Z_INDEX } from "./OpenRouterModelPicker"
import RequestyModelPicker from "./RequestyModelPicker"
import ThinkingBudgetSlider from "./ThinkingBudgetSlider"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import FeaturedModelCard from "./FeaturedModelCard" // CARET MODIFICATION: Added FeaturedModelCard import

interface ApiOptionsProps {
	showModelOptions: boolean
	apiErrorMessage?: string
	modelIdErrorMessage?: string
	isPopup?: boolean
	saveImmediately?: boolean // Add prop to control immediate saving
}

const OpenRouterBalanceDisplay = ({ apiKey }: { apiKey: string }) => {
	const { data: keyInfo, isLoading, error } = useOpenRouterKeyInfo(apiKey)

	if (isLoading) {
		return (
			<span style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
				{t("apiOptions.loading", "common")}
			</span>
		)
	}

	if (error || !keyInfo || keyInfo.limit === null) {
		// Don't show anything if there's an error, no info, or no limit set
		return null
	}

	// Calculate remaining balance
	const remainingBalance = keyInfo.limit - keyInfo.usage
	const formattedBalance = remainingBalance.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 4,
	})

	return (
		<VSCodeLink
			href="https://openrouter.ai/settings/keys"
			title={`Remaining balance: ${formattedBalance}\nLimit: ${keyInfo.limit.toLocaleString("en-US", { style: "currency", currency: "USD" })}\nUsage: ${keyInfo.usage.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
			style={{
				fontSize: "12px",
				color: "var(--vscode-foreground)",
				textDecoration: "none",
				fontWeight: 500,
				paddingLeft: 4,
				cursor: "pointer",
			}}>
			Balance: {formattedBalance}
		</VSCodeLink>
	)
}

const SUPPORTED_THINKING_MODELS: Record<string, string[]> = {
	anthropic: ["claude-3-7-sonnet-20250219", "claude-sonnet-4-20250514", "claude-opus-4-20250514"],
	vertex: [
		"claude-3-7-sonnet@20250219",
		"claude-sonnet-4@20250514",
		"claude-opus-4@20250514",
		"gemini-2.5-flash-preview-05-20",
		"gemini-2.5-flash-preview-04-17",
		"gemini-2.5-pro-preview-06-05",
	],
	qwen: [
		"qwen3-235b-a22b",
		"qwen3-32b",
		"qwen3-30b-a3b",
		"qwen3-14b",
		"qwen3-8b",
		"qwen3-4b",
		"qwen3-1.7b",
		"qwen3-0.6b",
		"qwen-plus-latest",
		"qwen-turbo-latest",
	],
	gemini: ["gemini-2.5-flash-preview-05-20", "gemini-2.5-flash-preview-04-17", "gemini-2.5-pro-preview-06-05"],
}

// This is necessary to ensure dropdown opens downward, important for when this is used in popup
export const DROPDOWN_Z_INDEX = OPENROUTER_MODEL_PICKER_Z_INDEX + 2 // Higher than the OpenRouterModelPicker's and ModelSelectorTooltip's z-index

export const DropdownContainer = styled.div<{ zIndex?: number }>`
	position: relative;
	z-index: ${(props) => props.zIndex || DROPDOWN_Z_INDEX};

	// Force dropdowns to open downward
	& vscode-dropdown::part(listbox) {
		position: absolute !important;
		top: 100% !important;
		bottom: auto !important;
	}
`

declare module "vscode" {
	interface LanguageModelChatSelector {
		vendor?: string
		family?: string
		version?: string
		id?: string
	}
}

const ApiOptions = ({ showModelOptions, apiErrorMessage, modelIdErrorMessage, isPopup, currentMode }: ApiOptionsProps) => {
	// Use full context state for immediate save payload
	const extensionState = useExtensionState()
	const { apiConfiguration, setApiConfiguration, uriScheme } = extensionState
	// CARET MODIFICATION: 반응형 레이아웃을 위한 창 크기 감지
	const { width } = useWindowSize()
	const [ollamaModels, setOllamaModels] = useState<string[]>([])

	// Poll ollama/vscode-lm models
	const requestLocalModels = useCallback(async () => {
		if (selectedProvider === "ollama") {
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
				console.error("Failed to fetch Ollama models:", error)
				setOllamaModels([])
			}
		}
	}, [selectedProvider, apiConfiguration?.ollamaBaseUrl])
	useEffect(() => {
		if (selectedProvider === "ollama") {
			requestLocalModels()
		}
	}, [selectedProvider, requestLocalModels])
	useInterval(requestLocalModels, selectedProvider === "ollama" ? 2000 : null)

	/*
	VSCodeDropdown has an open bug where dynamically rendered options don't auto select the provided value prop. You can see this for yourself by comparing  it with normal select/option elements, which work as expected.
	https://github.com/microsoft/vscode-webview-ui-toolkit/issues/433

	In our case, when the user switches between providers, we recalculate the selectedModelId depending on the provider, the default model for that provider, and a modelId that the user may have selected. Unfortunately, the VSCodeDropdown component wouldn't select this calculated value, and would default to the first "Select a model..." option instead, which makes it seem like the model was cleared out when it wasn't.

	As a workaround, we create separate instances of the dropdown for each provider, and then conditionally render the one that matches the current provider.
	*/
	const createDropdown = (models: Record<string, ModelInfo>) => {
		return (
			<VSCodeDropdown
				id="model-id"
				value={selectedModelId}
				onChange={handleInputChange("apiModelId")}
				style={{ width: "100%" }}>
				<VSCodeOption value="">{t("apiOptions.selectModel", "common")}</VSCodeOption>
				{Object.keys(models).map((modelId) => (
					<VSCodeOption
						key={modelId}
						value={modelId}
						style={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							maxWidth: "100%",
						}}>
						{modelId}
					</VSCodeOption>
				))}
			</VSCodeDropdown>
		)
	}

	// Debounced function to refresh OpenAI models (prevents excessive API calls while typing)
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	const debouncedRefreshOpenAiModels = useCallback((baseUrl?: string, apiKey?: string) => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current)
		}

		if (baseUrl && apiKey) {
			debounceTimerRef.current = setTimeout(() => {
				ModelsServiceClient.refreshOpenAiModels(
					OpenAiModelsRequest.create({
						baseUrl,
						apiKey,
					}),
				).catch((error) => {
					console.error("Failed to refresh OpenAI models:", error)
				})
			}, 500)
		}
	}, [])
					<VSCodeOption value="vscode-lm">VS Code LM API</VSCodeOption>
					<VSCodeOption value="mistral">Mistral</VSCodeOption>
					<VSCodeOption value="requesty">Requesty</VSCodeOption>
					<VSCodeOption value="fireworks">Fireworks</VSCodeOption>
					<VSCodeOption value="together">Together</VSCodeOption>
					<VSCodeOption value="qwen">Alibaba Qwen</VSCodeOption>
					<VSCodeOption value="doubao">Bytedance Doubao</VSCodeOption>
					<VSCodeOption value="lmstudio">LM Studio</VSCodeOption>
					<VSCodeOption value="ollama">Ollama</VSCodeOption>
					<VSCodeOption value="litellm">LiteLLM</VSCodeOption>
					<VSCodeOption value="moonshot">Moonshot</VSCodeOption>
					<VSCodeOption value="huggingface">Hugging Face</VSCodeOption>
					<VSCodeOption value="nebius">Nebius AI Studio</VSCodeOption>
					<VSCodeOption value="asksage">AskSage</VSCodeOption>
					<VSCodeOption value="xai">xAI</VSCodeOption>
					<VSCodeOption value="sambanova">SambaNova</VSCodeOption>
					<VSCodeOption value="sapaicore">SAP AI Core</VSCodeOption>
					<VSCodeOption value="huawei-cloud-maas">Huawei Cloud MaaS</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>

			{selectedProvider === "caret" && ( // CARET MODIFICATION: Changed 'cline' to 'caret'
				<div>
					{/* CARET MODIFICATION: Caret 프로바이더 개선 - 향후 지원 예정 메시지 및 모델 선택 */}
					<div style={{ marginBottom: 14, marginTop: 4 }}>
						<ClineAccountInfoCard />
					</div>

					{/* CARET MODIFICATION: Testing edit_file functionality with a comment */}
					{/* 향후 지원 예정 메시지 */}
					<div
						style={{
							padding: "10px",
							// CARET MODIFICATION: Removed background color for less emphasis
							// backgroundColor: "var(--vscode-textCodeBlock-background)",
							borderRadius: "4px",
							marginBottom: "10px",
							// CARET MODIFICATION: Removed border for less emphasis
							// border: "1px solid var(--vscode-textBlockQuote-border)"
						}}>
						<p
							style={{
								margin: 0,
								fontSize: "13px",
								// CARET MODIFICATION: Changed color and font-weight for less emphasis
								color: "var(--vscode-descriptionForeground)",
								fontWeight: "normal", // Changed from 500 to normal
							}}>
							{/* CARET MODIFICATION: Removed icon for less emphasis */}
							{t("caretProvider.futureSupport", "common")}
						</p>
						<p
							style={{
								margin: "4px 0 0 0",
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							{t("caretProvider.futureProviders", "common")}
						</p>
					</div>
				</div>
			)}

			{selectedProvider === "asksage" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.asksageApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("asksageApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.askSageApiKey", "common")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
					</p>
					<VSCodeTextField
						value={apiConfiguration?.asksageApiUrl || askSageDefaultURL}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("asksageApiUrl")}
						placeholder={t("apiOptions.enterAskSageUrl", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.askSageApiUrl", "common")}</span>
					</VSCodeTextField>
				</div>
			)}

			{selectedProvider === "anthropic" && ( // CARET MODIFICATION: No change, just for context
				<div>
					<VSCodeTextField
						value={apiConfiguration?.apiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("apiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.anthropicApiKey", "common")}</span>
					</VSCodeTextField>

					<VSCodeCheckbox
						checked={anthropicBaseUrlSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setAnthropicBaseUrlSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									anthropicBaseUrl: "",
								})
							}
						}}>
						{t("apiOptions.useCustomBaseUrl", "common")}
					</VSCodeCheckbox>

					{anthropicBaseUrlSelected && (
						<VSCodeTextField
							value={apiConfiguration?.anthropicBaseUrl || ""}
							style={{ width: "100%", marginTop: 3 }}
							type="url"
							onInput={handleInputChange("anthropicBaseUrl")}
							placeholder={t("apiOptions.defaultAnthropicUrl", "common")}
						/>
					)}

					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						{t("apiOptions.thisKeyStoredLocally", "common")}
						{!apiConfiguration?.apiKey && (
							<VSCodeLink
								href="https://console.anthropic.com/settings/keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								{t("apiOptions.getAnthropicApiKey", "common")}
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "openai-native" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.openAiNativeApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("openAiNativeApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.openAiApiKey", "common")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						{t("apiOptions.thisKeyStoredLocally", "common")}
						{!apiConfiguration?.openAiNativeApiKey && (
							<VSCodeLink
								href="https://platform.openai.com/api-keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								{t("apiOptions.getOpenAiApiKey", "common")}
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "deepseek" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.deepSeekApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("deepSeekApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.deepSeekApiKey", "common")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.deepSeekApiKey && (
							<VSCodeLink
								href="https://www.deepseek.com/"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a DeepSeek API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "qwen" && (
				<div>
					<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
						<label htmlFor="qwen-line-provider">
							<span style={{ fontWeight: 500, marginTop: 5 }}>Alibaba API Line</span>
						</label>
						<VSCodeDropdown
							id="qwen-line-provider"
							value={apiConfiguration?.qwenApiLine || "china"}
							onChange={handleInputChange("qwenApiLine")}
							style={{
								minWidth: 130,
								position: "relative",
							}}>
							<VSCodeOption value="china">China API</VSCodeOption>
							<VSCodeOption value="international">International API</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						Please select the appropriate API interface based on your location. If you are in China, choose the China
						API interface. Otherwise, choose the International API interface.
					</p>
					<VSCodeTextField
						value={apiConfiguration?.qwenApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("qwenApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.qwenApiKey", "common")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.qwenApiKey && (
							<VSCodeLink
								href="https://bailian.console.aliyun.com/"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a Qwen API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "doubao" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.doubaoApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("doubaoApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.doubaoApiKey", "common")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.doubaoApiKey && (
							<VSCodeLink
								href="https://console.volcengine.com/home"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a Doubao API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "mistral" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.mistralApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("mistralApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.mistralApiKey", "common")}</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.mistralApiKey && (
							<VSCodeLink
								href="https://console.mistral.ai/codestral"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a Mistral API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "openrouter" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.openRouterApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("openRouterApiKey")}
						placeholder="Enter API Key...">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
							<span style={{ fontWeight: 500 }}>{t("apiOptions.openRouterApiKey", "common")}</span>
							{apiConfiguration?.openRouterApiKey && (
								<OpenRouterBalanceDisplay apiKey={apiConfiguration.openRouterApiKey} />
							)}
						</div>
					</VSCodeTextField>
					{!apiConfiguration?.openRouterApiKey && (
						<VSCodeButtonLink
							href={getOpenRouterAuthUrl(uriScheme)}
							style={{ margin: "5px 0 0 0" }}
							appearance="secondary">
							Get OpenRouter API Key
						</VSCodeButtonLink>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.{" "}
						{/* {!apiConfiguration?.openRouterApiKey && (
							<span style={{ color: "var(--vscode-charts-green)" }}>
								(<span style={{ fontWeight: 500 }}>Note:</span> OpenRouter is recommended for high rate
								limits, prompt caching, and wider selection of models.)
							</span>
						)} */}
					</p>
				</div>
			)}

			{selectedProvider === "bedrock" && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 5,
					}}>
					<VSCodeRadioGroup
						value={apiConfiguration?.awsUseProfile ? "profile" : "credentials"}
						onChange={(e) => {
							const value = (e.target as HTMLInputElement)?.value
							const useProfile = value === "profile"
							setApiConfiguration({
								...apiConfiguration,
								awsUseProfile: useProfile,
							})
						}}>
						<VSCodeRadio value="credentials">{t("apiOptions.awsCredentials", "common")}</VSCodeRadio>
						<VSCodeRadio value="profile">{t("apiOptions.awsProfile", "common")}</VSCodeRadio>
					</VSCodeRadioGroup>

					{apiConfiguration?.awsUseProfile ? (
						<VSCodeTextField
							value={apiConfiguration?.awsProfile || ""}
							style={{ width: "100%" }}
							onInput={handleInputChange("awsProfile")}
							placeholder={t("apiOptions.awsProfilePlaceholder", "common")}>
							<span style={{ fontWeight: 500 }}>{t("apiOptions.awsProfileName", "common")}</span>
						</VSCodeTextField>
					) : (
						<>
							<VSCodeTextField
								value={apiConfiguration?.awsAccessKey || ""}
								style={{ width: "100%" }}
								type="password"
								onInput={handleInputChange("awsAccessKey")}
								placeholder={t("apiOptions.enterAccessKey", "common")}>
								<span style={{ fontWeight: 500 }}>{t("apiOptions.awsAccessKey", "common")}</span>
							</VSCodeTextField>
							<VSCodeTextField
								value={apiConfiguration?.awsSecretKey || ""}
								style={{ width: "100%" }}
								type="password"
								onInput={handleInputChange("awsSecretKey")}
								placeholder={t("apiOptions.enterSecretKey", "common")}>
								<span style={{ fontWeight: 500 }}>{t("apiOptions.awsSecretKey", "common")}</span>
							</VSCodeTextField>
							<VSCodeTextField
								value={apiConfiguration?.awsSessionToken || ""}
								style={{ width: "100%" }}
								type="password"
								onInput={handleInputChange("awsSessionToken")}
								placeholder={t("apiOptions.enterSessionToken", "common")}>
								<span style={{ fontWeight: 500 }}>{t("apiOptions.awsSessionToken", "common")}</span>
							</VSCodeTextField>
						</>
					)}
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 1} className="dropdown-container">
						<label htmlFor="aws-region-dropdown">
							<span style={{ fontWeight: 500 }}>{t("apiOptions.awsRegion", "common")}</span>
						</label>
						<VSCodeDropdown
							id="aws-region-dropdown"
							value={apiConfiguration?.awsRegion || ""}
							style={{ width: "100%" }}
							onChange={handleInputChange("awsRegion")}>
							<VSCodeOption value="">Select a region...</VSCodeOption>
							{/* The user will have to choose a region that supports the model they use, but this shouldn't be a problem since they'd have to request access for it in that region in the first place. */}
							<VSCodeOption value="us-east-1">us-east-1</VSCodeOption>
							<VSCodeOption value="us-east-2">us-east-2</VSCodeOption>
							{/* <VSCodeOption value="us-west-1">us-west-1</VSCodeOption> */}
							<VSCodeOption value="us-west-2">us-west-2</VSCodeOption>
							{/* <VSCodeOption value="af-south-1">af-south-1</VSCodeOption> */}
							{/* <VSCodeOption value="ap-east-1">ap-east-1</VSCodeOption> */}
							<VSCodeOption value="ap-south-1">ap-south-1</VSCodeOption>
							<VSCodeOption value="ap-northeast-1">ap-northeast-1</VSCodeOption>
							<VSCodeOption value="ap-northeast-2">ap-northeast-2</VSCodeOption>
							<VSCodeOption value="ap-northeast-3">ap-northeast-3</VSCodeOption>
							<VSCodeOption value="ap-southeast-1">ap-southeast-1</VSCodeOption>
							<VSCodeOption value="ap-southeast-2">ap-southeast-2</VSCodeOption>
							<VSCodeOption value="ca-central-1">ca-central-1</VSCodeOption>
							<VSCodeOption value="eu-central-1">eu-central-1</VSCodeOption>
							<VSCodeOption value="eu-central-2">eu-central-2</VSCodeOption>
							<VSCodeOption value="eu-west-1">eu-west-1</VSCodeOption>
							<VSCodeOption value="eu-west-2">eu-west-2</VSCodeOption>
							<VSCodeOption value="eu-west-3">eu-west-3</VSCodeOption>
							<VSCodeOption value="eu-north-1">eu-north-1</VSCodeOption>
							{/* <VSCodeOption value="me-south-1">me-south-1</VSCodeOption> */}
							<VSCodeOption value="sa-east-1">sa-east-1</VSCodeOption>
							<VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption>
							<VSCodeOption value="us-gov-west-1">us-gov-west-1</VSCodeOption>
							{/* <VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption> */}
						</VSCodeDropdown>
					</DropdownContainer>

					<div style={{ display: "flex", flexDirection: "column" }}>
						<VSCodeCheckbox
							checked={awsEndpointSelected}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true
								setAwsEndpointSelected(isChecked)
								if (!isChecked) {
									setApiConfiguration({
										...apiConfiguration,
										awsBedrockEndpoint: "",
									})
								}
							}}>
							Use custom VPC endpoint
						</VSCodeCheckbox>

						{awsEndpointSelected && (
							<VSCodeTextField
								value={apiConfiguration?.awsBedrockEndpoint || ""}
								style={{ width: "100%", marginTop: 3, marginBottom: 5 }}
								type="url"
								onInput={handleInputChange("awsBedrockEndpoint")}
								placeholder="Enter VPC Endpoint URL (optional)"
							/>
						)}

						<VSCodeCheckbox
							checked={apiConfiguration?.awsUseCrossRegionInference || false}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true
								setApiConfiguration({
									...apiConfiguration,
									awsUseCrossRegionInference: isChecked,
								})
							}}>
							Use cross-region inference
						</VSCodeCheckbox>

						{selectedModelInfo.supportsPromptCache && (
							<>
								<VSCodeCheckbox
									checked={apiConfiguration?.awsBedrockUsePromptCache || false}
									onChange={(e: any) => {
										const isChecked = e.target.checked === true
										setApiConfiguration({
											...apiConfiguration,
											awsBedrockUsePromptCache: isChecked,
										})
									}}>
									Use prompt caching
								</VSCodeCheckbox>
							</>
						)}
					</div>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						{apiConfiguration?.awsUseProfile ? (
							<>
								Using AWS Profile credentials from ~/.aws/credentials. Leave profile name empty to use the default
								profile. These credentials are only used locally to make API requests from this extension.
							</>
						) : (
							<>
								Authenticate by either providing the keys above or use the default AWS credential providers, i.e.
								~/.aws/credentials or environment variables. These credentials are only used locally to make API
								requests from this extension.
							</>
						)}
					</p>
					<label htmlFor="bedrock-model-dropdown">
						<span style={{ fontWeight: 500 }}>Model</span>
					</label>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
						<VSCodeDropdown
							id="bedrock-model-dropdown"
							value={apiConfiguration?.awsBedrockCustomSelected ? "custom" : selectedModelId}
							onChange={(e: any) => {
								const isCustom = e.target.value === "custom"
								setApiConfiguration({
									...apiConfiguration,
									apiModelId: isCustom ? "" : e.target.value,
									awsBedrockCustomSelected: isCustom,
									awsBedrockCustomModelBaseId: bedrockDefaultModelId,
								})
							}}
							style={{ width: "100%" }}>
							<VSCodeOption value="">{t("apiOptions.selectModel", "common")}</VSCodeOption>
							{Object.keys(bedrockModels).map((modelId) => (
								<VSCodeOption
									key={modelId}
									value={modelId}
									style={{
										whiteSpace: "normal",
										wordWrap: "break-word",
										maxWidth: "100%",
									}}>
									{modelId}
								</VSCodeOption>
							))}
							<VSCodeOption value="custom">{t("apiOptions.custom", "common")}</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>
					{apiConfiguration?.awsBedrockCustomSelected && (
						<div>
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								Select "Custom" when using the Application Inference Profile in Bedrock. Enter the Application
								Inference Profile ARN in the Model ID field.
							</p>
							<label htmlFor="bedrock-model-input">
								<span style={{ fontWeight: 500 }}>{t("apiOptions.modelId", "common")}</span>
							</label>
							<VSCodeTextField
								id="bedrock-model-input"
								value={apiConfiguration?.apiModelId || ""}
								style={{ width: "100%", marginTop: 3 }}
								onInput={handleInputChange("apiModelId")}
								placeholder={t("apiOptions.enterCustomModelId", "common")}
							/>
							<label htmlFor="bedrock-base-model-dropdown">
								<span style={{ fontWeight: 500 }}>{t("apiOptions.baseInferenceModel", "common")}</span>
							</label>
							<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 3} className="dropdown-container">
								<VSCodeDropdown
									id="bedrock-base-model-dropdown"
									value={apiConfiguration?.awsBedrockCustomModelBaseId || bedrockDefaultModelId}
									onChange={handleInputChange("awsBedrockCustomModelBaseId")}
									style={{ width: "100%" }}>
									<VSCodeOption value="">{t("apiOptions.selectModel", "common")}</VSCodeOption>
									{Object.keys(bedrockModels).map((modelId) => (
										<VSCodeOption
											key={modelId}
											value={modelId}
											style={{
												whiteSpace: "normal",
												wordWrap: "break-word",
												maxWidth: "100%",
											}}>
											{modelId}
										</VSCodeOption>
									))}
								</VSCodeDropdown>
							</DropdownContainer>
						</div>
					)}
					{(selectedModelId === "anthropic.claude-3-7-sonnet-20250219-v1:0" ||
						selectedModelId === "anthropic.claude-sonnet-4-20250514-v1:0" ||
						selectedModelId === "anthropic.claude-opus-4-20250514-v1:0" ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-3-7-sonnet-20250219-v1:0") ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-sonnet-4-20250514-v1:0") ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-opus-4-20250514-v1:0")) && (
						<ThinkingBudgetSlider apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
					)}
					<ModelInfoView
						selectedModelId={selectedModelId}
						modelInfo={selectedModelInfo}
						isDescriptionExpanded={isDescriptionExpanded}
						setIsDescriptionExpanded={setIsDescriptionExpanded}
						isPopup={isPopup}
					/>
				</div>
			)}

			{apiConfiguration?.apiProvider === "vertex" && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 5,
					}}>
					<VSCodeTextField
						value={apiConfiguration?.vertexProjectId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("vertexProjectId")}
						placeholder={t("apiOptions.enterProjectId", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.gcpProjectId", "common")}</span>
					</VSCodeTextField>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 1} className="dropdown-container">
						<label htmlFor="vertex-region-dropdown">
							<span style={{ fontWeight: 500 }}>{t("apiOptions.gcpRegion", "common")}</span>
						</label>
						<VSCodeDropdown
							id="vertex-region-dropdown"
							value={apiConfiguration?.vertexRegion || ""}
							style={{ width: "100%" }}
							onChange={handleInputChange("vertexRegion")}>
							<VSCodeOption value="">{t("apiOptions.selectRegion", "common")}</VSCodeOption>
							<VSCodeOption value="us-east5">us-east5</VSCodeOption>
							<VSCodeOption value="us-central1">us-central1</VSCodeOption>
							<VSCodeOption value="europe-west1">europe-west1</VSCodeOption>
							<VSCodeOption value="europe-west4">europe-west4</VSCodeOption>
							<VSCodeOption value="asia-southeast1">asia-southeast1</VSCodeOption>
							<VSCodeOption value="global">global</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						To use Google Cloud Vertex AI, you need to
						<VSCodeLink
							href="https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude#before_you_begin"
							style={{ display: "inline", fontSize: "inherit" }}>
							{"1) create a Google Cloud account › enable the Vertex AI API › enable the desired Claude models,"}
						</VSCodeLink>{" "}
						<VSCodeLink
							href="https://cloud.google.com/docs/authentication/provide-credentials-adc#google-idp"
							style={{ display: "inline", fontSize: "inherit" }}>
							{"2) install the Google Cloud CLI › configure Application Default Credentials."}
						</VSCodeLink>
					</p>
				</div>
			)}

			{selectedProvider === "gemini" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.geminiApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("geminiApiKey")}
						placeholder={t("apiOptions.enterApiKey", "common")}>
						<span style={{ fontWeight: 500 }}>{t("apiOptions.geminiApiKey", "common")}</span>
					</VSCodeTextField>

					{/* CARET MODIFICATION: Flash 모델 추론 기능 기본 활성화 안내 */}
					{selectedModelId === "gemini-2.5-flash-preview-05-20" && (
						<div
							style={{
								padding: "8px",
								backgroundColor: "var(--vscode-list-hoverBackground)",
								borderRadius: "4px",
								marginTop: "8px",
								border: "1px solid var(--vscode-focusBorder)",
							}}>
							<p
								style={{
									margin: 0,
									fontSize: "12px",
									color: "var(--vscode-charts-blue)",
									fontWeight: 500,
								}}>
								💡 {t("apiOptions.reasoningEnabled", "common")}
							</p>
						</div>
					)}

					<VSCodeCheckbox
						checked={geminiBaseUrlSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setGeminiBaseUrlSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									geminiBaseUrl: "",
								})
							}
						}}>
						{t("apiOptions.useCustomBaseUrl", "common")}
					</VSCodeCheckbox>

					{geminiBaseUrlSelected && (
						<VSCodeTextField
							value={apiConfiguration?.geminiBaseUrl || ""}
							style={{ width: "100%", marginTop: 3 }}
							type="url"
							onInput={handleInputChange("geminiBaseUrl")}
							placeholder="Default: https://generativelanguage.googleapis.com"
						/>
					)}

					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						{t("apiOptions.thisKeyStoredLocally", "common")}
						{!apiConfiguration?.geminiApiKey && (
							<VSCodeLink
								href="https://aistudio.google.com/apikey"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								{t("apiOptions.getGeminiApiKey", "common")}
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "openai" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.openAiBaseUrl || ""}
						style={{ width: "100%", marginBottom: 10 }}
						type="url"
						onInput={(e: any) => {
							const baseUrl = e.target.value
							handleInputChange("openAiBaseUrl")({ target: { value: baseUrl } })

							debouncedRefreshOpenAiModels(baseUrl, apiConfiguration?.openAiApiKey)
						}}
						placeholder={"Enter base URL..."}>
						<span style={{ fontWeight: 500 }}>Base URL</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.openAiApiKey || ""}
						style={{ width: "100%", marginBottom: 10 }}
						type="password"
						onInput={(e: any) => {
							const apiKey = e.target.value
							handleInputChange("openAiApiKey")({ target: { value: apiKey } })

							debouncedRefreshOpenAiModels(apiConfiguration?.openAiBaseUrl, apiKey)
						}}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>API Key</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.openAiModelId || ""}
						style={{ width: "100%", marginBottom: 10 }}
						onInput={handleInputChange("openAiModelId")}
						placeholder={"Enter Model ID..."}>
						<span style={{ fontWeight: 500 }}>Model ID</span>
					</VSCodeTextField>

					{/* OpenAI Compatible Custom Headers */}
					{(() => {
						const headerEntries = Object.entries(apiConfiguration?.openAiHeaders ?? {})
						return (
							<div style={{ marginBottom: 10 }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<span style={{ fontWeight: 500 }}>Custom Headers</span>
									<VSCodeButton
										onClick={() => {
											const currentHeaders = { ...(apiConfiguration?.openAiHeaders || {}) }
											const headerCount = Object.keys(currentHeaders).length
											const newKey = `header${headerCount + 1}`
											currentHeaders[newKey] = ""
											handleInputChange("openAiHeaders")({
												target: {
													value: currentHeaders,
												},
											})
										}}>
										Add Header
									</VSCodeButton>
								</div>
								<div>
									{headerEntries.map(([key, value], index) => (
										<div key={index} style={{ display: "flex", gap: 5, marginTop: 5 }}>
											<VSCodeTextField
												value={key}
												style={{ width: "40%" }}
												placeholder="Header name"
												onInput={(e: any) => {
													const currentHeaders = apiConfiguration?.openAiHeaders ?? {}
													const newValue = e.target.value
													if (newValue && newValue !== key) {
														const { [key]: _, ...rest } = currentHeaders
														handleInputChange("openAiHeaders")({
															target: {
																value: {
																	...rest,
																	[newValue]: value,
																},
															},
														})
													}
												}}
											/>
											<VSCodeTextField
												value={value}
												style={{ width: "40%" }}
												placeholder="Header value"
												onInput={(e: any) => {
													handleInputChange("openAiHeaders")({
														target: {
															value: {
																...(apiConfiguration?.openAiHeaders ?? {}),
																[key]: e.target.value,
															},
														},
													})
												}}
											/>
											<VSCodeButton
												appearance="secondary"
												onClick={() => {
													const { [key]: _, ...rest } = apiConfiguration?.openAiHeaders ?? {}
													handleInputChange("openAiHeaders")({
														target: {
															value: rest,
														},
													})
												}}>
												Remove
											</VSCodeButton>
										</div>
									))}
								</div>
							</div>
						)
					})()}

					<VSCodeCheckbox
						checked={azureApiVersionSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setAzureApiVersionSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									azureApiVersion: "",
								})
							}
						}}>
						Set Azure API version
					</VSCodeCheckbox>
					{azureApiVersionSelected && (
						<VSCodeTextField
							value={apiConfiguration?.azureApiVersion || ""}
							style={{ width: "100%", marginTop: 3 }}
							onInput={handleInputChange("azureApiVersion")}
							placeholder={`Default: ${azureOpenAiDefaultApiVersion}`}
						/>
					)}
					<div
						style={{
							color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
							display: "flex",
							margin: "10px 0",
							cursor: "pointer",
							alignItems: "center",
						}}
						onClick={() => setModelConfigurationSelected((val) => !val)}>
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
							Model Configuration
						</span>
					</div>
					{modelConfigurationSelected && (
						<>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.openAiModelInfo?.supportsImages}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									const modelInfo = apiConfiguration?.openAiModelInfo
										? apiConfiguration.openAiModelInfo
										: { ...openAiModelInfoSaneDefaults }
									modelInfo.supportsImages = isChecked
									setApiConfiguration({
										...apiConfiguration,
										openAiModelInfo: modelInfo,
									})
								}}>
								Supports Images
							</VSCodeCheckbox>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.openAiModelInfo?.supportsImages}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									let modelInfo = apiConfiguration?.openAiModelInfo
										? apiConfiguration.openAiModelInfo
										: { ...openAiModelInfoSaneDefaults }
									modelInfo.supportsImages = isChecked
									setApiConfiguration({
										...apiConfiguration,
										openAiModelInfo: modelInfo,
									})
								}}>
								Supports browser use
							</VSCodeCheckbox>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.openAiModelInfo?.isR1FormatRequired}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									let modelInfo = apiConfiguration?.openAiModelInfo
										? apiConfiguration.openAiModelInfo
										: { ...openAiModelInfoSaneDefaults }
									modelInfo = { ...modelInfo, isR1FormatRequired: isChecked }

									setApiConfiguration({
										...apiConfiguration,
										openAiModelInfo: modelInfo,
									})
								}}>
								Enable R1 messages format
							</VSCodeCheckbox>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.contextWindow
											? apiConfiguration.openAiModelInfo.contextWindow.toString()
											: openAiModelInfoSaneDefaults.contextWindow?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.contextWindow = Number(input.target.value)
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>Context Window Size</span>
								</VSCodeTextField>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.maxTokens
											? apiConfiguration.openAiModelInfo.maxTokens.toString()
											: openAiModelInfoSaneDefaults.maxTokens?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.maxTokens = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>Max Output Tokens</span>
								</VSCodeTextField>
							</div>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.inputPrice
											? apiConfiguration.openAiModelInfo.inputPrice.toString()
											: openAiModelInfoSaneDefaults.inputPrice?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.inputPrice = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>Input Price / 1M tokens</span>
								</VSCodeTextField>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.outputPrice
											? apiConfiguration.openAiModelInfo.outputPrice.toString()
											: openAiModelInfoSaneDefaults.outputPrice?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.outputPrice = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>Output Price / 1M tokens</span>
								</VSCodeTextField>
							</div>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.temperature
											? apiConfiguration.openAiModelInfo.temperature.toString()
											: openAiModelInfoSaneDefaults.temperature?.toString()
									}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }

										// Check if the input ends with a decimal point or has trailing zeros after decimal
										const value = input.target.value
										const shouldPreserveFormat =
											value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

										modelInfo.temperature =
											value === ""
												? openAiModelInfoSaneDefaults.temperature
												: shouldPreserveFormat
													? value // Keep as string to preserve decimal format
													: parseFloat(value)

										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>Temperature</span>
								</VSCodeTextField>
							</div>
						</>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
					</p>
				</div>
			)}

			{apiConfiguration && selectedProvider === "bedrock" && (
				<BedrockProvider showModelOptions={showModelOptions} isPopup={isPopup} currentMode={currentMode} />
			)}

			{selectedProvider === "fireworks" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.fireworksApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("fireworksApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>Fireworks API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.fireworksApiKey && (
							<VSCodeLink
								href="https://fireworks.ai/settings/users/api-keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a Fireworks API key by signing up here.
							</VSCodeLink>
						)}
					</p>
					<VSCodeTextField
						value={apiConfiguration?.fireworksModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("fireworksModelId")}
						placeholder={"Enter Model ID..."}>
						<span style={{ fontWeight: 500 }}>Model ID</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
					</p>
					<VSCodeTextField
						value={apiConfiguration?.fireworksModelMaxCompletionTokens?.toString() || ""}
						style={{ width: "100%", marginBottom: 8 }}
						onInput={(e) => {
							const value = (e.target as HTMLInputElement).value
							if (!value) {
								return
							}
							const num = parseInt(value, 10)
							if (isNaN(num)) {
								return
							}
							handleInputChange("fireworksModelMaxCompletionTokens")({
								target: {
									value: num,
								},
							})
						}}
						placeholder={"2000"}>
						<span style={{ fontWeight: 500 }}>Max Completion Tokens</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.fireworksModelMaxTokens?.toString() || ""}
						style={{ width: "100%", marginBottom: 8 }}
						onInput={(e) => {
							const value = (e.target as HTMLInputElement).value
							if (!value) {
								return
							}
							const num = parseInt(value)
							if (isNaN(num)) {
								return
							}
							handleInputChange("fireworksModelMaxTokens")({
								target: {
									value: num,
								},
							})
						}}
						placeholder={"4000"}>
						<span style={{ fontWeight: 500 }}>Max Context Tokens</span>
					</VSCodeTextField>
				</div>
			)}

			{selectedProvider === "together" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.togetherApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("togetherApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>API Key</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.togetherModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("togetherModelId")}
						placeholder={"Enter Model ID..."}>
						<span style={{ fontWeight: 500 }}>Model ID</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
					</p>
				</div>
			)}

			{selectedProvider === "vscode-lm" && ( // CARET MODIFICATION: No change, just for context
				<div>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
						<label htmlFor="vscode-lm-model">
							<span style={{ fontWeight: 500 }}>{t("apiOptions.languageModel", "common")}</span>
						</label>
						{vsCodeLmModels.length > 0 ? (
							<VSCodeDropdown
								id="vscode-lm-model"
								value={
									apiConfiguration?.vsCodeLmModelSelector
										? `${apiConfiguration.vsCodeLmModelSelector.vendor ?? ""}/${apiConfiguration.vsCodeLmModelSelector.family ?? ""}`
										: ""
								}
								onChange={(e) => {
									const value = (e.target as HTMLInputElement).value
									if (!value) {
										return
									}
									const [vendor, family] = value.split("/")
									handleInputChange("vsCodeLmModelSelector")({
										target: {
											value: { vendor, family },
										},
									})
								}}
								style={{ width: "100%" }}>
								<VSCodeOption value="">{t("apiOptions.selectModel", "common")}</VSCodeOption>
								{vsCodeLmModels.map((model) => (
									<VSCodeOption
										key={`${model.vendor}/${model.family}`}
										value={`${model.vendor}/${model.family}`}>
										{model.vendor} - {model.family}
									</VSCodeOption>
								))}
							</VSCodeDropdown>
						) : (
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								The VS Code Language Model API allows you to run models provided by other VS Code extensions
								(including but not limited to GitHub Copilot). The easiest way to get started is to install the
								Copilot extension from the VS Marketplace and enabling Claude 3.7 Sonnet.
							</p>
						)}

						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-errorForeground)",
								fontWeight: 500,
							}}>
							Note: This is a very experimental integration and may not work as expected.
						</p>
					</DropdownContainer>
				</div>
			)}

			{selectedProvider === "lmstudio" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.lmStudioBaseUrl || ""}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("lmStudioBaseUrl")}
						placeholder={"Default: http://localhost:1234"}>
						<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.lmStudioModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("lmStudioModelId")}
						placeholder={"e.g. meta-llama-3.1-8b-instruct"}>
						<span style={{ fontWeight: 500 }}>Model ID</span>
					</VSCodeTextField>
					{lmStudioModels.length > 0 && (
						<VSCodeRadioGroup
							value={
								lmStudioModels.includes(apiConfiguration?.lmStudioModelId || "")
									? apiConfiguration?.lmStudioModelId
									: ""
							}
							onChange={(e) => {
								const value = (e.target as HTMLInputElement)?.value
								// need to check value first since radio group returns empty string sometimes
								if (value) {
									handleInputChange("lmStudioModelId")({
										target: { value },
									})
								}
							}}>
							{lmStudioModels.map((model) => (
								<VSCodeRadio key={model} value={model} checked={apiConfiguration?.lmStudioModelId === model}>
									{model}
								</VSCodeRadio>
							))}
						</VSCodeRadioGroup>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						LM Studio allows you to run models locally on your computer. For instructions on how to get started, see
						their
						<VSCodeLink href="https://lmstudio.ai/docs" style={{ display: "inline", fontSize: "inherit" }}>
							quickstart guide.
						</VSCodeLink>
						You will also need to start LM Studio's{" "}
						<VSCodeLink
							href="https://lmstudio.ai/docs/basics/server"
							style={{ display: "inline", fontSize: "inherit" }}>
							local server
						</VSCodeLink>{" "}
						feature to use it with this extension.{" "}
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
					</p>
				</div>
			)}

			{apiConfiguration && selectedProvider === "vscode-lm" && <VSCodeLmProvider currentMode={currentMode} />}

			{apiConfiguration && selectedProvider === "groq" && (
				<GroqProvider showModelOptions={showModelOptions} isPopup={isPopup} currentMode={currentMode} />
			)}
			{apiConfiguration && selectedProvider === "baseten" && (
				<BasetenProvider showModelOptions={showModelOptions} isPopup={isPopup} currentMode={currentMode} />
			)}
			{apiConfiguration && selectedProvider === "litellm" && (
				<LiteLlmProvider showModelOptions={showModelOptions} isPopup={isPopup} currentMode={currentMode} />
			)}

			{selectedProvider === "ollama" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.ollamaBaseUrl || ""}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("ollamaBaseUrl")}
						placeholder={"Default: http://localhost:11434"}>
						<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
					</VSCodeTextField>

					{/* Model selection - use filterable picker */}
					<label htmlFor="ollama-model-selection">
						<span style={{ fontWeight: 500 }}>Model</span>
					</label>
					<OllamaModelPicker
						ollamaModels={ollamaModels}
						selectedModelId={apiConfiguration?.ollamaModelId || ""}
						onModelChange={(modelId) => {
							setApiConfiguration({
								...apiConfiguration,
								ollamaModelId: modelId,
							})
						}}
						placeholder={ollamaModels.length > 0 ? "Search and select a model..." : "e.g. llama3.1"}
					/>

					{/* Show status message based on model availability */}
					{ollamaModels.length === 0 && (
						<p
							style={{
								fontSize: "12px",
								marginTop: "3px",
								color: "var(--vscode-descriptionForeground)",
								fontStyle: "italic",
							}}>
							Unable to fetch models from Ollama server. Please ensure Ollama is running and accessible, or enter
							the model ID manually above.
						</p>
					)}

					<VSCodeTextField
						value={apiConfiguration?.ollamaApiOptionsCtxNum || "32768"}
						style={{ width: "100%" }}
						onInput={handleInputChange("ollamaApiOptionsCtxNum")}
						placeholder={"e.g. 32768"}>
						<span style={{ fontWeight: 500 }}>Model Context Window</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						Ollama allows you to run models locally on your computer. For instructions on how to get started, see
						their{" "}
						<VSCodeLink
							href="https://github.com/ollama/ollama/blob/main/README.md"
							style={{ display: "inline", fontSize: "inherit" }}>
							quickstart guide.
						</VSCodeLink>{" "}
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
					</p>
				</div>
			)}

			{selectedProvider === "nebius" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.nebiusApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("nebiusApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>Nebius API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.{" "}
						{!apiConfiguration?.nebiusApiKey && (
							<VSCodeLink
								href="https://studio.nebius.com/settings/api-keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a Nebius API key by signing up here.{" "}
							</VSCodeLink>
						)}
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
					</p>
				</div>
			)}

			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}

			{selectedProvider === "xai" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.xaiApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("xaiApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>X AI API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>{t("apiOptions.note", "common")}</span>{" "}
							{t("apiOptions.caretComplexPrompts", "common")})
						</span>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.xaiApiKey && (
							<VSCodeLink href="https://x.ai" style={{ display: "inline", fontSize: "inherit" }}>
								You can get an X AI API key by signing up here.
							</VSCodeLink>
						)}
					</p>
					{/* Note: To fully implement this, you would need to add a handler in ClineProvider.ts */}
					{/* {apiConfiguration?.xaiApiKey && (
						<button
							onClick={() => {
								vscode.postMessage({
									type: "requestXAIModels",
									text: apiConfiguration?.xaiApiKey,
								})
							}}
							style={{ margin: "5px 0 0 0" }}
							className="vscode-button">
							Fetch Available Models
						</button>
					)} */}
				</div>
			)}

			{selectedProvider === "sambanova" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.sambanovaApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("sambanovaApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>SambaNova API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.sambanovaApiKey && (
							<VSCodeLink
								href="https://docs.sambanova.ai/cloud/docs/get-started/overview"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a SambaNova API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "cerebras" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.cerebrasApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("cerebrasApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>Cerebras API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.cerebrasApiKey && (
							<VSCodeLink
								href="https://cloud.cerebras.ai/"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a Cerebras API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "sapaicore" && (
				<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
					<VSCodeTextField
						value={apiConfiguration?.sapAiCoreClientId || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("sapAiCoreClientId")}
						placeholder="Enter AI Core Client Id...">
						<span style={{ fontWeight: 500 }}>AI Core Client Id</span>
					</VSCodeTextField>
					{apiConfiguration?.sapAiCoreClientId && (
						<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
							Client Id is set. To change it, please re-enter the value.
						</p>
					)}
					<VSCodeTextField
						value={apiConfiguration?.sapAiCoreClientSecret ? "********" : ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("sapAiCoreClientSecret")}
						placeholder="Enter AI Core Client Secret...">
						<span style={{ fontWeight: 500 }}>AI Core Client Secret</span>
					</VSCodeTextField>
					{apiConfiguration?.sapAiCoreClientSecret && (
						<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
							Client Secret is set. To change it, please re-enter the value.
						</p>
					)}
					<VSCodeTextField
						value={apiConfiguration?.sapAiCoreBaseUrl || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("sapAiCoreBaseUrl")}
						placeholder="Enter AI Core Base URL...">
						<span style={{ fontWeight: 500 }}>AI Core Base URL</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.sapAiCoreTokenUrl || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("sapAiCoreTokenUrl")}
						placeholder="Enter AI Core Auth URL...">
						<span style={{ fontWeight: 500 }}>AI Core Auth URL</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.sapAiResourceGroup || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("sapAiResourceGroup")}
						placeholder="Enter AI Core Resource Group...">
						<span style={{ fontWeight: 500 }}>AI Core Resource Group</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						These credentials are stored locally and only used to make API requests from this extension.
						<VSCodeLink
							href="https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/access-sap-ai-core-via-api"
							style={{ display: "inline" }}>
							You can find more information about SAP AI Core API access here.
						</VSCodeLink>
					</p>
				</div>
			)}

			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}

			{selectedProvider === "ollama" && showModelOptions && (
				<>
					<VSCodeTextField
						value={apiConfiguration?.requestTimeoutMs ? apiConfiguration.requestTimeoutMs.toString() : "30000"}
						style={{ width: "100%" }}
						onInput={(e: any) => {
							const value = e.target.value
							// Convert to number, with validation
							const numValue = parseInt(value, 10)
							if (!isNaN(numValue) && numValue > 0) {
								setApiConfiguration({
									...apiConfiguration,
									requestTimeoutMs: numValue,
								})
							}
						}}
						placeholder="Default: 30000 (30 seconds)">
						<span style={{ fontWeight: 500 }}>Request Timeout (ms)</span>
					</VSCodeTextField>
					<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
						Maximum time in milliseconds to wait for API responses before timing out.
					</p>
				</>
			)}

			{selectedProvider === "openrouter" && showModelOptions && (
				<>
					<VSCodeCheckbox
						style={{ marginTop: -10 }}
						checked={providerSortingSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setProviderSortingSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									openRouterProviderSorting: "",
								})
							}
						}}>
						Sort underlying provider routing
					</VSCodeCheckbox>

					{providerSortingSelected && (
						<div style={{ marginBottom: -6 }}>
							<DropdownContainer className="dropdown-container" zIndex={OPENROUTER_MODEL_PICKER_Z_INDEX + 1}>
								<VSCodeDropdown
									style={{ width: "100%", marginTop: 3 }}
									value={apiConfiguration?.openRouterProviderSorting}
									onChange={(e: any) => {
										setApiConfiguration({
											...apiConfiguration,
											openRouterProviderSorting: e.target.value,
										})
									}}>
									<VSCodeOption value="">Default</VSCodeOption>
									<VSCodeOption value="price">Price</VSCodeOption>
									<VSCodeOption value="throughput">Throughput</VSCodeOption>
									<VSCodeOption value="latency">Latency</VSCodeOption>
								</VSCodeDropdown>
							</DropdownContainer>
							<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
								{!apiConfiguration?.openRouterProviderSorting &&
									"Default behavior is to load balance requests across providers (like AWS, Google Vertex, Anthropic), prioritizing price while considering provider uptime"}
								{apiConfiguration?.openRouterProviderSorting === "price" &&
									"Sort providers by price, prioritizing the lowest cost provider"}
								{apiConfiguration?.openRouterProviderSorting === "throughput" &&
									"Sort providers by throughput, prioritizing the provider with the highest throughput (may increase cost)"}
								{apiConfiguration?.openRouterProviderSorting === "latency" &&
									"Sort providers by response time, prioritizing the provider with the lowest latency"}
							</p>
						</div>
					)}
				</>
			)}

			{/* CARET MODIFICATION: Caret 프로바이더 전용 모델 버튼 2개 */}
			{selectedProvider === "caret" && showModelOptions && (
				<>
					<div style={{ marginBottom: "8px" }}>
						<label>
							<span style={{ fontWeight: 500 }}>{t("caretProvider.modelLabel", "common")}</span>
						</label>
					</div>

					{/* CARET MODIFICATION: 반응형 모델 선택 버튼 2개 - 1920*1080에서 2열 유지 */}
					<div
						style={{
							display: "flex",
							flexDirection: width >= 1200 ? "row" : "column",
							gap: "4px",
							marginBottom: "8px",
						}}>
						{/* Gemini Pro 모델 버튼 */}
						<div
							onClick={() => handleInputChange("apiModelId")({ target: { value: "gemini-2.5-pro-preview-06-05" } })}
							style={{
								padding: "6px 8px",
								border:
									selectedModelId === "gemini-2.5-pro-preview-06-05"
										? "1px solid var(--vscode-textLink-foreground)"
										: "1px solid var(--vscode-widget-border)",
								borderRadius: "4px",
								cursor: "pointer",
								opacity: selectedModelId === "gemini-2.5-pro-preview-06-05" ? 1 : 0.6,
								backgroundColor:
									selectedModelId === "gemini-2.5-pro-preview-06-05"
										? "var(--vscode-list-activeSelectionBackground)"
										: "transparent",
								// CARET MODIFICATION: 반응형 폭 조정
								flex: width >= 1200 ? "1" : "none",
							}}
							onMouseEnter={(e) => {
								if (selectedModelId !== "gemini-2.5-pro-preview-06-05") {
									e.currentTarget.style.opacity = "0.8"
								}
							}}
							onMouseLeave={(e) => {
								if (selectedModelId !== "gemini-2.5-pro-preview-06-05") {
									e.currentTarget.style.opacity = "0.6"
								}
							}}>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
								<div style={{ fontWeight: 500, fontSize: "12px" }}>
									{t("caretProvider.geminiProModel", "common")}
								</div>
								<span
									style={{
										fontSize: "10px",
										color: "var(--vscode-textLink-foreground)",
										textTransform: "uppercase",
										fontWeight: 500,
									}}>
									{t("caretProvider.bestLabel", "common")}
								</span>
							</div>
							<div
								style={{
									fontSize: "11px",
									color: "var(--vscode-descriptionForeground)",
									marginTop: "2px",
								}}>
								{t("caretProvider.geminiProDescription", "common")}
							</div>
						</div>

						{/* Gemini Flash 모델 버튼 */}
						<div
							onClick={() =>
								handleInputChange("apiModelId")({ target: { value: "gemini-2.5-flash-preview-05-20" } })
							}
							style={{
								padding: "6px 8px",
								border:
									selectedModelId === "gemini-2.5-flash-preview-05-20"
										? "1px solid var(--vscode-textLink-foreground)"
										: "1px solid var(--vscode-widget-border)",
								borderRadius: "4px",
								cursor: "pointer",
								opacity: selectedModelId === "gemini-2.5-flash-preview-05-20" ? 1 : 0.6,
								backgroundColor:
									selectedModelId === "gemini-2.5-flash-preview-05-20"
										? "var(--vscode-list-activeSelectionBackground)"
										: "transparent",
								// CARET MODIFICATION: 반응형 폭 조정
								flex: width >= 400 ? "1" : "none",
							}}
							onMouseEnter={(e) => {
								if (selectedModelId !== "gemini-2.5-flash-preview-05-20") {
									e.currentTarget.style.opacity = "0.8"
								}
							}}
							onMouseLeave={(e) => {
								if (selectedModelId !== "gemini-2.5-flash-preview-05-20") {
									e.currentTarget.style.opacity = "0.6"
								}
							}}>
							<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
								<div style={{ fontWeight: 500, fontSize: "12px" }}>
									{t("caretProvider.geminiFlashModel", "common")}
								</div>
								<span
									style={{
										fontSize: "10px",
										color: "var(--vscode-textLink-foreground)",
										textTransform: "uppercase",
										fontWeight: 500,
									}}>
									{t("caretProvider.valueLabel", "common")}
								</span>
							</div>
							<div
								style={{
									fontSize: "11px",
									color: "var(--vscode-descriptionForeground)",
									marginTop: "2px",
								}}>
								{t("caretProvider.geminiFlashDescription", "common")}
							</div>
						</div>
					</div>
				</>
			)}

			{/* CARET MODIFICATION: Caret 프로바이더에도 ModelInfoView 표시 */}
			{selectedProvider === "caret" && showModelOptions && selectedModelId && (
				<ModelInfoView
					selectedModelId={selectedModelId}
					modelInfo={selectedModelInfo}
					isDescriptionExpanded={isDescriptionExpanded}
					setIsDescriptionExpanded={setIsDescriptionExpanded}
					isPopup={isPopup}
				/>
			)}

			{selectedProvider !== "openrouter" &&
				selectedProvider !== "caret" &&
				selectedProvider !== "openai" &&
				selectedProvider !== "ollama" &&
				selectedProvider !== "lmstudio" &&
				selectedProvider !== "vscode-lm" &&
				selectedProvider !== "litellm" &&
				selectedProvider !== "requesty" &&
				selectedProvider !== "bedrock" &&
				showModelOptions && (
					<>
						<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
							<label htmlFor="model-id">
								<span style={{ fontWeight: 500 }}>Model</span>
							</label>
							{selectedProvider === "anthropic" && createDropdown(anthropicModels)}
							{selectedProvider === "vertex" &&
								createDropdown(apiConfiguration?.vertexRegion === "global" ? vertexGlobalModels : vertexModels)}
							{selectedProvider === "gemini" && createDropdown(geminiModels)}
							{selectedProvider === "openai-native" && createDropdown(openAiNativeModels)}
							{selectedProvider === "deepseek" && createDropdown(deepSeekModels)}
							{selectedProvider === "qwen" &&
								createDropdown(
									apiConfiguration?.qwenApiLine === "china" ? mainlandQwenModels : internationalQwenModels,
								)}
							{selectedProvider === "doubao" && createDropdown(doubaoModels)}
							{selectedProvider === "mistral" && createDropdown(mistralModels)}
							{selectedProvider === "asksage" && createDropdown(askSageModels)}
							{selectedProvider === "xai" && createDropdown(xaiModels)}
							{selectedProvider === "sambanova" && createDropdown(sambanovaModels)}
							{selectedProvider === "cerebras" && createDropdown(cerebrasModels)}
							{selectedProvider === "nebius" && createDropdown(nebiusModels)}
							{selectedProvider === "sapaicore" && createDropdown(sapAiCoreModels)}
						</DropdownContainer>

						{SUPPORTED_THINKING_MODELS[selectedProvider]?.includes(selectedModelId) && (
							<ThinkingBudgetSlider
								apiConfiguration={apiConfiguration}
								setApiConfiguration={setApiConfiguration}
								maxBudget={selectedModelInfo.thinkingConfig?.maxBudget}
							/>
						)}

						{selectedProvider === "xai" && selectedModelId.includes("3-mini") && (
							<>
								<VSCodeCheckbox
									style={{ marginTop: 0 }}
									checked={reasoningEffortSelected}
									onChange={(e: any) => {
										const isChecked = e.target.checked === true
										setReasoningEffortSelected(isChecked)
										if (!isChecked) {
											setApiConfiguration({
												...apiConfiguration,
												reasoningEffort: "",
											})
										}
									}}>
									Modify reasoning effort
								</VSCodeCheckbox>

								{reasoningEffortSelected && (
									<div>
										<label htmlFor="reasoning-effort-dropdown">
											<span style={{}}>Reasoning Effort</span>
										</label>
										<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 100}>
											<VSCodeDropdown
												id="reasoning-effort-dropdown"
												style={{ width: "100%", marginTop: 3 }}
												value={apiConfiguration?.reasoningEffort || "high"}
												onChange={(e: any) => {
													setApiConfiguration({
														...apiConfiguration,
														reasoningEffort: e.target.value,
													})
												}}>
												<VSCodeOption value="low">low</VSCodeOption>
												<VSCodeOption value="high">high</VSCodeOption>
											</VSCodeDropdown>
										</DropdownContainer>
										<p
											style={{
												fontSize: "12px",
												marginTop: 3,
												marginBottom: 0,
												color: "var(--vscode-descriptionForeground)",
											}}>
											High effort may produce more thorough analysis but takes longer and uses more tokens.
										</p>
									</div>
								)}
							</>
						)}
						{(selectedProvider as ApiProvider) !== "caret" && ( // CARET MODIFICATION: Conditionally render ModelInfoView for non-Caret providers
							<ModelInfoView
								selectedModelId={selectedModelId}
								modelInfo={selectedModelInfo}
								isDescriptionExpanded={isDescriptionExpanded}
								setIsDescriptionExpanded={setIsDescriptionExpanded}
								isPopup={isPopup}
							/>
						)}
					</>
				)}

			{selectedProvider === "openrouter" && showModelOptions && <OpenRouterModelPicker isPopup={isPopup} />}
			{selectedProvider === "requesty" && showModelOptions && <RequestyModelPicker isPopup={isPopup} />}

