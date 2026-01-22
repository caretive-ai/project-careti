import { geminiModels, ModelInfo } from "@shared/api"
import { ChangeEvent, Fragment, useCallback, useState } from "react"
import styled from "styled-components"
import { t } from "@/careti/utils/i18n"
import { updateSetting } from "@/components/settings/utils/settingsHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelDescriptionMarkdown } from "../OpenRouterModelPicker"
import {
    formatPrice,
    formatTokenLimit,
    formatTokenPrice,
    hasThinkingBudget,
    supportsBrowserUse,
    supportsImages,
    supportsPromptCache,
} from "../utils/pricingUtils"

/**
 * Returns an array of formatted tier strings
 */
const formatTiers = (
	tiers: ModelInfo["tiers"],
	priceType: "inputPrice" | "outputPrice" | "cacheReadsPrice" | "cacheWritesPrice",
): JSX.Element[] => {
	if (!tiers || tiers.length === 0) {
		return []
	}

	return tiers
		.map((tier, index, arr) => {
			const prevLimit = index > 0 ? arr[index - 1].contextWindow : 0
			const price = tier[priceType]

			if (price === undefined) {
				return null
			}

			return (
				<span key={index} style={{ paddingLeft: "15px" }}>
					{formatPrice(price)}
					{t("modelInfo.tokensSuffix", "common")} (
					{tier.contextWindow === Number.POSITIVE_INFINITY || tier.contextWindow >= Number.MAX_SAFE_INTEGER ? (
						<span>
							{">"} {prevLimit.toLocaleString()}
						</span>
					) : (
						<span>
							{"<="} {tier.contextWindow?.toLocaleString()}
						</span>
					)}
					{t("modelInfo.tokensSuffix", "common")}
					{index < arr.length - 1 && <br />}
				</span>
			)
		})
		.filter((element): element is JSX.Element => element !== null)
}

/**
 * Props for the ModelInfoSupportsItem component
 */
interface ModelInfoSupportsItemProps {
	isSupported: boolean
	supportsLabel: string
	doesNotSupportLabel: string
}

/**
 * A component to show a feature support indicator with an icon
 */
const ModelInfoSupportsItem = ({ isSupported, supportsLabel, doesNotSupportLabel }: ModelInfoSupportsItemProps) => (
	<span
		style={{
			fontWeight: 500,
			color: isSupported ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)",
		}}>
		<i
			className={`codicon codicon-${isSupported ? "check" : "x"}`}
			style={{
				marginRight: 4,
				marginBottom: isSupported ? 1 : -1,
				fontSize: isSupported ? 11 : 13,
				fontWeight: 700,
				display: "inline-block",
				verticalAlign: "bottom",
			}}></i>
		{isSupported ? supportsLabel : doesNotSupportLabel}
	</span>
)

const ASPECT_RATIO_OPTIONS = ["16:9", "9:16", "4:3", "3:4", "1:1"] as const
const IMAGE_SIZE_OPTIONS = ["1K", "2K", "3K", "4K"] as const
/// CARETI MODIFICATION: Image analysis model options
// Note: gemini-3-flash-preview (without .0) is the correct model ID
const IMAGE_ANALYSIS_MODEL_OPTIONS = [
	{ value: "gemini-3-flash-preview", label: "Gemini 3 Flash" },
	{ value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
] as const

const InfoParagraph = styled.p`
	font-size: 12px;
	margin-top: 2px;
	color: var(--vscode-descriptionForeground);
`

const ImageSettingsSection = styled.div`
	margin-top: 12px;
	padding: 10px;
	border-radius: 6px;
	border: 1px solid var(--vscode-editorGroup-border);
	background-color: var(--vscode-editor-background);
`

const SectionHeader = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: var(--vscode-descriptionForeground);
	margin-bottom: 6px;
`

const ImageSettingsGrid = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
`

const ImageSettingColumn = styled.div`
	min-width: 140px;
	display: flex;
	flex-direction: column;
	gap: 4px;
`

const SettingLabel = styled.span`
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.03em;
	color: var(--vscode-descriptionForeground);
`

const SettingSelect = styled.select`
	border: 1px solid var(--vscode-editorGroup-border);
	border-radius: 4px;
	background: var(--vscode-input-background);
	color: var(--vscode-foreground);
	padding: 4px 6px;
	min-height: 30px;
	font-size: 12px;
	appearance: none;
`

/**
 * Props for the ModelInfoView component
 */
interface ModelInfoViewProps {
	selectedModelId: string
	modelInfo: ModelInfo
	isPopup?: boolean
}

/**
 * A reusable component for displaying model information
 * This component manages its own description expansion state
 */
export const ModelInfoView = ({ selectedModelId, modelInfo, isPopup }: ModelInfoViewProps) => {
	// Internal state management for description expansion
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)

	const isGemini = Object.keys(geminiModels).includes(selectedModelId)
	const hasThinkingConfig = hasThinkingBudget(modelInfo)
	const hasTiers = !!modelInfo.tiers && modelInfo.tiers.length > 0
	const { imageGenerationAspectRatio, imageGenerationSize, imageAnalysisModel, apiConfiguration, mode } = useExtensionState() // CARETI MODIFICATION: Use provider context
	// CARETI MODIFICATION: Show image settings for all providers since generate_image tool always uses Careti API
	const shouldShowImageSettings = supportsImages(modelInfo)

	// CARETI MODIFICATION: Image analysis model change handler
	const handleImageAnalysisModelChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const nextValue = event.target.value
			if (nextValue === (imageAnalysisModel ?? "")) {
				return
			}
			updateSetting("imageAnalysisModel", nextValue)
		},
		[imageAnalysisModel],
	)

	const handleAspectRatioChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const nextValue = event.target.value
			if (nextValue === (imageGenerationAspectRatio ?? "")) {
				return
			}
			updateSetting("imageGenerationAspectRatio", nextValue)
		},
		[imageGenerationAspectRatio],
	)

	const handleImageSizeChange = useCallback(
		(event: ChangeEvent<HTMLSelectElement>) => {
			const nextValue = event.target.value
			if (nextValue === (imageGenerationSize ?? "")) {
				return
			}
			updateSetting("imageGenerationSize", nextValue)
		},
		[imageGenerationSize],
	)

	// Create elements for input pricing
	const inputPriceElement = hasTiers ? (
		<Fragment key="inputPriceTiers">
			<span style={{ fontWeight: 500 }}>{t("modelInfoView.inputPrice", "settings")}:</span>
			<br />
			{formatTiers(modelInfo.tiers, "inputPrice")}
		</Fragment>
	) : modelInfo.inputPrice !== undefined && modelInfo.inputPrice > 0 ? (
		<span key="inputPrice">
			<span style={{ fontWeight: 500 }}>{t("modelInfoView.inputPrice", "settings")}:</span>{" "}
			{formatTokenPrice(modelInfo.inputPrice)}
		</span>
	) : null

	// --- Output Price Logic ---
	let outputPriceElement = null
	if (hasThinkingConfig && modelInfo.outputPrice !== undefined && modelInfo.thinkingConfig?.outputPrice !== undefined) {
		// Display both standard and thinking budget prices
		outputPriceElement = (
			<Fragment key="outputPriceConditional">
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.outputPriceStandard", "settings")}:</span>{" "}
				{formatTokenPrice(modelInfo.outputPrice)}
				<br />
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.outputPriceThinking", "settings")}:</span>{" "}
				{formatTokenPrice(modelInfo.thinkingConfig.outputPrice)}
			</Fragment>
		)
	} else if (hasTiers) {
		// Display tiered output pricing
		outputPriceElement = (
			<Fragment key="outputPriceTiers">
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.outputPrice", "settings")}:</span>
				<span style={{ fontStyle: "italic" }}> {t("modelInfoView.basedOnInputTokens", "settings")}</span>
				<br />
				{formatTiers(modelInfo.tiers, "outputPrice")}
			</Fragment>
		)
	} else if (modelInfo.outputPrice !== undefined && modelInfo.outputPrice > 0) {
		// Display single standard output price
		outputPriceElement = (
			<span key="outputPrice">
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.outputPrice", "settings")}:</span>{" "}
				{formatTokenPrice(modelInfo.outputPrice)}
			</span>
		)
	}
	// --- End Output Price Logic ---

	const infoItems = [
		modelInfo.description && (
			<ModelDescriptionMarkdown
				isExpanded={isDescriptionExpanded}
				isPopup={isPopup}
				key="description"
				markdown={modelInfo.description}
				setIsExpanded={setIsDescriptionExpanded}
			/>
		),
		<ModelInfoSupportsItem
			doesNotSupportLabel={t("modelInfoView.doesNotSupportImages", "settings")}
			isSupported={supportsImages(modelInfo)}
			key="supportsImages"
			supportsLabel={t("modelInfoView.supportsImages", "settings")}
		/>,
		<ModelInfoSupportsItem
			doesNotSupportLabel={t("modelInfoView.doesNotSupportBrowser", "settings")}
			isSupported={supportsBrowserUse(modelInfo)}
			key="supportsBrowserUse"
			supportsLabel={t("modelInfoView.supportsBrowser", "settings")}
		/>,
		!isGemini && (
			<ModelInfoSupportsItem
				doesNotSupportLabel={t("modelInfoView.doesNotSupportCache", "settings")}
				isSupported={supportsPromptCache(modelInfo)}
				key="supportsPromptCache"
				supportsLabel={t("modelInfoView.supportsCache", "settings")}
			/>
		),
		modelInfo.contextWindow !== undefined && modelInfo.contextWindow > 0 && (
			<span key="contextWindow">
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.contextWindow", "settings")}:</span>{" "}
				{formatTokenLimit(modelInfo.contextWindow)} {t("modelInfoView.tokensSuffix", "common")}
			</span>
		),
		inputPriceElement, // Add the generated input price block
		modelInfo.supportsPromptCache && modelInfo.cacheWritesPrice && (
			<span key="cacheWritesPrice">
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.cacheWritesPrice", "settings")}:</span>{" "}
				{formatTokenPrice(modelInfo.cacheWritesPrice || 0)}
			</span>
		),
		modelInfo.supportsPromptCache && modelInfo.cacheReadsPrice && (
			<span key="cacheReadsPrice">
				<span style={{ fontWeight: 500 }}>{t("modelInfoView.cacheReadsPrice", "settings")}:</span>{" "}
				{formatTokenPrice(modelInfo.cacheReadsPrice || 0)}
			</span>
		),
		outputPriceElement, // Add the generated output price block
	].filter(Boolean)

	return (
		<>
			<InfoParagraph>
				{infoItems.map((item, index) => (
					<Fragment key={index}>
						{item}
						{index < infoItems.length - 1 && <br />}
					</Fragment>
				))}
			</InfoParagraph>
			{shouldShowImageSettings && (
				<ImageSettingsSection>
					<SectionHeader>{t("modelInfoView.imageGeneration.title", "settings")}</SectionHeader>
					<ImageSettingsGrid>
						<ImageSettingColumn>
							<SettingLabel>{t("modelInfoView.imageGeneration.aspectRatio", "settings")}</SettingLabel>
							<SettingSelect onChange={handleAspectRatioChange} value={imageGenerationAspectRatio ?? ""}>
								<option value="">{t("modelInfoView.imageGeneration.auto", "settings")}</option>
								{ASPECT_RATIO_OPTIONS.map((ratio) => (
									<option key={ratio} value={ratio}>
										{ratio}
									</option>
								))}
							</SettingSelect>
						</ImageSettingColumn>
						<ImageSettingColumn>
							<SettingLabel>{t("modelInfoView.imageGeneration.size", "settings")}</SettingLabel>
							<SettingSelect onChange={handleImageSizeChange} value={imageGenerationSize ?? ""}>
								<option value="">{t("modelInfoView.imageGeneration.auto", "settings")}</option>
								{IMAGE_SIZE_OPTIONS.map((size) => (
									<option key={size} value={size}>
										{size}
									</option>
								))}
							</SettingSelect>
						</ImageSettingColumn>
						{/* CARETI MODIFICATION: Image analysis model selection */}
						<ImageSettingColumn>
							<SettingLabel>{t("modelInfoView.imageGeneration.analysisModel", "settings")}</SettingLabel>
							<SettingSelect onChange={handleImageAnalysisModelChange} value={imageAnalysisModel ?? "gemini-3-flash-preview"}>
								{IMAGE_ANALYSIS_MODEL_OPTIONS.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</SettingSelect>
						</ImageSettingColumn>
					</ImageSettingsGrid>
				</ImageSettingsSection>
			)}
		</>
	)
}
