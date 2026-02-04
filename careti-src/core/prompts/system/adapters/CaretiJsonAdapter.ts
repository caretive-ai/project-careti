import { IPromptSystem } from "@careti/core/prompts/system/IPromptSystem"
import { JsonTemplateLoader } from "@careti/core/prompts/system/JsonTemplateLoader"
import { CaretSystemPromptContext } from "@careti/core/prompts/system/types"
import { API_PROVIDERS, CARETI_MODES } from "@careti/shared/constants/PromptSystemConstants"
import { ClineToolSet } from "@core/prompts/system-prompt/registry/ClineToolSet"
import { PromptBuilder } from "@core/prompts/system-prompt/registry/PromptBuilder"
import { PromptRegistry } from "@core/prompts/system-prompt/registry/PromptRegistry"
import { Logger } from "@services/logging/Logger"
import { ModelFamily } from "@shared/prompts"
import { ClineDefaultTool } from "@shared/tools"

/**
 * Adapter for Careti's JSON-based prompt system.
 * It assembles a system prompt by dynamically selecting and combining
 * JSON sections based on the provided context.
 */
export class CaretiJsonAdapter implements IPromptSystem {
	private loader: JsonTemplateLoader

	constructor() {
		this.loader = JsonTemplateLoader.getInstance()
	}

	/**
	 * Assembles a system prompt using JSON templates.
	 * @param context The context driving prompt generation.
	 * @returns A promise resolving to the complete system prompt string.
	 */
	public async getPrompt(context: CaretSystemPromptContext): Promise<string> {
		const isChatbotMode = context.mode === CARETI_MODES.CHATBOT

		// CARETI MODIFICATION: Add debug logging for mode verification
		Logger.debug(`[CaretiJsonAdapter] 🎯 Mode: ${context.mode}, isChatbotMode: ${isChatbotMode}`)

		// CARETI MODIFICATION: F12 - Check if Claude Code provider is active for Task tool injection
		const isClaudeCodeProvider = context.providerInfo?.providerId === API_PROVIDERS.CLAUDE_CODE
		// CARETI MODIFICATION: Gate Task tool by subagent availability (disabled in Careti mode v0.4.4)
		const isSubagentsEnabledAndCliInstalled = !!context.isSubagentsEnabledAndCliInstalled
		Logger.debug(
			`[CaretiJsonAdapter] 🔍 Provider detection: providerId="${context.providerInfo?.providerId}", isClaudeCodeProvider=${isClaudeCodeProvider}, API_PROVIDERS.CLAUDE_CODE="${API_PROVIDERS.CLAUDE_CODE}"`,
		)
		Logger.debug(`[CaretiJsonAdapter] loading JSON templates...`)

		// CARETI MODIFICATION: Skip COLLABORATIVE_PRINCIPLES in yolo/headless mode
		// This allows subagents to run autonomously without documentation/approval requirements
		const isYoloMode = context.yoloModeToggled === true
		if (isYoloMode) {
			Logger.debug(`[CaretiJsonAdapter] 🚀 Yolo mode enabled - skipping COLLABORATIVE_PRINCIPLES`)
		}

		const sectionNames = [
			"BASE_PROMPT_INTRO",
			"CHATBOT_AGENT_MODES", // CARETI MODIFICATION: Explicit mode system with PLAN/ACT rejection
			"AGENT_BEHAVIOR_DIRECTIVES",
			isYoloMode ? null : "COLLABORATIVE_PRINCIPLES", // CARETI MODIFICATION: Skip in yolo mode
			"CARET_SYSTEM_INFO",
			"CARET_CAPABILITIES",
			"CARET_USER_INSTRUCTIONS",
			// CARET_TOOL_SYSTEM removed - replaced with Cline original tool system (inserted after CARET_USER_INSTRUCTIONS)
			isClaudeCodeProvider && isSubagentsEnabledAndCliInstalled ? "CLAUDE_CODE_TASK_TOOL" : null, // CARETI MODIFICATION: F12 - Claude Code Task tool for subagent support
			"CARET_FILE_EDITING",
			"CARET_BEHAVIOR_RULES",
			"CARET_TASK_OBJECTIVE",
			"CARET_ACTION_STRATEGY",
			context.auto_todo || context.task_progress ? "CARET_TODO_MANAGEMENT" : null,
			context.task_progress ? "CARET_TASK_PROGRESS" : null,
			"CARET_FEEDBACK_SYSTEM",
			context.mcpHub?.getServers()?.length ? "CARET_MCP_INTEGRATION" : null,
		].filter(Boolean) as string[]

		Logger.debug(`[CaretiJsonAdapter] 📋 Selected sections: ${JSON.stringify(sectionNames)}`)

		const promptParts: string[] = []

		Logger.debug(`[CaretiJsonAdapter] 🔧 2Starting prompt generation...`)

		// Process JSON sections first
		for (const name of sectionNames) {
			const template = this.loader.getTemplate<any>(name)
			if (!template) {
				Logger.debug(`[CaretiJsonAdapter] ❌ Template not found: ${name}`)
				continue
			}

			// CARETI MODIFICATION: Use Cline's actual user instructions system for CARET_USER_INSTRUCTIONS
			if (name === "CARET_USER_INSTRUCTIONS") {
				const clineUserInstructions = await this.getClineUserInstructions(context, isChatbotMode)
				if (clineUserInstructions) {
					promptParts.push(clineUserInstructions)
					Logger.debug(
						`[CaretiJsonAdapter] ✅ ${name}: loaded from Cline system (${clineUserInstructions.length} chars)`,
					)
				} else {
					// Fallback to JSON template if Cline system fails
					const sectionContent = this.getDynamicSection(template, isChatbotMode, context)
					if (sectionContent.trim()) {
						promptParts.push(sectionContent)
						Logger.debug(`[CaretiJsonAdapter] ✅ ${name}: loaded from JSON template (${sectionContent.length} chars)`)
					} else {
						Logger.debug(`[CaretiJsonAdapter] ⚠️ ${name}: empty content`)
					}
				}
			} else if (name === "CLAUDE_CODE_TASK_TOOL") {
				// CARETI MODIFICATION: F12 - Format Task tool description for Claude Code
				const taskToolContent = this.formatTaskToolDescription(template)
				if (taskToolContent.trim()) {
					promptParts.push(taskToolContent)
					Logger.debug(`[CaretiJsonAdapter] ✅ ${name}: loaded and formatted (${taskToolContent.length} chars)`)
				} else {
					Logger.debug(`[CaretiJsonAdapter] ⚠️ ${name}: empty content after formatting`)
				}
			} else {
				const sectionContent = this.getDynamicSection(template, isChatbotMode, context)
				if (sectionContent.trim()) {
					promptParts.push(sectionContent)
					Logger.debug(`[CaretiJsonAdapter] ✅ ${name}: loaded (${sectionContent.length} chars)`)
				} else {
					Logger.debug(`[CaretiJsonAdapter] ⚠️ ${name}: empty content`)
				}
			}

			// Insert Cline tools section after CARET_USER_INSTRUCTIONS
			if (name === "CARET_USER_INSTRUCTIONS") {
				Logger.debug(`[CaretiJsonAdapter] 🎯 About to insert Cline tools after ${name}`)
				const clineToolsSection = await this.getClineToolsSection(context, isChatbotMode)
				if (clineToolsSection) {
					promptParts.push(clineToolsSection)
					Logger.debug(
						`[CaretiJsonAdapter] ✅ Cline tools section inserted after ${name} (${clineToolsSection.length} chars)`,
					)
				} else {
					Logger.debug(`[CaretiJsonAdapter] ❌ Failed to generate Cline tools section`)
				}
			}
		}

		// If tools weren't added yet (no CARET_USER_INSTRUCTIONS), add them now
		Logger.debug(`[CaretiJsonAdapter] 🔍 Checking if tools were added...`)
		const hasToolsSection = promptParts.some((p) => p.includes("# TOOL USAGE SYSTEM"))
		Logger.debug(`[CaretiJsonAdapter] Tools section exists: ${hasToolsSection}`)

		if (!hasToolsSection) {
			Logger.debug(`[CaretiJsonAdapter] 🎯 Adding Cline tools at end as backup`)
			const clineToolsSection = await this.getClineToolsSection(context, isChatbotMode)
			if (clineToolsSection) {
				promptParts.push(clineToolsSection)
				Logger.debug(`[CaretiJsonAdapter] ✅ Cline tools section added at end (${clineToolsSection.length} chars)`)
			} else {
				Logger.debug(`[CaretiJsonAdapter] ❌ Backup tools section also failed!`)
			}
		}

		const finalPrompt = promptParts.filter(Boolean).join("\n\n")
		Logger.debug(
			`[CaretiJsonAdapter] 🎉 Final prompt generated: ${finalPrompt.length} characters, ${promptParts.length} sections`,
		)

		return finalPrompt
	}

	/**
	 * Gets user instructions from Cline's system (.agents/context + AGENTS.md).
	 * CARETI MODIFICATION: Ensure Careti rules are passed into the system prompt.
	 */
	private async getClineUserInstructions(context: CaretSystemPromptContext, isChatbotMode: boolean): Promise<string | null> {
		try {
			// Import Cline's getUserInstructions function
			const { getUserInstructions } = await import("@core/prompts/system-prompt/components/user_instructions")

			// Get the appropriate variant for the model using PromptRegistry
			const registry = PromptRegistry.getInstance()
			await registry.load()

			// Use GENERIC family to get default variant
			const variant = registry.getVariantMetadata(ModelFamily.GENERIC)
			if (!variant) {
				Logger.warn(`[CaretiJsonAdapter] ⚠️ No variant found for GENERIC family`)
				return null
			}

			// Call Cline's getUserInstructions with the context
			// This will include .agents/context + AGENTS.md based on priority
			const userInstructions = await getUserInstructions(variant, context as any)

			if (userInstructions) {
				Logger.info(`[CaretiJsonAdapter] ✅ Loaded Cline user instructions (${userInstructions.length} chars)`)
			} else {
				Logger.info(`[CaretiJsonAdapter] ℹ️ No Cline user instructions found`)
			}

			return userInstructions || null
		} catch (error) {
			Logger.error(`[CaretiJsonAdapter] ❌ Error loading Cline user instructions:`, error)
			return null
		}
	}

	/**
	 * Gets Cline's original tool system with Careti mode restrictions applied.
	 * This replaces the inadequate CARET_TOOL_SYSTEM.json with full Cline tool functionality.
	 */
	private async getClineToolsSection(context: CaretSystemPromptContext, isChatbotMode: boolean): Promise<string | null> {
		try {
			// CARETI MODIFICATION: Fixed cline-latest compatibility

			// CRITICAL: Ensure PromptRegistry is loaded first to register all tools
			const registry = PromptRegistry.getInstance()
			await registry.load()

			// FIXED: Use minimal mockVariant with tools: undefined
			// This triggers Cline's automatic tool loading (ClineToolSet.getTools())
			const mockVariant = {
				id: "careti-tools",
				version: 1,
				tags: [] as readonly string[],
				labels: {} as Readonly<Record<string, number>>,
				// CARETI MODIFICATION: Force GENERIC family to ensure all tools are loaded
				// next-gen and other new families don't have tools registered yet
				family: ModelFamily.GENERIC,
				description: "Careti tools integration",
				config: { tools: [] } as any,
				baseTemplate: "",
				componentOrder: [] as readonly any[],
				componentOverrides: {} as any,
				placeholders: {} as Readonly<Record<string, string>>,
				// FIXED: tools: [] for cline-latest compatibility - triggers automatic loading of all tools for family
				tools: [] as readonly ClineDefaultTool[],
				toolOverrides: undefined,
				// CARETI MODIFICATION: matcher required by PromptVariant (cline v3.38.1) to allow tool loading path
				matcher: () => true,
			} as const

			Logger.debug(
				`[DEBUG CaretiJsonAdapter] Using mockVariant with automatic tool loading: family=${mockVariant.family}, tools=${JSON.stringify(mockVariant.tools)}`,
			)

			const toolPrompts = await PromptBuilder.getToolsPrompts(mockVariant, context)

			Logger.debug(
				`[DEBUG CaretiJsonAdapter] PromptBuilder returned: toolPrompts=${toolPrompts ? toolPrompts.length : "null/undefined"}, firstTool=${toolPrompts?.[0]?.substring(0, 100) + "..."}`,
			)

			if (!toolPrompts || toolPrompts.length === 0) {
				Logger.debug(`[CaretiJsonAdapter] ❌ No tools available from Cline system - investigating...`)
				Logger.debug(
					`[DEBUG CaretiJsonAdapter] Context details: contextKeys=${JSON.stringify(Object.keys(context))}, providerInfo=${context.providerInfo?.providerId}, model=${context.providerInfo?.model}`,
				)

				// Additional debugging: Check ClineToolSet directly
				try {
					const directTools = ClineToolSet.getTools(mockVariant.family)
					Logger.debug(
						`[DEBUG CaretiJsonAdapter] Direct ClineToolSet.getTools returned: toolsCount=${directTools.length}, toolIds=${JSON.stringify(directTools.map((t) => t.config.id))}, family=${mockVariant.family}`,
					)

					// Check if browser_action specifically is available
					const browserTool = ClineToolSet.getToolByName("browser_action", mockVariant.family)
					Logger.debug(
						`[DEBUG CaretiJsonAdapter] Browser tool lookup: found=${!!browserTool}, toolId=${browserTool?.config.id}, toolName=${browserTool?.config.name}`,
					)
				} catch (error) {
					Logger.debug(`[DEBUG CaretiJsonAdapter] ClineToolSet direct access error: ${error}`)
				}

				// CARETI MODIFICATION: Provide fallback tool information when Cline tools are unavailable
				return this.getFallbackToolsSection(isChatbotMode)
			}

			let toolsContent = "# TOOL USAGE SYSTEM\n\n"

			// Add Careti-specific mode restrictions info
			if (isChatbotMode) {
				toolsContent += "**CURRENT MODE: CHATBOT** - Limited tool access for conversational assistance\n\n"
				toolsContent += "Available tools in CHATBOT mode:\n"
				toolsContent += "- read_file: Read file contents\n"
				toolsContent += "- list_files: List directory contents\n"
				toolsContent += "- search_files: Search for files and content\n"
				toolsContent += "- ask_followup_question: Ask clarifying questions\n"
				toolsContent += "- web_fetch: Fetch web content for research\n"
				toolsContent += "\n**RESTRICTED in CHATBOT mode:** file editing, command execution, browser automation\n\n"
			} else {
				toolsContent += "**CURRENT MODE: AGENT** - Full autonomous tool access\n\n"
				toolsContent += "All tools available in AGENT mode for autonomous task execution.\n\n"
			}

			// CARETI MODIFICATION: Enhanced tool filtering with detailed logging
			// Remove plan_mode_respond from all Careti modes (it's Cline-specific for PLAN MODE)
			const excludedTools = ["plan_mode_respond"]

			// CARETI MODIFICATION: Filter image tools based on toolSettings from AutoApprovalSettings
			const toolSettings = context.toolSettings

			// Filter generate_image based on settings (default: true)
			if (toolSettings?.generateImages === false) {
				excludedTools.push("generate_image")
				Logger.debug(`[CaretiJsonAdapter] generate_image tool disabled by settings`)
			}

			// CARETI MODIFICATION: Filter analyze_image based on model capability and settings
			// - Vision models can use read_file to directly view images → analyze_image unnecessary
			// - Text-only models need analyze_image (uses Careti API with Gemini 2.5 Flash)
			const modelSupportsImages = context.providerInfo?.model?.info?.supportsImages === true
			if (toolSettings?.analyzeImages === false) {
				excludedTools.push("analyze_image")
				Logger.debug(`[CaretiJsonAdapter] analyze_image tool disabled by settings`)
			} else if (modelSupportsImages) {
				excludedTools.push("analyze_image")
				Logger.debug(`[CaretiJsonAdapter] analyze_image tool disabled for vision model (use read_file instead)`)
			} else {
				Logger.debug(`[CaretiJsonAdapter] analyze_image tool enabled for text-only model`)
			}

			let filteredTools = toolPrompts.filter(
				(toolPrompt: string) => !excludedTools.some((excluded) => toolPrompt.includes(`## ${excluded}`)),
			)

			// CARETI MODIFICATION: Replace PLAN/ACT terminology with CHATBOT/AGENT in tool descriptions
			// This ensures users only see Careti terminology (CHATBOT/AGENT) and never Cline terminology (PLAN/ACT)
			// NOTE: Order matters! Handle specific phrases (toggle to, switch to) BEFORE general replacements
			filteredTools = filteredTools.map((toolPrompt: string) => {
				return (
					toolPrompt
						// Handle specific phrases FIRST (before general "Act mode" replacement)
						.replace(/toggle to (Act|ACT) mode/gi, "toggle to AGENT mode")
						.replace(/switch to (Act|ACT) mode/gi, "switch to AGENT mode")
						.replace(/toggle to (Plan|PLAN) mode/gi, "toggle to CHATBOT mode")
						.replace(/switch to (Plan|PLAN) mode/gi, "switch to CHATBOT mode")
						// Then handle general replacements
						.replace(/\bPLAN MODE\b/g, "CHATBOT MODE")
						.replace(/\bACT MODE\b/g, "AGENT MODE")
						.replace(/\bPlan MODE\b/g, "Chatbot MODE")
						.replace(/\bAct MODE\b/g, "Agent MODE")
						.replace(/\bplan mode\b/g, "chatbot mode")
						.replace(/\bact mode\b/g, "agent mode")
						.replace(/\bPlan mode\b/g, "Chatbot mode")
						.replace(/\bAct mode\b/g, "Agent mode")
				)
			})

			// CARETI MODIFICATION: Add image reading capability note to read_file for vision models
			// Vision models can read image files via read_file tool, but this isn't in Cline's original description
			if (modelSupportsImages) {
				filteredTools = filteredTools.map((toolPrompt: string) => {
					if (toolPrompt.includes("## read_file")) {
						// Insert image capability note after "Automatically extracts raw text from PDF and DOCX files."
						return toolPrompt.replace(
							"Automatically extracts raw text from PDF and DOCX files.",
							"Automatically extracts raw text from PDF and DOCX files. **You can also read image files (PNG, JPG, GIF, WebP) and view their contents directly** - use this to examine screenshots, UI mockups, generated images, or any visual content saved to disk.",
						)
					}
					return toolPrompt
				})
				Logger.debug(`[CaretiJsonAdapter] Added image reading capability to read_file for vision model`)
			}

			if (isChatbotMode) {
				// In CHATBOT mode, restrict to read-only and research tools
				const allowedInChatbot = [
					"read_file",
					"list_files",
					"search_files",
					"list_code_definition_names",
					"ask_followup_question",
					"web_fetch",
					"attempt_completion",
				]
				filteredTools = filteredTools.filter((toolPrompt: string) => {
					const toolMatch = allowedInChatbot.some((allowed) => toolPrompt.includes(`## ${allowed}`))
					return toolMatch
				})
			}

			toolsContent += filteredTools.join("\n\n")

			console.log(
				`[CaretiJsonAdapter] ✅ Generated Cline tools section: ${filteredTools.length}/${toolPrompts.length} tools (${toolsContent.length} chars)`,
			)
			return toolsContent
		} catch (error) {
			console.error(`[CaretiJsonAdapter] ❌ Error generating Cline tools section:`, error)
			return null
		}
	}

	/**
	 * Gets content from a section based on its structure and the current mode.
	 * Supports template variable substitution for dynamic content.
	 */
	private getDynamicSection(template: any, isChatbotMode: boolean, context?: CaretSystemPromptContext): string {
		let content = ""

		// Handle new comprehensive JSON structure
		if (template.collaborative_principles?.sections) {
			content = this.processTemplateSections(template.collaborative_principles.sections, isChatbotMode)
		} else if (template.mode_system?.sections) {
			content = this.processTemplateSections(template.mode_system.sections, isChatbotMode)
		} else if (template.system_context?.sections) {
			content = this.processTemplateSections(template.system_context.sections, isChatbotMode)
		} else if (template.behavior_directives?.persona) {
			// Handle new AGENT_BEHAVIOR_DIRECTIVES.json
			const directives = template.behavior_directives
			const mode = isChatbotMode ? directives.modes.chatbot : directives.modes.agent
			content = [mode.header, directives.persona, ...mode.directive].join("\n")
		} else if (template.capabilities?.sections) {
			content = this.processTemplateSections(template.capabilities.sections, isChatbotMode)
		} else if (template.file_editing?.sections) {
			content = this.processTemplateSections(template.file_editing.sections, isChatbotMode)
		} else if (template.user_instructions?.sections) {
			content = this.processTemplateSections(template.user_instructions.sections, isChatbotMode)
		} else if (template.task_objective?.sections) {
			content = this.processTemplateSections(template.task_objective.sections, isChatbotMode)
		} else if (template.behavior_rules?.sections) {
			content = this.processTemplateSections(template.behavior_rules.sections, isChatbotMode)
		} else if (template.action_strategy?.sections) {
			content = this.processTemplateSections(template.action_strategy.sections, isChatbotMode)
		} else if (template.tool_system?.sections) {
			// DEPRECATED: CARET_TOOL_SYSTEM.json is no longer used - Cline original tools used instead
			console.warn(`[CaretiJsonAdapter] ⚠️ DEPRECATED: tool_system template found - using Cline original instead`)
			content = this.processTemplateSections(template.tool_system.sections, isChatbotMode)
		} else if (template.mcp_integration?.sections) {
			content = this.processTemplateSections(template.mcp_integration.sections, isChatbotMode)
		}
		// Legacy format support
		else if (template.add?.sections) {
			content = template.add.sections.map((s: any) => s.content).join("\n\n")
		}
		// Mode-specific content
		else if (isChatbotMode && template.chatbot) {
			content = template.chatbot.template || template.chatbot.style || template.chatbot.request
		} else if (!isChatbotMode && template.agent) {
			content = template.agent.template || template.agent.style || template.agent.request
		} else {
			content = template.content || ""
		}

		// Apply template variable substitution
		return this.substituteTemplateVars(content, isChatbotMode, context)
	}

	/**
	 * Processes template sections with mode filtering.
	 */
	private processTemplateSections(sections: any[], isChatbotMode: boolean): string {
		return sections
			.filter((section) => {
				const mode = section.mode
				if (!mode || mode === "both") {
					return true
				}
				return isChatbotMode ? mode === "chatbot" : mode === "agent"
			})
			.map((section) => section.content)
			.join("\n\n")
	}

	/**
	 * Substitutes template variables with appropriate values.
	 */
	private substituteTemplateVars(content: string, isChatbotMode: boolean, context?: CaretSystemPromptContext): string {
		// CARETI MODIFICATION: Add current_mode variable substitution
		const currentMode = isChatbotMode ? "CHATBOT" : "AGENT"

		const result = content
			.replace(/\{\{current_mode\}\}/g, currentMode)
			.replace(/\{\{working_dir\}\}/g, process.cwd())
			.replace(/\{\{os\}\}/g, process.platform)
			.replace(/\{\{shell\}\}/g, process.env.SHELL || "/bin/bash")
			.replace(/\{\{home_dir\}\}/g, process.env.HOME || process.env.USERPROFILE || "~")
			.replace(/\{\{custom_instructions\}\}/g, this.getCustomInstructions(context))
			.replace(/\{\{mcp_servers_list\}\}/g, "No MCP servers currently connected")

		return result
	}

	/**
	 * Build custom instructions from various sources (same logic as Cline's user_instructions.ts)
	 */
	private getCustomInstructions(context?: CaretSystemPromptContext): string {
		if (!context) {
			return "None provided"
		}

		const customInstructions: string[] = []

		// CARETI MODIFICATION: Enhanced language support - prioritize preferredLanguageInstructions
		if ((context as any).preferredLanguageInstructions) {
			customInstructions.push((context as any).preferredLanguageInstructions)
			console.log(`[CaretiJsonAdapter] 🌐 Language instruction added: ${(context as any).preferredLanguageInstructions}`)
		}

		if ((context as any).globalClineRulesFileInstructions) {
			customInstructions.push((context as any).globalClineRulesFileInstructions)
		}

		if ((context as any).localClineRulesFileInstructions) {
			customInstructions.push((context as any).localClineRulesFileInstructions)
		}

		if ((context as any).localCursorRulesFileInstructions) {
			customInstructions.push((context as any).localCursorRulesFileInstructions)
		}

		if ((context as any).localCursorRulesDirInstructions) {
			customInstructions.push((context as any).localCursorRulesDirInstructions)
		}

		if ((context as any).localWindsurfRulesFileInstructions) {
			customInstructions.push((context as any).localWindsurfRulesFileInstructions)
		}

		if ((context as any).clineIgnoreInstructions) {
			customInstructions.push((context as any).clineIgnoreInstructions)
		}

		if (customInstructions.length === 0) {
			return "None provided"
		}

		const result = customInstructions.join("\n\n")
		console.log(
			`[CaretiJsonAdapter] 📋 Custom instructions built: ${customInstructions.length} sections, ${result.length} chars`,
		)
		return result
	}

	/**
	 * CARETI MODIFICATION: F12 - Format Task tool description from JSON to Cline tool format
	 * Converts CLAUDE_CODE_TASK_TOOL.json into the standard tool description format
	 */
	private formatTaskToolDescription(template: any): string {
		if (!template || !template.name) {
			Logger.warn(`[CaretiJsonAdapter] ⚠️ Invalid Task tool template structure`)
			return ""
		}

		let content = `## ${template.name.toLowerCase()}\n`
		content += `Description: ${template.description || "No description provided"}\n`

		// Format parameters from input_schema
		if (template.input_schema?.properties) {
			content += "Parameters:\n"
			const required = template.input_schema.required || []

			for (const [paramName, paramDef] of Object.entries(template.input_schema.properties)) {
				const param = paramDef as any
				const isRequired = required.includes(paramName)
				content += `- ${paramName}: (${isRequired ? "required" : "optional"}) ${param.description || param.type}\n`
			}
		}

		// Add usage example
		content += "Usage:\n"
		content += `<${template.name.toLowerCase()}>\n`

		if (template.input_schema?.properties) {
			for (const paramName of Object.keys(template.input_schema.properties)) {
				content += `<${paramName}>${paramName} here</${paramName}>\n`
			}
		}

		content += `</${template.name.toLowerCase()}>\n`

		Logger.debug(`[CaretiJsonAdapter] 🔧 Formatted Task tool: ${template.name} (${content.length} chars)`)

		return content
	}

	/**
	 * Fallback tool section when Cline tools system is unavailable.
	 * Provides basic tool information to ensure prompt generation continues.
	 */
	private getFallbackToolsSection(isChatbotMode: boolean): string {
		console.log(`[CaretiJsonAdapter] 🔧 Using fallback tool section for mode: ${isChatbotMode ? "CHATBOT" : "AGENT"}`)

		let toolsContent = "# TOOL USAGE SYSTEM\n\n"

		if (isChatbotMode) {
			toolsContent += "**CURRENT MODE: CHATBOT** - Limited tool access for conversational assistance\n\n"
			toolsContent += "Available tools in CHATBOT mode:\n"
			toolsContent += "- read_file: Read and analyze file contents\n"
			toolsContent += "- list_files: List directory contents and explore file structures\n"
			toolsContent += "- search_files: Search for files and content across the workspace\n"
			toolsContent += "- ask_followup_question: Ask clarifying questions to better understand requirements\n"
			toolsContent += "- web_fetch: Fetch web content for research and information gathering\n"
			toolsContent += "- attempt_completion: Complete tasks when objectives are met\n\n"
			toolsContent +=
				"**RESTRICTED in CHATBOT mode:** File editing, command execution, browser automation are disabled for safety.\n\n"
			toolsContent += "Focus on understanding, analysis, and providing helpful guidance without making changes.\n"
		} else {
			toolsContent += "**CURRENT MODE: AGENT** - Full autonomous tool access\n\n"
			toolsContent += "Available tools in AGENT mode:\n"
			toolsContent += "- File Operations: read_file, write_to_file, replace_in_file\n"
			toolsContent += "- Directory Navigation: list_files, search_files, list_code_definition_names\n"
			toolsContent += "- Command Execution: execute_command (for terminal commands)\n"
			toolsContent += "- Web Research: web_fetch\n"
			toolsContent += "- Browser Automation: browser_action (for web interactions)\n"
			toolsContent += "- Communication: ask_followup_question, attempt_completion\n"
			toolsContent += "- MCP Tools: use_mcp_tool, access_mcp_resource\n\n"
			toolsContent += "Use tools autonomously to complete tasks efficiently and effectively.\n"
		}

		toolsContent += "\n**IMPORTANT:** Always verify tool availability before use and handle errors gracefully.\n"

		return toolsContent
	}
}
