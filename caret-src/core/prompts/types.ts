import { McpHub } from "../../../src/services/mcp/McpHub"
import { BrowserSettings } from "../../../src/shared/BrowserSettings"

/**
 * Context for system prompt generation
 */
export interface SystemPromptContext {
	cwd: string
	supportsBrowserUse: boolean
	mcpHub: McpHub
	browserSettings: BrowserSettings
	isClaude4ModelFamily?: boolean
}

/**
 * Metrics collected during system prompt generation
 */
export interface SystemPromptMetrics {
	generationTime: number
	promptLength: number
	toolCount: number
	mcpServerCount: number
	timestamp: number
	appliedTemplates?: string[] // names of applied JSON templates
	enhancementRatio?: number // enhanced/base prompt length ratio
}

/**
 * Result of system prompt generation
 */
export interface SystemPromptResult {
	prompt: string
	metrics: SystemPromptMetrics
}

/**
 * JSON Template metadata
 */
export interface PromptTemplateMetadata {
	name: string
	version: string
	description: string
	compatibleWith: string[]
	author?: string
	tags?: string[]
}

/**
 * Template section to add
 */
export interface TemplateSection {
	id: string
	title?: string
	content: string
	position: "before_tools" | "after_tools" | "before_objective" | "after_objective"
	priority?: number
}

/**
 * Section modification directive
 */
export interface SectionModification {
	target: string
	replacement: string
	preserveFormat?: boolean
}

/**
 * Complete prompt template structure
 */
export interface PromptTemplate {
	metadata: PromptTemplateMetadata
	add: {
		sections?: TemplateSection[]
		behaviors?: string[]
	}
	modify: {
		personality?: string
		targetSections?: SectionModification[]
	}
	// CARET MODIFICATION: Add tools property for dynamic tool definitions
	tools?: Record<string, any>
	// CARET MODIFICATION: Add mode-specific templates (for CHATBOT_AGENT_MODES.json)
	chatbot_mode?: any
	agent_mode?: any
}

/**
 * Template validation result
 */
export interface TemplateValidationResult {
	isValid: boolean
	errors: string[]
	warnings?: string[]
}

/**
 * Prompt overlay application result
 */
export interface OverlayResult {
	success: boolean
	prompt: string
	result?: string // Alias for prompt for compatibility
	appliedChanges: string[]
	warnings: string[]
	errors?: string[]
	metrics?: {
		processingTime: number
		originalLength: number
		finalLength: number
		sectionsAdded: number
		modificationsApplied: number
	}
}
