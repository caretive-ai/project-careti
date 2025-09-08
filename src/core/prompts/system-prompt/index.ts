import { PromptSystemManager } from "@caret/core/prompts/system/PromptSystemManager"
// CARET MODIFICATION: Import CaretGlobalManager and PromptSystemManager for dual mode support
import { CaretGlobalManager } from "@caret/managers/CaretGlobalManager"
import { ApiProviderInfo } from "@/core/api"
import { Logger } from "@/services/logging/Logger"
import { ModelFamily } from "@/shared/prompts"
import { PromptRegistry } from "./registry/PromptRegistry"
import type { SystemPromptContext } from "./types"
import { isGPT5ModelFamily, isLocalModel, isNextGenModelFamily } from "./utils"

export { ClineToolSet } from "./registry/ClineToolSet"
export { PromptBuilder } from "./registry/PromptBuilder"
export { PromptRegistry } from "./registry/PromptRegistry"
export * from "./templates/placeholders"
export { TemplateEngine } from "./templates/TemplateEngine"
export * from "./types"
export { VariantBuilder } from "./variants/variant-builder"
export { validateVariant } from "./variants/variant-validator"

/**
 * Extract model family from model ID (e.g., "claude-4" -> "claude")
 */
export function getModelFamily(providerInfo: ApiProviderInfo): ModelFamily {
	if (isGPT5ModelFamily(providerInfo.model.id)) {
		return ModelFamily.GPT_5
	}
	// Check for next-gen models first
	if (isNextGenModelFamily(providerInfo.model.id)) {
		return ModelFamily.NEXT_GEN
	}
	if (providerInfo.customPrompt === "compact" && isLocalModel(providerInfo)) {
		return ModelFamily.XS
	}
	// Default fallback
	return ModelFamily.GENERIC
}

/**
 * Get the system prompt by id
 * CARET MODIFICATION: Support dual mode switching between Caret and Cline prompt systems
 */
export async function getSystemPrompt(context: SystemPromptContext): Promise<string> {
	// Check current mode to determine which prompt system to use
	const currentMode = CaretGlobalManager.currentMode
	Logger.debug(`[getSystemPrompt] Current mode: ${currentMode}`)

	if (currentMode === "caret") {
		// CARET MODIFICATION: Use Level 1 independent CaretPromptWrapper
		Logger.debug(`[getSystemPrompt] Using independent CaretPromptWrapper`)
		const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
		return await CaretPromptWrapper.getCaretSystemPrompt(context)
	} else {
		// Use original Cline's PromptRegistry for ACT MODE (cline mode)
		Logger.debug(`[getSystemPrompt] Using Cline PromptRegistry for ACT MODE`)
		const registry = PromptRegistry.getInstance()
		return await registry.get(context)
	}
}
