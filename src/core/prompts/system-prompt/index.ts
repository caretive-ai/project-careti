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
	// CARETI MODIFICATION: Route Careti mode to CaretiPromptWrapper while preserving cline tool shape
	if (context.modeSystem === "careti") {
		const { CaretiPromptWrapper } = await import("@careti/core/prompts/CaretiPromptWrapper")
		return { systemPrompt: await CaretiPromptWrapper.getCaretSystemPrompt(context), tools: [] }
	}
	const registry = PromptRegistry.getInstance()
	const systemPrompt = await registry.get(context)
	const tools = registry.nativeTools
	return { systemPrompt, tools }
}
