import { McpHub } from "@services/mcp/McpHub"
import { BrowserSettings } from "@shared/BrowserSettings"
import { ApiHandlerModel } from "@/api"
import { FocusChainSettings } from "@shared/FocusChainSettings"
import { SYSTEM_PROMPT_GENERIC } from "./generic-system-prompt"
import { SYSTEM_PROMPT_NEXT_GEN } from "./families/next-gen-models/next-gen-system-prompt"
import { isNextGenModelFamily } from "./utils"
// CARET MODIFICATION: Import Caret system prompt generator
import { CaretSystemPrompt, CaretPromptConfig } from "../../../../caret-src/core/prompts/CaretSystemPrompt"
import { Mode } from "@shared/storage/types"
import { modeRegistry } from "../../../../caret-src/core/mode-system/ModeSystemRegistry"

export const buildSystemPrompt = async (
	cwd: string,
	supportsBrowserUse: boolean,
	mcpHub: McpHub,
	browserSettings: BrowserSettings,
	apiHandlerModel: ApiHandlerModel,
	focusChainSettings: FocusChainSettings,
	// CARET MODIFICATION: Add optional parameters for Caret system
	modeSystem?: string,
	mode?: Mode,
	extensionPath?: string,
) => {
	const context = {
		extensionPath: extensionPath || __dirname + "/../../..",
		currentWorkingDirectory: cwd,
		supportsBrowserUse,
		browserSettings,
		mcpHub,
		isClaude4ModelFamily: isNextGenModelFamily(apiHandlerModel),
	}

	if (modeSystem && mode) {
		try {
			return await modeRegistry.buildSystemPrompt(modeSystem, mode, context)
		} catch (error) {
			console.warn(`[MODE-SYSTEM] Failed to build system prompt for ${modeSystem}/${mode}, falling back to default:`, error)
		}
	}

	// Original Cline system prompt generation
	// New prompts per family can be added as granularly as we like by adding a folder in the "families" folder
	// We then discriminate between families with a functions in the utils.
	if (isNextGenModelFamily(apiHandlerModel)) {
		return SYSTEM_PROMPT_NEXT_GEN(cwd, supportsBrowserUse, mcpHub, browserSettings, focusChainSettings)
	} else {
		return SYSTEM_PROMPT_GENERIC(cwd, supportsBrowserUse, mcpHub, browserSettings, focusChainSettings)
	}
}
