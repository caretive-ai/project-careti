/**
 * Pattern to match simplified CLI syntax: cline "prompt" or careti "prompt" (or with single quotes)
 * with optional additional flags after the closing quote
 * CARETI MODIFICATION: Match both cline and careti command names
 */
const CLINE_COMMAND_PATTERN = /^(cline|careti)\s+(['"])(.+?)\2(\s+.*)?$/

/**
 * Detects if a command is a CLI subagent command.
 * CARETI MODIFICATION: Matches both cline and careti commands.
 *
 * Matches: cline "prompt" / cline 'prompt' / careti "prompt" / careti 'prompt'
 *
 * @param command - The command string to check
 * @returns True if the command is a subagent command, false otherwise
 */
export function isSubagentCommand(command: string): boolean {
	return CLINE_COMMAND_PATTERN.test(command)
}

/**
 * Transforms simplified CLI command syntax with subagent settings.
 * CARETI MODIFICATION: Supports both cline and careti, preserves original command name.
 *
 * Converts: careti "prompt" → careti "prompt" -s yolo_mode_toggled=true ... --oneshot
 *
 * @param command - The command string to potentially transform
 * @returns The transformed command if it matches the pattern, otherwise the original command
 */
export function transformClineCommand(command: string): string {
	if (!isSubagentCommand(command)) {
		return command
	}

	// Inject subagent-specific command structure and settings
	const commandWithSettings = injectSubagentSettings(command)

	return commandWithSettings
}

/**
 * Injects subagent flags into a CLI command that has already been validated by isSubagentCommand().
 * CARETI MODIFICATION: Preserves original CLI name (cline or careti).
 */
function injectSubagentSettings(command: string): string {
	const postPromptFlags = ["-s yolo_mode_toggled=true", "-s max_consecutive_mistakes=6", "-F plain", "-y", "--oneshot"]

	const match = command.match(CLINE_COMMAND_PATTERN)!
	const cliName = match[1] // "cline" or "careti"
	const quote = match[2]
	const prompt = match[3]
	const additionalFlags = match[4] || ""
	return `${cliName} ${quote}${prompt}${quote} ${postPromptFlags.join(" ")}${additionalFlags}`
}
