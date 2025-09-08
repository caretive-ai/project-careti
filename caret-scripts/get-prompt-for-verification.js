// This script is for verification purposes to output the generated prompts.
const path = require("path")
const { PromptSystemManager } = require("../caret-src/core/prompts/system/PromptSystemManager")
const { JsonTemplateLoader } = require("../caret-src/core/prompts/system/JsonTemplateLoader")
const { CARET_MODES } = require("../caret-src/shared/constants/PromptSystemConstants")
const { ModelFamily } = require("../src/shared/prompts")

async function getCaretPrompt() {
	const sectionsDirPath = path.resolve(__dirname, "../caret-src/core/prompts/sections")
	await JsonTemplateLoader.getInstance().initialize(sectionsDirPath)

	const manager = new PromptSystemManager()
	const context = {
		modeSystem: "caret",
		mode: CARET_MODES.AGENT,
		auto_todo: true,
		providerInfo: { providerId: "test", model: { id: "test", info: { supportsPromptCache: false } } },
	}

	const prompt = await manager.getPrompt(context)
	console.log("--- START CARETT PROMPT ---")
	console.log(prompt)
	console.log("--- END CARETT PROMPT ---")
}

async function getClinePrompt() {
	const manager = new PromptSystemManager()
	const context = {
		modeSystem: "cline",
		mode: CARET_MODES.AGENT,
		providerInfo: {
			providerId: "anthropic",
			model: { id: "claude-3-opus-20240229", info: { supportsPromptCache: true, maxTokens: 4096 } },
		},
		cwd: "/mock/cwd",
	}

	const prompt = await manager.getPrompt(context)
	console.log("--- START CLINE PROMPT ---")
	console.log(prompt)
	console.log("--- END CLINE PROMPT ---")
}

async function main() {
	await getCaretPrompt()
	console.log("\n\n")
	await getClinePrompt()
}

main()
