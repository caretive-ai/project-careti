import * as vscode from "vscode"
import { DEFAULT_CHAT_SETTINGS, OpenAIReasoningEffort } from "@shared/ChatSettings"
import { DEFAULT_BROWSER_SETTINGS } from "@shared/BrowserSettings"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings"
import { GlobalStateKey, SecretKey } from "./state-keys"
import { ApiConfiguration, ApiProvider, BedrockModelId, ModelInfo } from "@shared/api"
import { HistoryItem } from "@shared/HistoryItem"
import { AutoApprovalSettings } from "@shared/AutoApprovalSettings"
import { BrowserSettings } from "@shared/BrowserSettings"
import { ChatSettings } from "@shared/ChatSettings"
import { TelemetrySetting } from "@shared/TelemetrySetting"
import { UserInfo } from "@shared/UserInfo"
import { ClineRulesToggles } from "@shared/cline-rules"
import { ensureRulesDirectoryExists, getSavedTaskHistory, saveTaskHistory } from "./disk"
import fs from "fs/promises"
import path from "path"
/*
	Storage
	https://dev.to/kompotkot/how-to-use-secretstorage-in-your-vscode-extensions-2hco
	https://www.eliostruyf.com/devhack-code-extension-storage-options/
	*/

// global

export async function updateGlobalState(context: vscode.ExtensionContext, key: GlobalStateKey, value: any) {
	// CARET MODIFICATION: Store taskHistory on disk instead of memory to reduce extension state size
	if (key === "taskHistory") {
		await saveTaskHistory(context, value || [])
		return
	}

	await context.globalState.update(key, value)
}

export async function getGlobalState(context: vscode.ExtensionContext, key: GlobalStateKey) {
	// CARET MODIFICATION: Load taskHistory from disk instead of memory to reduce extension state size
	if (key === "taskHistory") {
		return await getSavedTaskHistory(context)
	}

	return await context.globalState.get(key)
}

// secrets

export async function storeSecret(context: vscode.ExtensionContext, key: SecretKey, value?: string) {
	if (value) {
		await context.secrets.store(key, value)
	} else {
		await context.secrets.delete(key)
	}
}

export async function getSecret(context: vscode.ExtensionContext, key: SecretKey) {
	return await context.secrets.get(key)
}

// workspace

export async function updateWorkspaceState(context: vscode.ExtensionContext, key: string, value: any) {
	await context.workspaceState.update(key, value)
}

export async function getWorkspaceState(context: vscode.ExtensionContext, key: string) {
	return await context.workspaceState.get(key)
}

// CARET MODIFICATION: UI Language specific storage functions (app-wide)

export async function getUILanguage(context: vscode.ExtensionContext): Promise<string> {
	const uiLanguage = (await getGlobalState(context, "uiLanguage")) as string | undefined
	if (uiLanguage) {
		return uiLanguage
	}

	// CARET MODIFICATION: VSCode 언어 설정 따라가기
	// 저장된 설정이 없으면 VSCode 언어 설정에서 감지
	const vscodeLocale = vscode.env.language || "en"
	const detectedLanguage = vscodeLocale.split("-")[0] // ko-KR -> ko

	// 지원하는 언어인지 확인
	const supportedLanguages = ["ko", "en", "ja", "zh"]
	const finalLanguage = supportedLanguages.includes(detectedLanguage) ? detectedLanguage : "en"

	return finalLanguage
}

export async function updateUILanguage(context: vscode.ExtensionContext, uiLanguage: string) {
	await updateGlobalState(context, "uiLanguage", uiLanguage)
}

export async function migratePlanActGlobalToWorkspaceStorage(context: vscode.ExtensionContext) {
	// Keys that were migrated from global storage to workspace storage
	const keysToMigrate = [
		// Core settings
		"apiProvider",
		"apiModelId",
		"thinkingBudgetTokens",
		"reasoningEffort",
		"chatSettings",
		"vsCodeLmModelSelector",

		// Provider-specific model keys
		"awsBedrockCustomSelected",
		"awsBedrockCustomModelBaseId",
		"openRouterModelId",
		"openRouterModelInfo",
		"openAiModelId",
		"openAiModelInfo",
		"ollamaModelId",
		"lmStudioModelId",
		"liteLlmModelId",
		"liteLlmModelInfo",
		"requestyModelId",
		"requestyModelInfo",
		"togetherModelId",
		"fireworksModelId",

		// Previous mode settings
		"previousModeApiProvider",
		"previousModeModelId",
		"previousModeModelInfo",
		"previousModeVsCodeLmModelSelector",
		"previousModeThinkingBudgetTokens",
		"previousModeReasoningEffort",
		"previousModeAwsBedrockCustomSelected",
		"previousModeAwsBedrockCustomModelBaseId",
	]

	for (const key of keysToMigrate) {
		const globalValue = await getGlobalState(context, key as GlobalStateKey)
		if (globalValue !== undefined) {
			const workspaceValue = await getWorkspaceState(context, key)
			if (workspaceValue === undefined) {
				await updateWorkspaceState(context, key, globalValue)
			}
			// Delete from global storage regardless of whether we copied it
			await updateGlobalState(context, key as GlobalStateKey, undefined)
		}
	}
}

async function migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw: boolean | undefined): Promise<boolean> {
	const config = vscode.workspace.getConfiguration("cline")
	const mcpMarketplaceEnabled = config.get<boolean>("mcpMarketplace.enabled")
	if (mcpMarketplaceEnabled !== undefined) {
		// Remove from VSCode configuration
		await config.update("mcpMarketplace.enabled", undefined, true)

		return !mcpMarketplaceEnabled
	}
	return mcpMarketplaceEnabledRaw ?? true
}

async function migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw: boolean | undefined): Promise<boolean> {
	const config = vscode.workspace.getConfiguration("cline")
	const enableCheckpoints = config.get<boolean>("enableCheckpoints")
	if (enableCheckpoints !== undefined) {
		// Remove from VSCode configuration
		await config.update("enableCheckpoints", undefined, true)
		return enableCheckpoints
	}
	return enableCheckpointsSettingRaw ?? true
}

export async function migrateCustomInstructionsToGlobalRules(context: vscode.ExtensionContext) {
	try {
		const customInstructions = (await context.globalState.get("customInstructions")) as string | undefined

		if (customInstructions?.trim()) {
			console.log("Migrating custom instructions to global Cline rules...")

			// Create global .clinerules directory if it doesn't exist
			const globalRulesDir = await ensureRulesDirectoryExists()

			// Use a fixed filename for custom instructions
			const migrationFileName = "custom_instructions.md"
			const migrationFilePath = path.join(globalRulesDir, migrationFileName)

			try {
				// Check if file already exists to determine if we should append
				let existingContent = ""
				try {
					existingContent = await fs.readFile(migrationFilePath, "utf8")
				} catch (readError) {
					// File doesn't exist, which is fine
				}

				// Append or create the file with custom instructions
				const contentToWrite = existingContent
					? `${existingContent}\n\n---\n\n${customInstructions.trim()}`
					: customInstructions.trim()

				await fs.writeFile(migrationFilePath, contentToWrite)
				console.log(`Successfully ${existingContent ? "appended to" : "created"} migration file: ${migrationFilePath}`)
			} catch (fileError) {
				console.error("Failed to write migration file:", fileError)
				return
			}

			// Remove customInstructions from global state only after successful file creation
			await context.globalState.update("customInstructions", undefined)
			console.log("Successfully migrated custom instructions to global Cline rules")
		}
	} catch (error) {
		console.error("Failed to migrate custom instructions to global rules:", error)
		// Continue execution - migration failure shouldn't break extension startup
	}
}

// CARET MODIFICATION: Migrate taskHistory from memory to disk
async function migrateTaskHistoryToDisk(context: vscode.ExtensionContext) {
	try {
		const memoryTaskHistory = await context.globalState.get("taskHistory")
		if (memoryTaskHistory && Array.isArray(memoryTaskHistory)) {
			console.log("Migrating taskHistory from memory to disk...")
			await saveTaskHistory(context, memoryTaskHistory)
			await context.globalState.update("taskHistory", undefined) // Clear from memory
			console.log("Successfully migrated taskHistory to disk")
		}
	} catch (error) {
		console.error("Failed to migrate taskHistory to disk:", error)
	}
}

export async function getAllExtensionState(context: vscode.ExtensionContext) {
	// Migrate taskHistory to disk if it exists in memory
	await migrateTaskHistoryToDisk(context)
	const isNewUser = (await getGlobalState(context, "isNewUser")) as boolean | undefined
	const apiKey = (await getSecret(context, "apiKey")) as string | undefined
	const openRouterApiKey = (await getSecret(context, "openRouterApiKey")) as string | undefined
	const caretApiKey = (await getSecret(context, "caretApiKey")) as string | undefined // CARET MODIFICATION: Add caretApiKey field
	const awsAccessKey = (await getSecret(context, "awsAccessKey")) as string | undefined
	const awsSecretKey = (await getSecret(context, "awsSecretKey")) as string | undefined
	const awsSessionToken = (await getSecret(context, "awsSessionToken")) as string | undefined
	const awsRegion = (await getGlobalState(context, "awsRegion")) as string | undefined
	const awsUseCrossRegionInference = (await getGlobalState(context, "awsUseCrossRegionInference")) as boolean | undefined
	const awsBedrockUsePromptCache = (await getGlobalState(context, "awsBedrockUsePromptCache")) as boolean | undefined
	const awsBedrockEndpoint = (await getGlobalState(context, "awsBedrockEndpoint")) as string | undefined
	const awsProfile = (await getGlobalState(context, "awsProfile")) as string | undefined
	const awsUseProfile = (await getGlobalState(context, "awsUseProfile")) as boolean | undefined
	const vertexProjectId = (await getGlobalState(context, "vertexProjectId")) as string | undefined
	const vertexRegion = (await getGlobalState(context, "vertexRegion")) as string | undefined
	const openAiBaseUrl = (await getGlobalState(context, "openAiBaseUrl")) as string | undefined
	const openAiApiKey = (await getSecret(context, "openAiApiKey")) as string | undefined
	const openAiHeaders = (await getGlobalState(context, "openAiHeaders")) as Record<string, string> | undefined
	const ollamaBaseUrl = (await getGlobalState(context, "ollamaBaseUrl")) as string | undefined
	const ollamaApiOptionsCtxNum = (await getGlobalState(context, "ollamaApiOptionsCtxNum")) as string | undefined
	const lmStudioBaseUrl = (await getGlobalState(context, "lmStudioBaseUrl")) as string | undefined
	const anthropicBaseUrl = (await getGlobalState(context, "anthropicBaseUrl")) as string | undefined
	const geminiApiKey = (await getSecret(context, "geminiApiKey")) as string | undefined
	const geminiBaseUrl = (await getGlobalState(context, "geminiBaseUrl")) as string | undefined
	const openAiNativeApiKey = (await getSecret(context, "openAiNativeApiKey")) as string | undefined
	const deepSeekApiKey = (await getSecret(context, "deepSeekApiKey")) as string | undefined
	const requestyApiKey = (await getSecret(context, "requestyApiKey")) as string | undefined
	const togetherApiKey = (await getSecret(context, "togetherApiKey")) as string | undefined
	const qwenApiKey = (await getSecret(context, "qwenApiKey")) as string | undefined
	const doubaoApiKey = (await getSecret(context, "doubaoApiKey")) as string | undefined
	const mistralApiKey = (await getSecret(context, "mistralApiKey")) as string | undefined
	const azureApiVersion = (await getGlobalState(context, "azureApiVersion")) as string | undefined
	const openRouterProviderSorting = (await getGlobalState(context, "openRouterProviderSorting")) as string | undefined
	const lastShownAnnouncementId = (await getGlobalState(context, "lastShownAnnouncementId")) as string | undefined
	// CARET MODIFICATION: Load taskHistory from disk instead of memory to reduce extension state size
	const taskHistory = (await getSavedTaskHistory(context)) as HistoryItem[] | undefined
	const autoApprovalSettings = (await getGlobalState(context, "autoApprovalSettings")) as AutoApprovalSettings | undefined
	const browserSettings = (await getGlobalState(context, "browserSettings")) as BrowserSettings | undefined
	const liteLlmBaseUrl = (await getGlobalState(context, "liteLlmBaseUrl")) as string | undefined
	const liteLlmUsePromptCache = (await getGlobalState(context, "liteLlmUsePromptCache")) as boolean | undefined
	const fireworksApiKey = (await getSecret(context, "fireworksApiKey")) as string | undefined
	const fireworksModelMaxCompletionTokens = (await getGlobalState(context, "fireworksModelMaxCompletionTokens")) as
		| number
		| undefined
	const fireworksModelMaxTokens = (await getGlobalState(context, "fireworksModelMaxTokens")) as number | undefined
	const userInfo = (await getGlobalState(context, "userInfo")) as UserInfo | undefined
	const qwenApiLine = (await getGlobalState(context, "qwenApiLine")) as string | undefined
	const liteLlmApiKey = (await getSecret(context, "liteLlmApiKey")) as string | undefined
	const telemetrySetting = (await getGlobalState(context, "telemetrySetting")) as TelemetrySetting | undefined
	const asksageApiKey = (await getSecret(context, "asksageApiKey")) as string | undefined
	const asksageApiUrl = (await getGlobalState(context, "asksageApiUrl")) as string | undefined
	const xaiApiKey = (await getSecret(context, "xaiApiKey")) as string | undefined
	const sambanovaApiKey = (await getSecret(context, "sambanovaApiKey")) as string | undefined
	const cerebrasApiKey = (await getSecret(context, "cerebrasApiKey")) as string | undefined
	const nebiusApiKey = (await getSecret(context, "nebiusApiKey")) as string | undefined
	const planActSeparateModelsSettingRaw = (await getGlobalState(context, "planActSeparateModelsSetting")) as boolean | undefined
	const favoritedModelIds = (await getGlobalState(context, "favoritedModelIds")) as string[] | undefined
	const globalClineRulesToggles = (await getGlobalState(context, "globalClineRulesToggles")) as ClineRulesToggles | undefined
	const requestTimeoutMs = (await getGlobalState(context, "requestTimeoutMs")) as number | undefined
	const shellIntegrationTimeout = (await getGlobalState(context, "shellIntegrationTimeout")) as number | undefined
	const enableCheckpointsSettingRaw = (await getGlobalState(context, "enableCheckpointsSetting")) as boolean | undefined
	const mcpMarketplaceEnabledRaw = (await getGlobalState(context, "mcpMarketplaceEnabled")) as boolean | undefined
	const mcpRichDisplayEnabled = (await getGlobalState(context, "mcpRichDisplayEnabled")) as boolean | undefined
	const mcpResponsesCollapsedRaw = (await getGlobalState(context, "mcpResponsesCollapsed")) as boolean | undefined
	const globalWorkflowToggles = (await getGlobalState(context, "globalWorkflowToggles")) as ClineRulesToggles | undefined
	const terminalReuseEnabled = (await getGlobalState(context, "terminalReuseEnabled")) as boolean | undefined
	const terminalOutputLineLimit = (await getGlobalState(context, "terminalOutputLineLimit")) as number | undefined
	const defaultTerminalProfile = (await getGlobalState(context, "defaultTerminalProfile")) as string | undefined
	const sapAiCoreClientId = (await getSecret(context, "sapAiCoreClientId")) as string | undefined
	const sapAiCoreClientSecret = (await getSecret(context, "sapAiCoreClientSecret")) as string | undefined
	const sapAiCoreBaseUrl = (await getGlobalState(context, "sapAiCoreBaseUrl")) as string | undefined
	const sapAiCoreTokenUrl = (await getGlobalState(context, "sapAiCoreTokenUrl")) as string | undefined
	const sapAiResourceGroup = (await getGlobalState(context, "sapAiResourceGroup")) as string | undefined
	const sapAiCoreModelId = (await getGlobalState(context, "sapAiCoreModelId")) as string | undefined
	const plan = (await getGlobalState(context, "plan")) as string | undefined // CARET MODIFICATION: Add plan
	const isPayAsYouGo = (await getGlobalState(context, "isPayAsYouGo")) as boolean | undefined // CARET MODIFICATION: Add isPayAsYouGo

	// CARET MODIFICATION: Load uiLanguage from globalState separately
	const uiLanguage = await getUILanguage(context)

	const localClineRulesToggles = (await getWorkspaceState(context, "localClineRulesToggles")) as ClineRulesToggles

	const chatSettings = (await getWorkspaceState(context, "chatSettings")) as ChatSettings | undefined
	const storedApiProvider = (await getWorkspaceState(context, "apiProvider")) as ApiProvider | undefined
	const apiModelId = (await getWorkspaceState(context, "apiModelId")) as string | undefined
	const thinkingBudgetTokens = (await getWorkspaceState(context, "thinkingBudgetTokens")) as number | undefined
	const reasoningEffort = (await getWorkspaceState(context, "reasoningEffort")) as string | undefined
	const vsCodeLmModelSelector = (await getWorkspaceState(context, "vsCodeLmModelSelector")) as
		| vscode.LanguageModelChatSelector
		| undefined
	const awsBedrockCustomSelected = (await getWorkspaceState(context, "awsBedrockCustomSelected")) as boolean | undefined
	const awsBedrockCustomModelBaseId = (await getWorkspaceState(context, "awsBedrockCustomModelBaseId")) as
		| BedrockModelId
		| undefined
	const openRouterModelId = (await getWorkspaceState(context, "openRouterModelId")) as string | undefined
	const openRouterModelInfo = (await getWorkspaceState(context, "openRouterModelInfo")) as ModelInfo | undefined
	const openAiModelId = (await getWorkspaceState(context, "openAiModelId")) as string | undefined
	const openAiModelInfo = (await getWorkspaceState(context, "openAiModelInfo")) as ModelInfo | undefined
	const ollamaModelId = (await getWorkspaceState(context, "ollamaModelId")) as string | undefined
	const lmStudioModelId = (await getWorkspaceState(context, "lmStudioModelId")) as string | undefined
	const liteLlmModelId = (await getWorkspaceState(context, "liteLlmModelId")) as string | undefined
	const liteLlmModelInfo = (await getWorkspaceState(context, "liteLlmModelInfo")) as ModelInfo | undefined
	const requestyModelId = (await getWorkspaceState(context, "requestyModelId")) as string | undefined
	const requestyModelInfo = (await getWorkspaceState(context, "requestyModelInfo")) as ModelInfo | undefined
	const togetherModelId = (await getWorkspaceState(context, "togetherModelId")) as string | undefined
	const fireworksModelId = (await getWorkspaceState(context, "fireworksModelId")) as string | undefined
	const previousModeApiProvider = (await getWorkspaceState(context, "previousModeApiProvider")) as ApiProvider | undefined
	const previousModeModelId = (await getWorkspaceState(context, "previousModeModelId")) as string | undefined
	const previousModeModelInfo = (await getWorkspaceState(context, "previousModeModelInfo")) as ModelInfo | undefined
	const previousModeVsCodeLmModelSelector = (await getWorkspaceState(context, "previousModeVsCodeLmModelSelector")) as
		| vscode.LanguageModelChatSelector
		| undefined
	const previousModeThinkingBudgetTokens = (await getWorkspaceState(context, "previousModeThinkingBudgetTokens")) as
		| number
		| undefined
	const previousModeReasoningEffort = (await getWorkspaceState(context, "previousModeReasoningEffort")) as string | undefined
	const previousModeAwsBedrockCustomSelected = (await getWorkspaceState(context, "previousModeAwsBedrockCustomSelected")) as
		| boolean
		| undefined
	const previousModeAwsBedrockCustomModelBaseId = (await getWorkspaceState(
		context,
		"previousModeAwsBedrockCustomModelBaseId",
	)) as BedrockModelId | undefined
	const previousModeSapAiCoreClientId = (await getWorkspaceState(context, "previousModeSapAiCoreClientId")) as
		| string
		| undefined
	const previousModeSapAiCoreClientSecret = (await getWorkspaceState(context, "previousModeSapAiCoreClientSecret")) as
		| string
		| undefined
	const previousModeSapAiCoreBaseUrl = (await getWorkspaceState(context, "previousModeSapAiCoreBaseUrl")) as string | undefined
	const previousModeSapAiCoreTokenUrl = (await getWorkspaceState(context, "previousModeSapAiCoreTokenUrl")) as
		| string
		| undefined
	const previousModeSapAiCoreResourceGroup = (await getWorkspaceState(context, "previousModeSapAiCoreResourceGroup")) as
		| string
		| undefined
	const previousModeSapAiCoreModelId = (await getWorkspaceState(context, "previousModeSapAiCoreModelId")) as string | undefined

	// CARET MODIFICATION: Use global fallback provider if workspace value 없음
	const globalApiProvider = (await getGlobalState(context, "lastApiProvider")) as ApiProvider | undefined

	let apiProvider: ApiProvider
	if (storedApiProvider) {
		apiProvider = storedApiProvider
	} else if (globalApiProvider) {
		apiProvider = globalApiProvider
	} else {
		// Either new user or legacy user that doesn't have the apiProvider stored in state
		// (If they're using OpenRouter or Bedrock, then apiProvider state will exist)
		if (apiKey) {
			apiProvider = "anthropic"
		} else {
			apiProvider = "openrouter"
		}
	}

	const mcpMarketplaceEnabled = await migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw)
	const enableCheckpointsSetting = await migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw)
	const mcpResponsesCollapsed = mcpResponsesCollapsedRaw ?? false // mcpResponsesCollapsedRaw를 사용

	// Plan/Act separate models setting is a boolean indicating whether the user wants to use different models for plan and act. Existing users expect this to be enabled, while we want new users to opt in to this being disabled by default.
	// On win11 state sometimes initializes as empty string instead of undefined
	let planActSeparateModelsSetting: boolean | undefined = undefined
	if (planActSeparateModelsSettingRaw === true || planActSeparateModelsSettingRaw === false) {
		planActSeparateModelsSetting = planActSeparateModelsSettingRaw
	} else {
		// default to true for existing users
		if (storedApiProvider) {
			planActSeparateModelsSetting = true
		} else {
			// default to false for new users
			planActSeparateModelsSetting = false
		}
		// this is a special case where it's a new state, but we want it to default to different values for existing and new users.
		// persist so next time state is retrieved it's set to the correct value.
		await updateGlobalState(context, "planActSeparateModelsSetting", planActSeparateModelsSetting)
	}

	return {
		apiConfiguration: {
			apiProvider,
			apiModelId,
			apiKey,
			openRouterApiKey,
			caretApiKey,
			awsAccessKey,
			awsSecretKey,
			awsSessionToken,
			awsRegion,
			awsUseCrossRegionInference,
			awsBedrockUsePromptCache,
			awsBedrockEndpoint,
			awsProfile,
			awsUseProfile,
			awsBedrockCustomSelected,
			awsBedrockCustomModelBaseId,
			vertexProjectId,
			vertexRegion,
			openAiBaseUrl,
			openAiApiKey,
			openAiModelId,
			openAiModelInfo,
			openAiHeaders: openAiHeaders || {},
			ollamaModelId,
			ollamaBaseUrl,
			ollamaApiOptionsCtxNum,
			lmStudioBaseUrl,
			anthropicBaseUrl,
			geminiApiKey,
			geminiBaseUrl,
			openAiNativeApiKey,
			deepSeekApiKey,
			requestyApiKey,
			requestyModelId,
			requestyModelInfo,
			togetherApiKey,
			togetherModelId,
			qwenApiKey,
			qwenApiLine,
			doubaoApiKey,
			mistralApiKey,
			azureApiVersion,
			openRouterModelId,
			openRouterModelInfo,
			openRouterProviderSorting,
			vsCodeLmModelSelector,
			thinkingBudgetTokens,
			reasoningEffort,
			liteLlmBaseUrl,
			liteLlmModelId,
			liteLlmModelInfo,
			liteLlmApiKey,
			liteLlmUsePromptCache,
			fireworksApiKey,
			fireworksModelId,
			fireworksModelMaxCompletionTokens,
			fireworksModelMaxTokens,
			asksageApiKey,
			asksageApiUrl,
			xaiApiKey,
			sambanovaApiKey,
			cerebrasApiKey,
			nebiusApiKey,
			favoritedModelIds,
			requestTimeoutMs,
			sapAiCoreClientId,
			sapAiCoreClientSecret,
			sapAiCoreBaseUrl,
			sapAiCoreTokenUrl,
			sapAiResourceGroup,
			sapAiCoreModelId,
		},
		isNewUser: isNewUser ?? true,
		lastShownAnnouncementId,
		taskHistory,
		autoApprovalSettings: autoApprovalSettings || DEFAULT_AUTO_APPROVAL_SETTINGS, // default value can be 0 or empty string
		globalClineRulesToggles: globalClineRulesToggles || {},
		localClineRulesToggles: localClineRulesToggles || {},
		browserSettings: { ...DEFAULT_BROWSER_SETTINGS, ...browserSettings }, // this will ensure that older versions of browserSettings (e.g. before remoteBrowserEnabled was added) are merged with the default values (false for remoteBrowserEnabled)
		chatSettings: {
			...DEFAULT_CHAT_SETTINGS, // Apply defaults first
			...(chatSettings || {}), // Spread fetched chatSettings, which includes preferredLanguage, and openAIReasoningEffort
			// CARET MODIFICATION: Use uiLanguage from globalState (app-wide setting)
			uiLanguage,
		},
		userInfo,
		previousModeApiProvider,
		previousModeModelId,
		previousModeModelInfo,
		previousModeVsCodeLmModelSelector,
		previousModeThinkingBudgetTokens,
		previousModeReasoningEffort,
		previousModeAwsBedrockCustomSelected,
		previousModeAwsBedrockCustomModelBaseId,
		previousModeSapAiCoreClientId,
		previousModeSapAiCoreClientSecret,
		previousModeSapAiCoreBaseUrl,
		previousModeSapAiCoreTokenUrl,
		previousModeSapAiCoreResourceGroup,
		previousModeSapAiCoreModelId,
		mcpMarketplaceEnabled: mcpMarketplaceEnabled,
		mcpRichDisplayEnabled: mcpRichDisplayEnabled ?? true,
		mcpResponsesCollapsed: mcpResponsesCollapsed,
		telemetrySetting: telemetrySetting || "unset",
		planActSeparateModelsSetting,
		enableCheckpointsSetting: enableCheckpointsSetting,
		shellIntegrationTimeout: shellIntegrationTimeout || 4000,
		terminalReuseEnabled: terminalReuseEnabled ?? true,
		terminalOutputLineLimit: terminalOutputLineLimit ?? 500,
		defaultTerminalProfile: defaultTerminalProfile ?? "default",
		globalWorkflowToggles: globalWorkflowToggles || {},
		plan, // CARET MODIFICATION: Include plan in returned state
		isPayAsYouGo, // CARET MODIFICATION: Include isPayAsYouGo in returned state
	}
}

export async function updateApiConfiguration(context: vscode.ExtensionContext, apiConfiguration: ApiConfiguration) {
	const {
		apiProvider,
		apiModelId,
		apiKey,
		openRouterApiKey,
		awsAccessKey,
		awsSecretKey,
		awsSessionToken,
		awsRegion,
		awsUseCrossRegionInference,
		awsBedrockUsePromptCache,
		awsBedrockEndpoint,
		awsProfile,
		awsUseProfile,
		awsBedrockCustomSelected,
		awsBedrockCustomModelBaseId,
		vertexProjectId,
		vertexRegion,
		openAiBaseUrl,
		openAiApiKey,
		openAiModelId,
		openAiModelInfo,
		openAiHeaders,
		ollamaModelId,
		ollamaBaseUrl,
		ollamaApiOptionsCtxNum,
		lmStudioBaseUrl,
		lmStudioModelId, // 여기에 lmStudioModelId 추가
		anthropicBaseUrl,
		geminiApiKey,
		geminiBaseUrl,
		openAiNativeApiKey,
		deepSeekApiKey,
		requestyApiKey,
		requestyModelId,
		requestyModelInfo,
		togetherApiKey,
		togetherModelId,
		qwenApiKey,
		doubaoApiKey,
		mistralApiKey,
		azureApiVersion,
		openRouterModelId,
		openRouterModelInfo,
		openRouterProviderSorting,
		vsCodeLmModelSelector,
		liteLlmBaseUrl,
		liteLlmModelId,
		liteLlmModelInfo,
		liteLlmApiKey,
		liteLlmUsePromptCache,
		qwenApiLine,
		asksageApiKey,
		asksageApiUrl,
		xaiApiKey,
		thinkingBudgetTokens,
		reasoningEffort,
		caretApiKey,
		sambanovaApiKey,
		cerebrasApiKey,
		nebiusApiKey,
		favoritedModelIds,
		fireworksApiKey,
		fireworksModelId,
		fireworksModelMaxCompletionTokens,
		fireworksModelMaxTokens,
		sapAiCoreClientId,
		sapAiCoreClientSecret,
		sapAiCoreBaseUrl,
		sapAiCoreTokenUrl,
		sapAiResourceGroup,
		sapAiCoreModelId,
	} = apiConfiguration
	// Workspace state updates
	await updateWorkspaceState(context, "apiProvider", apiProvider)
	await updateWorkspaceState(context, "apiModelId", apiModelId)
	await updateWorkspaceState(context, "thinkingBudgetTokens", thinkingBudgetTokens)
	await updateWorkspaceState(context, "reasoningEffort", reasoningEffort)
	await updateWorkspaceState(context, "vsCodeLmModelSelector", vsCodeLmModelSelector)
	await updateWorkspaceState(context, "awsBedrockCustomSelected", awsBedrockCustomSelected)
	await updateWorkspaceState(context, "awsBedrockCustomModelBaseId", awsBedrockCustomModelBaseId)
	await updateWorkspaceState(context, "openRouterModelId", openRouterModelId)
	await updateWorkspaceState(context, "openRouterModelInfo", openRouterModelInfo)
	await updateWorkspaceState(context, "openAiModelId", openAiModelId)
	await updateWorkspaceState(context, "openAiModelInfo", openAiModelInfo)
	await updateWorkspaceState(context, "ollamaModelId", ollamaModelId)
	await updateWorkspaceState(context, "lmStudioModelId", lmStudioModelId)
	await updateWorkspaceState(context, "liteLlmModelId", liteLlmModelId)
	await updateWorkspaceState(context, "liteLlmModelInfo", liteLlmModelInfo)
	await updateWorkspaceState(context, "requestyModelId", requestyModelId)
	await updateWorkspaceState(context, "requestyModelInfo", requestyModelInfo)
	await updateWorkspaceState(context, "togetherModelId", togetherModelId)
	await updateWorkspaceState(context, "fireworksModelId", fireworksModelId)

	// Global state updates
	await updateGlobalState(context, "awsRegion", awsRegion)
	await updateGlobalState(context, "awsUseCrossRegionInference", awsUseCrossRegionInference)
	await updateGlobalState(context, "awsBedrockUsePromptCache", awsBedrockUsePromptCache)
	await updateGlobalState(context, "awsBedrockEndpoint", awsBedrockEndpoint)
	await updateGlobalState(context, "awsProfile", awsProfile)
	await updateGlobalState(context, "awsUseProfile", awsUseProfile)
	await updateGlobalState(context, "vertexProjectId", vertexProjectId)
	await updateGlobalState(context, "vertexRegion", vertexRegion)
	await updateGlobalState(context, "openAiBaseUrl", openAiBaseUrl)
	await updateGlobalState(context, "openAiHeaders", openAiHeaders || {})
	await updateGlobalState(context, "ollamaBaseUrl", ollamaBaseUrl)
	await updateGlobalState(context, "ollamaApiOptionsCtxNum", ollamaApiOptionsCtxNum)
	await updateGlobalState(context, "lmStudioBaseUrl", lmStudioBaseUrl)
	await updateGlobalState(context, "anthropicBaseUrl", anthropicBaseUrl)
	await updateGlobalState(context, "geminiBaseUrl", geminiBaseUrl)
	await updateGlobalState(context, "azureApiVersion", azureApiVersion)
	await updateGlobalState(context, "openRouterProviderSorting", openRouterProviderSorting)
	await updateGlobalState(context, "liteLlmBaseUrl", liteLlmBaseUrl)
	await updateGlobalState(context, "liteLlmUsePromptCache", liteLlmUsePromptCache)
	await updateGlobalState(context, "qwenApiLine", qwenApiLine)
	await updateGlobalState(context, "asksageApiUrl", asksageApiUrl)
	await updateGlobalState(context, "favoritedModelIds", favoritedModelIds)
	await updateGlobalState(context, "requestTimeoutMs", apiConfiguration.requestTimeoutMs)
	await updateGlobalState(context, "fireworksModelMaxCompletionTokens", fireworksModelMaxCompletionTokens)
	await updateGlobalState(context, "fireworksModelMaxTokens", fireworksModelMaxTokens)
	await updateGlobalState(context, "favoritedModelIds", favoritedModelIds)
	await updateGlobalState(context, "requestTimeoutMs", apiConfiguration.requestTimeoutMs)
	await updateGlobalState(context, "sapAiCoreBaseUrl", sapAiCoreBaseUrl)
	await updateGlobalState(context, "sapAiCoreTokenUrl", sapAiCoreTokenUrl)
	await updateGlobalState(context, "sapAiResourceGroup", sapAiResourceGroup)
	await updateGlobalState(context, "sapAiCoreModelId", sapAiCoreModelId)

	// Secret updates
	await storeSecret(context, "apiKey", apiKey)
	await storeSecret(context, "openRouterApiKey", openRouterApiKey)
	await storeSecret(context, "caretApiKey", caretApiKey)
	await storeSecret(context, "awsAccessKey", awsAccessKey)
	await storeSecret(context, "awsSecretKey", awsSecretKey)
	await storeSecret(context, "awsSessionToken", awsSessionToken)
	await storeSecret(context, "openAiApiKey", openAiApiKey)
	await storeSecret(context, "geminiApiKey", geminiApiKey)
	await storeSecret(context, "openAiNativeApiKey", openAiNativeApiKey)
	await storeSecret(context, "deepSeekApiKey", deepSeekApiKey)
	await storeSecret(context, "requestyApiKey", requestyApiKey)
	await storeSecret(context, "togetherApiKey", togetherApiKey)
	await storeSecret(context, "qwenApiKey", qwenApiKey)
	await storeSecret(context, "doubaoApiKey", doubaoApiKey)
	await storeSecret(context, "mistralApiKey", mistralApiKey)
	await storeSecret(context, "liteLlmApiKey", liteLlmApiKey)
	await storeSecret(context, "fireworksApiKey", fireworksApiKey)
	await storeSecret(context, "asksageApiKey", asksageApiKey)
	await storeSecret(context, "xaiApiKey", xaiApiKey)
	await storeSecret(context, "sambanovaApiKey", sambanovaApiKey)
	await storeSecret(context, "cerebrasApiKey", cerebrasApiKey)
	await storeSecret(context, "nebiusApiKey", nebiusApiKey)
	await storeSecret(context, "sapAiCoreClientId", sapAiCoreClientId)
	await storeSecret(context, "sapAiCoreClientSecret", sapAiCoreClientSecret)

	// CARET MODIFICATION: provider/id 전역 저장으로 워크스페이스 간 유지
	await updateGlobalState(context, "lastApiProvider", apiProvider)
	await updateGlobalState(context, "lastApiModelId", apiModelId)
}

export async function resetWorkspaceState(context: vscode.ExtensionContext) {
	for (const key of context.workspaceState.keys()) {
		await context.workspaceState.update(key, undefined)
	}
}

export async function resetGlobalState(context: vscode.ExtensionContext) {
	// TODO: Reset all workspace states?
	for (const key of context.globalState.keys()) {
		await context.globalState.update(key, undefined)
	}
	// CARET MODIFICATION: 언어 설정도 명시적으로 초기화
	await updateGlobalState(context, "uiLanguage", undefined)

	// CARET MODIFICATION: 페르소나 데이터도 초기화 (디버그 메뉴 완전 초기화)
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
		"openAiApiKey",
		"geminiApiKey",
		"openAiNativeApiKey",
		"deepSeekApiKey",
		"requestyApiKey",
		"togetherApiKey",
		"qwenApiKey",
		"doubaoApiKey",
		"mistralApiKey",
		"caretApiKey",
		"liteLlmApiKey",
		"fireworksApiKey",
		"asksageApiKey",
		"xaiApiKey",
		"sambanovaApiKey",
		"cerebrasApiKey",
		"nebiusApiKey",
	]
	for (const key of secretKeys) {
		await storeSecret(context, key, undefined)
	}
}
