/**
 * CARET MODIFICATION: Centralized mode system registry
 * Replaces scattered CARET MODIFICATION branches throughout the codebase
 */

import { CLINE_MODES, ERROR_MESSAGES, RESTRICTED_TOOLS } from "@caret-src/shared/constants/ModeSystemConstants"

export interface ModeSystemAdapter {
	// Task-related methods
	getEnvironmentDetails(mode: string): string
	buildSystemPrompt(mode: string, context: any): Promise<string>

	// Tool-related methods
	getResponseToolName(mode: string): string
	handleToolResponse(toolName: string, params: any): Promise<any>

	// CARET MODIFICATION: Tool restriction methods for safety
	isToolRestricted(mode: string, toolName: string): boolean
	getToolRestrictionMessage(mode: string, toolName: string): string

	// Conversation policy methods
	allowsConversationWithoutTools(mode: string): boolean

	// UI-related methods
	getModeDisplayName(mode: string): string
	getToggleTarget(currentMode: string): string

	// State-related methods
	getDefaultMode(): string
	validateMode(mode: string): boolean
}

export class ClineModeAdapter implements ModeSystemAdapter {
	getEnvironmentDetails(mode: string): string {
		if (mode === "plan") {
			return "\nPLAN MODE\n(plan mode instructions)"
		} else {
			return "\nACT MODE"
		}
	}

	async buildSystemPrompt(mode: string, context: any): Promise<string> {
		// CARET MODIFICATION: Adapted to v3.26.6 buildSystemPrompt signature (7 parameters)
		const { buildSystemPrompt } = await import("../../../src/core/prompts/system-prompt/build-system-prompt")
		return buildSystemPrompt(
			context.cwd,
			context.supportsBrowserUse,
			context.mcpHub,
			context.browserSettings,
			context.apiConfiguration,
			context.focusChainSettings,
			context.providerInfo,
		)
	}

	getResponseToolName(mode: string): string {
		return mode === "plan" ? "plan_mode_respond" : "attempt_completion"
	}

	handleToolResponse(toolName: string, params: any): Promise<any> {
		// Delegate to existing Cline tool handlers
		return Promise.resolve(params)
	}

	getModeDisplayName(mode: string): string {
		return mode === "plan" ? "Plan" : "Act"
	}

	getToggleTarget(currentMode: string): string {
		return currentMode === "plan" ? "act" : "plan"
	}

	getDefaultMode(): string {
		return "plan"
	}

	validateMode(mode: string): boolean {
		return ["plan", "act"].includes(mode)
	}

	allowsConversationWithoutTools(mode: string): boolean {
		// Cline 기본 동작: 모든 모드에서 도구 사용 필요 (기존 동작 유지)
		return false
	}

	// CARET MODIFICATION: Tool restriction methods - preserve existing Cline behavior
	isToolRestricted(mode: string, toolName: string): boolean {
		// Cline uses its own isPlanModeToolRestricted logic in ToolExecutor
		// This adapter defers to existing Cline implementation
		return false
	}

	getToolRestrictionMessage(mode: string, toolName: string): string {
		return `Tool '${toolName}' is not available in ${mode.toUpperCase()} MODE.`
	}
}

export class CaretModeAdapter implements ModeSystemAdapter {
	getEnvironmentDetails(mode: string): string {
		if (mode === "plan") {
			return "\nCHATBOT MODE\nExpert consultation and guidance mode - focus on analysis without making changes"
		} else {
			return "\nAGENT MODE\nCollaborative development mode - combine analysis with execution and implementation"
		}
	}

	async buildSystemPrompt(mode: string, context: any): Promise<string> {
		try {
			// CARET MODIFICATION: Phase 9.3 - Include tool information for 100% Cline feature parity
			console.log("[CaretModeAdapter] Building system prompt with tool integration")

			// Use Caret JSON system prompt system
			const { JsonSectionAssembler } = await import("../prompts/JsonSectionAssembler")
			const { JsonTemplateLoader } = await import("../prompts/JsonTemplateLoader")

			const templateLoader = new JsonTemplateLoader(context.extensionPath || process.cwd())
			const assembler = new JsonSectionAssembler(templateLoader)

			const caretMode = mode === "plan" ? "chatbot" : "agent"

			// CARET MODIFICATION: Load base sections for the specific Caret mode
			const sections = await assembler.loadBaseSections(caretMode)
			const basePrompt = assembler.assembleFinalPrompt(sections)

			return basePrompt
		} catch (error) {
			console.error("Failed to build Caret system prompt, falling back to basic prompt:", error)

			// CARET MODIFICATION: Enhanced fallback with tool information
			const toolInfo = context.supportsBrowserUse
				? "\n\nAvailable tools: browser_action, file operations, terminal commands"
				: ""

			return mode === "plan"
				? `You are Caret, an AI assistant in chatbot mode. Focus on analysis and consultation.${toolInfo}`
				: `You are Caret, an AI assistant in agent mode. Collaborate on implementation and development.${toolInfo}`
		}
	}

	getResponseToolName(mode: string): string {
		// Chatbot mode (plan) uses conversational tool, Agent mode (act) uses completion tool
		return mode === "plan" ? "chatbot_mode_respond" : "attempt_completion"
	}

	handleToolResponse(toolName: string, params: any): Promise<any> {
		// Handle Caret-specific tool responses
		return Promise.resolve(params)
	}

	getModeDisplayName(mode: string): string {
		return mode === "plan" ? "Chatbot" : "Agent"
	}

	getToggleTarget(currentMode: string): string {
		return currentMode === "plan" ? "act" : "plan"
	}

	getDefaultMode(): string {
		return "act" // Agent mode as default
	}

	validateMode(mode: string): boolean {
		return ["plan", "act"].includes(mode) // Internal representation uses plan/act
	}

	allowsConversationWithoutTools(mode: string): boolean {
		// Caret의 새로운 동작: 둘 다 대화 허용하지만 목적이 다름
		if (mode === "act") {
			// Agent 모드: 협력적 개발 파트너로서 자유로운 대화 허용
			return true
		} else {
			// Chatbot 모드: 상담 및 분석 모드에서도 대화 허용
			// (new_task 등 필요한 관리 도구는 여전히 사용 가능)
			return true
		}
	}

	// CARET MODIFICATION: Tool restriction implementation for safety
	isToolRestricted(mode: string, toolName: string): boolean {
		if (mode === CLINE_MODES.PLAN) {
			// Chatbot mode (plan = chatbot internally)
			// Chatbot mode is read-only and cannot perform dangerous operations
			return RESTRICTED_TOOLS.CHATBOT_BLOCKED.includes(toolName as any)
		}
		// Agent mode (act) allows all tools
		return false
	}

	getToolRestrictionMessage(mode: string, toolName: string): string {
		if (mode === CLINE_MODES.PLAN) {
			return ERROR_MESSAGES.CHATBOT_TOOL_RESTRICTED
		}
		return ERROR_MESSAGES.GENERIC_TOOL_RESTRICTED(toolName, mode)
	}

	/**
	 * CARET MODIFICATION: Forward Compatibility System
	 * Automatically classify new Cline modes into Caret Chatbot/Agent categories
	 */
	classifyNewMode(mode: string, capabilities: string[] = []): string {
		// Chatbot indicators: read-only, analysis, planning capabilities
		const chatbotIndicators = ["read", "analysis", "planning", "strategy", "review", "feedback"]

		// Check if any capability matches chatbot patterns
		const isChatbotMode = capabilities.some((cap) =>
			chatbotIndicators.some((indicator) => cap.toLowerCase().includes(indicator.toLowerCase())),
		)

		if (isChatbotMode) {
			return "chatbot"
		}

		// Default to Agent mode for execution, modification, or unknown capabilities
		return "agent"
	}

	/**
	 * CARET MODIFICATION: Auto-detect mode system based on context
	 * Enables zero-maintenance system switching
	 */
	detectModeSystem(context: any): string {
		// Detect Caret system indicators
		if (context.hasJsonPrompts || context.hasCaretFeatures) {
			return "caret"
		}

		// Default to Cline system for backward compatibility
		return "cline"
	}
}

export class ModeSystemRegistry {
	private static instance: ModeSystemRegistry
	private adapters = new Map<string, ModeSystemAdapter>()

	private constructor() {
		// Register default adapters
		this.adapters.set("cline", new ClineModeAdapter())
		this.adapters.set("caret", new CaretModeAdapter())
	}

	static getInstance(): ModeSystemRegistry {
		if (!ModeSystemRegistry.instance) {
			ModeSystemRegistry.instance = new ModeSystemRegistry()
		}
		return ModeSystemRegistry.instance
	}

	getAdapter(modeSystem: string): ModeSystemAdapter {
		const adapter = this.adapters.get(modeSystem)
		if (!adapter) {
			console.warn(`Unknown mode system: ${modeSystem}, falling back to cline`)
			return this.adapters.get("cline")!
		}
		return adapter
	}

	// Convenience methods for common operations
	getEnvironmentDetails(modeSystem: string, mode: string): string {
		return this.getAdapter(modeSystem).getEnvironmentDetails(mode)
	}

	async buildSystemPrompt(modeSystem: string, mode: string, context: any): Promise<string> {
		return this.getAdapter(modeSystem).buildSystemPrompt(mode, context)
	}

	getResponseToolName(modeSystem: string, mode: string): string {
		return this.getAdapter(modeSystem).getResponseToolName(mode)
	}

	getModeDisplayName(modeSystem: string, mode: string): string {
		return this.getAdapter(modeSystem).getModeDisplayName(mode)
	}

	getToggleTarget(modeSystem: string, currentMode: string): string {
		return this.getAdapter(modeSystem).getToggleTarget(currentMode)
	}

	getDefaultMode(modeSystem: string): string {
		return this.getAdapter(modeSystem).getDefaultMode()
	}

	allowsConversationWithoutTools(modeSystem: string, mode: string): boolean {
		return this.getAdapter(modeSystem).allowsConversationWithoutTools(mode)
	}

	// CARET MODIFICATION: Tool restriction delegation methods
	isToolRestricted(modeSystem: string, mode: string, toolName: string): boolean {
		return this.getAdapter(modeSystem).isToolRestricted(mode, toolName)
	}

	getToolRestrictionMessage(modeSystem: string, mode: string, toolName: string): string {
		return this.getAdapter(modeSystem).getToolRestrictionMessage(mode, toolName)
	}
}

export const modeRegistry = ModeSystemRegistry.getInstance()
