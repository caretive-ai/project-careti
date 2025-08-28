// CARET MODIFICATION: Tool Selector for mode-based tool selection
// Purpose: Select appropriate tools based on chatbot/agent mode and context
// Following context-aware selection patterns

import { Logger } from "@/services/logging/Logger"
import { CaretToolHandler, CaretToolDefinition, ToolContext } from "./CaretToolHandler"

// Tool selection criteria
export interface SelectionCriteria {
	mode?: "chatbot" | "agent"
	executionType?: "internal" | "external" | "hybrid"
	priority?: "high" | "medium" | "low"
	category?: string
	capabilities?: string[]
}

// Tool selection result
export interface ToolSelectionResult {
	selectedTools: Map<string, CaretToolDefinition>
	rejectedTools: Array<{ name: string; reason: string }>
	selectionCriteria: SelectionCriteria
	totalAvailable: number
	totalSelected: number
}

/**
 * Caret Tool Selector
 *
 * Intelligent tool selection based on context, mode, and user requirements.
 * Ensures only appropriate tools are available for each interaction mode.
 *
 * Design Principles:
 * - Context-aware: Selects tools based on current mode and situation
 * - Intelligent filtering: Smart selection criteria beyond simple restrictions
 * - Performance optimized: Efficient tool filtering and caching
 * - Extensible: Easy to add new selection strategies
 */
export class CaretToolSelector {
	private toolHandler: CaretToolHandler
	private selectionCache: Map<string, ToolSelectionResult>
	private defaultCriteria: SelectionCriteria

	constructor(toolHandler: CaretToolHandler) {
		this.toolHandler = toolHandler
		this.selectionCache = new Map()
		this.defaultCriteria = {
			priority: "medium",
			executionType: "internal",
		}

		Logger.info("[CARET-SELECTOR] Initialized CaretToolSelector")
	}

	/**
	 * Select tools based on criteria
	 */
	selectTools(criteria: SelectionCriteria = {}): ToolSelectionResult {
		const mergedCriteria = { ...this.defaultCriteria, ...criteria }
		const cacheKey = this.getCacheKey(mergedCriteria)

		// Check cache first
		if (this.selectionCache.has(cacheKey)) {
			Logger.debug(`[CARET-SELECTOR] Using cached selection: ${cacheKey}`)
			return this.selectionCache.get(cacheKey)!
		}

		Logger.info(`[CARET-SELECTOR] Selecting tools with criteria: ${JSON.stringify(mergedCriteria)}`)

		const availableTools = this.toolHandler.getAvailableTools()
		const selectedTools = new Map<string, CaretToolDefinition>()
		const rejectedTools: Array<{ name: string; reason: string }> = []

		for (const [toolName, toolDef] of availableTools.entries()) {
			const selectionResult = this.evaluateToolSelection(toolName, toolDef, mergedCriteria)

			if (selectionResult.selected) {
				selectedTools.set(toolName, toolDef)
			} else {
				rejectedTools.push({ name: toolName, reason: selectionResult.reason })
			}
		}

		const result: ToolSelectionResult = {
			selectedTools,
			rejectedTools,
			selectionCriteria: mergedCriteria,
			totalAvailable: availableTools.size,
			totalSelected: selectedTools.size,
		}

		// Cache the result
		this.selectionCache.set(cacheKey, result)

		Logger.info(`[CARET-SELECTOR] Selection complete: ${selectedTools.size}/${availableTools.size} tools selected`)

		return result
	}

	/**
	 * Evaluate if a tool should be selected based on criteria
	 */
	private evaluateToolSelection(
		toolName: string,
		toolDef: CaretToolDefinition,
		criteria: SelectionCriteria,
	): { selected: boolean; reason: string } {
		// Check mode compatibility
		if (criteria.mode) {
			if (toolDef.mode_restriction) {
				switch (toolDef.mode_restriction) {
					case "chatbot_only":
						if (criteria.mode !== "chatbot") {
							return { selected: false, reason: "Mode restriction: chatbot only" }
						}
						break
					case "agent_only":
						if (criteria.mode !== "agent") {
							return { selected: false, reason: "Mode restriction: agent only" }
						}
						break
					case "both":
						// No restriction
						break
				}
			}
		}

		// Check execution type compatibility
		if (criteria.executionType) {
			if (toolDef.execution_type !== criteria.executionType) {
				return {
					selected: false,
					reason: `Execution type mismatch: wanted ${criteria.executionType}, got ${toolDef.execution_type}`,
				}
			}
		}

		// Check system compatibility (from handler context)
		const context = this.toolHandler.getContext()
		if (toolDef.system_restriction) {
			switch (toolDef.system_restriction) {
				case "caret_only":
					if (context.system !== "caret") {
						return { selected: false, reason: "System restriction: Caret only" }
					}
					break
				case "cline_only":
					if (context.system !== "cline") {
						return { selected: false, reason: "System restriction: Cline only" }
					}
					break
				case "both":
					// No restriction
					break
			}
		}

		return { selected: true, reason: "All criteria met" }
	}

	/**
	 * Get tools for chatbot mode
	 */
	getChatbotTools(): ToolSelectionResult {
		return this.selectTools({ mode: "chatbot" })
	}

	/**
	 * Get tools for agent mode
	 */
	getAgentTools(): ToolSelectionResult {
		return this.selectTools({ mode: "agent" })
	}

	/**
	 * Get tools by execution type
	 */
	getToolsByExecutionType(executionType: "internal" | "external" | "hybrid"): ToolSelectionResult {
		return this.selectTools({ executionType })
	}

	/**
	 * Get high-priority tools for quick access
	 */
	getEssentialTools(): ToolSelectionResult {
		const context = this.toolHandler.getContext()
		return this.selectTools({
			mode: context.mode,
			executionType: "internal",
			priority: "high",
		})
	}

	/**
	 * Generate cache key for selection criteria
	 */
	private getCacheKey(criteria: SelectionCriteria): string {
		return JSON.stringify(criteria, Object.keys(criteria).sort())
	}

	/**
	 * Clear selection cache
	 */
	clearCache(): number {
		const cacheSize = this.selectionCache.size
		this.selectionCache.clear()
		Logger.info(`[CARET-SELECTOR] Selection cache cleared: ${cacheSize} entries removed`)
		return cacheSize
	}

	/**
	 * Get selection statistics
	 */
	getSelectionStats(): {
		cacheSize: number
		availableTools: number
		commonSelections: Array<{ criteria: string; count: number }>
	} {
		const availableTools = this.toolHandler.getAvailableTools().size
		const cacheEntries = Array.from(this.selectionCache.entries())

		// Simple stats - in a real implementation, you'd track usage frequency
		const commonSelections = cacheEntries
			.map(([key, result]) => ({
				criteria: key,
				count: result.totalSelected,
			}))
			.sort((a, b) => b.count - a.count)

		return {
			cacheSize: this.selectionCache.size,
			availableTools,
			commonSelections: commonSelections.slice(0, 5), // Top 5
		}
	}

	/**
	 * Validate tool selection for security
	 */
	validateSelection(selection: ToolSelectionResult): {
		isValid: boolean
		warnings: string[]
		errors: string[]
	} {
		const warnings: string[] = []
		const errors: string[] = []

		// Check for potential security issues
		for (const [toolName, toolDef] of selection.selectedTools.entries()) {
			// Warn about external tools in production
			if (toolDef.execution_type === "external") {
				warnings.push(`External tool selected: ${toolName} - review security implications`)
			}

			// Error if system restrictions are violated
			const context = this.toolHandler.getContext()
			if (toolDef.system_restriction === "cline_only" && context.system === "caret") {
				errors.push(`System restriction violation: ${toolName} requires Cline but running on Caret`)
			}
		}

		return {
			isValid: errors.length === 0,
			warnings,
			errors,
		}
	}

	/**
	 * Get recommended tools based on current context
	 */
	getRecommendedTools(): ToolSelectionResult {
		const context = this.toolHandler.getContext()

		// Build intelligent selection criteria based on context
		const criteria: SelectionCriteria = {
			mode: context.mode,
			executionType: "internal", // Prefer internal tools for reliability
			priority: "high",
		}

		const result = this.selectTools(criteria)

		Logger.info(`[CARET-SELECTOR] Recommended ${result.totalSelected} tools for ${context.mode} mode`)

		return result
	}

	/**
	 * Compare tool selections
	 */
	compareSelections(
		selection1: ToolSelectionResult,
		selection2: ToolSelectionResult,
	): {
		common: string[]
		unique1: string[]
		unique2: string[]
		differences: number
	} {
		const tools1 = new Set(selection1.selectedTools.keys())
		const tools2 = new Set(selection2.selectedTools.keys())

		const common = Array.from(tools1).filter((tool) => tools2.has(tool))
		const unique1 = Array.from(tools1).filter((tool) => !tools2.has(tool))
		const unique2 = Array.from(tools2).filter((tool) => !tools1.has(tool))

		return {
			common,
			unique1,
			unique2,
			differences: unique1.length + unique2.length,
		}
	}

	/**
	 * Get current context from handler
	 */
	getContext(): ToolContext {
		return this.toolHandler.getContext()
	}

	/**
	 * Update selection criteria defaults
	 */
	updateDefaultCriteria(newDefaults: Partial<SelectionCriteria>): void {
		this.defaultCriteria = { ...this.defaultCriteria, ...newDefaults }
		this.clearCache() // Clear cache since defaults changed
		Logger.info(`[CARET-SELECTOR] Updated default criteria: ${JSON.stringify(this.defaultCriteria)}`)
	}
}
