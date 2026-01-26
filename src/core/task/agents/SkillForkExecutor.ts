// CARETI MODIFICATION: Skill fork execution - Claude Code compatible context: fork support
// Executes skills in an isolated subagent context

import { execSync, spawn } from "child_process"
import type { CommandContent } from "@shared/commands"

/**
 * Maximum execution time for forked skill (5 minutes)
 */
const FORK_TIMEOUT_MS = 300000

/**
 * Configuration for skill fork execution
 */
export interface SkillForkConfig {
	/** Working directory for the subagent */
	cwd: string
	/** Optional agent type override (e.g., 'Explore', 'Plan') */
	agentType?: string
	/** The skill content to execute */
	skillContent: CommandContent
	/** User's original prompt/request */
	userPrompt: string
}

/**
 * Result from skill fork execution
 */
export interface SkillForkResult {
	/** Whether execution succeeded */
	success: boolean
	/** Output from the forked execution */
	output: string
	/** Error message if failed */
	error?: string
	/** Exit code from the process */
	exitCode?: number
}

/**
 * Executes a skill in a forked/isolated context.
 *
 * This creates a new Careti CLI instance that runs the skill
 * in isolation, preventing it from affecting the parent task's state.
 *
 * Use cases:
 * - Skills that need fresh context (no conversation history)
 * - Skills that should run autonomously without user interaction
 * - Skills that might fail and should not corrupt parent state
 *
 * @param config Fork execution configuration
 * @returns Result from the forked execution
 */
export async function executeSkillInFork(config: SkillForkConfig): Promise<SkillForkResult> {
	const { cwd, agentType, skillContent, userPrompt } = config

	// Build the prompt that includes skill instructions
	const fullPrompt = buildForkPrompt(skillContent, userPrompt, agentType)

	try {
		// Check if careti CLI is available
		const cliPath = findCaretiCli()
		if (!cliPath) {
			return {
				success: false,
				output: "",
				error: "Careti CLI not found. Fork execution requires the CLI to be installed.",
			}
		}

		// Execute the forked skill
		const result = await runForkProcess(cliPath, fullPrompt, cwd)
		return result
	} catch (error) {
		return {
			success: false,
			output: "",
			error: error instanceof Error ? error.message : String(error),
		}
	}
}

/**
 * Build the prompt for the forked execution
 */
function buildForkPrompt(skillContent: CommandContent, userPrompt: string, agentType?: string): string {
	let prompt = `You are executing the "${skillContent.name}" skill in an isolated context.

## Skill Instructions
${skillContent.instructions}

## User Request
${userPrompt}

## Execution Context
- This is a forked execution - you have a fresh context
- Complete the task following the skill instructions
- Return your results clearly`

	if (agentType) {
		prompt += `\n- Agent type: ${agentType}`
	}

	return prompt
}

/**
 * Find the Careti CLI executable
 */
function findCaretiCli(): string | null {
	try {
		// Try to find careti in PATH
		const result = execSync("which careti 2>/dev/null || where careti 2>nul", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim()

		if (result) {
			return result.split("\n")[0].trim()
		}
	} catch {
		// CLI not in PATH
	}

	// Fallback: try common locations
	const commonPaths = [
		"/usr/local/bin/careti",
		"/usr/bin/careti",
		`${process.env.HOME}/.local/bin/careti`,
		`${process.env.HOME}/.cargo/bin/careti`,
	]

	for (const path of commonPaths) {
		try {
			execSync(`test -x "${path}"`, { stdio: "pipe" })
			return path
		} catch {
			// Path not found or not executable
		}
	}

	return null
}

/**
 * Run the forked process and capture output
 */
function runForkProcess(cliPath: string, prompt: string, cwd: string): Promise<SkillForkResult> {
	return new Promise((resolve) => {
		const args = [
			// Subagent mode settings
			"-s",
			"yolo_mode_toggled=true",
			"-s",
			"max_consecutive_mistakes=6",
			"-F",
			"plain",
			"-y",
			"--oneshot",
			// The prompt (escaped for shell)
			JSON.stringify(prompt),
		]

		let stdout = ""
		let stderr = ""

		const proc = spawn(cliPath, args, {
			cwd,
			stdio: ["pipe", "pipe", "pipe"],
			timeout: FORK_TIMEOUT_MS,
			shell: true,
		})

		proc.stdout?.on("data", (data) => {
			stdout += data.toString()
		})

		proc.stderr?.on("data", (data) => {
			stderr += data.toString()
		})

		proc.on("close", (exitCode) => {
			if (exitCode === 0) {
				resolve({
					success: true,
					output: stdout.trim(),
					exitCode: 0,
				})
			} else {
				resolve({
					success: false,
					output: stdout.trim(),
					error: stderr.trim() || `Process exited with code ${exitCode}`,
					exitCode: exitCode ?? 1,
				})
			}
		})

		proc.on("error", (error) => {
			resolve({
				success: false,
				output: stdout.trim(),
				error: error.message,
			})
		})

		// Handle timeout
		setTimeout(() => {
			proc.kill("SIGTERM")
			resolve({
				success: false,
				output: stdout.trim(),
				error: `Fork execution timed out after ${FORK_TIMEOUT_MS / 1000} seconds`,
			})
		}, FORK_TIMEOUT_MS)
	})
}

/**
 * Check if a skill should be executed in fork mode
 */
export function shouldForkSkill(skillContent: CommandContent): boolean {
	return skillContent.context === "fork"
}
