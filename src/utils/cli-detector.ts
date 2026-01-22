import { exec } from "child_process"
import fs from "fs"
import os from "os"
import path from "path"
import { promisify } from "util"

const execAsync = promisify(exec)

function getCandidatePaths(binaryName: string): string[] {
	const homeDir = os.homedir()
	const candidates: string[] = [path.join("/usr/local/bin", binaryName), path.join(homeDir, ".local/bin", binaryName)]

	const nvmRoots = [path.join(homeDir, ".nvm/versions/node"), path.join(homeDir, ".config/nvm/versions/node")]
	for (const root of nvmRoots) {
		if (!fs.existsSync(root)) continue
		try {
			for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
				if (entry.isDirectory()) {
					candidates.push(path.join(root, entry.name, "bin", binaryName))
				}
			}
		} catch {
			// ignore fs errors
		}
	}

	return candidates
}

async function tryExecVersion(command: string): Promise<boolean> {
	try {
		const { stdout } = await execAsync(command, { timeout: 5000 })
		return stdout.toLowerCase().includes("version")
	} catch {
		return false
	}
}

async function checkCliInstalled(primaryCommand: string, binaryName: string): Promise<boolean> {
	if (await tryExecVersion(`${primaryCommand} version`)) {
		return true
	}

	for (const candidate of getCandidatePaths(binaryName)) {
		try {
			if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
				if (await tryExecVersion(`"${candidate}" version`)) {
					return true
				}
			}
		} catch {
			// ignore and continue
		}
	}

	return false
}

/**
 * Parameters used to detect CLI subagent context
 */
interface CliSubagentDetectionParams {
	yoloModeToggled: boolean
	maxConsecutiveMistakes: number
	isOneshot?: boolean
	outputFormat?: string
}

/**
 * Check if the Cline CLI tool is installed on the system
 * @returns true if CLI is installed, false otherwise
 */
export async function isClineCliInstalled(): Promise<boolean> {
	return checkCliInstalled("cline", "cline")
}

// CARETI MODIFICATION: Careti CLI detection (Phase D-2)
export async function isCaretCliInstalled(): Promise<boolean> {
	return checkCliInstalled("careti", "careti")
}

/**
 * Detect if the current Cline instance is running as a CLI subagent.
 * CLI subagents are identified by specific parameter patterns set by the transformClineCommand function.
 *     TODO - For now we are relying on the maxConsecutiveMistakes value, which will only ever be "3"
 *     unless users pass in "-s max_consecutive_mistakes=6" via Cline CLI. Would like better detection.
 * @param params The current task parameters to analyze
 * @returns true if this appears to be a CLI subagent context
 */
export function isCliSubagentContext(params: CliSubagentDetectionParams): boolean {
	const hasYoloMode = params.yoloModeToggled === true
	const hasHighMistakeLimit = params.maxConsecutiveMistakes === 6

	return hasYoloMode && hasHighMistakeLimit
}
