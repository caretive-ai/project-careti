import { StringRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import Fuse from "fuse.js"
import { KeyboardEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInterval } from "react-use"
import styled from "styled-components"
// CARETI MODIFICATION: Import i18n context for language reactivity
import { useCaretiI18nContext } from "@/careti/context/CaretiI18nContext"
// CARETI MODIFICATION: Import i18n
import { t } from "@/careti/utils/i18n"
import { normalizeApiConfiguration } from "@/components/settings/utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { highlight } from "../history/HistoryView"
import { OPENROUTER_MODEL_PICKER_Z_INDEX } from "./OpenRouterModelPicker"
import { AnthropicProvider } from "./providers/AnthropicProvider"
import { AskSageProvider } from "./providers/AskSageProvider"
import { BasetenProvider } from "./providers/BasetenProvider"
import { BedrockProvider } from "./providers/BedrockProvider"
import { BizRouterProvider } from "./providers/BizRouterProvider"
import { CaretiProvider } from "./providers/CaretiProvider"
import { CerebrasProvider } from "./providers/CerebrasProvider"
import { ClaudeCodeProvider } from "./providers/ClaudeCodeProvider"
import { ClineProvider } from "./providers/ClineProvider"
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
// CARETI MODIFICATION: Add Naver Cloud provider
import { NaverCloudProvider } from "./providers/NaverCloudProvider"
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
// CARETI MODIFICATION: Add Upstage provider
import { UpstageProvider } from "./providers/UpstageProvider"
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
	// CARETI MODIFICATION: Get featureConfig from ExtensionState instead of getCurrentFeatureConfig
	const { apiConfiguration, featureConfig } = useExtensionState()

	// CARETI MODIFICATION: Use i18n context to detect language changes
	const { language } = useCaretiI18nContext()

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
		// CARETI MODIFICATION: Debug logging for provider options
		console.log("[ApiOptions] providerOptions useMemo - featureConfig:", featureConfig ? "exists" : "null")

		// CARETI MODIFICATION: Restore original Cline provider list, add Careti provider (Cline always visible)
		if (!featureConfig) {
			// featureConfig 미도착 시에도 기본 Careti/Cline 선택 가능하도록 안전값 제공
			return [
				{ value: "cline", label: t("providers.cline.name", "settings") },
				{ value: "careti", label: t("providers.careti.name", "settings") },
			]
		}

		// CARETI MODIFICATION: Sovereign Cloud - Provider country flags
		// 프로바이더 국가 = UI 언어 지원 원칙
		const providerCountryFlags: Record<string, string> = {
			// 🇺🇸 United States
			anthropic: "🇺🇸",
			"openai-native": "🇺🇸",
			"claude-code": "🇺🇸",
			cline: "🇺🇸",
			xai: "🇺🇸",
			groq: "🇺🇸",
			fireworks: "🇺🇸",
			together: "🇺🇸",
			cerebras: "🇺🇸",
			asksage: "🇺🇸",
			sambanova: "🇺🇸",
			"vercel-ai-gateway": "🇺🇸",
			openrouter: "🇺🇸",
			baseten: "🇺🇸",
			huggingface: "🇺🇸",
			// 🇰🇷 Korea
			upstage: "🇰🇷",
			"naver-cloud": "🇰🇷",
			bizrouter: "🇰🇷",
			careti: "🇰🇷",
			// 🇨🇳 China
			qwen: "🇨🇳",
			"qwen-code": "🇨🇳",
			doubao: "🇨🇳",
			deepseek: "🇨🇳",
			moonshot: "🇨🇳",
			"huawei-cloud-maas": "🇨🇳",
			minimax: "🇨🇳",
			zai: "🇨🇳", // Zhipu AI (智谱AI)
			dify: "🇨🇳", // Dify.ai (中国)
			// 🇯🇵 Japan
			// (현재 없음)
			// 🇫🇷 France
			mistral: "🇫🇷",
			// 🇩🇪 Germany
			sapaicore: "🇩🇪",
			// 🇷🇺 Russia
			nebius: "🇷🇺",
			// 🌐 Global Cloud
			bedrock: "☁️",
			vertex: "☁️",
			gemini: "☁️",
			// 💻 Local
			ollama: "💻",
			lmstudio: "💻",
			"vscode-lm": "💻",
			// 🔧 Gateway/Proxy
			litellm: "🔧",
			openai: "🔧", // OpenRouter compatible
			requesty: "🔧",
		}

		// CARETI MODIFICATION: Regional featured providers (언어별 우선 표시)
		const regionalFeaturedProviders: Record<string, string[]> = {
			ko: ["upstage", "naver-cloud", "bizrouter"], // 🇰🇷 한국
			zh: ["qwen", "doubao", "deepseek", "moonshot", "huawei-cloud-maas"], // 🇨🇳 중국
			ja: [], // 🇯🇵 일본 (현재 없음)
			fr: ["mistral"], // 🇫🇷 프랑스
			de: ["sapaicore"], // 🇩🇪 독일
			ru: ["nebius"], // 🇷🇺 러시아
			en: [], // 🇺🇸 영어 (글로벌 기본)
		}

		// Deprecated: Use providerCountryFlags instead
		const regionalFlags: Record<string, string> = {
			ko: "🇰🇷",
			zh: "🇨🇳",
			fr: "🇫🇷",
			de: "🇩🇪",
			ru: "🇷🇺",
		}

		// Get current language code (ko, zh, ja, en, fr, de, ru)
		const langCode = language?.substring(0, 2) || "en"
		const featuredProviders = regionalFeaturedProviders[langCode] || []

		// Helper function to add country flag and NEW badge to provider
		const getProviderLabel = (providerId: string, baseName: string, isNew?: boolean) => {
			const countryFlag = providerCountryFlags[providerId] || ""
			let label = baseName
			// 모든 프로바이더에 국가/타입 플래그 표시
			if (countryFlag) {
				label = `${countryFlag} ${label}`
			}
			if (isNew) {
				label = `${label} ✨NEW`
			}
			return label
		}

		// CARETI MODIFICATION: NEW badge providers (appear at top of their section)
		const newProviders = new Set(["zai", "upstage", "naver-cloud"])

		// CARETI MODIFICATION: Base provider list (global order)
		const allProviders = [
			// 1. Careti (if enabled)
			...(featureConfig.enableCaretAccountFeatures
				? [{ value: "careti", label: t("providers.careti.name", "settings") }]
				: []),
			// 2. Cline (always available - login/voice)
			{ value: "cline", label: t("providers.cline.name", "settings") },
			// 3. Regional featured providers will be inserted here dynamically
			// 4. Global major AI providers
			{ value: "anthropic", label: t("providers.anthropic.name", "settings") },
			{ value: "gemini", label: t("providers.gemini.name", "settings") },
			{ value: "openai-native", label: t("providers.openai-native.name", "settings") },
			{ value: "xai", label: t("providers.xai.name", "settings") },
			{ value: "groq", label: t("providers.groq.name", "settings") },
			// 5. Local LLM providers
			{ value: "ollama", label: t("providers.ollama.name", "settings") },
			{ value: "lmstudio", label: t("providers.lmstudio.name", "settings") },
			{ value: "vscode-lm", label: t("providers.vscode-lm.name", "settings") },
			// 6. Other providers
			{ value: "zai", label: t("providers.zai.name", "settings") },
			{ value: "openrouter", label: t("providers.openrouter.name", "settings") },
			{ value: "deepseek", label: t("providers.deepseek.name", "settings") },
			{ value: "bedrock", label: t("providers.bedrock.name", "settings") },
			{ value: "vertex", label: t("providers.vertex.name", "settings") },
			{ value: "openai", label: t("providers.openai.name", "settings") },
			{ value: "litellm", label: t("providers.litellm.name", "settings") },
			{ value: "claude-code", label: t("providers.claude-code.name", "settings") },
			{ value: "mistral", label: t("providers.mistral.name", "settings") },
			{ value: "cerebras", label: t("providers.cerebras.name", "settings") },
			{ value: "vercel-ai-gateway", label: t("providers.vercel-ai-gateway.name", "settings") },
			{ value: "baseten", label: t("providers.baseten.name", "settings") },
			{ value: "requesty", label: t("providers.requesty.name", "settings") },
			{ value: "fireworks", label: t("providers.fireworks.name", "settings") },
			{ value: "together", label: t("providers.together.name", "settings") },
			{ value: "qwen", label: t("providers.qwen.name", "settings") },
			{ value: "qwen-code", label: t("providers.qwen-code.name", "settings") },
			{ value: "doubao", label: t("providers.doubao.name", "settings") },
			{ value: "moonshot", label: t("providers.moonshot.name", "settings") },
			{ value: "huggingface", label: t("providers.huggingface.name", "settings") },
			{ value: "nebius", label: t("providers.nebius.name", "settings") },
			{ value: "asksage", label: t("providers.asksage.name", "settings") },
			{ value: "sambanova", label: t("providers.sambanova.name", "settings") },
			{ value: "huawei-cloud-maas", label: t("providers.huawei-cloud-maas.name", "settings") },
			{ value: "sapaicore", label: t("providers.sap-ai-core.name", "settings") },
			{ value: "dify", label: t("providers.dify.name", "settings") },
			// Korean providers (will be moved to featured section for ko)
			{ value: "upstage", label: t("providers.upstage.name", "settings") },
			{ value: "naver-cloud", label: t("providers.naver-cloud.name", "settings") },
			{ value: "bizrouter", label: t("providers.bizrouter.name", "settings") },
		]

		// CARETI MODIFICATION: Build final provider list
		// Rule: NEW > Section priority, NEW providers follow section order among themselves
		const processedOptions: { value: string; label: string }[] = []
		const seen = new Set<string>()

		// Helper to get provider with proper label (country flag + NEW badge)
		const getProcessedProvider = (providerId: string) => {
			const provider = allProviders.find((p) => p.value === providerId)
			if (!provider) return null
			const isNew = newProviders.has(providerId)
			// 모든 프로바이더에 국가/타입 플래그 적용
			return {
				value: providerId,
				label: getProviderLabel(providerId, provider.label, isNew),
			}
		}

		// 1. First, add Careti and Cline (fixed at top, with country flags)
		for (const option of allProviders) {
			if ((option.value === "careti" || option.value === "cline") && !seen.has(option.value)) {
				seen.add(option.value)
				const processed = getProcessedProvider(option.value)
				if (processed) processedOptions.push(processed)
			}
		}

		// 2. Build section-ordered list (excluding Careti/Cline)
		// Section order: Regional Featured → Global Major → Local LLM → Others
		const sectionOrderedProviders: string[] = [
			// Regional featured providers
			...featuredProviders,
			// Global major AI
			"anthropic",
			"gemini",
			"openai-native",
			"xai",
			"groq",
			// Local LLM
			"ollama",
			"lmstudio",
			"vscode-lm",
			// Others (rest from allProviders in order)
			...allProviders
				.filter((p) => !["careti", "cline"].includes(p.value))
				.filter((p) => !featuredProviders.includes(p.value))
				.filter(
					(p) =>
						!["anthropic", "gemini", "openai-native", "xai", "groq", "ollama", "lmstudio", "vscode-lm"].includes(
							p.value,
						),
				)
				.map((p) => p.value),
		]

		// 3. Add NEW providers first (following section order)
		for (const providerId of sectionOrderedProviders) {
			if (!seen.has(providerId) && newProviders.has(providerId)) {
				seen.add(providerId)
				const processed = getProcessedProvider(providerId)
				if (processed) processedOptions.push(processed)
			}
		}

		// 4. Add non-NEW providers (following section order)
		for (const providerId of sectionOrderedProviders) {
			if (!seen.has(providerId)) {
				seen.add(providerId)
				const processed = getProcessedProvider(providerId)
				if (processed) processedOptions.push(processed)
			}
		}

		const firstProvider = featureConfig.firstListingProvider
		if (firstProvider) {
			const firstProviderIndex = processedOptions.findIndex((option) => option.value === firstProvider)
			if (firstProviderIndex > 0) {
				const [firstProviderOption] = processedOptions.splice(firstProviderIndex, 1)
				processedOptions.unshift(firstProviderOption)
			}
		}

		// CARETI MODIFICATION: Show only the default provider but still allow Cline for login access
		if (featureConfig.showOnlyDefaultProvider) {
			const defaultProvider = featureConfig.defaultProvider
			const allowed = new Set([defaultProvider, "cline"])
			return processedOptions.filter((option) => allowed.has(option.value))
		}

		return processedOptions
	}, [language, featureConfig])

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
		// CARETI MODIFICATION: Debug logging
		console.log("[ApiOptions] searchableItems useMemo - providerOptions count:", providerOptions?.length)
		if (!providerOptions) {
			console.error("[ApiOptions] providerOptions is undefined!")
			return []
		}
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
		// CARETI MODIFICATION: Debug logging
		console.log("[ApiOptions] providerSearchResults useMemo - searchTerm:", searchTerm, "currentProviderLabel:", currentProviderLabel)
		try {
			if (!searchTerm || searchTerm === currentProviderLabel) {
				console.log("[ApiOptions] Returning searchableItems, count:", searchableItems?.length)
				return searchableItems || []
			}
			const results = fuse.search(searchTerm)
			console.log("[ApiOptions] Fuse search results count:", results?.length)
			const highlighted = highlight(results, "provider-item-highlight")
			console.log("[ApiOptions] Highlighted results count:", highlighted?.length)
			return highlighted || []
		} catch (e) {
			console.error("[ApiOptions] Error in providerSearchResults useMemo:", e)
			return searchableItems || []
		}
	}, [searchableItems, searchTerm, fuse, currentProviderLabel])

	const handleProviderChange = async (newProvider: string) => {
		// CARETI MODIFICATION: Add logging for provider changes
		console.log(`🔄 [ApiOptions] Provider change: "${selectedProvider}" → "${newProvider}" (mode: ${currentMode})`)
		try {
			await handleModeFieldChange({ plan: "planModeApiProvider", act: "actModeApiProvider" }, newProvider as any, currentMode)
			console.log(`✅ [ApiOptions] Provider change successful`)
		} catch (e) {
			console.error(`❌ [ApiOptions] Provider change failed:`, e)
		}
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

				{selectedProvider === "cline" && (
					<ClineProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
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

				{apiConfiguration && selectedProvider === "bizrouter" && (
					<BizRouterProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "careti" && (
					<CaretiProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} /> // careti
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

				{apiConfiguration && selectedProvider === "upstage" && (
					<UpstageProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
				)}

				{apiConfiguration && selectedProvider === "naver-cloud" && (
					<NaverCloudProvider currentMode={currentMode} isPopup={isPopup} showModelOptions={showModelOptions} />
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
