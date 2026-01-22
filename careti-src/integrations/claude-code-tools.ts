import { CaretiGlobalManager } from "@careti/managers/CaretiGlobalManager"

/**
 * Get disallowed tools for Claude Code CLI based on Careti mode
 *
 * @description
 * - Careti mode: Task tool enabled for F12 subagent support
 * - Cline mode: All tools disabled except basic ones
 *
 * Essential tools enabled for subagent functionality:
 * - Bash: Command execution
 * - Read: File reading
 * - Write: File creation
 * - Edit: File editing
 *
 * @returns Comma-separated string of disallowed tool names
 */
export function getClaudeCodeDisallowedTools(): string {
	const isCaretMode = CaretiGlobalManager.currentMode === "careti"

	const disallowedTools = [
		// Task tool only available in Careti mode for subagent support (F12)
		...(isCaretMode ? [] : ["Task"]),
		// Essential tools enabled for subagent: Bash, Read, Write, Edit
		// Other tools remain disabled to prevent conflicts with Careti's custom tool format
		"Glob",
		"Grep",
		"LS",
		"exit_plan_mode",
		"MultiEdit",
		"NotebookRead",
		"NotebookEdit",
		"WebFetch",
		"TodoRead",
		"TodoWrite",
		"WebSearch",
	]

	return disallowedTools.join(",")
}
