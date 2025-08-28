// CARET MODIFICATION: JSON-based system prompt assembly for Caret independence
import { Logger } from "@/services/logging/Logger"
import { JsonTemplateLoader } from "./JsonTemplateLoader"

/**
 * JSON Section Assembler
 *
 * Handles JSON section loading and assembly for system prompts
 * Separated from CaretSystemPrompt for KISS principle
 */
export class JsonSectionAssembler {
	private templateLoader: JsonTemplateLoader

	constructor(templateLoader: JsonTemplateLoader) {
		this.templateLoader = templateLoader
	}

	/**
	 * Load and assemble base JSON sections
	 */
	async loadBaseSections(mode: "chatbot" | "agent" = "agent"): Promise<string[]> {
		const sections: string[] = []
		const sectionOrder = [
			"BASE_PROMPT_INTRO",
			"COLLABORATIVE_PRINCIPLES",
			"TOOLS_HEADER",
			"TOOL_USE_FORMAT",
			"TOOL_DEFINITIONS",
			"TOOL_USE_EXAMPLES",
			"TOOL_USE_GUIDELINES",
			"CHATBOT_AGENT_MODES",
		]

		for (const sectionName of sectionOrder) {
			try {
				const template = await this.templateLoader.loadTemplate(sectionName)
				const formatted = this.formatJsonSection(template, mode)
				sections.push(formatted)
				Logger.debug(`[CARET-JSON] Loaded section ${sectionName} (${formatted.length} chars, mode: ${mode})`)
			} catch (error) {
				Logger.warn(`[CARET-JSON] Failed to load ${sectionName} section: ${error}`)
			}
		}

		// CARET MODIFICATION: Add explicit current mode activation instruction
		const currentModeInstruction = this.generateCurrentModeInstruction(mode)
		sections.push(currentModeInstruction)
		Logger.debug(`[CARET-JSON] Added current mode instruction: ${mode}`)

		return sections
	}

	/**
	 * Generate dynamic sections (MCP, system info)
	 */
	async generateDynamicSections(cwd: string, mcpHub: any): Promise<string[]> {
		const sections: string[] = []

		// MCP servers section
		const mcpSection = await this.generateMcpServerSection(mcpHub)
		sections.push(mcpSection)

		// System information section
		const systemSection = await this.generateSystemInfoSection(cwd)
		sections.push(systemSection)

		return sections
	}

	/**
	 * Add conditional sections (browser, Claude4, chatbot mode)
	 */
	async addConditionalSections(
		supportsBrowserUse: boolean,
		browserSettings: any,
		isClaude4ModelFamily: boolean,
		mode?: string,
	): Promise<string[]> {
		const sections: string[] = []

		if (supportsBrowserUse) {
			const browserSection = await this.generateBrowserSection(browserSettings)
			sections.push(browserSection)

			// CARET MODIFICATION: Add conditional browser_action tool
			const browserToolSection = await this.generateConditionalToolSection("supportsBrowserUse", browserSettings)
			sections.push(browserToolSection)
		}

		if (isClaude4ModelFamily) {
			const claude4Section = await this.generateClaude4Section()
			sections.push(claude4Section)
		}

		return sections
	}

	/**
	 * Load final sections
	 */
	async loadFinalSections(): Promise<string[]> {
		const sections: string[] = []

		try {
			const template = await this.templateLoader.loadTemplate("OBJECTIVE")
			const formatted = this.formatJsonSection(template)
			sections.push(formatted)
		} catch (error) {
			Logger.warn(`Failed to load OBJECTIVE section: ${error}`)
		}

		return sections
	}

	/**
	 * Format JSON template section
	 */
	private formatJsonSection(template: any, mode?: string): string {
		if (!template?.add?.sections) {
			return ""
		}

		const sections = template.add.sections
		let result = ""

		for (const section of sections) {
			// Apply mode filtering if specified
			if (mode && section.mode && section.mode !== mode) {
				continue
			}

			result += section.content + "\n"
		}

		// Handle tools section for TOOL_DEFINITIONS
		if (template.tools && typeof template.tools === "object") {
			Logger.debug(`Found tools section with ${Object.keys(template.tools).length} tools`)
			result += "\n" // Add spacing before tools

			for (const [toolName, toolDef] of Object.entries(template.tools)) {
				if (typeof toolDef === "object" && toolDef !== null && "title" in toolDef) {
					const tool = toolDef as any

					// CARET MODIFICATION: Handle conditional tool exclusion
					if (tool.conditional) {
						// Skip conditional tools - they will be handled by addConditionalSections
						Logger.debug(`Skipping conditional tool ${tool.title} (condition: ${tool.conditional})`)
						continue
					}

					// CARET MODIFICATION: Handle mode-based tool filtering
					if (mode) {
						if (mode === "chatbot") {
							// Chatbot mode: only read-only tools, planning tools, and session management allowed
							const readOnlyTools = [
								"read_file",
								"search_files",
								"list_files",
								"list_code_definition_names",
								"chatbot_mode_respond",
								"new_task", // CARET MODIFICATION: Allow new_task in chatbot mode
								"ask_followup_question", // CARET MODIFICATION: Allow ask_followup_question
								"browse_web", // CARET MODIFICATION: Allow browse_web for analysis
								"browser_action", // CARET MODIFICATION: Allow browser_action for web analysis
								"use_mcp_tool", // CARET MODIFICATION: Allow MCP tools for extended analysis
								"access_mcp_resource", // CARET MODIFICATION: Allow MCP resources for data access
								"load_mcp_documentation", // CARET MODIFICATION: Allow MCP documentation
							]
							if (!readOnlyTools.includes(toolName)) {
								Logger.debug(`Skipping non-read-only tool ${tool.title} in chatbot mode`)
								continue
							}
						} else if (mode === "agent") {
							// Agent mode: All tools allowed except mode-restricted ones
							if (tool.mode_restriction === "chatbot_only") {
								Logger.debug(`Skipping chatbot-only tool ${tool.title} in agent mode`)
								continue
							}
						}
					}

					result += `\n## ${tool.title}\n`
					if (tool.description) {
						result += `Description: ${tool.description}\n`
					}
					if (tool.parameters && Array.isArray(tool.parameters)) {
						result += `Parameters:\n`
						for (const param of tool.parameters) {
							result += `- ${param.name}${param.required ? " (required)" : " (optional)"}: ${param.description}\n`
						}
					}
					if (tool.usage) {
						result += `Usage:\n${tool.usage}\n`
					}
				}
			}
		}

		return result.trim()
	}

	/**
	 * Generate MCP server section
	 *
	 * CARET MODIFICATION: JIT (Just-In-Time) token optimization
	 * Phase 1: Complete MCP section removal for 79% token savings
	 *
	 * Previous implementation added 200-4,500 tokens per MCP server.
	 * New implementation: 0 tokens (complete removal) for maximum efficiency.
	 *
	 * Future Phase 2: Dynamic MCP loading on-demand via <request_tools>
	 */
	private async generateMcpServerSection(mcpHub: any): Promise<string> {
		try {
			// CARET MODIFICATION: JIT Phase 1 - Complete MCP section removal
			// Log token optimization for monitoring
			const servers = mcpHub?.getServers?.() ?? []
			const serverCount = servers.length

			Logger.info(`[CARET-JSON] MCP section removed for token optimization - ${serverCount} servers excluded`)

			// Return empty string instead of MCP server information
			// This achieves dramatic token savings (typically 200-4,500 tokens per session)
			return ""
		} catch (error) {
			// Even on error, return empty string for consistency
			Logger.info(`[CARET-JSON] MCP section removed (error occurred but maintaining optimization)`)
			return ""
		}
	}

	/**
	 * Generate system information section
	 */
	private async generateSystemInfoSection(cwd: string): Promise<string> {
		const osInfo = process.platform + " " + process.version
		return `\n====\n\nSYSTEM INFORMATION\n\nOperating System: ${osInfo}\nWorking Directory: ${cwd}\n`
	}

	/**
	 * Generate browser section
	 */
	private async generateBrowserSection(browserSettings: any): Promise<string> {
		const viewport = browserSettings?.viewport || { width: 1280, height: 720 }
		return `\n====\n\nBROWSER SUPPORT\n\nBrowser automation is enabled with Puppeteer.\nViewport: ${viewport.width}x${viewport.height}\nAvailable browser_action tool for web interaction.\n`
	}

	/**
	 * Generate Claude 4 section
	 */
	private async generateClaude4Section(): Promise<string> {
		return `\n====\n\nCLAUDE 4 FEATURES\n\nAdvanced Claude 4 model features are enabled.\n`
	}

	/**
	 * CARET MODIFICATION: Generate conditional tool section
	 * Adds tools that have conditional attributes when conditions are met
	 */
	private async generateConditionalToolSection(condition: string, settings?: any): Promise<string> {
		try {
			const template = await this.templateLoader.loadTemplate("TOOL_DEFINITIONS")
			const templateAny = template as any // CARET MODIFICATION: Type casting for tools access
			if (!templateAny?.tools) {
				return ""
			}

			let result = ""
			for (const [toolName, toolDef] of Object.entries(templateAny.tools)) {
				if (typeof toolDef === "object" && toolDef !== null && "title" in toolDef) {
					const tool = toolDef as any

					// Only include tools that match the current condition
					if (tool.conditional === condition) {
						result += `\n## ${tool.title}\n`
						if (tool.description) {
							// Handle dynamic content replacement (e.g., viewport size)
							let description = tool.description
							if (condition === "supportsBrowserUse" && settings?.viewport) {
								description = description.replace(
									"{{browserSettings.viewport.width}}x{{browserSettings.viewport.height}}",
									`${settings.viewport.width}x${settings.viewport.height}`,
								)
							}
							result += `Description: ${description}\n`
						}
						if (tool.parameters && Array.isArray(tool.parameters)) {
							result += `Parameters:\n`
							for (const param of tool.parameters) {
								result += `- ${param.name}${param.required ? " (required)" : " (optional)"}: ${param.description}\n`
							}
						}
						if (tool.usage) {
							result += `Usage:\n${tool.usage}\n`
						}
					}
				}
			}

			if (result.trim()) {
				Logger.debug(`Generated conditional tool section for ${condition}: ${result.length} chars`)
			}

			return result
		} catch (error) {
			Logger.warn(`Failed to generate conditional tool section for ${condition}: ${error}`)
			return ""
		}
	}

	/**
	 * CARET MODIFICATION: Generate explicit current mode activation instruction
	 * Based on Cline's successful pattern of clearly indicating current mode
	 */
	private generateCurrentModeInstruction(mode: "chatbot" | "agent"): string {
		const modeUpper = mode.toUpperCase()

		if (mode === "chatbot") {
			return `====

CURRENT MODE: CHATBOT MODE

You are currently operating in CHATBOT MODE. In this mode:

- Focus on expert analysis, consultation, and guidance
- Provide detailed explanations and recommendations  
- Use read-only tools for analysis purposes only
- DO NOT make code modifications or system changes
- When providing your final response, use the chatbot_mode_respond tool

Your role is to act as an expert consultant who analyzes and provides guidance without making changes.

====`
		} else {
			return `====

CURRENT MODE: AGENT MODE

You are currently operating in AGENT MODE. In this mode:

- Work as a collaborative development partner
- Combine analysis with immediate execution and action
- Use all available tools to accomplish development tasks
- Make code modifications, file operations, and system changes as needed
- Execute comprehensive development workflows

Your role is to actively implement solutions while providing analysis and guidance.

====`
		}
	}

	/**
	 * Assemble final prompt from sections
	 */
	assembleFinalPrompt(sections: string[]): string {
		const prompt = sections.filter((s) => s.trim().length > 0).join("\n\n")

		Logger.debug(`Final prompt assembled - sections: ${sections.length}, length: ${prompt.length}`)

		return prompt
	}
}
