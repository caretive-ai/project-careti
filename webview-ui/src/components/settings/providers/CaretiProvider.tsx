import { caretClaudeModels, caretiGeminiModels, caretModels } from "@shared/api"
import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react"
import { useMemo } from "react"
import { t } from "@/careti/utils/i18n"
import { useCaretAuth } from "@/context/CaretAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretAccountServiceClient } from "@/services/grpc-client"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

// CARETI MODIFICATION: Claude 4.5 models for radio button display (Opus first)
const claudeModelsForCaret = {
	"anthropic/claude-opus-4-5-20251101": {
		label: "Claude Opus 4.5",
		description: "Most capable, with extended thinking",
	},
	"anthropic/claude-sonnet-4-5-20250929": {
		label: "Claude Sonnet 4.5",
		description: "Fast and intelligent",
	},
	"anthropic/claude-haiku-4-5-20251001": {
		label: "Claude Haiku 4.5",
		description: "Fastest, lightweight",
	},
} as const

// CARETI MODIFICATION: Gemini models for radio button display
const geminiModelsForCaret = {
	"gemini/gemini-3-pro-preview": {
		label: "Gemini 3 Pro",
		description: "Most capable",
	},
	"gemini/gemini-3-flash-preview": {
		label: "Gemini 3 Flash",
		description: "Fast and efficient",
	},
	"gemini/gemini-2.5-pro": {
		label: "Gemini 2.5 Pro",
		description: "Advanced reasoning",
	},
	"gemini/gemini-2.5-flash": {
		label: "Gemini 2.5 Flash",
		description: "Balanced performance",
	},
} as const

type BackendType = "gemini" | "claude"

/**
 * Props for the CaretiProvider component
 */
interface CaretProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Careti provider configuration component
 */
export const CaretiProvider = ({ showModelOptions, isPopup, currentMode }: CaretProviderProps) => {
	const { caretUser } = useCaretAuth()
	const { navigateToAccount, featureConfig, apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldsChange } = useApiConfigurationHandlers()
	// CARETI MODIFICATION: Hide account UI when feature flag is disabled
	const showAccountUI = featureConfig?.showAccountUI !== false

	const user = caretUser || undefined

	// CARETI MODIFICATION: Get current model ID and infer backend type from it
	const modeFields = getModeSpecificFields(apiConfiguration, currentMode)

	// Infer backend type from model ID (no separate storage needed)
	const currentBackendType: BackendType = useMemo(() => {
		const modelId = modeFields.caretModelId
		if (modelId?.startsWith("anthropic/claude-")) {
			return "claude"
		}
		return "gemini"
	}, [modeFields.caretModelId])

	const isClaudeBackend = currentBackendType === "claude"

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration, currentMode)
	}, [apiConfiguration, currentMode])

	// CARETI MODIFICATION: Handle backend type change by setting default model
	const handleBackendTypeChange = (backendType: BackendType) => {
		if (backendType === "claude") {
			// Set default Claude model (Opus)
			const defaultClaudeModelId = Object.keys(caretClaudeModels)[0]
			const defaultClaudeModelInfo = caretClaudeModels[defaultClaudeModelId]
			handleModeFieldsChange(
				{
					caretModelId: { plan: "planModeCaretModelId", act: "actModeCaretModelId" },
					caretModelInfo: { plan: "planModeCaretModelInfo", act: "actModeCaretModelInfo" },
				},
				{
					caretModelId: defaultClaudeModelId,
					caretModelInfo: defaultClaudeModelInfo,
				},
				currentMode,
			)
		} else {
			// Set default Gemini model
			const defaultGeminiModelId = Object.keys(geminiModelsForCaret)[0]
			const defaultGeminiModelInfo = caretiGeminiModels[defaultGeminiModelId]
			handleModeFieldsChange(
				{
					caretModelId: { plan: "planModeCaretModelId", act: "actModeCaretModelId" },
					caretModelInfo: { plan: "planModeCaretModelInfo", act: "actModeCaretModelInfo" },
				},
				{
					caretModelId: defaultGeminiModelId,
					caretModelInfo: defaultGeminiModelInfo,
				},
				currentMode,
			)
		}
	}

	// CARETI MODIFICATION: Handle model selection via radio buttons
	const handleModelChange = (modelId: string) => {
		const modelInfo = caretModels[modelId as keyof typeof caretModels]
		handleModeFieldsChange(
			{
				caretModelId: { plan: "planModeCaretModelId", act: "actModeCaretModelId" },
				caretModelInfo: { plan: "planModeCaretModelInfo", act: "actModeCaretModelInfo" },
			},
			{
				caretModelId: modelId,
				caretModelInfo: modelInfo,
			},
			currentMode,
		)
	}

	const handleLogin = () => {
		CaretAccountServiceClient.caretAccountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error(t("clineAccountInfoCard.loginError", "settings"), err),
		)
	}

	const handleShowAccount = () => {
		navigateToAccount()
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 2 }}>
			<p style={{ color: "var(--vscode-descriptionForeground)", fontSize: 13, margin: 0 }}>
				{t("providers.careti.description", "settings")}
			</p>

			{user ? (
				<>
					{showModelOptions && (
						<>
							{/* CARETI MODIFICATION: Backend type selector */}
							<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
								<span style={{ fontWeight: 500 }}>{t("providers.careti.backendType", "settings")}</span>
								<VSCodeRadioGroup
									onChange={(e: any) => handleBackendTypeChange(e.target.value as BackendType)}
									orientation="horizontal"
									value={currentBackendType}>
									<VSCodeRadio value="gemini">
										<span style={{ fontWeight: 500 }}>Gemini</span>
										<span
											style={{
												color: "var(--vscode-descriptionForeground)",
												marginLeft: 6,
												fontSize: 12,
											}}>
											({t("providers.careti.backendDescription.gemini", "settings")})
										</span>
									</VSCodeRadio>
									<VSCodeRadio value="claude">
										<span style={{ fontWeight: 500 }}>Claude Code</span>
										<span
											style={{
												color: "var(--vscode-descriptionForeground)",
												marginLeft: 6,
												fontSize: 12,
											}}>
											({t("providers.careti.backendDescription.claude", "settings")})
										</span>
									</VSCodeRadio>
								</VSCodeRadioGroup>
							</div>

							{/* CARETI MODIFICATION: Model selection based on backend type */}
							{isClaudeBackend ? (
								<>
									{/* Claude model selection */}
									<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
										<span style={{ fontWeight: 500 }}>{t("providers.careti.claudeModel", "settings")}</span>
										<VSCodeRadioGroup
											onChange={(e: any) => handleModelChange(e.target.value)}
											orientation="vertical"
											value={modeFields.caretModelId || ""}>
											{Object.entries(claudeModelsForCaret).map(([modelId, info]) => (
												<VSCodeRadio key={modelId} value={modelId}>
													<span style={{ fontWeight: 500 }}>{info.label}</span>
													<span
														style={{
															color: "var(--vscode-descriptionForeground)",
															marginLeft: 8,
															fontSize: 12,
														}}>
														{info.description}
													</span>
												</VSCodeRadio>
											))}
										</VSCodeRadioGroup>
									</div>

									{/* CLI path input for Claude */}
									<DebouncedTextField
										initialValue={apiConfiguration?.claudeCodePath || "claude"}
										onChange={(value) => handleFieldChange("claudeCodePath", value)}
										placeholder={t("providers.claude-code.cliPathPlaceholder", "settings")}
										style={{ width: "100%", marginTop: 3 }}
										type="text">
										<span style={{ fontWeight: 500 }}>{t("providers.claude-code.cliPath", "settings")}</span>
									</DebouncedTextField>
								</>
							) : (
								<>
									{/* Gemini model selection */}
									<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
										<span style={{ fontWeight: 500 }}>{t("providers.careti.geminiModel", "settings")}</span>
										<VSCodeRadioGroup
											onChange={(e: any) => handleModelChange(e.target.value)}
											orientation="vertical"
											value={modeFields.caretModelId || ""}>
											{Object.entries(geminiModelsForCaret).map(([modelId, info]) => (
												<VSCodeRadio key={modelId} value={modelId}>
													<span style={{ fontWeight: 500 }}>{info.label}</span>
													<span
														style={{
															color: "var(--vscode-descriptionForeground)",
															marginLeft: 8,
															fontSize: 12,
														}}>
														{info.description}
													</span>
												</VSCodeRadio>
											))}
										</VSCodeRadioGroup>
									</div>
								</>
							)}

							{/* Model info */}
							{modeFields.caretModelId && (
								<ModelInfoView
									isPopup={isPopup}
									modelInfo={selectedModelInfo}
									selectedModelId={selectedModelId}
								/>
							)}

							{/* Divider */}
							<div
								style={{
									borderTop: "1px solid var(--vscode-widget-border)",
									margin: "8px 0",
								}}
							/>

							{/* View Billing button */}
							{showAccountUI && (
								<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
									{t("clineAccountInfoCard.viewBillingAndUsage", "settings")}
								</VSCodeButton>
							)}
						</>
					)}
				</>
			) : (
				<>
					{showAccountUI && (
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							<VSCodeButton
								appearance="primary"
								className="w-full"
								onClick={handleLogin}
								style={{ minWidth: "120px" }}>
								{t("providers.careti.login", "settings")}
							</VSCodeButton>
						</div>
					)}
				</>
			)}
		</div>
	)
}
