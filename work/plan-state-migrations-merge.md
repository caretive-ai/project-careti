# `state-migrations.ts` 병합 계획

## 1. 분석

`src/core/storage/state-migrations.ts` 파일은 import 구문과 함수 목록에서 충돌이 발생했다.

- **Caret (`HEAD`)**: `migrateWorkspaceToGlobalStorage` 함수를 추가하여 작업 공간(workspace)에 잘못 저장된 일부 전역 설정을 올바른 전역 저장소로 옮기는 로직을 구현했다.
- **Cline (`upstream/main`)**: `migrateTaskHistoryToFile`을 포함한 다수의 마이그레이션 함수를 추가하여, 기존의 `globalState`에 저장되던 `taskHistory`를 별도의 파일로 분리하고, `customInstructions`를 `.clinerules` 파일로 옮기는 등 다양한 구조 개선을 진행했다.

충돌의 원인은 양쪽 브랜치에서 서로 다른 마이그레이션 함수를 파일의 같은 위치에 추가했기 때문이다. 함수의 내용 자체는 겹치지 않는다.

## 2. 병합 원칙

- **전체 기능 보존**: Caret과 Cline에서 추가된 모든 마이그레이션 함수는 각자의 목적이 뚜렷하므로 모두 보존한다.
- **의존성 통합**: 양쪽 함수가 사용하는 `disk` 유틸리티와 `HistoryItem` 타입을 모두 import 하도록 구문을 통합한다.

## 3. 제안 코드 (전체 파일)

```typescript
import fs from "fs/promises"
import path from "path"
import * as vscode from "vscode"
import { HistoryItem } from "@/shared/HistoryItem"
import { ensureRulesDirectoryExists, GlobalFileNames, readTaskHistoryFromState, writeTaskHistoryToState } from "./disk"

export async function migrateWorkspaceToGlobalStorage(context: vscode.ExtensionContext) {
	// Keys to migrate from workspace storage back to global storage
	const keysToMigrate = [
		// Core settings
		"apiProvider",
		"apiModelId",
		"thinkingBudgetTokens",
		"reasoningEffort",
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
		"caretModelId", // caret
		"caretModelInfo", // caret
		"requestyModelId",
		"requestyModelInfo",
		"togetherModelId",
		"fireworksModelId",
		"sapAiCoreModelId",
		"groqModelId",
		"groqModelInfo",
		"huggingFaceModelId",
		"huggingFaceModelInfo",

		// Previous mode settings
		"previousModeApiProvider",
		"previousModeModelId",
		"previousModeModelInfo",
		"previousModeVsCodeLmModelSelector",
		"previousModeThinkingBudgetTokens",
		"previousModeReasoningEffort",
		"previousModeAwsBedrockCustomSelected",
		"previousModeAwsBedrockCustomModelBaseId",
		"previousModeSapAiCoreModelId",
	]

	for (const key of keysToMigrate) {
		// Use raw workspace state since these keys shouldn't be in workspace storage
		const workspaceValue = await context.workspaceState.get(key)
		const globalValue = await context.globalState.get(key)

		if (workspaceValue !== undefined && globalValue === undefined) {
			console.log(`[Storage Migration] migrating key: ${key} to global storage. Current value: ${workspaceValue}`)

			// Move to global storage using raw VSCode method to avoid type errors
			await context.globalState.update(key, workspaceValue)
			// Remove from workspace storage
			await context.workspaceState.update(key, undefined)
			const newWorkspaceValue = await context.workspaceState.get(key)

			console.log(`[Storage Migration] migrated key: ${key} to global storage. Current value: ${newWorkspaceValue}`)
		}
	}
}

export async function migrateTaskHistoryToFile(context: vscode.ExtensionContext) {
	try {
		// Get data from old location
		const vscodeGlobalStateTaskHistory = context.globalState.get<HistoryItem[] | undefined>("taskHistory")

		// Normalize old location data to array (empty array if undefined/null/not-array)
		const oldLocationData = Array.isArray(vscodeGlobalStateTaskHistory) ? vscodeGlobalStateTaskHistory : []

		// Early return if no migration needed
		if (oldLocationData.length === 0) {
			console.log("[Storage Migration] No task history to migrate")
			return
		}

		let finalData: HistoryItem[]
		let migrationAction: string

		const newLocationData = await readTaskHistoryFromState()

		if (newLocationData.length === 0) {
			// Move old data to new location
			finalData = oldLocationData
			migrationAction = "Migrated task history from old location to new location"
		} else {
			// Merge old data (more recent) with new data
			finalData = [...newLocationData, ...oldLocationData]
			migrationAction = "Merged task history from old and new locations"
		}

		// Perform migration operations sequentially - only clear old data if write succeeds
		await writeTaskHistoryToState(finalData)

		const successfullyWrittenData = await readTaskHistoryFromState()

		if (!Array.isArray(successfullyWrittenData)) {
			console.error("[Storage Migration] Failed to write taskHistory to file: Written data is not an array")
			return
		}

		if (successfullyWrittenData.length !== finalData.length) {
			console.error(
				"[Storage Migration] Failed to write taskHistory to file: Written data does not match the old location data",
			)
			return
		}

		await context.globalState.update("taskHistory", undefined)

		console.log(`[Storage Migration] ${migrationAction}`)
	} catch (error) {
		console.error("[Storage Migration] Failed to migrate task history to file:", error)
	}
}

export async function migrateMcpMarketplaceEnableSetting(mcpMarketplaceEnabledRaw: boolean | undefined): Promise<boolean> {
	const config = vscode.workspace.getConfiguration("caret")
	const mcpMarketplaceEnabled = config.get<boolean>("mcpMarketplace.enabled")
	if (mcpMarketplaceEnabled !== undefined) {
		// Remove from VSCode configuration
		await config.update("mcpMarketplace.enabled", undefined, true)

		return !mcpMarketplaceEnabled
	}
	return mcpMarketplaceEnabledRaw ?? true
}

export async function migrateEnableCheckpointsSetting(enableCheckpointsSettingRaw: boolean | undefined): Promise<boolean> {
	const config = vscode.workspace.getConfiguration("caret")
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
			const migrationFilePath = path.join(globalRulesDir, GlobalFileNames.customInstructions)

			try {
				// Check if file already exists to determine if we should append
				let existingContent = ""
				try {
					existingContent = await fs.readFile(migrationFilePath, "utf8")
				} catch (_readError) {
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

export async function migrateLegacyApiConfigurationToModeSpecific(context: vscode.ExtensionContext) {
	try {
		// Check if migration is needed - if planModeApiProvider already exists, skip migration
		const planModeApiProvider = await context.globalState.get("planModeApiProvider")
		if (planModeApiProvider !== undefined) {
			console.log("Legacy API configuration migration already completed, skipping...")
			return
		}

		console.log("Starting legacy API configuration migration to mode-specific keys...")

		// Get the planActSeparateModelsSetting to determine migration strategy
		const planActSeparateModelsSetting = (await context.globalState.get("planActSeparateModelsSetting")) as
			| boolean
			| undefined

		// Read legacy values directly
		const apiProvider = await context.globalState.get("apiProvider")
		const apiModelId = await context.globalState.get("apiModelId")
		const thinkingBudgetTokens = await context.globalState.get("thinkingBudgetTokens")
		const reasoningEffort = await context.globalState.get("reasoningEffort")
		const vsCodeLmModelSelector = await context.globalState.get("vsCodeLmModelSelector")
		const awsBedrockCustomSelected = await context.globalState.get("awsBedrockCustomSelected")
		const awsBedrockCustomModelBaseId = await context.globalState.get("awsBedrockCustomModelBaseId")
		const openRouterModelId = await context.globalState.get("openRouterModelId")
		const openRouterModelInfo = await context.globalState.get("openRouterModelInfo")
		const openAiModelId = await context.globalState.get("openAiModelId")
		const openAiModelInfo = await context.globalState.get("openAiModelInfo")
		const ollamaModelId = await context.globalState.get("ollamaModelId")
		const lmStudioModelId = await context.globalState.get("lmStudioModelId")
		const liteLlmModelId = await context.globalState.get("liteLlmModelId")
		const liteLlmModelInfo = await context.globalState.get("liteLlmModelInfo")
		const caretModelId = await context.globalState.get("caretModelId") // caret
		const caretModelInfo = await context.globalState.get("caretModelInfo") // caret
		const requestyModelId = await context.globalState.get("requestyModelId")
		const requestyModelInfo = await context.globalState.get("requestyModelInfo")
		const togetherModelId = await context.globalState.get("togetherModelId")
		const fireworksModelId = await context.globalState.get("fireworksModelId")
		const sapAiCoreModelId = await context.globalState.get("sapAiCoreModelId")
		const groqModelId = await context.globalState.get("groqModelId")
		const groqModelInfo = await context.globalState.get("groqModelInfo")
		const huggingFaceModelId = await context.globalState.get("huggingFaceModelId")
		const huggingFaceModelInfo = await context.globalState.get("huggingFaceModelInfo")

		// Read previous mode values
		const previousModeApiProvider = await context.globalState.get("previousModeApiProvider")
		const previousModeModelId = await context.globalState.get("previousModeModelId")
		const previousModeModelInfo = await context.globalState.get("previousModeModelInfo")
		const previousModeVsCodeLmModelSelector = await context.globalState.get("previousModeVsCodeLmModelSelector")
		const previousModeThinkingBudgetTokens = await context.globalState.get("previousModeThinkingBudgetTokens")
		const previousModeReasoningEffort = await context.globalState.get("previousModeReasoningEffort")
		const previousModeAwsBedrockCustomSelected = await context.globalState.get("previousModeAwsBedrockCustomSelected")
		const previousModeAwsBedrockCustomModelBaseId = await context.globalState.get("previousModeAwsBedrockCustomModelBaseId")
		const previousModeSapAiCoreModelId = await context.globalState.get("previousModeSapAiCoreModelId")

		// Migrate based on planActSeparateModelsSetting
		if (planActSeparateModelsSetting === false) {
			console.log("Migrating with separate models DISABLED - using current values for both modes")

			// Use current values for both plan and act modes
			if (apiProvider !== undefined) {
				await context.globalState.update("planModeApiProvider", apiProvider)
				await context.globalState.update("actModeApiProvider", apiProvider)
			}
			if (apiModelId !== undefined) {
				await context.globalState.update("planModeApiModelId", apiModelId)
				await context.globalState.update("actModeApiModelId", apiModelId)
			}
			if (thinkingBudgetTokens !== undefined) {
				await context.globalState.update("planModeThinkingBudgetTokens", thinkingBudgetTokens)
				await context.globalState.update("actModeThinkingBudgetTokens", thinkingBudgetTokens)
			}
			if (reasoningEffort !== undefined) {
				await context.globalState.update("planModeReasoningEffort", reasoningEffort)
				await context.globalState.update("actModeReasoningEffort", reasoningEffort)
			}
			if (vsCodeLmModelSelector !== undefined) {
				await context.globalState.update("planModeVsCodeLmModelSelector", vsCodeLmModelSelector)
				await context.globalState.update("actModeVsCodeLmModelSelector", vsCodeLmModelSelector)
			}
			if (awsBedrockCustomSelected !== undefined) {
				await context.globalState.update("planModeAwsBedrockCustomSelected", awsBedrockCustomSelected)
				await context.globalState.update("actModeAwsBedrockCustomSelected", awsBedrockCustomSelected)
			}
			if (awsBedrockCustomModelBaseId !== undefined) {
				await context.globalState.update("planModeAwsBedrockCustomModelBaseId", awsBedrockCustomModelBaseId)
				await context.globalState.update("actModeAwsBedrockCustomModelBaseId", awsBedrockCustomModelBaseId)
			}
			if (openRouterModelId !== undefined) {
				await context.globalState.update("planModeOpenRouterModelId", openRouterModelId)
				await context.globalState.update("actModeOpenRouterModelId", openRouterModelId)
			}
			if (openRouterModelInfo !== undefined) {
				await context.globalState.update("planModeOpenRouterModelInfo", openRouterModelInfo)
				await context.globalState.update("actModeOpenRouterModelInfo", openRouterModelInfo)
			}
			if (openAiModelId !== undefined) {
				await context.globalState.update("planModeOpenAiModelId", openAiModelId)
				await context.globalState.update("actModeOpenAiModelId", openAiModelId)
			}
			if (openAiModelInfo !== undefined) {
				await context.globalState.update("planModeOpenAiModelInfo", openAiModelInfo)
				await context.globalState.update("actModeOpenAiModelInfo", openAiModelInfo)
			}
			if (ollamaModelId !== undefined) {
				await context.globalState.update("planModeOllamaModelId", ollamaModelId)
				await context.globalState.update("actModeOllamaModelId", ollamaModelId)
			}
			if (lmStudioModelId !== undefined) {
				await context.globalState.update("planModeLmStudioModelId", lmStudioModelId)
				await context.globalState.update("actModeLmStudioModelId", lmStudioModelId)
			}
			if (liteLlmModelId !== undefined) {
				await context.globalState.update("planModeLiteLlmModelId", liteLlmModelId)
				await context.globalState.update("actModeLiteLlmModelId", liteLlmModelId)
			}
			if (liteLlmModelInfo !== undefined) {
				await context.globalState.update("planModeLiteLlmModelInfo", liteLlmModelInfo)
				await context.globalState.update("actModeLiteLlmModelInfo", liteLlmModelInfo)
			}
			if (caretModelId !== undefined) {
				await context.globalState.update("planModeCaretModelId", caretModelId)
				await context.globalState.update("actModeCaretModelId", caretModelId)
			}
			if (caretModelInfo !== undefined) {
				await context.globalState.update("planModeCaretModelInfo", caretModelInfo)
				await context.globalState.update("actModeCaretModelInfo", caretModelInfo)
			}
			if (requestyModelId !== undefined) {
				await context.globalState.update("planModeRequestyModelId", requestyModelId)
				await context.globalState.update("actModeRequestyModelId", requestyModelId)
			}
			if (requestyModelInfo !== undefined) {
				await context.globalState.update("planModeRequestyModelInfo", requestyModelInfo)
				await context.globalState.update("actModeRequestyModelInfo", requestyModelInfo)
			}
			if (togetherModelId !== undefined) {
				await context.globalState.update("planModeTogetherModelId", togetherModelId)
				await context.globalState.update("actModeTogetherModelId", togetherModelId)
			}
			if (fireworksModelId !== undefined) {
				await context.globalState.update("planModeFireworksModelId", fireworksModelId)
				await context.globalState.update("actModeFireworksModelId", fireworksModelId)
			}
			if (sapAiCoreModelId !== undefined) {
				await context.globalState.update("planModeSapAiCoreModelId", sapAiCoreModelId)
				await context.globalState.update("actModeSapAiCoreModelId", sapAiCoreModelId)
			}
			if (groqModelId !== undefined) {
				await context.globalState.update("planModeGroqModelId", groqModelId)
				await context.globalState.update("actModeGroqModelId", groqModelId)
			}
			if (groqModelInfo !== undefined) {
				await context.globalState.update("planModeGroqModelInfo", groqModelInfo)
				await context.globalState.update("actModeGroqModelInfo", groqModelInfo)
			}
			if (huggingFaceModelId !== undefined) {
				await context.globalState.update("planModeHuggingFaceModelId", huggingFaceModelId)
				await context.globalState.update("actModeHuggingFaceModelId", huggingFaceModelId)
			}
			if (huggingFaceModelInfo !== undefined) {
				await context.globalState.update("planModeHuggingFaceModelInfo", huggingFaceModelInfo)
				await context.globalState.update("actModeHuggingFaceModelInfo", huggingFaceModelInfo)
			}
		} else {
			console.log("Migrating with separate models ENABLED - using current->plan, previous->act")

			// Use current values for plan mode
			if (apiProvider !== undefined) {
				await context.globalState.update("planModeApiProvider", apiProvider)
			}
			if (apiModelId !== undefined) {
				await context.globalState.update("planModeApiModelId", apiModelId)
			}
			if (thinkingBudgetTokens !== undefined) {
				await context.globalState.update("planModeThinkingBudgetTokens", thinkingBudgetTokens)
			}
			if (reasoningEffort !== undefined) {
				await context.globalState.update("planModeReasoningEffort", reasoningEffort)
			}
			if (vsCodeLmModelSelector !== undefined) {
				await context.globalState.update("planModeVsCodeLmModelSelector", vsCodeLmModelSelector)
			}
			if (awsBedrockCustomSelected !== undefined) {
				await context.globalState.update("planModeAwsBedrockCustomSelected", awsBedrockCustomSelected)
			}
			if (awsBedrockCustomModelBaseId !== undefined) {
				await context.globalState.update("planModeAwsBedrockCustomModelBaseId", awsBedrockCustomModelBaseId)
			}
			if (openRouterModelId !== undefined) {
				await context.globalState.update("planModeOpenRouterModelId", openRouterModelId)
			}
			if (openRouterModelInfo !== undefined) {
				await context.globalState.update("planModeOpenRouterModelInfo", openRouterModelInfo)
			}
			if (openAiModelId !== undefined) {
				await context.globalState.update("planModeOpenAiModelId", openAiModelId)
			}
			if (openAiModelInfo !== undefined) {
				await context.globalState.update("planModeOpenAiModelInfo", openAiModelInfo)
			}
			if (ollamaModelId !== undefined) {
				await context.globalState.update("planModeOllamaModelId", ollamaModelId)
			}
			if (lmStudioModelId !== undefined) {
				await context.globalState.update("planModeLmStudioModelId", lmStudioModelId)
			}
			if (liteLlmModelId !== undefined) {
				await context.globalState.update("planModeLiteLlmModelId", liteLlmModelId)
			}
			if (liteLlmModelInfo !== undefined) {
				await context.globalState.update("planModeLiteLlmModelInfo", liteLlmModelInfo)
			}
			if (caretModelId !== undefined) {
				await context.globalState.update("planModeCaretModelId", caretModelId)
			}
			if (caretModelInfo !== undefined) {
				await context.globalState.update("planModeCaretModelInfo", caretModelInfo)
			}
			if (requestyModelId !== undefined) {
				await context.globalState.update("planModeRequestyModelId", requestyModelId)
			}
			if (requestyModelInfo !== undefined) {
				await context.globalState.update("planModeRequestyModelInfo", requestyModelInfo)
			}
			if (togetherModelId !== undefined) {
				await context.globalState.update("planModeTogetherModelId", togetherModelId)
			}
			if (fireworksModelId !== undefined) {
				await context.globalState.update("planModeFireworksModelId", fireworksModelId)
			}
			if (sapAiCoreModelId !== undefined) {
				await context.globalState.update("planModeSapAiCoreModelId", sapAiCoreModelId)
			}
			if (groqModelId !== undefined) {
				await context.globalState.update("planModeGroqModelId", groqModelId)
			}
			if (groqModelInfo !== undefined) {
				await context.globalState.update("planModeGroqModelInfo", groqModelInfo)
			}
			if (huggingFaceModelId !== undefined) {
				await context.globalState.update("planModeHuggingFaceModelId", huggingFaceModelId)
			}
			if (huggingFaceModelInfo !== undefined) {
				await context.globalState.update("planModeHuggingFaceModelInfo", huggingFaceModelInfo)
			}

			// Use previous values for act mode (with fallback to current values)
			if (previousModeApiProvider !== undefined) {
				await context.globalState.update("actModeApiProvider", previousModeApiProvider)
			} else if (apiProvider !== undefined) {
				await context.globalState.update("actModeApiProvider", apiProvider)
			}
			if (previousModeModelId !== undefined) {
				await context.globalState.update("actModeApiModelId", previousModeModelId)
			} else if (apiModelId !== undefined) {
				await context.globalState.update("actModeApiModelId", apiModelId)
			}
			if (previousModeThinkingBudgetTokens !== undefined) {
				await context.globalState.update("actModeThinkingBudgetTokens", previousModeThinkingBudgetTokens)
			} else if (thinkingBudgetTokens !== undefined) {
				await context.globalState.update("actModeThinkingBudgetTokens", thinkingBudgetTokens)
			}
			if (previousModeReasoningEffort !== undefined) {
				await context.globalState.update("actModeReasoningEffort", previousModeReasoningEffort)
			} else if (reasoningEffort !== undefined) {
				await context.globalState.update("actModeReasoningEffort", reasoningEffort)
			}
			if (previousModeVsCodeLmModelSelector !== undefined) {
				await context.globalState.update("actModeVsCodeLmModelSelector", previousModeVsCodeLmModelSelector)
			} else if (vsCodeLmModelSelector !== undefined) {
				await context.globalState.update("actModeVsCodeLmModelSelector", vsCodeLmModelSelector)
			}
			if (previousModeAwsBedrockCustomSelected !== undefined) {
				await context.globalState.update("actModeAwsBedrockCustomSelected", previousModeAwsBedrockCustomSelected)
			} else if (awsBedrockCustomSelected !== undefined) {
				await context.globalState.update("actModeAwsBedrockCustomSelected", awsBedrockCustomSelected)
			}
			if (previousModeAwsBedrockCustomModelBaseId !== undefined) {
				await context.globalState.update("actModeAwsBedrockCustomModelBaseId", previousModeAwsBedrockCustomModelBaseId)
			} else if (awsBedrockCustomModelBaseId !== undefined) {
				await context.globalState.update("actModeAwsBedrockCustomModelBaseId", awsBedrockCustomModelBaseId)
			}
			if (previousModeSapAiCoreModelId !== undefined) {
				await context.globalState.update("actModeSapAiCoreModelId", previousModeSapAiCoreModelId)
			} else if (sapAiCoreModelId !== undefined) {
				await context.globalState.update("actModeSapAiCoreModelId", sapAiCoreModelId)
			}

			// For fields without previous variants, use current values for act mode
			if (previousModeModelInfo !== undefined) {
				await context.globalState.update("actModeOpenRouterModelInfo", previousModeModelInfo)
			} else if (openRouterModelInfo !== undefined) {
				await context.globalState.update("actModeOpenRouterModelInfo", openRouterModelInfo)
			}
			if (openRouterModelId !== undefined) {
				await context.globalState.update("actModeOpenRouterModelId", openRouterModelId)
			}
			if (openAiModelId !== undefined) {
				await context.globalState.update("actModeOpenAiModelId", openAiModelId)
			}
			if (openAiModelInfo !== undefined) {
				await context.globalState.update("actModeOpenAiModelInfo", openAiModelInfo)
			}
			if (ollamaModelId !== undefined) {
				await context.globalState.update("actModeOllamaModelId", ollamaModelId)
			}
			if (lmStudioModelId !== undefined) {
				await context.globalState.update("actModeLmStudioModelId", lmStudioModelId)
			}
			if (liteLlmModelId !== undefined) {
				await context.globalState.update("actModeLiteLlmModelId", liteLlmModelId)
			}
			if (liteLlmModelInfo !== undefined) {
				await context.globalState.update("actModeLiteLlmModelInfo", liteLlmModelInfo)
			}
			if (caretModelId !== undefined) {
				await context.globalState.update("actModeCaretModelId", caretModelId)
			}
			if (caretModelInfo !== undefined) {
				await context.globalState.update("actModeCaretModelInfo", caretModelInfo)
			}
			if (requestyModelId !== undefined) {
				await context.globalState.update("actModeRequestyModelId", requestyModelId)
			}
			if (requestyModelInfo !== undefined) {
				await context.globalState.update("actModeRequestyModelInfo", requestyModelInfo)
			}
			if (togetherModelId !== undefined) {
				await context.globalState.update("actModeTogetherModelId", togetherModelId)
			}
			if (fireworksModelId !== undefined) {
				await context.globalState.update("actModeFireworksModelId", fireworksModelId)
			}
			if (groqModelId !== undefined) {
				await context.globalState.update("actModeGroqModelId", groqModelId)
			}
			if (groqModelInfo !== undefined) {
				await context.globalState.update("actModeGroqModelInfo", groqModelInfo)
			}
			if (huggingFaceModelId !== undefined) {
				await context.globalState.update("actModeHuggingFaceModelId", huggingFaceModelId)
			}
			if (huggingFaceModelInfo !== undefined) {
				await context.globalState.update("actModeHuggingFaceModelInfo", huggingFaceModelInfo)
			}
		}

		// Clean up legacy keys after successful migration
		console.log("Cleaning up legacy keys...")
		await context.globalState.update("apiProvider", undefined)
		await context.globalState.update("apiModelId", undefined)
		await context.globalState.update("thinkingBudgetTokens", undefined)
		await context.globalState.update("reasoningEffort", undefined)
		await context.globalState.update("vsCodeLmModelSelector", undefined)
		await context.globalState.update("awsBedrockCustomSelected", undefined)
		await context.globalState.update("awsBedrockCustomModelBaseId", undefined)
		await context.globalState.update("openRouterModelId", undefined)
		await context.globalState.update("openRouterModelInfo", undefined)
		await context.globalState.update("openAiModelId", undefined)
		await context.globalState.update("openAiModelInfo", undefined)
		await context.globalState.update("ollamaModelId", undefined)
		await context.globalState.update("lmStudioModelId", undefined)
		await context.globalState.update("liteLlmModelId", undefined)
		await context.globalState.update("liteLlmModelInfo", undefined)
		await context.globalState.update("caretModelId", undefined) // caret
		await context.globalState.update("caretModelInfo", undefined) // caret
		await context.globalState.update("requestyModelId", undefined)
		await context.globalState.update("requestyModelInfo", undefined)
		await context.globalState.update("togetherModelId", undefined)
		await context.globalState.update("fireworksModelId", undefined)
		await context.globalState.update("sapAiCoreModelId", undefined)
		await context.globalState.update("groqModelId", undefined)
		await context.globalState.update("groqModelInfo", undefined)
		await context.globalState.update("huggingFaceModelId", undefined)
		await context.globalState.update("huggingFaceModelInfo", undefined)
		await context.globalState.update("previousModeApiProvider", undefined)
		await context.globalState.update("previousModeModelId", undefined)
		await context.globalState.update("previousModeModelInfo", undefined)
		await context.globalState.update("previousModeVsCodeLmModelSelector", undefined)
		await context.globalState.update("previousModeThinkingBudgetTokens", undefined)
		await context.globalState.update("previousModeReasoningEffort", undefined)
		await context.globalState.update("previousModeAwsBedrockCustomSelected", undefined)
		await context.globalState.update("previousModeAwsBedrockCustomModelBaseId", undefined)
		await context.globalState.update("previousModeSapAiCoreModelId", undefined)

		console.log("Successfully migrated legacy API configuration to mode-specific keys")
	} catch (error) {
		console.error("Failed to migrate legacy API configuration to mode-specific keys:", error)
		// Continue execution - migration failure shouldn't break extension startup
	}
}

export async function migrateWelcomeViewCompleted(context: vscode.ExtensionContext) {
	try {
		// Check if welcomeViewCompleted is already set
		const welcomeViewCompleted = context.globalState.get("welcomeViewCompleted")

		if (welcomeViewCompleted === undefined) {
			console.log("Migrating welcomeViewCompleted setting...")

			// Fetch API keys directly from secrets
			const apiKey = await context.secrets.get("apiKey")
			const openRouterApiKey = await context.secrets.get("openRouterApiKey")
			const clineAccountId = await context.secrets.get("clineAccountId")
			const openAiApiKey = await context.secrets.get("openAiApiKey")
			const ollamaApiKey = await context.secrets.get("ollamaApiKey")
			const liteLlmApiKey = await context.secrets.get("liteLlmApiKey")
			const geminiApiKey = await context.secrets.get("geminiApiKey")
			const openAiNativeApiKey = await context.secrets.get("openAiNativeApiKey")
			const deepSeekApiKey = await context.secrets.get("deepSeekApiKey")
			const requestyApiKey = await context.secrets.get("requestyApiKey")
			const togetherApiKey = await context.secrets.get("togetherApiKey")
			const qwenApiKey = await context.secrets.get("qwenApiKey")
			const doubaoApiKey = await context.secrets.get("doubaoApiKey")
			const mistralApiKey = await context.secrets.get("mistralApiKey")
			const asksageApiKey = await context.secrets.get("asksageApiKey")
			const xaiApiKey = await context.secrets.get("xaiApiKey")
			const sambanovaApiKey = await context.secrets.get("sambanovaApiKey")
			const sapAiCoreClientId = await context.secrets.get("sapAiCoreClientId")
			const difyApiKey = await context.secrets.get("difyApiKey")

			// Fetch configuration values from global state
			const awsRegion = context.globalState.get("awsRegion")
			const vertexProjectId = context.globalState.get("vertexProjectId")
			const planModeOllamaModelId = context.globalState.get("planModeOllamaModelId")
			const planModeLmStudioModelId = context.globalState.get("planModeLmStudioModelId")
			const actModeOllamaModelId = context.globalState.get("actModeOllamaModelId")
			const actModeLmStudioModelId = context.globalState.get("actModeLmStudioModelId")
			const planModeVsCodeLmModelSelector = context.globalState.get("planModeVsCodeLmModelSelector")
			const actModeVsCodeLmModelSelector = context.globalState.get("actModeVsCodeLmModelSelector")

			// This is the original logic used for checking if the welcome view should be shown
			// It was located in the ExtensionStateContextProvider
			const hasKey = [
				apiKey,
				openRouterApiKey,
				awsRegion,
				vertexProjectId,
				openAiApiKey,
				ollamaApiKey,
				planModeOllamaModelId,
				planModeLmStudioModelId,
				actModeOllamaModelId,
				actModeLmStudioModelId,
				liteLlmApiKey,
				geminiApiKey,
				openAiNativeApiKey,
				deepSeekApiKey,
				requestyApiKey,
				togetherApiKey,
				qwenApiKey,
				doubaoApiKey,
				mistralApiKey,
				planModeVsCodeLmModelSelector,
				actModeVsCodeLmModelSelector,
				clineAccountId,
				asksageApiKey,
				xaiApiKey,
				sambanovaApiKey,
				sapAiCoreClientId,
				difyApiKey,
			].some((key) => key !== undefined)

			// Set welcomeViewCompleted based on whether user has keys
			await context.globalState.update("welcomeViewCompleted", hasKey)

			console.log(`Migration: Set welcomeViewCompleted to ${hasKey} based on existing API keys`)
		}
	} catch (error) {
		console.error("Failed to migrate welcomeViewCompleted:", error)
		// Continue execution - migration failure shouldn't break extension startup
	}
}
<environment_details>
# VSCode Visible Files
src/core/storage/state-keys.ts

# VSCode Open Tabs
webview-ui/src/caret/hooks/useInputHistory.ts
src/core/prompts/commands.ts
.caretrules/testing-work.md
work/plan-20251002-01.md
src/core/task/tools/handlers/ExecuteCommandToolHandler.ts
caret-docs/features/f06-json-system-prompt.mdx
caret-src/core/prompts/sections/CHATBOT_AGENT_MODES.json
caret-docs/system-prompts-ko/chatbot-agent-modes.md
webview-ui/src/components/history/HistoryPreview.tsx
caret-b2b/worklog/_archive/t11-brand-conversion-work-checklist.md
caret-docs/work-logs/luke/undated-backend-task-intercept-rule-creation.md
src/core/controller/file/createRuleFile.ts
webview-ui/src/components/cline-rules/NewRuleRow.tsx
webview-ui/src/caret/hooks/usePersistentInputHistory.ts
work/b2b-codecenter-conversion-plan.md
caret-docs/work-logs/luke/complete/20251001-3-input-history-feature.md
caret-b2b/worklog/20250930-featureconfig-deployment-checklist.md
webview-ui/src/caret/locale/en/announcement.json
webview-ui/src/caret/locale/zh/announcement.json
caret-docs/ko/CHANGELOG.md
caret-b2b/brands/codecenter/announcement.json
.caretrules/ai-work-protocol.md
caret-b2b/docs/frontend-conversion-process.md
.caretrules/b2b-branding-workflow.md
caret-b2b/tools/converter-utils.js
caret-b2b/tools/convert-frontend.js
caret-b2b/brands/codecenter/CHANGELOG-CODECENTER.md
README.md
caret-b2b/brands/cline/brand-config.json
caret-b2b/brands/codecenter/brand-config.json
.caretrules/workflows/branding-and-logging.md
caret-src/core/controller/fetchLiteLlmModels.ts
caret-src/shared/feature-config.json
work/release-filename-update-plan.md
caret-scripts/build/package-release.js
work/rollback-and-stash-plan.md
caret-b2b/brands/codecenter/files/icon.psd
caret-b2b/brands/codecenter/feature-config.json
work/compile-error-fix-plan.md
src/core/api/providers/caret.ts
src/shared/CaretAccount.ts
src/core/controller/caretAccount/getCaretOrganizationCredits.ts
src/core/controller/caretAccount/getCaretUserCredits.ts
src/core/controller/caretAccount/getCaretUserOrganizations.ts
caret-src/managers/CaretGlobalManager.ts
src/services/account/CaretAccountService.ts
src/core/webview/WebviewProvider.ts
work/20251002-compile-error-investigation-log.md
work/plan-integrate-speckit-with-caretrules.md
work/spec-kit-pr-plan.md
work/spec-kit-phase1-step1-plan.md
work/spec-kit-phase1-step1-plan-revised.md
work/spec-kit-phase1-step1-plan-revised-2.md
spec-kit/templates/caretrules/.caretrules/commands/specify.md
spec-kit/templates/caretrules/.caretrules/commands/plan.md
spec-kit/templates/clinerules/.clinerules/commands/specify.md
spec-kit/templates/clinerules/.clinerules/commands/plan.md
work/spec-kit-final-plan.md
work/spec-kit-final-plan-v3.md
work/readme-update-plan.md
spec-kit/README.ko.md
work/spec-kit-commit-plan.md
spec-kit/README.md
spec-kit/src/specify_cli/__init__.py
cline/CHANGELOG.md
caret-docs/work-logs/luke/20251005-3-cline-merge-verification-plan.md
work/update-submodule-and-replan.md
work/cline-merge-analysis-plan.md
work/history-integration-plan.md
caret-docs/work-logs/luke/20251005-1-cline-merge-plan.md
caret-docs/work-logs/luke/20251005-5-master-progress-checklist.md
work/20251006-git-pull-issue-resolution-plan.md
work/20251006-git-branch-rebase-plan.md
work/20251006-decouple-b2b-submodule-plan.md
src/generated/hosts/standalone/protobus-server-setup.ts
caret-scripts/build/generate-protobus-setup.mjs
work/20251006-2-cline-merge-strategy-plan.md
work/20251006-3-cline-merge-diff-plan.md
work/20251006-4-cline-merge-impact-analysis-plan.md
work/20251006-13-상세-영향도-분석-계획.md
work/20251006-14-상세-영향도-분석-보고서.md
work/20251006-5-package-json-analysis.md
work/20251006-12-final-merge-strategy.md
work/20251006-15-최종-병합-실행-계획.md
work/20251006-proto-merge-plan.md
work/master-merge-checklist.md
work/plan-20251008-01-merge-restart.md
work/plan-20251008-02-fix-checkout-ours-failure.md
work/plan-20251008-03-resolve-package-json.md
work/logs/log-package-json-merge.md
work/plan-20251008-04-resolve-gitignore.md
work/logs/log-gitignore-merge.md
.gitignore
work/plan-20251008-05-resolve-vscodeignore.md
work/logs/log-vscodeignore-merge.md
.vscodeignore
work/plan-20251008-06-resolve-changelog.md
work/master-merge-plan.md
package.json
CHANGELOG.md
work/logs/log-biome-jsonc-merge.md
work/plan-biome-jsonc-merge.md
biome.jsonc
work/logs/log-proto-models-merge.md
work/plan-proto-models-merge.md
proto/cline/models.proto
work/plan-proto-state-merge.md
work/plan-20251008-07-resume-merge.md
work/logs/log-proto-state-merge.md
work/plan-dify-ts-merge.md
work/logs/log-dify-ts-merge.md
src/api/providers/dify.ts
work/interim-report-20251008-full.md
work/session-wrap-up-20251008.md
work/conflict-analysis-report-20251008.md
work/plan-merge-reanalysis-20251008.md
work/caret-changed-files.txt
work/merge-reanalysis-report-20251008.md
work/plan-final-analysis-breakdown-20251008.md
work/session-wrap-up-and-next-steps-20251008.md
work/plan-analyze-102-modifications-v2.md
work/plan-fix-analysis-script.md
work/scripts/analyze_modifications.js
work/scripts/list_mapped_files.js
work/plan-20251008-08-continue-analysis.md
work/plan-format-analysis-report.md
work/plan-merge-reanalysis-20251008-v2.md
work/conflicted-files-list.txt
work/caret-modified-backend-files.txt
work/plan-20251008-09-compare-and-analyze.md
work/scripts/compare_lists.js
work/merge-reanalysis-report-20251008-v2.md
work/plan-20251008-10-filter-group-b.md
work/scripts/filter_group_b.js
work/plan-20251008-11-deep-dive-conflict-analysis.md
work/plan-restructure-report.md
work/logs/log-state-migrations-merge.md
work/plan-state-migrations-merge.md
src/core/storage/state-migrations.ts
work/logs/log-disk-ts-merge.md
work/plan-disk-ts-merge.md
work/logs/log-state-helpers-merge.md
work/logs/log-proto-models-fix.md
proto/cline/common.proto
work/plan-proto-models-final-merge.md
work/logs/log-proto-circular-dependency-fix.md
work/proto-issue-handoff-prompt.md
work/merge-failure-analysis-report.md
work/20251006-re-merge-plan.md
work/plan-A1-extension-ts-merge.md
work/logs/20251006-16-merge-reassessment-and-recovery-plan.md
work/plan-merge-reintegration.md
work/plan-cline-api-migration.md
work/plan-post-analysis-cleanup.md
work/20251006-session-wrap-up-plan.md
caret-docs/guides/merging-strategy-guide.md
work/20251007-1-emergency-recovery-plan.md
work/logs/20251007-1-compile-after-recovery.log
work/20251007-2-phase1-core-api-fix-plan.md
src/services/feature-flags/FeatureFlagsProviderFactory.ts
src/services/telemetry/TelemetryProviderFactory.ts
src/services/telemetry/TelemetryService.test.ts
src/services/feature-flags/FeatureFlagsService.ts
src/shared/services/feature-flags/feature-flags.ts
src/shared/proto/cline/models.ts
work/20251007-final-wrap-up-plan.md
work/20251007-phase0-execution-plan.md
work/20251007-phase1-analysis-and-plan.md
proto/host/env.proto
src/services/error/providers/PostHogErrorProvider.ts
src/shared/services/config/posthog-config.ts
src/services/error/ErrorProviderFactory.ts
work/deep-dive-report-state-migrations.md
work/plan-20251008-17-re-extract-via-caret-main.md
work/plan-20251008-18-re-extract-via-git-dir.md
work/scripts/filter_backend_mods.js
work/plan-20251008-19-filter-only-modified.md
work/scripts/filter_only_modified_files.js
work/analysis/caret_modified_cline_backend_files.txt
work/analysis/analyzed_files_from_md_final_correct.txt
work/analysis/unalyzed_backend_files.txt
work/plan-20251008-20-cleanup.md
work/plan-20251008-22-merge-file-lists.md
work/scripts/merge_modification_lists.js
work/analysis/master_backend_modification_list.txt
work/plan-20251008-23-extract-unlisted-files.md
work/scripts/extract_unlisted_files.js
work/plan-20251008-24-update-analysis-doc.md
work/plan-20251008-25-extract-unlisted-files-revised.md
work/scripts/extract_unlisted_files_final.js
work/plan-20251008-26-manual-verification.md
work/plan-integrate-backend-analysis.md
work/plan-add-numbering-to-analysis.md
work/plan-update-analysis-instructions.md
work/plan-update-analysis-principle.md
work/plan-revert-doubao-modification.md
work/backend-analysis-results.md
work/plan-backend-re-analysis-conflict-focus.md
work/plan-backend-analysis.md
cline-latest/src/core/api/providers/doubao.ts
work/plan-verify-doubao-modification.md
work/analysis-report-doubao-ts.md
work/plan-backend-analysis-final-phase.md
work/plan-resolve-mass-conflicts.md
work/plan-state-helpers-merge.md
work/backend-analysis-batch-1.md
work/analysis-of-102-modifications.md
work/backend-merge-plan.md
proto/cline/state.proto
src/core/controller/models/refreshOcaModels.ts
src/core/controller/models/refreshOpenRouterModels.ts
src/core/controller/index.ts
src/core/controller/state/resetState.ts
work/plan-backend-analysis-session-21.md
src/test/e2e/auth.test.ts
work/plan-backend-analysis-session-23.md
work/plan-backend-analysis-session-24.md
src/test/e2e/diff.test.ts
work/plan-backend-analysis-session-25.md
work/plan-backend-analysis-session-2.md
work/plan-backend-analysis-session-3.md
work/plan-backend-analysis-session-4.md
work/plan-backend-analysis-session-5.md
work/plan-backend-analysis-session-6.md
work/plan-backend-analysis-session-7.md
work/plan-backend-analysis-session-8.md
work/plan-backend-analysis-session-9.md
work/plan-backend-analysis-session-10.md
work/plan-backend-analysis-session-11.md
work/plan-backend-analysis-session-12.md
work/plan-backend-analysis-session-13.md
work/plan-backend-analysis-session-14.md
work/plan-backend-analysis-session-15.md
work/plan-backend-analysis-session-16.md
work/plan-backend-analysis-session-17.md
work/plan-backend-analysis-session-18.md
work/plan-backend-analysis-session-19.md
work/plan-backend-analysis-session-1.md
work/plan-20251008-29-final-final-verification.md
work/plan-20251008-27-final-verification.md
work/plan-20251008-28-final-final-verification.md
src/config.ts
src/services/auth/providers/ClineAuthProvider.ts
src/services/auth/providers/IAuthProvider.ts
src/services/auth/oca/providers/OcaAuthProvider.ts
src/services/posthog/PostHogClientProvider.ts
proto/host/workspace.proto
work/20251007-git-util-fix-plan.md
work/20251007-fix-host-provider-init-plan.md
src/standalone/cline-core.ts
work/20251007-fix-context-argument-plan.md
work/plan-state-keys-merge.md
src/core/storage/state-keys.ts
src/core/storage/utils/state-helpers.ts
work/20251007-fix-refresh-oca-models-plan.md
src/core/controller/ocaAccount/ocaAccountLogoutClicked.ts
work/20251007-phase2-error-fix-plan.md
src/core/workspace/utils/workspace-detection.ts
src/integrations/checkpoints/index.ts
src/integrations/checkpoints/MultiRootCheckpointManager.ts
src/integrations/checkpoints/factory.ts
src/services/uri/SharedUriHandler.test.ts
src/hosts/host-provider-types.ts
src/test/host-provider-test-utils.ts
src/hosts/external/host-bridge-client-manager.ts
src/services/dictation/VoiceTranscriptionService.ts
work/20251007-violation-report-minimal-invasion.md
work/plan-phase1-host-provider-wrapper.md
work/20251007-plan-compile-error-resolution-phase0.md
work/logs/20251006-19-backend-error-dependency-analysis.md
work/logs/20251006-20-deep-dive-error-analysis.md
work/20251007-compile-error-analysis-report.md
work/20251007-phase1A-wrapper-skeleton-plan.md
caret-src/hosts/CaretHostProviderWrapper.ts
caret-src/services/dictation/CaretDictationService.ts
work/20251007-phase1B-state-management-investigation-plan.md
work/20251007-workspace-service-implementation-plan.md
caret-src/services/workspace/CaretWorkspaceService.ts
src/core/workspace/setup.ts
work/20251007-plan-recompile-after-setup-fix.md
work/20251007-plan-fix-multi-root-utils.md
src/core/workspace/multi-root-utils.ts
work/20251007-plan-recompile-after-multi-root-fix.md
work/20251007-plan-fix-git-utils.md
src/utils/git.ts
caret-src/utils/git-compat.ts
src/hosts/vscode/commit-message-generator.ts
work/20251007-plan-recompile-after-git-fix.md
work/20251007-plan-fix-host-provider-watch.md
work/20251007-plan-recompile-after-watch-fix.md
work/20251007-plan-fix-callback-url.md
src/core/controller/account/openrouterAuthClicked.ts
src/services/auth/AuthService.ts
work/20251007-plan-recompile-after-callback-fix.md
work/20251007-plan-investigate-oca-auth-callback.md
src/services/auth/oca/OcaAuthService.ts
work/20251007-compliance-report.md
work/20251007-plan-recompile-after-oca-auth-fix.md
work/20251007-plan-fix-ts2554-errors.md
work/20251007-plan-fix-reconstructTaskHistory-command.md
work/20251007-plan-refactor-disk-ts-dependencies.md
src/core/storage/disk.ts
src/core/task/focus-chain/index.ts
src/core/context/context-tracking/FileContextTracker.ts
src/core/context/context-tracking/ModelContextTracker.ts
work/20251007-plan-fix-controller-corruption.md
.gitmodules
work/20251007-plan-fix-task-index-errors.md
work/20251007-session-wrap-up-and-next-steps.md
work/20251007-plan-3-way-analysis-reconstructTaskHistory.md
work/plan-fix-reconstructTaskHistory-command-v2.md
src/core/commands/reconstructTaskHistory.ts
work/plan-fix-task-index-errors.md
work/plan-recovery-and-migration-v2.md
work/plan-fix-controller-constructor.md
src/core/task/index.ts
work/plan-fix-controller-constructor-execution.md
work/plan-fix-controller-constructor-v2.md
work/plan-fix-extension-ts.md
work/plan-fix-workspace-manager.md
work/plan-fix-extension-ts-v2.md
work/plan-verify-extension-ts-modification.md
work/analysis-report-extension-ts.md
work/plan-fix-common-ts.md
work/plan-fix-host-provider.md
../../Documents/Caret/Rules/persona.md
work/plan-fix-host-provider-v2.md
src/hosts/host-provider.ts
work/plan-fix-extension-ts-v3.md
src/common.ts
work/plan-fix-extension-ts-v4.md
src/extension.ts
work/plan-fix-vscode-webview-provider.md
work/plan-fix-webview-provider.md
work/plan-fix-webview-provider-v2.md
work/self-analysis-report-20251007.md
work/logs/log-state-keys-merge.md
work/log-proto-models-merge.md
work/log-task-index-merge.md
work/log-gitignore-merge.md
work/log-controller-index-merge.md
work/20251006-6-proto-models-analysis.md
work/20251006-7-gitmodules-analysis.md
work/20251006-8-github-workflows-analysis.md
work/20251006-9-caret-modification-analysis.md
work/20251006-10-webview-components-analysis.md
work/20251006-11-extension-ts-analysis.md
work/20251006-compile-error-analysis-plan.md
work/20251006-1-compile-error-analysis-plan.md
caret-docs/work-logs/luke/20251005-2-codecenter.md
spec-kit/README.en.md
src/shared/focus-chain-utils.ts
webview-ui/src/caret/locale/ko/announcement.json
caret-b2b/worklog/20251001-9-setup-independent-dev-env-plan.md
caret-b2b/package.json
caret-b2b/vitest.config.ts
caret-b2b/worklog/20251001-10-fix-b2b-tests-plan.md
caret-b2b/tools/brand-converter.test.js
caret-b2b/worklog/20251001-11-refactor-test-structure-plan.md
caret-b2b/tools/convert-frontend.test.js
caret-b2b/tools/brand-converter-cli.test.js
caret-b2b/tools/brand-converter-simple.test.js
src/shared/CaretBrandConfig.ts
caret-docs/features/f09-feature-config-system.mdx
caret-b2b/README.md
webview-ui/src/components/chat/ChatView.tsx
webview-ui/src/components/chat/chat-view/components/layout/InputSection.tsx
webview-ui/src/components/chat/ChatTextArea.tsx

# Current Time
2025. 10. 8. 오후 8:39:29 (Asia/Seoul, UTC+9:00)

# Context Window Usage
284,435 / 1,048.576K tokens used (27%)

# Current Mode
ACT MODE
</environment_details>
