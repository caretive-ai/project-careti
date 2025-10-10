// This script is for verification purposes to output the generated prompts.

// This script is for verification purposes to output the generated prompts.

// This script is for verification purposes to output the generated prompts.

// Mock the 'vscode' module only when it's required.
require.cache.vscode = {
	exports: {},
}

const path = require("path")
// Since this script runs from the root, we need to adjust the path to the compiled output.
// The PromptSystemManager and other necessary modules are bundled in dist/extension.js.
// We will require the main extension file and extract the necessary components.
// This is a workaround for running a script that depends on compiled TypeScript source.
const { PromptSystemManager, JsonTemplateLoader, CARET_MODES, ModelFamily } = require("../dist/extension")

async function getCaretPrompt() {
	const sectionsDirPath = path.resolve(__dirname, "../caret-src/core/prompts/sections")
	// The JsonTemplateLoader might be a singleton that needs initialization.
	// Let's ensure it's initialized before use.
	const loader = JsonTemplateLoader.getInstance()
	if (!loader.isInitialized) {
		await loader.initialize(sectionsDirPath)
	}

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
