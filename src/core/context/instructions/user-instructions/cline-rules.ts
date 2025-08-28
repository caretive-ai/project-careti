import { getRuleFilesTotalContent, synchronizeRuleToggles } from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { ensureRulesDirectoryExists, GlobalFileNames } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger" // CARET MODIFICATION: Add Logger for debugging

export const getGlobalClineRules = async (globalClineRulesFilePath: string, toggles: ClineRulesToggles) => {
	if (await fileExistsAtPath(globalClineRulesFilePath)) {
		if (await isDirectory(globalClineRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(globalClineRulesFilePath)
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, globalClineRulesFilePath, toggles)
				if (rulesFilesTotalContent) {
					const clineRulesFileInstructions = formatResponse.clineRulesGlobalDirectoryInstructions(
						globalClineRulesFilePath,
						rulesFilesTotalContent,
					)
					return clineRulesFileInstructions
				}
			} catch {
				console.error(`Failed to read .clinerules directory at ${globalClineRulesFilePath}`)
			}
		} else {
			console.error(`${globalClineRulesFilePath} is not a directory`)
			return undefined
		}
	}

	return undefined
}

export const getLocalClineRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const clineRulesFilePath = path.resolve(cwd, GlobalFileNames.clineRules)

	let clineRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(clineRulesFilePath)) {
		if (await isDirectory(clineRulesFilePath)) {
			try {
				const rulesFilePaths = await readDirectory(clineRulesFilePath, [[".clinerules", "workflows"]])

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					clineRulesFileInstructions = formatResponse.clineRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .clinerules directory at ${clineRulesFilePath}`)
			}
		} else {
			try {
				if (clineRulesFilePath in toggles && toggles[clineRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(clineRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						clineRulesFileInstructions = formatResponse.clineRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .clinerules file at ${clineRulesFilePath}`)
			}
		}
	}

	return clineRulesFileInstructions
}

export async function refreshClineRulesToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	globalToggles: ClineRulesToggles
	localToggles: ClineRulesToggles
}> {
	// Global toggles
	const globalClineRulesToggles = controller.cacheService.getGlobalStateKey("globalClineRulesToggles")
	const globalClineRulesFilePath = await ensureRulesDirectoryExists()
	Logger.debug(`[CLINE] Global rules path: ${globalClineRulesFilePath}`)
	Logger.debug(`[CLINE] Current global toggles: ${JSON.stringify(globalClineRulesToggles)}`)
	const updatedGlobalToggles = await synchronizeRuleToggles(globalClineRulesFilePath, globalClineRulesToggles)
	Logger.debug(`[CLINE] Updated global toggles: ${JSON.stringify(updatedGlobalToggles)}`)
	controller.cacheService.setGlobalState("globalClineRulesToggles", updatedGlobalToggles)

	// Local toggles
	const localClineRulesToggles = controller.cacheService.getWorkspaceStateKey("localClineRulesToggles")
	const localClineRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.clineRules)
	Logger.debug(`[CLINE] Local rules path: ${localClineRulesFilePath}`)
	Logger.debug(`[CLINE] Current local toggles: ${JSON.stringify(localClineRulesToggles)}`)
	const updatedLocalToggles = await synchronizeRuleToggles(localClineRulesFilePath, localClineRulesToggles, "", [
		[".clinerules", "workflows"],
	])
	Logger.debug(`[CLINE] Updated local toggles: ${JSON.stringify(updatedLocalToggles)}`)
	controller.cacheService.setWorkspaceState("localClineRulesToggles", updatedLocalToggles)

	Logger.debug(`[CLINE] FINAL - returning global: ${JSON.stringify(updatedGlobalToggles)}`)
	Logger.debug(`[CLINE] FINAL - returning local: ${JSON.stringify(updatedLocalToggles)}`)
	return {
		globalToggles: updatedGlobalToggles,
		localToggles: updatedLocalToggles,
	}
}
