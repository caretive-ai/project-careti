# `src/core/storage/utils/state-helpers.ts` 병합 실행 계획

## 1. 목표

`src/core/storage/utils/state-helpers.ts` 파일의 복잡한 병합 충돌을 해결합니다. Cline의 리팩토링된 아키텍처(타입 안전성, `HostProvider` 의존성)를 채택하면서 Caret의 고유 기능(페르소나, 브랜드 설정, `FeatureConfig` 등)을 완벽하게 통합하고, 병합 후 발생한 타입스크립트 오류를 수정합니다.

## 2. 실행 계획

1.  **사용자 승인**: 아래에 제시된 `src/core/storage/utils/state-helpers.ts`의 최종 내용에 대해 마스터의 승인을 받습니다.
2.  **파일 업데이트**: 승인 시, `write_to_file` 도구를 사용하여 `src/core/storage/utils/state-helpers.ts` 파일을 아래 내용으로 덮어씁니다.

## 3. 최종 병합 내용

```typescript
// CARET MODIFICATION: Import feature configuration for persona defaults
import { getCurrentFeatureConfig } from "@caret/shared/FeatureConfig"
import { ANTHROPIC_MIN_THINKING_BUDGET, ApiProvider, BedrockModelId, fireworksDefaultModelId, ModelInfo, type OcaModelInfo } from "@shared/api"
import { ExtensionContext, LanguageModelChatSelector } from "vscode"
import { Controller } from "@/core/controller"
import { AutoApprovalSettings, DEFAULT_AUTO_APPROVAL_SETTINGS } from "@/shared/AutoApprovalSettings"
import { BrowserSettings, DEFAULT_BROWSER_SETTINGS } from "@/shared/BrowserSettings"
import { CaretUser } from "@/shared/CaretAccount"
import { ClineRulesToggles } from "@/shared/cline-rules"
import { DEFAULT_DICTATION_SETTINGS, DictationSettings } from "@/shared/DictationSettings"
import { DEFAULT_FOCUS_CHAIN_SETTINGS, FocusChainSettings } from "@/shared/FocusChainSettings"
import { HistoryItem } from "@/shared/HistoryItem"
import { DEFAULT_MCP_DISPLAY_MODE, McpDisplayMode } from "@/shared/McpDisplayMode"
import { Mode, OpenaiReasoningEffort } from "@/shared/storage/types"
import { TelemetrySetting } from "@/shared/TelemetrySetting"
import { UserInfo } from "@/shared/UserInfo"
import { readTaskHistoryFromState } from "../disk"
import { GlobalState, GlobalStateAndSettings, LocalState, SecretKey, Secrets } from "../state-keys"

export async function readSecretsFromDisk(context: ExtensionContext): Promise<Secrets> {
	const [
		apiKey,
		openRouterApiKey,
		clineAccountId,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
		awsBedrockApiKey,
		openAiApiKey,
		geminiApiKey,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		doubaoApiKey,
		mistralApiKey,
		fireworksApiKey,
		liteLlmApiKey,
		caretApiKey,
		caretAuthToken,
		asksageApiKey,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		moonshotApiKey,
		nebiusApiKey,
		huggingFaceApiKey,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		huaweiCloudMaasApiKey,
		basetenApiKey,
		zaiApiKey,
		ollamaApiKey,
		vercelAiGatewayApiKey,
		difyApiKey,
		authNonce,
		ocaApiKey,
		ocaRefreshToken,
	] = await Promise.all([
		context.secrets.get("apiKey") as Promise<Secrets["apiKey"]>,
		context.secrets.get("openRouterApiKey") as Promise<Secrets["openRouterApiKey"]>,
		context.secrets.get("clineAccountId") as Promise<Secrets["clineAccountId"]>,
		context.secrets.get("awsAccessKey") as Promise<Secrets["awsAccessKey"]>,
		context.secrets.get("awsSecretKey") as Promise<Secrets["awsSecretKey"]>,
		context.secrets.get("awsSessionToken") as Promise<Secrets["awsSessionToken"]>,
		context.secrets.get("awsBedrockApiKey") as Promise<Secrets["awsBedrockApiKey"]>,
		context.secrets.get("openAiApiKey") as Promise<Secrets["openAiApiKey"]>,
		context.secrets.get("geminiApiKey") as Promise<Secrets["geminiApiKey"]>,
		context.secrets.get("openAiNativeApiKey") as Promise<Secrets["openAiNativeApiKey"]>,
		context.secrets.get("deepSeekApiKey") as Promise<Secrets["deepSeekApiKey"]>,
		context.secrets.get("requestyApiKey") as Promise<Secrets["requestyApiKey"]>,
		context.secrets.get("togetherApiKey") as Promise<Secrets["togetherApiKey"]>,
		context.secrets.get("qwenApiKey") as Promise<Secrets["qwenApiKey"]>,
		context.secrets.get("doubaoApiKey") as Promise<Secrets["doubaoApiKey"]>,
		context.secrets.get("mistralApiKey") as Promise<Secrets["mistralApiKey"]>,
		context.secrets.get("fireworksApiKey") as Promise<Secrets["fireworksApiKey"]>,
		context.secrets.get("liteLlmApiKey") as Promise<Secrets["liteLlmApiKey"]>,
		context.secrets.get("caretApiKey") as Promise<string | undefined>, // caret
		context.secrets.get("caretAuthToken") as Promise<string | undefined>, // caret
		context.secrets.get("asksageApiKey") as Promise<Secrets["asksageApiKey"]>,
		context.secrets.get("xaiApiKey") as Promise<Secrets["xaiApiKey"]>,
		context.secrets.get("sambanovaApiKey") as Promise<Secrets["sambanovaApiKey"]>,
		context.secrets.get("cerebrasApiKey") as Promise<Secrets["cerebrasApiKey"]>,
		context.secrets.get("groqApiKey") as Promise<Secrets["groqApiKey"]>,
		context.secrets.get("moonshotApiKey") as Promise<Secrets["moonshotApiKey"]>,
		context.secrets.get("nebiusApiKey") as Promise<Secrets["nebiusApiKey"]>,
		context.secrets.get("huggingFaceApiKey") as Promise<Secrets["huggingFaceApiKey"]>,
		context.secrets.get("sapAiCoreClientId") as Promise<Secrets["sapAiCoreClientId"]>,
		context.secrets.get("sapAiCoreClientSecret") as Promise<Secrets["sapAiCoreClientSecret"]>,
		context.secrets.get("huaweiCloudMaasApiKey") as Promise<Secrets["huaweiCloudMaasApiKey"]>,
		context.secrets.get("basetenApiKey") as Promise<Secrets["basetenApiKey"]>,
		context.secrets.get("zaiApiKey") as Promise<Secrets["zaiApiKey"]>,
		context.secrets.get("ollamaApiKey") as Promise<Secrets["ollamaApiKey"]>,
		context.secrets.get("vercelAiGatewayApiKey") as Promise<Secrets["vercelAiGatewayApiKey"]>,
		context.secrets.get("difyApiKey") as Promise<Secrets["difyApiKey"]>,
		context.secrets.get("authNonce") as Promise<Secrets["authNonce"]>,
		context.secrets.get("ocaApiKey") as Promise<string | undefined>,
		context.secrets.get("ocaRefreshToken") as Promise<string | undefined>,
	])

	return {
		authNonce,
		apiKey,
		openRouterApiKey,
		clineAccountId,
		huggingFaceApiKey,
		huaweiCloudMaasApiKey,
		basetenApiKey,
		zaiApiKey,
		ollamaApiKey,
		vercelAiGatewayApiKey,
		difyApiKey,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		moonshotApiKey,
		nebiusApiKey,
		asksageApiKey,
		fireworksApiKey,
		liteLlmApiKey,
		caretApiKey,
		caretAuthToken,
		doubaoApiKey,
		mistralApiKey,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		geminiApiKey,
		openAiApiKey,
		awsBedrockApiKey,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
		ocaApiKey,
		ocaRefreshToken,
	}
}

export async function readWorkspaceStateFromDisk(context: ExtensionContext): Promise<LocalState> {
	const localClineRulesToggles = context.workspaceState.get("localClineRulesToggles") as ClineRulesToggles | undefined
	const localCaretRulesToggles = context.workspaceState.get("localCaretRulesToggles") as ClineRulesToggles | undefined // CARET MODIFICATION: Add caret rules
	const localWindsurfRulesToggles = context.workspaceState.get("localWindsurfRulesToggles") as ClineRulesToggles | undefined
	const localCursorRulesToggles = context.workspaceState.get("localCursorRulesToggles") as ClineRulesToggles | undefined
	const localWorkflowToggles = context.workspaceState.get("workflowToggles") as ClineRulesToggles | undefined

	return {
		localClineRulesToggles: localClineRulesToggles || {},
		localCaretRulesToggles: localCaretRulesToggles || {}, // CARET MODIFICATION: Add caret rules
		localWindsurfRulesToggles: localWindsurfRulesToggles || {},
		localCursorRulesToggles: localCursorRulesToggles || {},
		workflowToggles: localWorkflowToggles || {},
	}
}

export async function readGlobalStateFromDisk(context: ExtensionContext): Promise<GlobalStateAndSettings> {
	try {
		// Get all global state values
		const strictPlanModeEnabled =
			context.globalState.get<GlobalStateAndSettings["strictPlanModeEnabled"]>("strictPlanModeEnabled")
		const yoloModeToggled = context.globalState.get<GlobalStateAndSettings["yoloModeToggled"]>("yoloModeToggled")
		const useAutoCondense = context.globalState.get<GlobalStateAndSettings["useAutoCondense"]>("useAutoCondense")
		const isNewUser = context.globalState.get<GlobalStateAndSettings["isNewUser"]>("isNewUser")
		const welcomeViewCompleted =
			context.globalState.get<GlobalStateAndSettings["welcomeViewCompleted"]>("welcomeViewCompleted")
		const awsRegion = context.globalState.get<GlobalStateAndSettings["awsRegion"]>("awsRegion")
		const awsUseCrossRegionInference =
			context.globalState.get<GlobalStateAndSettings["awsUseCrossRegionInference"]>("awsUseCrossRegionInference")
		const awsBedrockUsePromptCache =
			context.globalState.get<GlobalStateAndSettings["awsBedrockUsePromptCache"]>("awsBedrockUsePromptCache")
		const awsBedrockEndpoint = context.globalState.get<GlobalStateAndSettings["awsBedrockEndpoint"]>("awsBedrockEndpoint")
		const awsProfile = context.globalState.get<GlobalStateAndSettings["awsProfile"]>("awsProfile")
		const awsUseProfile = context.globalState.get<GlobalStateAndSettings["awsUseProfile"]>("awsUseProfile")
		const awsAuthentication = context.globalState.get<GlobalStateAndSettings["awsAuthentication"]>("awsAuthentication")
		const vertexProjectId = context.globalState.get<GlobalStateAndSettings["vertexProjectId"]>("vertexProjectId")
		const vertexRegion = context.globalState.get<GlobalStateAndSettings["vertexRegion"]>("vertexRegion")
		const openAiBaseUrl = context.globalState.get<GlobalStateAndSettings["openAiBaseUrl"]>("openAiBaseUrl")
		const requestyBaseUrl = context.globalState.get<GlobalStateAndSettings["requestyBaseUrl"]>("requestyBaseUrl")
		const openAiHeaders = context.globalState.get<GlobalStateAndSettings["openAiHeaders"]>("openAiHeaders")
		const ollamaBaseUrl = context.globalState.get<GlobalStateAndSettings["ollamaBaseUrl"]>("ollamaBaseUrl")
		const ollamaApiOptionsCtxNum =
			context.globalState.get<GlobalStateAndSettings["ollamaApiOptionsCtxNum"]>("ollamaApiOptionsCtxNum")
		const lmStudioBaseUrl = context.globalState.get<GlobalStateAndSettings["lmStudioBaseUrl"]>("lmStudioBaseUrl")
		const lmStudioMaxTokens = context.globalState.get<GlobalStateAndSettings["lmStudioMaxTokens"]>("lmStudioMaxTokens")
		const anthropicBaseUrl = context.globalState.get<GlobalStateAndSettings["anthropicBaseUrl"]>("anthropicBaseUrl")
		const geminiBaseUrl = context.globalState.get<GlobalStateAndSettings["geminiBaseUrl"]>("geminiBaseUrl")
		const azureApiVersion = context.globalState.get<GlobalStateAndSettings["azureApiVersion"]>("azureApiVersion")
		const openRouterProviderSorting =
			context.globalState.get<GlobalStateAndSettings["openRouterProviderSorting"]>("openRouterProviderSorting")
		const lastShownAnnouncementId =
			context.globalState.get<GlobalStateAndSettings["lastShownAnnouncementId"]>("lastShownAnnouncementId")
		const autoApprovalSettings =
			context.globalState.get<GlobalStateAndSettings["autoApprovalSettings"]>("autoApprovalSettings")
		const browserSettings = context.globalState.get<GlobalStateAndSettings["browserSettings"]>("browserSettings")
		const liteLlmBaseUrl = context.globalState.get<GlobalStateAndSettings["liteLlmBaseUrl"]>("liteLlmBaseUrl")
		const liteLlmUsePromptCache =
			context.globalState.get<GlobalStateAndSettings["liteLlmUsePromptCache"]>("liteLlmUsePromptCache")
		const caretBaseUrl = context.globalState.get("caretBaseUrl") as string | undefined
		const caretUsePromptCache = context.globalState.get("caretUsePromptCache") as boolean | undefined
		const caretUserProfile = context.globalState.get("caretUserProfile") as CaretUser | undefined
		const fireworksModelMaxCompletionTokens = context.globalState.get<
			GlobalStateAndSettings["fireworksModelMaxCompletionTokens"]
		>("fireworksModelMaxCompletionTokens")
		const fireworksModelMaxTokens =
			context.globalState.get<GlobalStateAndSettings["fireworksModelMaxTokens"]>("fireworksModelMaxTokens")
		const userInfo = context.globalState.get<GlobalStateAndSettings["userInfo"]>("userInfo")
		const qwenApiLine = context.globalState.get<GlobalStateAndSettings["qwenApiLine"]>("qwenApiLine")
		const moonshotApiLine = context.globalState.get<GlobalStateAndSettings["moonshotApiLine"]>("moonshotApiLine")
		const zaiApiLine = context.globalState.get<GlobalStateAndSettings["zaiApiLine"]>("zaiApiLine")
		const telemetrySetting = context.globalState.get<GlobalStateAndSettings["telemetrySetting"]>("telemetrySetting")
		const asksageApiUrl = context.globalState.get<GlobalStateAndSettings["asksageApiUrl"]>("asksageApiUrl")
		const planActSeparateModelsSettingRaw =
			context.globalState.get<GlobalStateAndSettings["planActSeparateModelsSetting"]>("planActSeparateModelsSetting")
		const favoritedModelIds = context.globalState.get<GlobalStateAndSettings["favoritedModelIds"]>("favoritedModelIds")
		const globalClineRulesToggles =
			context.globalState.get<GlobalStateAndSettings["globalClineRulesToggles"]>("globalClineRulesToggles")
		const requestTimeoutMs = context.globalState.get<GlobalStateAndSettings["requestTimeoutMs"]>("requestTimeoutMs")
		const shellIntegrationTimeout =
			context.globalState.get<GlobalStateAndSettings["shellIntegrationTimeout"]>("shellIntegrationTimeout")
		const enableCheckpointsSettingRaw =
			context.globalState.get<GlobalStateAndSettings["enableCheckpointsSetting"]>("enableCheckpointsSetting")
		const mcpMarketplaceEnabledRaw =
			context.globalState.get<GlobalStateAndSettings["mcpMarketplaceEnabled"]>("mcpMarketplaceEnabled")
		const mcpDisplayMode = context.globalState.get<GlobalStateAndSettings["mcpDisplayMode"]>("mcpDisplayMode")
		const mcpResponsesCollapsedRaw =
			context.globalState.get<GlobalStateAndSettings["mcpResponsesCollapsed"]>("mcpResponsesCollapsed")
		const globalWorkflowToggles =
			context.globalState.get<GlobalStateAndSettings["globalWorkflowToggles"]>("globalWorkflowToggles")
		const terminalReuseEnabled =
			context.globalState.get<GlobalStateAndSettings["terminalReuseEnabled"]>("terminalReuseEnabled")
		const terminalOutputLineLimit =
			context.globalState.get<GlobalStateAndSettings["terminalOutputLineLimit"]>("terminalOutputLineLimit")
		const defaultTerminalProfile =
			context.globalState.get<GlobalStateAndSettings["defaultTerminalProfile"]>("defaultTerminalProfile")
		const sapAiCoreBaseUrl = context.globalState.get<GlobalStateAndSettings["sapAiCoreBaseUrl"]>("sapAiCoreBaseUrl")
		const sapAiCoreTokenUrl = context.globalState.get<GlobalStateAndSettings["sapAiCoreTokenUrl"]>("sapAiCoreTokenUrl")
		const sapAiResourceGroup = context.globalState.get<GlobalStateAndSettings["sapAiResourceGroup"]>("sapAiResourceGroup")
		const claudeCodePath = context.globalState.get<GlobalStateAndSettings["claudeCodePath"]>("claudeCodePath")
		const difyBaseUrl = context.globalState.get<GlobalStateAndSettings["difyBaseUrl"]>("difyBaseUrl")
		const ocaBaseUrl = context.globalState.get("ocaBaseUrl") as string | undefined
		const openaiReasoningEffort =
			context.globalState.get<GlobalStateAndSettings["openaiReasoningEffort"]>("openaiReasoningEffort")
		const preferredLanguage = context.globalState.get<GlobalStateAndSettings["preferredLanguage"]>("preferredLanguage")
		const focusChainSettings = context.globalState.get<GlobalStateAndSettings["focusChainSettings"]>("focusChainSettings")
		const dictationSettings = context.globalState.get<GlobalStateAndSettings["dictationSettings"]>("dictationSettings") as
			| DictationSettings
			| undefined
		const mcpMarketplaceCatalog =
			context.globalState.get<GlobalStateAndSettings["mcpMarketplaceCatalog"]>("mcpMarketplaceCatalog")
		const lastDismissedInfoBannerVersion =
			context.globalState.get<GlobalStateAndSettings["lastDismissedInfoBannerVersion"]>("lastDismissedInfoBannerVersion")
		const lastDismissedModelBannerVersion = context.globalState.get<
			GlobalStateAndSettings["lastDismissedModelBannerVersion"]
		>("lastDismissedModelBannerVersion")
		const qwenCodeOauthPath = context.globalState.get<GlobalStateAndSettings["qwenCodeOauthPath"]>("qwenCodeOauthPath")
		const customPrompt = context.globalState.get<GlobalStateAndSettings["customPrompt"]>("customPrompt")
		const autoCondenseThreshold =
			context.globalState.get<GlobalStateAndSettings["autoCondenseThreshold"]>("autoCondenseThreshold") // number from 0 to 1
		// Get mode-related configurations
		const mode = context.globalState.get<GlobalStateAndSettings["mode"]>("mode")

		// Plan mode configurations
		const planModeApiProvider = context.globalState.get("planModeApiProvider") as ApiProvider | undefined
		const planModeApiModelId = context.globalState.get("planModeApiModelId") as string | undefined
		const planModeThinkingBudgetTokens = context.globalState.get("planModeThinkingBudgetTokens") as number | undefined
		const planModeReasoningEffort = context.globalState.get("planModeReasoningEffort") as string | undefined
		const planModeVsCodeLmModelSelector = context.globalState.get("planModeVsCodeLmModelSelector") as
			| LanguageModelChatSelector
			| undefined
		const planModeAwsBedrockCustomSelected = context.globalState.get("planModeAwsBedrockCustomSelected") as boolean | undefined
		const planModeAwsBedrockCustomModelBaseId = context.globalState.get("planModeAwsBedrockCustomModelBaseId") as
			| BedrockModelId
			| undefined
		const planModeOpenRouterModelId = context.globalState.get("planModeOpenRouterModelId") as string | undefined
		const planModeOpenRouterModelInfo = context.globalState.get("planModeOpenRouterModelInfo") as ModelInfo | undefined
		const planModeOpenAiModelId = context.globalState.get("planModeOpenAiModelId") as string | undefined
		const planModeOpenAiModelInfo = context.globalState.get("planModeOpenAiModelInfo") as ModelInfo | undefined
		const planModeOllamaModelId = context.globalState.get("planModeOllamaModelId") as string | undefined
		const planModeLmStudioModelId = context.globalState.get("planModeLmStudioModelId") as string | undefined
		const planModeLiteLlmModelId = context.globalState.get("planModeLiteLlmModelId") as string | undefined
		const planModeLiteLlmModelInfo = context.globalState.get("planModeLiteLlmModelInfo") as ModelInfo | undefined
		const planModeCaretModelId = context.globalState.get("planModeCaretModelId") as string | undefined
		const planModeCaretModelInfo = context.globalState.get("planModeCaretModelInfo") as ModelInfo | undefined
		const planModeRequestyModelId = context.globalState.get("planModeRequestyModelId") as string | undefined
		const planModeRequestyModelInfo = context.globalState.get("planModeRequestyModelInfo") as ModelInfo | undefined
		const planModeTogetherModelId = context.globalState.get("planModeTogetherModelId") as string | undefined
		const planModeFireworksModelId = context.globalState.get("planModeFireworksModelId") as string | undefined
		const planModeSapAiCoreModelId = context.globalState.get("planModeSapAiCoreModelId") as string | undefined
		const planModeSapAiCoreDeploymentId =
			context.globalState.get<GlobalStateAndSettings["planModeSapAiCoreDeploymentId"]>("planModeSapAiCoreDeploymentId")
		const planModeGroqModelId = context.globalState.get("planModeGroqModelId") as string | undefined
		const planModeGroqModelInfo = context.globalState.get("planModeGroqModelInfo") as ModelInfo | undefined
		const planModeHuggingFaceModelId = context.globalState.get("planModeHuggingFaceModelId") as string | undefined
		const planModeHuggingFaceModelInfo = context.globalState.get("planModeHuggingFaceModelInfo") as ModelInfo | undefined
		const planModeHuaweiCloudMaasModelId = context.globalState.get("planModeHuaweiCloudMaasModelId") as string | undefined
		const planModeHuaweiCloudMaasModelInfo = context.globalState.get("planModeHuaweiCloudMaasModelInfo") as ModelInfo | undefined
		const planModeBasetenModelId = context.globalState.get("planModeBasetenModelId") as string | undefined
		const planModeBasetenModelInfo = context.globalState.get("planModeBasetenModelInfo") as ModelInfo | undefined
		const planModeVercelAiGatewayModelId = context.globalState.get("planModeVercelAiGatewayModelId") as string | undefined
		const planModeVercelAiGatewayModelInfo = context.globalState.get("planModeVercelAiGatewayModelInfo") as ModelInfo | undefined
		const planModeOcaModelId = context.globalState.get("planModeOcaModelId") as string | undefined
		const planModeOcaModelInfo = context.globalState.get("planModeOcaModelInfo") as OcaModelInfo | undefined
		// Act mode configurations
		const actModeApiProvider = context.globalState.get("actModeApiProvider") as ApiProvider | undefined
		const actModeApiModelId = context.globalState.get("actModeApiModelId") as string | undefined
		const actModeThinkingBudgetTokens = context.globalState.get("actModeThinkingBudgetTokens") as number | undefined
		const actModeReasoningEffort = context.globalState.get("actModeReasoningEffort") as string | undefined
		const actModeVsCodeLmModelSelector = context.globalState.get("actModeVsCodeLmModelSelector") as
			| LanguageModelChatSelector
			| undefined
		const actModeAwsBedrockCustomSelected = context.globalState.get("actModeAwsBedrockCustomSelected") as boolean | undefined
		const actModeAwsBedrockCustomModelBaseId = context.globalState.get("actModeAwsBedrockCustomModelBaseId") as
			| BedrockModelId
			| undefined
		const actModeOpenRouterModelId = context.globalState.get("actModeOpenRouterModelId") as string | undefined
		const actModeOpenRouterModelInfo = context.globalState.get("actModeOpenRouterModelInfo") as ModelInfo | undefined
		const actModeOpenAiModelId = context.globalState.get("actModeOpenAiModelId") as string | undefined
		const actModeOpenAiModelInfo = context.globalState.get("actModeOpenAiModelInfo") as ModelInfo | undefined
		const actModeOllamaModelId = context.globalState.get("actModeOllamaModelId") as string | undefined
		const actModeLmStudioModelId = context.globalState.get("actModeLmStudioModelId") as string | undefined
		const actModeLiteLlmModelId = context.globalState.get("actModeLiteLlmModelId") as string | undefined
		const actModeLiteLlmModelInfo = context.globalState.get("actModeLiteLlmModelInfo") as ModelInfo | undefined
		const actModeCaretModelId = context.globalState.get("actModeCaretModelId") as string | undefined // caret
		const actModeCaretModelInfo = context.globalState.get("actModeCaretModelInfo") as ModelInfo | undefined // caret
		const actModeRequestyModelId = context.globalState.get("actModeRequestyModelId") as string | undefined
		const actModeRequestyModelInfo = context.globalState.get("actModeRequestyModelInfo") as ModelInfo | undefined
		const actModeTogetherModelId = context.globalState.get("actModeTogetherModelId") as string | undefined
		const actModeFireworksModelId = context.globalState.get("actModeFireworksModelId") as string | undefined
		const actModeSapAiCoreModelId = context.globalState.get("actModeSapAiCoreModelId") as string | undefined
		const actModeSapAiCoreDeploymentId =
			context.globalState.get<GlobalStateAndSettings["actModeSapAiCoreDeploymentId"]>("actModeSapAiCoreDeploymentId")
		const actModeGroqModelId = context.globalState.get("actModeGroqModelId") as string | undefined
		const actModeGroqModelInfo = context.globalState.get("actModeGroqModelInfo") as ModelInfo | undefined
		const actModeHuggingFaceModelId = context.globalState.get("actModeHuggingFaceModelId") as string | undefined
		const actModeHuggingFaceModelInfo = context.globalState.get("actModeHuggingFaceModelInfo") as ModelInfo | undefined
		const actModeHuaweiCloudMaasModelId = context.globalState.get("actModeHuaweiCloudMaasModelId") as string | undefined
		const actModeHuaweiCloudMaasModelInfo = context.globalState.get("actModeHuaweiCloudMaasModelInfo") as ModelInfo | undefined
		const actModeBasetenModelId = context.globalState.get("actModeBasetenModelId") as string | undefined
		const actModeBasetenModelInfo = context.globalState.get("actModeBasetenModelInfo") as ModelInfo | undefined
		const actModeVercelAiGatewayModelId = context.globalState.get("actModeVercelAiGatewayModelId") as string | undefined
		const actModeVercelAiGatewayModelInfo = context.globalState.get("actModeVercelAiGatewayModelInfo") as ModelInfo | undefined
		const actModeOcaModelId = context.globalState.get("actModeOcaModelId") as string | undefined
		const actModeOcaModelInfo = context.globalState.get("actModeOcaModelInfo") as OcaModelInfo | undefined
		const sapAiCoreUseOrchestrationMode =
			context.globalState.get<GlobalStateAndSettings["sapAiCoreUseOrchestrationMode"]>("sapAiCoreUseOrchestrationMode")
		// CARET MODIFICATION: Caret 전역 브랜드 모드 시스템 (Caret/Cline 구분)
		const modeSystem = context.globalState.get("caretModeSystem") as "caret" | "cline" | undefined
		// CARET MODIFICATION: Persona system settings
		const enablePersonaSystem = context.globalState.get("enablePersonaSystem") as boolean | undefined
		const currentPersona = context.globalState.get("currentPersona") as string | undefined
		const personaProfile = context.globalState.get("personaProfile") as GlobalState["personaProfile"]
		// CARET MODIFICATION: Input history for chat persistence
		const inputHistory = context.globalState.get("inputHistory") as GlobalState["inputHistory"]

		let apiProvider: ApiProvider
		if (planModeApiProvider) {
			apiProvider = planModeApiProvider
		} else {
			// CARET MODIFICATION: Use FeatureConfig defaultProvider instead of hardcoded openrouter
			apiProvider = getCurrentFeatureConfig().defaultProvider as ApiProvider
		}

		const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false

		// Plan/Act separate models setting is a boolean indicating whether the user wants to use different models for plan and act. Existing users expect this to be enabled, while we want new users to opt in to this being disabled by default.
		// On win11 state sometimes initializes as empty string instead of undefined
		let planActSeparateModelsSetting: boolean | undefined
		if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
			planActSeparateModelsSetting = planActSeparateModelsSettingRaw
		} else {
			// default to true for existing users
			planActSeparateModelsSetting = true
		}

		const taskHistory = await readTaskHistoryFromState()

		// Multi-root workspace support
		const workspaceRoots = context.globalState.get<GlobalStateAndSettings["workspaceRoots"]>("workspaceRoots")
		/**
		 * Get primary root index from global state.
		 * The primary root is the main workspace folder that Cline focuses on when dealing with
		 * multi-root workspaces. In VS Code, you can have multiple folders open in one workspace,
		 * and the primary root index indicates which folder (by its position in the array, 0-based)
		 * should be treated as the main/default working directory for operations.
		 */
		const primaryRootIndex = context.globalState.get<GlobalStateAndSettings["primaryRootIndex"]>("primaryRootIndex")
		const multiRootEnabled = context.globalState.get<GlobalStateAndSettings["multiRootEnabled"]>("multiRootEnabled")

		return {
			// api configuration fields
			claudeCodePath,
			awsRegion,
			awsUseCrossRegionInference,
			awsBedrockUsePromptCache,
			awsBedrockEndpoint,
			awsProfile,
			awsUseProfile,
			awsAuthentication,
			vertexProjectId,
			vertexRegion,
			openAiBaseUrl,
			requestyBaseUrl,
			openAiHeaders: openAiHeaders || {},
			ollamaBaseUrl,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			lmStudioMaxTokens,
			anthropicBaseUrl,
			geminiBaseUrl,
			qwenApiLine,
			moonshotApiLine,
			zaiApiLine,
			azureApiVersion,
			openRouterProviderSorting,
			liteLlmBaseUrl,
			liteLlmUsePromptCache,
			caretBaseUrl, // caret
			caretUsePromptCache, // caret
			caretUserProfile, // caret
			fireworksModelMaxCompletionTokens,
			fireworksModelMaxTokens,
			asksageApiUrl,
			favoritedModelIds: favoritedModelIds || [],
			requestTimeoutMs,
			sapAiCoreBaseUrl,
			sapAiCoreTokenUrl,
			sapAiResourceGroup,
			difyBaseUrl,
			sapAiCoreUseOrchestrationMode: sapAiCoreUseOrchestrationMode ?? true,
			ocaBaseUrl,
			// Plan mode configurations
			planModeApiProvider: planModeApiProvider || apiProvider,
			planModeApiModelId,
			// undefined means it was never modified, 0 means it was turned off
			// (having this on by default ensures that <thinking> text does not pollute the user's chat and is instead rendered as reasoning)
			planModeThinkingBudgetTokens: planModeThinkingBudgetTokens ?? ANTHROPIC_MIN_THINKING_BUDGET,
			planModeReasoningEffort,
			planModeVsCodeLmModelSelector,
			planModeAwsBedrockCustomSelected,
			planModeAwsBedrockCustomModelBaseId,
			planModeOpenRouterModelId,
			planModeOpenRouterModelInfo,
			planModeOpenAiModelId,
			planModeOpenAiModelInfo,
			planModeOllamaModelId,
			planModeLmStudioModelId,
			planModeLiteLlmModelId,
			planModeLiteLlmModelInfo,
			planModeCaretModelId, // caret
			planModeCaretModelInfo, // caret
			planModeRequestyModelId,
			planModeRequestyModelInfo,
			planModeTogetherModelId,
			planModeFireworksModelId: planModeFireworksModelId || fireworksDefaultModelId,
			planModeSapAiCoreModelId,
			planModeSapAiCoreDeploymentId,
			planModeGroqModelId,
			planModeGroqModelInfo,
			planModeHuggingFaceModelId,
			planModeHuggingFaceModelInfo,
			planModeHuaweiCloudMaasModelId,
			planModeHuaweiCloudMaasModelInfo,
			planModeBasetenModelId,
			planModeBasetenModelInfo,
			planModeVercelAiGatewayModelId,
			planModeVercelAiGatewayModelInfo,
			planModeOcaModelId,
			planModeOcaModelInfo,
			// Act mode configurations
			actModeApiProvider: actModeApiProvider || apiProvider,
			actModeApiModelId,
			actModeThinkingBudgetTokens: actModeThinkingBudgetTokens ?? ANTHROPIC_MIN_THINKING_BUDGET,
			actModeReasoningEffort,
			actModeVsCodeLmModelSelector,
			actModeAwsBedrockCustomSelected,
			actModeAwsBedrockCustomModelBaseId,
			actModeOpenRouterModelId,
			actModeOpenRouterModelInfo,
			actModeOpenAiModelId,
			actModeOpenAiModelInfo,
			actModeOllamaModelId,
			actModeLmStudioModelId,
			actModeLiteLlmModelId,
			actModeLiteLlmModelInfo,
			actModeCaretModelId, // caret
			actModeCaretModelInfo, // caret
			actModeRequestyModelId,
			actModeRequestyModelInfo,
			actModeTogetherModelId,
			actModeFireworksModelId: actModeFireworksModelId || fireworksDefaultModelId,
			actModeSapAiCoreModelId,
			actModeSapAiCoreDeploymentId,
			actModeGroqModelId,
			actModeGroqModelInfo,
			actModeHuggingFaceModelId,
			actModeHuggingFaceModelInfo,
			actModeHuaweiCloudMaasModelId,
			actModeHuaweiCloudMaasModelInfo,
			actModeBasetenModelId,
			actModeBasetenModelInfo,
			actModeVercelAiGatewayModelId,
			actModeVercelAiGatewayModelInfo,
			actModeOcaModelId,
			actModeOcaModelInfo,

			// Other global fields
			focusChainSettings: focusChainSettings || DEFAULT_FOCUS_CHAIN_SETTINGS,
			dictationSettings: { ...DEFAULT_DICTATION_SETTINGS, ...dictationSettings },
			strictPlanModeEnabled: strictPlanModeEnabled ?? true,
			yoloModeToggled: yoloModeToggled ?? false,
			useAutoCondense: useAutoCondense ?? false,
			isNewUser: isNewUser ?? true,
			welcomeViewCompleted,
			lastShownAnnouncementId,
			taskHistory: taskHistory || [],
			autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS, // default value can be 0 or empty string
			globalClineRulesToggles: globalClineRulesToggles || {},
			browserSettings: { ...DEFAULT_BROWSER_SETTINGS, ...browserSettings }, // this will ensure that older versions of browserSettings (e.g. before remoteBrowserEnabled was added) are merged with the default values (false for remoteBrowserEnabled)
			preferredLanguage: preferredLanguage || "English",
			openaiReasoningEffort: (openaiReasoningEffort as OpenaiReasoningEffort) || "medium",
			mode: mode || "act",
			userInfo,
			mcpMarketplaceEnabled: mcpMarketplaceEnabledRaw ?? true,
			mcpDisplayMode: mcpDisplayMode ?? DEFAULT_MCP_DISPLAY_MODE,
			mcpResponsesCollapsed: mcpResponsesCollapsed,
			telemetrySetting: telemetrySetting || "unset",
			planActSeparateModelsSetting: planActSeparateModelsSetting ?? false,
			enableCheckpointsSetting: enableCheckpointsSettingRaw ?? true,
			shellIntegrationTimeout: shellIntegrationTimeout || 4000,
			terminalReuseEnabled: terminalReuseEnabled ?? true,
			terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
			defaultTerminalProfile: defaultTerminalProfile ?? "default",
			globalWorkflowToggles: globalWorkflowToggles || {},
			mcpMarketplaceCatalog,
			qwenCodeOauthPath,
			customPrompt,
			autoCondenseThreshold: autoCondenseThreshold || 0.75, // default to 0.75 if not set
			lastDismissedInfoBannerVersion: lastDismissedInfoBannerVersion ?? 0,
			lastDismissedModelBannerVersion: lastDismissedModelBannerVersion ?? 0,
			// Multi-root workspace support
			workspaceRoots,
			primaryRootIndex: primaryRootIndex ?? 0,
			// Feature flag - defaults to false
			// For now, always return false to disable multi-root support by default
			multiRootEnabled: !!multiRootEnabled,
			// CARET MODIFICATION: Caret 전역 브랜드 모드 시스템 (Caret/Cline 구분)
			caretModeSystem: modeSystem || "caret",
			// CARET MODIFICATION: Persona system settings with brand configuration
			enablePersonaSystem:
				enablePersonaSystem ??
				(() => {
					const featureConfig = getCurrentFeatureConfig()
					return (modeSystem || "caret") === "caret" && featureConfig.defaultPersonaEnabled
				})(),
			currentPersona: currentPersona,
			personaProfile: personaProfile,
			// CARET MODIFICATION: Input history for chat persistence
			inputHistory: inputHistory,
		}
	} catch (error) {
		console.error("[StateHelpers] Failed to read global state:", error)
		throw error
	}
}

export async function resetWorkspaceState(controller: Controller) {
	const context = controller.context
	await Promise.all(context.workspaceState.keys().map((key) => controller.context.workspaceState.update(key, undefined)))

	// CARET MODIFICATION: Reset Caret-specific workspace settings to defaults
	await context.workspaceState.update("caret.promptSystem.mode", "caret")

	await controller.reInitialize()
}

export async function resetGlobalState(controller: Controller) {
	// TODO: Reset all workspace states?
	const context = controller.context

	await Promise.all(context.globalState.keys().map((key) => context.globalState.update(key, undefined)))

	// CARET MODIFICATION: Reset Caret-specific global settings to defaults after clearing
	await context.globalState.update("caretModeSystem", "caret")
	// Reset persona system based on brand configuration
	const featureConfig = getCurrentFeatureConfig()
	await context.globalState.update("enablePersonaSystem", featureConfig.defaultPersonaEnabled)
	// Also reset workspace promptSystem mode to ensure consistency
	await context.workspaceState.update("caret.promptSystem.mode", "caret")

	const secretKeys: SecretKey[] = [
		"apiKey",
		"openRouterApiKey",
		"awsAccessKey",
		"awsSecretKey",
		"awsSessionToken",
		"awsBedrockApiKey",
		"openAiApiKey",
		"ollamaApiKey",
		"geminiApiKey",
		"openAiNativeApiKey",
		"deepSeekApiKey",
		"requestyApiKey",
		"togetherApiKey",
		"qwenApiKey",
		"doubaoApiKey",
		"mistralApiKey",
		"clineAccountId",
		"liteLlmApiKey",
		"fireworksApiKey",
		"asksageApiKey",
		"xaiApiKey",
		"sambanovaApiKey",
		"cerebrasApiKey",
		"groqApiKey",
		"basetenApiKey",
		"moonshotApiKey",
		"nebiusApiKey",
		"huggingFaceApiKey",
		"huaweiCloudMaasApiKey",
		"vercelAiGatewayApiKey",
		"zaiApiKey",
		"difyApiKey",
		"ocaApiKey",
		"ocaRefreshToken",
		"caretApiKey", // caret
		"caretAuthToken", // caret
	]
	await Promise.all(secretKeys.map((key) => context.secrets.delete(key)))
	await controller.reInitialize()
}
