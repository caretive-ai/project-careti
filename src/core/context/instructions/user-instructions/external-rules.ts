import { getRuleFilesTotalContent, synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { GlobalFileNames } from "@core/storage/disk"
import { listFiles } from "@services/glob/list-files"
import { ClineRulesToggles } from "@shared/cline-rules"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger" // CARET MODIFICATION: Use Logger for debugging

export type RulePrioritySource = "caret" | null

const cloneToggles = (toggles?: ClineRulesToggles | undefined): ClineRulesToggles => ({
	...(toggles || {}),
})

/**
 * Refreshes the toggles for caret rules and AGENTS.md.
 * CARET MODIFICATION: Only .agents/context + AGENTS.md are used for system prompt instructions.
 */
export async function refreshExternalRulesToggles(
	controller: Controller,
	workingDirectory: string,
	options?: {
		caretLocalToggles?: ClineRulesToggles
	},
): Promise<{
	caretLocalToggles: ClineRulesToggles
	agentsLocalToggles: ClineRulesToggles
	activeSource: RulePrioritySource
}> {
	const localCaretRulesToggles = cloneToggles(
		options?.caretLocalToggles ?? (controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles" as any) as any),
	)
	const localAgentsRulesToggles = cloneToggles(
		controller.stateManager.getWorkspaceStateKey("localAgentsRulesToggles" as any) as any,
	)

	const localCaretRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.caretRules)
	Logger.debug(`[CARET] Rules path: ${localCaretRulesFilePath}`)

	const updatedLocalCaretToggles = await synchronizeRuleToggles(localCaretRulesFilePath, localCaretRulesToggles)
	controller.stateManager.setWorkspaceState("localCaretRulesToggles" as any, updatedLocalCaretToggles as any)

	const localAgentsRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.agentsRulesFile)
	const updatedLocalAgentsToggles = await synchronizeRuleToggles(localAgentsRulesFilePath, localAgentsRulesToggles)
	controller.stateManager.setWorkspaceState("localAgentsRulesToggles", updatedLocalAgentsToggles)

	const caretHasFiles = Object.keys(updatedLocalCaretToggles).length > 0
	Logger.info(`[refreshExternalRulesToggles] Rule source check:`)
	Logger.info(
		`[refreshExternalRulesToggles] - .agents/context: ${
			caretHasFiles ? `YES (${Object.keys(updatedLocalCaretToggles).length} files)` : "NO"
		}`,
	)

	const activeSource: RulePrioritySource = caretHasFiles ? "caret" : null
	if (!caretHasFiles) {
		Logger.warn(`[refreshExternalRulesToggles] ⚠️ No .agents/context found`)
	}

	return {
		caretLocalToggles: updatedLocalCaretToggles,
		agentsLocalToggles: updatedLocalAgentsToggles,
		activeSource,
	}
}

/**
 * Gather formatted caret rules
 */
export const getLocalCaretRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const caretRulesFilePath = path.resolve(cwd, GlobalFileNames.caretRules)

	let caretRulesFileInstructions: string | undefined

	Logger.info(`[getLocalCaretRules] Starting to load .agents/context from: ${caretRulesFilePath}`)
	Logger.info(`[getLocalCaretRules] Toggles: ${JSON.stringify(toggles, null, 2)}`)

	if (await fileExistsAtPath(caretRulesFilePath)) {
		if (await isDirectory(caretRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(caretRulesFilePath)

				Logger.info(`[getLocalCaretRules] Found ${rulesFilePaths.length} rule files: ${JSON.stringify(rulesFilePaths)}`)

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					Logger.info(
						`[getLocalCaretRules] Successfully loaded .agents/context content (${rulesFilesTotalContent.length} chars)`,
					)
					caretRulesFileInstructions = formatResponse.caretRulesLocalDirectoryInstructions?.(cwd, rulesFilesTotalContent)
				} else {
				Logger.warn(`[getLocalCaretRules] No content loaded from .agents/context (all files disabled or empty)`)
				}
			} catch (error) {
				Logger.error(`[getLocalCaretRules] Failed to read .agents/context directory at ${caretRulesFilePath}: ${error}`)
			}
		} else {
			Logger.error(`[getLocalCaretRules] .agents/context path is not a directory: ${caretRulesFilePath}`)
		}
	} else {
		Logger.info(`[getLocalCaretRules] .agents/context does not exist at ${caretRulesFilePath}`)
	}

	Logger.info(
		`[getLocalCaretRules] Returning instructions: ${caretRulesFileInstructions ? "YES (" + caretRulesFileInstructions.substring(0, 100) + "...)" : "NO"}`,
	)
	return caretRulesFileInstructions
}

/**
 * Helper function to find all AGENTS.md files recursively (case-insensitive)
 * Only searches if a top-level AGENTS.md file exists
 */
async function findAgentsMdFiles(cwd: string): Promise<string[]> {
	try {
		const topLevelAgentsPath = path.resolve(cwd, GlobalFileNames.agentsRulesFile)
		const topLevelExists = await fileExistsAtPath(topLevelAgentsPath)

		if (!topLevelExists) {
			return []
		}

		const [allFiles] = await listFiles(cwd, true, 500)
		return allFiles.filter((filePath) => {
			const basename = path.basename(filePath).toLowerCase()
			return basename === GlobalFileNames.agentsRulesFile.toLowerCase()
		})
	} catch (error) {
		console.error(`Failed to find AGENTS.md files in ${cwd}:`, error)
		return []
	}
}

/**
 * Gather formatted AGENTS.md rules - searches recursively and combines all AGENTS.md files
 */
export const getLocalAgentsRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const agentsRulesFilePath = path.resolve(cwd, GlobalFileNames.agentsRulesFile)

	if (agentsRulesFilePath in toggles && toggles[agentsRulesFilePath] === false) {
		return undefined
	}

	try {
		const agentsMdFiles = await findAgentsMdFiles(cwd)

		if (agentsMdFiles.length === 0) {
			return undefined
		}

		const combinedContent = await Promise.all(
			agentsMdFiles.map(async (filePath) => {
				try {
					const fullPath = path.resolve(cwd, filePath)
					const content = (await fs.readFile(fullPath, "utf8")).trim()
					if (content) {
						const relativePath = path.relative(cwd, fullPath)
						return `## ${relativePath}\n\n${content}`
					}
					return null
				} catch (error) {
					console.error(`Failed to read AGENTS.md file at ${filePath}:`, error)
					return null
				}
			}),
		).then((contents) => contents.filter(Boolean).join("\n\n"))

		if (combinedContent) {
			return formatResponse.agentsRulesLocalFileInstructions(cwd, combinedContent)
		}
	} catch (error) {
		console.error("Failed to read AGENTS.md files:", error)
	}

	return undefined
}
