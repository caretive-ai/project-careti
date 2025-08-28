// CARET MODIFICATION: Tool Handler for JSON-based tool system
// Purpose: Convert JSON tool definitions into executable logic
// Following JSON-based dynamic loading pattern

import { Logger } from "@/services/logging/Logger"
import { JsonTemplateLoader } from "../prompts/JsonTemplateLoader"

// Tool execution context
export interface ToolContext {
	mode: "chatbot" | "agent"
	system: "caret" | "cline"
	extensionPath: string
	currentWorkingDirectory: string
}

// Tool definition structure from JSON
export interface CaretToolDefinition {
	name: string
	description: string
	parameters: {
		type: string
		properties: Record<string, any>
		required?: string[]
	}
	mode_restriction?: "chatbot_only" | "agent_only" | "both"
	system_restriction?: "caret_only" | "cline_only" | "both"
	execution_type: "internal" | "external" | "hybrid"
	handler?: string
}

/**
 * Caret Tool Handler
 *
 * Converts JSON tool definitions into executable functions.
 * Handles mode and system restrictions based on current context.
 *
 * Design Principles:
 * - JSON-first: All tools defined in JSON files
 * - Context-aware: Respects mode and system restrictions
 * - Safe execution: Validates tools before execution
 * - Extensible: Easy to add new tool types
 */
export class CaretToolHandler {
	private templateLoader: JsonTemplateLoader
	private availableTools: Map<string, CaretToolDefinition>
	private context: ToolContext

	constructor(extensionPath: string, context: ToolContext) {
		this.templateLoader = new JsonTemplateLoader(extensionPath, false)
		this.availableTools = new Map()
		this.context = context

		Logger.info(`[CARET-TOOLS] Initialized CaretToolHandler for ${context.mode} mode in ${context.system} system`)
	}

	/**
	 * Load tools from JSON definitions
	 * Filters tools based on current context (mode/system)
	 */
	async loadTools(): Promise<void> {
		try {
			Logger.info("[CARET-TOOLS] Loading tool definitions from JSON...")

			// Load TOOL_DEFINITIONS.json
			const toolDefinitions = await this.templateLoader.loadTemplate("TOOL_DEFINITIONS")

			if (!toolDefinitions.tools) {
				Logger.warn("[CARET-TOOLS] No tools section found in TOOL_DEFINITIONS.json")
				return
			}

			// Process each tool definition
			let loadedCount = 0
			let filteredCount = 0

			for (const [toolName, toolDef] of Object.entries(toolDefinitions.tools)) {
				const caretTool = toolDef as CaretToolDefinition

				// Apply context filters
				if (this.isToolAllowed(toolName, caretTool)) {
					this.availableTools.set(toolName, caretTool)
					loadedCount++
					Logger.debug(`[CARET-TOOLS] Loaded tool: ${toolName}`)
				} else {
					filteredCount++
					Logger.debug(`[CARET-TOOLS] Filtered out tool: ${toolName} (context mismatch)`)
				}
			}

			Logger.info(`[CARET-TOOLS] Tool loading complete: ${loadedCount} loaded, ${filteredCount} filtered`)
		} catch (error) {
			Logger.error(`[CARET-TOOLS] Failed to load tools: ${error}`)
			throw new Error(`Failed to load Caret tools: ${error}`)
		}
	}

	/**
	 * Check if a tool is allowed in current context
	 */
	private isToolAllowed(toolName: string, toolDef: CaretToolDefinition): boolean {
		// Check system restriction
		if (toolDef.system_restriction) {
			switch (toolDef.system_restriction) {
				case "caret_only":
					if (this.context.system !== "caret") return false
					break
				case "cline_only":
					if (this.context.system !== "cline") return false
					break
				case "both":
					// No restriction
					break
			}
		}

		// Check mode restriction
		if (toolDef.mode_restriction) {
			switch (toolDef.mode_restriction) {
				case "chatbot_only":
					if (this.context.mode !== "chatbot") return false
					break
				case "agent_only":
					if (this.context.mode !== "agent") return false
					break
				case "both":
					// No restriction
					break
			}
		}

		return true
	}

	/**
	 * Get all available tools for current context
	 */
	getAvailableTools(): Map<string, CaretToolDefinition> {
		return new Map(this.availableTools)
	}

	/**
	 * Get tool definition by name
	 */
	getToolDefinition(toolName: string): CaretToolDefinition | undefined {
		return this.availableTools.get(toolName)
	}

	/**
	 * Check if a specific tool is available
	 */
	hasTool(toolName: string): boolean {
		return this.availableTools.has(toolName)
	}

	/**
	 * Get tools filtered by execution type
	 */
	getToolsByType(executionType: "internal" | "external" | "hybrid"): CaretToolDefinition[] {
		return Array.from(this.availableTools.values()).filter((tool) => tool.execution_type === executionType)
	}

	/**
	 * Generate tool schema for LLM consumption
	 * Converts internal tool definitions to format expected by LLM
	 */
	generateToolSchema(): any[] {
		const schema: any[] = []

		for (const [toolName, toolDef] of this.availableTools.entries()) {
			schema.push({
				name: toolName,
				description: toolDef.description,
				parameters: toolDef.parameters,
			})
		}

		Logger.info(`[CARET-TOOLS] Generated schema for ${schema.length} tools`)
		return schema
	}

	/**
	 * Validate tool call parameters
	 */
	validateToolCall(toolName: string, parameters: any): boolean {
		const toolDef = this.getToolDefinition(toolName)
		if (!toolDef) {
			Logger.error(`[CARET-TOOLS] Tool not found: ${toolName}`)
			return false
		}

		// Basic parameter validation
		if (toolDef.parameters.required) {
			for (const requiredParam of toolDef.parameters.required) {
				if (!(requiredParam in parameters)) {
					Logger.error(`[CARET-TOOLS] Missing required parameter: ${requiredParam} for tool ${toolName}`)
					return false
				}
			}
		}

		return true
	}

	/**
	 * Get tool execution context
	 */
	getContext(): ToolContext {
		return { ...this.context }
	}

	/**
	 * Update execution context
	 */
	updateContext(newContext: Partial<ToolContext>): void {
		this.context = { ...this.context, ...newContext }
		Logger.info(`[CARET-TOOLS] Context updated: mode=${this.context.mode}, system=${this.context.system}`)
	}

	/**
	 * Refresh tools (reload from JSON)
	 */
	async refreshTools(): Promise<void> {
		Logger.info("[CARET-TOOLS] Refreshing tools...")
		this.availableTools.clear()
		this.templateLoader.clearCache()
		await this.loadTools()
	}

	/**
	 * Get tool statistics
	 */
	getToolStats(): {
		total: number
		byMode: Record<string, number>
		bySystem: Record<string, number>
		byType: Record<string, number>
	} {
		const stats = {
			total: this.availableTools.size,
			byMode: { chatbot_only: 0, agent_only: 0, both: 0, unrestricted: 0 },
			bySystem: { caret_only: 0, cline_only: 0, both: 0, unrestricted: 0 },
			byType: { internal: 0, external: 0, hybrid: 0 },
		}

		for (const tool of this.availableTools.values()) {
			// Count by mode restriction
			const modeRestriction = tool.mode_restriction || "unrestricted"
			stats.byMode[modeRestriction as keyof typeof stats.byMode]++

			// Count by system restriction
			const systemRestriction = tool.system_restriction || "unrestricted"
			stats.bySystem[systemRestriction as keyof typeof stats.bySystem]++

			// Count by execution type
			stats.byType[tool.execution_type]++
		}

		return stats
	}
}
