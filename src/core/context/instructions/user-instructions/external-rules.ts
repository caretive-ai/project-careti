import {
	combineRuleToggles,
	getRuleFilesTotalContent,
	readDirectoryRecursive,
	synchronizeRuleToggles,
} from "@core/context/instructions/user-instructions/rule-helpers"
import { formatResponse } from "@core/prompts/responses"
import { GlobalFileNames } from "@core/storage/disk"
import { ClineRulesToggles } from "@shared/cline-rules"
import { fileExistsAtPath, isDirectory, readDirectory } from "@utils/fs"
import fs from "fs/promises"
import path from "path"
import { Controller } from "@/core/controller"
import { Logger } from "@/services/logging/Logger" // CARET MODIFICATION: Use Logger for debugging

/**
 * CARET MODIFICATION: Helper function to disable all toggles while preserving file paths
 * Used for rule priority system implementation
 */
function _disableAllToggles(toggles: ClineRulesToggles): ClineRulesToggles {
	const disabledToggles: ClineRulesToggles = {}
	for (const filePath in toggles) {
		disabledToggles[filePath] = false
	}
	return disabledToggles
}

/**
 * Refreshes the toggles for caret, windsurf and cursor rules
 * CARET MODIFICATION: Added caretrules support with priority system
 */
export async function refreshExternalRulesToggles(
	controller: Controller,
	workingDirectory: string,
): Promise<{
	caretLocalToggles: ClineRulesToggles
	windsurfLocalToggles: ClineRulesToggles
	cursorLocalToggles: ClineRulesToggles
}> {
	// CARET MODIFICATION: Implement rule priority system (.caretrules > .clinerules > .cursorrules > .windsurfrules)

	// Step 1: Get current toggles for all rule types
	const localCaretRulesToggles = controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles")
	const localWindsurfRulesToggles = controller.stateManager.getWorkspaceStateKey("localWindsurfRulesToggles")
	const localCursorRulesToggles = controller.stateManager.getWorkspaceStateKey("localCursorRulesToggles")

	// Step 2: Synchronize toggles normally (this handles file discovery and cleanup)
	// CARET MODIFICATION: .caretrules is a directory, not a file (like .clinerules)
	const localCaretRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.caretRules)
	Logger.debug(`[CARET] Rules path: ${localCaretRulesFilePath}`)
	Logger.debug(`[CARET] Current toggles: ${JSON.stringify(localCaretRulesToggles)}`)
	const updatedLocalCaretToggles = await synchronizeRuleToggles(localCaretRulesFilePath, localCaretRulesToggles, "", [
		[".caretrules", "workflows"],
	])
	Logger.debug(`[CARET] Updated toggles: ${JSON.stringify(updatedLocalCaretToggles)}`)

	const localWindsurfRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.windsurfRules)
	Logger.debug(`[WINDSURF] Rules path: ${localWindsurfRulesFilePath}`)
	Logger.debug(`[WINDSURF] Current toggles: ${JSON.stringify(localWindsurfRulesToggles)}`)
	const updatedLocalWindsurfToggles = await synchronizeRuleToggles(localWindsurfRulesFilePath, localWindsurfRulesToggles)
	Logger.debug(`[WINDSURF] Updated toggles: ${JSON.stringify(updatedLocalWindsurfToggles)}`)

	// cursor has two valid locations for rules files, so we need to check both and combine
	let localCursorRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesDir)
	Logger.debug(`[CURSOR] Rules path (dir): ${localCursorRulesFilePath}`)
	Logger.debug(`[CURSOR] Current toggles: ${JSON.stringify(localCursorRulesToggles)}`)
	const updatedLocalCursorToggles1 = await synchronizeRuleToggles(localCursorRulesFilePath, localCursorRulesToggles, ".mdc")

	localCursorRulesFilePath = path.resolve(workingDirectory, GlobalFileNames.cursorRulesFile)
	Logger.debug(`[CURSOR] Rules path (file): ${localCursorRulesFilePath}`)
	const updatedLocalCursorToggles2 = await synchronizeRuleToggles(localCursorRulesFilePath, localCursorRulesToggles)

	const updatedLocalCursorToggles = combineRuleToggles(updatedLocalCursorToggles1, updatedLocalCursorToggles2)
	Logger.debug(`[CURSOR] Combined toggles: ${JSON.stringify(updatedLocalCursorToggles)}`)

	// Step 3: Apply priority logic ONLY for newly discovered files, preserve user toggle states
	const caretHasFiles = Object.keys(updatedLocalCaretToggles).length > 0
	const windsurfHasFiles = Object.keys(updatedLocalWindsurfToggles).length > 0
	const _cursorHasFiles = Object.keys(updatedLocalCursorToggles).length > 0

	// CARET MODIFICATION: Only apply priority for new files, not existing user toggles
	// Check if we have NEW files (not just existing toggles)
	const currentCaretToggles = controller.stateManager.getWorkspaceStateKey("localCaretRulesToggles")
	const currentWindsurfToggles = controller.stateManager.getWorkspaceStateKey("localWindsurfRulesToggles")
	const currentCursorToggles = controller.stateManager.getWorkspaceStateKey("localCursorRulesToggles")

	// Find truly new files (exist in updated but not in current)
	// CARET MODIFICATION: Handle undefined toggles safely
	const newCaretFiles = Object.keys(updatedLocalCaretToggles).filter((path) => !(path in (currentCaretToggles || {})))
	const newWindsurfFiles = Object.keys(updatedLocalWindsurfToggles).filter((path) => !(path in (currentWindsurfToggles || {})))
	const newCursorFiles = Object.keys(updatedLocalCursorToggles).filter((path) => !(path in (currentCursorToggles || {})))

	// Apply priority only if new caret files are discovered
	if (newCaretFiles.length > 0 && caretHasFiles) {
		// Only disable newly discovered files from lower priority rules
		for (const path of newWindsurfFiles) {
			updatedLocalWindsurfToggles[path] = false
		}
		for (const path of newCursorFiles) {
			updatedLocalCursorToggles[path] = false
		}
	} else if (newWindsurfFiles.length > 0 && windsurfHasFiles && newCaretFiles.length === 0) {
		// Only disable newly discovered cursor files if no new caret files
		for (const path of newCursorFiles) {
			updatedLocalCursorToggles[path] = false
		}
	}
	// Preserve all existing user toggle states

	// Step 4: Save updated toggles
	controller.stateManager.setWorkspaceState("localCaretRulesToggles", updatedLocalCaretToggles)
	controller.stateManager.setWorkspaceState("localWindsurfRulesToggles", updatedLocalWindsurfToggles)
	controller.stateManager.setWorkspaceState("localCursorRulesToggles", updatedLocalCursorToggles)

	Logger.debug(`[CARET] FINAL - returning toggles: ${JSON.stringify(updatedLocalCaretToggles)}`)
	Logger.debug(`[WINDSURF] FINAL - returning toggles: ${JSON.stringify(updatedLocalWindsurfToggles)}`)
	Logger.debug(`[CURSOR] FINAL - returning toggles: ${JSON.stringify(updatedLocalCursorToggles)}`)

	return {
		caretLocalToggles: updatedLocalCaretToggles,
		windsurfLocalToggles: updatedLocalWindsurfToggles,
		cursorLocalToggles: updatedLocalCursorToggles,
	}
}

/**
 * Gather formatted windsurf rules
 */
export const getLocalWindsurfRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const windsurfRulesFilePath = path.resolve(cwd, GlobalFileNames.windsurfRules)

	let windsurfRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(windsurfRulesFilePath)) {
		if (!(await isDirectory(windsurfRulesFilePath))) {
			try {
				if (windsurfRulesFilePath in toggles && toggles[windsurfRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(windsurfRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						windsurfRulesFileInstructions = formatResponse.windsurfRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .windsurfrules file at ${windsurfRulesFilePath}`)
			}
		}
	}

	return windsurfRulesFileInstructions
}

/**
 * Gather formatted cursor rules, which can come from two sources
 */
export const getLocalCursorRules = async (cwd: string, toggles: ClineRulesToggles) => {
	// we first check for the .cursorrules file
	const cursorRulesFilePath = path.resolve(cwd, GlobalFileNames.cursorRulesFile)
	let cursorRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(cursorRulesFilePath)) {
		if (!(await isDirectory(cursorRulesFilePath))) {
			try {
				if (cursorRulesFilePath in toggles && toggles[cursorRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(cursorRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						cursorRulesFileInstructions = formatResponse.cursorRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .cursorrules file at ${cursorRulesFilePath}`)
			}
		}
	}

	// we then check for the .cursor/rules dir
	const cursorRulesDirPath = path.resolve(cwd, GlobalFileNames.cursorRulesDir)
	let cursorRulesDirInstructions: string | undefined

	if (await fileExistsAtPath(cursorRulesDirPath)) {
		if (await isDirectory(cursorRulesDirPath)) {
			try {
				const rulesFilePaths = await readDirectoryRecursive(cursorRulesDirPath, ".mdc")
				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					cursorRulesDirInstructions = formatResponse.cursorRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .cursor/rules directory at ${cursorRulesDirPath}`)
			}
		}
	}

	return [cursorRulesFileInstructions, cursorRulesDirInstructions]
}

/**
 * Gather formatted caret rules
 * CARET MODIFICATION: Added .caretrules support
 */
export const getLocalCaretRules = async (cwd: string, toggles: ClineRulesToggles) => {
	const caretRulesFilePath = path.resolve(cwd, GlobalFileNames.caretRules)

	let caretRulesFileInstructions: string | undefined

	if (await fileExistsAtPath(caretRulesFilePath)) {
		if (await isDirectory(caretRulesFilePath)) {
			// CARET MODIFICATION: Handle .caretrules as directory (like .clinerules)
			try {
				const rulesFilePaths = await readDirectory(caretRulesFilePath, [[".caretrules", "workflows"]])

				const rulesFilesTotalContent = await getRuleFilesTotalContent(rulesFilePaths, cwd, toggles)
				if (rulesFilesTotalContent) {
					caretRulesFileInstructions = formatResponse.caretRulesLocalDirectoryInstructions(cwd, rulesFilesTotalContent)
				}
			} catch {
				console.error(`Failed to read .caretrules directory at ${caretRulesFilePath}`)
			}
		} else {
			// Handle .caretrules as a file (fallback)
			try {
				if (caretRulesFilePath in toggles && toggles[caretRulesFilePath] !== false) {
					const ruleFileContent = (await fs.readFile(caretRulesFilePath, "utf8")).trim()
					if (ruleFileContent) {
						caretRulesFileInstructions = formatResponse.caretRulesLocalFileInstructions(cwd, ruleFileContent)
					}
				}
			} catch {
				console.error(`Failed to read .caretrules file at ${caretRulesFilePath}`)
			}
		}
	}

	return caretRulesFileInstructions
}
