/**
 * Cross-validation tests for cline-latest vs Caret JSON components
 * Following TDD approach: Write failing tests first, then implement to make them pass
 */

import * as fs from "fs"
import * as path from "path"
import { describe, expect, test } from "vitest"
import { JsonTemplateLoader } from "../core/prompts/system/JsonTemplateLoader"
import { PromptSystemManager } from "../core/prompts/system/PromptSystemManager"
import { CARET_MODES } from "../shared/constants/PromptSystemConstants"

describe("Prompt Generation Verification", () => {
	test("Generate and compare Caret and cline prompts", async () => {
		// --- Caret Prompt Generation ---
		const sectionsDirPath = path.resolve(__dirname, "../core/prompts/sections")
		const loader = JsonTemplateLoader.getInstance()
		// Assuming getInstance initializes if not already done. Let's initialize it just in case.
		await loader.initialize(sectionsDirPath)

		const manager = new PromptSystemManager()
		const caretContext: any = {
			modeSystem: "caret" as const,
			mode: CARET_MODES.AGENT,
			auto_todo: true,
			providerInfo: { providerId: "test", model: { id: "test", info: { supportsPromptCache: false } } },
		}
		const caretPrompt = await manager.getPrompt(caretContext)
		console.log("--- START CARETT PROMPT ---")
		console.log(caretPrompt)
		console.log("--- END CARETT PROMPT ---")

		// --- cline Prompt Generation ---
		const clineContext: any = {
			modeSystem: "cline" as const,
			mode: CARET_MODES.AGENT,
			providerInfo: {
				providerId: "anthropic",
				model: { id: "claude-3-opus-20240229", info: { supportsPromptCache: true, maxTokens: 4096 } },
			},
			cwd: "/mock/cwd",
		}
		const clinePrompt = await manager.getPrompt(clineContext)
		console.log("\n\n--- START CLINE PROMPT ---")
		console.log(clinePrompt)
		console.log("--- END CLINE PROMPT ---")

		// Write to file for easy comparison
		const outputPath = path.resolve(__dirname, "prompt-comparison.txt")
		const outputContent = `--- CARETT PROMPT ---\n${caretPrompt}\n\n--- CLINE PROMPT ---\n${clinePrompt}`
		fs.writeFileSync(outputPath, outputContent)
		console.log(`\nComparison file written to: ${outputPath}`)

		expect(caretPrompt).toBeDefined()
		expect(clinePrompt).toBeDefined()
	})
})
