// CARET MODIFICATION: JSON Template Loader for 003-03 overlay system
// Purpose: Load and validate JSON templates for prompt customization
// Following existing Controller pattern for consistency

import { promises as fs } from "fs"
import * as path from "path"
// import { console } from "../../utils/caret-logger" // CARET MODIFICATION: Removed to prevent circular imports
import { PromptTemplate } from "./types"

/**
 * JSON Template Loader
 *
 * Loads and validates JSON templates for prompt overlay system.
 * Based on existing Controller pattern for JSON loading.
 *
 * Design Principles:
 * - Reuse existing patterns from Controller
 * - Safety first: Strict validation prevents invalid templates
 * - Performance: Template caching reduces file I/O
 * - Simplicity: Clean API for template loading
 */
export class JsonTemplateLoader {
	private templateCache: Map<string, PromptTemplate>
	private templateDir: string
	private isTestEnvironment: boolean

	constructor(extensionPath: string, useTestTemplates: boolean = false) {
		this.templateCache = new Map()
		this.isTestEnvironment = useTestTemplates

		// CARET MODIFICATION: Use test-templates directory for tests
		if (useTestTemplates) {
			this.templateDir = path.join(extensionPath, "caret-assets", "test-templates")
			console.log(`[JsonTemplateLoader] Initialized with TEST template directory: ${this.templateDir}`)
		} else {
			// CARET MODIFICATION: Use sections directory for system prompt JSON files
			this.templateDir = path.join(extensionPath, "caret-src", "core", "prompts", "sections")
			console.log(`[JsonTemplateLoader] Initialized with sections directory: ${this.templateDir}`, "JSON_LOADER")
		}
	}

	/**
	 * Load a JSON template by name
	 * Following Controller pattern for JSON loading exactly
	 *
	 * @param templateName Name of the template (without .json extension)
	 * @returns Promise<PromptTemplate> Validated template
	 * @throws Error if template not found or invalid
	 */
	async loadTemplate(templateName: string): Promise<PromptTemplate> {
		// Check cache first (performance optimization)
		if (this.templateCache.has(templateName)) {
			console.log(`[JsonTemplateLoader] Using cached template: ${templateName}`, "JSON_LOADER")
			return this.templateCache.get(templateName)!
		}

		try {
			console.log(`[JsonTemplateLoader] Loading template: ${templateName}`, "JSON_LOADER")

			// Simple file loading
			const templatePath = path.join(this.templateDir, `${templateName}.json`)
			const templateContent = await fs.readFile(templatePath, "utf-8")
			const rawTemplate = JSON.parse(templateContent)

			// CARET MODIFICATION: Simplified conversion - just wrap in basic PromptTemplate structure
			let template: PromptTemplate
			if (rawTemplate.metadata && rawTemplate.add) {
				// Already in PromptTemplate format
				template = rawTemplate as PromptTemplate
			} else {
				// Legacy format - simple conversion
				template = this.simpleConvert(rawTemplate, templateName)
			}

			// Cache the template (skip complex validation)
			this.templateCache.set(templateName, template)

			const sections = template.add?.sections?.length ?? 0
			console.log(`[JsonTemplateLoader] Template loaded: ${templateName} (${sections} sections)`, "JSON_LOADER")

			return template
		} catch (error) {
			console.log(`[JsonTemplateLoader] Failed to load template: ${templateName} - ${error}`, "JSON_LOADER")
			throw new Error(`Failed to load template ${templateName}: ${error}`)
		}
	}

	/**
	 * Simple conversion from legacy JSON to PromptTemplate format
	 * Replaces complex adaptLegacyFormat with minimal conversion logic
	 */
	private simpleConvert(content: any, templateName: string): PromptTemplate {
		console.log(`[JsonTemplateLoader] Simple conversion for template: ${templateName}`, "JSON_LOADER")

		// Basic metadata
		const metadata = {
			name: templateName,
			version: "1.0.0",
			description: content.title || `Template: ${templateName}`,
			compatibleWith: ["caret-1.0"],
			author: "Caret Team",
			tags: ["converted"],
		}

		// Simple conversion: just wrap the JSON content as-is
		const sections: any[] = []

		if (templateName === "COLLABORATIVE_PRINCIPLES") {
			// Handle COLLABORATIVE_PRINCIPLES specifically
			const principleKeys = [
				"core_mindset",
				"analysis_approach",
				"efficiency_patterns",
				"developer_colleague",
				"continuous_improvement",
			]

			for (const key of principleKeys) {
				if (content[key]) {
					const principle = content[key]
					const principleContent = [
						`**${principle.principle}**`,
						principle.description,
						principle.behaviors
							? `**Behaviors:**\n${principle.behaviors.map((b: string) => `• ${b}`).join("\n")}`
							: "",
						principle.practices
							? `**Practices:**\n${principle.practices.map((p: string) => `• ${p}`).join("\n")}`
							: "",
						principle.strategies
							? `**Strategies:**\n${principle.strategies.map((s: string) => `• ${s}`).join("\n")}`
							: "",
						principle.contributions
							? `**Contributions:**\n${principle.contributions.map((c: string) => `• ${c}`).join("\n")}`
							: "",
						principle.guidelines
							? `**Guidelines:**\n${principle.guidelines.map((g: string) => `• ${g}`).join("\n")}`
							: "",
					]
						.filter(Boolean)
						.join("\n")

					sections.push({
						id: key,
						title: principle.principle,
						content: principleContent,
						position: "before_tools",
						priority: 10,
					})
				}
			}
		} else {
			// Generic conversion: create one section with the entire content
			sections.push({
				id: templateName.toLowerCase(),
				title: content.title || templateName,
				content: JSON.stringify(content, null, 2),
				position: "before_tools",
				priority: 10,
			})
		}

		console.log(`[JsonTemplateLoader] Created ${sections.length} sections: ${templateName}`, "JSON_LOADER")

		return {
			metadata,
			add: {
				sections,
				behaviors: [],
			},
			modify: {},
		}
	}

	/**
	 * Clear template cache
	 * Useful for testing or when templates are updated
	 */
	clearCache(): void {
		const cacheSize = this.templateCache.size
		this.templateCache.clear()
		console.log(`[JsonTemplateLoader] Template cache cleared: ${cacheSize} templates removed`, "JSON_LOADER")
	}

	/**
	 * Get list of cached template names
	 *
	 * @returns string[] Array of cached template names
	 */
	getCachedTemplates(): string[] {
		return Array.from(this.templateCache.keys())
	}

	/**
	 * Get template directory path
	 *
	 * @returns string Template directory path
	 */
	getTemplateDirectory(): string {
		return this.templateDir
	}

	/**
	 * Check if template exists in cache
	 *
	 * @param templateName Name of template
	 * @returns boolean True if template is cached
	 */
	isTemplateCached(templateName: string): boolean {
		return this.templateCache.has(templateName)
	}

	/**
	 * Preload multiple templates into cache
	 *
	 * @param templateNames Array of template names to preload
	 * @returns Promise<string[]> Array of successfully loaded template names
	 */
	async preloadTemplates(templateNames: string[]): Promise<string[]> {
		const loaded: string[] = []

		for (const templateName of templateNames) {
			try {
				await this.loadTemplate(templateName)
				loaded.push(templateName)
			} catch (error) {
				console.log(`[JsonTemplateLoader] Failed to preload template: ${templateName} - ${error}`, "JSON_LOADER")
			}
		}

		console.log(
			`[JsonTemplateLoader] Templates preloaded: ${loaded.length}/${templateNames.length} successful (${loaded.join(", ")})`,
			"JSON_LOADER",
		)

		return loaded
	}
}
