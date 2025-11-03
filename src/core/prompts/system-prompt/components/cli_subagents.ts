import { Logger } from "@services/logging/Logger"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

// CARET MODIFICATION: Adapted from Cline v3.34.0 CLI Subagents
const getCliSubagentsTemplateText = (_context: SystemPromptContext) => `USING THE CARET CLI TOOL

The Caret CLI tool can be used to assign Caret AI agents with focused tasks. This can be used to keep you focused by delegating information-gathering and exploration to separate Caret instances. Use the Caret CLI tool to research large codebases, explore file structures, gather information from multiple files, analyze dependencies, or summarize code sections when the complete context may be too large or overwhelming.

## Creating Caret AI agents

Caret AI agents may be referred to as agents, subagents, or subtasks. Requests may not specifically invoke agents, but you may invoke them directly if warranted. Unless you are specifically asked to use this tool, only create agents when it seems likely you may be exploring across 10 or more files. If users specifically ask that you use this tool, you then must use this tool. Do not use subagents for editing code or executing commands- they should only be used for reading and research to help you better answer questions or build useful context for future coding tasks. If you are performing a search via search_files or the terminal (grep etc.), and the results are long and overwhleming, it is reccomended that you switch to use Caret CLI agents to perform this task. You may perform code edits directly using the write_to_file and replace_in_file tools, and commands using the execute_command tool.

## Command Syntax

You must use the following command syntax for creating Caret AI agents:

\`\`\`bash
caret "your prompt here"
\`\`\`

## Examples of how you might use this tool

\`\`\`bash
# Find specific patterns
caret "find all React components that use the useState hook and list their names"

# Analyze code structure
caret "analyze the authentication flow. Reverse trace through all relevant functions and methods, and provide a summary of how it works. Include file/class references in your summary."

# Gather targeted information
caret "list all API endpoints and their HTTP methods"

# Summarize directories
caret "summarize the purpose of all files in the src/services directory"

# Research implementations
caret "find how error handling is implemented across the application"
\`\`\`

## Tips
- Request brief, technically dense summaries over full file dumps.
- Be specific with your instructions to get focused results.
- Request summaries rather than full file contents. Encourage the agent to be brief, but specific and technically dense with their response.
- If files you want to read are large or complicated, use Caret CLI agents for exploration before instead of reading these files.`

export async function getCliSubagentsSection(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	Logger.debug(`[CLI_SUBAGENTS] 🚀 Function called`)
	Logger.debug(`[CLI_SUBAGENTS] 📊 isCliSubagent=${context.isCliSubagent}`)
	Logger.debug(`[CLI_SUBAGENTS] 📊 isSubagentsEnabledAndCliInstalled=${context.isSubagentsEnabledAndCliInstalled}`)

	// If this is a CLI subagent, don't include CLI subagent instructions to prevent nesting/allignment concerns
	if (context.isCliSubagent) {
		Logger.debug(`[CLI_SUBAGENTS] ❌ Skipping: This is a CLI subagent (nested prevention)`)
		return undefined
	}

	// Only include this section if CLI is installed and subagents are enabled
	if (!context.isSubagentsEnabledAndCliInstalled) {
		Logger.debug(`[CLI_SUBAGENTS] ❌ Skipping: CLI not installed or subagents disabled`)
		return undefined
	}

	const template = variant.componentOverrides?.[SystemPromptSection.CLI_SUBAGENTS]?.template || getCliSubagentsTemplateText

	const result = new TemplateEngine().resolve(template, context, {})
	Logger.debug(`[CLI_SUBAGENTS] ✅ Section generated: ${result.length} chars`)
	return result
}
