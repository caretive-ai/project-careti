// CARETI MODIFICATION: Commands system - on-demand agent instructions prompt component
// Claude Code/OpenCode style unified commands

import type { PromptVariant, SystemPromptContext } from "../types"

/**
 * Generate the commands section for the system prompt.
 * Displays available commands (formerly skills) to the AI.
 */
export async function getCommandsSection(_variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	// Use commands (new) or skills (legacy) - both use the same context field
	const commands = context.skills // Note: context field name kept for compatibility
	if (!commands || commands.length === 0) return undefined

	const commandsList = commands
		.map((cmd) => {
			let line = `  - "/${cmd.name}": ${cmd.description}`
			if (cmd.argumentHint) {
				line += ` ${cmd.argumentHint}`
			}
			return line
		})
		.join("\n")

	return `COMMANDS

The following commands provide specialized instructions for specific tasks. When a user's request matches a command description or they explicitly invoke a command with /<command-name>, use the use_skill tool to load and activate the command.

Available commands:
${commandsList}

To use a command:
1. Match the user's request to a command based on its description, or when user types /<command-name>
2. Call use_skill with the skill_name parameter set to the exact command name (without the / prefix)
3. Follow the instructions returned by the tool`
}

// Legacy alias
/** @deprecated Use getCommandsSection instead */
export const getSkillsSection = getCommandsSection
