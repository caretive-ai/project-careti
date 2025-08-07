import * as vscode from "vscode"
import * as path from "path"
import fs from "fs/promises"
import { Mode, OpenaiReasoningEffort, ChatSettings, DEFAULT_CHAT_SETTINGS } from "@shared/storage/types"
import { DEFAULT_BROWSER_SETTINGS } from "@shared/BrowserSettings"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings"
import { GlobalStateKey, LocalStateKey, SecretKey } from "./state-keys"
import { ApiConfiguration, ApiProvider, BedrockModelId, ModelInfo } from "@shared/api"
import { HistoryItem } from "@shared/HistoryItem"
import { AutoApprovalSettings } from "@shared/AutoApprovalSettings"
import { BrowserSettings } from "@shared/BrowserSettings"
import { TelemetrySetting } from "@shared/TelemetrySetting"
import { UserInfo } from "@shared/UserInfo"
import { ClineRulesToggles } from "@shared/cline-rules"
import { DEFAULT_MCP_DISPLAY_MODE, McpDisplayMode } from "@shared/McpDisplayMode"
import { ensureRulesDirectoryExists } from "./disk"
import { Controller } from "../controller"

/*
	Storage
	https://dev.to/kompotkot/how-to-use-secretstorage-in-your-vscode-extensions-2hco
	https://www.eliostruyf.com/devhack-code-extension-storage-options/
*/

const isTemporaryProfile = process.env.TEMP_PROFILE === "true"

// In-memory storage for temporary profiles
const inMemoryGlobalState = new Map<string, any>()
const inMemoryWorkspaceState = new Map<string, any>()
const inMemorySecrets = new Map<string, string>()

// global
export async function updateGlobalState(context: vscode.ExtensionContext, key: GlobalStateKey, value: any) {
	if (isTemporaryProfile) {
		inMemoryGlobalState.set(key, value)
		return
	}
	await context.globalState.update(key, value)
}

export async function getGlobalState(context: vscode.ExtensionContext, key: GlobalStateKey) {
	if (isTemporaryProfile) {
		return inMemoryGlobalState.get(key)
	}
	return await context.globalState.get(key)
}

// Batched operations for performance optimization
export async function updateGlobalStateBatch(context: vscode.ExtensionContext, updates: Record<string, any>) {
	if (isTemporaryProfile) {
		Object.entries(updates).forEach(([key, value]) => {
			inMemoryGlobalState.set(key, value)
		})
		return
	}
	// Use Promise.all to batch the updates
	await Promise.all(Object.entries(updates).map(([key, value]) => context.globalState.update(key as GlobalStateKey, value)))
}

export async function updateSecretsBatch(context: vscode.ExtensionContext, updates: Record<string, string | undefined>) {
	if (isTemporaryProfile) {
		Object.entries(updates).forEach(([key, value]) => {
			if (value) {
				inMemorySecrets.set(key, value)
			} else {
				inMemorySecrets.delete(key)
			}
		})
		return
	}
	// Use Promise.all to batch the secret updates
	await Promise.all(Object.entries(updates).map(([key, value]) => storeSecret(context, key as SecretKey, value)))
}

// secrets
export async function storeSecret(context: vscode.ExtensionContext, key: SecretKey, value?: string) {
	if (isTemporaryProfile) {
		if (value) {
			inMemorySecrets.set(key, value)
		} else {
			inMemorySecrets.delete(key)
		}
		return
	}
	if (value) {
		await context.secrets.store(key, value)
	} else {
		await context.secrets.delete(key)
	}
}

export async function getSecret(context: vscode.ExtensionContext, key: SecretKey) {
	if (isTemporaryProfile) {
		return inMemorySecrets.get(key)
	}
	return await context.secrets.get(key)
}

// workspace
export async function updateWorkspaceState(context: vscode.ExtensionContext, key: LocalStateKey, value: any) {
	if (isTemporaryProfile) {
		inMemoryWorkspaceState.set(key, value)
		return
	}
	await context.workspaceState.update(key, value)
}

export async function getWorkspaceState(context: vscode.ExtensionContext, key: LocalStateKey) {
	if (isTemporaryProfile) {
		return inMemoryWorkspaceState.get(key)
	}
	return await context.workspaceState.get(key)
}

// CARET MODIFICATION: UI Language specific storage functions (app-wide)
export async function getUILanguage(context: vscode.ExtensionContext): Promise<string> {
	const uiLanguage = (await getGlobalState(context, "uiLanguage")) as string | undefined
	if (uiLanguage) {
		return uiLanguage
	}

	// CARET MODIFICATION: VSCode 언어 설정 따라가기
	const vscodeLocale = vscode.env.language || "en"
	const detectedLanguage = vscodeLocale.split("-")[0] // ko-KR -> ko

	const supportedLanguages = ["ko", "en", "ja", "zh"]
	const finalLanguage = supportedLanguages.includes(detectedLanguage) ? detectedLanguage : "en"

	return finalLanguage
}

export async function updateUILanguage(context: vscode.ExtensionContext, uiLanguage: string) {
	await updateGlobalState(context, "uiLanguage", uiLanguage)
}

// UPSTREAM MIGRATION
async function migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw: boolean | undefined): Promise<boolean> {
	const config = vscode.workspace.getConfiguration("cline")
	const mcpMarketplaceEnabled = config.get<boolean>("mcpMarketplace.enabled")
	if (mcpMarketplaceEnabled !== undefined) {
		await config.update("mcpMarketplace.enabled", undefined, true)
		return !mcpMarketplaceEnabled
	}
	return mcpMarketplaceEnabledRaw ?? true
}

// UPSTREAM MIGRATION
async function migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw: boolean | undefined): Promise<boolean> {
	const config = vscode.workspace.getConfiguration("cline")
	const enableCheckpoints = config.get<boolean>("enableCheckpoints")
	if (enableCheckpoints !== undefined) {
		await config.update("enableCheckpoints", undefined, true)
		return enableCheckpoints
	}
	return enableCheckpointsSettingRaw ?? true
}

// CARET MIGRATION
export async function migrateCustomInstructionsToGlobalRules(context: vscode.ExtensionContext) {
	try {
		const customInstructions = (await context.globalState.get("customInstructions")) as string | undefined

		if (customInstructions?.trim()) {
			console.log("Migrating custom instructions to global Cline rules...")
			const globalRulesDir = await ensureRulesDirectoryExists()
			const migrationFileName = "custom_instructions.md"
			const migrationFilePath = path.join(globalRulesDir, migrationFileName)

			try {
				let existingContent = ""
				try {
					existingContent = await fs.readFile(migrationFilePath, "utf8")
				} catch (readError) {
					// File doesn't exist, which is fine
				}
				const contentToWrite = existingContent
					? `${existingContent}\n\n---\n\n${customInstructions.trim()}`
					: customInstructions.trim()
				await fs.writeFile(migrationFilePath, contentToWrite)
			} catch (fileError) {
				console.error("Failed to write migration file:", fileError)
				return
			}
			await context.globalState.update("customInstructions", undefined)
		}
	} catch (error) {
		console.error("Failed to migrate custom instructions to global rules:", error)
	}
}

// MERGED FUNCTION
export async function getAllExtensionState(context: vscode.ExtensionContext) {
	const [
		isNewUser,
		welcomeViewCompleted,
		apiKey,
		openRouterApiKey,
		clineAccountId,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
		awsRegion,
		awsUseCrossRegionInference,
		awsBedrockUsePromptCache,
		awsBedrockEndpoint,
		awsProfile,
		awsBedrockApiKey,
		awsUseProfile,
		awsAuthentication,
		vertexProjectId,
		vertexRegion,
		openAiBaseUrl,
		openAiApiKey,
		openAiHeaders,
		ollamaBaseUrl,
		ollamaApiOptionsCtxNum,
		lmStudioBaseUrl,
		anthropicBaseUrl,
		geminiApiKey,
		geminiBaseUrl,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		togetherApiKey,
		qwenApiKey,
		doubaoApiKey,
		mistralApiKey,
		azureApiVersion,
		openRouterProviderSorting,
		lastShownAnnouncementId,
		taskHistory,
		autoApprovalSettings,
		browserSettings,
		liteLlmBaseUrl,
		liteLlmUsePromptCache,
		fireworksApiKey,
		fireworksModelMaxCompletionTokens,
		fireworksModelMaxTokens,
		userInfo,
		qwenApiLine,
		moonshotApiLine,
		liteLlmApiKey,
		telemetrySetting,
		asksageApiKey,
		asksageApiUrl,
		xaiApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		groqApiKey,
		basetenApiKey,
		moonshotApiKey,
		nebiusApiKey,
		huggingFaceApiKey,
		planActSeparateModelsSettingRaw,
		favoritedModelIds,
		globalClineRulesToggles,
		requestTimeoutMs,
		shellIntegrationTimeout,
		enableCheckpointsSettingRaw,
		mcpMarketplaceEnabledRaw,
		mcpDisplayMode,
		mcpResponsesCollapsedRaw,
		globalWorkflowToggles,
		terminalReuseEnabled,
		terminalOutputLineLimit,
		defaultTerminalProfile,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		sapAiCoreBaseUrl,
		sapAiCoreTokenUrl,
		sapAiResourceGroup,
		claudeCodePath,
		huaweiCloudMaasApiKey,
        // CARET ADDITIONS
        caretApiKey,
        plan,
        isPayAsYouGo,
        lastApiProvider,
        lastApiModelId,
	] = await Promise.all([
		getGlobalState(context, "isNewUser") as Promise<boolean | undefined>,
		getGlobalState(context, "welcomeViewCompleted") as Promise<boolean | undefined>,
		getSecret(context, "apiKey") as Promise<string | undefined>,
		getSecret(context, "openRouterApiKey") as Promise<string | undefined>,
		getSecret(context, "clineAccountId") as Promise<string | undefined>,
		getSecret(context, "awsAccessKey") as Promise<string | undefined>,
		getSecret(context, "awsSecretKey") as Promise<string | undefined>,
		getSecret(context, "awsSessionToken") as Promise<string | undefined>,
		getGlobalState(context, "awsRegion") as Promise<string | undefined>,
		getGlobalState(context, "awsUseCrossRegionInference") as Promise<boolean | undefined>,
		getGlobalState(context, "awsBedrockUsePromptCache") as Promise<boolean | undefined>,
		getGlobalState(context, "awsBedrockEndpoint") as Promise<string | undefined>,
		getGlobalState(context, "awsProfile") as Promise<string | undefined>,
		getSecret(context, "awsBedrockApiKey") as Promise<string | undefined>,
		getGlobalState(context, "awsUseProfile") as Promise<boolean | undefined>,
		getGlobalState(context, "awsAuthentication") as Promise<string | undefined>,
		getGlobalState(context, "vertexProjectId") as Promise<string | undefined>,
		getGlobalState(context, "vertexRegion") as Promise<string | undefined>,
		getGlobalState(context, "openAiBaseUrl") as Promise<string | undefined>,
		getSecret(context, "openAiApiKey") as Promise<string | undefined>,
		getGlobalState(context, "openAiHeaders") as Promise<Record<string, string> | undefined>,
		getGlobalState(context, "ollamaBaseUrl") as Promise<string | undefined>,
		getGlobalState(context, "ollamaApiOptionsCtxNum") as Promise<string | undefined>,
		getGlobalState(context, "lmStudioBaseUrl") as Promise<string | undefined>,
		getGlobalState(context, "anthropicBaseUrl") as Promise<string | undefined>,
		getSecret(context, "geminiApiKey") as Promise<string | undefined>,
		getGlobalState(context, "geminiBaseUrl") as Promise<string | undefined>,
		getSecret(context, "openAiNativeApiKey") as Promise<string | undefined>,
		getSecret(context, "deepSeekApiKey") as Promise<string | undefined>,
		getSecret(context, "requestyApiKey") as Promise<string | undefined>,
		getSecret(context, "togetherApiKey") as Promise<string | undefined>,
		getSecret(context, "qwenApiKey") as Promise<string | undefined>,
		getSecret(context, "doubaoApiKey") as Promise<string | undefined>,
		getSecret(context, "mistralApiKey") as Promise<string | undefined>,
		getGlobalState(context, "azureApiVersion") as Promise<string | undefined>,
		getGlobalState(context, "openRouterProviderSorting") as Promise<string | undefined>,
		getGlobalState(context, "lastShownAnnouncementId") as Promise<string | undefined>,
		getGlobalState(context, "taskHistory") as Promise<HistoryItem[] | undefined>,
		getGlobalState(context, "autoApprovalSettings") as Promise<AutoApprovalSettings | undefined>,
		getGlobalState(context, "browserSettings") as Promise<BrowserSettings | undefined>,
		getGlobalState(context, "liteLlmBaseUrl") as Promise<string | undefined>,
		getGlobalState(context, "liteLlmUsePromptCache") as Promise<boolean | undefined>,
		getSecret(context, "fireworksApiKey") as Promise<string | undefined>,
		getGlobalState(context, "fireworksModelMaxCompletionTokens") as Promise<number | undefined>,
		getGlobalState(context, "fireworksModelMaxTokens") as Promise<number | undefined>,
		getGlobalState(context, "userInfo") as Promise<UserInfo | undefined>,
		getGlobalState(context, "qwenApiLine") as Promise<string | undefined>,
		getGlobalState(context, "moonshotApiLine") as Promise<string | undefined>,
		getSecret(context, "liteLlmApiKey") as Promise<string | undefined>,
		getGlobalState(context, "telemetrySetting") as Promise<TelemetrySetting | undefined>,
		getSecret(context, "asksageApiKey") as Promise<string | undefined>,
		getGlobalState(context, "asksageApiUrl") as Promise<string | undefined>,
		getSecret(context, "xaiApiKey") as Promise<string | undefined>,
		getSecret(context, "sambanovaApiKey") as Promise<string | undefined>,
		getSecret(context, "cerebrasApiKey") as Promise<string | undefined>,
		getSecret(context, "groqApiKey") as Promise<string | undefined>,
		getSecret(context, "basetenApiKey") as Promise<string | undefined>,
		getSecret(context, "moonshotApiKey") as Promise<string | undefined>,
		getSecret(context, "nebiusApiKey") as Promise<string | undefined>,
		getSecret(context, "huggingFaceApiKey") as Promise<string | undefined>,
		getGlobalState(context, "planActSeparateModelsSetting") as Promise<boolean | undefined>,
		getGlobalState(context, "favoritedModelIds") as Promise<string[] | undefined>,
		getGlobalState(context, "globalClineRulesToggles") as Promise<ClineRulesToggles | undefined>,
		getGlobalState(context, "requestTimeoutMs") as Promise<number | undefined>,
		getGlobalState(context, "shellIntegrationTimeout") as Promise<number | undefined>,
		getGlobalState(context, "enableCheckpointsSetting") as Promise<boolean | undefined>,
		getGlobalState(context, "mcpMarketplaceEnabled") as Promise<boolean | undefined>,
		getGlobalState(context, "mcpDisplayMode") as Promise<McpDisplayMode | undefined>,
		getGlobalState(context, "mcpResponsesCollapsed") as Promise<boolean | undefined>,
		getGlobalState(context, "globalWorkflowToggles") as Promise<ClineRulesToggles | undefined>,
		getGlobalState(context, "terminalReuseEnabled") as Promise<boolean | undefined>,
		getGlobalState(context, "terminalOutputLineLimit") as Promise<number | undefined>,
		getGlobalState(context, "defaultTerminalProfile") as Promise<string | undefined>,
		getSecret(context, "sapAiCoreClientId") as Promise<string | undefined>,
		getSecret(context, "sapAiCoreClientSecret") as Promise<string | undefined>,
		getGlobalState(context, "sapAiCoreBaseUrl") as Promise<string | undefined>,
		getGlobalState(context, "sapAiCoreTokenUrl") as Promise<string | undefined>,
		getGlobalState(context, "sapAiResourceGroup") as Promise<string | undefined>,
		getGlobalState(context, "claudeCodePath") as Promise<string | undefined>,
		getSecret(context, "huaweiCloudMaasApiKey") as Promise<string | undefined>,
        // CARET ADDITIONS
        getSecret(context, "caretApiKey") as Promise<string | undefined>,
        getGlobalState(context, "plan") as Promise<string | undefined>,
        getGlobalState(context, "isPayAsYouGo") as Promise<boolean | undefined>,
        getGlobalState(context, "lastApiProvider") as Promise<ApiProvider | undefined>,
        getGlobalState(context, "lastApiModelId") as Promise<string | undefined>,
	]);

	const [
        localClineRulesToggles,
        localCaretRulesToggles, // CARET ADDITION
        localWindsurfRulesToggles, 
        localCursorRulesToggles, 
        localWorkflowToggles,
        // UPSTREAM ADDITIONS
        preferredLanguage,
		openaiReasoningEffort,
		mode,
		strictPlanModeEnabled,
		// Plan mode configurations
		planModeApiProvider,
		planModeApiModelId,
		planModeThinkingBudgetTokens,
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
		planModeRequestyModelId,
		planModeRequestyModelInfo,
		planModeTogetherModelId,
		planModeFireworksModelId,
		planModeSapAiCoreModelId,
		planModeGroqModelId,
		planModeGroqModelInfo,
		planModeBasetenModelId,
		planModeBasetenModelInfo,
		planModeHuggingFaceModelId,
		planModeHuggingFaceModelInfo,
		planModeHuaweiCloudMaasModelId,
		planModeHuaweiCloudMaasModelInfo,
		// Act mode configurations
		actModeApiProvider,
		actModeApiModelId,
		actModeThinkingBudgetTokens,
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
		actModeRequestyModelId,
		actModeRequestyModelInfo,
		actModeTogetherModelId,
		actModeFireworksModelId,
		actModeSapAiCoreModelId,
		actModeGroqModelId,
		actModeGroqModelInfo,
		actModeBasetenModelId,
		actModeBasetenModelInfo,
		actModeHuggingFaceModelId,
		actModeHuggingFaceModelInfo,
		actModeHuaweiCloudMaasModelId,
		actModeHuaweiCloudMaasModelInfo,
    ] = await Promise.all([
		getWorkspaceState(context, "localClineRulesToggles") as Promise<ClineRulesToggles | undefined>,
		getWorkspaceState(context, "localCaretRulesToggles") as Promise<ClineRulesToggles | undefined>, // CARET ADDITION
		getWorkspaceState(context, "localWindsurfRulesToggles") as Promise<ClineRulesToggles | undefined>,
		getWorkspaceState(context, "localCursorRulesToggles") as Promise<ClineRulesToggles | undefined>,
		getWorkspaceState(context, "workflowToggles") as Promise<ClineRulesToggles | undefined>,
        // UPSTREAM ADDITIONS
        getGlobalState(context, "preferredLanguage") as Promise<string | undefined>,
		getGlobalState(context, "openaiReasoningEffort") as Promise<OpenaiReasoningEffort | undefined>,
		getGlobalState(context, "mode") as Promise<Mode | undefined>,
		getGlobalState(context, "strictPlanModeEnabled") as Promise<boolean | undefined>,
		// Plan mode configurations
		getGlobalState(context, "planModeApiProvider") as Promise<ApiProvider | undefined>,
		getGlobalState(context, "planModeApiModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeThinkingBudgetTokens") as Promise<number | undefined>,
		getGlobalState(context, "planModeReasoningEffort") as Promise<string | undefined>,
		getGlobalState(context, "planModeVsCodeLmModelSelector") as Promise<vscode.LanguageModelChatSelector | undefined>,
		getGlobalState(context, "planModeAwsBedrockCustomSelected") as Promise<boolean | undefined>,
		getGlobalState(context, "planModeAwsBedrockCustomModelBaseId") as Promise<BedrockModelId | undefined>,
		getGlobalState(context, "planModeOpenRouterModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeOpenRouterModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeOpenAiModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeOpenAiModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeOllamaModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeLmStudioModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeLiteLlmModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeLiteLlmModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeRequestyModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeRequestyModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeTogetherModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeFireworksModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeSapAiCoreModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeGroqModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeGroqModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeBasetenModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeBasetenModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeHuggingFaceModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeHuggingFaceModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "planModeHuaweiCloudMaasModelId") as Promise<string | undefined>,
		getGlobalState(context, "planModeHuaweiCloudMaasModelInfo") as Promise<ModelInfo | undefined>,
		// Act mode configurations
		getGlobalState(context, "actModeApiProvider") as Promise<ApiProvider | undefined>,
		getGlobalState(context, "actModeApiModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeThinkingBudgetTokens") as Promise<number | undefined>,
		getGlobalState(context, "actModeReasoningEffort") as Promise<string | undefined>,
		getGlobalState(context, "actModeVsCodeLmModelSelector") as Promise<vscode.LanguageModelChatSelector | undefined>,
		getGlobalState(context, "actModeAwsBedrockCustomSelected") as Promise<boolean | undefined>,
		getGlobalState(context, "actModeAwsBedrockCustomModelBaseId") as Promise<BedrockModelId | undefined>,
		getGlobalState(context, "actModeOpenRouterModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeOpenRouterModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeOpenAiModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeOpenAiModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeOllamaModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeLmStudioModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeLiteLlmModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeLiteLlmModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeRequestyModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeRequestyModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeTogetherModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeFireworksModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeSapAiCoreModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeGroqModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeGroqModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeBasetenModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeBasetenModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeHuggingFaceModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeHuggingFaceModelInfo") as Promise<ModelInfo | undefined>,
		getGlobalState(context, "actModeHuaweiCloudMaasModelId") as Promise<string | undefined>,
		getGlobalState(context, "actModeHuaweiCloudMaasModelInfo") as Promise<ModelInfo | undefined>,
	]);

	let apiProvider: ApiProvider
	if (planModeApiProvider) {
		apiProvider = planModeApiProvider
    } else if (lastApiProvider) { // CARET FALLBACK
        apiProvider = lastApiProvider
	} else {
		if (apiKey) {
			apiProvider = "anthropic"
		} else {
			apiProvider = "openrouter"
		}
	}

	const mcpMarketplaceEnabled = await migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw)
	const enableCheckpointsSetting = await migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw)
	const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false

	let planActSeparateModelsSetting: boolean | undefined = undefined
	if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
		planActSeparateModelsSetting = planActSeparateModelsSettingRaw
	} else {
		if (planModeApiProvider) {
			planActSeparateModelsSetting = true
		} else {
			planActSeparateModelsSetting = false
		}
		await updateGlobalState(context, "planActSeparateModelsSetting", planActSeparateModelsSetting)
	}
    
    const uiLanguage = await getUILanguage(context); // CARET: Get UI Language

	return {
		apiConfiguration: {
			apiKey,
			openRouterApiKey,
			clineAccountId,
			claudeCodePath,
			awsAccessKey,
			awsSecretKey,
			awsSessionToken,
			awsRegion,
			awsUseCrossRegionInference,
			awsBedrockUsePromptCache,
			awsBedrockEndpoint,
			awsProfile,
			awsBedrockApiKey,
			awsUseProfile,
			awsAuthentication,
			vertexProjectId,
			vertexRegion,
			openAiBaseUrl,
			openAiApiKey,
			openAiHeaders: openAiHeaders || {},
			ollamaBaseUrl,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			anthropicBaseUrl,
			geminiApiKey,
			geminiBaseUrl,
			openAiNativeApiKey,
			deepSeekApiKey,
			requestyApiKey,
			togetherApiKey,
			qwenApiKey,
			qwenApiLine,
			moonshotApiLine,
			doubaoApiKey,
			mistralApiKey,
			azureApiVersion,
			openRouterProviderSorting,
			liteLlmBaseUrl,
			liteLlmApiKey,
			liteLlmUsePromptCache,
			fireworksApiKey,
			fireworksModelMaxCompletionTokens,
			fireworksModelMaxTokens,
			asksageApiKey,
			asksageApiUrl,
			xaiApiKey,
			sambanovaApiKey,
			cerebrasApiKey,
			groqApiKey,
			basetenApiKey,
			moonshotApiKey,
			nebiusApiKey,
			favoritedModelIds,
			requestTimeoutMs,
			sapAiCoreClientId,
			sapAiCoreClientSecret,
			sapAiCoreBaseUrl,
			sapAiCoreTokenUrl,
			sapAiResourceGroup,
			huggingFaceApiKey,
			huaweiCloudMaasApiKey,
            caretApiKey, // CARET
			// Plan mode configurations
			planModeApiProvider: planModeApiProvider || apiProvider,
			planModeApiModelId: planModeApiModelId || lastApiModelId, // CARET FALLBACK
			planModeThinkingBudgetTokens,
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
			planModeRequestyModelId,
			planModeRequestyModelInfo,
			planModeTogetherModelId,
			planModeFireworksModelId,
			planModeSapAiCoreModelId,
			planModeGroqModelId,
			planModeGroqModelInfo,
			planModeBasetenModelId,
			planModeBasetenModelInfo,
			planModeHuggingFaceModelId,
			planModeHuggingFaceModelInfo,
			planModeHuaweiCloudMaasModelId,
			planModeHuaweiCloudMaasModelInfo,
			// Act mode configurations
			actModeApiProvider: actModeApiProvider || apiProvider,
			actModeApiModelId,
			actModeThinkingBudgetTokens,
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
			actModeRequestyModelId,
			actModeRequestyModelInfo,
			actModeTogetherModelId,
			actModeFireworksModelId,
			actModeSapAiCoreModelId,
			actModeGroqModelId,
			actModeGroqModelInfo,
			actModeBasetenModelId,
			actModeBasetenModelInfo,
			actModeHuggingFaceModelId,
			actModeHuggingFaceModelInfo,
			actModeHuaweiCloudMaasModelId,
			actModeHuaweiCloudMaasModelInfo,
		},
		isNewUser: isNewUser ?? true,
		welcomeViewCompleted,
		lastShownAnnouncementId,
		taskHistory,
		autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS,
		globalClineRulesToggles: globalClineRulesToggles || {},
		browserSettings: { ...DEFAULT_BROWSER_SETTINGS, ...browserSettings },
        // MERGED
        chatSettings: {
			...DEFAULT_CHAT_SETTINGS,
            preferredLanguage: preferredLanguage || uiLanguage, // CARET: Use uiLanguage as fallback
            openaiReasoningEffort: (openaiReasoningEffort as OpenaiReasoningEffort) || "medium",
            uiLanguage: uiLanguage,
        },
        mode: mode || "agent", // CARET: default to agent
		strictPlanModeEnabled: strictPlanModeEnabled ?? false,
		userInfo,
		mcpMarketplaceEnabled: mcpMarketplaceEnabled,
		mcpDisplayMode: mcpDisplayMode ?? DEFAULT_MCP_DISPLAY_MODE,
		mcpResponsesCollapsed: mcpResponsesCollapsed,
		telemetrySetting: telemetrySetting || "unset",
		planActSeparateModelsSetting,
		enableCheckpointsSetting: enableCheckpointsSetting,
		shellIntegrationTimeout: shellIntegrationTimeout || 4000,
		terminalReuseEnabled: terminalReuseEnabled ?? true,
		terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
		defaultTerminalProfile: defaultTerminalProfile ?? "default",
		globalWorkflowToggles: globalWorkflowToggles || {},
        localClineRulesToggles: localClineRulesToggles || {},
		localWindsurfRulesToggles: localWindsurfRulesToggles || {},
		localCursorRulesToggles: localCursorRulesToggles || {},
		localWorkflowToggles: localWorkflowToggles || {},
        // CARET ADDITIONS
        localCaretRulesToggles: localCaretRulesToggles || {},
        plan,
        isPayAsYouGo,
	}
}

// CARET: This function is heavily modified, but we need to keep it and merge the new keys.
export async function updateApiConfiguration(context: vscode.ExtensionContext, apiConfiguration: ApiConfiguration) {
	const {
		// This is a huge list, let's just get all keys
        ...rest
	} = apiConfiguration

    const planMode = (rest.mode === 'plan' || rest.mode === 'chatbot'); // CARET: chatbot maps to plan

    const updates: Record<string, any> = {};
    const secretUpdates: Record<string, string | undefined> = {};

    // Global State
    updates['awsRegion'] = rest.awsRegion;
    updates['awsUseCrossRegionInference'] = rest.awsUseCrossRegionInference;
    updates['awsBedrockUsePromptCache'] = rest.awsBedrockUsePromptCache;
    updates['awsBedrockEndpoint'] = rest.awsBedrockEndpoint;
    updates['awsProfile'] = rest.awsProfile;
    updates['awsUseProfile'] = rest.awsUseProfile;
    updates['vertexProjectId'] = rest.vertexProjectId;
    updates['vertexRegion'] = rest.vertexRegion;
    updates['openAiBaseUrl'] = rest.openAiBaseUrl;
    updates['openAiHeaders'] = rest.openAiHeaders || {};
    updates['ollamaBaseUrl'] = rest.ollamaBaseUrl;
    updates['ollamaApiOptionsCtxNum'] = rest.ollamaApiOptionsCtxNum;
    updates['lmStudioBaseUrl'] = rest.lmStudioBaseUrl;
    updates['anthropicBaseUrl'] = rest.anthropicBaseUrl;
    updates['geminiBaseUrl'] = rest.geminiBaseUrl;
    updates['azureApiVersion'] = rest.azureApiVersion;
    updates['openRouterProviderSorting'] = rest.openRouterProviderSorting;
    updates['liteLlmBaseUrl'] = rest.liteLlmBaseUrl;
    updates['liteLlmUsePromptCache'] = rest.liteLlmUsePromptCache;
    updates['qwenApiLine'] = rest.qwenApiLine;
    updates['moonshotApiLine'] = rest.moonshotApiLine;
    updates['asksageApiUrl'] = rest.asksageApiUrl;
    updates['favoritedModelIds'] = rest.favoritedModelIds;
    updates['requestTimeoutMs'] = rest.requestTimeoutMs;
    updates['fireworksModelMaxCompletionTokens'] = rest.fireworksModelMaxCompletionTokens;
    updates['fireworksModelMaxTokens'] = rest.fireworksModelMaxTokens;
    updates['sapAiCoreBaseUrl'] = rest.sapAiCoreBaseUrl;
    updates['sapAiCoreTokenUrl'] = rest.sapAiCoreTokenUrl;
    updates['sapAiResourceGroup'] = rest.sapAiResourceGroup;
    updates['claudeCodePath'] = rest.claudeCodePath;
    updates['strictPlanModeEnabled'] = rest.strictPlanModeEnabled;
    updates['preferredLanguage'] = rest.preferredLanguage;
    updates['openaiReasoningEffort'] = rest.openaiReasoningEffort;
    updates['mode'] = rest.mode;

    // Plan/Act Mode specific
    if (planMode) {
        updates['planModeApiProvider'] = rest.planModeApiProvider;
        updates['planModeApiModelId'] = rest.planModeApiModelId;
        updates['planModeThinkingBudgetTokens'] = rest.planModeThinkingBudgetTokens;
        updates['planModeReasoningEffort'] = rest.planModeReasoningEffort;
        updates['planModeVsCodeLmModelSelector'] = rest.planModeVsCodeLmModelSelector;
        updates['planModeAwsBedrockCustomSelected'] = rest.planModeAwsBedrockCustomSelected;
        updates['planModeAwsBedrockCustomModelBaseId'] = rest.planModeAwsBedrockCustomModelBaseId;
        updates['planModeOpenRouterModelId'] = rest.planModeOpenRouterModelId;
        updates['planModeOpenRouterModelInfo'] = rest.planModeOpenRouterModelInfo;
        updates['planModeOpenAiModelId'] = rest.planModeOpenAiModelId;
        updates['planModeOpenAiModelInfo'] = rest.planModeOpenAiModelInfo;
        updates['planModeOllamaModelId'] = rest.planModeOllamaModelId;
        updates['planModeLmStudioModelId'] = rest.planModeLmStudioModelId;
        updates['planModeLiteLlmModelId'] = rest.planModeLiteLlmModelId;
        updates['planModeLiteLlmModelInfo'] = rest.planModeLiteLlmModelInfo;
        updates['planModeRequestyModelId'] = rest.planModeRequestyModelId;
        updates['planModeRequestyModelInfo'] = rest.planModeRequestyModelInfo;
        updates['planModeTogetherModelId'] = rest.planModeTogetherModelId;
        updates['planModeFireworksModelId'] = rest.planModeFireworksModelId;
        updates['planModeSapAiCoreModelId'] = rest.planModeSapAiCoreModelId;
        updates['planModeGroqModelId'] = rest.planModeGroqModelId;
        updates['planModeGroqModelInfo'] = rest.planModeGroqModelInfo;
        updates['planModeBasetenModelId'] = rest.planModeBasetenModelId;
        updates['planModeBasetenModelInfo'] = rest.planModeBasetenModelInfo;
        updates['planModeHuggingFaceModelId'] = rest.planModeHuggingFaceModelId;
        updates['planModeHuggingFaceModelInfo'] = rest.planModeHuggingFaceModelInfo;
        updates['planModeHuaweiCloudMaasModelId'] = rest.planModeHuaweiCloudMaasModelId;
        updates['planModeHuaweiCloudMaasModelInfo'] = rest.planModeHuaweiCloudMaasModelInfo;
    } else { // actMode
        updates['actModeApiProvider'] = rest.actModeApiProvider;
        updates['actModeApiModelId'] = rest.actModeApiModelId;
        updates['actModeThinkingBudgetTokens'] = rest.actModeThinkingBudgetTokens;
        updates['actModeReasoningEffort'] = rest.actModeReasoningEffort;
        updates['actModeVsCodeLmModelSelector'] = rest.actModeVsCodeLmModelSelector;
        updates['actModeAwsBedrockCustomSelected'] = rest.actModeAwsBedrockCustomSelected;
        updates['actModeAwsBedrockCustomModelBaseId'] = rest.actModeAwsBedrockCustomModelBaseId;
        updates['actModeOpenRouterModelId'] = rest.actModeOpenRouterModelId;
        updates['actModeOpenRouterModelInfo'] = rest.actModeOpenRouterModelInfo;
        updates['actModeOpenAiModelId'] = rest.actModeOpenAiModelId;
        updates['actModeOpenAiModelInfo'] = rest.actModeOpenAiModelInfo;
        updates['actModeOllamaModelId'] = rest.actModeOllamaModelId;
        updates['actModeLmStudioModelId'] = rest.actModeLmStudioModelId;
        updates['actModeLiteLlmModelId'] = rest.actModeLiteLlmModelId;
        updates['actModeLiteLlmModelInfo'] = rest.actModeLiteLlmModelInfo;
        updates['actModeRequestyModelId'] = rest.actModeRequestyModelId;
        updates['actModeRequestyModelInfo'] = rest.actModeRequestyModelInfo;
        updates['actModeTogetherModelId'] = rest.actModeTogetherModelId;
        updates['actModeFireworksModelId'] = rest.actModeFireworksModelId;
        updates['actModeSapAiCoreModelId'] = rest.actModeSapAiCoreModelId;
        updates['actModeGroqModelId'] = rest.actModeGroqModelId;
        updates['actModeGroqModelInfo'] = rest.actModeGroqModelInfo;
        updates['actModeBasetenModelId'] = rest.actModeBasetenModelId;
        updates['actModeBasetenModelInfo'] = rest.actModeBasetenModelInfo;
        updates['actModeHuggingFaceModelId'] = rest.actModeHuggingFaceModelId;
        updates['actModeHuggingFaceModelInfo'] = rest.actModeHuggingFaceModelInfo;
        updates['actModeHuaweiCloudMaasModelId'] = rest.actModeHuaweiCloudMaasModelId;
        updates['actModeHuaweiCloudMaasModelInfo'] = rest.actModeHuaweiCloudMaasModelInfo;
    }

    // Secrets
    secretUpdates['apiKey'] = rest.apiKey;
    secretUpdates['openRouterApiKey'] = rest.openRouterApiKey;
    secretUpdates['awsAccessKey'] = rest.awsAccessKey;
    secretUpdates['awsSecretKey'] = rest.awsSecretKey;
    secretUpdates['awsSessionToken'] = rest.awsSessionToken;
    secretUpdates['openAiApiKey'] = rest.openAiApiKey;
    secretUpdates['geminiApiKey'] = rest.geminiApiKey;
    secretUpdates['openAiNativeApiKey'] = rest.openAiNativeApiKey;
    secretUpdates['deepSeekApiKey'] = rest.deepSeekApiKey;
    secretUpdates['requestyApiKey'] = rest.requestyApiKey;
    secretUpdates['togetherApiKey'] = rest.togetherApiKey;
    secretUpdates['qwenApiKey'] = rest.qwenApiKey;
    secretUpdates['doubaoApiKey'] = rest.doubaoApiKey;
    secretUpdates['mistralApiKey'] = rest.mistralApiKey;
    secretUpdates['liteLlmApiKey'] = rest.liteLlmApiKey;
    secretUpdates['fireworksApiKey'] = rest.fireworksApiKey;
    secretUpdates['asksageApiKey'] = rest.asksageApiKey;
    secretUpdates['xaiApiKey'] = rest.xaiApiKey;
    secretUpdates['sambanovaApiKey'] = rest.sambanovaApiKey;
    secretUpdates['cerebrasApiKey'] = rest.cerebrasApiKey;
    secretUpdates['nebiusApiKey'] = rest.nebiusApiKey;
    secretUpdates['sapAiCoreClientId'] = rest.sapAiCoreClientId;
    secretUpdates['sapAiCoreClientSecret'] = rest.sapAiCoreClientSecret;
    secretUpdates['caretApiKey'] = rest.caretApiKey; // CARET
    secretUpdates['groqApiKey'] = rest.groqApiKey;
    secretUpdates['basetenApiKey'] = rest.basetenApiKey;
    secretUpdates['moonshotApiKey'] = rest.moonshotApiKey;
    secretUpdates['huggingFaceApiKey'] = rest.huggingFaceApiKey;
    secretUpdates['huaweiCloudMaasApiKey'] = rest.huaweiCloudMaasApiKey;

    await updateGlobalStateBatch(context, updates);
    await updateSecretsBatch(context, secretUpdates);

	// CARET MODIFICATION: provider/id 전역 저장으로 워크스페이스 간 유지
	await updateGlobalState(context, "lastApiProvider", planMode ? rest.planModeApiProvider : rest.actModeApiProvider)
	await updateGlobalState(context, "lastApiModelId", planMode ? rest.planModeApiModelId : rest.actModeApiModelId)
}

// MERGED FUNCTION
export async function resetWorkspaceState(controller: Controller) {
	const context = controller.context
	await Promise.all(context.workspaceState.keys().map((key) => controller.context.workspaceState.update(key, undefined)))
	await controller.cacheService.reInitialize()
}

// MERGED FUNCTION
export async function resetGlobalState(controller: Controller) {
	const context = controller.context
	await Promise.all(context.globalState.keys().map((key) => context.globalState.update(key, undefined)))

    // CARET MODIFICATION: 언어 설정도 명시적으로 초기화
	await updateGlobalState(context, "uiLanguage", undefined)

	// CARET MODIFICATION: 페르소나 데이터도 초기화
	try {
		const { resetPersonaData } = await import("../../../caret-src/utils/persona-initializer")
		await resetPersonaData(context)
	} catch (error) {
		console.warn("Failed to reset persona data:", error)
	}

	// CARET MODIFICATION: 초기화 후 기본 페르소나 설정
	try {
		const { PersonaInitializer } = await import("../../../caret-src/utils/persona-initializer")
		const personaInitializer = new PersonaInitializer(context)
		await personaInitializer.initialize()
	} catch (error) {
		console.warn("Failed to initialize persona after reset:", error)
	}

	const secretKeys: SecretKey[] = [
		"apiKey",
		"openRouterApiKey",
		"awsAccessKey",
		"awsSecretKey",
		"awsSessionToken",
		"awsBedrockApiKey",
		"openAiApiKey",
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
        "caretApiKey", // CARET
	]
	await Promise.all(secretKeys.map((key) => storeSecret(context, key, undefined)))
	await controller.cacheService.reInitialize()
}
