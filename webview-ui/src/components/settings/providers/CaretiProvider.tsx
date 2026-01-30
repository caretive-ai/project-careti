import { caretClaudeModels, caretiGeminiModels, caretiZaiModels, caretModels } from "@shared/api"
import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton, VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useMemo, useRef } from "react"
import { t } from "@/careti/utils/i18n"
import { useCaretiAuth } from "@/context/CaretiAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CaretAccountServiceClient } from "@/services/grpc-client"
import { ApiKeyField } from "../common/ApiKeyField"
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

// CARETI MODIFICATION: ZAI GLM models for radio button display
const zaiModelsForCaret = {
	"zai/glm-4.7": {
		label: "GLM-4.7",
		description: "Thinking mode support",
	},
} as const

type BackendType = "gemini" | "claude" | "zai"

/**
 * Props for the CaretiProvider component
 */
interface CaretiProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Careti provider configuration component
 */
export const CaretiProvider = ({ showModelOptions, isPopup, currentMode }: CaretiProviderProps) => {
	const { caretUser } = useCaretiAuth()
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
		if (modelId?.startsWith("zai/")) {
			return "zai"
		}
		return "gemini"
	}, [modeFields.caretModelId])

	const isClaudeBackend = currentBackendType === "claude"
	const isZaiBackend = currentBackendType === "zai"

	const { selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration, currentMode)
	}, [apiConfiguration, currentMode])

	// CARETI MODIFICATION: Track if state update is in progress to prevent re-render loops
	const isUpdatingRef = useRef(false)

	// CARETI MODIFICATION: Handle backend type change by setting default model
	// useCallback prevents unnecessary re-renders and race conditions
	const handleBackendTypeChange = useCallback(
		(backendType: BackendType) => {
			// Prevent duplicate updates if already updating or same type selected
			if (isUpdatingRef.current) {
				return
			}

			// Check if backend type actually changed by comparing with current model
			const currentModelId = modeFields.caretModelId
			const isCurrentlyClaude = currentModelId?.startsWith("anthropic/claude-")
			const isCurrentlyZai = currentModelId?.startsWith("zai/")
			const isCurrentlyGemini = currentModelId?.startsWith("gemini/")

			// Skip if no actual change needed
			if (
				(backendType === "claude" && isCurrentlyClaude) ||
				(backendType === "zai" && isCurrentlyZai) ||
				(backendType === "gemini" && isCurrentlyGemini)
			) {
				return
			}

			isUpdatingRef.current = true

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
				).finally(() => {
					isUpdatingRef.current = false
				})
			} else if (backendType === "zai") {
				// Set default ZAI model (GLM-4.7)
				const defaultZaiModelId = Object.keys(zaiModelsForCaret)[0]
				const defaultZaiModelInfo = caretiZaiModels[defaultZaiModelId]
				handleModeFieldsChange(
					{
						caretModelId: { plan: "planModeCaretModelId", act: "actModeCaretModelId" },
						caretModelInfo: { plan: "planModeCaretModelInfo", act: "actModeCaretModelInfo" },
					},
					{
						caretModelId: defaultZaiModelId,
						caretModelInfo: defaultZaiModelInfo,
					},
					currentMode,
				).finally(() => {
					isUpdatingRef.current = false
				})
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
				).finally(() => {
					isUpdatingRef.current = false
				})
			}
		},
		[modeFields.caretModelId, handleModeFieldsChange, currentMode],
	)

	// CARETI MODIFICATION: Handle model selection via radio buttons
	const handleModelChange = useCallback(
		(modelId: string) => {
			// Prevent duplicate updates
			if (isUpdatingRef.current || modelId === modeFields.caretModelId) {
				return
			}

			isUpdatingRef.current = true
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
			).finally(() => {
				isUpdatingRef.current = false
			})
		},
		[modeFields.caretModelId, handleModeFieldsChange, currentMode],
	)

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
									<VSCodeRadio value="zai">
										<span style={{ fontWeight: 500 }}>ZAI GLM</span>
										<span
											style={{
												color: "var(--vscode-descriptionForeground)",
												marginLeft: 6,
												fontSize: 12,
											}}>
											({t("providers.careti.backendDescription.zai", "settings")})
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
							) : isZaiBackend ? (
								<>
									{/* ZAI GLM model selection */}
									<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
										<span style={{ fontWeight: 500 }}>{t("providers.careti.zaiModel", "settings")}</span>
										<VSCodeRadioGroup
											onChange={(e: any) => handleModelChange(e.target.value)}
											orientation="vertical"
											value={modeFields.caretModelId || ""}>
											{Object.entries(zaiModelsForCaret).map(([modelId, info]) => (
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

									{/* API key input for ZAI */}
									<ApiKeyField
										initialValue={apiConfiguration?.zaiApiKey || ""}
										onChange={(value) => handleFieldChange("zaiApiKey", value)}
										providerName={t("providers.zai.providerName", "settings")}
										signupUrl="https://z.ai/manage-apikey/apikey-list"
									/>
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
