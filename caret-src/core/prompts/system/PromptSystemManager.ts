import { Logger } from "@/services/logging/Logger"
import { CaretJsonAdapter } from "./adapters/CaretJsonAdapter"
import { ClineLatestAdapter } from "./adapters/ClineLatestAdapter"
import { IPromptSystem } from "./IPromptSystem"
import { CaretSystemPromptContext } from "./types"

// Define a context type that includes the system selector and is compatible with Caret's context.
type SystemManagerContext = { modeSystem: "caret" | "cline" } & Partial<Omit<CaretSystemPromptContext, "modeSystem">>

export class PromptSystemManager {
	private adapters: Map<string, IPromptSystem>

	constructor() {
		this.adapters = new Map()
		this.adapters.set("caret", new CaretJsonAdapter())
		this.adapters.set("cline", new ClineLatestAdapter())
	}

	public async getPrompt(context: SystemManagerContext): Promise<string> {
		const adapterKey = context.modeSystem

		// CARET MODIFICATION: Enhanced debug logging for adapter selection
		console.log(`[PromptSystemManager] 🔄 Adapter selection process started`)
		console.log(`[PromptSystemManager] 📥 Input context:`, {
			modeSystem: context.modeSystem,
			mode: (context as any).mode,
			providerInfo: (context as any).providerInfo?.family || "unknown",
			mcpServers: (context as any).mcpHub?.getServers()?.length || 0,
			auto_todo: (context as any).auto_todo,
			task_progress: (context as any).task_progress,
		})

		const adapter = this.adapters.get(adapterKey)
		if (!adapter) {
			const availableAdapters = Array.from(this.adapters.keys())
			Logger.error(`[PromptSystemManager] ❌ Unsupported mode system: ${adapterKey}`)
			console.error(`[PromptSystemManager] ❌ Available adapters:`, availableAdapters)
			throw new Error(`Unsupported mode system: ${adapterKey}`)
		}

		Logger.debug(`[PromptSystemManager] ✅ Using adapter: ${adapterKey}`)
		console.log(`[PromptSystemManager] 🎯 Selected adapter: ${adapterKey} (${adapter.constructor.name})`)

		// We cast the context to the specific type expected by the adapters.
		// This is safe because our SystemManagerContext is a superset.
		const startTime = Date.now()
		try {
			const prompt = await adapter.getPrompt(context as CaretSystemPromptContext)
			const endTime = Date.now()
			const executionTime = endTime - startTime

			console.log(`[PromptSystemManager] ⚡ Prompt generation completed: ${executionTime}ms, ${prompt.length} chars`)
			Logger.debug(`[PromptSystemManager] Prompt generated successfully in ${executionTime}ms`)

			return prompt
		} catch (error) {
			const endTime = Date.now()
			const executionTime = endTime - startTime

			Logger.error(`[PromptSystemManager] ❌ Prompt generation failed after ${executionTime}ms:`, error)
			console.error(`[PromptSystemManager] ❌ Error in ${adapterKey} adapter:`, error)
			throw error
		}
	}
}
