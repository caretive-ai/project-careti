// CARETI MODIFICATION: Commands system - on-demand agent instructions prompt component
// Claude Code/OpenCode style unified commands with auto-invocation support

import type { CommandMetadata } from "@shared/commands"
import type { PromptVariant, SystemPromptContext } from "../types"

/**
 * Format a single command entry for the prompt
 */
function formatCommandEntry(cmd: CommandMetadata): string {
	let line = `  - "/${cmd.name}": ${cmd.description}`
	if (cmd.argumentHint) {
		line += ` ${cmd.argumentHint}`
	}
	return line
}

/**
 * Generate the commands section for the system prompt.
 * Displays available commands (formerly skills) to the AI.
 * CARETI MODIFICATION: Separates model-invocable and user-only commands
 */
export async function getCommandsSection(_variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	// Use commands (new) or skills (legacy) - both use the same context field
	const commands = context.skills // Note: context field name kept for compatibility
	if (!commands || commands.length === 0) return undefined

	// CARETI MODIFICATION: Filter commands by userInvocable (default true)
	const visibleCommands = commands.filter((cmd) => cmd.userInvocable !== false)
	if (visibleCommands.length === 0) return undefined

	// CARETI MODIFICATION: Separate model-invocable and user-only commands
	const modelInvocable = visibleCommands.filter((cmd) => !cmd.disableModelInvocation)
	const userOnly = visibleCommands.filter((cmd) => cmd.disableModelInvocation === true)

	let result = `COMMANDS

The following commands provide specialized instructions for specific tasks.`

	// Model-invocable commands: AI can auto-invoke when request matches
	if (modelInvocable.length > 0) {
		const modelInvocableList = modelInvocable.map(formatCommandEntry).join("\n")
		result += `

Available commands (you may auto-invoke when the user's request matches):
${modelInvocableList}

When a user's request clearly matches a command's description, automatically invoke that command using the use_skill tool. You don't need to ask for confirmation.`
	}

	// User-only commands: require explicit /command invocation
	if (userOnly.length > 0) {
		const userOnlyList = userOnly.map(formatCommandEntry).join("\n")
		result += `

User-only commands (require explicit /<command-name> invocation):
${userOnlyList}

These commands must be explicitly invoked by the user typing /<command-name>. Do NOT auto-invoke these commands.`
	}

	result += `

To use a command:
1. For auto-invocable commands: Match the user's request to a command, or when user types /<command-name>
2. Call use_skill with the skill_name parameter set to the exact command name (without the / prefix)
3. Follow the instructions returned by the tool`

	return result
}

// Legacy alias
/** @deprecated Use getCommandsSection instead */
export const getSkillsSection = getCommandsSection
