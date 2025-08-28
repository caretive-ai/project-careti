// CARET MODIFICATION: Independent System Prompt Generator for Caret
// Purpose: Generate system prompts using JSON-based assembly without Plan/Act dependencies
// Following complete independence from Cline's mode system

import { Logger } from "@/services/logging/Logger"
import { JsonSectionAssembler } from "./JsonSectionAssembler"
import { JsonTemplateLoader } from "./JsonTemplateLoader"
import { CaretToolHandler, ToolContext } from "../tools/CaretToolHandler"
import { CaretToolSelector } from "../tools/CaretToolSelector"

// Caret-specific mode types (completely independent from Cline)
export type CaretMode = "chatbot" | "agent"
export type CaretSystem = "caret"

// System prompt configuration for Caret
export interface CaretPromptConfig {
	mode: CaretMode
	system: CaretSystem
	extensionPath: string
	currentWorkingDirectory: string
	supportsBrowserUse?: boolean
	browserSettings?: any
	mcpHub?: any
	userCustomizations?: Record<string, any>
	isClaude4ModelFamily?: boolean
}

// Generated system prompt result
export interface CaretSystemPromptResult {
	systemPrompt: string
	availableTools: string[]
	mode: CaretMode
	system: CaretSystem
	metadata: {
		sectionsUsed: string[]
		toolsFiltered: number
		totalSections: number
		assemblyTime: number
	}
}

/**
 * Caret System Prompt Generator
 *
 * Generates complete system prompts using JSON-based assembly system.
 * Completely independent from Cline's Plan/Act mode system.
 *
 * Design Principles:
 * - Complete independence: Zero dependency on Plan/Act system
 * - JSON-first: All prompt sections from JSON templates
 * - Mode-aware: Different prompts for chatbot vs agent modes
 * - Tool integration: Seamless integration with Caret tool system
 * - Performance optimized: Efficient prompt assembly and caching
 */
export class CaretSystemPrompt {
	private sectionAssembler: JsonSectionAssembler
	private toolHandler?: CaretToolHandler
	private toolSelector?: CaretToolSelector
	private promptCache: Map<string, CaretSystemPromptResult>

	constructor(extensionPath: string) {
		const templateLoader = new JsonTemplateLoader(extensionPath, false)
		this.sectionAssembler = new JsonSectionAssembler(templateLoader)
		this.promptCache = new Map()

		Logger.info("[CARET-PROMPT] Initialized CaretSystemPrompt")
	}

	/**
	 * Generate complete system prompt for Caret mode
	 */
	async generateSystemPrompt(config: CaretPromptConfig): Promise<CaretSystemPromptResult> {
		const startTime = Date.now()
		const cacheKey = this.getCacheKey(config)

		// Check cache first
		if (this.promptCache.has(cacheKey)) {
			Logger.debug(`[CARET-PROMPT] Using cached prompt for ${config.mode} mode`)
			return this.promptCache.get(cacheKey)!
		}

		try {
			Logger.info(`[CARET-PROMPT] Generating system prompt for ${config.mode} mode`)

			// Initialize tool system for this configuration
			const toolContext: ToolContext = {
				mode: config.mode,
				system: config.system,
				extensionPath: config.extensionPath,
				currentWorkingDirectory: config.currentWorkingDirectory,
			}

			this.toolHandler = new CaretToolHandler(config.extensionPath, toolContext)
			this.toolSelector = new CaretToolSelector(this.toolHandler)

			// Load tools first
			await this.toolHandler.loadTools()

			// Assemble prompt sections
			const sections = await this.assemblePromptSections(config)

			// Generate final system prompt
			const systemPrompt = this.sectionAssembler.assembleFinalPrompt(sections)

			// Get available tools for this mode
			const toolSelection = this.toolSelector?.getRecommendedTools()
			const availableTools = toolSelection ? Array.from(toolSelection.selectedTools.keys()) : []

			const assemblyTime = Date.now() - startTime

			const result: CaretSystemPromptResult = {
				systemPrompt,
				availableTools,
				mode: config.mode,
				system: config.system,
				metadata: {
					sectionsUsed: sections.map((_, index) => `section_${index}`),
					toolsFiltered: toolSelection?.rejectedTools.length || 0,
					totalSections: sections.length,
					assemblyTime,
				},
			}

			// Cache the result
			this.promptCache.set(cacheKey, result)

			Logger.info(
				`[CARET-PROMPT] System prompt generated: ${config.mode} mode, ${sections.length} sections, ${availableTools.length} tools (${assemblyTime}ms)`,
			)

			return result
		} catch (error) {
			Logger.error(`[CARET-PROMPT] Failed to generate system prompt: ${error}`)
			throw new Error(`Failed to generate Caret system prompt: ${error}`)
		}
	}

	/**
	 * Assemble prompt sections based on configuration
	 */
	private async assemblePromptSections(config: CaretPromptConfig): Promise<string[]> {
		const sections: string[] = []

		// 1. Load base sections for the specific mode
		Logger.debug(`[CARET-PROMPT] Loading base sections for ${config.mode} mode`)
		const baseSections = await this.sectionAssembler.loadBaseSections(config.mode)
		sections.push(...baseSections)

		// 2. Add dynamic sections (MCP, system info, etc.)
		Logger.debug("[CARET-PROMPT] Generating dynamic sections")
		const dynamicSections = await this.sectionAssembler.generateDynamicSections(config.currentWorkingDirectory, config.mcpHub)
		sections.push(...dynamicSections)

		// 3. Add conditional sections based on capabilities
		Logger.debug("[CARET-PROMPT] Adding conditional sections")
		const conditionalSections = await this.sectionAssembler.addConditionalSections(
			config.supportsBrowserUse || false,
			config.browserSettings || {},
			config.isClaude4ModelFamily || false,
			config.mode,
		)
		sections.push(...conditionalSections)

		// 4. Add tool-specific sections
		Logger.debug("[CARET-PROMPT] Adding tool-specific sections")
		const toolSections = await this.generateToolSections(config)
		sections.push(...toolSections)

		// 5. Add user customizations
		if (config.userCustomizations) {
			Logger.debug("[CARET-PROMPT] Adding user customizations")
			const customSections = this.generateCustomSections(config.userCustomizations)
			sections.push(...customSections)
		}

		// 6. Load final sections (closing sections, etc.)
		Logger.debug("[CARET-PROMPT] Loading final sections")
		const finalSections = await this.sectionAssembler.loadFinalSections()
		sections.push(...finalSections)

		Logger.info(`[CARET-PROMPT] Assembled ${sections.length} sections total`)
		return sections
	}

	/**
	 * Generate tool-specific sections
	 */
	private async generateToolSections(config: CaretPromptConfig): Promise<string[]> {
		const sections: string[] = []

		// Get tools for current mode
		const toolSelection =
			config.mode === "chatbot" ? this.toolSelector?.getChatbotTools() : this.toolSelector?.getAgentTools()

		if (!toolSelection) {
			return sections
		}

		// Generate tool usage section
		if (toolSelection.totalSelected > 0) {
			const toolList = Array.from(toolSelection.selectedTools.keys()).join(", ")
			const toolSection = `# Available Tools for ${config.mode.toUpperCase()} Mode

You have access to ${toolSelection.totalSelected} specialized tools for ${config.mode} mode:
${toolList}

These tools are specifically filtered and optimized for ${config.mode} interactions.
Use them appropriately according to the current mode requirements.`

			sections.push(toolSection)
		}

		// Add mode-specific tool behavior section
		const behaviorSection = this.generateToolBehaviorSection(config.mode)
		if (behaviorSection) {
			sections.push(behaviorSection)
		}

		return sections
	}

	/**
	 * Generate tool behavior section based on mode
	 */
	private generateToolBehaviorSection(mode: CaretMode): string | null {
		switch (mode) {
			case "chatbot":
				return `# Chatbot Mode Tool Usage

In CHATBOT mode, focus on:
- Expert analysis and consultation
- Reading files for analysis purposes only  
- Providing guidance and recommendations
- NO code modifications or system changes
- Use caret_chatbot_respond for final responses`

			case "agent":
				return `# Agent Mode Tool Usage

In AGENT mode, you can:
- Make code modifications and improvements
- Perform file operations and system commands
- Execute comprehensive development tasks
- Combine analysis with immediate action
- Use caret_agent_execute for development tasks`

			default:
				return null
		}
	}

	/**
	 * Generate custom sections from user customizations
	 */
	private generateCustomSections(customizations: Record<string, any>): string[] {
		const sections: string[] = []

		// Convert user customizations to prompt sections
		for (const [key, value] of Object.entries(customizations)) {
			if (typeof value === "string" && value.trim()) {
				sections.push(`# User Customization: ${key}\n\n${value}`)
			}
		}

		return sections
	}

	/**
	 * Generate cache key for prompt configuration
	 */
	private getCacheKey(config: CaretPromptConfig): string {
		const keyData = {
			mode: config.mode,
			system: config.system,
			supportsBrowserUse: config.supportsBrowserUse,
			isClaude4ModelFamily: config.isClaude4ModelFamily,
			customizations: config.userCustomizations ? Object.keys(config.userCustomizations).sort() : [],
		}

		return JSON.stringify(keyData, Object.keys(keyData).sort())
	}

	/**
	 * Clear prompt cache
	 */
	clearCache(): number {
		const cacheSize = this.promptCache.size
		this.promptCache.clear()
		Logger.info(`[CARET-PROMPT] Prompt cache cleared: ${cacheSize} entries removed`)
		return cacheSize
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats(): {
		size: number
		keys: string[]
		hitRate?: number
	} {
		return {
			size: this.promptCache.size,
			keys: Array.from(this.promptCache.keys()),
		}
	}

	/**
	 * Validate prompt configuration
	 */
	validateConfig(config: CaretPromptConfig): {
		isValid: boolean
		errors: string[]
		warnings: string[]
	} {
		const errors: string[] = []
		const warnings: string[] = []

		// Required fields validation
		if (!config.mode) {
			errors.push("Mode is required")
		} else if (!["chatbot", "agent"].includes(config.mode)) {
			errors.push(`Invalid mode: ${config.mode}. Must be 'chatbot' or 'agent'`)
		}

		if (!config.system) {
			errors.push("System is required")
		} else if (config.system !== "caret") {
			errors.push(`Invalid system: ${config.system}. Must be 'caret'`)
		}

		if (!config.extensionPath) {
			errors.push("Extension path is required")
		}

		if (!config.currentWorkingDirectory) {
			errors.push("Current working directory is required")
		}

		// Optional field warnings
		if (!config.supportsBrowserUse) {
			warnings.push("Browser support is disabled")
		}

		return {
			isValid: errors.length === 0,
			errors,
			warnings,
		}
	}

	/**
	 * Get available modes
	 */
	getAvailableModes(): CaretMode[] {
		return ["chatbot", "agent"]
	}

	/**
	 * Check if a mode is supported
	 */
	isModeSupported(mode: string): mode is CaretMode {
		return ["chatbot", "agent"].includes(mode as CaretMode)
	}

	/**
	 * Generate mode-specific prompt preview
	 */
	async generateModePreview(mode: CaretMode, extensionPath: string): Promise<string> {
		const config: CaretPromptConfig = {
			mode,
			system: "caret",
			extensionPath,
			currentWorkingDirectory: "/preview/cwd",
			supportsBrowserUse: false,
		}

		try {
			const result = await this.generateSystemPrompt(config)
			return result.systemPrompt.substring(0, 500) + "..." // Preview first 500 chars
		} catch (error) {
			Logger.error(`[CARET-PROMPT] Failed to generate mode preview: ${error}`)
			return `Failed to generate preview for ${mode} mode`
		}
	}
}
