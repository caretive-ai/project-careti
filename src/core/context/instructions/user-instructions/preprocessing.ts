// CARETI MODIFICATION: Skill content preprocessing - Claude Code compatible !`command` syntax
// Executes shell commands embedded in skill content and replaces with output

import { execSync } from "child_process"

/**
 * Maximum execution time for preprocessing commands (5 seconds)
 */
const PREPROCESS_TIMEOUT_MS = 5000

/**
 * Maximum output size to include in replacement (to prevent prompt overflow)
 */
const MAX_OUTPUT_SIZE = 10000

/**
 * Preprocess skill content by executing embedded shell commands.
 * Replaces !`command` patterns with their execution output.
 *
 * Example:
 *   Input:  "Current branch: !`git branch --show-current`"
 *   Output: "Current branch: main"
 *
 * Security considerations:
 * - Commands run with the same permissions as the extension
 * - Output is truncated to prevent prompt overflow
 * - Errors are captured and included in the replacement
 *
 * @param content The skill content containing !`command` patterns
 * @param cwd The working directory for command execution
 * @returns The processed content with command outputs substituted
 */
export async function preprocessShellCommands(content: string, cwd: string): Promise<string> {
	// Pattern matches !`command` - backticks must not be escaped
	// Using non-greedy match to handle nested backticks correctly
	const pattern = /!\`([^`]+)\`/g

	let result = content
	let match: RegExpExecArray | null

	// Reset regex state
	pattern.lastIndex = 0

	// Collect all matches first to avoid issues with replacement affecting indices
	const matches: Array<{ fullMatch: string; command: string }> = []
	while ((match = pattern.exec(content)) !== null) {
		matches.push({
			fullMatch: match[0],
			command: match[1],
		})
	}

	// Process each match
	for (const { fullMatch, command } of matches) {
		let output: string

		try {
			// Execute command synchronously with timeout
			const rawOutput = execSync(command, {
				cwd,
				timeout: PREPROCESS_TIMEOUT_MS,
				encoding: "utf-8",
				stdio: ["pipe", "pipe", "pipe"],
				// Inherit shell environment
				shell: process.platform === "win32" ? "cmd.exe" : "/bin/bash",
			})

			output = rawOutput.trim()

			// Truncate if too large
			if (output.length > MAX_OUTPUT_SIZE) {
				output = output.slice(0, MAX_OUTPUT_SIZE) + "\n[... output truncated ...]"
			}
		} catch (error) {
			// Include error message in output for debugging
			const errorMessage = error instanceof Error ? error.message : String(error)
			output = `[Error executing "${command}": ${errorMessage}]`
		}

		// Replace the matched pattern with output
		result = result.replace(fullMatch, output)
	}

	return result
}

/**
 * Check if content contains any preprocessing directives
 */
export function hasPreprocessingDirectives(content: string): boolean {
	return /!\`[^`]+\`/.test(content)
}
