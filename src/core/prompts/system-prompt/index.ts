import { PromptRegistry } from "./registry/PromptRegistry"
import type { SystemPromptContext } from "./types"

export { ClineToolSet } from "./registry/ClineToolSet"
export { PromptBuilder } from "./registry/PromptBuilder"
export { PromptRegistry } from "./registry/PromptRegistry"
export * from "./templates/placeholders"
export { TemplateEngine } from "./templates/TemplateEngine"
export * from "./types"
export { VariantBuilder } from "./variants/variant-builder"
export { validateVariant } from "./variants/variant-validator"

/**
 * Get the system prompt by id
 */
export async function getSystemPrompt(context: SystemPromptContext) {
	// CARET MODIFICATION: Route Caret mode to CaretPromptWrapper while preserving cline tool shape
	if (context.modeSystem === "caret") {
		const { CaretPromptWrapper } = await import("@caret/core/prompts/CaretPromptWrapper")
		return { systemPrompt: await CaretPromptWrapper.getCaretSystemPrompt(context), tools: [] }
	}
	const registry = PromptRegistry.getInstance()
	const systemPrompt = await registry.get(context)
	const tools = registry.nativeTools
	return { systemPrompt, tools }
}
