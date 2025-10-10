import { StringRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInterval } from "react-use"
import styled from "styled-components"
// CARET MODIFICATION: Import i18n context for language reactivity
import { useCaretI18nContext } from "@/caret/context/CaretI18nContext"
// CARET MODIFICATION: Import i18n
import { t } from "@/caret/utils/i18n"
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { highlight } from "../history/HistoryView"
import { OPENROUTER_MODEL_PICKER_Z_INDEX } from "./OpenRouterModelPicker"
import { AnthropicProvider } from "./providers/AnthropicProvider"
import { AskSageProvider } from "./providers/AskSageProvider"
import { BasetenProvider } from "./providers/BasetenProvider"
import { BedrockProvider } from "./providers/BedrockProvider"
import { CaretProvider } from "./providers/CaretProvider"
import { CerebrasProvider } from "./providers/CerebrasProvider"
import { ClaudeCodeProvider } from "./providers/ClaudeCodeProvider"
// CARET MODIFICATION: Hide Cline Provider and use Caret Provider instead
// import { ClineProvider } from "./providers/ClineProvider"
import { DeepSeekProvider } from "./providers/DeepSeekProvider"
import { DifyProvider } from "./providers/DifyProvider"
import { DoubaoProvider } from "./providers/DoubaoProvider"
import { FireworksProvider } from "./providers/FireworksProvider"
import { GeminiProvider } from "./providers/GeminiProvider"
import { GroqProvider } from "./providers/GroqProvider"
import { HuaweiCloudMaasProvider } from "./providers/HuaweiCloudMaasProvider"
import { HuggingFaceProvider } from "./providers/HuggingFaceProvider"
import { LiteLlmProvider } from "./providers/LiteLlmProvider"
import { LMStudioProvider } from "./providers/LMStudioProvider"
import { MistralProvider } from "./providers/MistralProvider"
import { MoonshotProvider } from "./providers/MoonshotProvider"
import { NebiusProvider } from "./providers/NebiusProvider"
import { OllamaProvider } from "./providers/OllamaProvider"
import { OpenAICompatibleProvider } from "./providers/OpenAICompatible"
import { OpenAINativeProvider } from "./providers/OpenAINative"
import { OpenRouterProvider } from "./providers/OpenRouterProvider"
import { QwenCodeProvider } from "./providers/QwenCodeProvider"
import { QwenProvider } from "./providers/QwenProvider"
import { RequestyProvider } from "./providers/RequestyProvider"
import { SambanovaProvider } from "./providers/SambanovaProvider"
import { SapAiCoreProvider } from "./providers/SapAiCoreProvider"
import { TogetherProvider } from "./providers/TogetherProvider"
import { VercelAIGatewayProvider } from "./providers/VercelAIGatewayProvider"
import { VertexProvider } from "./providers/VertexProvider"
import { VSCodeLmProvider } from "./providers/VSCodeLmProvider"
import { XaiProvider } from "./providers/XaiProvider"
import { ZAiProvider } from "./providers/ZAiProvider"
import { PlanActSeparateOverrideContext, useApiConfigurationHandlers } from "./utils/useApiConfigurationHandlers"

interface ApiOptionsProps {
	showModelOptions: boolean
	apiErrorMessage?: string
	modelIdErrorMessage?: string
	isPopup?: boolean
	currentMode: Mode
	forcePlanActSeparate?: boolean
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

const ApiOptions = ({
	showModelOptions,
	apiErrorMessage,
	modelIdErrorMessage,
	isPopup,
	currentMode,
	forcePlanActSeparate,
}: ApiOptionsProps) => {
	// Use full context state for immediate save payload
	const { apiConfiguration, featureConfig } = useExtensionState()

	// CARET MODIFICATION: Use i18n context to detect language changes
	const { language } = useCaretI18nContext()

	const { selectedProvider } = normalizeApiConfiguration(apiConfiguration, currentMode)

	const { handleModeFieldChange } = useApiConfigurationHandlers({ forceSeparate: forcePlanActSeparate })

	const [_ollamaModels, setOllamaModels] = useState<string[]>([])

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

	// Provider search state
	const [searchTerm, setSearchTerm] = useState("")
	const [isDropdownVisible, setIsDropdownVisible] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(-1)
	const dropdownRef = useRef<HTMLDivElement>(null)
	const itemRefs = useRef<(HTMLDivElement | null)[]>([])
	const dropdownListRef = useRef<HTMLDivElement>(null)

	const providerOptions = useMemo(() => {
		// CARET MODIFICATION: Restore original Cline provider list, add Caret provider, hide Cline by default
		const showClineProvider = typeof process !== "undefined" && process.env?.CARET_SHOW_CLINE_PROVIDER === "true"

		if (!featureConfig) {
			return []
		}

		const baseOptions = [
			{ value: "caret", label: t("providers.caret.name", "settings") },
			{ value: "openrouter", label: t("providers.openrouter.name", "settings") },
			{ value: "gemini", label: t("providers.gemini.name", "settings") },
			{ value: "openai", label: t("providers.openai.name", "settings") },
			{ value: "anthropic", label: t("providers.anthropic.name", "settings") },
			{ value: "bedrock", label: t("providers.bedrock.name", "settings") },
			{ value: "vscode-lm", label: t("providers.vscode-lm.name", "settings") },
			{ value: "deepseek", label: t("providers.deepseek.name", "settings") },
			{ value: "openai-native", label: t("providers.openai-native.name", "settings") },
			{ value: "ollama", label: t("providers.ollama.name", "settings") },
			{ value: "vertex", label: t("providers.vertex.name", "settings") },
			{ value: "litellm", label: t("providers.litellm.name", "settings") },
			{ value: "claude-code", label: t("providers.claude-code.name", "settings") },
			{ value: "sapaicore", label: t("providers.sap-ai-core.name", "settings") },
			{ value: "mistral", label: t("providers.mistral.name", "settings") },
			{ value: "zai", label: t("providers.zai.name", "settings") },
			{ value: "groq", label: t("providers.groq.name", "settings") },
			{ value: "cerebras", label: t("providers.cerebras.name", "settings") },
			{ value: "vercel-ai-gateway", label: t("providers.vercel-ai-gateway.name", "settings") },
			{ value: "baseten", label: t("providers.baseten.name", "settings") },
			{ value: "requesty", label: t("providers.requesty.name", "settings") },
			{ value: "fireworks", label: t("providers.fireworks.name", "settings") },
			{ value: "together", label: t("providers.together.name", "settings") },
			{ value: "qwen", label: t("providers.qwen.name", "settings") },
			{ value: "qwen-code", label: t("providers.qwen-code.name", "settings") },
			{ value: "doubao", label: t("providers.doubao.name", "settings") },
			{ value: "lmstudio", label: t("providers.lmstudio.name", "settings") },
			{ value: "moonshot", label: t("providers.moonshot.name", "settings") },
			{ value: "huggingface", label: t("providers.huggingface.name", "settings") },
			{ value: "nebius", label: t("providers.nebius.name", "settings") },
			{ value: "asksage", label: t("providers.asksage.name", "settings") },
			{ value: "xai", label: t("providers.xai.name", "settings") },
			{ value: "sambanova", label: t("providers.sambanova.name", "settings") },
			{ value: "huawei-cloud-maas", label: t("providers.huawei-cloud-maas.name", "settings") },
			{ value: "dify", label: t("providers.dify.name", "settings") },
		]

		// CARET MODIFICATION: Only show Cline provider if environment variable is set
		if (showClineProvider) {
			baseOptions.unshift({ value: "cline", label: t("providers.cline.name", "settings") })
		}

		// CARET MODIFICATION: Sort providers to show the first listing provider at the top
		const processedOptions = [...baseOptions]

		const firstProvider = featureConfig.firstListingProvider
		if (firstProvider) {
			const firstProviderIndex = processedOptions.findIndex((option) => option.value === firstProvider)
			if (firstProviderIndex > 0) {
				const [firstProviderOption] = processedOptions.splice(firstProviderIndex, 1)
				processedOptions.unshift(firstProviderOption)
			}
		}

		// CARET MODIFICATION: Show only the default provider if the flag is set
		if (featureConfig.showOnlyDefaultProvider) {
			const defaultProvider = featureConfig.defaultProvider
			const defaultProviderOption = processedOptions.find((option) => option.value === defaultProvider)
			return defaultProviderOption ? [defaultProviderOption] : []
		}

		return processedOptions
	}, [language])

	const currentProviderLabel = useMemo(() => {
		const providerInfo = providerOptions.find((option) => option.value === selectedProvider)
		return providerInfo ? providerInfo.label : selectedProvider
	}, [providerOptions, selectedProvider])

	// Sync search term with current provider when not searching
	useEffect(() => {
		if (!isDropdownVisible) {
			setSearchTerm(currentProviderLabel)
		}
	}, [currentProviderLabel, isDropdownVisible])

	const searchableItems = useMemo(() => {
		return providerOptions.map((option) => ({
			value: option.value,
			html: option.label,
		}))
	}, [providerOptions])

	const fuse = useMemo(() => {
		return new Fuse(searchableItems, {
			keys: ["html"],
			threshold: 0.3,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [searchableItems])

	const providerSearchResults = useMemo(() => {
		if (!searchTerm || searchTerm === currentProviderLabel) {
			return searchableItems
		}
		const results = fuse.search(searchTerm)
		return highlight(results, "provider-item-highlight")
	}, [searchableItems, searchTerm, fuse, currentProviderLabel])

	const handleProviderChange = (newProvider: string) => {
		// CARET MODIFICATION: Add logging for provider changes
		console.log(`🔄 [ApiOptions] Provider change: "${selectedProvider}" → "${newProvider}" (mode: ${currentMode})`)
		handleModeFieldChange({ plan: "planModeApiProvider", act: "actModeApiProvider" }, newProvider as any, currentMode)
		setIsDropdownVisible(false)
		setSelectedIndex(-1)
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (!isDropdownVisible) {
			return
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault()
				setSelectedIndex((prev) => (prev < providerSearchResults.length - 1 ? prev + 1 : prev))
				break
			case "ArrowUp":
				event.preventDefault()
				setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
				break
			case "Enter":
				event.preventDefault()
				if (selectedIndex >= 0 && selectedIndex < providerSearchResults.length) {
					handleProviderChange(providerSearchResults[selectedIndex].value)
				}
				break
			case "Escape":
				setIsDropdownVisible(false)
				setSelectedIndex(-1)
				setSearchTerm(currentProviderLabel)
				break
		}
	}

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownVisible(false)
				setSearchTerm(currentProviderLabel)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [currentProviderLabel])

	// Reset selection when search term changes
	useEffect(() => {
		setSelectedIndex(-1)
		if (dropdownListRef.current) {
			dropdownListRef.current.scrollTop = 0
		}
	}, [searchTerm])

	// Scroll selected item into view
	useEffect(() => {
		if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
			itemRefs.current[selectedIndex]?.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			})
		}
	}, [selectedIndex])

	/*
	VSCodeDropdown has an open bug where dynamically rendered options don't auto select the provided value prop. You can see this for yourself by comparing  it with normal select/option elements, which work as expected.
	https://github.com/microsoft/vscode-webview-ui-toolkit/issues/433

	In our case, when the user switches between providers, we recalculate the selectedModelId depending on the provider, the default model for that provider, and a modelId that the user may have selected. Unfortunately, the VSCodeDropdown component wouldn't select this calculated value, and would default to the first "Select a model..." option instead, which makes it seem like the model was cleared out when it wasn't.

	As a workaround, we create separate instances of the dropdown for each provider, and then conditionally render the one that matches the current provider.
	*/

	return (
		<PlanActSeparateOverrideContext.Provider value={forcePlanActSeparate}>
			<div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: isPopup ? -10 : 0 }}>
				<style>
					{`
				.provider-item-highlight {
					background-color: var(--vscode-editor-findMatchHighlightBackground);
					color: inherit;
				}
				`}
				</style>
				<DropdownContainer className="dropdown-container">
					<label htmlFor="api-provider">
						<span style={{ fontWeight: 500 }}>{t("apiOptions.apiProvider", "settings")}</span>
					</label>
					<ProviderDropdownWrapper ref={dropdownRef}>
						<VSCodeTextField
							data-testid="provider-selector-input"
							id="api-provider"
							onFocus={() => {
								setIsDropdownVisible(true)
								setSearchTerm("")
							}}
							onInput={(e) => {
								setSearchTerm((e.target as HTMLInputElement)?.value || "")
								setIsDropdownVisible(true)
							}}
							onKeyDown={handleKeyDown}
							placeholder={t("apiOptions.searchAndSelectProvider", "settings")}
							style={{
								width: "100%",
								zIndex: DROPDOWN_Z_INDEX,
								position: "relative",
								minWidth: 130,
							}}
							value={searchTerm}>
							{searchTerm && searchTerm !== currentProviderLabel && (
								<div
									aria-label={t("apiOptions.clearSearch", "settings")}
									className="input-icon-button codicon codicon-close"
									onClick={() => {
										setSearchTerm("")
										setIsDropdownVisible(true)
									}}
									slot="end"
									style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										height: "100%",
									}}
								/>
							)}
						</VSCodeTextField>
						{isDropdownVisible && (
							<ProviderDropdownList ref={dropdownListRef}>
								{providerSearchResults.map((item, index) => (
									<ProviderDropdownItem
										data-testid={`provider-option-${item.value}`}
										isSelected={index === selectedIndex}
										key={item.value}
										onClick={() => handleProviderChange(item.value)}
										onMouseEnter={() => setSelectedIndex(index)}
										ref={(el) => (itemRefs.current[index] = el)}>
										<span dangerouslySetInnerHTML={{ __html: item.html }} />
									</ProviderDropdownItem>
								))}
							</ProviderDropdownList>
						)}
					</ProviderDropdownWrapper>
				</DropdownContainer>

				{/* CARET MODIFICATION: Hide Cline Provider from UI */}
				{apiConfiguration && selectedProvider === "cline" && false && (
					<div>{t("apiOptions.clineProviderHidden", "settings")}</div>
				)}

				{apiConfiguration && selectedProvider === "asksage" && (
					<AskSageProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "anthropic" && (
					<AnthropicProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "claude-code" && (
					<ClaudeCodeProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "openai-native" && (
					<OpenAINativeProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "qwen" && (
					<QwenProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "qwen-code" && (
					<QwenCodeProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "doubao" && (
					<DoubaoProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "mistral" && (
					<MistralProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "openrouter" && (
					<OpenRouterProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "deepseek" && (
					<DeepSeekProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "together" && (
					<TogetherProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "openai" && (
					<OpenAICompatibleProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "vercel-ai-gateway" && (
					<VercelAIGatewayProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "sambanova" && (
					<SambanovaProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "bedrock" && (
					<BedrockProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "vertex" && (
					<VertexProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "gemini" && (
					<GeminiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "requesty" && (
					<RequestyProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "fireworks" && (
					<FireworksProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "vscode-lm" && <VSCodeLmProvider currentMode={currentMode} />}

				{apiConfiguration && selectedProvider === "groq" && (
					<GroqProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}
				{apiConfiguration && selectedProvider === "baseten" && (
					<BasetenProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}
				{apiConfiguration && selectedProvider === "litellm" && (
					<LiteLlmProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "caret" && (
					<CaretProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} /> // caret
				)}

				{apiConfiguration && selectedProvider === "lmstudio" && (
					<LMStudioProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "ollama" && (
					<OllamaProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "moonshot" && (
					<MoonshotProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "huggingface" && (
					<HuggingFaceProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "nebius" && (
					<NebiusProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "xai" && (
					<XaiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "cerebras" && (
					<CerebrasProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "sapaicore" && (
					<SapAiCoreProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "huawei-cloud-maas" && (
					<HuaweiCloudMaasProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "dify" && (
					<DifyProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "zai" && (
					<ZAiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
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
				{modelIdErrorMessage && (
					<p
						style={{
							margin: "-10px 0 4px 0",
							fontSize: 12,
							color: "var(--vscode-errorForeground)",
						}}>
						{modelIdErrorMessage}
					</p>
				)}
			</div>
		</PlanActSeparateOverrideContext.Provider>
	)
}

export default ApiOptions

const ProviderDropdownWrapper = styled.div`
	position: relative;
	width: 100%;
`

const ProviderDropdownList = styled.div`
	position: absolute;
	top: calc(100% - 3px);
	left: 0;
	width: calc(100% - 2px);
	max-height: 200px;
	overflow-y: auto;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-list-activeSelectionBackground);
	z-index: ${DROPDOWN_Z_INDEX - 1};
	border-bottom-left-radius: 3px;
	border-bottom-right-radius: 3px;
`

const ProviderDropdownItem = styled.div<{ isSelected: boolean }>`
	padding: 5px 10px;
	cursor: pointer;
	word-break: break-all;
	white-space: normal;

	background-color: ${({ isSelected }) => (isSelected ? "var(--vscode-list-activeSelectionBackground)" : "inherit")};

	&:hover {
		background-color: var(--vscode-list-activeSelectionBackground);
	}
`
